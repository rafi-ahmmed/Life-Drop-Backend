import httpStatus from "http-status";
import {
	BloodRequestStatus,
	DonorRequestStatus,
} from "../../../prisma/generated/prisma/enums.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import isEligibleToDonate from "../../utils/isEligibleToDonate.js";
import type {
	RespondToRequestPayload,
	SendDonorRequestsPayload,
	UpdateDonorRequestPayload,
} from "./donor-request.validation.js";

const sendRequest = async (
	requestId: string,
	payload: SendDonorRequestsPayload,
) => {
	// console.log(requestId, payload);

	const donorIds = payload.donorIds;

	const request = await prisma.bloodRequest.findUnique({
		where: {
			id: requestId,
		},
	});

	if (!request) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	if (request.status !== BloodRequestStatus.MATCHING) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`You cannot send request as request is not in matching state or not approved yet`,
		);
	}

	const sendResult = await prisma.donorRequest.createMany({
		data: donorIds.map((donorId: string) => ({
			requestId: requestId,
			donorId: donorId,
		})),
		skipDuplicates: true,
	});

	console.log(sendResult);

	return sendResult;
};

const updateRequestStatusByPatient = async (
	userId: string,
	requestId: string,
	payload: UpdateDonorRequestPayload,
) => {
	return prisma.$transaction(async (tx) => {
		const request = await tx.donorRequest.findFirst({
			where: {
				id: requestId,
				bloodRequest: {
					requestorId: userId,
				},
			},
			include: {
				bloodRequest: true,
				donor: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!request) {
			throw new AppError(httpStatus.NOT_FOUND, "Request not found");
		}

		if (payload.status === request.status) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Request already ${payload.status}`,
			);
		}

		if (
			payload.status === DonorRequestStatus.COMPLETED &&
			request.status !== DonorRequestStatus.ACCEPTED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Only accepted donor requests can be completed",
			);
		}

		if (
			payload.status !== DonorRequestStatus.COMPLETED &&
			request.status !== DonorRequestStatus.INTERESTED &&
			request.status !== DonorRequestStatus.ACCEPTED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"You cannot update this request from its current state",
			);
		}

		if (request.bloodRequest.status === BloodRequestStatus.FULFILLED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Blood request is already fulfilled",
			);
		}

		// Update blood request status
		const updatedRequest = await tx.donorRequest.update({
			where: {
				id: requestId,
			},
			data: {
				status: payload.status,
			},
		});

		// Update donor lastDonatedAt
		await tx.donor.update({
			where: {
				id: request.donor.id,
			},
			data: {
				lastDonatedAt: new Date(),
			},
		});

		if (payload.status === DonorRequestStatus.COMPLETED) {
			const completedCount = await tx.donorRequest.count({
				where: {
					requestId: request.bloodRequest.id,
					status: DonorRequestStatus.COMPLETED,
				},
			});

			if (completedCount >= request.bloodRequest.units) {
				await tx.bloodRequest.update({
					where: {
						id: request.bloodRequest.id,
					},
					data: {
						status: BloodRequestStatus.FULFILLED,
					},
				});
			}
		}

		return updatedRequest;
	});
};

const getMyRequests = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			donor: {
				select: {
					id: true,
				},
			},
		},
	});

	const result = await prisma.donorRequest.findMany({
		where: {
			donorId: user?.donor?.id,
		},
	});

	if (!result || result.length === 0) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	return result;
};

const getRequestById = async (donorRequestId: string, userId: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			donor: {
				select: {
					id: true,
				},
			},
		},
	});
	const result = await prisma.donorRequest.findUnique({
		where: {
			id: donorRequestId,
			donorId: user?.donor?.id,
		},
		include: {
			bloodRequest: true,
		},
	});

	if (!result) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	return result;
};

const respondToRequest = async (
	requestId: string,
	userId: string,
	payload: RespondToRequestPayload,
) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			donor: {
				select: {
					id: true,
					lastDonatedAt: true,
				},
			},
		},
	});

	const isEligible = isEligibleToDonate(user?.donor?.lastDonatedAt ?? null);

	if (!isEligible) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You are not eligible to donate",
		);
	}

	const donorRequest = await prisma.donorRequest.findUnique({
		where: {
			id: requestId,
			donorId: user?.donor?.id,
		},
		include: {
			bloodRequest: true,
		},
	});

	if (!donorRequest) {
		throw new AppError(httpStatus.NOT_FOUND, "Request not found");
	}

	if (payload.status === donorRequest.status) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Request already ${payload.status}`,
		);
	}

	if (donorRequest.bloodRequest.status !== "MATCHING") {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You cannot respond to this blood request",
		);
	}

	const donorRequestUpdate = await prisma.donorRequest.update({
		where: {
			id: requestId,
		},
		data: {
			status: payload.status,
		},
	});

	return donorRequestUpdate;
};

// const getAllBloodRequests = async (userId: string) => {}

export const donorRequestServices = {
	sendRequest,
	getMyRequests,
	getRequestById,
	respondToRequest,
	updateRequestStatusByPatient,
};
