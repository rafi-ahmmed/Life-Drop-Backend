import { Router } from "express";
import { ro } from "zod/locales";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { paymentControllers } from "./payment.controller.js";
import { paymentValidations } from "./payment.validation.js";

const router = Router();

router.post(
	"/create-payment",
	validateRequest(paymentValidations.createPaymentZodSchema),
	auth(
		UserRole.PATIENT,
		UserRole.DONOR,
		UserRole.ADMIN,
		UserRole.HOSPITAL,
		UserRole.SUPER_ADMIN,
	),
	paymentControllers.createPayment,
);

router.get("/bkash/callback", paymentControllers.bkashCallback);

export const paymentRoutes = router;
