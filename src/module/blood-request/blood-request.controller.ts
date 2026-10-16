import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import type { MatchingOptions } from "./blood-request.interface.js";
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

const updateBloodRequestStatus = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;
		const requestId = req.params.id;
		const reviewerId = req.currentUser?.userId;

		const result = await bloodRequestServices.updateBloodRequestStatus(
			payload,
			reviewerId as string,
			requestId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: `Status of blood request updated ${payload.status}`,
			data: result,
		});
	},
);

const myRequests = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;

	const result = await bloodRequestServices.myRequests(userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your requests retrieved successfully.",
		data: result,
	});
});

const matchDonors = catchAsync(async (req: Request, res: Response) => {
	const requestId = req.params.id;
	const userId = req.currentUser?.userId;
	const matchingOptions = req.query;

	const result = await bloodRequestServices.matchDonors(
		requestId as string,
		userId as string,
		matchingOptions as MatchingOptions,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Verification otp send on ur email.",
		data: {
			matchingDonors: result.matchingDonors,
			unsentDonorIds: result.stringDonorIds,
		},
		meta: {
			total: result.total,
		},
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

export const bloodRequestControllers = {
	createBloodRequest,
	getAllBloodRequests,
	getBloodRequestById,
	updateBloodRequestStatus,
	getAllBloodReqByAdmin,
	myRequests,
	matchDonors,
};
