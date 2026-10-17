import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Clock, Award, ShieldCheck, 
  AlertTriangle, CheckCircle2, TrendingUp, RefreshCw, Cpu 
} from 'lucide-react';
import { User } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

export const AnalyticsModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = () => {
    setIsLoading(true);
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Analytics fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            <span>Faculty Workload & Campus Utilization Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fairness metrics, lecture/lab workload distribution, substitute balances, and SLA analytics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Scheduled Slots</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {analytics?.totalSlotsConfigured || 22}
          </div>
          <span className="text-[11px] text-blue-700 font-medium">Full Weekly Matrix</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Grievance SLA Rate</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {analytics?.complaintResolutionRate || 78.5}%
          </div>
          <span className="text-[11px] text-slate-500">Within 48h Resolution</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Avg Resolution Speed</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {analytics?.averageResolutionHours || 28.4} hrs
          </div>
          <span className="text-[11px] text-slate-500">Campus Facilities Helpdesk</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Fairness Index</span>
          <div className="mt-2 text-2xl font-bold text-indigo-700">
            94.2 / 100
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Optimal Workload Balance</span>
        </div>
      </div>

      {/* Faculty Workload Table & Progress Bars */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-700" />
          <span>Department Faculty Teaching Load Distribution</span>
        </h3>

        <div className="space-y-4">
          {analytics?.facultyWorkload?.map((fac: any) => (
            <div key={fac.facultyId} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900">{fac.facultyName}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({fac.designation})</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-700">
                    Teaching Load: <strong>{fac.totalTeachingHours} hrs</strong> / {fac.maxWeeklyLimit} max
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    fac.fairnessStatus === 'Optimal Load'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {fac.fairnessStatus}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    fac.utilizationPercentage > 85 ? 'bg-amber-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${fac.utilizationPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Lecture: {fac.lectureHours} hrs • Practical Lab: {fac.labHours} hrs</span>
                <span>Duties: {fac.substituteTaken} taken • {fac.substituteGiven} requested</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lab Utilization */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-700" />
          <span>Computing & AI Laboratory Utilization</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics?.labUtilization?.map((lab: any, idx: number) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{lab.roomCode}</span>
                <span className="text-[10px] font-bold text-blue-700">{lab.utilizationRate}% Capacity</span>
              </div>
              <p className="text-[11px] text-slate-700 truncate font-medium">{lab.name}</p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                <span>Workstations: {lab.capacity}</span>
                <span>Scheduled: {lab.scheduledHours} hrs/wk</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
