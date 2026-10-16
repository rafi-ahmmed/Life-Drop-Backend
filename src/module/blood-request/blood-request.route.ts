import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { bloodRequestControllers } from "./blood-request.controller.js";
import { bloodRequestValidation } from "./blood-request.validation.js";

const router = Router();

// ?For Admin
router.get(
	"/all",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	bloodRequestControllers.getAllBloodReqByAdmin,
);

router.patch(
	"/status/:id",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	bloodRequestControllers.updateBloodRequestStatus,
);

// *For Patient
router.post(
	"/create",
	auth(UserRole.PATIENT),
	validateRequest(bloodRequestValidation.createBloodRequestZodSchema),
	bloodRequestControllers.createBloodRequest,
);

router.get(
	"/me",
	auth(UserRole.PATIENT),
	bloodRequestControllers.getAllBloodRequests,
);

router.get(
	"/my-requests",
	auth(UserRole.PATIENT),
	bloodRequestControllers.myRequests,
);

router.get(
	"/:id",
	auth(UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DONOR),
	bloodRequestControllers.getBloodRequestById,
);

router.get(
	"/match-donors/:id",
	auth(UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
	bloodRequestControllers.matchDonors,
);

export const bloodRequestRoutes = router;
