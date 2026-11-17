import httpStatus from "http-status";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import type { UpdateUserStatusPayload } from "./admin.validation.js";

const getAllUsers = async () => {
	const result = await prisma.user.findMany({
		include: {
			donor: true,
			patient: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		omit: {
			password: true,
		},
	});
	return result;
};

const updateUser = async (userId: string, payload: UpdateUserStatusPayload) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === payload.status) {
		throw new AppError(httpStatus.BAD_REQUEST, "User already in this status");
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			status: payload.status,
		},
	});

	return updatedUser;
};

const getAdminStats = async () => {
	const [
		totalPatients,
		totalDonors,
		activeUsers,
		blockedUsers,
		totalBloodRequests,
		pendingBloodRequests,
		approvedBloodRequests,
		fulfilledBloodRequests,
		totalFundCampaigns,
		pendingFundCampaigns,
		approvedFundCampaigns,
		monthlyFundingData,
		dailyBloodRequestsData,
		totalFunding,
	] = await Promise.all([
		// Patients
		prisma.user.count({
			where: { role: "PATIENT" },
		}),

		// Donors
		prisma.user.count({
			where: { role: "DONOR" },
		}),

		// Active users
		prisma.user.count({
			where: { status: "ACTIVE" },
		}),

		// Blocked users
		prisma.user.count({
			where: { status: "BLOCKED" },
		}),

		// Blood requests
		prisma.bloodRequest.count(),

		prisma.bloodRequest.count({
			where: { status: "PENDING" },
		}),

		prisma.bloodRequest.count({
			where: {
				status: {
					in: ["MATCHING", "APPROVED"],
				},
			},
		}),

		prisma.bloodRequest.count({
			where: { status: "FULFILLED" },
		}),

		// Fund campaigns
		prisma.fundCampaign.count(),

		prisma.fundCampaign.count({
			where: { status: "PENDING" },
		}),

		prisma.fundCampaign.count({
			where: {
				status: {
					in: ["APPROVED", "ACTIVE"],
				},
			},
		}),

		prisma.fundCampaign.findMany({
			where: {
				createdAt: {
					gte: new Date(new Date().getFullYear(), 0, 1),
					lt: new Date(new Date().getFullYear() + 1, 0, 1),
				},
			},
			select: {
				createdAt: true,
				targetAmount: true,
				collectedAmount: true,
			},
		}),

		prisma.bloodRequest.findMany({
			where: {
				createdAt: {
					gte: new Date(new Date().setDate(new Date().getDate() - 30)),
				},
			},
			select: {
				createdAt: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		}),

		await prisma.fundCampaign.aggregate({
			_sum: {
				collectedAmount: true,
			},
		}),
	]);

	const totalFundingRevenue = totalFunding._sum.collectedAmount ?? 0;

	return {
		users: {
			totalPatients,
			totalDonors,
			activeUsers,
			blockedUsers,
		},
		bloodRequests: {
			total: totalBloodRequests,
			pending: pendingBloodRequests,
			approved: approvedBloodRequests,
			fulfilled: fulfilledBloodRequests,
		},
		fundCampaigns: {
			total: totalFundCampaigns,
			pending: pendingFundCampaigns,
			approved: approvedFundCampaigns,
		},
		totalFundingRevenue,
		monthlyFundingData,
		dailyBloodRequestsData,
	};
};

export const AdminStatsService = {
	getAdminStats,
};

// const getAllUsers = async () => {};

export const adminServices = {
	getAllUsers,
	updateUser,
	getAdminStats,
};
