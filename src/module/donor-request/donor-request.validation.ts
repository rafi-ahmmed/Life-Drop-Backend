import z from "zod";

export const sendDonorRequestZodSchema = z.object({
	donorIds: z
		.array(z.uuid("Invalid donor ID"))
		.min(1, "At least one donor must be selected"),
});

export type SendDonorRequestsPayload = z.infer<
	typeof sendDonorRequestZodSchema
>;

export const donorRequestValidation = {
	sendDonorRequestZodSchema,
};
