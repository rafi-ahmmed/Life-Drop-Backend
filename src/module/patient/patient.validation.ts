import z from "zod";

const updatePatientZodSchema = z.object({
	phone: z.string().min(10).max(15).optional(),
	address: z.string().min(10).max(100).optional(),
	district: z.string().min(10).max(100).optional(),
});

export type UpdatePatientPayload = z.infer<typeof updatePatientZodSchema>;

export const patientValidation = {
	updatePatientZodSchema,
};
