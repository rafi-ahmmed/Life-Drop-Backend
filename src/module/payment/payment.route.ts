import { Router } from "express";
import { ro } from "zod/locales";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { paymentRateLimiter } from "../../middlewares/rate-limiter.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { paymentControllers } from "./payment.controller.js";
import { paymentValidations } from "./payment.validation.js";

const router = Router();

router.post(
	"/create-payment",
	paymentRateLimiter,
	validateRequest(paymentValidations.createPaymentZodSchema),
	auth(UserRole.PATIENT, UserRole.DONOR, UserRole.HOSPITAL),
	paymentControllers.createPayment,
);

router.get("/bkash/callback", paymentControllers.bkashCallback);

router.get(
	"/my-payments",
	auth(UserRole.PATIENT, UserRole.DONOR, UserRole.HOSPITAL),
	paymentControllers.getMyPayments,
);

export const paymentRoutes = router;
