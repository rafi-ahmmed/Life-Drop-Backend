import httpStatus from "http-status";
import type { Prisma } from "../../../prisma/generated/prisma/browser.js";
import { BloodRequestStatus } from "../../../prisma/generated/prisma/enums.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import type { MatchingOptions } from "./blood-request.interface.js";
import type {
	CreateBloodRequestPayload,
	UpdateBloodRequestStatusPayload,
} from "./blood-request.validation.js";

const createBloodRequest = async (
	payload: CreateBloodRequestPayload,
	userId: string,
) => {
	const result = await prisma.bloodRequest.create({
		data: {
			requestorId: userId,
			address: payload.address,
			bloodGroup: payload.bloodGroup,
			gender: payload.gender,
			reason: payload.reason,
			district: payload.district,
			description: payload.description,
			neededAt: payload.neededAt,
			patientName: payload.patientName,
			phone: payload.phone,
			urgency: payload.urgency,
			units: payload.units,
		},
	});

	return result;
};

// TODO: Implement filter and pagination
const getAllBloodRequestsByAdmin = async () => {
	const result = await prisma.bloodRequest.findMany();

	return result;
};

const getBloodRequestById = async (requestId: string) => {
	if (!requestId) {
		throw new Error("Request ID is required");
	}
	const result = await prisma.bloodRequest.findUnique({
		where: {
			id: requestId,
		},
	});

	return result;
};

const updateBloodRequestStatus = async (
	payload: UpdateBloodRequestStatusPayload,
	userId: string,
	requestId: string,
) => {
	console.log(payload, requestId, userId);

	const request = await prisma.bloodRequest.findUnique({
		where: {
			id: requestId,
		},
	});

	if (!request) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	if (payload.status === request.status) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Status cannot be same as current status ${request.status}`,
		);
	}

	if (request.status !== BloodRequestStatus.PENDING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Status cannot be changed to ${payload.status} as request is already ${request.status}`,
		);
	}

	const result = await prisma.bloodRequest.update({
		where: {
			id: requestId,
		},
		data: {
			status: payload.status,
			reviewerId: userId,
		},
	});

	return result;
};

const myRequests = async (userId: string) => {
	const requests = await prisma.bloodRequest.findMany({
		where: {
			requestorId: userId,
		},
	});

	console.log(requests);

	if (!requests || requests.length === 0) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	return requests;
};

const matchDonors = async (
	requestId: string,
	userId: string,
	matchingOptions: MatchingOptions,
) => {
	const { exactLocation, exactDistrict } = matchingOptions;
	const request = await prisma.bloodRequest.findUnique({
		where: {
			id: requestId,
			requestorId: userId,
		},
	});

	if (!request) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	if (
		request.status !== BloodRequestStatus.APPROVED &&
		request.status !== BloodRequestStatus.MATCHING
	) {
		throw new AppError(httpStatus.BAD_REQUEST, "Request is not approved yet");
	}

	if (request.status !== BloodRequestStatus.MATCHING) {
		await prisma.bloodRequest.update({
			where: {
				id: requestId,
			},
			data: {
				status: BloodRequestStatus.MATCHING,
			},
		});
	}

	const threeMonthsAgo = new Date();
	threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

	const andConditions: Prisma.DonorWhereInput[] = [
		{
			bloodGroup: request.bloodGroup,
		},
		{
			availability: true,
		},
		{
			OR: [{ lastDonatedAt: null }, { lastDonatedAt: { lte: threeMonthsAgo } }],
		},
	];

	if (exactLocation) {
		andConditions.push({
			address: {
				contains: request.address,
				mode: "insensitive",
			},
		});
	}

	if (exactDistrict) {
		andConditions.push({
			district: {
				equals: request.district,
				mode: "insensitive",
			},
		});
	}

	const matchingDonors = await prisma.donor.findMany({
		where: {
			AND: andConditions,
		},
		select: {
			id: true,
			bloodGroup: true,
			district: true,
			address: true,
		},
	});

	const total = matchingDonors.length;

	const existingResponses = await prisma.donorRequest.findMany({
		where: {
			requestId: requestId,
		},
		select: {
			donorId: true,
		},
	});

	const alreadySendDonorIds = new Set(
		existingResponses.map((response) => response.donorId),
	);

	const unsentDonorIds = matchingDonors
		.filter((donor) => !alreadySendDonorIds.has(donor.id))
		.map((donor) => donor.id);
	const stringDonorIds = unsentDonorIds.map((id) => id.toString());

	console.log(stringDonorIds);

	return { total, matchingDonors, stringDonorIds };
};



// const getAllBloodRequests = async (userId: string) => {}

export const bloodRequestServices = {
	createBloodRequest,
	getAllBloodRequestsByAdmin,
	getBloodRequestById,
	updateBloodRequestStatus,
	myRequests,
	matchDonors,
};
