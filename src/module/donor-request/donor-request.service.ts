import httpStatus from "http-status";
import { BloodRequestStatus } from "../../../prisma/generated/prisma/enums.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import type { SendDonorRequestsPayload } from "./donor-request.validation.js";

const sendRequest = async (
	requestId: string,
	payload: SendDonorRequestsPayload,
) => {
	console.log(requestId, payload);

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

// const getAllBloodRequests = async (userId: string) => {}

export const donorRequestServices = {
	sendRequest,
};
