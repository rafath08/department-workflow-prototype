import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  MapPin,
  Tag,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

export const EventCalendar = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isApprover = role === 'faculty' || role === 'hod' || role === 'admin';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  // New Event Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('Academic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('Campus');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    try {
      setSubmitting(true);
      setMsg('');
      const res = await api.post('/events', {
        title,
        description,
        eventType,
        startDate,
        endDate,
        location,
        department: user?.department || 'All Departments'
      });

      if (res.data.success) {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setShowAddForm(false);
        setMsg('Event scheduled on institutional calendar!');
        await fetchEvents();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete event from schedule?')) return;
    try {
      await api.delete(`/events/${id}`);
      await fetchEvents();
    } catch (err) {
      console.error('Delete event error:', err);
    }
  };

  const filteredEvents = events.filter(
    (e) => filterType === 'ALL' || e.eventType === filterType
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-sky-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-300">
            Schedules & Deadlines
          </span>
          <h2 className="text-2xl font-bold mt-1">Department Event & Activity Calendar</h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
            Track academic milestones, OD eligible symposiums, hackathon deadlines, and institutional evaluation dates.
          </p>
        </div>

        {isApprover && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            {showAddForm ? 'Close Form' : 'Schedule Event'}
          </button>
        )}
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Add Event Form Modal / Accordion */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            Schedule New Department Event
          </h3>
          <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Hackathon / Paper Submission Deadline"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="OD Event">OD Event</option>
                  <option value="Symposium / Conference">Symposium / Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Exam">Exam</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium / Lab 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event details, participant eligibility, guidelines..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow"
              >
                {submitting ? 'Scheduling...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {['ALL', 'OD Event', 'Academic', 'Symposium / Conference', 'Workshop', 'Deadline'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${
              filterType === cat
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Activities' : cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading calendar events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No events scheduled under this category.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {evt.eventType}
                  </span>

                  {(role === 'hod' || role === 'admin') && (
                    <button
                      onClick={() => handleDeleteEvent(evt._id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h4 className="font-bold text-slate-800 text-sm mt-2">{evt.title}</h4>
                {evt.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    {new Date(evt.startDate).toLocaleDateString()}
                    {new Date(evt.endDate).toLocaleDateString() !== new Date(evt.startDate).toLocaleDateString() &&
                      ` to ${new Date(evt.endDate).toLocaleDateString()}`}
                  </span>
                </div>
                {evt.location && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
