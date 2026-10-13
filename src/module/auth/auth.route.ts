import { Router } from "express";
import passport from "passport";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authControllers } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";

const router = Router();

router.post(
	"/register/patient",
	validateRequest(authValidation.patientRegistrationZodSchema),
	authControllers.registerPatient,
);

router.post(
	"/register/donor",
	validateRequest(authValidation.donorRegistrationZodSchema),
	authControllers.registerDonor,
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

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get("/google/callback", authControllers.googleLogin);
router.get(
	"/getMe",
	auth(
		UserRole.ADMIN,
		UserRole.DONOR,
		UserRole.HOSPITAL,
		UserRole.PATIENT,
		UserRole.SUPER_ADMIN,
	),
	authControllers.getMe,
);

router.get("/logOut", authControllers.logout);
router.post("/refresh-token", authControllers.refreshToken);

router.get;

export const authRoutes = router;
