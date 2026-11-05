const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const WorkflowConfiguration = require('./models/WorkflowConfiguration');
const Application = require('./models/Application');
const ApprovalHistory = require('./models/ApprovalHistory');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    console.log('Clearing existing records for fresh seed...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await WorkflowConfiguration.deleteMany({});
    await Application.deleteMany({});
    await ApprovalHistory.deleteMany({});
    await Notification.deleteMany({});

    console.log('Seeding Workflow Configurations...');
    await WorkflowConfiguration.insertMany([
      {
        requestType: 'On-Duty',
        requiresFacultyApproval: true,
        requiresHodApproval: true,
        autoEscalateHours: 48,
        description: 'Requires recommendation by faculty mentor followed by final approval from Head of Department.'
      },
      {
        requestType: 'Leave',
        requiresFacultyApproval: true,
        requiresHodApproval: true,
        autoEscalateHours: 24,
        description: 'Standard medical or personal leave. Verified by faculty mentor and endorsed by HOD.'
      },
      {
        requestType: 'Event Participation',
        requiresFacultyApproval: true,
        requiresHodApproval: true,
        autoEscalateHours: 48,
        description: 'Inter-college symposiums, hackathons, and sports tournaments.'
      },
      {
        requestType: 'Other Permission',
        requiresFacultyApproval: true,
        requiresHodApproval: false,
        autoEscalateHours: 72,
        description: 'Laboratory access, library extensions, and administrative permissions. Handled directly by Mentor.'
      }
    ]);

    console.log('Seeding Users...');
    // Create Faculty & HOD first so they can be assigned
    const faculty1 = await User.create({
      name: 'Dr. Robert Vance',
      email: 'faculty@college.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      phone: '+1-555-0102'
    });

    const hod1 = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'hod@college.edu',
      password: 'Hod@123',
      role: 'hod',
      department: 'Computer Science & Engineering',
      phone: '+1-555-0103'
    });

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      phone: '+1-555-0100'
    });

    const student1 = await User.create({
      name: 'Alex Rivera',
      email: 'student@college.edu',
      password: 'Student@123',
      role: 'student',
      regNo: 'CS2023-042',
      department: 'Computer Science & Engineering',
      year: 'III',
      section: 'A',
      mentor: faculty1._id,
      phone: '+1-555-0142'
    });

    // Additional student & faculty for realistic distribution
    const faculty2 = await User.create({
      name: 'Dr. Alan Turing',
      email: 'alan@college.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Electronics & Communication',
      phone: '+1-555-0104'
    });

    const hod2 = await User.create({
      name: 'Prof. David Miller',
      email: 'hod.ece@college.edu',
      password: 'Hod@123',
      role: 'hod',
      department: 'Electronics & Communication',
      phone: '+1-555-0105'
    });

    const student2 = await User.create({
      name: 'Maria Chen',
      email: 'maria@college.edu',
      password: 'Student@123',
      role: 'student',
      regNo: 'EC2023-088',
      department: 'Electronics & Communication',
      year: 'II',
      section: 'B',
      mentor: faculty2._id,
      phone: '+1-555-0188'
    });

    console.log('Seeding Departments...');
    await Department.insertMany([
      {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        hod: hod1._id,
        description: 'Department of Computer Science and Engineering'
      },
      {
        name: 'Electronics & Communication',
        code: 'ECE',
        hod: hod2._id,
        description: 'Department of Electronics and Communication Engineering'
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Department of Information Technology'
      },
      {
        name: 'Mechanical Engineering',
        code: 'MECH',
        description: 'Department of Mechanical Engineering'
      }
    ]);

    console.log('Seeding Applications and Workflows...');

    // 1. Fully APPROVED Application (Leave)
    const approvedApp = await Application.create({
      applicationId: 'APP-2026-0001',
      student: student1._id,
      studentName: student1.name,
      regNo: student1.regNo,
      department: student1.department,
      year: student1.year,
      section: student1.section,
      requestType: 'Leave',
      reason: 'Medical Leave - Viral Fever and Doctor Consultation',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      additionalDescription: 'Medical prescription and fitness certificate attached.',
      assignedFaculty: faculty1._id,
      status: 'APPROVED',
      currentStage: 'COMPLETED',
      facultyApproval: {
        approver: faculty1._id,
        status: 'APPROVED',
        remarks: 'Medical certificate verified. Recommended for approval.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      hodApproval: {
        approver: hod1._id,
        status: 'APPROVED',
        remarks: 'Leave granted. Advised to catch up on missed lab experiments.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    });

    // Approval history for app 1
    await ApprovalHistory.create([
      {
        application: approvedApp._id,
        applicationId: approvedApp.applicationId,
        actor: student1._id,
        actorName: student1.name,
        actorRole: 'student',
        action: 'SUBMITTED',
        previousStatus: 'DRAFT',
        newStatus: 'PENDING_FACULTY',
        remarks: 'Application submitted for Leave',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        application: approvedApp._id,
        applicationId: approvedApp.applicationId,
        actor: faculty1._id,
        actorName: faculty1.name,
        actorRole: 'faculty',
        action: 'FACULTY_APPROVED',
        previousStatus: 'PENDING_FACULTY',
        newStatus: 'PENDING_HOD',
        remarks: 'Medical certificate verified. Recommended for approval.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        application: approvedApp._id,
        applicationId: approvedApp.applicationId,
        actor: hod1._id,
        actorName: hod1.name,
        actorRole: 'hod',
        action: 'HOD_APPROVED',
        previousStatus: 'PENDING_HOD',
        newStatus: 'APPROVED',
        remarks: 'Leave granted. Advised to catch up on missed lab experiments.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 2. PENDING_HOD Application (Event Participation)
    const pendingHodApp = await Application.create({
      applicationId: 'APP-2026-0002',
      student: student1._id,
      studentName: student1.name,
      regNo: student1.regNo,
      department: student1.department,
      year: student1.year,
      section: student1.section,
      requestType: 'Event Participation',
      reason: 'Smart India Hackathon 2026 Grand Finale Participation',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      totalDays: 4,
      additionalDescription: 'Representing the college in the AI problem statement round.',
      eventDetails: {
        eventName: 'Smart India Hackathon 2026 Grand Finale',
        eventLocation: 'IIT Bombay, Mumbai',
        organizingInstitution: 'Ministry of Education & AICTE',
        eventDescription: 'National level 36-hour hackathon finale.'
      },
      assignedFaculty: faculty1._id,
      status: 'PENDING_HOD',
      currentStage: 'HOD_REVIEW',
      facultyApproval: {
        approver: faculty1._id,
        status: 'APPROVED',
        remarks: 'Student team qualified for the grand finale. Highly recommended for OD.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });

    await ApprovalHistory.create([
      {
        application: pendingHodApp._id,
        applicationId: pendingHodApp.applicationId,
        actor: student1._id,
        actorName: student1.name,
        actorRole: 'student',
        action: 'SUBMITTED',
        previousStatus: 'DRAFT',
        newStatus: 'PENDING_FACULTY',
        remarks: 'Application submitted for Event Participation',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        application: pendingHodApp._id,
        applicationId: pendingHodApp.applicationId,
        actor: faculty1._id,
        actorName: faculty1.name,
        actorRole: 'faculty',
        action: 'FACULTY_APPROVED',
        previousStatus: 'PENDING_FACULTY',
        newStatus: 'PENDING_HOD',
        remarks: 'Student team qualified for the grand finale. Highly recommended for OD.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 3. PENDING_FACULTY Application (On-Duty)
    const pendingFacultyApp = await Application.create({
      applicationId: 'APP-2026-0003',
      student: student1._id,
      studentName: student1.name,
      regNo: student1.regNo,
      department: student1.department,
      year: student1.year,
      section: student1.section,
      requestType: 'On-Duty',
      reason: 'ACM Student Research Symposium Paper Presentation',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      additionalDescription: 'Presenting research paper on Agentic Automated Workflows.',
      eventDetails: {
        eventName: 'International Student Computing Symposium',
        eventLocation: 'IISc Bangalore',
        organizingInstitution: 'ACM India Chapter',
        eventDescription: 'Oral presentation of peer-reviewed conference paper.'
      },
      assignedFaculty: faculty1._id,
      status: 'PENDING_FACULTY',
      currentStage: 'FACULTY_REVIEW'
    });

    await ApprovalHistory.create([
      {
        application: pendingFacultyApp._id,
        applicationId: pendingFacultyApp.applicationId,
        actor: student1._id,
        actorName: student1.name,
        actorRole: 'student',
        action: 'SUBMITTED',
        previousStatus: 'DRAFT',
        newStatus: 'PENDING_FACULTY',
        remarks: 'Application submitted for On-Duty',
        timestamp: new Date()
      }
    ]);

    // 4. REJECTED Application
    const rejectedApp = await Application.create({
      applicationId: 'APP-2026-0004',
      student: student2._id,
      studentName: student2.name,
      regNo: student2.regNo,
      department: student2.department,
      year: student2.year,
      section: student2.section,
      requestType: 'On-Duty',
      reason: 'Local College Cultural Fest Attendance',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      additionalDescription: 'Attending non-technical cultural evening.',
      eventDetails: {
        eventName: 'Spring Fest 2026',
        eventLocation: 'City Center Auditorium',
        organizingInstitution: 'St. Xavier College',
        eventDescription: 'Inter-collegiate cultural festival.'
      },
      assignedFaculty: faculty2._id,
      status: 'REJECTED',
      currentStage: 'COMPLETED',
      rejectionRemarks: 'OD cannot be sanctioned for attendance at non-technical events during continuous assessment test week.',
      rejectionBy: {
        user: faculty2._id,
        role: 'faculty',
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      },
      facultyApproval: {
        approver: faculty2._id,
        status: 'REJECTED',
        remarks: 'OD cannot be sanctioned for attendance at non-technical events during continuous assessment test week.',
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      }
    });

    await ApprovalHistory.create([
      {
        application: rejectedApp._id,
        applicationId: rejectedApp.applicationId,
        actor: student2._id,
        actorName: student2.name,
        actorRole: 'student',
        action: 'SUBMITTED',
        previousStatus: 'DRAFT',
        newStatus: 'PENDING_FACULTY',
        remarks: 'Application submitted for On-Duty',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        application: rejectedApp._id,
        applicationId: rejectedApp.applicationId,
        actor: faculty2._id,
        actorName: faculty2.name,
        actorRole: 'faculty',
        action: 'FACULTY_REJECTED',
        previousStatus: 'PENDING_FACULTY',
        newStatus: 'REJECTED',
        remarks: 'OD cannot be sanctioned for attendance at non-technical events during continuous assessment test week.',
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('Seeding In-App Notifications...');
    await Notification.create([
      {
        recipient: student1._id,
        title: 'Application Approved 🎉',
        message: 'Your Leave request (APP-2026-0001) has been approved by Prof. Sarah Jenkins (HOD).',
        type: 'APPROVED',
        application: approvedApp._id,
        applicationId: 'APP-2026-0001',
        isRead: false
      },
      {
        recipient: faculty1._id,
        title: 'New Request Awaiting Review',
        message: 'Student Alex Rivera submitted an On-Duty request (APP-2026-0003) for your endorsement.',
        type: 'PENDING_FACULTY',
        application: pendingFacultyApp._id,
        applicationId: 'APP-2026-0003',
        isRead: false
      },
      {
        recipient: hod1._id,
        title: 'Application Forwarded for HOD Review',
        message: 'Application APP-2026-0002 for student Alex Rivera was approved by Dr. Robert Vance and is awaiting your final sanction.',
        type: 'PENDING_HOD',
        application: pendingHodApp._id,
        applicationId: 'APP-2026-0002',
        isRead: false
      },
      {
        recipient: student2._id,
        title: 'Application Status Update',
        message: 'Your On-Duty request (APP-2026-0004) was not approved. Remarks: OD cannot be sanctioned during CAT exams.',
        type: 'REJECTED',
        application: rejectedApp._id,
        applicationId: 'APP-2026-0004',
        isRead: true
      }
    ]);

    console.log('Institutional seed completed successfully!');
    return true;
  } catch (error) {
    console.error('Seed Data Error:', error);
    throw error;
  }
};

// Allow running directly: node seed.js
if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  const connectDB = require('./config/db');

  connectDB().then(async () => {
    await seedData();
    console.log('Database initialized. Exiting seed script.');
    process.exit(0);
  });
}

module.exports = seedData;
