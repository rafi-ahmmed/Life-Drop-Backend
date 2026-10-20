<div align="center">

🩸 Life-Drop
Blood Donation & Emergency Assistance Platform
A backend API designed to help people find blood donors, manage blood requests, and support medical fundraising campaigns.

Built with TypeScript, Express.js, Prisma ORM, and PostgreSQL
</div>

📌 About the Project
Life-Drop is a backend project for a blood donation and emergency assistance platform. It organizes donor information, blood requests, donor responses, fundraising campaigns, and payment records in one system.

The goal is to make blood-request workflows easier to manage and provide a foundation for connecting people who need blood with potential donors.
✨ Core Features
- Authentication & User Management — user accounts, roles, authentication providers, and account status.
- Role-Based Profiles — separate patient, donor, and hospital profile data.
- Blood Requests — create and manage requests with blood group, district, urgency, required units, and needed date.
- Donor Matching — organize donor responses to blood requests and track their statuses.
- Fundraising Campaigns — manage campaigns, target amounts, deadlines, medical documents, and review status.
- Payment Records — store payment details and gateway responses for campaign contributions.
- Admin Workflow — support reviewing requests and campaigns and managing user status.
- Data Validation & Error Handling — structured request validation and consistent API error responses.
Feature availability depends on the current implementation. This README can be updated as more endpoints and workflows are completed.

🧰 Tech Stack
Technology	Purpose
TypeScript	Type-safe application development
Node.js	JavaScript runtime
Express.js	REST API framework
PostgreSQL	Relational database
Prisma ORM	Database access and schema management
Zod	Request data validation
Passport.js	Authentication strategies, including Google OAuth if configured
Redis	Temporary data or caching, where implemented
bKash	Payment integration, where implemented


🗂️ Database ER Diagram
The diagram below represents the database structure and relationships between the main entities.
<!-- Add your ER diagram image to docs/er-diagram.png, then uncomment the next line. -->
<!-- ![Life-Drop Database ER Diagram](./docs/er-diagram.png) -->


ER diagram placeholder: Add your diagram image at docs/er-diagram.png and uncomment the image line above.
🧩 Main Data Models
- User — shared account information, role, authentication provider, and account status.
- PatientProfile — patient-specific contact and address information.
- DonorProfile — donor blood group, location, availability, and last donation date.
- HospitalProfile — hospital information and verification-related details.
- BloodRequest — blood need, location, urgency, required units, and review status.
- DonorRequest — connects a donor with a blood request and tracks the response status.
- FundCampaign — fundraising details, target and collected amounts, deadline, medical documents, and review status.
- Payments — campaign payment records, transaction details, payment status, and gateway response.
🔄 Example Blood Request Workflow
1. A patient or hospital submits a blood request.
2. The request is reviewed according to the application's verification rules.
3. Eligible donors can be identified using blood group, location, and availability.
4. Donors respond to the request.
5. The donation progress is tracked until the request is fulfilled or reaches another final status.
⚙️ Getting Started
Prerequisites
Install the following before running the project:
- Node.js (use a version supported by the project)
- npm
- PostgreSQL
- Git
1. Clone the repository
git clone https://github.com/rafi-ahmmed/Life-Drop-Backend.git
cd Life-Drop-Backend
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file in the project root and add the variables required by your application. Example names are shown below; adjust them to match your actual configuration.
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
FRONTEND_URL="your_frontend_url"

# Add other required values used by your project:
# JWT / token secrets
# Google OAuth credentials
# Redis connection
# Email SMTP credentials
# Cloudinary credentials
# bKash credentials
Important: Use your actual environment variable names from the project configuration. Never commit .env files, credentials, access tokens, or private keys to GitHub.
4. Generate the Prisma Client
Run the Prisma generation command configured for this project:
npx prisma generate
5. Set up the database
If the project uses Prisma Migrate, apply the existing migrations:
npx prisma migrate dev
Use the migration workflow appropriate to your environment. For production deployments, apply committed migrations with npx prisma migrate deploy.
6. Run the server
Use the development or production scripts defined in package.json. For example, if these scripts exist:
npm run dev
npm run build
npm start
🔐 Security Considerations
- Validate incoming request data.
- Hash passwords before storing them.
- Keep secrets in environment variables.
- Use secure authentication and authorization checks.
- Apply rate limiting to protect sensitive endpoints.
- Verify payment status with the payment provider before marking a payment as paid.
- Restrict administrative actions to authorized roles.
🛣️ Roadmap
- [ ] Complete and document API endpoints.
- [ ] Improve donor matching and eligibility checks.
- [ ] Complete blood-request lifecycle management.
- [ ] Complete fundraising campaign review workflows.
- [ ] Verify payment callback and transaction handling.
- [ ] Add automated tests and API documentation.
- [ ] Add deployment and monitoring documentation.
👨‍💻 Author
Rafi Ahmmed Siyam
- GitHub: @rafi-ahmmed
- Portfolio: rafi-ahmmed.vercel.app
- LinkedIn: Rafi Ahmmed
<div align="center">

Made with ❤️ to support blood donation and emergency assistance.
</div>