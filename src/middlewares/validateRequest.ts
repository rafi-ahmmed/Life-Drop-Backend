import httpStatus from "http-status";
import type z from "zod";
import AppError from "../errors/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const validateRequest = (zodScheme: z.ZodObject) => {
	return catchAsync((req, res, next) => {
		const payload = req.body ?? {};
		const result = zodScheme.safeParse(payload);

		if (!result.success) {
			console.log(result.error.issues);
			throw new AppError(
				httpStatus.BAD_REQUEST,
				result?.error?.issues[0]?.message ?? "Validation failed",
			);
		}

		req.body = result.data;
		next();
	});
};
