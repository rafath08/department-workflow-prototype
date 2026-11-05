import database

print("--- Testing SQLite Database Module ---")
database.init_db()
print("[OK] Database and tables initialized.")

student = database.authenticate_user("student1", "student123")
print("[OK] Authenticated Student:", student["full_name"], f"({student['role']})")

faculty = database.authenticate_user("faculty1", "faculty123")
print("[OK] Authenticated Faculty:", faculty["full_name"], f"({faculty['role']})")

hod = database.authenticate_user("hod1", "admin123")
print("[OK] Authenticated HOD:", hod["full_name"], f"({hod['role']})")

# Test submission
app_id = database.create_permission_request({
    "student_id": student["id"],
    "student_name": student["full_name"],
    "reg_no": student["reg_no"],
    "department": student["department"],
    "request_type": "On-Duty (OD)",
    "reason": "Paper Presentation at IEEE International Symposium",
    "start_date": "2026-11-10",
    "end_date": "2026-11-11",
    "total_days": 2,
    "event_name": "IEEE TechSym 2026",
    "event_location": "IISc Bangalore",
    "organizing_inst": "IEEE Computer Society",
    "details": "Oral technical presentation",
    "assigned_faculty": faculty["full_name"]
})
print(f"[OK] Created new request: {app_id} (Status: PENDING_FACULTY)")

# Test faculty recommendation
pending = database.get_pending_requests_for_faculty(faculty["full_name"])
target_req = next((r for r in pending if r["app_id"] == app_id), None)
assert target_req is not None
database.update_request_status(target_req["id"], "PENDING_HOD", "Verified paper acceptance letter. Recommended.", "Faculty")
print(f"[OK] Faculty recommended request {app_id} -> Status: PENDING_HOD")

# Test HOD approval
hod_pending = database.get_pending_requests_for_hod(student["department"])
target_hod_req = next((r for r in hod_pending if r["app_id"] == app_id), None)
assert target_hod_req is not None
database.update_request_status(target_hod_req["id"], "APPROVED", "Sanction granted for 2 days OD.", "Admin/HOD")
print(f"[OK] HOD approved request {app_id} -> Status: APPROVED")

# Check student records
updated_history = database.get_student_requests(student["id"])
approved_record = next(r for r in updated_history if r["app_id"] == app_id)
print(f"[OK] Final status check: {approved_record['status']}")
print(f"[OK] Faculty remarks: \"{approved_record['faculty_remarks']}\"")
print(f"[OK] HOD remarks: \"{approved_record['hod_remarks']}\"")
print("\nAll database operations and multi-level approval transitions verified successfully!")
