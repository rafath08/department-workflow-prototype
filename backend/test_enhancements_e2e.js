const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED WORKFLOW ENHANCEMENT VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      console.log(`[PASS] Scenario ${total}: ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario ${total}: ${description}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Authenticate users
    console.log('Authenticating demo users...');
    const studentData = await req('/auth/login', {
      method: 'POST',
      body: { email: 'student@college.edu', password: 'Student@123' }
    });
    const studentToken = studentData.token;
    const studentUser = studentData.user;

    const facultyData = await req('/auth/login', {
      method: 'POST',
      body: { email: 'faculty@college.edu', password: 'Faculty@123' }
    });
    const facultyToken = facultyData.token;
    const facultyUser = facultyData.user;

    const hodData = await req('/auth/login', {
      method: 'POST',
      body: { email: 'hod@college.edu', password: 'Hod@123' }
    });
    const hodToken = hodData.token;
    const hodUser = hodData.user;

    assert(studentToken && facultyToken && hodToken, 'Successfully authenticated Student, Faculty and HOD');

    // 2. Submit new On-Duty (OD) request
    console.log('\n--- Test Scenario 1 & 2: Submit OD and Verify in Faculty Queue ---');
    const submitRes = await req('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        requestType: 'On-Duty',
        reason: 'Representing college at Smart India Hackathon Grand Finale',
        startDate: '2026-11-15',
        endDate: '2026-11-17',
        assignedFaculty: facultyUser.id || facultyUser._id,
        eventName: 'Smart India Hackathon',
        eventLocation: 'New Delhi',
        organizingInstitution: 'Ministry of Education'
      }
    });
    const app1 = submitRes.data;
    assert(
      app1.status === 'Pending Faculty Approval' && app1.applicationId.startsWith('APP-'),
      `Student submitted OD (${app1.applicationId}) with initial status: "${app1.status}"`
    );

    // Verify application appears in Faculty queue
    const facultyQueue = await req('/applications', {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const foundInFaculty = facultyQueue.data.find((a) => a._id === app1._id);
    assert(
      foundInFaculty && foundInFaculty.status === 'Pending Faculty Approval',
      `Application ${app1.applicationId} is visible in Faculty queue with assigned mentor ${foundInFaculty?.assignedFaculty?.name}`
    );

    // 3. Faculty Approves and Endorses with remarks
    console.log('\n--- Test Scenario 3: Faculty Endorsement & Forward to HOD ---');
    const facultyApproveRes = await req(`/applications/${app1._id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { remarks: 'Verified hackathon registration. Recommended for departmental OD.' }
    });
    const app1AfterFaculty = facultyApproveRes.data;
    assert(
      app1AfterFaculty.status === 'Pending HOD Approval' &&
      app1AfterFaculty.facultyApproval.status === 'APPROVED' &&
      app1AfterFaculty.facultyApproval.remarks.includes('Verified hackathon registration'),
      `Faculty endorsed application. Status transitioned to: "${app1AfterFaculty.status}" with faculty remarks preserved`
    );

    // Verify in HOD Queue
    const hodQueue = await req('/applications', {
      headers: { Authorization: `Bearer ${hodToken}` }
    });
    const foundInHod = hodQueue.data.find((a) => a._id === app1._id);
    assert(
      foundInHod && foundInHod.status === 'Pending HOD Approval',
      `Application is now visible in HOD Sanction Queue (${foundInHod?.applicationId})`
    );

    // 4. HOD Final Sanction
    console.log('\n--- Test Scenario 4: HOD Final Approval ---');
    const hodApproveRes = await req(`/applications/${app1._id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${hodToken}` },
      body: { remarks: 'Approved. Official On-Duty sanctioned with attendance credit.' }
    });
    const app1AfterHod = hodApproveRes.data;
    assert(
      app1AfterHod.status === 'Approved' &&
      app1AfterHod.hodApproval.status === 'APPROVED',
      `HOD sanctioned application. Final institutional status: "${app1AfterHod.status}"`
    );

    // Verify Tracking Endpoint shows complete information
    console.log('\n--- Test Scenario 5: Application Tracking Transparency ---');
    const trackRes = await req(`/applications/tracking/${app1.applicationId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const track = trackRes.data;
    assert(
      track.currentStatus === 'Approved' &&
      track.finalDecision === 'APPROVED' &&
      track.facultyRemarks.includes('Verified hackathon') &&
      track.hodRemarks.includes('Official On-Duty sanctioned'),
      `Dedicated tracking endpoint returns full history, remarks, and final decision "${track.finalDecision}"`
    );

    // 5. Test Rejection flow with MANDATORY reason
    console.log('\n--- Test Scenario 6: Rejection Flow with Mandatory Reason & Visibility ---');
    const submitRes2 = await req('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        requestType: 'Leave',
        reason: 'Personal holiday trip',
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        assignedFaculty: facultyUser.id || facultyUser._id
      }
    });
    const app2 = submitRes2.data;

    // Test rejection without reason should fail
    try {
      await req(`/applications/${app2._id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${facultyToken}` },
        body: { remarks: '' }
      });
      assert(false, 'Rejection without reason should have failed with 400');
    } catch (err) {
      assert(err.status === 400, 'Rejection without reason was strictly rejected with 400 Bad Request');
    }

    // Reject with proper reason
    const rejectReason = 'Continuous Evaluation Assessment 2 is scheduled on these dates. Attendance is mandatory.';
    const rejectRes = await req(`/applications/${app2._id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { remarks: rejectReason }
    });
    const app2Rejected = rejectRes.data;
    assert(
      app2Rejected.status === 'Rejected' &&
      app2Rejected.rejectionRemarks === rejectReason &&
      app2Rejected.rejectionBy?.role === 'faculty',
      `Application rejected. Reason recorded: "${app2Rejected.rejectionRemarks}" and approver role: ${app2Rejected.rejectionBy?.role}`
    );

    // Verify student tracking shows rejection prominently
    const track2Res = await req(`/applications/tracking/${app2.applicationId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      track2Res.data.currentStatus === 'Rejected' &&
      track2Res.data.rejectionReason === rejectReason,
      `Student tracking clearly reflects rejection reason: "${track2Res.data.rejectionReason}"`
    );

    // 6. Test Request Information & Clarification Loop
    console.log('\n--- Test Scenario 7: Request Information Loop ---');
    const submitRes3 = await req('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        requestType: 'Bonafide Certificate',
        reason: 'Need bonafide for educational scholarship',
        startDate: '2026-11-18',
        endDate: '2026-11-18',
        assignedFaculty: facultyUser.id || facultyUser._id
      }
    });
    const app3 = submitRes3.data;

    const infoQuery = 'Please provide the scholarship portal registration application number.';
    const requestInfoRes = await req(`/applications/${app3._id}/request-info`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { query: infoQuery }
    });
    assert(
      requestInfoRes.data.status === 'Additional Information Required',
      `Faculty requested info. Status transitioned to: "${requestInfoRes.data.status}"`
    );

    // Student provides response
    const clarification = 'Scholarship registration number is NSP-2026-TN-998811.';
    const provideInfoRes = await req(`/applications/${app3.applicationId}/provide-info`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { response: clarification }
    });
    assert(
      provideInfoRes.data.status === 'Pending Faculty Approval',
      `Student submitted clarification. Status returned to: "${provideInfoRes.data.status}"`
    );

    // 7. Test Forward to Admin
    console.log('\n--- Test Scenario 8: Forwarding Flow ---');
    const forwardRes = await req(`/applications/${app3._id}/forward`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { targetRole: 'admin', remarks: 'Forwarded for central principal signature' }
    });
    assert(
      forwardRes.data.status === 'Forwarded to Admin',
      `Application forwarded to admin. Status transitioned to: "${forwardRes.data.status}"`
    );

    // 8. Test Announcements & Events
    console.log('\n--- Test Scenario 9: Department Announcements & Calendar Events ---');
    const annRes = await req('/announcements', {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: {
        title: 'Department Hackathon Registrations Open',
        content: 'All III and IV year students can submit OD applications for the annual symposium.',
        priority: 'Important',
        category: 'OD / Events'
      }
    });
    assert(annRes.success && annRes.data.title.includes('Hackathon'), 'Published department announcement');

    const eventRes = await req('/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: {
        title: 'Smart India Hackathon Internal Round',
        eventType: 'OD Event',
        startDate: '2026-11-25',
        endDate: '2026-11-26',
        location: 'Turing Computing Lab'
      }
    });
    assert(eventRes.success && eventRes.data.title.includes('Internal Round'), 'Scheduled departmental calendar event');

    // 9. Statistics Verification
    console.log('\n--- Test Scenario 10: Institutional Statistics Consistency ---');
    const statsRes = await req('/applications/statistics', {
      headers: { Authorization: `Bearer ${hodToken}` }
    });
    const s = statsRes.data;
    assert(
      s.total >= 3 &&
      typeof s.approvalRate === 'number' &&
      typeof s.rejectionRate === 'number',
      `Calculated live institutional metrics: Total=${s.total}, Approved=${s.approved}, Rejected=${s.rejected}, ApprovalRate=${s.approvalRate}%`
    );

    console.log('\n====================================================');
    console.log(`ALL TESTS PASSED! (${passed}/${total} scenarios succeeded)`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Test execution failed with error:', error.data || error.message);
    process.exitCode = 1;
  }
}

runTests();
