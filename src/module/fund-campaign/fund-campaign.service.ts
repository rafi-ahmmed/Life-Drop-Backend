import httpStatus from "http-status";
import { FundCampaignStatus } from "../../../prisma/generated/prisma/enums.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import { uploadCloudinary } from "../../utils/cloudinaryUtils.js";
import type {
	CreateFundCampaignPayload,
	ReviewFundCampaignPayload,
} from "./fund-campaign.validation.js";

const createCampaign = async (
	userId: string,
	payload: CreateFundCampaignPayload,
	medicalDocuments: Express.Multer.File[],
) => {
	const documentsUploadResult = await Promise.all(
		medicalDocuments.map(async (file) => {
			const cloudinaryResult = await uploadCloudinary(file.buffer);
			return {
				fileUrl: cloudinaryResult.secure_url,
				publicId: cloudinaryResult.public_id,
			};
		}),
	);

	const result = await prisma.fundCampaign.create({
		data: {
			userId: userId,
			patientName: payload.patientName,
			hospitalName: payload.hospitalName,
			contactNumber: payload.contactNumber,
			title: payload.title,
			description: payload.description,
			targetAmount: payload.targetAmount,
			deadline: new Date(payload.deadline),
			medicalDocuments: documentsUploadResult,
			reviewedBy: null,
			reviewedAt: null,
			rejectedReason: null,
		},
	});

	return result;
};

const getAllCampaignsByAdmin = async () => {
	const result = await prisma.fundCampaign.findMany({
		orderBy: {
			createdAt: "desc",
		},
		include: {
			Payments: true,
		},
	});

	return result;
};

const getCampaignByIdForAdmin = async (campaignId: string) => {
	const result = await prisma.fundCampaign.findUnique({
		where: {
			id: campaignId,
		},
	});

	return result;
};

const reviewCampaignByAdmin = async (
	userId: string,
	campaignId: string,
	payload: ReviewFundCampaignPayload,
) => {
	const { status, rejectedReason } = payload;

	const campaign = await prisma.fundCampaign.findUnique({
		where: {
			id: campaignId,
		},
	});

	if (!campaign) {
		throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");
	}

	if (campaign.status === status) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Campaign is already in ${status} state`,
		);
	}

	if (
		campaign.status !== FundCampaignStatus.PENDING &&
		campaign.status !== FundCampaignStatus.REJECTED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Only pending or rejected campaigns can be reviewed",
		);
	}

	const updatedCampaign = await prisma.fundCampaign.update({
		where: {
			id: campaignId,
		},
		data: {
			status:
				status === FundCampaignStatus.APPROVED
					? FundCampaignStatus.ACTIVE
					: status,
			reviewedBy: userId,
			reviewedAt: new Date(),
			rejectedReason: rejectedReason ?? null,
		},
	});

	return updatedCampaign;
};

const getCampaignById = async (userId: string, campaignId: string) => {
	const result = await prisma.fundCampaign.findUnique({
		where: {
			id: campaignId,
			userId: userId,
		},
	});

	if (!result) {
		throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");
	}

	return result;
};

const getMyCampaigns = async (userId: string) => {
	const result = await prisma.fundCampaign.findMany({
		where: {
			userId: userId,
		},
	});

	if (!result || result.length === 0) {
		throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");
	}

	return result;
};

// const getAllDonorsByCampaign = async (campaignId: string) => {}

export const fundCampaignServices = {
	createCampaign,
	getAllCampaignsByAdmin,
	getCampaignByIdForAdmin,
	reviewCampaignByAdmin,
	getCampaignById,
	getMyCampaigns,
};
