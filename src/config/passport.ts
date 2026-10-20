import bcrypt from "bcryptjs";
import passport from "passport";
import {
	Strategy as GoogleStrategy,
	type Profile,
	type VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import {
	AuthProvider,
	UserRole,
} from "../../prisma/generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import config from "./index.js";

passport.use(
	new LocalStrategy(
		{ usernameField: "email", passwordField: "password" },
		async (email, password, done) => {
			try {
				const user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user) {
					return done(null, false, { message: "User not found." });
				}

				if (user.authProvider === AuthProvider.GOOGLE && user.googleId) {
					return done(null, false, {
						message:
							"This account uses Google Sign-In. Please continue with Google.",
					});
				}

				const isPasswordValid = await bcrypt.compare(
					password,
					String(user.password),
				);

				if (!isPasswordValid) {
					return done(null, false, { message: "Incorrect password." });
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

passport.use(
	new GoogleStrategy(
		{
			clientID: config.google_client_id,
			clientSecret: config.google_client_secret,
			callbackURL: config.google_client_callback_url,
		},
		async (
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			done: VerifyCallback,
		) => {
			// console.log("google-Profile==", profile);

			try {
				const email = profile.emails?.[0]?.value;

				if (!email) {
					return done(null, false, { message: "No email found from google" });
				}

				let user = await prisma.user.findUnique({
					where: {
						email,
					},
					include: {
						patient: true,
					},
				});

				if (user) {
					if (user.role !== UserRole.PATIENT) {
						return done(
							new Error(
								"Google authentication is only available for patients.",
							),
						);
					}
					if (
						!user.googleId &&
						user.authProvider === AuthProvider.CREDENTIALS
					) {
						user = await prisma.user.update({
							where: {
								id: user.id,
							},
							data: {
								googleId: profile.id,
							},
							include: {
								patient: true,
							},
						});
						return done(null, user);
					}

					return done(null, user);
				}

				user = await prisma.user.create({
					data: {
						email,
						name: profile?.displayName,
						authProvider: AuthProvider.GOOGLE,
						googleId: profile.id,
						isVerified: true,
						image: profile.photos?.[0]?.value,
					},
					include: {
						patient: true,
					},
				});

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);
