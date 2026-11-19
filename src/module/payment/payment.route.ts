import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { paymentRateLimiter } from "../../middlewares/rate-limiter.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { paymentControllers } from "./payment.controller.js";
import { paymentValidations } from "./payment.validation.js";

const router = Router();

router.post(
	"/create-bkash-payment",
	paymentRateLimiter,
	validateRequest(paymentValidations.createPaymentZodSchema),
	auth(UserRole.PATIENT, UserRole.DONOR, UserRole.HOSPITAL),
	paymentControllers.createBkashPayment,
);

router.post(
	"/create-ssl-payment",
	paymentRateLimiter,
	validateRequest(paymentValidations.createPaymentZodSchema),
	auth(UserRole.PATIENT, UserRole.DONOR, UserRole.HOSPITAL),
	paymentControllers.createSSLPayment,
);

router.get("/bkash/callback", paymentControllers.bkashCallback);

router.post("/sslcommerz/ipn", paymentControllers.sslIpnCallback);
router.post("/sslcommerz/success", paymentControllers.sslSuccessCallback);
router.post("/sslcommerz/cancel", paymentControllers.sslCancelCallback);
router.post("/sslcommerz/fail", paymentControllers.sslFailCallback);

router.get(
	"/my-payments",
	auth(UserRole.PATIENT, UserRole.DONOR, UserRole.HOSPITAL),
	paymentControllers.getMyPayments,
);

export const paymentRoutes = router;
