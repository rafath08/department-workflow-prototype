import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  FileCheck,
  FileText,
  Award,
  Briefcase,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const StudentServices = () => {
  const services = [
    {
      id: 'on-duty',
      title: 'On-Duty (OD) Application',
      category: 'On-Duty',
      description: 'Apply for official attendance credit when participating in technical symposiums, hackathons, sports tournaments, or inter-college events.',
      icon: <Award className="w-6 h-6 text-sky-600" />,
      badge: 'Popular',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 'leave',
      title: 'Leave Application',
      category: 'Leave',
      description: 'Submit medical, personal, or emergency leave requests for faculty mentor and department sanction with attendance tracking.',
      icon: <Calendar className="w-6 h-6 text-amber-600" />,
      badge: 'Attendance Linked',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'general-permission',
      title: 'General Permission Request',
      category: 'General Permission',
      description: 'Request special campus entry/exit timings, lab access beyond working hours, or library facility access.',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      badge: 'General',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'bonafide',
      title: 'Bonafide Certificate Request',
      category: 'Bonafide Certificate',
      description: 'Request formal institutional bonafide letters for bank loans, passport applications, scholarship verifications, or bus passes.',
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      badge: 'Document Issuance',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'noc',
      title: 'No-Objection Certificate (NOC)',
      category: 'No Objection Certificate (NOC)',
      description: 'Obtain an official NOC for off-campus internships, passport processing, higher study entrance exams, or government clearance.',
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      badge: 'Official Letter',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'event-participation',
      title: 'Event Participation Permission',
      category: 'Event Participation',
      description: 'Obtain departmental approval and sponsorship sanction to represent the institution at external workshops or conferences.',
      icon: <Sparkles className="w-6 h-6 text-pink-600" />,
      badge: 'Co-Curricular',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    {
      id: 'internship',
      title: 'Internship Permission & Sanction',
      category: 'Internship Permission',
      description: 'Apply for semester or summer industrial internship sanction with mentor approval and company offer letter validation.',
      icon: <Briefcase className="w-6 h-6 text-teal-600" />,
      badge: 'Industry Connect',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'project',
      title: 'Project & Research Permission',
      category: 'Project Permission',
      description: 'Seek approval for capstone projects, cross-department lab usage, industry-sponsored projects, and faculty mentorship.',
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      badge: 'Academic',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'academic-docs',
      title: 'Academic Document Requests',
      category: 'Academic Document Request',
      description: 'Request official transcripts, course completion letters, medium of instruction certificates, and syllabus copies.',
      icon: <GraduationCap className="w-6 h-6 text-cyan-600" />,
      badge: 'Registrar Linked',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      id: 'other',
      title: 'Other Department Requests',
      category: 'Other Department Request',
      description: 'Submit custom inquiries, administrative clearances, club activity permissions, or grievance reviews.',
      icon: <Clock className="w-6 h-6 text-slate-600" />,
      badge: 'Miscellaneous',
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <span className="text-xs uppercase tracking-wider font-semibold text-sky-200">
          Institutional Student Services Catalog
        </span>
        <h2 className="text-2xl font-bold mt-1">Student Services & Applications Hub</h2>
        <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
          Select an institutional service to initiate a structured application. All submissions are automatically routed through faculty mentorship, Head of Department (HOD) review, and central institutional auditing.
        </p>
      </div>

      {/* Grid of 10 Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition">
                  {svc.icon}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${svc.badgeColor}`}>
                  {svc.badge}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-sm mt-3.5 group-hover:text-sky-600 transition">
                {svc.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {svc.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Multi-Level Approval</span>
              <Link
                to={`/submit-request?type=${encodeURIComponent(svc.category)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 group-hover:translate-x-0.5 transition"
              >
                Apply Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentServices;
