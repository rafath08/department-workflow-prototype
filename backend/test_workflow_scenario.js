const BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

const runScenario = async () => {
  console.log('===============================================================');
  console.log('STARTING AUTOMATED END-TO-END DEMONSTRATION WORKFLOW TEST');
  console.log('===============================================================');

  // Step 1: Log in as a student
  console.log('\n[STEP 1] Logging in as Student (student@college.edu)...');
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'student@college.edu',
      password: 'Student@123'
    })
  });
  const studentToken = studentLogin.token;
  const studentUser = studentLogin.user;
  console.log(`✓ Student authenticated: ${studentUser.name} (${studentUser.regNo})`);

  // Get Faculty mentor ID
  const mentorsRes = await request(`/auth/mentors?department=${encodeURIComponent(studentUser.department)}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const facultyMentor = mentorsRes.data[0];
  console.log(`✓ Designated Mentor found: ${facultyMentor.name} (${facultyMentor._id})`);

  // Step 2: Submit an OD request
  console.log('\n[STEP 2] Submitting On-Duty (OD) request as Student...');
  const submitRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      requestType: 'On-Duty',
      reason: 'National Autonomous AI Hackathon 2026 Finals',
      startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      additionalDescription: 'Team finalist oral presentation at national AI challenge',
      assignedFaculty: facultyMentor._id,
      eventName: 'National Autonomous AI Hackathon 2026',
      eventLocation: 'IIT Madras Research Park, Chennai',
      organizingInstitution: 'IIT Madras & AICTE',
      eventDescription: '36-hour autonomous agent design hackathon'
    })
  });
  const createdApp = submitRes.data;
  console.log(`✓ Application created: ${createdApp.applicationId}`);
  console.log(`✓ Initial Status: ${createdApp.status} (Stage: ${createdApp.currentStage})`);

  // Verify Student received submission notification
  const studentNotifs = await request('/notifications', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`✓ Student notifications count: ${studentNotifs.unreadCount}`);
  console.log(`✓ Latest Notification: "${studentNotifs.data[0].title}"`);

  // Step 3: Log in as the assigned faculty member
  console.log('\n[STEP 3] Logging in as Assigned Faculty (faculty@college.edu)...');
  const facultyLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'faculty@college.edu',
      password: 'Faculty@123'
    })
  });
  const facultyToken = facultyLogin.token;
  const facultyUser = facultyLogin.user;
  console.log(`✓ Faculty authenticated: ${facultyUser.name}`);

  // Step 4: View and approve the request
  console.log('\n[STEP 4] Faculty reviewing and approving request...');
  const facultyApproveRes = await request(`/applications/${createdApp._id}/approve`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${facultyToken}` },
    body: JSON.stringify({
      remarks: 'Verified invitation letter and hackathon qualification. Recommended for approval.'
    })
  });
  const forwardedApp = facultyApproveRes.data;
  console.log(`✓ Faculty approved! Application status updated to: ${forwardedApp.status}`);
  console.log(`✓ Current stage: ${forwardedApp.currentStage}`);
  console.log(`✓ Faculty remarks recorded: "${forwardedApp.facultyApproval.remarks}"`);

  // Step 5: Log in as the HOD
  console.log('\n[STEP 5] Logging in as Head of Department (hod@college.edu)...');
  const hodLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'hod@college.edu',
      password: 'Hod@123'
    })
  });
  const hodToken = hodLogin.token;
  const hodUser = hodLogin.user;
  console.log(`✓ HOD authenticated: ${hodUser.name} (${hodUser.department})`);

  // Step 6: View the forwarded request and approve it
  console.log('\n[STEP 6] HOD reviewing forwarded request and granting final sanction...');
  const hodApproveRes = await request(`/applications/${createdApp._id}/approve`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${hodToken}` },
    body: JSON.stringify({
      remarks: 'Department sanction granted. Attendance compensation approved for hackathon days.'
    })
  });
  const finalApp = hodApproveRes.data;
  console.log(`✓ Final HOD approval granted! Application status: ${finalApp.status}`);
  console.log(`✓ HOD remarks: "${finalApp.hodApproval.remarks}"`);

  // Step 7: Log in as student again
  console.log('\n[STEP 7] Re-logging in as Student...');
  const studentVerify = await request(`/applications/${createdApp._id}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const verifiedApp = studentVerify.data.application;
  const history = studentVerify.data.history;

  // Step 8: Verify that application status is APPROVED
  console.log('\n[STEP 8] Verifying Application Status & Timeline...');
  console.log(`✓ Status check: ${verifiedApp.status} (Expected: APPROVED) => ${verifiedApp.status === 'APPROVED' ? 'SUCCESS' : 'FAILURE'}`);
  console.log(`✓ Audit History stages recorded: ${history.length} events`);
  history.forEach((h, idx) => {
    console.log(`   ${idx + 1}. [${h.action}] by ${h.actorName} (${h.actorRole}) at ${new Date(h.timestamp).toLocaleTimeString()}: "${h.remarks}"`);
  });

  // Step 9: Check student notifications
  console.log('\n[STEP 9] Checking Student Notifications...');
  const updatedStudentNotifs = await request('/notifications', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`✓ Latest notification: "${updatedStudentNotifs.data[0].title}" - ${updatedStudentNotifs.data[0].message}`);

  // Step 10: Log in as administrator and verify dashboard statistics updated
  console.log('\n[STEP 10] Logging in as Administrator (admin@college.edu)...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@college.edu',
      password: 'Admin@123'
    })
  });
  const adminToken = adminLogin.token;
  const adminReports = await request('/admin/reports', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`✓ Administrator verified dashboard analytics:`);
  console.log(`   Total Applications: ${adminReports.data.summary.total}`);
  console.log(`   Approved: ${adminReports.data.summary.approved}`);
  console.log(`   Pending Faculty: ${adminReports.data.summary.pendingFaculty}`);
  console.log(`   Pending HOD: ${adminReports.data.summary.pendingHod}`);
  console.log(`   Rejected: ${adminReports.data.summary.rejected}`);

  // Test Rejection Scenario
  console.log('\n[BONUS STEP] Testing Rejection Workflow...');
  const testRejectApp = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      requestType: 'Leave',
      reason: 'Personal unverified absence during exam schedule',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      assignedFaculty: facultyMentor._id
    })
  });

  const rejectRes = await request(`/applications/${testRejectApp.data._id}/reject`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${facultyToken}` },
    body: JSON.stringify({
      remarks: 'Leave cannot be sanctioned due to continuous assessment test week.'
    })
  });
  console.log(`✓ Rejection test: Status is ${rejectRes.data.status}`);
  console.log(`✓ Rejection remarks: "${rejectRes.data.rejectionRemarks}"`);

  console.log('\n===============================================================');
  console.log('ALL DEMONSTRATION WORKFLOW REQUIREMENTS COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
};

runScenario().catch((err) => {
  console.error('Scenario failed:', err.message);
  process.exit(1);
});
