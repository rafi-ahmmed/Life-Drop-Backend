import { z } from "zod";

const createPaymentZodSchema = z.object({
	campaignId: z
		.string("Campaign id is required")
		.trim()
		.min(1, "Campaign id is required"),
	amount: z.coerce
		.number("Amount is required")
		.positive("Amount must be greater than 0"),
});

export type CreatePaymentPayload = z.infer<typeof createPaymentZodSchema>;

export const paymentValidations = {
	createPaymentZodSchema,
};
