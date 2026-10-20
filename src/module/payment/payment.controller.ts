import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { paymentServices } from "./payment.service.js";

const createPayment = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.currentUser?.userId as string;
	const email = req.currentUser?.email as string;

	const result = await paymentServices.createPayment(userId, email, payload);

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

	res.redirect(redirectUrl);
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
	createPayment,
	bkashCallback,
};
