import React from 'react';
import {
  Users,
  CalendarCheck,
  Clock,
  UserX,
  AlertOctagon,
  Wrench,
  Bus,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Department,
  CampusLocation,
  Employee,
  DutyAssignment,
  ShiftSwapRequest,
  LeaveRequest,
  SecurityGate,
  HostelComplaint,
  CampusVehicle,
  MaintenanceWorkOrder,
  UserRole,
} from '../types/campus.ts';

interface DashboardViewProps {
  currentRole: UserRole;
  currentUserName: string;
  departments: Department[];
  locations: CampusLocation[];
  employees: Employee[];
  assignments: DutyAssignment[];
  swapRequests: ShiftSwapRequest[];
  leaves: LeaveRequest[];
  gates: SecurityGate[];
  hostelComplaints: HostelComplaint[];
  vehicles: CampusVehicle[];
  workOrders: MaintenanceWorkOrder[];
  onNavigateTab: (tab: string) => void;
  onOpenAiAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  currentUserName,
  departments,
  locations,
  employees,
  assignments,
  swapRequests,
  leaves,
  gates,
  hostelComplaints,
  vehicles,
  workOrders,
  onNavigateTab,
  onOpenAiAssistant,
}) => {
  const todayStr = '2026-10-16';

  // 1. Calculations derived entirely from application state
  const totalStaff = employees.length;

  const dutiesToday = assignments.filter((a) => a.date === todayStr);
  const dutiesAssignedToday = dutiesToday.filter((a) => a.status !== 'absent').length;

  const currentShiftCheckedIn = dutiesToday.filter(
    (a) => a.attendanceStatus === 'present'
  ).length;

  const approvedLeavesToday = leaves.filter(
    (l) => l.status === 'approved' && todayStr >= l.startDate && todayStr <= l.endDate
  ).length;

  const absentToday =
    dutiesToday.filter((a) => a.attendanceStatus === 'missed' || a.status === 'absent').length +
    approvedLeavesToday;

  // Unfilled shifts evaluation for today & tomorrow
  let unfilledShiftSlots = 0;
  for (const loc of locations) {
    for (const shiftCode of ['morning', 'evening', 'night'] as const) {
      const required = loc.minStaffPerShift[shiftCode] || 1;
      const count = assignments.filter(
        (a) => a.date === todayStr && a.locationId === loc.id && a.shiftCode === shiftCode && a.status === 'scheduled'
      ).length;
      if (count < required) {
        unfilledShiftSlots += required - count;
      }
    }
  }

  // Open tasks & overdue complaints
  const openWorkOrders = workOrders.filter((w) => w.status !== 'completed').length;
  const overdueWorkOrders = workOrders.filter((w) => w.status !== 'completed' && w.deadline < todayStr).length;

  const openHostelComplaints = hostelComplaints.filter((c) => c.status !== 'resolved').length;
  const overdueComplaints = hostelComplaints.filter((c) => c.status !== 'resolved' && c.deadline < todayStr).length;

  // Pending Approvals
  const pendingSwaps = swapRequests.filter((s) => s.status === 'pending').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
  const pendingWOSignoffs = workOrders.filter((w) => w.status === 'pending_supervisor_signoff').length;
  const totalPendingApprovals = pendingSwaps + pendingLeaves + pendingWOSignoffs;

  // Upcoming vehicle maintenance (due <= 7 days)
  const busesNeedingMaintenance = vehicles.filter((v) => {
    const days = Math.round(
      (new Date(v.nextServiceDueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
    );
    return days >= 0 && days <= 7;
  });

  // Department Performance & Staff Distribution
  const deptStaffMap = departments.map((d) => {
    const staffCount = employees.filter((e) => e.departmentId === d.id).length;
    const activeDuties = assignments.filter((a) => a.departmentId === d.id && a.date === todayStr).length;
    return {
      department: d,
      staffCount,
      activeDuties,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Unified Operations Command</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Active Role: {currentRole}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {currentUserName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time campus operational telemetry, duty assignments, shift compliance, and facility health for{' '}
            <span className="font-semibold text-slate-700">Friday, 16 October 2026</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('roster')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Open Duty Roster
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Operations Briefing</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Grid (Tabular Numerals & Zero-Pill Design) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Staff Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalStaff}
          </div>
          <div className="mt-1 text-xs text-slate-500">Across {departments.length} departments</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Duties Assigned Today</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-indigo-700">
            {dutiesAssignedToday}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {currentShiftCheckedIn} checked in currently
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Absent / Approved Leave</span>
            <UserX className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600">
            {absentToday}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {approvedLeavesToday} on sanctioned leave
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Unfilled Shift Slots</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-rose-600">
            {unfilledShiftSlots}
          </div>
          <button
            onClick={() => onNavigateTab('roster')}
            className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <span>Resolve with Assistant</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Role-Specific Focus Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Breakdown & Duty Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Staff & Live Workload Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Campus Workforce by Department
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current headcount, reporting HODs, and today's active shift assignments.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('staff')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Staff Directory
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="py-2.5 font-medium">Department</th>
                    <th className="py-2.5 font-medium">Head of Dept (HOD)</th>
                    <th className="py-2.5 font-medium text-right">Headcount</th>
                    <th className="py-2.5 font-medium text-right">Duties Today</th>
                    <th className="py-2.5 font-medium text-right">Extension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptStaffMap.map(({ department, staffCount, activeDuties }) => (
                    <tr key={department.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {department.name}
                        <span className="text-slate-400 font-mono text-[11px] ml-1.5">
                          ({department.code})
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{department.hodName}</td>
                      <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {staffCount}
                      </td>
                      <td className="py-3 text-right font-mono tabular-nums">
                        <span className="text-indigo-700 font-semibold">{activeDuties}</span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">
                        {department.contactExtension}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Operational Overdue & SLA Monitor */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Open Work Orders & Overdue Grievances
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {openWorkOrders} open work orders · {openHostelComplaints} open complaints
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {/* Overdue Work Order Card */}
              {workOrders
                .filter((w) => w.deadline < todayStr && w.status !== 'completed')
                .map((wo) => (
                  <div
                    key={wo.id}
                    className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-lg flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-rose-900">
                        <span>{wo.workOrderCode}</span>
                        <span>·</span>
                        <span>{wo.departmentCategory}</span>
                        <span>·</span>
                        <span className="text-rose-700 font-medium">{wo.location}</span>
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">{wo.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
                        <span>Assigned: {wo.assignedEmployeeName}</span>
                        <span>·</span>
                        <span className="text-rose-700 font-semibold">Deadline passed: {wo.deadline}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('maintenance')}
                      className="px-2.5 py-1.5 bg-rose-600 text-white font-medium rounded hover:bg-rose-700 transition-colors shrink-0"
                    >
                      Inspect
                    </button>
                  </div>
                ))}

              {/* Overdue Hostel Complaint */}
              {hostelComplaints
                .filter((c) => c.deadline < todayStr && c.status !== 'resolved')
                .map((hc) => (
                  <div
                    key={hc.id}
                    className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <span>{hc.complaintCode}</span>
                        <span>·</span>
                        <span>{hc.hostelBlock}</span>
                        <span>·</span>
                        <span>Room {hc.roomNumber}</span>
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">{hc.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
                        <span>Resident: {hc.residentName} ({hc.studentRollNo})</span>
                        <span>·</span>
                        <span className="text-amber-800 font-semibold">SLA exceeded ({hc.deadline})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('hostel')}
                      className="px-2.5 py-1.5 bg-amber-600 text-white font-medium rounded hover:bg-amber-700 transition-colors shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                ))}

              {overdueWorkOrders === 0 && overdueComplaints === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>All campus maintenance work orders and student hostel grievances are within target SLAs.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Approvals, Fleet Status & Role Quick-Links */}
        <div className="space-y-6">
          {/* Pending Approvals Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Pending Supervisor Approvals
              </h2>
              <span className="font-mono tabular-nums text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {totalPendingApprovals} Actionable
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div
                onClick={() => onNavigateTab('roster')}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">Shift Swap Proposals</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 font-mono tabular-nums">
                    {pendingSwaps} guard/staff swaps waiting
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigateTab('attendance')}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">Staff Leave Applications</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 font-mono tabular-nums">
                    {pendingLeaves} applications awaiting HOD review
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigateTab('maintenance')}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">Work Order Sign-offs</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 font-mono tabular-nums">
                    {pendingWOSignoffs} completed jobs needing inspection
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Fleet Health & Upcoming Maintenance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Campus Fleet Health
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('transport')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Fleet
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              {busesNeedingMaintenance.length > 0 ? (
                busesNeedingMaintenance.map((bus) => (
                  <div key={bus.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{bus.vehicleNumber}</span>
                      <span className="text-amber-800 font-mono text-[11px]">Due in 4 days</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-1">{bus.model}</div>
                    <div className="text-slate-500 text-[11px] mt-1 font-mono tabular-nums">
                      Service Due: {bus.nextServiceDueDate} · Fitness: {bus.fitnessValidUntil}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs py-3 text-center">
                  All fleet vehicles within safe maintenance windows.
                </div>
              )}
            </div>
          </div>

          {/* Security Gate Live Roster Snapshot */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Security Gates Staffing
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('security')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Security Center
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {gates.map((g) => (
                <div
                  key={g.id}
                  className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between font-medium"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{g.name}</span>
                    <span className="text-slate-400 font-mono text-[11px] block">{g.radioChannel}</span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`font-bold ${
                        g.currentGuardsOnDuty >= g.requiredGuards
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {g.currentGuardsOnDuty} / {g.requiredGuards}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Guards on duty</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
