import React, { useState, useEffect } from 'react';
import { 
  MessageSquareWarning, Plus, CheckCircle2, AlertTriangle, 
  Clock, MapPin, Search, Filter, ShieldAlert, ArrowRight, 
  User as UserIcon, Send, RefreshCw, ChevronRight, FileText
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus, User } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Classroom or Lab',
  'Computer & Internet',
  'Faculty or Academic',
  'Cleaning & Sanitation',
  'ID Card or Bus Pass',
  'Infrastructure & Maintenance',
  'Hostel & Amenities',
  'Other'
];

export const ComplaintsModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Submit form state
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('Computer & Internet');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('Ramanujan Hall, 3rd Floor, Lab 302');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resolution note state
  const [resolutionRemarks, setResolutionRemarks] = useState<string>('');
  const [statusAction, setStatusAction] = useState<ComplaintStatus>('In Progress');

  const fetchComplaints = () => {
    setIsLoading(true);
    fetch('/api/complaints')
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        if (data.length > 0 && !selectedComplaint) {
          setSelectedComplaint(data[0]);
        }
      })
      .catch(err => console.error('Complaints fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          subject: newSubject,
          description: newDescription,
          location: newLocation,
          priority: newPriority
        })
      });

      const data = await res.json();
      if (data.success) {
        setFormMsg({
          type: 'success',
          text: `Grievance registered under Reference #${data.complaint.referenceNo}. Assigned to maintenance cell.`
        });
        setTimeout(() => {
          setShowSubmitModal(false);
          setFormMsg(null);
          setNewSubject('');
          setNewDescription('');
          fetchComplaints();
          onRefresh();
        }, 1400);
      } else {
        setFormMsg({ type: 'error', text: data.error || 'Failed to submit grievance' });
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err?.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusAction,
          remarks: resolutionRemarks,
          note: resolutionRemarks
        })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedComplaint(data.complaint);
        setResolutionRemarks('');
        fetchComplaints();
        onRefresh();
      }
    } catch (err: any) {
      console.error('Update complaint error:', err);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Assigned':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Submitted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Awaiting Information':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-rose-700 font-bold';
      case 'High':
        return 'text-amber-800 font-bold';
      default:
        return 'text-slate-600';
    }
  };

  const canResolve = currentUser.role !== 'student';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-blue-700" />
            <span>Student Grievance & Issue Tracking Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official MMU ticketing system for academic, IT infrastructure, laboratory, and campus amenities concerns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lodge New Grievance</span>
          </button>

          <button
            onClick={fetchComplaints}
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
            placeholder="Search by ticket reference (e.g. MMU-GRV-2026-1042), keyword, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
          {['all', 'Submitted', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === st ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Tickets' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left = Ticket List, Right = Ticket Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              No complaints matching current filters.
            </div>
          ) : (
            filteredComplaints.map((c) => {
              const isSelected = selectedComplaint?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-800">
                      {c.referenceNo}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                    {c.subject}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[140px]">{c.location}</span>
                    </span>
                    <span className={getPriorityColor(c.priority)}>Priority: {c.priority}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-7">
          {selectedComplaint ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {selectedComplaint.referenceNo}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedComplaint.subject}
                  </h2>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded border self-start sm:self-auto ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Category</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Priority</span>
                  <span className={`font-semibold ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Logged By</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Cell</span>
                  <span className="text-blue-800 font-semibold">{selectedComplaint.assignedTo || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Logged At</span>
                  <span className="text-slate-600">{selectedComplaint.createdAt}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Last Update</span>
                  <span className="text-slate-600">{selectedComplaint.updatedAt}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Issue Description
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>Verified Location: <strong>{selectedComplaint.location}</strong></span>
              </div>

              {selectedComplaint.resolutionRemarks && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">
                    Official Resolution Remarks
                  </span>
                  <p className="text-emerald-900">{selectedComplaint.resolutionRemarks}</p>
                </div>
              )}

              {selectedComplaint.internalNotes && selectedComplaint.internalNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Technician Action Log
                  </h4>
                  <div className="space-y-1.5">
                    {selectedComplaint.internalNotes.map((note, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canResolve && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Staff Resolution Controls</span>
                  </h4>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={statusAction}
                      onChange={(e) => setStatusAction(e.target.value as ComplaintStatus)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    >
                      <option value="Assigned">Status: Assigned</option>
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Awaiting Information">Status: Awaiting Info</option>
                      <option value="Resolved">Status: Resolved</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Add technician inspection notes or resolution remarks..."
                      value={resolutionRemarks}
                      onChange={(e) => setResolutionRemarks(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    />

                    <button
                      onClick={handleUpdateStatus}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Update Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Select a complaint ticket from the list to view its tracking details.
            </div>
          )}
        </div>
      </div>

      {/* Submit Complaint Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-blue-700" />
              <span>Submit Campus Grievance or Work Order</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Your ticket will be assigned a verifiable tracking number and routed to the corresponding department.
            </p>

            {formMsg && (
              <div className={`p-3 mb-4 rounded-xl text-xs flex items-center gap-2 ${
                formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value="Low">Low (General suggestion)</option>
                    <option value="Medium">Medium (Affects individual work)</option>
                    <option value="High">High (Affects ongoing lab/class)</option>
                    <option value="Urgent">Urgent (Safety / Critical outage)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 302 PC #22 monitor display artifacting"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Specific Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ramanujan Hall, 3rd Floor, Lab 302 (Workstation 22)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain when the issue occurred and any error messages seen..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
