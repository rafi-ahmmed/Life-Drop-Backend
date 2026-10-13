import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import upload from "../../lib/multer.js";
import { auth } from "../../middlewares/checkAuth.js";
import { userControllers } from "./user.controller.js";

const router = Router();

router.post(
	"/upload-profile-image",
	upload.single("profileImage"),
	auth(
		UserRole.ADMIN,
		UserRole.DONOR,
		UserRole.HOSPITAL,
		UserRole.PATIENT,
		UserRole.SUPER_ADMIN,
	),
	userControllers.uploadProfileImage,
);

export const userRoutes = router;
