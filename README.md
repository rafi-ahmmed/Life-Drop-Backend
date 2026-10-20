<div align="left">

# LifeDrop 🩸

LifeDrop is a blood donation and emergency assistance platform designed to connect patients and hospitals with eligible blood donors during critical situations.

The platform helps users create blood requests, find matching donors based on blood group and location, notify available donors, manage donation responses, and track completed donations. It also includes hospital verification and a fundraising system to support patients with treatment-related expenses.

</div>

---

## 📌 About the Project
Life-Drop is a backend project for a blood donation and emergency assistance platform. It organizes donor information, blood requests, donor responses, fundraising campaigns, and payment records in one unified system.

The goal is to make blood-request workflows easier to manage and provide a robust foundation for connecting people who need blood with potential donors in real time.

---

## ✨ Core Features
- **Authentication & User Management** — User accounts, role-based authorization, authentication providers, and account status management.
- **Role-Based Profiles** — Separate, dedicated profiles for patients, donors, and hospitals.
- **Blood Requests** — Create and manage requests with details such as blood group, district, urgency level, required units, and needed date.
- **Donor Matching** — Organize donor responses to blood requests and track their status through the donation lifecycle.
- **Fundraising Campaigns** — Manage medical fundraising campaigns, target amounts, deadlines, verification documents, and review status.
- **Payment Records** — Safely record payment details and gateway responses for campaign contributions.
- **Admin Workflows** — Moderation tools for reviewing blood requests and fundraising campaigns, alongside user management.
- **Data Validation & Error Handling** — Structured request validation using Zod and consistent, type-safe API error responses.

---

## 🧰 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **TypeScript** | Type-safe application development |
| **Node.js** | JavaScript runtime environment |
| **Express.js** | REST API web framework |
| **PostgreSQL** | Relational database management system |
| **Prisma ORM** | Database access, queries, and schema migrations |
| **Zod** | Request body and parameters data validation |
| **Passport.js** | Authentication strategies (including Google OAuth) |
| **Redis** | Temporary data storage and fast caching |
| **bKash API** | Payment gateway integration |

---

## 🗂️ Database ER Diagram

The diagram below represents the database structure and relationships between the main entities.

[View Life-Drop Database ER Diagram](https://drawsql.app/teams/rafi-ahmmed/diagrams/lifedrop-blood-donation-system)

---

## 🧩 Main Data Models
- **User** — Shared account information, security credentials, role, provider, and account status.
- **PatientProfile** — Patient-specific contact and address information.
- **DonorProfile** — Donor blood group, geographic location, availability flag, and last donation date.
- **HospitalProfile** — Hospital metadata and verification details.
- **BloodRequest** — Detailed blood requirement, location, urgency level, required units, and review status.
- **DonorRequest** — Connects a donor with a specific blood request and tracks response lifecycle.
- **FundCampaign** — Campaign details, target vs. collected amounts, deadline, medical documents, and verification state.
- **Payments** — Campaign contribution records, transaction IDs, payment status, and gateway responses.

---

## 🔄 Example Blood Request Workflow
1. A patient or hospital submits a new blood request.
2. The request is verified according to platform verification rules.
3. Eligible donors are identified based on matching blood group, location, and availability.
4. Donors respond to the request notification.
5. Donation progress is tracked until the request is successfully fulfilled or closed.

---

## ⚙️ Getting Started

### Prerequisites
Ensure the following tools are installed on your environment:
- **Node.js** (LTS version recommended)
- **npm** / **yarn** / **pnpm**
- **PostgreSQL** instance
- **Git**

---

### Setup & Installation

1. **Install dependencies**
   ```bash
   npm install