import type { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errors/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { fundCampaignServices } from "./fund-campaign.service.js";
import { fundCampaignValidation } from "./fund-campaign.validation.js";

const createCampaign = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;
	const payload = req.body;
	const medicalFiles = req.files as {
		[fieldName: string]: Express.Multer.File[];
	};

	const zodValidationResult =
		fundCampaignValidation.createFundCampaignZodSchema.safeParse(payload);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult?.error?.issues?.[0]?.message ?? "Invalid request",
		);
	}

	const prescription = medicalFiles["prescription"]
		? medicalFiles["prescription"]
		: null;
	const medicalReport = medicalFiles["medicalReport"]
		? medicalFiles["medicalReport"]
		: null;

	if (!prescription) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Prescription document is required",
		);
	}

	// Medical report is required
	if (!medicalReport) {
		throw new AppError(httpStatus.BAD_REQUEST, "Medical report is required");
	}

	const medicalDocuments = [...(prescription ?? []), ...(medicalReport ?? [])];

	const result = await fundCampaignServices.createCampaign(
		userId as string,
		payload,
		medicalDocuments,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message:
			"Campaign created successfully. We will notify you soon. Wait for approval.",
		data: result,
	});
});

const getAllCampaignsByAdmin = catchAsync(
	async (req: Request, res: Response) => {
		const result = await fundCampaignServices.getAllCampaignsByAdmin();

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "All campaigns retrieved successfully.",
			data: result,
		});
	},
);

const getCampaignByIdForAdmin = catchAsync(
	async (req: Request, res: Response) => {
		const campaignId = req.params.id;

		const result = await fundCampaignServices.getCampaignByIdForAdmin(
			campaignId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Campaign retrieved successfully.",
			data: result,
		});
	},
);

const reviewCampaignByAdmin = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;
		const userId = req.currentUser?.userId;
		const campaignId = req.params.id;

		const result = await fundCampaignServices.reviewCampaignByAdmin(
			userId as string,
			campaignId as string,
			payload,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: `Campaign ${payload.status} successfully`,
			data: result,
		});
	},
);

const getCampaignById = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;
	const campaignId = req.params.id;

	const result = await fundCampaignServices.getCampaignById(
		userId as string,
		campaignId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Campaign retrieved successfully.",
		data: result,
	});
});

const getMyCampaigns = catchAsync(async (req: Request, res: Response) => {
	const userId = req.currentUser?.userId;

	const result = await fundCampaignServices.getMyCampaigns(userId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your campaigns retrieved successfully.",
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

export const fundCampaignControllers = {
	createCampaign,
	getAllCampaignsByAdmin,
	getCampaignByIdForAdmin,
	reviewCampaignByAdmin,
	getCampaignById,
	getMyCampaigns,
};
