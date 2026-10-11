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
import passport from "passport";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/api/v1/auth", authRoutes);

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
