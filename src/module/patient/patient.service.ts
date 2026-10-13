import httpStatus from "http-status";
import AppError from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import type { UpdatePatientPayload } from "./patient.validation.js";

const updatePatient = async (payload: UpdatePatientPayload, userId: string) => {
	const isPatientExists = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			patients: true,
		},
	});

	if (!isPatientExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
	}

	if (!isPatientExists.patients) {
		const createPatient = await prisma.patient.create({
			data: {
				userId: userId,
				phone: payload.phone,
				address: payload.address,
				district: payload.district,
			},
			include: {
				user: true,
			},
		});

		return createPatient;
	}

	const updatePatient = await prisma.patient.update({
		where: {
			id: isPatientExists?.patients.id,
		},
		data: {
			phone: payload.phone,
			address: payload.address,
			district: payload.district,
		},
		include: {
			user: true,
		},
	});

	return updatePatient;
};

// const registerPatient = async (payload: any) => {};

export const patientServices = { updatePatient };
