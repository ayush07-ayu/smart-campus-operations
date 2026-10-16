import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Settings2,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
  X,
  Filter,
} from 'lucide-react';
import {
  Department,
  CampusLocation,
  Employee,
  ShiftDefinition,
  DutyAssignment,
  ShiftSwapRequest,
  UserRole,
} from '../types/campus.ts';

interface DutyRosterViewProps {
  currentRole: UserRole;
  currentUserName: string;
  departments: Department[];
  locations: CampusLocation[];
  employees: Employee[];
  shifts: ShiftDefinition[];
  assignments: DutyAssignment[];
  swapRequests: ShiftSwapRequest[];
  onRefresh: () => void;
  onOpenAiAssistant: () => void;
}

export const DutyRosterView: React.FC<DutyRosterViewProps> = ({
  currentRole,
  currentUserName,
  departments,
  locations,
  employees,
  shifts,
  assignments,
  swapRequests,
  onRefresh,
  onOpenAiAssistant,
}) => {
  // Calendar view mode: 'day' | 'week' | 'month'
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-10-16');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showShiftConfigModal, setShowShiftConfigModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetAssignment, setSwapTargetAssignment] = useState<DutyAssignment | null>(null);

  // Form states for assignment
  const [formDate, setFormDate] = useState('2026-10-16');
  const [formShiftId, setFormShiftId] = useState(shifts[0]?.id || 'shift-morn');
  const [formLocationId, setFormLocationId] = useState(locations[0]?.id || '');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  // Swap form state
  const [swapTargetEmployeeId, setSwapTargetEmployeeId] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);

  // Auto-schedule state
  const [autoScheduleLoading, setAutoScheduleLoading] = useState(false);
  const [autoScheduleMessage, setAutoScheduleMessage] = useState<string | null>(null);

  // Shift Timing edit state
  const [editingShifts, setEditingShifts] = useState<ShiftDefinition[]>(shifts);

  // Week days starting from 2026-10-12 (Mon) to 2026-10-18 (Sun)
  const currentWeekDays = [
    { date: '2026-10-12', label: 'Mon', dayNum: '12' },
    { date: '2026-10-13', label: 'Tue', dayNum: '13' },
    { date: '2026-10-14', label: 'Wed', dayNum: '14' },
    { date: '2026-10-15', label: 'Thu', dayNum: '15' },
    { date: '2026-10-16', label: 'Fri (Today)', dayNum: '16' },
    { date: '2026-10-17', label: 'Sat', dayNum: '17' },
    { date: '2026-10-18', label: 'Sun', dayNum: '18' },
  ];

  // Month days for October 2026
  const monthDays = Array.from({ length: 31 }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `2026-10-${d}`;
  });

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    if (deptFilter !== 'all' && a.departmentId !== deptFilter) return false;
    if (locationFilter !== 'all' && a.locationId !== locationFilter) return false;
    if (viewMode === 'day' && a.date !== selectedDate) return false;
    if (viewMode === 'week') {
      const datesInWeek = currentWeekDays.map((w) => w.date);
      if (!datesInWeek.includes(a.date)) return false;
    }
    return true;
  });

  // Pending suggested assignments
  const suggestedAssignments = assignments.filter((a) => a.isSuggested || a.status === 'suggested');

  // Handle Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError(null);
    setAssignLoading(true);

    try {
      const res = await fetch('/api/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formDate,
          shiftId: formShiftId,
          locationId: formLocationId,
          employeeId: formEmployeeId,
          notes: formNotes,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.error || 'Failed to create assignment.');
      } else {
        setShowAssignModal(false);
        setFormNotes('');
        onRefresh();
      }
    } catch (err: any) {
      setAssignError(err.message || 'Network error');
    } finally {
      setAssignLoading(false);
    }
  };

  // Run Scheduling Assistant
  const handleRunAutoSchedule = async () => {
    setAutoScheduleLoading(true);
    setAutoScheduleMessage(null);
    try {
      const res = await fetch('/api/roster/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          departmentId: deptFilter === 'all' ? undefined : deptFilter,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAutoScheduleMessage(
          `Scheduling Assistant proposed ${data.suggestionsCount} optimal duty assignments for ${selectedDate}.`
        );
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAutoScheduleLoading(false);
    }
  };

  // Confirm Suggestions
  const handleConfirmSuggestions = async () => {
    try {
      const res = await fetch('/api/roster/confirm-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      if (res.ok) {
        setAutoScheduleMessage(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this duty assignment?')) return;
    try {
      await fetch(`/api/roster/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Shift Swap Submit
  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapTargetAssignment) return;
    setSwapError(null);
    setSwapLoading(true);

    try {
      const res = await fetch('/api/roster/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: swapTargetAssignment.id,
          requestingEmployeeId: swapTargetAssignment.employeeId,
          targetEmployeeId: swapTargetEmployeeId,
          reason: swapReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSwapError(data.error || 'Failed to submit swap');
      } else {
        setShowSwapModal(false);
        setSwapReason('');
        onRefresh();
      }
    } catch (err: any) {
      setSwapError(err.message || 'Error submitting swap');
    } finally {
      setSwapLoading(false);
    }
  };

  // Review Swap
  const handleReviewSwap = async (swapId: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/roster/swaps/${swapId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerName: currentUserName,
          reviewerRole: currentRole,
          supervisorRemarks: `Reviewed by ${currentUserName}`,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Shift Timings
  const handleSaveShiftTimings = async (shift: ShiftDefinition) => {
    try {
      await fetch(`/api/shifts/${shift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: shift.startTime,
          endTime: shift.endTime,
          colorTag: shift.colorTag,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Export Roster as CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Shift',
      'Hours',
      'Department',
      'Location',
      'Employee Code',
      'Employee Name',
      'Status',
      'Attendance',
      'Notes',
    ];
    const rows = filteredAssignments.map((a) => [
      a.date,
      a.shiftName,
      a.shiftHours,
      a.departmentName,
      `"${a.locationName}"`,
      a.employeeCode,
      `"${a.employeeName}"`,
      a.status,
      a.attendanceStatus,
      `"${a.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_duty_roster_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Roster Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Staff Scheduling & Shift Management</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Conflict & Leave Guard Enabled</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Duty Roster Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage guards, hostel staff, mess workers, bus drivers, and maintenance shifts with quota validation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowShiftConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Shift Timings</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Roster (CSV)</span>
          </button>

          <button
            onClick={handleRunAutoSchedule}
            disabled={autoScheduleLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${autoScheduleLoading ? 'animate-spin' : ''}`} />
            <span>Scheduling Assistant</span>
          </button>

          <button
            onClick={() => {
              setAssignError(null);
              setShowAssignModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Duty</span>
          </button>
        </div>
      </div>

      {/* Suggested Assignments Alert Banner */}
      {suggestedAssignments.length > 0 && (
        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong className="font-semibold">{suggestedAssignments.length} Suggested Duty Assignments</strong> proposed by the Assistant waiting for supervisor confirmation.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleConfirmSuggestions}
              className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Confirm & Lock All Suggestions
            </button>
          </div>
        </div>
      )}

      {autoScheduleMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{autoScheduleMessage}</span>
          <button onClick={() => setAutoScheduleMessage(null)} className="text-emerald-600 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Filters and View Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Roster
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly View
          </button>
        </div>

        {/* Center / Right: Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Filter by department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <select
            aria-label="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Campus Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Date:</span>
            <input
              type="date"
              aria-label="Select Roster Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Week Selector Bar (if in week mode) */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {currentWeekDays.map((w) => {
            const count = assignments.filter((a) => a.date === w.date).length;
            const isSelected = selectedDate === w.date;
            return (
              <button
                key={w.date}
                onClick={() => setSelectedDate(w.date)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-[11px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {w.label}
                </div>
                <div className="text-lg font-bold font-mono tabular-nums leading-tight mt-0.5">
                  {w.dayNum}
                </div>
                <div className={`text-[10px] mt-1 font-mono tabular-nums ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {count} shifts
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Minimum Staffing Compliance Overview for Selected Date */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Location Staffing Quotas · {selectedDate}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured minimum staff requirements per post and current assignment compliance.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {locations.length} designated locations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          {locations.slice(0, 6).map((loc) => {
            const morningCount = assignments.filter(
              (a) => a.date === selectedDate && a.locationId === loc.id && a.shiftCode === 'morning' && a.status !== 'absent'
            ).length;
            const eveningCount = assignments.filter(
              (a) => a.date === selectedDate && a.locationId === loc.id && a.shiftCode === 'evening' && a.status !== 'absent'
            ).length;
            const nightCount = assignments.filter(
              (a) => a.date === selectedDate && a.locationId === loc.id && a.shiftCode === 'night' && a.status !== 'absent'
            ).length;

            const mReq = loc.minStaffPerShift.morning;
            const eReq = loc.minStaffPerShift.evening;
            const nReq = loc.minStaffPerShift.night;

            const isAllMet = morningCount >= mReq && eveningCount >= eReq && nightCount >= nReq;

            return (
              <div
                key={loc.id}
                className={`p-3.5 rounded-lg border text-xs transition-colors ${
                  isAllMet ? 'bg-slate-50/70 border-slate-200' : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="truncate pr-2">{loc.name}</span>
                  {isAllMet ? (
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">Quota Met</span>
                  ) : (
                    <span className="text-[10px] text-rose-700 font-semibold uppercase">Deficit</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-200/60 font-mono text-[11px] tabular-nums">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Morn</span>
                    <span className={morningCount >= mReq ? 'text-slate-700' : 'text-rose-600 font-bold'}>
                      {morningCount}/{mReq}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Eve</span>
                    <span className={eveningCount >= eReq ? 'text-slate-700' : 'text-rose-600 font-bold'}>
                      {eveningCount}/{eReq}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Night</span>
                    <span className={nightCount >= nReq ? 'text-slate-700' : 'text-rose-600 font-bold'}>
                      {nightCount}/{nReq}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Duty Assignments Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Rostered Duties ({filteredAssignments.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Staff duty schedule, check-in method, attendance state and replacement actions.
            </p>
          </div>
          <span className="text-xs text-slate-400">Showing filtered assignments</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-2.5 font-medium">Date</th>
                <th className="py-2.5 font-medium">Shift & Hours</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">Assigned Staff</th>
                <th className="py-2.5 font-medium">Department</th>
                <th className="py-2.5 font-medium">Attendance</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No duties currently assigned matching these filters. Click "Assign Duty" or run the "Scheduling Assistant" to generate assignments.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono tabular-nums text-slate-700">{a.date}</td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-900 block">{a.shiftName}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">{a.shiftHours}</span>
                    </td>
                    <td className="py-3 text-slate-800 font-medium">{a.locationName}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{a.employeeName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{a.employeeCode}</div>
                    </td>
                    <td className="py-3 text-slate-600">{a.departmentName}</td>
                    <td className="py-3 font-mono tabular-nums">
                      {a.attendanceStatus === 'present' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Punched ({a.checkInTime})</span>
                        </span>
                      ) : a.attendanceStatus === 'missed' ? (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Missed</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3">
                      {a.status === 'suggested' ? (
                        <span className="text-indigo-600 font-semibold text-[11px] bg-indigo-50 px-2 py-0.5 rounded">
                          Suggested Proposal
                        </span>
                      ) : a.status === 'absent' ? (
                        <span className="text-rose-600 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded">
                          Absent / Leave
                        </span>
                      ) : (
                        <span className="text-slate-700 font-medium">Scheduled</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSwapTargetAssignment(a);
                            setSwapTargetEmployeeId('');
                            setShowSwapModal(true);
                          }}
                          title="Propose Shift Swap / Replacement"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          title="Remove assignment"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Swap Requests Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Shift Swaps & Replacement Authorization Queue
            </h2>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {swapRequests.length} total swap records
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {swapRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No shift swap requests currently pending review.
            </p>
          ) : (
            swapRequests.map((swap) => (
              <div
                key={swap.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>{swap.requestingEmployeeName}</span>
                    <span className="text-slate-400">⟶</span>
                    <span className="text-indigo-700">{swap.targetEmployeeName}</span>
                    <span className="text-slate-400 font-mono font-normal">· Date: {swap.date}</span>
                  </div>
                  <p className="text-slate-600 mt-1">Reason: "{swap.reason}"</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Requested on {new Date(swap.createdAt).toLocaleDateString()} · Status:{' '}
                    <span className="uppercase font-semibold text-slate-700">{swap.status}</span>
                  </span>
                </div>

                {swap.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReviewSwap(swap.id, 'reject')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReviewSwap(swap.id, 'approve')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      Approve & Reassign
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Assign Duty */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Assign Campus Duty</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Roster Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Shift Type</label>
                <select
                  value={formShiftId}
                  onChange={(e) => setFormShiftId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Campus Location / Post</label>
                <select
                  value={formLocationId}
                  onChange={(e) => setFormLocationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Employee / Staff Member</label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Employee...</option>
                  {employees
                    .filter((e) => e.status === 'active')
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode} · {emp.jobTitle})
                      </option>
                    ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Backend will automatically enforce leave validation and prevent overlapping duty shifts.
                </span>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Assignment Notes / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. In charge of visitor logs and barricade keys"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {assignLoading ? 'Validating Conflicts...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift Swaps */}
      {showSwapModal && swapTargetAssignment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Request Shift Replacement / Swap</h3>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {swapError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{swapError}</span>
              </div>
            )}

            <form onSubmit={handleSwapSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500">Current Duty:</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {swapTargetAssignment.shiftName} at {swapTargetAssignment.locationName}
                </div>
                <div className="text-slate-500 font-mono tabular-nums text-[11px]">
                  Date: {swapTargetAssignment.date} · Staff: {swapTargetAssignment.employeeName}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Target Replacement Staff</label>
                <select
                  value={swapTargetEmployeeId}
                  onChange={(e) => setSwapTargetEmployeeId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Replacement Colleague...</option>
                  {employees
                    .filter((e) => e.id !== swapTargetAssignment.employeeId && e.status === 'active')
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode} · {emp.jobTitle})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Reason for Swap / Replacement</label>
                <textarea
                  rows={3}
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="e.g. Unforeseen medical appointment, personal emergency"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={swapLoading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {swapLoading ? 'Validating...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift Timings Configuration */}
      {showShiftConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Shift Timings</h3>
                <p className="text-xs text-slate-500">Configure start and end timings for all campus departments.</p>
              </div>
              <button
                onClick={() => setShowShiftConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              {editingShifts.map((shift, idx) => (
                <div key={shift.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{shift.name}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">{shift.code}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">Start Time (24h)</span>
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => {
                          const updated = [...editingShifts];
                          updated[idx].startTime = e.target.value;
                          setEditingShifts(updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">End Time (24h)</span>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => {
                          const updated = [...editingShifts];
                          updated[idx].endTime = e.target.value;
                          setEditingShifts(updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveShiftTimings(shift)}
                    className="mt-1 px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Save Timings
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setShowShiftConfigModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
