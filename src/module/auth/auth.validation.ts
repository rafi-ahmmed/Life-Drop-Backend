import z from "zod";

const patientRegistrationZodSchema = z.object({
	name: z
		.string("Not a string")
		.min(3, "Name must be at least 3 characters")
		.max(10, "Name must be at most 10 characters"),
	email: z.email("Not a valid email"),
	password: z
		.string("Not a string")
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
		.string("Not a string")
		.min(10, "Phone number must be at least 10 characters")
		.max(15, "Phone number must be at most 15 characters")
		.optional(),

	address: z
		.string("Not a string")
		.min(10, "Address must be at least 10 characters")
		.max(100, "Address must be at most 100 characters")
		.optional(),
});

export type patientRegistrationPayload = z.infer<
	typeof patientRegistrationZodSchema
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
	verifyEmailZodSchema,
	loginZodSchema,
};
