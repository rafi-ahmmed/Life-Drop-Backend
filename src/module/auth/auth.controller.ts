import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import passport from "passport";
import { set } from "zod";
import config from "../../config/index.js";
import AppError from "../../errors/appError.js";
import { clearAuthCookie, setAuthCookie } from "../../utils/authCookie.js";
import catchAsync from "../../utils/catchAsync.js";
import { generateToken } from "../../utils/jwt.js";
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
		passport.authenticate("local", async (err: any, user: any, info: any) => {
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

			const jwtPayload = {
				email: user.email,
				name: user.name,
				userId: user.id,
				role: user.role,
			};

			const accessToken = await generateToken(
				jwtPayload,
				config.jwt_access_secret,
				config.jwt_refresh_expires_in as SignOptions["expiresIn"],
			);
			const refreshToken = await generateToken(
				jwtPayload,
				config.jwt_refresh_secret,
				config.jwt_refresh_expires_in as SignOptions["expiresIn"],
			);

			setAuthCookie(res, { accessToken, refreshToken });

			sendResponse(res, {
				statusCode: httpStatus.OK,
				success: true,
				message: "Login successful.",
				data: { accessToken, refreshToken },
			});
		})(req, res, next);
	},
);

const googleLogin = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		passport.authenticate("google", async (err: any, user: any, info: any) => {
			if (err) {
				return next(
					new AppError(
						httpStatus.UNAUTHORIZED,
						info?.message || "Invalid email or password.",
					),
				);
			}
			if (!user) {
				return next(
					new AppError(
						httpStatus.UNAUTHORIZED,
						info?.message || "Invalid credentials",
					),
				);
			}

			const jwtPayload = {
				email: user.email,
				name: user.name,
				userId: user.id,
				role: user.role,
			};

			const accessToken = await generateToken(
				jwtPayload,
				config.jwt_access_secret,
				config.jwt_refresh_expires_in as SignOptions["expiresIn"],
			);
			const refreshToken = await generateToken(
				jwtPayload,
				config.jwt_refresh_secret,
				config.jwt_refresh_expires_in as SignOptions["expiresIn"],
			);

			setAuthCookie(res, { accessToken, refreshToken });

			const { password, ...rest } = user;
			// console.log("rest==", rest);
			// sendResponse(res, {
			// 	statusCode: httpStatus.OK,
			// 	success: true,
			// 	message: "Login Successful",
			// 	data: { user: accessToken, refreshToken },
			// });

			res.redirect(
				`${config.frontend_url}/login/success?accessToken=${accessToken}&refreshToken=${refreshToken}`,
			);
		})(req, res, next);
	},
);

const getMe = catchAsync(async (req: Request, res: Response) => {
	const payload = req.currentUser!;

	console.log(payload);

	const result = await authServices.getMe(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your profile retrieve successfully.",
		data: result,
	});
});

const logout = catchAsync(async (req: Request, res: Response) => {
	clearAuthCookie(res);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Logout successful.",
		data: null,
	});
});
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
	googleLogin,
	getMe,
	logout,
};
