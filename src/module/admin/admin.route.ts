import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { adminControllers } from "./admin.controller.js";
import { adminValidation } from "./admin.validation.js";

const router = Router();

router.get(
	"/users",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	adminControllers.allUsers,
);

router.get(
	"/dashboard-stats",
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	adminControllers.adminStats,
);

router.patch(
	"/users/role/:id",
	validateRequest(adminValidation.updateUserStatusZodSchema),
	auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
	adminControllers.updateUserStatus,
);

export const adminRoutes = router;
