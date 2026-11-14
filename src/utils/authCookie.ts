import type { CookieOptions, Response } from "express";
import config from "../config/index.js";

export interface AuthTokens {
	accessToken?: string;
	refreshToken?: string;
}

const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: config.node_env !== "development",
	sameSite: config.node_env === "development" ? "lax" : "none",
};

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
	if (tokenInfo.accessToken) {
		res.cookie("accessToken", tokenInfo.accessToken, {
			...cookieOptions,
			maxAge: 24 * 60 * 60 * 1000,
		});
	}

	if (tokenInfo.refreshToken) {
		res.cookie("refreshToken", tokenInfo.refreshToken, {
			...cookieOptions,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
	}
};

export const clearAuthCookie = (res: Response) => {
	res.clearCookie("accessToken", cookieOptions);
	res.clearCookie("refreshToken", cookieOptions);
};
