import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { donorControllers } from "./donor.controller.js";
import { donorValidation } from "./donor.validation.js";

const router = Router();

router.patch(
	"/me",
	auth(UserRole.DONOR),
	validateRequest(donorValidation.updateDonorZodSchema),
	donorControllers.updateDonor,
);

router.patch(
	"/availability",
	auth(UserRole.DONOR),
	validateRequest(donorValidation.updateAvailabilityZodSchema),
	donorControllers.updateAvailability,
);

export const donorRoutes = router;
