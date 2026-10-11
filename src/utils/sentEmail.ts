import ejs from "ejs";
import path from "path";
import config from "../config/index.js";
import { emailTransporter } from "../lib/nodemailer.js";

export const sentEmail = async (
	templateName: string,
	templateData: Record<string, unknown>,
	to: string,
	subject: string,
) => {
	const template_path = path.join(
		process.cwd(),
		`src/templates/${templateName}`,
	);

	const html = await ejs.renderFile(template_path, templateData);

	await emailTransporter.sendMail({
		from: config.email_sender,
		to,
		subject,
		html,
	});
};
