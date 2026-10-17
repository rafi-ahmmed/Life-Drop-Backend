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

const updateRequest = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.currentUser?.userId;
	const donorRequestId = req.params.id;

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Verification otp send on ur email.",
		data: null,
	});
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;

	const result = await donorRequestServices.getMyRequests(userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your requests retrieved successfully.",
		data: result,
	});
});

const getRequestById = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;
	const donorRequestId = req.params.id;

	const result = await donorRequestServices.getRequestById(
		donorRequestId as string,
		userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your request retrieved successfully.",
		data: result,
	});
});

const respondToRequest = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const donorRequestId = req.params.id;
	const userId = req.currentUser?.userId;

	const result = await donorRequestServices.respondToRequest(
		donorRequestId as string,
		userId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Responded to request successfully.",
		data: result,
	});
});

const getAllDonorRequests = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;
	const requestId = req.params.requestId;

	const result = await donorRequestServices.getAllDonorRequests(
		userId as string,
		requestId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Get all donor requests for a blood request",
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

export const donorRequestControllers = {
	sendRequest,
	getMyRequests,
	getRequestById,
	respondToRequest,
	getAllDonorRequests,
};
