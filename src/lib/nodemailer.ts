import nodemailer from "nodemailer";
import config from "../config/index.js";

export const emailTransporter = nodemailer.createTransport({
	service: "gmail", // Use any Service ID from the table below (matching is case-insensitive)
	auth: {
		user: config.smtp_user,
		pass: config.smtp_password,
	},
});
