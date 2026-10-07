import type { Response } from "express";

type TMeta = {
	page?: number;
	limit?: number;
	total?: number;
	approved?: number;
	pending?: number;
	completed?: number;
	active?: number;
};

type TResponse<T> = {
	success: boolean;
	statusCode: number;
	message: string;
	meta?: TMeta;
	data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
	return res.status(data.statusCode).json({
		success: data.success,
		message: data.message,
		meta: data.meta,
		data: data.data,
	});
};

export default sendResponse;
