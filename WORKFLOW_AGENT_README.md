# Intelligent Department Workflow Automation Agent

A production-grade, full-stack institutional web application built to digitize, streamline, and automate student permission requests and multi-level approval hierarchies within academic colleges and universities.

---

## 🌟 Key Highlights & Capabilities

- **Multi-Level Approval Hierarchy:** Student submits request $\rightarrow$ Assigned Faculty Mentor reviews $\rightarrow$ Head of Department (HOD) reviews $\rightarrow$ Final Sanction.
- **Dynamic Form Fields:** Automatically toggles specialized event fields (Event Name, Location, Organizing Institution, Student Description) when selecting **On-Duty (OD)** or **Event Participation**, alongside standard **Leave Request** and **Other Permission** forms.
- **Visual Application Status Tracking:** Interactive multi-stage timeline showing approver names, action timestamps, approval/rejection badges, and review remarks at every stage.
- **In-App Notification Engine:** Real-time notifications for application submission, pending reviews, HOD forwardings, approvals, and rejections, featuring an unread counter badge and mark-as-read controls.
- **Automated Reminder Cron Scheduler:** Background hourly task scanning applications pending review for over 24–48 hours and dispatching priority reminders to approvers.
- **Administrative Command Center:** Interactive **Recharts** visualizations (Category breakdown, Monthly velocity trends, Department distribution, Status ratios), User Account Management (CRUD), and dynamic Workflow Rule Configuration.
- **Audit-Compliant Digital Record Management:** Centralized history with search, filtering (status, category, department, date range), pagination, and instant **CSV Data Export**.
- **Zero-Friction Zero-Config Deployment:** Seamless dual-mode database layer: connects to local/Atlas MongoDB when specified, or automatically spins up an in-memory embedded MongoDB engine with seed data for out-of-the-box demonstration!

---

## 🏗️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 & Vite | Blazing fast SPA with modular architecture |
| **Styling** | Tailwind CSS & PostCSS | Institutional blue/slate color palette & responsive UI |
| **Icons & UI** | Lucide React | Modern institutional icon set |
| **Data Visualization** | Recharts | Bar charts, Area trends, and Donut charts |
| **Routing & Client API** | React Router v6 & Axios | Declarative routing and authenticated API requests |
| **Backend Runtime** | Node.js (v24+) & Express.js | High-throughput REST API with centralized error handling |
| **Authentication** | JWT & bcryptjs | Role-based token authentication & password encryption |
| **Database & ODM** | MongoDB & Mongoose | Flexible document schema with referential integrity |
| **Embedded DB Engine** | MongoMemoryServer | In-memory MongoDB instance for zero-dependency local runs |
| **Background Scheduler** | node-cron | Automated hourly reminder triggers for pending requests |
| **File Handling** | Multer | Supporting document uploads (PDF, DOCX, Images) |

---

## 👥 Demo User Credentials (One-Click Login Supported)

The login screen includes **Quick Demo One-Click Access** buttons to immediately test any role without manual typing:

| Role | Email | Password | Name & Department |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `Student@123` | Alex Rivera (CS2023-042, CSE, Year III) |
| **Faculty Mentor** | `faculty@college.edu` | `Faculty@123` | Dr. Robert Vance (CSE Department) |
| **Head of Department (HOD)** | `hod@college.edu` | `Hod@123` | Prof. Sarah Jenkins (HOD - CSE) |
| **Administrator** | `admin@college.edu` | `Admin@123` | System Administrator |

*Additional Seeded Accounts:*
- Student 2: `maria@college.edu` / `Student@123` (Maria Chen, ECE)
- Faculty 2: `alan@college.edu` / `Faculty@123` (Dr. Alan Turing, ECE)
- HOD 2: `hod.ece@college.edu` / `Hod@123` (Prof. David Miller, HOD - ECE)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed on your machine.
- Optional: MongoDB installed locally or MongoDB Atlas connection string (if omitted, the embedded MongoDB server starts automatically).

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:5000` and automatically populates the database with institutional seed records on first launch.

### 3. Frontend Setup (Development Mode)
```bash
cd frontend
npm install
npm run dev
```
Access the development interface at `http://localhost:5173`. Requests to `/api` and `/uploads` are automatically proxied to the backend at port 5000.

### 4. Production Single-Port Serving
The frontend has already been built into `frontend/dist`. Running `node server.js` in the `backend` directory serves both the REST API and the frontend application together directly at:
$$\text{http://localhost:5000}$$

---

## 📋 Multi-Level Workflow Demonstration Scenario

You can test the entire multi-level workflow manually in the web browser or run the automated scenario test:

```bash
cd backend
node test_workflow_scenario.js
```

### Manual Testing Walkthrough:
1. **Student Submission:**
   - Log in as **Student** (`student@college.edu`).
   - Click **Apply for Permission** or navigate to **Submit Permission**.
   - Select **On-Duty (OD)**. Notice how event fields (Event Name, Location, Organizing Institution) dynamically appear.
   - Select mentor **Dr. Robert Vance**, fill out event details, and submit.
   - Notice the application ID (e.g. `APP-2026-0005`) generated with initial status `PENDING_FACULTY`.
2. **Faculty Review:**
   - Log in as **Faculty** (`faculty@college.edu`).
   - The application appears in the **Pending Reviews** queue.
   - Click **Recommend** (Approve), enter remarks ("Credentials verified, recommended for approval"), and submit.
   - Application status updates to `PENDING_HOD` and moves to completed records.
3. **HOD Final Sanction:**
   - Log in as **HOD** (`hod@college.edu`).
   - The application appears in the **Forwarded Queue** with faculty endorsement details.
   - Click **Sanction** (Approve), enter HOD remarks ("Approved for attendance compensation"), and confirm.
   - Application status updates to `APPROVED`.
4. **Student Verification:**
   - Log in back as **Student**.
   - Notice the notification bell with celebration indicator.
   - Open the application to inspect the **Interactive Visual Timeline**, displaying all approvers, timestamps, remarks, and final sanctioned status.
5. **Admin Monitoring:**
   - Log in as **Administrator** (`admin@college.edu`).
   - View updated analytical metrics, charts by request category, department velocity, and export the comprehensive audit trail to CSV via **Export CSV**.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create student or faculty account
- `POST /api/auth/login` - Authenticate user & return JWT token
- `GET /api/auth/me` - Get active authenticated user profile
- `GET /api/auth/mentors` - List available faculty mentors by department

### Applications & Workflows
- `POST /api/applications` - Submit permission request with optional file upload (Multer)
- `GET /api/applications` - List applications (filtered automatically by role & query)
- `GET /api/applications/:id` - Fetch single application with full `ApprovalHistory` timeline
- `PUT /api/applications/:id/approve` - Approve request with approver remarks (Faculty / HOD)
- `PUT /api/applications/:id/reject` - Reject request with mandatory reason
- `GET /api/applications/statistics` - Summary metric counts for dashboard
- `GET /api/applications/history` - Filtered, sorted, paginated history with date ranges

### Notifications
- `GET /api/notifications` - Get user's notifications & unread count
- `PUT /api/notifications/:id/read` - Mark single notification as read
- `PUT /api/notifications/read-all` - Mark all user notifications as read

### Administration
- `GET /api/admin/users` - List all user accounts with search & filters
- `POST /api/admin/users` - Create user account
- `PUT /api/admin/users/:id` - Update user account details & status
- `DELETE /api/admin/users/:id` - Remove user account
- `GET /api/admin/workflow-configs` - Get approval rules per request category
- `PUT /api/admin/workflow-configs/:requestType` - Toggle faculty/HOD requirements
- `GET /api/admin/reports` - Comprehensive analytical report for Recharts
- `GET /api/admin/export` - Export applications as formatted CSV file

---

## 🗄️ Database Schemas

1. **User:** `name`, `email`, `password` (bcrypt), `role` (`student`, `faculty`, `hod`, `admin`), `regNo`, `department`, `year`, `section`, `mentor` (ref User), `phone`, `isActive`.
2. **Application:** `applicationId`, `student` (ref User), `studentName`, `regNo`, `department`, `year`, `section`, `requestType` (OD, Leave, Event, Other), `reason`, `startDate`, `endDate`, `totalDays`, `additionalDescription`, `eventDetails`, `documents`, `assignedFaculty`, `status`, `currentStage`, `facultyApproval`, `hodApproval`, `rejectionRemarks`, `rejectionBy`.
3. **ApprovalHistory:** `application` (ref Application), `applicationId`, `actor` (ref User), `actorName`, `actorRole`, `action` (`SUBMITTED`, `FACULTY_APPROVED`, `FACULTY_REJECTED`, `HOD_APPROVED`, `HOD_REJECTED`), `previousStatus`, `newStatus`, `remarks`, `timestamp`.
4. **Notification:** `recipient` (ref User), `title`, `message`, `type`, `application` (ref Application), `applicationId`, `isRead`, `createdAt`.
5. **Department:** `name`, `code`, `hod` (ref User), `description`.
6. **WorkflowConfiguration:** `requestType`, `requiresFacultyApproval`, `requiresHodApproval`, `autoEscalateHours`, `description`.
