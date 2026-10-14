import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { donorServices } from "./donor.service.js";

const updateDonor = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.currentUser?.userId;

	const result = await donorServices.updateDonor(payload, userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Donor profile updated successfully.",
		data: result,
	});
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.currentUser?.userId;

	const result = await donorServices.updateAvailability(
		payload,
		userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Donor availability updated successfully.",
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

export const donorControllers = {
	updateDonor,
	updateAvailability,
};
