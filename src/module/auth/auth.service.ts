import httpStatus from "http-status";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import {
	UserRole,
	UserStatus,
} from "../../../prisma/generated/prisma/enums.js";
import config from "../../config/index.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import { redisClient } from "../../lib/redis.js";
import type { IRequestUser } from "../../middlewares/checkAuth.js";
import generateOTP from "../../utils/generateOtp.js";
import { generateToken, verifyToken } from "../../utils/jwt.js";
import { getHashPassword } from "../../utils/password.js";
import { sentEmail } from "../../utils/sentEmail.js";
import type {
	donorRegistrationPayload,
	patientRegistrationPayload,
	verifyEmailPayload,
} from "./auth.validation.js";

const registerPatient = async (payload: patientRegistrationPayload) => {
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
	const otpKey = `registrationOTP:${email}`;
	const redisPatientData = JSON.stringify({
		...payload,
		role: UserRole.PATIENT,
	});

	const redisPatientDataKey = `registrationData:${email}`;

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

const registerDonor = async (payload: donorRegistrationPayload) => {
	const { email, name, password, address, phone, bloodGroup, dateOfBirth } =
		payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserExist) {
		throw new AppError(httpStatus.CONFLICT, "User already exists");
	}

	const otp = generateOTP();
	const otpKey = `registrationOTP:${email}`;
	const redisPatientData = JSON.stringify({
		...payload,
		role: UserRole.DONOR,
	});

	const redisPatientDataKey = `registrationData:${email}`;

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

	const redisOTPKey = `registrationOTP:${email}`;
	const redisOTP = await redisClient.get(redisOTPKey);

	if (!redisOTP || redisOTP !== otp) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Invalid or expired OTP! register again",
		);
	}

	const redisRegistrationDataKey = `registrationData:${email}`;
	const redisRegistrationData = await redisClient.get(redisRegistrationDataKey);

	const registrationData = JSON.parse(redisRegistrationData || "{}");

	const hashPassword = await getHashPassword(registrationData.password);

	let username: string;
	let userEmail: string;
	let data: object;

	if (registrationData.role === UserRole.PATIENT) {
		const createUser = await prisma.user.create({
			data: {
				email: registrationData.email,
				name: registrationData.name,
				password: hashPassword,
				role: UserRole.PATIENT,
				isVerified: true,
				patient: {
					create: {
						address: registrationData.address,
						phone: registrationData.phone,
						district: registrationData.district,
					},
				},
			},
			include: {
				patient: true,
			},
		});

		const { password, ...userData } = createUser;

		username = createUser.name;
		userEmail = createUser.email;
		data = userData;
	} else if (registrationData.role === UserRole.DONOR) {
		const createUser = await prisma.user.create({
			data: {
				email: registrationData.email,
				name: registrationData.name,
				password: hashPassword,
				role: UserRole.DONOR,
				isVerified: true,
				donor: {
					create: {
						address: registrationData.address,
						phone: registrationData.phone,
						district: registrationData.district,
						bloodGroup: registrationData.bloodGroup,
						gender: registrationData.gender,
						dateOfBirth: registrationData.dateOfBirth,
						lastDonatedAt: registrationData.lastDonatedAt,
					},
				},
			},
			include: {
				donor: true,
			},
		});

		const { password, ...userData } = createUser;

		username = createUser.name;
		userEmail = createUser.email;
		data = userData;
	} else {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid registration role!");
	}

	// Common operations
	await redisClient.del([redisOTPKey, redisRegistrationDataKey]);

	await sentEmail(
		"verificationSuccessful.ejs",
		{ username },
		userEmail,
		"Your email verification successful",
	);

	return data;
};

const getMe = async (user: IRequestUser) => {
	// console.log("user==", user);
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			patient: user.role === UserRole.PATIENT,
			donor: user.role === UserRole.DONOR,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = verifyToken(token, config.jwt_refresh_secret);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = await generateToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions["expiresIn"],
	);

	const refreshToken = await generateToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions["expiresIn"],
	);

	return {
		accessToken,
		refreshToken,
	};
};

// const registerUser = async (payload: any) => {};

export const authServices = {
	registerPatient,
	registerDonor,
	verifyEmail,
	getMe,
	refreshToken,
};
