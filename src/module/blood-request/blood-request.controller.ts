import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { bloodRequestServices } from "./blood-request.service.js";

const createBloodRequest = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.currentUser?.userId;

	const result = await bloodRequestServices.createBloodRequest(
		payload,
		userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Blood request created successfully.",
		data: result,
	});
});

const getAllBloodRequests = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;

	const result = await bloodRequestServices.getAllBloodRequests(
		userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your Blood requests retrieved successfully.",
		data: result,
	});
});

const getBloodRequestById = catchAsync(async (req: Request, res: Response) => {
	const requestId = req.params.id;

	const result = await bloodRequestServices.getBloodRequestById(
		requestId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Request retrieved successfully.",
		data: result,
	});
});

// * Admin Only
const getAllBloodReqByAdmin = catchAsync(
	async (req: Request, res: Response) => {
		const result = await bloodRequestServices.getAllBloodRequestsByAdmin();

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: " All blood requests retrieved successfully.",
			data: result,
		});
	},
);



// const registerPatient = catchAsync(async (req: Request, res: Response) => {
// 	const payload = req.body;

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Verification otp send on ur email.",
// 		data: null,
// 	});
// });

export const bloodRequestControllers = {
	createBloodRequest,
	getAllBloodRequests,
	getBloodRequestById,
	updateBloodRequestStatus,
	getAllBloodReqByAdmin,
};
