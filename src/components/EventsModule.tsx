import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, MapPin, Clock, Briefcase, 
  Plus, Search, Filter, CheckCircle2, AlertCircle, AlertTriangle,
  ExternalLink, Users, RefreshCw
} from 'lucide-react';
import { CampusEvent, User } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

export const EventsModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New event form state
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<any>('Seminar');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('2026-10-30');
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [endTime, setEndTime] = useState<string>('01:00 PM');
  const [venue, setVenue] = useState<string>('Aryabhata Central Seminar Hall');
  const [eligibleAudience, setEligibleAudience] = useState<string>('All MCA, BCA and B.Sc AI/ML Students');
  const [isPlacement, setIsPlacement] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [packageOffered, setPackageOffered] = useState<string>('');

  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          date,
          startTime,
          endTime,
          venue,
          eligibleAudience,
          isPlacement,
          companyName,
          packageOffered
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Event published successfully! In-app notification broadcasted to all students.`
        });
        setTimeout(() => {
          setShowCreateModal(false);
          setMessage(null);
          setTitle('');
          setDescription('');
          fetchEvents();
          onRefresh();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to publish event' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.eligibleAudience.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCategory === 'placement') return e.isPlacement;
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    return true;
  });

  const canCreate = currentUser.role !== 'student';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-700" />
            <span>Campus Events & Placement Drives</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central Training & Placement Cell (T&P) and Academic Department announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Event</span>
            </button>
          )}

          <button
            onClick={fetchEvents}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, company recruitment drives, or venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterCategory === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setFilterCategory('placement')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterCategory === 'placement' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Placement Drives
          </button>
          <button
            onClick={() => setFilterCategory('Workshop')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterCategory === 'Workshop' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Workshops
          </button>
          <button
            onClick={() => setFilterCategory('Seminar')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterCategory === 'Seminar' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Seminars
          </button>
        </div>
      </div>

      {/* Events Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map(evt => (
          <div
            key={evt.id}
            className={`bg-white border rounded-xl p-5 shadow-xs transition-colors flex flex-col justify-between ${
              evt.isPlacement ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  evt.isPlacement 
                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {evt.category}
                </span>

                <span className="text-[10px] text-slate-500 font-medium">
                  {evt.organizingDepartment}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                {evt.title}
              </h3>

              {evt.isPlacement && (
                <div className="mt-2 p-2.5 rounded-lg bg-blue-100/70 border border-blue-200 text-xs flex items-center justify-between">
                  <span className="text-blue-900 font-bold">{evt.companyName}</span>
                  <span className="text-blue-800 font-extrabold">{evt.packageOffered}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {evt.description}
              </p>

              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                  <span>{evt.date} • {evt.startTime} - {evt.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                  <span className="truncate text-[11px] text-slate-500">{evt.eligibleAudience}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Registered: <strong className="text-slate-800">{evt.registeredCount} Students</strong>
              </span>

              <button
                onClick={() => alert(`Registered for ${evt.title}! Confirmation sent to ${currentUser.email}.`)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Publish University Event or Notice</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All eligible students and faculty will receive in-app notification alerts.
            </p>

            {message && (
              <div className={`p-3 mb-4 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. AWS & Cloud Computing Masterclass"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsPlacement(e.target.value === 'Placement Drive');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Department Meeting">Department Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              {isPlacement && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">Recruiting Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Google India / TCS"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">CTC Package Offered</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹ 8.5 LPA – 12 LPA"
                      value={packageOffered}
                      onChange={(e) => setPackageOffered(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campus Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Eligible Audience</label>
                  <input
                    type="text"
                    value={eligibleAudience}
                    onChange={(e) => setEligibleAudience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  placeholder="Outline topics covered or registration criteria..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
