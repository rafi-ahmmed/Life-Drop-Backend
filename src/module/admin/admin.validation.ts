import { z } from "zod";

const updateUserStatusZodSchema = z.object({
	status: z.enum(["ACTIVE", "BLOCKED"]),
});

export type UpdateUserStatusPayload = z.infer<typeof updateUserStatusZodSchema>;

export const adminValidation = {
	updateUserStatusZodSchema,
};
