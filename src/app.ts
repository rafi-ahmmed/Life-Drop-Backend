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
import helmet from "helmet";
import passport from "passport";
import { UserRole } from "../prisma/generated/prisma/enums.js";
import { auth } from "./middlewares/checkAuth.js";
import { patientRoutes } from "./module/patient/patient.route.js";
import { userRoutes } from "./module/user/user.route.js";

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
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/patient", auth(UserRole.PATIENT), patientRoutes);

// For testing
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
	try {
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
