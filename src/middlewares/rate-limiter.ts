import rateLimit from "express-rate-limit";
import config from "../config/index.js";

export const globalRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests. Please try again later.",
	},
});

export const loginAndRegisterRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many login attempts. Please try again later.",
	},
});

export const googleLoginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 3,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	handler: (req, res) => {
		res.redirect(`${config.frontend_url}/login?error=too_many_attempts`);
	},
});

export const paymentRateLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 5,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many payment requests. Please try again later.",
	},
});
