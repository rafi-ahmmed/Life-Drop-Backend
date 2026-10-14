import { z } from "zod";
import { BloodGroup } from "../../../prisma/generated/prisma/enums.js";

export const createBloodRequestZodSchema = z.object({
	patientName: z.string("Patient name is required").trim().min(1),

	bloodGroup: z.enum(BloodGroup, {
		message: "Please select a valid blood group",
	}),

	phone: z
		.string("Phone number is required")
		.trim()
		.min(11, "Phone number must be at least 11 characters")
		.max(15, "Phone number cannot exceed 15 characters"),

	units: z
		.number("Units is required")
		.int("Units must be an integer")
		.positive("Units must be greater than 0"),

	address: z.string().trim().min(1, "Address is required"),

	district: z.string().trim().min(1, "District is required"),

	neededAt: z
		.string("Needed date is required")
		.datetime({ message: "Invalid date and time format" })
		.refine(
			(value) => new Date(value) > new Date(),
			"Needed date must be in the future",
		),

	urgency: z.boolean("Urgency is not a boolean or is empty"),

	description: z.string().default("I need blood").optional(),
});

export type CreateBloodRequestPayload = z.infer<
	typeof createBloodRequestZodSchema
>;

const updateBloodRequestStatusZodSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED"], {
		message: "Status must be either APPROVED or REJECTED",
	}),
});

export type UpdateBloodRequestStatusPayload = z.infer<
	typeof updateBloodRequestStatusZodSchema
>;

export const bloodRequestValidation = {
	createBloodRequestZodSchema,
	updateBloodRequestStatusZodSchema,
};
