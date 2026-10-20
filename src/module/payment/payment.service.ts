import crypto from "crypto";
import e from "express";
import httpStatus from "http-status";
import { el } from "zod/locales";
import { PaymentStatus } from "../../../prisma/generated/prisma/enums.js";
import config from "../../config/index.js";
import AppError from "../../errors/appError.js";
import getBkashIdToken from "../../lib/bkash.js";
import { prisma } from "../../lib/prisma.js";
import type { CreatePaymentPayload } from "./payment.validation.js";

const createPayment = async (
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

	const createPayment = await prisma.payment.create({
		data: {
			amount: Number(amount),
			bkashPaymentId: bkashPaymentResult.paymentId,
			userId: userId,
			campaignId: campaignId,
			gatewayResponse: bkashPaymentResult,
		},
	});

	console.log("Initial UNPAID payment created", createPayment);

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

	console.log("Execute payment result", executePaymentResult);

	const transactionResult = await prisma.$transaction(async (tx) => {
		if (status === "success") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					bkashPaymentId: paymentId,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.PAID) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/dashboard/fund-campaigns?status=success`,
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
				redirectUrl: `${config.frontend_url}/dashboard/fund-campaigns?status=success`,
			};
		} else if (status === "failure") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					bkashPaymentId: paymentId,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.FAILED) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=failure`,
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
				redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=failure`,
			};
		} else if (status === "cancel") {
			const paymentResult = await tx.payment.findUnique({
				where: {
					bkashPaymentId: paymentId,
				},
			});

			if (!paymentResult) {
				throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
			}

			if (paymentResult.status === PaymentStatus.CANCELLED) {
				return {
					paymentResult: paymentResult,
					redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=cancel`,
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
				redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=cancel`,
			};
		}
	});

	return transactionResult;
};

// const getAllDonorsByCampaign = async (userId: string) => {};

export const paymentServices = {
	createPayment,
	bkashCallback,
};
