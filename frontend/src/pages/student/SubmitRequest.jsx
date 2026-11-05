import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Briefcase
} from 'lucide-react';
import api from '../../services/api';

export const SubmitRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestType, setRequestType] = useState('On-Duty');
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

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalDays, setTotalDays] = useState(1);

  useEffect(() => {
    // Fetch faculty mentors for this department
    const fetchMentors = async () => {
      try {
        const res = await api.get(`/auth/mentors?department=${encodeURIComponent(user?.department || '')}`);
        if (res.data.success) {
          setMentors(res.data.data);
          // Auto select user's assigned mentor if present, or first in list
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

  // Recalculate duration whenever start or end date changes
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
      setError('Please fill in all event details (Name, Location, Organizing Institution).');
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

      if (documentFile) {
        formData.append('document', documentFile);
      }

      const res = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Submit application error:', err);
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const isEventRequired = requestType === 'On-Duty' || requestType === 'Event Participation';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Submit Permission Request</h2>
        <p className="text-xs text-slate-500">
          Create an institutional approval workflow for On-Duty (OD), Leave, or Event Participation.
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
            1. Select Request Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'On-Duty', label: 'On-Duty (OD)', desc: 'Official duties, seminars, symposia' },
              { id: 'Leave', label: 'Leave Request', desc: 'Medical, personal, emergency leave' },
              { id: 'Event Participation', label: 'Event Participation', desc: 'Hackathons, sports, cultural events' },
              { id: 'Other Permission', label: 'Other Permission', desc: 'Lab access, certificates, library' }
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setRequestType(type.id)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  requestType === type.id
                    ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{type.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{type.desc}</div>
                </div>
                {requestType === type.id && (
                  <div className="mt-2 text-sky-600 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Automatically Populated Student Profile */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider block">
            Student Profile Details (Automatically Populated)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-slate-400 block">Student Name</span>
              <span className="font-bold text-slate-800">{user?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Registration Number</span>
              <span className="font-bold text-slate-800">{user?.regNo || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Department</span>
              <span className="font-bold text-slate-800 truncate block">{user?.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Year & Section</span>
              <span className="font-bold text-slate-800">{user?.year} - {user?.section}</span>
            </div>
          </div>
        </div>

        {/* Step 3: Application Core Fields */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Request Information
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Faculty / Mentor <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={assignedFaculty}
                  onChange={(e) => setAssignedFaculty(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="">Select Designated Faculty Mentor...</option>
                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration & Schedule <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400">Start Date</span>
                </div>
                <div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    End Date ({totalDays > 0 ? `${totalDays} ${totalDays > 1 ? 'days' : 'day'}` : 'Invalid'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Request <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="e.g. Attending AI Hackathon Grand Finale / Medical leave for fever"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description / Justification
            </label>
            <textarea
              rows={2}
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              placeholder="Provide any additional context for the approvers..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Step 4: Dynamic Fields for OD & Event Participation */}
        {isEventRequired && (
          <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-700" />
              <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider">
                3. Event Specific Details (Required for {requestType})
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required={isEventRequired}
                  placeholder="e.g. National Autonomous AI Conclave 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organizing Institution <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={organizingInstitution}
                  onChange={(e) => setOrganizingInstitution(e.target.value)}
                  required={isEventRequired}
                  placeholder="e.g. IIT Madras / IEEE Student Chapter"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Location / Venue <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required={isEventRequired}
                    placeholder="e.g. IC&SR Hall, IIT Madras, Chennai"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Description / Student Role
                </label>
                <input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="e.g. Selected finalist team member presenting paper"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Supporting Document Upload */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isEventRequired ? '4' : '3'}. Supporting Document Upload (Optional)
          </label>
          <p className="text-xs text-slate-500">
            Attach invitation letters, event brochures, doctor medical certificates, or approval letters (PDF, DOCX, PNG, JPG).
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-sky-500 transition bg-slate-50/50">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              id="file-upload"
              onChange={(e) => setDocumentFile(e.target.files[0])}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
            >
              Click to browse file
            </label>
            <span className="text-xs text-slate-400 ml-1">or drag & drop</span>
            {documentFile && (
              <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full inline-block border border-emerald-200">
                Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Submit Permission Request'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitRequest;
