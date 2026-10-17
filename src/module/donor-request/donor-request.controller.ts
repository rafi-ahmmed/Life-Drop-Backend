import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { donorRequestServices } from "./donor-request.service.js";

const sendRequest = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const requestId = req.params.id;

	const result = await donorRequestServices.sendRequest(
		requestId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Request sent successfully. ",
		data: result,
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

export const donorRequestControllers = { sendRequest };
