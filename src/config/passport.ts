import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "../lib/prisma.js";

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

				console.log(user);

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
