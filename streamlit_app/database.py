"""
database.py: Database connection, schema definitions, and query helpers for SQLite.
"""

import sqlite3
import hashlib
from datetime import datetime, timedelta

DB_FILE = "workflow_agent.db"

def get_connection():
    """Returns an active SQLite database connection with row factory enabled."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Simple SHA-256 password hash for prototype security."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    """Initializes tables and seeds initial mock users and test applications."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
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
    """)

    # 2. Permission Requests Table
    cursor.execute("""
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
    """)

    conn.commit()

    # 3. Seed Mock Users if not present
    cursor.execute("SELECT COUNT(*) FROM users;")
    if cursor.fetchone()[0] == 0:
        mock_users = [
            ("student1", hash_password("student123"), "Alex Rivera", "Student", "Computer Science & Engineering", "CS2023-042"),
            ("student2", hash_password("student123"), "Maria Chen", "Student", "Electronics & Communication", "EC2023-088"),
            ("faculty1", hash_password("faculty123"), "Dr. Robert Vance", "Faculty", "Computer Science & Engineering", None),
            ("faculty2", hash_password("faculty123"), "Dr. Alan Turing", "Faculty", "Electronics & Communication", None),
            ("hod1", hash_password("admin123"), "Prof. Sarah Jenkins", "Admin/HOD", "Computer Science & Engineering", None),
        ]
        cursor.executemany("""
            INSERT INTO users (username, password_hash, full_name, role, department, reg_no)
            VALUES (?, ?, ?, ?, ?, ?);
        """, mock_users)
        conn.commit()

        # Seed sample requests
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        past_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
        future_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")

        mock_requests = [
            (
                "APP-2026-0001", 1, "Alex Rivera", "CS2023-042", "Computer Science & Engineering",
                "On-Duty (OD)", "National AI Hackathon Grand Finale",
                future_date, future_date, 1,
                "Smart India Hackathon", "IIT Bombay", "Ministry of Education",
                "Selected for 36-hour offline round", "Dr. Robert Vance",
                "PENDING_FACULTY", None, None, None, None, now_str
            ),
            (
                "APP-2026-0002", 1, "Alex Rivera", "CS2023-042", "Computer Science & Engineering",
                "Leave Request", "Medical Leave - Viral Fever",
                past_date, past_date, 1,
                None, None, None,
                "Doctor consultation prescription attached", "Dr. Robert Vance",
                "APPROVED", "Verified medical prescription", now_str, "Approved by HOD", now_str, now_str
            ),
            (
                "APP-2026-0003", 2, "Maria Chen", "EC2023-088", "Electronics & Communication",
                "Event Participation", "Robotics Drone Racing League",
                future_date, future_date, 1,
                "AeroTech 2026", "IISc Bangalore", "Robotics Club",
                "Representing college quadcopter team", "Dr. Alan Turing",
                "PENDING_HOD", "Recommended by faculty mentor", now_str, None, None, now_str
            )
        ]

        cursor.executemany("""
            INSERT INTO permission_requests (
                app_id, student_id, student_name, reg_no, department,
                request_type, reason, start_date, end_date, total_days,
                event_name, event_location, organizing_inst, details,
                assigned_faculty, status, faculty_remarks, faculty_timestamp,
                hod_remarks, hod_timestamp, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, mock_requests)
        conn.commit()

    conn.close()

# ----------------- Query Helpers -----------------

def authenticate_user(username, password):
    """Verifies username and password hash against users table."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, full_name, role, department, reg_no
        FROM users
        WHERE username = ? AND password_hash = ?;
    """, (username, hash_password(password)))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_faculty_list(department=None):
    """Retrieves list of faculty members optionally filtered by department."""
    conn = get_connection()
    cursor = conn.cursor()
    if department:
        cursor.execute("SELECT full_name FROM users WHERE role = 'Faculty' AND department = ?;", (department,))
    else:
        cursor.execute("SELECT full_name FROM users WHERE role = 'Faculty';")
    faculty = [row["full_name"] for row in cursor.fetchall()]
    conn.close()
    return faculty

def create_permission_request(data):
    """Inserts a new permission request into SQLite and returns the generated app_id."""
    conn = get_connection()
    cursor = conn.cursor()

    # Generate sequential unique App ID
    cursor.execute("SELECT COUNT(*) FROM permission_requests;")
    count = cursor.fetchone()[0] + 1
    app_id = f"APP-2026-{count:04d}"

    cursor.execute("""
        INSERT INTO permission_requests (
            app_id, student_id, student_name, reg_no, department,
            request_type, reason, start_date, end_date, total_days,
            event_name, event_location, organizing_inst, details,
            assigned_faculty, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_FACULTY');
    """, (
        app_id, data["student_id"], data["student_name"], data["reg_no"], data["department"],
        data["request_type"], data["reason"], str(data["start_date"]), str(data["end_date"]), data["total_days"],
        data.get("event_name"), data.get("event_location"), data.get("organizing_inst"), data.get("details"),
        data["assigned_faculty"]
    ))
    conn.commit()
    conn.close()
    return app_id

def get_student_requests(student_id):
    """Fetches all applications submitted by a specific student."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM permission_requests
        WHERE student_id = ?
        ORDER BY id DESC;
    """, (student_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_pending_requests_for_faculty(faculty_name):
    """Fetches requests assigned to a specific faculty member awaiting their action."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM permission_requests
        WHERE assigned_faculty = ? AND status = 'PENDING_FACULTY'
        ORDER BY id DESC;
    """, (faculty_name,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_all_requests_for_faculty(faculty_name):
    """Fetches all requests associated with a faculty mentor."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM permission_requests
        WHERE assigned_faculty = ?
        ORDER BY id DESC;
    """, (faculty_name,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_pending_requests_for_hod(department):
    """Fetches requests forwarded to HOD in their department."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM permission_requests
        WHERE department = ? AND status = 'PENDING_HOD'
        ORDER BY id DESC;
    """, (department,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_all_requests(department=None):
    """Fetches all applications for institutional reporting and admin analytics."""
    conn = get_connection()
    cursor = conn.cursor()
    if department:
        cursor.execute("SELECT * FROM permission_requests WHERE department = ? ORDER BY id DESC;", (department,))
    else:
        cursor.execute("SELECT * FROM permission_requests ORDER BY id DESC;")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def update_request_status(request_id, new_status, remarks, role):
    """Updates status and records timestamped remarks for Faculty or HOD."""
    conn = get_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if role == "Faculty":
        cursor.execute("""
            UPDATE permission_requests
            SET status = ?, faculty_remarks = ?, faculty_timestamp = ?
            WHERE id = ?;
        """, (new_status, remarks, timestamp, request_id))
    elif role == "Admin/HOD":
        cursor.execute("""
            UPDATE permission_requests
            SET status = ?, hod_remarks = ?, hod_timestamp = ?
            WHERE id = ?;
        """, (new_status, remarks, timestamp, request_id))

    conn.commit()
    conn.close()
