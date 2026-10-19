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
};
