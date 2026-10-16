import React, { useState } from 'react';
import {
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  AlertOctagon,
  ShieldCheck,
  QrCode,
  FileText,
  X,
  Filter,
} from 'lucide-react';
import {
  AttendanceRecord,
  LeaveRequest,
  Employee,
  Department,
  UserRole,
} from '../types/campus.ts';

interface AttendanceLeaveViewProps {
  currentRole: UserRole;
  currentUserName: string;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  employees: Employee[];
  departments: Department[];
  onRefresh: () => void;
}

export const AttendanceLeaveView: React.FC<AttendanceLeaveViewProps> = ({
  currentRole,
  currentUserName,
  attendance,
  leaves,
  employees,
  departments,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'leaves'>('attendance');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);

  // Leave Form
  const [leaveEmpId, setLeaveEmpId] = useState('');
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Duty' | 'Emergency'>('Casual');
  const [leaveStart, setLeaveStart] = useState('2026-10-17');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-18');
  const [leaveReason, setLeaveReason] = useState('');

  // Punch Form
  const [punchEmpId, setPunchEmpId] = useState('');
  const [punchMethod, setPunchMethod] = useState<'supervisor_verified' | 'qr_scanner' | 'manual'>('supervisor_verified');
  const [punchVerifier, setPunchVerifier] = useState(currentUserName);

  // Filter
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredAttendance = attendance.filter((a) => {
    if (deptFilter !== 'all' && a.departmentId !== deptFilter) return false;
    return true;
  });

  const filteredLeaves = leaves.filter((l) => {
    if (deptFilter !== 'all' && l.departmentId !== deptFilter) return false;
    return true;
  });

  // Handle Submit Leave
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: leaveEmpId,
          leaveType,
          startDate: leaveStart,
          endDate: leaveEnd,
          reason: leaveReason,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowLeaveModal(false);
      setLeaveReason('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review Leave
  const handleReviewLeave = async (leaveId: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/leaves/${leaveId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerName: currentUserName,
          reviewerRole: currentRole,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Direct Punch
  const handlePunchAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: punchEmpId,
          method: punchMethod,
          verifiedBy: punchVerifier,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowPunchModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Workforce Verification & Time Tracking</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Authentic Multi-Channel Verification</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Attendance & Leave Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Check-in/out records distinguishing supervisor verified, QR digital scans, and sanctioned leave requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowPunchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Record Punch</span>
          </button>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs & Department Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeSubTab === 'attendance'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance Logs ({filteredAttendance.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeSubTab === 'leaves'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leave Applications ({filteredLeaves.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            aria-label="Filter attendance by department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tab 1: Attendance Log Table */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 font-medium">Date</th>
                  <th className="py-2.5 font-medium">Employee</th>
                  <th className="py-2.5 font-medium">Department</th>
                  <th className="py-2.5 font-medium">Shift</th>
                  <th className="py-2.5 font-medium">Check-In Time</th>
                  <th className="py-2.5 font-medium">Verification Method</th>
                  <th className="py-2.5 font-medium">Verified By</th>
                  <th className="py-2.5 font-medium text-right">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono tabular-nums text-slate-700">{rec.date}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{rec.employeeName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{rec.employeeCode}</div>
                    </td>
                    <td className="py-3 text-slate-600">{rec.departmentName}</td>
                    <td className="py-3 font-medium text-slate-800">{rec.shiftName}</td>
                    <td className="py-3 font-mono tabular-nums font-bold text-slate-900">
                      {rec.checkIn}
                    </td>
                    <td className="py-3 font-mono text-[11px]">
                      {rec.verificationMethod === 'supervisor_verified' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Supervisor Verified</span>
                        </span>
                      ) : rec.verificationMethod === 'qr_scanner' ? (
                        <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1 w-fit">
                          <QrCode className="w-3 h-3" />
                          <span>Device / QR Scan</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Manual Register Log
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-700 font-medium">
                      {rec.verifiedBy || 'System Daemon'}
                    </td>
                    <td className="py-3 text-right text-slate-500 font-mono text-[11px]">
                      {rec.notes || 'Routine punch confirmed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Leaves Management */}
      {activeSubTab === 'leaves' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 font-medium">Staff Applicant</th>
                  <th className="py-2.5 font-medium">Leave Type</th>
                  <th className="py-2.5 font-medium">Duration Range</th>
                  <th className="py-2.5 font-medium">Reason</th>
                  <th className="py-2.5 font-medium">Suggested Replacement Cover</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{leave.employeeName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{leave.departmentName}</div>
                    </td>
                    <td className="py-3 font-semibold text-indigo-700">{leave.leaveType}</td>
                    <td className="py-3 font-mono tabular-nums text-slate-700">
                      {leave.startDate} ⟶ {leave.endDate}
                    </td>
                    <td className="py-3 max-w-xs text-slate-700 leading-snug">{leave.reason}</td>
                    <td className="py-3 text-slate-800 font-medium">
                      {leave.replacementEmployeeName || 'None assigned'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          leave.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : leave.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {leave.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewLeave(leave.id, 'reject')}
                            className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleReviewLeave(leave.id, 'approve')}
                            className="px-2 py-1 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 rounded"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {leave.approvedBy ? `Reviewed by ${leave.approvedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Apply Leave */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Staff Leave Application</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Employee Applicant</label>
                <select
                  value={leaveEmpId}
                  onChange={(e) => setLeaveEmpId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeCode} · {e.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Leave Classification</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="Casual">Casual Leave (CL)</option>
                  <option value="Sick">Sick Leave (Medical Certificate)</option>
                  <option value="Duty">Duty / Institutional Deputation</option>
                  <option value="Emergency">Emergency Domestic Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Reason & Remarks</label>
                <textarea
                  rows={3}
                  placeholder="State reason for absence and emergency contact details..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Punch Record */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Time Punch</h3>
              <button onClick={() => setShowPunchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePunchAttendance} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Employee Punching In</label>
                <select
                  value={punchEmpId}
                  onChange={(e) => setPunchEmpId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="">Select Staff...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeCode} · {e.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Verification Channel</label>
                <select
                  value={punchMethod}
                  onChange={(e) => setPunchMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="supervisor_verified">Supervisor Physical Verification</option>
                  <option value="qr_scanner">Station QR / Device Scanner</option>
                  <option value="manual">Manual Admin Entry</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Verifier Name / Authority</label>
                <input
                  type="text"
                  value={punchVerifier}
                  onChange={(e) => setPunchVerifier(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPunchModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Confirm & Log Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
