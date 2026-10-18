import httpStatus from "http-status";
import {
	DonorRequestStatus,
	UserRole,
} from "../../../prisma/generated/prisma/enums.js";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import type {
	updateAvailabilityPayload,
	updateDonorPayload,
} from "./donor.validation.js";

const updateDonor = async (payload: updateDonorPayload, userId: string) => {
	console.log(payload);
	const isDonorExists = await prisma.user.findUnique({
		where: {
			id: userId,
			role: UserRole.DONOR,
		},
		include: {
			donor: true,
		},
	});

	if (!isDonorExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Donor not found");
	}

	const updatedDonor = await prisma.donor.update({
		where: {
			id: isDonorExists?.donor?.id,
		},
		data: {
			phone: payload.phone,
			address: payload.address,
			district: payload.district,
		},
	});

	return updatedDonor;
};

const updateAvailability = async (
	payload: updateAvailabilityPayload,
	userId: string,
) => {
	const isDonorExists = await prisma.user.findUnique({
		where: {
			id: userId,
			role: UserRole.DONOR,
		},
		include: {
			donor: {
				select: {
					id: true,
					availability: true,
				},
			},
		},
	});

	if (!isDonorExists?.donor) {
		throw new AppError(httpStatus.NOT_FOUND, "Donor not found");
	}

	if (isDonorExists.donor.availability === payload.availability) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Availability is already updated to ${payload.availability ? "available" : "unavailable"}`,
		);
	}

	const updatedDonor = await prisma.$transaction(async (tx) => {
		// Donor availability update
		const donor = await tx.donor.update({
			where: {
				id: isDonorExists.donor?.id,
			},
			data: {
				availability: payload.availability,
			},
		});

		if (payload.availability === false) {
			await tx.donorRequest.updateMany({
				where: {
					donorId: isDonorExists.donor?.id,
					status: DonorRequestStatus.ACCEPTED,
				},
				data: {
					status: DonorRequestStatus.WITHDRAWN,
				},
			});
		}

		return donor;
	});

	return updatedDonor;
};

// const registerUser = async (payload: any) => {};

export const donorServices = {
	updateDonor,
	updateAvailability,
};
