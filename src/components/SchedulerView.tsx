import React, { useState } from 'react';
import {
  RotateCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Cpu,
  FileCode,
  Terminal,
} from 'lucide-react';
import {
  SchedulerExecutionLog,
  NotificationItem,
  UserRole,
} from '../types/campus.ts';

interface SchedulerViewProps {
  currentRole: UserRole;
  currentUserName: string;
  schedulerLogs: SchedulerExecutionLog[];
  notifications: NotificationItem[];
  onTriggerScheduler: () => void;
  isSchedulerRunning: boolean;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  currentRole,
  currentUserName,
  schedulerLogs,
  notifications,
  onTriggerScheduler,
  isSchedulerRunning,
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Server Daemon & Automation Engine</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Background Event Loop</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Notifications & Server-Side Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real recurring background daemon for duty assignments, missed check-ins, SLA tracking, and vehicle maintenance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onTriggerScheduler}
            disabled={isSchedulerRunning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSchedulerRunning ? 'animate-spin' : ''}`} />
            <span>{isSchedulerRunning ? 'Executing Cycle...' : 'Trigger Scheduler Cycle Now'}</span>
          </button>
        </div>
      </div>

      {/* Daemon Status & Config Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Daemon Process State</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-700">
            ACTIVE & RUNNING
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Interval: 60s background tick
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Missed Check-In Grace</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-slate-900">
            15 Minutes
          </div>
          <div className="mt-1 text-xs text-slate-500">From designated shift start</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Fleet Maintenance Alert</span>
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-slate-900">
            7 Days Advance
          </div>
          <div className="mt-1 text-xs text-slate-500">Upcoming workshop service forecast</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>Deduplication Policy</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900">
            Enforced
          </div>
          <div className="mt-1 text-xs text-slate-500">Zero duplicate notification emission</div>
        </div>
      </div>

      {/* Scheduler Architecture & Configuration Documentation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Scheduler Configuration & Architecture Documentation
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <div>
              <strong className="text-slate-900 block font-semibold mb-1">
                1. Automated Missed Check-In Detection:
              </strong>
              The server daemon scans all active daily rosters. When the current clock exceeds shift start time by 15 minutes and the employee check-in remains in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">pending</code> status, the assignment is flagged as <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-bold">missed</code> and an escalated alert is dispatched to the department supervisor.
            </div>

            <div>
              <strong className="text-slate-900 block font-semibold mb-1">
                2. Overdue Work Orders & Grievance SLA:
              </strong>
              Maintenance work orders and student hostel grievances are continuously matched against target SLA deadlines. Any unresolved item past deadline triggers an urgent notice with technician attribution.
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <strong className="text-slate-900 block font-semibold mb-1">
                3. Campus Fleet Maintenance Forecast:
              </strong>
              Transport buses and electric shuttle vans are evaluated for upcoming fitness certificate expiration and manufacturer scheduled service due dates within a 7-day lookahead window to prevent roadside breakdowns.
            </div>

            <div>
              <strong className="text-slate-900 block font-semibold mb-1">
                4. Anti-Duplication & Audit Pipeline:
              </strong>
              Each alert payload is indexed against entity IDs and event types (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">type + relatedEntityId</code>). Repeat triggers within the same cycle are suppressed, and all dispatches are permanently recorded in the delivery history log.
            </div>
          </div>
        </div>
      </div>

      {/* Scheduler Execution & Delivery History Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Logs */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Daemon Execution History ({schedulerLogs.length})
            </h2>
            <span className="text-xs font-mono text-slate-500">Live ticks</span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            {schedulerLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-900">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-emerald-700 font-semibold">{log.alertsGenerated} Alerts Emitted</span>
                </div>
                <p className="text-slate-600">{log.summary}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Monitors Executed: {log.triggersRun.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Dispatched Notifications Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dispatched Campus Alerts ({notifications.length})
            </h2>
            <span className="text-xs font-mono text-slate-500">Delivery Log</span>
          </div>

          <div className="mt-4 space-y-3 text-xs max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{notif.title}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      notif.severity === 'alert'
                        ? 'bg-rose-100 text-rose-800'
                        : notif.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {notif.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{notif.message}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Timestamp: {new Date(notif.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
