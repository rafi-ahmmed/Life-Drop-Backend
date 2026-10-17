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

export const donorRequestRoutes = router;
