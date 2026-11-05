"""
components/student.py: Student portal views for submitting permission requests and tracking history.
"""

import streamlit as st
import pandas as pd
from datetime import datetime, date
from database import create_permission_request, get_student_requests, get_faculty_list

def render_student_dashboard(user):
    """Renders the Student interface: Submit Request & History Tracking."""
    st.title("🎓 Student Permission Portal")
    st.caption(f"Logged in as **{user['full_name']}** ({user['reg_no']}) | Department: **{user['department']}**")

    # Metrics Summary
    requests = get_student_requests(user["id"])
    total = len(requests)
    approved = sum(1 for r in requests if r["status"] == "APPROVED")
    pending = sum(1 for r in requests if "PENDING" in r["status"])
    rejected = sum(1 for r in requests if r["status"] == "REJECTED")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Submitted", total)
    col2.metric("In Review", pending)
    col3.metric("Approved", approved)
    col4.metric("Rejected", rejected)

    st.markdown("---")

    tab1, tab2 = st.tabs(["📝 Submit New Request", "📋 Application History & Status"])

    # ---------------- TAB 1: FORM ----------------
    with tab1:
        st.subheader("Apply for Permission")
        with st.form("permission_form", clear_on_submit=True):
            col_type, col_faculty = st.columns(2)
            with col_type:
                request_type = st.selectbox(
                    "Request Category *",
                    ["On-Duty (OD)", "Leave Request", "Event Participation", "Other Permission"]
                )

            with col_faculty:
                faculty_options = get_faculty_list(user["department"])
                if not faculty_options:
                    faculty_options = get_faculty_list() # fallback to all faculty
                assigned_faculty = st.selectbox("Designated Faculty Mentor *", faculty_options)

            # Dates
            col_start, col_end = st.columns(2)
            with col_start:
                start_date = st.date_input("Start Date *", min_value=date.today())
            with col_end:
                end_date = st.date_input("End Date *", min_value=start_date)

            total_days = max(1, (end_date - start_date).days + 1)
            st.info(f"📅 Total Duration: **{total_days} Day(s)** (from {start_date} to {end_date})")

            reason = st.text_input("Reason for Request *", placeholder="e.g., Presenting research paper at National Hackathon")

            # Dynamic fields for OD and Event Participation
            event_name = None
            event_location = None
            organizing_inst = None

            if request_type in ["On-Duty (OD)", "Event Participation"]:
                st.markdown("##### 🏆 Event Details")
                col_e1, col_e2 = st.columns(2)
                with col_e1:
                    event_name = st.text_input("Event / Symposium Name *", placeholder="e.g., Smart India Hackathon 2026")
                with col_e2:
                    organizing_inst = st.text_input("Organizing Institution *", placeholder="e.g., IIT Madras")
                event_location = st.text_input("Event Venue / Location *", placeholder="e.g., IC&SR Auditorium, Chennai")

            details = st.text_area("Additional Description / Remarks (Optional)", placeholder="Provide any extra details or justifications for your approvers...")

            submit_btn = st.form_submit_button("Submit Permission Request", use_container_width=True, type="primary")

            if submit_btn:
                if not reason.strip():
                    st.error("Please provide a reason for the permission request.")
                elif request_type in ["On-Duty (OD)", "Event Participation"] and (not event_name or not event_location or not organizing_inst):
                    st.error("Please complete all event details (Name, Location, and Institution).")
                elif end_date < start_date:
                    st.error("End date cannot be prior to start date.")
                else:
                    req_data = {
                        "student_id": user["id"],
                        "student_name": user["full_name"],
                        "reg_no": user["reg_no"],
                        "department": user["department"],
                        "request_type": request_type,
                        "reason": reason,
                        "start_date": start_date,
                        "end_date": end_date,
                        "total_days": total_days,
                        "event_name": event_name,
                        "event_location": event_location,
                        "organizing_inst": organizing_inst,
                        "details": details,
                        "assigned_faculty": assigned_faculty
                    }
                    app_id = create_permission_request(req_data)
                    st.success(f"🎉 Application submitted successfully! Your tracking ID is **{app_id}**.")
                    st.rerun()

    # ---------------- TAB 2: HISTORY & TRACKING ----------------
    with tab2:
        st.subheader("Your Applications & Status Timeline")
        if not requests:
            st.info("No permission requests submitted yet. Use the 'Submit New Request' tab to apply.")
        else:
            # Table View
            table_data = []
            for r in requests:
                # Format friendly status
                status_badge = {
                    "PENDING_FACULTY": "⏳ Pending Faculty Review",
                    "PENDING_HOD": "⚠️ Pending HOD Sanction",
                    "APPROVED": "✅ Approved",
                    "REJECTED": "❌ Rejected"
                }.get(r["status"], r["status"])

                table_data.append({
                    "App ID": r["app_id"],
                    "Category": r["request_type"],
                    "Reason": r["reason"],
                    "Duration": f"{r['start_date']} ({r['total_days']}d)",
                    "Assigned Faculty": r["assigned_faculty"],
                    "Current Status": status_badge,
                    "Submitted On": r["created_at"][:10] if r["created_at"] else "N/A"
                })

            df = pd.DataFrame(table_data)
            st.dataframe(df, use_container_width=True, hide_index=True)

            st.markdown("#### 🔍 Detailed Multi-Stage Tracking")
            selected_app_id = st.selectbox("Select an Application to inspect its timeline:", [r["app_id"] for r in requests])
            selected_req = next((r for r in requests if r["app_id"] == selected_app_id), None)

            if selected_req:
                with st.expander(f"Audit Details for {selected_req['app_id']}", expanded=True):
                    st.write(f"**Request Category:** {selected_req['request_type']}")
                    st.write(f"**Reason:** {selected_req['reason']}")
                    st.write(f"**Dates:** {selected_req['start_date']} to {selected_req['end_date']} ({selected_req['total_days']} day(s))")
                    if selected_req['event_name']:
                        st.write(f"**Event:** {selected_req['event_name']} ({selected_req['organizing_inst']} @ {selected_req['event_location']})")

                    st.markdown("---")
                    st.markdown("##### 📌 Approval Hierarchy Timeline")

                    # Step 1: Student
                    st.markdown(f"1. **Student Submission:** Submitted on `{selected_req['created_at']}`")

                    # Step 2: Faculty
                    if selected_req['faculty_timestamp']:
                        f_badge = "✅ Recommended" if selected_req['status'] in ['PENDING_HOD', 'APPROVED'] else "❌ Rejected"
                        st.markdown(f"2. **Faculty Review ({selected_req['assigned_faculty']}):** {f_badge} on `{selected_req['faculty_timestamp']}`")
                        st.caption(f"Mentor Remarks: *\"{selected_req['faculty_remarks']}\"*")
                    elif selected_req['status'] == 'PENDING_FACULTY':
                        st.markdown(f"2. **Faculty Review ({selected_req['assigned_faculty']}):** ⏳ Awaiting Mentor Action")
                    else:
                        st.markdown(f"2. **Faculty Review:** Skipped / Not applicable")

                    # Step 3: HOD
                    if selected_req['hod_timestamp']:
                        h_badge = "✅ Final Sanction Granted" if selected_req['status'] == 'APPROVED' else "❌ Rejected"
                        st.markdown(f"3. **Head of Department (HOD):** {h_badge} on `{selected_req['hod_timestamp']}`")
                        st.caption(f"HOD Remarks: *\"{selected_req['hod_remarks']}\"*")
                    elif selected_req['status'] == 'PENDING_HOD':
                        st.markdown("3. **Head of Department (HOD):** ⚠️ Forwarded by faculty, awaiting departmental sanction")
                    elif selected_req['status'] == 'PENDING_FACULTY':
                        st.markdown("3. **Head of Department (HOD):** ⚪ In queue (awaits faculty endorsement first)")
                    else:
                        st.markdown(f"3. **Head of Department (HOD):** Closed")
