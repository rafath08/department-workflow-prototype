"""
app.py: Main entry point for the Streamlit Intelligent Department Workflow Automation Agent.
"""

import streamlit as st
from database import init_db, authenticate_user
from components.student import render_student_dashboard
from components.faculty import render_faculty_dashboard
from components.hod_admin import render_hod_admin_dashboard

# Configure page settings
st.set_page_config(
    page_title="Department Workflow Automation Agent",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize database schema and seed mock users on first run
init_db()

# Initialize session state for user authentication
if "user" not in st.session_state:
    st.session_state["user"] = None

def login_user(username, password):
    """Attempts login and stores user profile in session state."""
    user = authenticate_user(username, password)
    if user:
        st.session_state["user"] = user
        st.rerun()
    else:
        st.error("Invalid username or password. Please try again.")

def logout_user():
    """Clears user session state to log out."""
    st.session_state["user"] = None
    st.rerun()

# ----------------- AUTHENTICATION VIEW -----------------
if st.session_state["user"] is None:
    st.markdown(
        """
        <div style="text-align: center; margin-top: 2rem; margin-bottom: 2rem;">
            <h1 style="color: #0369a1;">🏛️ Intelligent Department Workflow Automation Agent</h1>
            <p style="color: #64748b; font-size: 1.1rem;">
                Automated Multi-Level Permission Approvals (Student ➔ Faculty Mentor ➔ Head of Department)
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        # Quick Demo One-Click Access Box
        st.info("⚡ **Quick 1-Click Demo Login** (Select a role below to test instantly):")
        demo_col1, demo_col2, demo_col3 = st.columns(3)

        with demo_col1:
            if st.button("🎓 Student\n(Alex Rivera)", use_container_width=True):
                login_user("student1", "student123")

        with demo_col2:
            if st.button("👨‍🏫 Faculty Mentor\n(Dr. Robert Vance)", use_container_width=True):
                login_user("faculty1", "faculty123")

        with demo_col3:
            if st.button("🏛️ Admin / HOD\n(Prof. Jenkins)", use_container_width=True):
                login_user("hod1", "admin123")

        st.markdown("<br>", unsafe_allow_html=True)

        # Standard Login Form
        with st.form("login_form"):
            st.subheader("Account Sign In")
            username = st.text_input("Username", placeholder="e.g., student1, faculty1, hod1")
            password = st.text_input("Password", type="password", placeholder="••••••••")
            submit = st.form_submit_button("Sign In", use_container_width=True, type="primary")

            if submit:
                login_user(username, password)

        with st.expander("🔑 View Mock Credentials Reference"):
            st.markdown("""
            | Role | Username | Password | Full Name & Department |
            | :--- | :--- | :--- | :--- |
            | **Student** | `student1` | `student123` | Alex Rivera (CS2023-042, CSE) |
            | **Faculty** | `faculty1` | `faculty123` | Dr. Robert Vance (CSE Dept) |
            | **Admin / HOD** | `hod1` | `admin123` | Prof. Sarah Jenkins (HOD - CSE) |
            """)

# ----------------- AUTHENTICATED DASHBOARD -----------------
else:
    user = st.session_state["user"]

    # Sidebar Navigation & User Info
    with st.sidebar:
        st.markdown(f"### 🏛️ Workflow Agent")
        st.markdown(f"**{user['full_name']}**")
        st.caption(f"Role: **{user['role']}**")
        st.caption(f"Department: {user['department']}")
        if user.get("reg_no"):
            st.caption(f"Reg No: `{user['reg_no']}`")

        st.markdown("---")
        st.caption("Active Prototype: Python + Streamlit + SQLite")

        if st.button("🚪 Sign Out", use_container_width=True):
            logout_user()

    # Route to role-specific dashboard component
    if user["role"] == "Student":
        render_student_dashboard(user)
    elif user["role"] == "Faculty":
        render_faculty_dashboard(user)
    elif user["role"] == "Admin/HOD":
        render_hod_admin_dashboard(user)
    else:
        st.error("Unknown user role detected.")
