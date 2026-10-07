import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../prisma/generated/prisma/client.js";
import config from "../config/index.js";
import AppError from "../errors/appError.js";

export const globalErrorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (config.node_env === "development") {
		console.log(chalk.red("Error from Global Error Handler:"), err);
	}

	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let errorMessage = "Internal Server Error";
	let errorName = "Internal Server Error";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		errorName = "Application Error";
		errorMessage = err.message;
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		errorName = "Prisma Known Request Error";

		if (err.code === "P2002") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Duplicate key error.";
		} else if (err.code === "P2003") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Foreign key constraint failed.";
		} else if (err.code === "P2025") {
			statusCode = httpStatus.NOT_FOUND;
			errorMessage = "The requested record was not found.";
		}
	} else if (err instanceof Prisma.PrismaClientInitializationError) {
		errorName = "Prisma Initialization Error";

		if (err.errorCode === "P1000") {
			statusCode = httpStatus.UNAUTHORIZED;
			errorMessage = "Authentication failed against the database server.";
		} else if (err.errorCode === "P1001") {
			statusCode = httpStatus.SERVICE_UNAVAILABLE;
			errorMessage = "Cannot reach the database server.";
		}
	} else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		errorName = "Prisma Unknown Request Error";
		errorMessage = "An error occurred during query execution.";
	} else if (err instanceof Error) {
		errorName = err.name;
		errorMessage = err.message;
	}

	res.status(statusCode).json({
		success: false,
		statusCode,
		name:
			config.node_env === "development" ? errorName : "Internal Server Error",
		message:
			config.node_env === "development"
				? errorMessage
				: "Internal Server Error",
		error: config.node_env === "development" ? err : undefined,
		stack:
			config.node_env === "development" && err instanceof Error
				? err.stack
				: undefined,
	});
};
