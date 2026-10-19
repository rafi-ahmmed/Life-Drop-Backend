import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import upload from "../../lib/multer.js";
import { auth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { fundCampaignControllers } from "./fund-campaign.controller.js";
import { fundCampaignValidation } from "./fund-campaign.validation.js";

const router = Router();

router.post(
	"/create-campaign",
	upload.fields([
		{ name: "prescription", maxCount: 2 },
		{ name: "medicalReport", maxCount: 3 },
	]),
	auth(UserRole.PATIENT, UserRole.HOSPITAL),
	fundCampaignControllers.createCampaign,
);

export const fundCampaignRoutes = router;
