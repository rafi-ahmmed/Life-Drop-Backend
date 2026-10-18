import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { donorRequestControllers } from "./donor-request.controller.js";
import { donorRequestValidation } from "./donor-request.validation.js";

const router = Router();

router.post(
	"/send-requests/:id",
	auth(UserRole.PATIENT),
	validateRequest(donorRequestValidation.sendDonorRequestZodSchema),
	donorRequestControllers.sendRequest,
);

router.patch(
	"/status/:id",
	auth(UserRole.PATIENT),
	validateRequest(donorRequestValidation.updateDonorRequestZodSchema),
	donorRequestControllers.updateRequestStatusByPatient,
);

router.get(
	"/my-requests",
	auth(UserRole.DONOR),
	donorRequestControllers.getMyRequests,
);

router.get(
	"/my-requests/:id",
	auth(UserRole.DONOR),
	donorRequestControllers.getRequestById,
);

router.patch(
	"/respond/:id",
	validateRequest(donorRequestValidation.respondToRequestSchema),
	auth(UserRole.DONOR),
	donorRequestControllers.respondToRequest,
);

export const donorRequestRoutes = router;
