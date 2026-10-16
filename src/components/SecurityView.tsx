import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Radio,
  UserCheck,
  AlertOctagon,
  Plus,
  CheckCircle2,
  X,
  Eye,
} from 'lucide-react';
import {
  SecurityGate,
  GateIncident,
  DutyAssignment,
  Employee,
  UserRole,
} from '../types/campus.ts';

interface SecurityViewProps {
  currentRole: UserRole;
  currentUserName: string;
  gates: SecurityGate[];
  gateIncidents: GateIncident[];
  assignments: DutyAssignment[];
  employees: Employee[];
  onRefresh: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  currentRole,
  currentUserName,
  gates,
  gateIncidents,
  assignments,
  employees,
  onRefresh,
}) => {
  const [selectedGateId, setSelectedGateId] = useState<string>(gates[0]?.id || '');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrAssignment, setQrAssignment] = useState<DutyAssignment | null>(null);

  // Form states
  const [incTitle, setIncTitle] = useState('');
  const [incGateId, setIncGateId] = useState(gates[0]?.id || '');
  const [incSeverity, setIncSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [incDesc, setIncDesc] = useState('');
  const [incVehicle, setIncVehicle] = useState('');

  const todayStr = '2026-10-16';

  // Guard duties today
  const securityAssignmentsToday = assignments.filter(
    (a) => a.departmentId === 'dept-sec' && a.date === todayStr
  );

  // Missed check-in alerts
  const missedCheckins = securityAssignmentsToday.filter(
    (a) => a.attendanceStatus === 'missed'
  );

  // Gate selected
  const activeGate = gates.find((g) => g.id === selectedGateId) || gates[0];

  // Guards assigned to active gate today
  const guardsAtActiveGate = securityAssignmentsToday.filter(
    (a) => a.locationName.includes(activeGate?.name.split(' ')[0] || '') || a.locationId.includes(activeGate?.gateCode.toLowerCase() || '')
  );

  // Check in handler
  const handlePunchCheckIn = async (assignmentId: string, method: 'supervisor_verified' | 'qr_scanner' | 'manual') => {
    try {
      await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          method,
          verifiedBy: currentUserName,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowQrModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Create incident handler
  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/security/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateId: incGateId,
          severity: incSeverity,
          title: incTitle,
          description: incDesc,
          visitorOrVehicleInfo: incVehicle,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowIncidentModal(false);
      setIncTitle('');
      setIncDesc('');
      setIncVehicle('');
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
            <span>Perimeter Security & Guard Vigilance</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Active Station Control</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Security & Watchman Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gate-wise rosters, digital check-ins, missed check-in alerts, and incident logs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowIncidentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Log Security Incident</span>
          </button>
        </div>
      </div>

      {/* Missed Check-In Alert Notice */}
      {missedCheckins.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong className="font-semibold">{missedCheckins.length} Missed Shift Check-In(s)</strong> detected by automated daemon. Dispatch supervisor replacement immediately.
            </span>
          </div>
          <span className="font-mono tabular-nums text-rose-700 font-bold">
            {missedCheckins.map((m) => m.employeeName).join(', ')}
          </span>
        </div>
      )}

      {/* Gate Roster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gates.map((gate) => {
          const isSelected = selectedGateId === gate.id;
          const isStaffed = gate.currentGuardsOnDuty >= gate.requiredGuards;
          return (
            <div
              key={gate.id}
              onClick={() => setSelectedGateId(gate.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-50/40 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {gate.gateCode}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    isStaffed
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isStaffed ? 'Staffed' : 'Understaffed'}
                </span>
              </div>

              <h2 className="font-bold text-slate-900 text-sm mt-2">{gate.name}</h2>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 font-mono tabular-nums">
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                <span>{gate.radioChannel}</span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-slate-400">On Duty:</span>
                <span className={`font-bold ${isStaffed ? 'text-slate-900' : 'text-rose-600'}`}>
                  {gate.currentGuardsOnDuty} / {gate.requiredGuards} Guards
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section: Gate Details & Guard Register */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Gate Rostered Guards & Punch In */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Gate Staffing & Verification · {activeGate?.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical register verification, QR-based digital punch, and shift status.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Channel: {activeGate?.radioChannel}
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 font-medium">Guard Name</th>
                  <th className="py-2.5 font-medium">Shift</th>
                  <th className="py-2.5 font-medium">Punch State</th>
                  <th className="py-2.5 font-medium">Method</th>
                  <th className="py-2.5 font-medium text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {securityAssignmentsToday.map((asgn) => (
                  <tr key={asgn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{asgn.employeeName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{asgn.employeeCode} · {asgn.locationName}</div>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-slate-800">{asgn.shiftName}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">{asgn.shiftHours}</span>
                    </td>
                    <td className="py-3 font-mono tabular-nums">
                      {asgn.attendanceStatus === 'present' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Punched ({asgn.checkInTime})</span>
                        </span>
                      ) : asgn.attendanceStatus === 'missed' ? (
                        <span className="text-rose-600 font-bold">Missed Check-In</span>
                      ) : (
                        <span className="text-slate-400">Waiting Punch</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-[11px]">
                      {asgn.checkInMethod ? asgn.checkInMethod.replace('_', ' ') : '—'}
                    </td>
                    <td className="py-3 text-right">
                      {asgn.attendanceStatus !== 'present' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setQrAssignment(asgn);
                              setShowQrModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded flex items-center gap-1 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan QR</span>
                          </button>
                          <button
                            onClick={() => handlePunchCheckIn(asgn.id, 'supervisor_verified')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                          >
                            Verify
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold font-mono">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Incident Reports */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Gate Incident Reports
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {gateIncidents.length} recorded
            </span>
          </div>

          <div className="space-y-3 mt-4 text-xs">
            {gateIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{inc.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      inc.severity === 'critical' || inc.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{inc.description}</p>
                {inc.visitorOrVehicleInfo && (
                  <p className="text-slate-500 font-mono text-[11px]">
                    Vehicle/Visitor: {inc.visitorOrVehicleInfo}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Reported: {inc.reportedByGuardName}</span>
                  <span>{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: QR Scan Simulation */}
      {showQrModal && qrAssignment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-left">
              <h3 className="text-sm font-bold text-slate-900">Digital QR Gate Verification</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center">
              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner mb-3">
                <QrCode className="w-28 h-28 text-white" />
              </div>
              <div className="font-bold text-slate-900 text-sm">{qrAssignment.employeeName}</div>
              <div className="text-slate-500 font-mono text-xs">{qrAssignment.employeeCode} · {qrAssignment.shiftName}</div>
              <div className="text-[11px] text-slate-400 mt-2 max-w-xs">
                Scanning digital badge at station #{qrAssignment.locationName}...
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePunchCheckIn(qrAssignment.id, 'qr_scanner')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Complete QR Punch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Incident Logger */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Security Incident</h3>
              <button onClick={() => setShowIncidentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Gate Post</label>
                <select
                  value={incGateId}
                  onChange={(e) => setIncGateId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  {gates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.gateCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Severity Level</label>
                <select
                  value={incSeverity}
                  onChange={(e) => setIncSeverity(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="low">Low (General Observation)</option>
                  <option value="medium">Medium (Visitor Issue)</option>
                  <option value="high">High (Perimeter Breach / Conflict)</option>
                  <option value="critical">Critical (Emergency / Fire / Unauthorized Force)</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Incident Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Unregistered vehicle attempting entry through boom barrier"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Vehicle / Visitor Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Car Plate UP-14-AX-9912 or Visitor Aadhaar / Name"
                  value={incVehicle}
                  onChange={(e) => setIncVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Incident Details & Action Taken</label>
                <textarea
                  rows={3}
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  required
                  placeholder="Describe exact occurrences, guards responding, and current containment status..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Submit Incident Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
