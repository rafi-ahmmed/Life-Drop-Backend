import httpStatus from "http-status";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import { redisClient } from "../../lib/redis.js";
import generateOTP from "../../utils/generateOtp.js";
import { getHashPassword } from "../../utils/password.js";
import { sentEmail } from "../../utils/sentEmail.js";
import type {
	patientRegistrationPayload,
	verifyEmailPayload,
} from "./auth.validation.js";

const registerUser = async (payload: patientRegistrationPayload) => {
	const { email, name, password, address, phone } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserExist) {
		throw new AppError(httpStatus.CONFLICT, "User already exists");
	}

	const otp = generateOTP();
	const otpKey = `patientRegistrationOTP:${email}`;
	const redisPatientData = JSON.stringify(payload);
	const redisPatientDataKey = `patientRegistrationData:${email}`;

	await redisClient.set(otpKey, otp, {
		expiration: {
			type: "EX",
			value: 60 * 5,
		},
	});
	await redisClient.set(redisPatientDataKey, redisPatientData, {
		expiration: {
			type: "EX",
			value: 60 * 5,
		},
	});

	const templateName = "sentOTP.ejs";
	const templateData = {
		otp,
		username: name,
		reason:
			"You are receiving this email because you have requested to register for a new account.",
	};

	await sentEmail(templateName, templateData, email, "Verification OTP");
};

const verifyEmail = async (payload: verifyEmailPayload) => {
	const { email, otp } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (isUserExist) {
		if (isUserExist.isVerified) {
			throw new AppError(httpStatus.BAD_REQUEST, "Email is already verified!");
		}
		throw new AppError(httpStatus.CONFLICT, "User already exist!");
	}

	const otpKey = `patientRegistrationOTP:${email}`;

	const otpFromRedis = await redisClient.get(otpKey);

	if (!otpFromRedis || otpFromRedis !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP!");
	}

	const redisPatientDataKey = `patientRegistrationData:${email}`;

	const redisPatientData = await redisClient.get(redisPatientDataKey);

	const patientData: patientRegistrationPayload = JSON.parse(
		redisPatientData || "{}",
	);

	const hashPassword = await getHashPassword(patientData.password);

	const createUser = await prisma.user.create({
		data: {
			email: patientData.email,
			name: patientData.name,
			password: hashPassword,
			isVerified: true,
			patients: {
				create: {
					address: patientData.address,
					phone: patientData.phone,
				},
			},
		},
		include: {
			patients: true,
		},
	});

	const { password, ...data } = createUser;

	await redisClient.del([otpKey, redisPatientDataKey]);

	await sentEmail(
		"verificationSuccessful.ejs",
		{ username: createUser.name },
		createUser.email,
		"Your email verification successful",
	);

	return data;
};

// const registerUser = async (payload: any) => {};

export const authServices = {
	registerUser,
	verifyEmail,
};
