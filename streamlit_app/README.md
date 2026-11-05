# Intelligent Department Workflow Automation Agent (Python + Streamlit + SQLite)

A clean, modular prototype built with **Python**, **Streamlit**, and **SQLite** for institutional permission requests and multi-level approval hierarchies.

---

## 📁 Folder Structure

```
streamlit_app/
│
├── app.py                     # Main Streamlit application entry point & role dispatcher
├── database.py                # SQLite database setup, DDL schema, queries, and mock seeder
├── requirements.txt           # Python dependencies
├── README.md                  # Setup & usage instructions
│
└── components/
    ├── __init__.py            # Package initialization
    ├── student.py             # Student dashboard: request form & live approval history
    ├── faculty.py             # Faculty mentor dashboard: review, recommend & reject actions
    └── hod_admin.py           # HOD/Admin dashboard: department queue, final sanction & analytics
```

---

## 🗄️ Database Schema (SQLite)

The application automatically creates and seeds `workflow_agent.db` on first run using the following DDL queries:

```sql
-- 1. Users Table (Authentication & Role-Based Access)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Student', 'Faculty', 'Admin/HOD')),
    department TEXT NOT NULL,
    reg_no TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Permission Requests Table (Multi-Level Approval Pipeline)
CREATE TABLE IF NOT EXISTS permission_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT UNIQUE NOT NULL,
    student_id INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    reg_no TEXT NOT NULL,
    department TEXT NOT NULL,
    request_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_days INTEGER NOT NULL,
    event_name TEXT,
    event_location TEXT,
    organizing_inst TEXT,
    details TEXT,
    assigned_faculty TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PENDING_FACULTY', 'PENDING_HOD', 'APPROVED', 'REJECTED')),
    faculty_remarks TEXT,
    faculty_timestamp TEXT,
    hod_remarks TEXT,
    hod_timestamp TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
);
```

---

## 🔑 Mock Credentials (1-Click Login Supported)

The login screen features 1-click quick login buttons as well as standard manual credential authentication:

| Role | Username | Password | Full Name | Department | Registration No |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student** | `student1` | `student123` | Alex Rivera | Computer Science & Eng. | `CS2023-042` |
| **Faculty Mentor** | `faculty1` | `faculty123` | Dr. Robert Vance | Computer Science & Eng. | *N/A* |
| **Admin / HOD** | `hod1` | `admin123` | Prof. Sarah Jenkins | Computer Science & Eng. | *N/A* |

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
pip install -r streamlit_app/requirements.txt
```

### 2. Launch Streamlit Application
```bash
cd streamlit_app
streamlit run app.py
```
The application will launch automatically in your browser at:
$$\text{http://localhost:8501}$$

---

## 🔄 Multi-Level Workflow Walkthrough

1. **Student Submission:**
   - Log in as **Student** (`student1` / `student123`).
   - Fill in request type (e.g. **On-Duty (OD)**). Notice dynamic event fields appearing.
   - Choose mentor **Dr. Robert Vance**, select dates, provide reason, and submit.
   - A unique Application ID (`APP-2026-XXXX`) is assigned with initial status `PENDING_FACULTY`.

2. **Faculty Review:**
   - Log out and log in as **Faculty Mentor** (`faculty1` / `faculty123`).
   - The pending request appears in your review console.
   - Enter your endorsement remarks and click **Recommend to HOD**.
   - Status advances to `PENDING_HOD`.

3. **HOD Final Sanction:**
   - Log out and log in as **Admin / HOD** (`hod1` / `admin123`).
   - The forwarded request is waiting in the Department Queue.
   - Enter official sanction remarks and click **Grant Final Approval**.
   - Status updates to `APPROVED`.

4. **Student Verification & Audit:**
   - Log back in as **Student** (`student1`).
   - Switch to the **Application History & Status** tab.
   - Inspect the interactive timeline showing each approver's identity, timestamps, remarks, and final sanctioned status!
