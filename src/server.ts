import chalk from "chalk";
import app from "./app.js";
import config from "./config/index.js";
import { emailTransporter } from "./lib/nodemailer.js";
import { prisma } from "./lib/prisma.js";
import { redisClient } from "./lib/redis.js";
import { seedAdmin, seedSuperAdmin } from "./utils/seed.js";

const PORT = config.port;

async function main() {
	try {
		app.listen(PORT, () => {
			console.log(chalk.greenBright(`Server is running on port ${PORT}`));
		});

		await prisma.$connect();
		console.log(chalk.blueBright("Prisma postgres is connected!"));

		await redisClient.connect();
		console.log(chalk.blueBright("Redis is connected!"));

		await emailTransporter.verify();
		console.log(chalk.blueBright("Nodemailer is connected!"));

		await seedSuperAdmin();
		await seedAdmin();
	} catch (error) {
		console.log(chalk.red("Error starting the server", error));
		await prisma.$disconnect();
		process.exit(1);
	}
}

main();
