"""
components/faculty.py: Faculty Mentor portal for reviewing, recommending, or rejecting assigned requests.
"""

import streamlit as st
import pandas as pd
from database import get_pending_requests_for_faculty, get_all_requests_for_faculty, update_request_status

def render_faculty_dashboard(user):
    """Renders the Faculty Mentor review console."""
    st.title("👨‍🏫 Faculty / Mentor Approval Console")
    st.caption(f"Logged in as **{user['full_name']}** | Department: **{user['department']}**")

    pending_requests = get_pending_requests_for_faculty(user["full_name"])
    all_requests = get_all_requests_for_faculty(user["full_name"])

    # Quick Metrics
    col1, col2, col3 = st.columns(3)
    col1.metric("Pending Review", len(pending_requests))
    col2.metric("Forwarded / Recommended", sum(1 for r in all_requests if r["faculty_remarks"] and r["status"] in ["PENDING_HOD", "APPROVED"]))
    col3.metric("Total Assigned", len(all_requests))

    st.markdown("---")

    tab1, tab2 = st.tabs(["⚡ Pending Reviews", "📜 Review History"])

    # ---------------- TAB 1: PENDING REVIEWS ----------------
    with tab1:
        st.subheader("Applications Awaiting Your Endorsement")
        if not pending_requests:
            st.success("🎉 All caught up! No requests currently awaiting your review.")
        else:
            st.info(f"You have **{len(pending_requests)}** pending student request(s) assigned to you.")

            for req in pending_requests:
                with st.expander(f"📌 {req['app_id']} — {req['student_name']} ({req['request_type']})", expanded=True):
                    c1, c2 = st.columns(2)
                    with c1:
                        st.write(f"**Student:** {req['student_name']} (`{req['reg_no']}`)")
                        st.write(f"**Department:** {req['department']}")
                        st.write(f"**Category:** {req['request_type']}")
                    with c2:
                        st.write(f"**Dates:** {req['start_date']} to {req['end_date']} ({req['total_days']} day(s))")
                        st.write(f"**Reason:** {req['reason']}")
                        st.write(f"**Submitted:** {req['created_at']}")

                    if req["event_name"]:
                        st.markdown(
                            f"🏆 **Event:** {req['event_name']} | **Institution:** {req['organizing_inst']} | **Venue:** {req['event_location']}"
                        )
                    if req["details"]:
                        st.caption(f"Additional Student Notes: {req['details']}")

                    st.markdown("---")
                    # Remarks input unique to this request
                    remarks_key = f"remarks_{req['id']}"
                    faculty_remarks = st.text_input(
                        "Faculty Review Remarks / Recommendation *",
                        placeholder="e.g., Verified credentials, student is permitted to attend.",
                        key=remarks_key
                    )

                    btn_col1, btn_col2, _ = st.columns([1.5, 1.5, 3])

                    with btn_col1:
                        if st.button("🟢 Recommend to HOD", key=f"app_{req['id']}", use_container_width=True, type="primary"):
                            remarks = faculty_remarks.strip() or "Recommended and forwarded to HOD by Faculty Mentor."
                            # Forward to HOD
                            update_request_status(req["id"], "PENDING_HOD", remarks, "Faculty")
                            st.success(f"Application {req['app_id']} recommended and forwarded to HOD!")
                            st.rerun()

                    with btn_col2:
                        if st.button("🔴 Reject Request", key=f"rej_{req['id']}", use_container_width=True):
                            if not faculty_remarks.strip():
                                st.error("Please enter rejection remarks before rejecting.")
                            else:
                                update_request_status(req["id"], "REJECTED", faculty_remarks.strip(), "Faculty")
                                st.warning(f"Application {req['app_id']} marked as REJECTED.")
                                st.rerun()

    # ---------------- TAB 2: REVIEW HISTORY ----------------
    with tab2:
        st.subheader("Processed Applications Archive")
        if not all_requests:
            st.info("No records associated with your mentorship.")
        else:
            history_data = []
            for r in all_requests:
                status_badge = {
                    "PENDING_FACULTY": "⏳ Pending Review",
                    "PENDING_HOD": "⚠️ Forwarded to HOD",
                    "APPROVED": "✅ Approved",
                    "REJECTED": "❌ Rejected"
                }.get(r["status"], r["status"])

                history_data.append({
                    "App ID": r["app_id"],
                    "Student": f"{r['student_name']} ({r['reg_no']})",
                    "Category": r["request_type"],
                    "Reason": r["reason"],
                    "Dates": f"{r['start_date']} ({r['total_days']}d)",
                    "Status": status_badge,
                    "Your Remarks": r["faculty_remarks"] or "Pending",
                    "Reviewed At": r["faculty_timestamp"] or "N/A"
                })

            df = pd.DataFrame(history_data)
            st.dataframe(df, use_container_width=True, hide_index=True)
