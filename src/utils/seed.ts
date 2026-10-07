import chalk from "chalk";
import httpStatus from "http-status";
import { UserRole } from "../../prisma/generated/prisma/enums.js";
import config from "../config/index.js";
import AppError from "../errors/appError.js";
import { prisma } from "../lib/prisma.js";
import { getHashPassword } from "./password.js";

export const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExist = await prisma.user.findFirst({
			where: {
				role: UserRole.SUPER_ADMIN,
			},
		});

		if (isSuperAdminExist) {
			console.log(chalk.gray("Super Admin is already exists"));
			return;
		}

		const name = config.super_admin_name;
		const email = config.super_admin_email;
		const password = config.super_admin_password;

		const hashPassword = await getHashPassword(password as string);

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Super admin name email password is missing in env file",
			);
		}

		const superAdmin = await prisma.user.create({
			data: {
				email,
				name,
				password: hashPassword,
				role: UserRole.SUPER_ADMIN,
				isVerified: true,
			},
		});

		console.log("Super Admin created", superAdmin);
	} catch (error) {
		console.log("super admin seeding Error", error);

		await prisma.user.delete({
			where: {
				email: config.super_admin_email,
			},
		});
	}
};

export const seedAdmin = async () => {
	try {
		const isAdminExist  = await prisma.user.findFirst({
			where: {
				role: UserRole.ADMIN,
			},
		});

		if (isAdminExist) {
			console.log(chalk.gray(" Admin is already exists"));
			return;
		}

		const name = config.admin_name;
		const email = config.admin_email;
		const password = config.admin_password;

		const hashPassword = await getHashPassword(password as string);

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Admin name email password is missing in env file",
			);
		}

		const admin = await prisma.user.create({
			data: {
				email,
				name,
				password: hashPassword,
				role: UserRole.ADMIN,
				isVerified: true,
			},
		});

		console.log("Admin created", admin);
	} catch (error) {
		console.log("admin seeding Error", error);

		await prisma.user.delete({
			where: {
				email: config.admin_email,
			},
		});
	}
};
