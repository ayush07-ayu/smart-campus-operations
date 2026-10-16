import React from 'react';
import {
  Bell,
  Sparkles,
  Shield,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { UserRole, NotificationItem } from '../types/campus.ts';

interface NavbarProps {
  currentRole: UserRole;
  currentUserName: string;
  onRoleChange: (role: UserRole, name: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: NotificationItem[];
  onNotificationRead: (id: string) => void;
  onReadAllNotifications: () => void;
  onOpenAiAssistant: () => void;
  onTriggerScheduler: () => void;
  isSchedulerRunning: boolean;
}

const DEMO_USERS: { role: UserRole; name: string; dept: string }[] = [
  { role: 'Super Admin', name: 'Dr. Rajesh Sharma', dept: 'Central Admin' },
  { role: 'Security Supervisor', name: 'Vikram Singh', dept: 'Campus Security' },
  { role: 'Hostel Warden', name: 'Sunita Rao', dept: 'Hostel Admin' },
  { role: 'Mess Manager', name: 'Anil Verma', dept: 'Dining Services' },
  { role: 'Transport Manager', name: 'Gurpreet Singh', dept: 'Fleet Services' },
  { role: 'Maintenance Supervisor', name: 'Kavita Nair', dept: 'Estate Maintenance' },
  { role: 'HOD', name: 'Prof. Arvind Mehta', dept: 'Infrastructure' },
  { role: 'Management / Auditor', name: 'Meera Desai', dept: 'Audit & Compliance' },
  { role: 'Employee / Staff', name: 'Ramesh Kumar', dept: 'Security Guard' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUserName,
  onRoleChange,
  activeTab,
  onTabChange,
  notifications,
  onNotificationRead,
  onReadAllNotifications,
  onOpenAiAssistant,
  onTriggerScheduler,
  isSchedulerRunning,
}) => {
  const [showNotifMenu, setShowNotifMenu] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roster', label: 'Duty Roster' },
    { id: 'security', label: 'Security' },
    { id: 'mess', label: 'Mess & Food' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'transport', label: 'Transport' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'staff', label: 'Staff' },
    { id: 'scheduler', label: 'Automation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Primary Top Bar Contract: Brand — Nav Links — Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              CO
            </div>
            <button
              onClick={() => onTabChange('dashboard')}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap text-left"
            >
              CampusOps AI
            </button>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
              · Operations & Roster System
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
            {navLinks.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                  activeTab === item.id
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Secondary links dropdown or compact group */}
            <div className="flex items-center gap-4 pl-2 border-l border-slate-200">
              {navLinks.slice(6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`whitespace-nowrap transition-colors py-1 text-xs uppercase tracking-wider ${
                    activeTab === item.id
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Zone 3: Actions & Role switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Scheduler Tick Button */}
            <button
              onClick={onTriggerScheduler}
              disabled={isSchedulerRunning}
              title="Execute Automated Scheduler Check Now"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSchedulerRunning ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="tabular-nums">Run Daemon</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Operations Query</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50 text-left">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Campus Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={onReadAllNotifications}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No notifications currently recorded.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onNotificationRead(notif.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !notif.isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.severity === 'alert' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            ) : notif.severity === 'warning' ? (
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 leading-tight">
                                {notif.title}
                              </p>
                              <p className="text-slate-600 mt-0.5 leading-snug">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                                {new Date(notif.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Selector */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-none">
                  {currentUserName}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-none">
                  {currentRole}
                </div>
              </div>
              <select
                aria-label="Switch active role profile"
                value={`${currentRole}|${currentUserName}`}
                onChange={(e) => {
                  const [role, name] = e.target.value.split('|') as [UserRole, string];
                  onRoleChange(role, name);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DEMO_USERS.map((user) => (
                  <option key={`${user.role}-${user.name}`} value={`${user.role}|${user.name}`}>
                    {user.role} ({user.name.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile / Narrow Tab Strip */}
        <div className="xl:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 text-xs font-medium no-scrollbar">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
