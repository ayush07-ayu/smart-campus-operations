import React, { useState } from 'react';
import { 
  SlidersHorizontal, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, ShieldCheck, RefreshCw, Calendar, Building2, 
  Users, Check, X
} from 'lucide-react';
import { SimulationResult, User } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

export const SimulatorModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [scenarioType, setScenarioType] = useState<'FACULTY_ABSENCE' | 'LAB_MAINTENANCE'>('FACULTY_ABSENCE');
  const [targetFacultyId, setTargetFacultyId] = useState<string>('usr_faculty_amit');
  const [targetRoomId, setTargetRoomId] = useState<string>('rm_lab_302');
  const [simulationDate, setSimulationDate] = useState<string>('2026-10-20');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [commitMessage, setCommitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setCommitMessage(null);

    try {
      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioType,
          facultyId: targetFacultyId,
          roomId: targetRoomId,
          date: simulationDate
        })
      });

      const data = await res.json();
      setSimulationResult(data);
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitSimulation = async () => {
    if (!simulationResult) return;
    setIsCommitting(true);
    setCommitMessage(null);

    try {
      const res = await fetch('/api/simulator/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationScenario: simulationResult.scenarioType,
          alternatives: simulationResult.alternatives
        })
      });

      const data = await res.json();
      if (data.success) {
        setCommitMessage({
          type: 'success',
          text: `Simulation committed! ${data.updatedSlotsCount} sessions updated in the authoritative timetable. In-app notifications dispatched.`
        });
        onRefresh();
      } else {
        setCommitMessage({ type: 'error', text: data.error || 'Failed to commit simulation.' });
      }
    } catch (err: any) {
      setCommitMessage({ type: 'error', text: err?.message || 'Network error' });
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-700" />
            <span>Academic Schedule Simulation Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate operational faculty absences, lab closures, and evaluate optimal reassignments before committing to the master schedule.
          </p>
        </div>
      </div>

      {commitMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            commitMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {commitMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{commitMessage.text}</span>
        </div>
      )}

      {/* Simulator Control Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <span>Configure Crisis or Outage Scenario</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Scenario Type
            </label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="FACULTY_ABSENCE">Faculty Member Absence / Leave</option>
              <option value="LAB_MAINTENANCE">Laboratory Maintenance Outage</option>
            </select>
          </div>

          {scenarioType === 'FACULTY_ABSENCE' ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Absent Faculty Member
              </label>
              <select
                value={targetFacultyId}
                onChange={(e) => setTargetFacultyId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="usr_faculty_amit">Dr. Amit Verma (Assoc. Prof)</option>
                <option value="usr_faculty_sunita">Dr. Sunita Rao (Asst. Prof)</option>
                <option value="usr_faculty_rohit">Prof. Rohit Kumar (Asst. Prof)</option>
                <option value="usr_faculty_neha">Dr. Neha Kapoor (Asst. Prof)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Laboratory Under Maintenance
              </label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="rm_lab_302">Lab 302 (Advanced Computing & AI Lab)</option>
                <option value="rm_lab_301">Lab 301 (Software Engineering Lab)</option>
                <option value="rm_lab_201">Lab 201 (Database & Cloud Systems Lab)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Simulated Target Date
            </label>
            <input
              type="date"
              value={simulationDate}
              onChange={(e) => setSimulationDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500">
            Constraint Solver evaluates: schedule conflicts, workload quotas, classroom seating, and qualification domains.
          </p>

          <button
            onClick={handleRunSimulation}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isLoading ? 'Running Constraint Solver...' : 'Run Simulation Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Output */}
      {simulationResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Simulation Outcome
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {simulationResult.scenarioType}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {simulationResult.workloadImpactSummary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                Feasibility: <strong className="text-emerald-700">{simulationResult.overallFeasibility}</strong>
              </span>

              <button
                onClick={handleCommitSimulation}
                disabled={isCommitting}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isCommitting ? 'Committing...' : 'Commit to Master Timetable'}</span>
              </button>
            </div>
          </div>

          {/* Alternatives Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Generated Alternative Allocations ({simulationResult.alternatives.length} Sessions)
            </h4>

            <div className="space-y-2">
              {simulationResult.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{alt.timeSlot}</span>
                      <span className="text-xs text-slate-700">• {alt.subjectName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {alt.sectionName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-700 mt-2">
                      <span>Original: <strong className="text-slate-900">{alt.originalFaculty}</strong></span>
                      <span>→</span>
                      {alt.suggestedSubstituteName && (
                        <span>
                          Reassigned: <strong className="text-blue-700">{alt.suggestedSubstituteName}</strong>
                        </span>
                      )}
                      {alt.alternateRoomCode && (
                        <span>
                          Relocated: <strong className="text-amber-800">{alt.alternateRoomCode}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      {alt.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {alt.score}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
