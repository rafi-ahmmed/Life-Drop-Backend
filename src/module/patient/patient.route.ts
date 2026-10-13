import { Router } from "express";
import { ro } from "zod/locales";
import { patientControllers } from "./patient.controller.js";

const router = Router();

router.patch("/me", patientControllers.updatePatient);

export const patientRoutes = router;
