import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import passport from "passport";
import AppError from "../../errors/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { authServices } from "./auth.service.js";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await authServices.registerUser(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Verification otp send on ur email.",
		data: null,
	});
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await authServices.verifyEmail(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Email verified successfully.",
		data: result,
	});
});

const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		passport.authenticate("local", (err: any, user: any, info: any) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				return next(
					new AppError(
						httpStatus.UNAUTHORIZED,
						info?.message || "Invalid email or password.",
					),
				);
			}

			const { password, ...userWithoutPassword } = user;
			sendResponse(res, {
				statusCode: httpStatus.OK,
				success: true,
				message: "Login successful.",
				data: userWithoutPassword,
			});
		})(req, res, next);
	},
);

// const registerPatient = catchAsync(async (req: Request, res: Response) => {
// 	const payload = req.body;

// 	sendResponse(res, {
// 		statusCode: httpStatus.OK,
// 		success: true,
// 		message: "Verification otp send on ur email.",
// 		data: null,
// 	});
// });

export const authControllers = {
	registerPatient,
	verifyEmail,
	login,
};
