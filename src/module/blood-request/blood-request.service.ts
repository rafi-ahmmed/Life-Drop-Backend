import httpStatus from "http-status";
import { BloodRequestStatus } from "../../../prisma/generated/prisma/enums.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
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

const getAllBloodRequests = async (userId: string) => {
	const result = await prisma.bloodRequest.findMany({
		where: {
			requestorId: userId,
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



// const getAllBloodRequests = async (userId: string) => {

// }

export const bloodRequestServices = {
	createBloodRequest,
	getAllBloodRequests,
	getAllBloodRequestsByAdmin,
	getBloodRequestById,
	
};
