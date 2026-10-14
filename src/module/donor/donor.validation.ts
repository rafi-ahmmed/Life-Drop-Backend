import z from "zod";
import { BloodGroup } from "../../../prisma/generated/prisma/enums.js";

const updateDonorZodSchema = z.object({
	phone: z.string().trim().min(11).max(15).optional(),
	address: z
		.string()
		.trim()
		.min(5, "Address must be at least 5 characters.")
		.optional(),
	district: z
		.string()
		.trim()
		.min(2, "District must be at least 2 characters.")
		.optional(),
});

export type updateDonorPayload = z.infer<typeof updateDonorZodSchema>;

const updateAvailabilityZodSchema = z.object({
	availability: z.boolean("Availability is not a boolean or is empty"),
});

export type updateAvailabilityPayload = z.infer<
	typeof updateAvailabilityZodSchema
>;

export const donorValidation = {
	updateDonorZodSchema,
	updateAvailabilityZodSchema,
};
