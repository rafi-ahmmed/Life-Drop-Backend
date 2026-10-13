import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { patientServices } from "./patient.service.js";

const updatePatient = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req?.currentUser?.userId;

	const result = await patientServices.updatePatient(payload, userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Patient info updated successfully",
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

export const patientControllers = { updatePatient };
