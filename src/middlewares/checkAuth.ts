import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import {
	type UserRole,
	UserStatus,
} from "../../prisma/generated/prisma/enums.js";
import config from "../config/index.js";
import AppError from "../errors/appError.js";
import { prisma } from "../lib/prisma.js";
import catchAsync from "../utils/catchAsync.js";
import { verifyToken } from "../utils/jwt.js";

export interface IRequestUser {
	email: string;
	name: string;
	userId: string;
	role: UserRole;
}

declare global {
	namespace Express {
		interface Request {
			currentUser?: IRequestUser;
		}
	}
}

export const auth = (...requiredRoles: UserRole[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;

		if (!token) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not logged in. Please log in to access this resource.",
			);
		}

		const verifiedToken = verifyToken(token, config.jwt_access_secret);

		if (!verifiedToken.success) {
			throw new Error(verifiedToken.error);
		}

		const { email, name, userId, role } = verifiedToken.data as JwtPayload;

		if (requiredRoles.length && !requiredRoles.includes(role)) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden. You don't have permission to access this resource.",
			);
		}

		//* Find the user in the database
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				email,
				name,
				role,
			},
		});

		if (!user) {
			throw new AppError(httpStatus.NOT_FOUND, "User not found");
		}

		if (user.status === UserStatus.BLOCKED) {
			throw new Error("Your account has been blocked. Please contact support.");
		}

		req.currentUser = {
			email,
			name,
			userId,
			role,
		};

		next();
	});
};
