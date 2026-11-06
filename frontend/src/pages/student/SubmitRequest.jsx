import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Calendar,
  Building,
  User,
  MapPin,
  Upload,
  ArrowRight,
  Info,
  CheckCircle,
  Briefcase,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';

export const SubmitRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type');

  const [requestType, setRequestType] = useState(preselectedType || 'On-Duty');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [additionalDescription, setAdditionalDescription] = useState('');
  const [assignedFaculty, setAssignedFaculty] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  // Dynamic Event Details (for OD / Event Participation)
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [organizingInstitution, setOrganizingInstitution] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  // Extended service details
  const [companyName, setCompanyName] = useState('');
  const [internshipRole, setInternshipRole] = useState('');
  const [stipend, setStipend] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectGuide, setProjectGuide] = useState('');
  const [certificatePurpose, setCertificatePurpose] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [copiesRequired, setCopiesRequired] = useState(1);

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalDays, setTotalDays] = useState(1);

  useEffect(() => {
    if (preselectedType) {
      setRequestType(preselectedType);
    }
  }, [preselectedType]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get(`/auth/mentors?department=${encodeURIComponent(user?.department || '')}`);
        if (res.data.success) {
          setMentors(res.data.data);
          if (user?.mentor?._id) {
            setAssignedFaculty(user.mentor._id);
          } else if (res.data.data.length > 0) {
            setAssignedFaculty(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Fetch mentors error:', err);
      }
    };
    fetchMentors();
  }, [user]);

  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (e >= s) {
        const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diff);
      } else {
        setTotalDays(0);
      }
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select valid start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (!assignedFaculty) {
      setError('Please select an assigned faculty mentor.');
      return;
    }

    if (
      (requestType === 'On-Duty' || requestType === 'Event Participation') &&
      (!eventName.trim() || !eventLocation.trim() || !organizingInstitution.trim())
    ) {
      setError('Please fill in all event details (Event Name, Location, Organizing Institution).');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('requestType', requestType);
      formData.append('reason', reason);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('additionalDescription', additionalDescription);
      formData.append('assignedFaculty', assignedFaculty);

      if (requestType === 'On-Duty' || requestType === 'Event Participation') {
        formData.append('eventName', eventName);
        formData.append('eventLocation', eventLocation);
        formData.append('organizingInstitution', organizingInstitution);
        formData.append('eventDescription', eventDescription);
      }

      if (requestType === 'Internship Permission') {
        formData.append('companyName', companyName);
        formData.append('internshipRole', internshipRole);
        formData.append('stipend', stipend);
      }

      if (requestType === 'Project Permission') {
        formData.append('projectTitle', projectTitle);
        formData.append('projectGuide', projectGuide);
      }

      if (
        requestType === 'Bonafide Certificate' ||
        requestType === 'No Objection Certificate (NOC)' ||
        requestType === 'Academic Document Request'
      ) {
        formData.append('purpose', certificatePurpose);
        formData.append('documentType', documentType || requestType);
        formData.append('copiesRequired', copiesRequired);
      }

      if (documentFile) {
        formData.append('document', documentFile);
      }

      const res = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        navigate('/tracking');
      }
    } catch (err) {
      console.error('Submit application error:', err);
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const isEventRequired = requestType === 'On-Duty' || requestType === 'Event Participation';
  const isInternship = requestType === 'Internship Permission';
  const isProject = requestType === 'Project Permission';
  const isCertificate =
    requestType === 'Bonafide Certificate' ||
    requestType === 'No Objection Certificate (NOC)' ||
    requestType === 'Academic Document Request';

  const categoryList = [
    { id: 'On-Duty', label: 'On-Duty (OD)', desc: 'Official duties, symposia, competitions' },
    { id: 'Leave', label: 'Leave Request', desc: 'Medical, personal, emergency leave' },
    { id: 'General Permission', label: 'General Permission', desc: 'Special campus timing or lab access' },
    { id: 'Bonafide Certificate', label: 'Bonafide Certificate', desc: 'Letters for bank loan, passport, bus pass' },
    { id: 'No Objection Certificate (NOC)', label: 'NOC Request', desc: 'Clearance for external internships & exams' },
    { id: 'Event Participation', label: 'Event Participation', desc: 'Hackathons, sports, inter-college events' },
    { id: 'Internship Permission', label: 'Internship Permission', desc: 'Industrial training / semester internships' },
    { id: 'Project Permission', label: 'Project Permission', desc: 'Capstone, research lab work & guides' },
    { id: 'Academic Document Request', label: 'Academic Documents', desc: 'Transcripts, medium of instruction, etc.' },
    { id: 'Other Department Request', label: 'Other Request', desc: 'Administrative and department requests' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Submit Application Request</h2>
        <p className="text-xs text-slate-500">
          Initiate an official institutional workflow routed directly to your assigned faculty mentor and HOD.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Request Type Selection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Select Service Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {categoryList.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setRequestType(type.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  requestType === type.id
                    ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span
                    className={`block text-xs font-bold ${
                      requestType === type.id ? 'text-sky-900' : 'text-slate-800'
                    }`}
                  >
                    {type.label}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{type.desc}</p>
                </div>
                {requestType === type.id && (
                  <CheckCircle className="w-4 h-4 text-sky-600 mt-2 self-end" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Category Specific Form Fields */}
        {isEventRequired && (
          <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 border-b border-blue-100 pb-2">
              <Award className="w-4 h-4 text-blue-600" />
              Event / Activity Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event / Activity Name *
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. National Level Hackathon 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organizing College / Institution *
                </label>
                <input
                  type="text"
                  value={organizingInstitution}
                  onChange={(e) => setOrganizingInstitution(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology Madras"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. IIT Madras Research Park, Chennai"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {isInternship && (
          <div className="bg-white p-5 rounded-xl border border-teal-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2 border-b border-teal-100 pb-2">
              <Briefcase className="w-4 h-4 text-teal-600" />
              Internship Company Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google India / TCS"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internship Role</label>
                <input
                  type="text"
                  value={internshipRole}
                  onChange={(e) => setInternshipRole(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stipend (Monthly)</label>
                <input
                  type="text"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. ₹25,000 / month"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {isProject && (
          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 border-b border-indigo-100 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Project / Research Scope
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Autonomous Robotic Drone System"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Guide / Mentor</label>
                <input
                  type="text"
                  value={projectGuide}
                  onChange={(e) => setProjectGuide(e.target.value)}
                  placeholder="e.g. Dr. K. Ramesh"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {isCertificate && (
          <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2 border-b border-purple-100 pb-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              Certificate / Document Issuance Purpose
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Certificate *</label>
                <input
                  type="text"
                  value={certificatePurpose}
                  onChange={(e) => setCertificatePurpose(e.target.value)}
                  placeholder="e.g. Applying for State Bank Education Loan / Passport Processing"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Copies Required</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={copiesRequired}
                  onChange={(e) => setCopiesRequired(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date & Faculty Assignment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Duration & Faculty Assignment
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Faculty Mentor *</label>
              <select
                value={assignedFaculty}
                onChange={(e) => setAssignedFaculty(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                required
              >
                <option value="">Select Mentor</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.designation || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg text-xs text-sky-800 flex items-center justify-between">
              <span>Calculated Schedule Duration:</span>
              <strong className="text-sky-900 font-bold">{totalDays} Day{totalDays > 1 ? 's' : ''}</strong>
            </div>
          )}
        </div>

        {/* Step 3: Reason & Supporting Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Detailed Reason & Supporting Evidence
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Statement of Reason *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the clear justification for this request..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Description / Comments</label>
            <textarea
              rows={2}
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              placeholder="Any additional notes for the reviewers..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload Supporting Attachment (Brochure, Medical Certificate, Offer Letter, etc.)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 p-4 rounded-xl text-center cursor-pointer transition">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setDocumentFile(e.target.files[0])}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-xs font-semibold text-sky-600 hover:underline block mt-1">
                  {documentFile ? documentFile.name : 'Click to browse files (PDF, PNG, JPG, DOC)'}
                </span>
                <span className="text-[10px] text-slate-400">Max size: 10MB</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Submitting Application...' : 'Submit Permission Application'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitRequest;
