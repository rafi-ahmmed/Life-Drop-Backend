import bcrypt from "bcryptjs";
import config from "../config/index.js";

export const getHashPassword = async (password: string) => {
	const hashedPassword = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds),
	);

	return hashedPassword;
};
