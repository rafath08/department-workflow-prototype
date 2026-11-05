"""
components/hod_admin.py: Head of Department (HOD) and Institutional Admin views.
"""

import streamlit as st
import pandas as pd
from database import get_pending_requests_for_hod, get_all_requests, update_request_status

def render_hod_admin_dashboard(user):
    """Renders the HOD & Administrative Command Console."""
    st.title("🏛️ Department Head & Institutional Administration")
    st.caption(f"Logged in as **{user['full_name']}** | Role: **{user['role']}** | Department: **{user['department']}**")

    dept_pending = get_pending_requests_for_hod(user["department"])
    all_requests = get_all_requests(user["department"] if user["role"] == "Faculty" else None)

    # Key Metrics
    total = len(all_requests)
    approved = sum(1 for r in all_requests if r["status"] == "APPROVED")
    pending_hod = len(dept_pending)
    rejected = sum(1 for r in all_requests if r["status"] == "REJECTED")

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Forwarded to HOD", pending_hod)
    m2.metric("Sanctioned (Approved)", approved)
    m3.metric("Total Institutional", total)
    m4.metric("Rejected", rejected)

    st.markdown("---")

    tab1, tab2 = st.tabs(["⚖️ Department Queue (Pending HOD)", "📊 Institutional Analytics & Archives"])

    # ---------------- TAB 1: PENDING HOD SANCTIONS ----------------
    with tab1:
        st.subheader("Forwarded Requests Awaiting HOD Sanction")
        if not dept_pending:
            st.success("✅ No applications currently pending HOD sanction in your department queue.")
        else:
            st.warning(f"**{len(dept_pending)}** application(s) have been recommended by faculty mentors and require final sign-off.")

            for req in dept_pending:
                with st.expander(f"📌 {req['app_id']} — {req['student_name']} ({req['request_type']})", expanded=True):
                    c1, c2 = st.columns(2)
                    with c1:
                        st.write(f"**Student:** {req['student_name']} (`{req['reg_no']}`)")
                        st.write(f"**Department:** {req['department']}")
                        st.write(f"**Category:** {req['request_type']}")
                    with c2:
                        st.write(f"**Duration:** {req['start_date']} to {req['end_date']} ({req['total_days']} day(s))")
                        st.write(f"**Reason:** {req['reason']}")
                        st.write(f"**Mentor:** {req['assigned_faculty']}")

                    if req["event_name"]:
                        st.markdown(
                            f"🏆 **Event:** {req['event_name']} | **Institution:** {req['organizing_inst']} | **Venue:** {req['event_location']}"
                        )

                    # Faculty Recommendation Box
                    st.info(f"👨‍🏫 **Faculty Mentor Recommendation ({req['faculty_timestamp']}):**\n\"{req['faculty_remarks']}\"")

                    # HOD Remarks input
                    hod_remarks_key = f"hod_remarks_{req['id']}"
                    hod_remarks = st.text_input(
                        "HOD Official Sanction Remarks *",
                        placeholder="e.g., Sanctioned. Attendance condonation granted.",
                        key=hod_remarks_key
                    )

                    btn_col1, btn_col2, _ = st.columns([1.8, 1.5, 3])

                    with btn_col1:
                        if st.button("🟢 Grant Final Approval", key=f"hod_app_{req['id']}", use_container_width=True, type="primary"):
                            remarks = hod_remarks.strip() or "Final sanction granted by Head of Department."
                            update_request_status(req["id"], "APPROVED", remarks, "Admin/HOD")
                            st.success(f"Application {req['app_id']} officially APPROVED!")
                            st.rerun()

                    with btn_col2:
                        if st.button("🔴 Reject Request", key=f"hod_rej_{req['id']}", use_container_width=True):
                            if not hod_remarks.strip():
                                st.error("Please provide remarks/reasons before rejecting.")
                            else:
                                update_request_status(req["id"], "REJECTED", hod_remarks.strip(), "Admin/HOD")
                                st.warning(f"Application {req['app_id']} has been REJECTED by HOD.")
                                st.rerun()

    # ---------------- TAB 2: ANALYTICS & ARCHIVES ----------------
    with tab2:
        st.subheader("Department Analytics & Complete Audit Records")

        if all_requests:
            df = pd.DataFrame(all_requests)

            # Chart: Requests by Type
            st.markdown("##### 📈 Requests by Category")
            type_counts = df["request_type"].value_counts()
            st.bar_chart(type_counts)

            # Filter controls
            st.markdown("##### 📁 Full Institutional Database")
            status_filter = st.selectbox(
                "Filter by Status",
                ["ALL", "APPROVED", "PENDING_FACULTY", "PENDING_HOD", "REJECTED"]
            )

            filtered_df = df if status_filter == "ALL" else df[df["status"] == status_filter]

            display_cols = [
                "app_id", "student_name", "reg_no", "department",
                "request_type", "reason", "total_days", "status",
                "assigned_faculty", "faculty_remarks", "hod_remarks", "created_at"
            ]
            st.dataframe(filtered_df[display_cols], use_container_width=True, hide_index=True)

            # Export to CSV
            csv_data = filtered_df.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Export Filtered Records as CSV",
                data=csv_data,
                file_name=f"department_workflow_records_{status_filter.lower()}.csv",
                mime="text/csv"
            )
        else:
            st.info("No institutional records found.")
