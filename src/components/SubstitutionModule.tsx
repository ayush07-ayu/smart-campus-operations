import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  Search, ShieldCheck, XCircle, Sparkles, Calendar, BookOpen, 
  User as UserIcon, RefreshCw, Check
} from 'lucide-react';
import { SubstitutionRequest, TimetableSlot, User } from '../types';

interface Props {
  substitutions: SubstitutionRequest[];
  currentUser: User;
  slots: TimetableSlot[];
  onRefresh: () => void;
  selectedSlotForSub?: TimetableSlot | null;
  onClearSelectedSlot?: () => void;
}

export const SubstitutionModule: React.FC<Props> = ({
  substitutions,
  currentUser,
  slots,
  onRefresh,
  selectedSlotForSub,
  onClearSelectedSlot
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(selectedSlotForSub?.id || '');
  const [requestDate, setRequestDate] = useState<string>('2026-10-19');
  const [requestReason, setRequestReason] = useState<string>('Academic committee & research meeting');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'awaiting_hod' | 'approved'>('all');

  const mySlots = currentUser.role === 'faculty' 
    ? slots.filter(s => s.facultyId === currentUser.id) 
    : slots;

  useEffect(() => {
    if (selectedSlotForSub) {
      setSelectedSlotId(selectedSlotForSub.id);
    } else if (mySlots.length > 0 && !selectedSlotId) {
      setSelectedSlotId(mySlots[0].id);
    }
  }, [selectedSlotForSub, mySlots]);

  useEffect(() => {
    if (!selectedSlotId) return;
    setIsLoadingCandidates(true);
    setActionMessage(null);

    fetch(`/api/substitutions/find-candidates?slotId=${selectedSlotId}&date=${requestDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.candidates) {
          setCandidates(data.candidates);
          if (data.candidates.length > 0) {
            setSelectedCandidateId(data.candidates[0].faculty.id);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching candidates:', err);
      })
      .finally(() => {
        setIsLoadingCandidates(false);
      });
  }, [selectedSlotId, requestDate]);

  const handleSendRequest = async () => {
    if (!selectedSlotId || !selectedCandidateId) return;

    try {
      const res = await fetch('/api/substitutions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          substituteFacultyId: selectedCandidateId,
          date: requestDate,
          reason: requestReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Duty adjustment request sent to ${data.substitution.substituteFacultyName}. Notification logged.`
        });
        onRefresh();
        if (onClearSelectedSlot) onClearSelectedSlot();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to send request' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Network error' });
    }
  };

  const handleAction = async (subId: string, action: 'accept' | 'decline' | 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/substitutions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ substitutionId: subId, action })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Action '${action.toUpperCase()}' completed successfully. Master schedule synchronized.`
        });
        onRefresh();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Action failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Network error' });
    }
  };

  const filteredSubs = substitutions.filter(s => {
    if (filterTab === 'pending') return s.status === 'Pending';
    if (filterTab === 'awaiting_hod') return s.status === 'Awaiting Approval';
    if (filterTab === 'approved') return s.status === 'Approved';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Awaiting Approval':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Accepted by Substitute':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>Faculty Substitution & Duty Adjustment System</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Candidate recommendation evaluated on timetable availability, subject expertise, and workload balance.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Find & Request Substitute */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>Initiate Duty Adjustment</span>
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Class Requiring Coverage
              </label>
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                {mySlots.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.day} {s.startTime}-{s.endTime} • {s.subjectCode} ({s.roomCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date of Absence
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  placeholder="e.g. Conference duty"
                />
              </div>
            </div>

            {/* Candidates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Ranked Eligible Substitutes
                </span>
                {isLoadingCandidates && (
                  <span className="text-[10px] text-blue-600">Evaluating timetable...</span>
                )}
              </div>

              {candidates.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No conflict-free substitutes found for this hour.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {candidates.map((cand, idx) => {
                    const isSelected = selectedCandidateId === cand.faculty.id;

                    return (
                      <div
                        key={cand.faculty.id}
                        onClick={() => setSelectedCandidateId(cand.faculty.id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{cand.faculty.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {cand.score}% Fit
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {cand.reason}
                        </p>

                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500">
                          <span>Weekly Load: <strong>{cand.weeklyLoad} hrs</strong></span>
                          <span>•</span>
                          <span>Expertise: {cand.faculty.teachingSubjects?.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleSendRequest}
              disabled={!selectedCandidateId || isLoadingCandidates}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Send Substitution Request</span>
            </button>
          </div>
        </div>

        {/* Right: Active Adjustments Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>Duty Adjustment Workflow Tracker</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Request $\rightarrow$ Substitute Accept $\rightarrow$ HOD Authorize $\rightarrow$ Schedule Commit
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterTab === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({substitutions.length})
                </button>
                <button
                  onClick={() => setFilterTab('awaiting_hod')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterTab === 'awaiting_hod' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Awaiting HOD
                </button>
                <button
                  onClick={() => setFilterTab('approved')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterTab === 'approved' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredSubs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  No adjustments found in this view.
                </div>
              ) : (
                filteredSubs.map((sub) => {
                  const isSubstitute = currentUser.id === sub.substituteFacultyId;
                  const canAuthorize = currentUser.role === 'hod' || currentUser.role === 'super_admin';

                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sub.subjectCode}</span>
                          <span className="text-xs text-slate-700">• {sub.subjectName}</span>
                          <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded ${getStatusBadge(sub.status)}`}>
                            {sub.status}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-600">
                          Date: <strong className="text-slate-900">{sub.date}</strong> ({sub.startTime} - {sub.endTime})
                        </span>
                      </div>

                      {/* Faculty exchange */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Original Faculty</span>
                          <span className="font-bold text-slate-900">{sub.originalFacultyName}</span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">Room: {sub.roomCode} • {sub.sectionName}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Assigned Substitute</span>
                          <span className="font-bold text-blue-700">{sub.substituteFacultyName}</span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">Match: {sub.compatibilityScore || 92}% Compatibility</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-700">
                        <span className="text-slate-500 font-semibold">Reason: </span>
                        <span>{sub.reason}</span>
                      </div>

                      {sub.recommendationReason && (
                        <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                          <strong className="text-slate-800">Recommendation Rationale:</strong> {sub.recommendationReason}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-500">
                          Requested: {sub.requestedAt}
                        </span>

                        <div className="flex items-center gap-2">
                          {sub.status === 'Pending' && (isSubstitute || currentUser.role === 'super_admin') && (
                            <>
                              <button
                                onClick={() => handleAction(sub.id, 'decline')}
                                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-rose-700 text-xs font-semibold cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAction(sub.id, 'accept')}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                              >
                                Accept Duty
                              </button>
                            </>
                          )}

                          {sub.status === 'Awaiting Approval' && canAuthorize && (
                            <>
                              <button
                                onClick={() => handleAction(sub.id, 'reject')}
                                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-rose-700 text-xs font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAction(sub.id, 'approve')}
                                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                              >
                                Authorize & Commit Schedule
                              </button>
                            </>
                          )}

                          {sub.status === 'Approved' && (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Live on Master Timetable</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
