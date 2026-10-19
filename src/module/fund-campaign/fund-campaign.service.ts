import { prisma } from "../../lib/prisma.js";
import { uploadCloudinary } from "../../utils/cloudinaryUtils.js";
import type { CreateFundCampaignPayload } from "./fund-campaign.validation.js";

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
// const getAllBloodRequests = async (userId: string) => {};

export const fundCampaignServices = {
	createCampaign,
};
