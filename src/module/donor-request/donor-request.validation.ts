import z from "zod";

export const sendDonorRequestZodSchema = z.object({
	donorIds: z
		.array(z.uuid("Invalid donor ID"))
		.min(1, "At least one donor must be selected"),
});

export type SendDonorRequestsPayload = z.infer<
	typeof sendDonorRequestZodSchema
>;

export const respondToRequestSchema = z.object({
	status: z.enum(["INTERESTED", "DECLINED"]),
});

export type RespondToRequestPayload = z.infer<typeof respondToRequestSchema>;

export const updateDonorRequestZodSchema = z.object({
	status: z.enum(["ACCEPTED", "CANCELLED"]),
});

export type UpdateDonorRequestPayload = z.infer<
	typeof updateDonorRequestZodSchema
>;

export const donorRequestValidation = {
	sendDonorRequestZodSchema,
	respondToRequestSchema,
	updateDonorRequestZodSchema,
};
