import z from "zod";
import { BloodGroup } from "../../../prisma/generated/prisma/enums.js";

const patientRegistrationZodSchema = z.object({
	name: z
		.string("Email is not a string or is empty")
		.min(3, "Name must be at least 3 characters")
		.max(10, "Name must be at most 10 characters"),
	email: z.email("Not a valid email"),
	password: z
		.string("password is not a string or is empty")
		.min(6, "Password must be at least 6 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one digit")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		)
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one digit")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		),

	phone: z
		.string("phone is not a string or is empty")
		.min(10, "Phone number must be at least 10 characters")
		.max(15, "Phone number must be at most 15 characters")
		.optional(),

	address: z
		.string(" address is not a string or is empty")
		.min(10, "Address must be at least 10 characters")
		.max(100, "Address must be at most 100 characters")
		.optional(),
});

export type patientRegistrationPayload = z.infer<
	typeof patientRegistrationZodSchema
>;

const donorRegistrationZodSchema = z.object({
	name: z
		.string(" Name is not a string or is empty")
		.min(3, "Name must be at least 3 characters")
		.max(10, "Name must be at most 10 characters"),
	email: z.email("Not a valid email"),
	password: z
		.string("password is not a string or is empty")
		.min(6, "Password must be at least 6 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one digit")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		)
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one digit")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		),

	bloodGroup: z.nativeEnum(BloodGroup, {
		message: "Please select a valid blood group.",
	}),

	phone: z
		.string("phone is not a string or is empty")
		.trim()
		.min(11, "Phone number must be at least 11 characters.")
		.max(15, "Phone number cannot exceed 15 characters."),

	address: z
		.string("address is not a string or is empty")
		.trim()
		.min(5, "Address must be at least 5 characters."),

	district: z
		.string("district is not a string or is empty")
		.trim()
		.min(2, "District must be at least 2 characters."),

	dateOfBirth: z.coerce
		.date("date Of Birth is not a date or is empty")
		.refine((date) => date <= new Date(), {
			message: "Date of birth cannot be in the future.",
		})
		.refine(
			(date) => {
				const today = new Date();
				const eighteenthBirthday = new Date(date);
				eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() + 18);

				return eighteenthBirthday <= today;
			},
			{
				message: "Donor must be at least 18 years old.",
			},
		),
});

export type donorRegistrationPayload = z.infer<
	typeof donorRegistrationZodSchema
>;

const verifyEmailZodSchema = z.object({
	email: z.string().email("Not a valid email"),
	otp: z.string().length(6, "OTP must be 6 characters"),
});

export type verifyEmailPayload = z.infer<typeof verifyEmailZodSchema>;

const loginZodSchema = z.object({
	email: z.string().email("Not a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export type loginPayload = z.infer<typeof loginZodSchema>;

export const authValidation = {
	patientRegistrationZodSchema,
	donorRegistrationZodSchema,
	verifyEmailZodSchema,
	loginZodSchema,
};
