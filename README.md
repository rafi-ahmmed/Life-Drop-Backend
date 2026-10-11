# LifeDrop 🩸

**LifeDrop** is a blood donation and emergency assistance platform designed to connect patients and hospitals with eligible blood donors during critical situations.

The platform helps users create blood requests, find matching donors based on blood group and location, notify available donors, manage donation responses, and track completed donations. It also includes hospital verification and a fundraising system to support patients with treatment-related expenses.

## ✨ Features

### 🩸 Blood Donation

* Donor registration with blood group and location
* Donor availability management
* Last donation date tracking
* Blood request creation for patients and hospitals
* Blood group and location-based donor matching
* Donor response system
* Donation history tracking
* Request status management

### 🚨 Emergency Blood Requests

* Create urgent and critical blood requests
* Match requests with available donors
* Notify relevant donors about new requests
* Donors can respond to blood requests
* Track request progress from creation to completion

### 🏥 Hospital Management

* Hospital account registration
* Hospital profile management
* Hospital verification by Admin
* Verification status tracking
* Hospitals can create and manage blood requests
* Manage donor responses for their requests

### 🔔 Notification System

Donors and other relevant users can receive notifications for events such as:

* New matching blood requests
* Donor responses
* Blood request updates
* Request fulfillment or cancellation
* Hospital verification updates

### 💰 Patient Fundraising

* Patients can create fundraising campaigns for treatment expenses
* Admin reviews and verifies campaigns
* Approved campaigns are published
* Users can contribute to campaigns
* Support payments through available payment gateways
* Track campaign target and collected amount

### 🔐 Authentication & Authorization

* Credential-based authentication
* Google authentication for Patients
* Role-based access control
* Protected routes and APIs
* Separate dashboards based on user roles

### 👥 User Roles

The platform supports five roles:

* **Donor** — Manage donor profile, availability, matching requests, and donation history
* **Patient** — Create blood requests and fundraising campaigns
* **Hospital** — Manage hospital profile, verification, and blood requests
* **Admin** — Verify hospitals, review requests and fundraising campaigns, and manage platform activities
* **Super Admin** — Manage administrators and perform higher-level platform administration

---

## 🔄 Blood Donation Workflow

```text
Patient / Hospital
        │
        │ Create Blood Request
        ▼
   BloodRequest
        │
        ▼
  Donor Matching
        │
        ├── Matching Donor 1
        ├── Matching Donor 2
        └── Matching Donor 3
                │
                ▼
          Notification
                │
                ▼
        Donor Dashboard
                │
                │ "I Want to Donate"
                ▼
        DonorResponse
                │
                ▼
       Contact / Scheduling
                │
                ▼
       Actual Blood Donation
                │
                ▼
        Donation Confirmation
                │
                ▼
       Donation History Updated
```

## 🧑‍💻 Donor Flow

```text
Register
   ↓
Create Donor Profile
   ↓
Select Blood Group
   ↓
Set Location & Availability
   ↓
Add Last Donation Date
   ↓
Donor Dashboard
   ↓
Receive Matching Requests
   ↓
View Request
   ↓
"I Want to Donate"
   ↓
Donation
```

The `availability` field represents whether a donor currently wants to receive donation requests.

The `lastDonationAt` field stores the donor's most recent confirmed donation date and can be used by the platform's donation-eligibility/business rules.

---

### Main Tables

| Table              | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `User`             | Common authentication and role information                   |
| `PatientProfile`   | Additional patient information                               |
| `DonorProfile`     | Blood group, location, availability and donation information |
| `Hospital`         | Hospital information and verification                        |
| `BloodRequest`     | Blood donation requests                                      |
| `DonorResponse`    | Donor responses to blood requests                            |
| `Donation`         | Confirmed blood donation records                             |
| `Notification`     | User notifications                                           |
| `FundCampaign`     | Patient fundraising campaigns                                |
| `Payment`          | Payment transaction records                                  |

---

## 🛠️ Technology Stack

### Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS
* Shadcn UI

### Backend

* Node.js
* Express.js
* TypeScript
* Passport.js
* JWT

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* Credential Authentication
* Google OAuth
* Passport.js

### Payment

* bKash
* SSLCommerz

---

## 🔐 Security

The platform follows several security practices:

* Password hashing
* JWT-based authentication
* Role-based authorization
* Protected API routes
* Server-side input validation
* Unique email validation
* Secure payment verification
* Hospital verification before approval
* Private handling of medical documents
* Sensitive patient information is not exposed publicly

---

## 📌 Core Business Rules

* A user can have only one primary role.
* Donor, Patient and Hospital profiles are connected to the `User` table through one-to-one relationships.
* A donor must have a blood group.
* Donor availability can be enabled or disabled.
* `lastDonationAt` is updated after a confirmed donation.
* A donor cannot create duplicate responses for the same blood request.
* Blood requests must be approved before becoming publicly active when moderation is required.
* Hospitals must be verified before accessing hospital-specific platform functionality.
* Actual donation confirmation is handled by an authorized party.
* Fundraising campaigns require administrative review before publication.
* Payment status is verified on the server before recording a successful contribution.

---

## 🎯 Project Goals

The main goals of LifeDrop are to:

* Make blood donation requests easier to find
* Connect donors with relevant blood requests
* Reduce the time required to find potential donors
* Provide hospitals with a structured request management system
* Improve transparency through request and donation tracking
* Provide a secure platform for patient fundraising

---

## 🔮 Future Improvements

* Real-time notifications using WebSockets
* Location/radius-based donor matching
* Advanced donor recommendation system
* SMS notifications
* Email notifications
* Donor reputation and reliability tracking
* Hospital and donor analytics
* Admin reporting dashboard
* Fund disbursement tracking
* Mobile application

---

## 👨‍💻 Developer

**Rafi Ahmmed Siyam**

Full-Stack Web Developer

Built with **Next.js, TypeScript, Node.js, Express.js, PostgreSQL and Prisma**.
