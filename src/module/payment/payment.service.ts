import crypto from "crypto";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import { ofetch } from "ofetch";
import type { Prisma } from "../../../prisma/generated/prisma/browser.js";
import {
	PaymentMethod,
	PaymentStatus,
} from "../../../prisma/generated/prisma/enums.js";
import config from "../../config/index.js";
import AppError from "../../errors/appError.js";
import getBkashIdToken from "../../lib/bkash.js";
import { prisma } from "../../lib/prisma.js";
import type { IRequestUser } from "../../middlewares/checkAuth.js";
import { validatePayment } from "./payment.utils.js";
import type { CreatePaymentPayload } from "./payment.validation.js";

const createBkashPayment = async (
	userId: string,
	email: string,
	payload: CreatePaymentPayload,
) => {
	const { campaignId, amount } = payload;

	const campaign = await prisma.fundCampaign.findUnique({
		where: {
			id: campaignId,
		},
	});

	if (!campaign) {
		throw new AppError(httpStatus.BAD_REQUEST, "Campaign not found");
	}

	if (campaign.status !== "ACTIVE") {
		throw new AppError(httpStatus.BAD_REQUEST, "Campaign is not active");
	}

	const remainingAmount =
		Number(campaign.targetAmount) - Number(campaign.collectedAmount ?? 0);

	if (amount > remainingAmount) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Donation amount cannot exceed the remaining target of ${remainingAmount} TK`,
		);
	}

	const bkashIdToken = await getBkashIdToken();

	if (!bkashIdToken) {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Bkash Id token not found",
		);
	}

	const merchantInvoiceNumber = `INV-${crypto.randomBytes(10).toString("hex")}`;

	// Create payment
	const bkashCreatePaymentResponse = await fetch(
		`${config.bkash_sandbox_url}/payment/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: bkashIdToken,
				"X-App-Key": config.bkash_sandbox_app_key,
			},
			body: JSON.stringify({
				payerReference: email,
				callbackURL: `${config.bkash_callback_url}`,
				amount: Number(amount).toFixed(2),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: merchantInvoiceNumber,
			}),
		},
	);
	const bkashPaymentResult = await bkashCreatePaymentResponse.json();

	await prisma.payment.create({
		data: {
			amount: Number(amount),
			paymentId: bkashPaymentResult.paymentId,
			userId: userId,
			campaignId: campaignId,
			gatewayResponse: bkashPaymentResult,
		},
	});

	// console.log("Initial UNPAID payment created", createPayment);

	return { paymentUrl: bkashPaymentResult.bkashURL };
};

const bkashCallback = async (query: Record<string, any>) => {
	const paymentId = query.paymentID;
	const status = query.status;

	if (!paymentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Payment id missing");
	}
	if (!status) {
		throw new AppError(httpStatus.BAD_REQUEST, "Payment status missing");
	}

	const idToken = await getBkashIdToken();

	if (!idToken) {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Bkash id token not found",
		);
	}

	const executePayment = await fetch(
		`${config.bkash_sandbox_url}/payment/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: idToken,
				"X-App-Key": config.bkash_sandbox_app_key,
			},
			body: JSON.stringify({
				paymentId: paymentId,
			}),
		},
	);
	const executePaymentResult = await executePayment.json();

	const transactionResult = await prisma.$transaction(async (tx) => {
		if (status === "success") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					paymentId: paymentId,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.PAID) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/payment/success?status=success&paymentId=${paymentResult.id}`,
				};
			}

			const campaign = await tx.fundCampaign.findUnique({
				where: {
					id: paymentResult.campaignId,
				},
			});

			if (!campaign) {
				throw new AppError(httpStatus.NOT_FOUND, "Fund campaign not found");
			}

			const updatedPayment = await tx.payment.update({
				where: {
					id: paymentResult.id,
				},
				data: {
					status: PaymentStatus.PAID,
					paidAt: new Date(),
					gatewayResponse: executePaymentResult,
					trxID: executePaymentResult.trxId,
					cardType: "Bkash",
				},
			});

			await tx.fundCampaign.update({
				where: {
					id: campaign.id,
				},
				data: {
					collectedAmount: {
						increment: Number(paymentResult.amount),
					},
				},
			});

			return {
				paymentResult: updatedPayment,
				redirectUrl: `${config.frontend_url}/payment/success?status=success&paymentId=${paymentResult.id}`,
			};
		} else if (status === "failure") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					paymentId: paymentId,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.FAILED) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/payment/failed?status=failure`,
				};
			}

			const updatedPayment = await tx.payment.update({
				where: {
					id: paymentResult.id,
				},
				data: {
					status: PaymentStatus.FAILED,
					gatewayResponse: executePaymentResult,
				},
			});

			return {
				paymentResult: updatedPayment,
				redirectUrl: `${config.frontend_url}/payment/failed?status=failure`,
			};
		} else if (status === "cancel") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					paymentId: paymentId,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.CANCELLED) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/payment/failed?status=cancel`,
				};
			}

			const updatedPayment = await tx.payment.update({
				where: {
					id: paymentResult.id,
				},
				data: {
					status: PaymentStatus.CANCELLED,
					gatewayResponse: executePaymentResult,
				},
			});

			return {
				paymentResult: updatedPayment,
				redirectUrl: `${config.frontend_url}/payment/failed?status=cancel`,
			};
		}
	});

	return transactionResult;
};

const createSSLPyament = async (
	userData: IRequestUser,
	payload: CreatePaymentPayload,
) => {
	const { campaignId, amount } = payload;

	const campaign = await prisma.fundCampaign.findUnique({
		where: {
			id: campaignId,
		},
	});

	if (!campaign) {
		throw new AppError(httpStatus.BAD_REQUEST, "Campaign not found");
	}

	if (campaign.status !== "ACTIVE") {
		throw new AppError(httpStatus.BAD_REQUEST, "Campaign is not active");
	}

	const remainingAmount =
		Number(campaign.targetAmount) - Number(campaign.collectedAmount ?? 0);

	if (amount > remainingAmount) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Donation amount cannot exceed the remaining target of ${remainingAmount} TK`,
		);
	}

	const transactionId = `TRX${crypto.randomBytes(10).toString("hex")}`;

	const paymentData = {
		store_id: config.ssl_store_id,
		store_passwd: config.ssl_store_password,
		total_amount: Number(amount).toFixed(2),
		currency: "BDT",
		tran_id: transactionId,
		success_url: config.ssl_success_url,
		fail_url: config.ssl_fail_url,
		cancel_url: config.ssl_cancel_url,

		cus_name: userData.name || "anonymous",
		cus_email: userData.email || "anonymous",
		cus_add1: "Dhaka",
		cus_add2: "Dhaka",
		cus_city: "Dhaka",
		cus_state: "Dhaka",
		cus_postcode: "1000",
		cus_country: "Bangladesh",
		cus_phone: "01700000000",
		cus_fax: "01700000000",

		ship_name: userData.name || "anonymous",
		ship_add1: "Dhaka",
		ship_add2: "Dhaka",
		ship_city: "Dhaka",
		ship_state: "Dhaka",
		ship_postcode: "1000",
		ship_country: "Bangladesh",

		product_category: "Fund Donation",
		product_name: campaign.id,
	};

	const response = await ofetch(
		"https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: paymentData,
		},
	);

	if (response.status === "FAILED") {
		throw new AppError(httpStatus.BAD_GATEWAY, response?.failedreason);
	}

	await prisma.payment.create({
		data: {
			amount: Number(amount),
			trxID: transactionId,
			userId: userData.userId,
			campaignId: campaignId,
			method: PaymentMethod.SSLCOMMERZ,
			gatewayResponse: response,
		},
	});

	return { paymentUrl: response.redirectGatewayURL };
};

const sslSuccessCallback = async (payload: Record<string, unknown>) => {
	console.log(payload);

	const valId = payload.val_id as string;

	const result = await validatePayment(valId);

	const transactionResult = await prisma.$transaction(async (tx) => {
		if (result.status === "VALID") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					trxID: result.tran_id,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.PAID) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/payment/success?status=success&paymentId=${paymentResult.id}`,
				};
			}

			const campaign = await tx.fundCampaign.findUnique({
				where: {
					id: paymentResult.campaignId,
				},
			});

			if (!campaign) {
				throw new AppError(httpStatus.NOT_FOUND, "Fund campaign not found");
			}

			const updatedPayment = await tx.payment.update({
				where: {
					id: paymentResult.id,
				},
				data: {
					status: PaymentStatus.PAID,
					paidAt: new Date(),
					gatewayResponse: result,
					amount: Number(result.amount),
					bankTranId: result.bank_tran_id,
					cardType: result.card_type,
					paymentId: result.val_id,
				},
			});

			await tx.fundCampaign.update({
				where: {
					id: campaign.id,
				},
				data: {
					collectedAmount: {
						increment: Number(paymentResult.amount),
					},
				},
			});

			return {
				paymentResult: updatedPayment,
				redirectUrl: `${config.frontend_url}/payment/success?status=success&paymentId=${paymentResult.id}`,
			};
		}
	});

	return transactionResult;
};

const sslCancelCallback = async (payload: Record<string, unknown>) => {
	console.log(payload);

	const paymentResult = await prisma.payment.update({
		where: {
			trxID: payload.tran_id as string,
		},
		data: {
			status: PaymentStatus.CANCELLED,
			paidAt: new Date(),
			gatewayResponse: payload as Prisma.InputJsonValue,
		},
	});

	return {
		paymentResult: paymentResult,
		redirectUrl: `${config.frontend_url}/payment/failed?status=cancelled`,
	};
};

const sslFailCallback = async (payload: Record<string, unknown>) => {
	console.log(payload);

	const paymentResult = await prisma.payment.update({
		where: {
			trxID: payload.tran_id as string,
		},
		data: {
			status: PaymentStatus.FAILED,
			paidAt: new Date(),
			gatewayResponse: payload as Prisma.InputJsonValue,
		},
	});

	return {
		paymentResult: paymentResult,
		redirectUrl: `${config.frontend_url}/payment/failed?status=failed`,
	};
};

const getMyPayments = async (userId: string) => {
	const result = await prisma.payment.findMany({
		where: {
			userId: userId,
		},
		orderBy: {
			paidAt: "desc",
		},
		include: {
			campaign: {
				select: {
					title: true,
					patientName: true,
				},
			},
		},
	});

	return result;
};

// const getAllDonorsByCampaign = async (userId: string) => {};

export const paymentServices = {
	createBkashPayment,
	createSSLPyament,
	bkashCallback,
	getMyPayments,
	sslSuccessCallback,
	sslCancelCallback,
	sslFailCallback,
};

/// validate result=== {
//   status: 'VALID',
//   tran_date: '2026-11-19 19:59:52',
//   tran_id: 'TRX326d2823803c2279f0d7',
//   val_id: '261119200000MW6FgrjtMQPSJu8',
//   amount: '100.00',
//   store_amount: '97.5',
//   currency: 'BDT',
//   bank_tran_id: '261119200000Mamsv8G1wBMxUKK',
//   card_type: 'BKASH-BKash',
//   card_no: '',
//   card_issuer: 'BKash Mobile Banking',
//   card_brand: 'MOBILEBANKING',
//   card_category: 'MOBILE',
//   card_sub_brand: '',
//   card_issuer_country: 'Bangladesh',
//   card_issuer_country_code: 'BD',
//   currency_type: 'BDT',
//   currency_amount: '100.00',
//   currency_rate: '1.0000',
//   base_fair: '0.00',
//   value_a: '',
//   value_b: '',
//   value_c: '',
//   value_d: '',
//   emi_instalment: '0',
//   emi_amount: '0.00',
//   emi_description: '',
//   emi_issuer: 'BKash Mobile Banking',
//   account_details: '',
//   risk_title: 'Safe',
//   risk_level: '0',
//   discount_percentage: '0',
//   discount_amount: '0.00',
//   discount_remarks: '',
//   APIConnect: 'DONE',
//   validated_on: '2026-11-19 20:00:05',
//   gw_version: '',
//   offer_avail: 1,
//   card_ref_id: 'dc1da4f52669828139e81ef5eb0f48a5a99ea054a131e00a562887d455417dd920',
//   isTokeizeSuccess: 0,
//   campaign_code: ''
// }
