import { Router } from "express";
import { UserRole } from "../../../prisma/generated/prisma/enums.js";
import { auth } from "../../middlewares/checkAuth.js";
import { patientControllers } from "./patient.controller.js";

const router = Router();

router.patch("/me", auth(UserRole.PATIENT), patientControllers.updatePatient);

export const patientRoutes = router;
