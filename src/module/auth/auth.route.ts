import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authControllers } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";

const router = Router();

router.post(
	"/register",
	validateRequest(authValidation.patientRegistrationZodSchema),
	authControllers.registerPatient,
);

router.post(
	"/verify-email",
	validateRequest(authValidation.verifyEmailZodSchema),
	authControllers.verifyEmail,
);

router.post(
	"/login",
	validateRequest(authValidation.loginZodSchema),
	authControllers.login,
);

export const authRoutes = router;
