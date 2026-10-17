import React from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, Users, 
  DoorOpen, Building2, Briefcase, Sparkles, ArrowRight, 
  CheckSquare, FileText, ChevronRight, MapPin, UserCheck, 
  ShieldCheck, RefreshCw, Layers
} from 'lucide-react';
import { User, TimetableSlot } from '../types';

interface Props {
  currentUser: User;
  stats: any;
  todaySlots: TimetableSlot[];
  onNavigate: (module: string) => void;
  onOpenAiAssistant: () => void;
  onRefreshStats: () => void;
}

export const DashboardOverview: React.FC<Props> = ({
  currentUser,
  stats,
  todaySlots,
  onNavigate,
  onOpenAiAssistant,
  onRefreshStats
}) => {
  const role = currentUser.role;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-sm text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Campus Management & Academic Operations</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {role === 'student' && `MCA First Year • Section A • Department of Computer Applications`}
              {role === 'faculty' && `${currentUser.designation} • Workstation: ${currentUser.cabin || 'Staff Room 204'}`}
              {role === 'hod' && `Head of Department • Department of Computer Applications • Room 102`}
              {role === 'supervisor' && `Timetable In-Charge & Academic Coordinator • Department of Computer Applications`}
              {role === 'super_admin' && `Dean of Academic Affairs • Central Administration • MMU Mullana`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open AI Assistant</span>
            </button>
            <button
              onClick={onRefreshStats}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms Configured */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rooms & Labs</span>
            <DoorOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalRoomsConfigured || 400}</span>
            <span className="text-[11px] text-slate-500">total inventory</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">
              {stats?.availableRoomsNow ?? 18} Free Now
            </span>
            <span className="text-slate-600 font-medium">
              {stats?.occupiedRoomsNow ?? 6} In Use
            </span>
          </div>
        </div>

        {/* Classes Configured */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Department Sections</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalClassesConfigured || 354}</span>
            <span className="text-[11px] text-slate-500">class schedules</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>MCA, BCA, B.Sc AI/ML</span>
            <span className="text-blue-700 font-medium">Active</span>
          </div>
        </div>

        {/* Duty Substitutions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Duty Adjustments</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.pendingSubstitutions ?? 1}</span>
            <span className="text-[11px] text-amber-700 font-semibold">pending review</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Automated Scoring</span>
            <button 
              onClick={() => onNavigate('substitutions')}
              className="text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              Review →
            </button>
          </div>
        </div>

        {/* Student Complaints */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Campus Grievances</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.openComplaints ?? 2}</span>
            <span className="text-[11px] text-slate-500">open tickets</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Average SLA: 28 hrs</span>
            <button 
              onClick={() => onNavigate('complaints')}
              className="text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              View →
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>Today's Academic & Laboratory Sessions</span>
              </h2>
              <p className="text-xs text-slate-500">
                Active schedule for Monday • Ramanujan Hall & Central Labs
              </p>
            </div>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySlots.slice(0, 5).map((slot) => {
              const isLab = slot.type.includes('Lab') || slot.type.includes('Practical');
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isLab 
                      ? 'bg-blue-50/60 border-blue-200' 
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 text-center flex-shrink-0 pt-0.5">
                      <span className="text-xs font-bold text-slate-900 block">{slot.startTime}</span>
                      <span className="text-[10px] text-slate-500 block">{slot.endTime}</span>
                    </div>

                    <div className="border-l border-slate-300 pl-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{slot.subjectCode}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isLab ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {slot.type}
                        </span>
                        {slot.isAdjusted && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            Substituted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 font-semibold mt-0.5">
                        {slot.subjectName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                        <span>{slot.sectionName}</span>
                        <span>•</span>
                        <span className="text-blue-700 font-medium">{slot.roomCode}</span>
                        <span>•</span>
                        <span>{slot.adjustedFacultyName || slot.facultyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-600">{slot.programCode}</span>
                    <button
                      onClick={() => onNavigate('timetable')}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium hover:underline cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Placement Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Quick Operations
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('availability')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                    Check Room Availability
                  </p>
                  <p className="text-[11px] text-slate-500">Live lab & classroom search</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('student-services')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                    ID Card & Bus Pass Window
                  </p>
                  <p className="text-[11px] text-slate-500">Scheduled program collection slots</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('complaints')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                    Lodge Grievance or Work Order
                  </p>
                  <p className="text-[11px] text-slate-500">Receive tracking reference number</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              {(role === 'faculty' || role === 'supervisor' || role === 'hod' || role === 'super_admin') && (
                <button
                  onClick={() => onNavigate('substitutions')}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                      Request Duty Adjustment
                    </p>
                    <p className="text-[11px] text-slate-500">Faculty substitution engine</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </button>
              )}

              {(role === 'supervisor' || role === 'hod' || role === 'super_admin') && (
                <button
                  onClick={() => onNavigate('simulator')}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                      What-If Schedule Simulator
                    </p>
                    <p className="text-[11px] text-slate-500">Model teacher leave & lab outages</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Placement Notice Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Campus Recruitment</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              TCS Digital & Prime Placement Drive 2026
            </h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Package: <strong>₹ 7.50 LPA – ₹ 11.50 LPA</strong>. Open to final year MCA, BCA, and B.Tech.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500">Oct 28, 2026</span>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Register Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
