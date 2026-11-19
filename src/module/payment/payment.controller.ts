import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { paymentServices } from "./payment.service.js";

const createBkashPayment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.currentUser?.userId as string;
	const email = req.currentUser?.email as string;

	const result = await paymentServices.createBkashPayment(
		userId,
		email,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment created successfully",
		data: result,
	});
});

const createSSLPayment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userData = req.currentUser!;

	const result = await paymentServices.createSSLPyament(userData, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment created successfully",
		data: result,
	});
});

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
	const callbackResult = await paymentServices.bkashCallback(req.query);
	if (!callbackResult) {
		throw new Error("bKash callback did not return a result");
	}
	const { redirectUrl } = callbackResult;
	console.log("Ststus url", callbackResult);

	res.redirect(redirectUrl);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId as string;
	const result = await paymentServices.getMyPayments(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payments retrieved successfully",
		data: result,
		meta: {},
	});
});

const sslSuccessCallback = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	console.log("Success data===", payload);
	const callbackResult = await paymentServices.sslSuccessCallback(payload);

	if (!callbackResult) {
		throw new Error("SSLCOMMERZ callback did not return a result");
	}

	const { redirectUrl } = callbackResult;
	res.redirect(redirectUrl);
});

const sslCancelCallback = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const callbackResult = await paymentServices.sslCancelCallback(payload);

	if (!callbackResult) {
		throw new Error("SSLCOMMERZ callback did not return a result");
	}

	const { redirectUrl } = callbackResult;
	res.redirect(redirectUrl);
});

const sslFailCallback = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const callbackResult = await paymentServices.sslFailCallback(payload);

	if (!callbackResult) {
		throw new Error("SSLCOMMERZ callback did not return a result");
	}

	const { redirectUrl } = callbackResult;
	res.redirect(redirectUrl);
});

const sslIpnCallback = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	console.log("IPN callback===", payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Verification otp send on ur email.",
		data: null,
	});
});

// const registerPatient = catchAsync(async (req: Request, res: Response) => {
// 	const payload = req.body;

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Verification otp send on ur email.",
// 		data: null,
// 	});
// });

export const paymentControllers = {
	createBkashPayment,
	bkashCallback,
	getMyPayments,
	createSSLPayment,
	sslIpnCallback,
	sslSuccessCallback,
	sslCancelCallback,
	sslFailCallback,
};
