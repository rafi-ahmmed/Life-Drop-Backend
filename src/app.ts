import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./config/index.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { authRoutes } from "./module/auth/auth.route.js";
import "./config/passport.js";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import passport from "passport";
import { UserRole } from "../prisma/generated/prisma/enums.js";
import { prisma } from "./lib/prisma.js";
import { bloodRequestRoutes } from "./module/blood-request/blood-request.route.js";
import { donorRoutes } from "./module/donor/donor.route.js";
import { donorRequestRoutes } from "./module/donor-request/donor-request.route.js";
import { fundCampaignRoutes } from "./module/fund-campaign/fund-campaign.route.js";
import { patientRoutes } from "./module/patient/patient.route.js";
import { paymentRoutes } from "./module/payment/payment.route.js";
import { userRoutes } from "./module/user/user.route.js";
import { getHashPassword } from "./utils/password.js";

const app: Application = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/donors", donorRoutes);
app.use("/api/v1/blood-requests", bloodRequestRoutes);
app.use("/api/v1/donor-requests", donorRequestRoutes);
app.use("/api/v1/fund-campaigns", fundCampaignRoutes);
app.use("/api/v1/payments", paymentRoutes);

// For testing
app.post("/test", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payload = req.body;
		console.log(payload);

		const newPayload = await Promise.all(
			payload.map(async ({ user, donor }) => ({
				user: {
					...user,
					password: await getHashPassword(user.password),
				},
				donor: {
					...donor,
					dateOfBirth: new Date(`${donor.dateOfBirth}T00:00:00.000Z`),
				},
			})),
		);

		const result = await Promise.all(
			newPayload.map(({ user, donor }) =>
				prisma.user.create({
					data: {
						...user,
						role: UserRole.DONOR,
						donor: {
							create: donor,
						},
					},
				}),
			),
		);

		console.log(`${result.length} donors created successfully`);

		res.status(200).json({
			success: true,
			message: "Welcome to LifeDrop System Backend",
			data: "",
		});
	} catch (error) {
		console.log(error);
		next(error);
	}
});

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to LifeDrop System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
