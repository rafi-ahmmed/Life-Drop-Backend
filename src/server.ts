import chalk from "chalk";
import app from "./app.js";
import config from "./config/index.js";
import { prisma } from "./lib/prisma.js";
import { seedAdmin, seedSuperAdmin } from "./utils/seed.js";

const PORT = config.port;

async function main() {
	try {
		await prisma.$connect();
		console.log(chalk.blueBright("Prisma postgres is connected!"));
		app.listen(PORT, () => {
			console.log(chalk.greenBright(`Server is running on port ${PORT}`));
		});
		await seedSuperAdmin();
		await seedAdmin();
	} catch (error) {
		console.log(chalk.red("Error starting the server", error));
		await prisma.$disconnect();
		process.exit(1);
	}
}

main();
