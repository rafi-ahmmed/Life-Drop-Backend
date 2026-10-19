import { z } from "zod";

const createFundCampaignZodSchema = z.object({
	patientName: z
		.string("Patient name is required")
		.trim()
		.min(1, "Patient name is required"),

	hospitalName: z.string().trim().optional(),

	contactNumber: z
		.string("Contact number is required")
		.trim()
		.min(1, "Contact number is required"),

	title: z
		.string("Title is required")
		.trim()
		.min(5, "Title must be at least 5 characters")
		.max(150, "Title cannot exceed 150 characters"),

	description: z
		.string("Description is required")
		.trim()
		.min(20, "Description must be at least 20 characters"),

	targetAmount: z.coerce
		.number("Target amount is required")
		.positive("Target amount must be greater than 0"),

	deadline: z.coerce
		.date("Deadline is required")
		.refine((date) => date > new Date(), "Deadline must be in the future"),
});

const updateFundCampaignZodSchema = createFundCampaignZodSchema.partial();

export type CreateFundCampaignPayload = z.infer<
	typeof createFundCampaignZodSchema
>;

export type UpdateFundCampaignPayload = z.infer<
	typeof updateFundCampaignZodSchema
>;

export const fundCampaignValidation = {
	createFundCampaignZodSchema,
	updateFundCampaignZodSchema,
};
