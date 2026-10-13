import type { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errors/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { userServices } from "./user.service.js";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
	const image = req.file;
	const userId = req?.currentUser?.userId;

	if (!image) {
		throw new AppError(httpStatus.BAD_REQUEST, "Image is not Provided");
	}
	console.log("image==", image.buffer);
	console.log("userId==", userId);

	const result = await userServices.uploadProfileImage(image.buffer, userId!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Profile image updated successfully",
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

export const userControllers = { uploadProfileImage };
