import jwt, { type SignOptions } from "jsonwebtoken";

export const generateToken = async (
	payload: object,
	secret: string,
	expireTime: SignOptions["expiresIn"],
) => {
	const token = await jwt.sign(payload, secret, {
		expiresIn: expireTime,
	});

	return token;
};

export const verifyToken = (token: string, secret: string) => {
	try {
		const verifiedToken = jwt.verify(token, secret);
		return {
			success: true,
			data: verifiedToken,
		};
	} catch (error: any) {
		console.log("Token verification failed:", error);
		return {
			success: false,
			error: error.message,
		};
	}
};
