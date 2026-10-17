import React, { useState } from 'react';
import { 
  Bell, Search, Sparkles, User, ChevronDown, Check, 
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { User as UserType, NotificationItem } from '../types';

interface Props {
  currentUser: UserType;
  allUsers: UserType[];
  onSwitchUser: (userId: string) => void;
  onOpenAiAssistant: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigateToModule: (moduleKey: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenAiAssistant,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateToModule,
  searchQuery,
  onSearchChange
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'supervisor':
        return { label: 'Coordinator', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'hod':
        return { label: 'HOD', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'faculty':
        return { label: 'Faculty', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'student':
        return { label: 'Student', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden p-1 flex-shrink-0 hover:border-slate-300 transition-colors">
            <img
              src="/mmu-logo.png"
              alt="Maharishi Markandeshwar (MMU) University Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 tracking-tight">SMART CAMPUS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Maharishi Markandeshwar (MMU), Mullana</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rooms, faculty, events, complaints..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Campus Assistant</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowRoleDropdown(false);
              }}
              className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notif.isRead ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.category === 'Substitution') onNavigateToModule('substitutions');
                          else if (notif.category === 'Grievance') onNavigateToModule('complaints');
                          else if (notif.category === 'Event') onNavigateToModule('events');
                          else if (notif.category === 'StudentService') onNavigateToModule('student-services');
                          else if (notif.category === 'Timetable') onNavigateToModule('timetable');
                          setShowNotifDropdown(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs text-slate-900">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {notif.timestamp.split(' ')[1] || notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-semibold border px-1 rounded ${roleBadge.bg}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Evaluator Persona
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Test system views & permissions for any campus role:
                  </p>
                </div>

                <div className="p-1 max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {allUsers.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const isSelected = user.id === currentUser.id;

                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full p-2.5 text-left rounded-lg flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {user.designation || user.programName || user.departmentName}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[9px] font-bold uppercase tracking-wide border px-1.5 py-0.5 rounded ${badge.bg}`}>
                            {badge.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 text-center">
                  Session persistent • State synced with server
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
