import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { adminServices } from "./admin.service.js";

const allUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await adminServices.getAllUsers();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All users retrieved successfully",
		data: result,
	});
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.params.id as string;

	const result = await adminServices.updateUser(userId, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User status updated successfully",
		data: result,
	});
});

const adminStats = catchAsync(async (req: Request, res: Response) => {
	const result = await adminServices.getAdminStats();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin stats retrieved successfully",
		data: result,
	});
});

// const admin = catchAsync(async (req: Request, res: Response) => {
// 	const payload = req.body;

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Verification otp send on ur email.",
// 		data: null,
// 	});
// });

export const adminControllers = { allUsers, updateUserStatus, adminStats };
