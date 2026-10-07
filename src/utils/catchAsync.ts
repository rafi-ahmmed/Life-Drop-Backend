import chalk from "chalk";
import type { NextFunction, Request, RequestHandler, Response } from "express";

const catchAsync = (fun: RequestHandler) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await fun(req, res, next);
		} catch (error) {
			// console.log(chalk.redBright(error));
			next(error);
		}
	};
};

export default catchAsync;
