import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Clock,
  UserCheck,
  ShieldCheck,
  FileText,
  X,
  Search,
} from 'lucide-react';
import {
  HostelComplaint,
  HostelInspection,
  VisitorRecord,
  Employee,
  UserRole,
} from '../types/campus.ts';

interface HostelViewProps {
  currentRole: UserRole;
  currentUserName: string;
  hostelComplaints: HostelComplaint[];
  hostelInspections: HostelInspection[];
  visitors: VisitorRecord[];
  employees: Employee[];
  onRefresh: () => void;
}

export const HostelView: React.FC<HostelViewProps> = ({
  currentRole,
  currentUserName,
  hostelComplaints,
  hostelInspections,
  visitors,
  employees,
  onRefresh,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState<HostelComplaint | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  // New Complaint Form
  const [formBlock, setFormBlock] = useState<'Block A (Boys)' | 'Block B (Girls)' | 'Block C (PG Scholars)'>('Block A (Boys)');
  const [formRoom, setFormRoom] = useState('');
  const [formStudent, setFormStudent] = useState('');
  const [formRoll, setFormRoll] = useState('');
  const [formCategory, setFormCategory] = useState<'Electrical' | 'Plumbing' | 'Carpentry' | 'Internet/Wi-Fi' | 'Cleaning'>('Electrical');
  const [formPriority, setFormPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [formDesc, setFormDesc] = useState('');
  const [formAssignedId, setFormAssignedId] = useState('');
  const [formDeadline, setFormDeadline] = useState('2026-10-18');

  // Visitor Form
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visStudent, setVisStudent] = useState('');
  const [visBlock, setVisBlock] = useState('Block B (Girls)');
  const [visRoom, setVisRoom] = useState('');

  const todayStr = '2026-10-16';

  // Filter complaints
  const filteredComplaints = hostelComplaints.filter((c) => {
    if (selectedBlock === 'All') return true;
    return c.hostelBlock.includes(selectedBlock);
  });

  // Handle Create Complaint
  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/hostel/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostelBlock: formBlock,
          roomNumber: formRoom,
          residentName: formStudent,
          studentRollNo: formRoll,
          category: formCategory,
          priority: formPriority,
          description: formDesc,
          assignedStaffId: formAssignedId,
          deadline: formDeadline,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowComplaintModal(false);
      setFormRoom('');
      setFormStudent('');
      setFormDesc('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Resolve Complaint
  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    try {
      await fetch(`/api/hostel/complaints/${activeComplaint.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          resolutionRemarks,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowResolveModal(false);
      setResolutionRemarks('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Visitor
  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/hostel/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: visName,
          contactNumber: visPhone,
          residentVisited: visStudent,
          hostelBlock: visBlock,
          roomNumber: visRoom,
          idProofType: 'National ID',
        }),
      });
      setShowVisitorModal(false);
      setVisName('');
      setVisPhone('');
      setVisStudent('');
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
            <span>Student Residential Services</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Warden Operations & Grievances</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostel Administration & Caretaking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Room maintenance complaints, hygiene inspection scoring, visitor in-out registers, and student welfare.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowVisitorModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Log Visitor</span>
          </button>
          <button
            onClick={() => setShowComplaintModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register Grievance</span>
          </button>
        </div>
      </div>

      {/* Block Filter Segmented Buttons */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit text-xs font-medium">
        {(['All', 'Block A', 'Block B', 'Block C'] as const).map((block) => (
          <button
            key={block}
            onClick={() => setSelectedBlock(block)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedBlock === block
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {block === 'All' ? 'All Hostel Blocks' : block}
          </button>
        ))}
      </div>

      {/* Hostel Complaints Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hostel Maintenance Grievances ({filteredComplaints.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned technicians, target SLA deadlines, and resolution remarks.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredComplaints.filter((c) => c.status !== 'resolved').length} unresolved
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-2.5 font-medium">Code</th>
                <th className="py-2.5 font-medium">Hostel & Room</th>
                <th className="py-2.5 font-medium">Category & Issue</th>
                <th className="py-2.5 font-medium">Resident Details</th>
                <th className="py-2.5 font-medium">Assigned Staff</th>
                <th className="py-2.5 font-medium">Target Deadline</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((comp) => {
                const isOverdue = comp.status !== 'resolved' && comp.deadline < todayStr;
                return (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{comp.complaintCode}</td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-900 block">{comp.hostelBlock}</span>
                      <span className="text-slate-500 font-mono text-[11px] block">Room {comp.roomNumber}</span>
                    </td>
                    <td className="py-3 max-w-xs">
                      <span className="font-semibold text-indigo-700 block">{comp.category}</span>
                      <span className="text-slate-700 line-clamp-1">{comp.description}</span>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-800 font-medium">{comp.residentName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{comp.studentRollNo}</div>
                    </td>
                    <td className="py-3 font-medium text-slate-700">
                      {comp.assignedStaffName || 'Unassigned'}
                    </td>
                    <td className="py-3 font-mono tabular-nums">
                      <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {comp.deadline}
                      </span>
                      {isOverdue && <span className="text-[10px] text-rose-600 block uppercase font-bold">Overdue SLA</span>}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          comp.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : comp.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {comp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {comp.status !== 'resolved' ? (
                        <button
                          onClick={() => {
                            setActiveComplaint(comp);
                            setShowResolveModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspections & Visitors 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warden Inspections */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hostel Hygiene & Fire Safety Inspections
            </h2>
            <span className="text-xs font-mono text-slate-500">Weekly Warden Rounds</span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {hostelInspections.map((insp) => (
              <div
                key={insp.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{insp.hostelBlock} · {insp.floor}</span>
                  <span className="text-emerald-700 font-mono tabular-nums">{insp.scorePercent}% Hygiene Score</span>
                </div>
                <p className="text-slate-600">{insp.notes}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 font-mono">
                  <span>Inspected by: {insp.wardenName}</span>
                  <span className="text-emerald-700 font-semibold">Fire Safety: Verified Valid</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Records */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hostel Visitor In-Out Register
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {visitors.length} visitors logged today
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {visitors.map((vis) => (
              <div
                key={vis.id}
                className="p-3 bg-slate-50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">{vis.visitorName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Visited: {vis.residentVisited} · Phone: {vis.contactNumber}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums text-[11px]">
                  <span className="text-slate-900 font-semibold block">Entry: {vis.checkInTime}</span>
                  <span className="text-slate-400 block">{vis.idProofType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Register Grievance */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register Hostel Grievance</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Hostel Block</label>
                  <select
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Girls)">Block B (Girls)</option>
                    <option value="Block C (PG Scholars)">Block C (PG Scholars)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-204"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Student Resident Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formStudent}
                    onChange={(e) => setFormStudent(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Roll / ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-2024-089"
                    value={formRoll}
                    onChange={(e) => setFormRoll(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Internet/Wi-Fi">Internet/Wi-Fi</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Priority SLA</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="urgent">Urgent (24h SLA)</option>
                    <option value="high">High (48h SLA)</option>
                    <option value="normal">Normal (72h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Assigned Maintenance Technician</label>
                <select
                  value={formAssignedId}
                  onChange={(e) => setFormAssignedId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="">Select Technician...</option>
                  {employees
                    .filter((e) => e.departmentId === 'dept-mnt')
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.jobTitle})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Grievance Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  placeholder="Describe problem details, symptoms, and urgency..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Register Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Resolved */}
      {showResolveModal && activeComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Resolve Hostel Grievance</h3>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-bold text-slate-900">{activeComplaint.complaintCode} · {activeComplaint.hostelBlock}</div>
                <div className="text-slate-600 mt-1">{activeComplaint.description}</div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Resolution Work Remarks</label>
                <textarea
                  rows={3}
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  required
                  placeholder="Explain repair performed, parts replaced, and student confirmation..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Visitor */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Hostel Visitor</h3>
              <button onClick={() => setShowVisitorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitor} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra (Parent / Guardian)"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={visPhone}
                  onChange={(e) => setVisPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Resident Student Visited</label>
                <input
                  type="text"
                  placeholder="Student name"
                  value={visStudent}
                  onChange={(e) => setVisStudent(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Hostel Block</label>
                  <select
                    value={visBlock}
                    onChange={(e) => setVisBlock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Girls)">Block B (Girls)</option>
                    <option value="Block C (PG Scholars)">Block C (PG Scholars)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Room No</label>
                  <input
                    type="text"
                    placeholder="101"
                    value={visRoom}
                    onChange={(e) => setVisRoom(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Confirm Entry Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
