import React from 'react';
import { 
  LayoutDashboard, Calendar, Users, DoorOpen, Coffee, 
  CreditCard, MessageSquareWarning, MapPin, CheckSquare, 
  Sparkles, SlidersHorizontal, BarChart3, FileText, 
  ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: string;
  category?: 'core' | 'academic' | 'services' | 'analytics';
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    icon: LayoutDashboard,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    category: 'core'
  },
  {
    id: 'timetable',
    label: 'Department Timetables',
    icon: Calendar,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    category: 'academic'
  },
  {
    id: 'substitutions',
    label: 'Faculty Adjustments',
    icon: Users,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty'],
    badge: 'Workflow',
    category: 'academic'
  },
  {
    id: 'availability',
    label: 'Lab & Room Availability',
    icon: DoorOpen,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    category: 'academic'
  },
  {
    id: 'staff-room',
    label: 'Staff Room Directory',
    icon: Coffee,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty'],
    category: 'academic'
  },
  {
    id: 'student-services',
    label: 'Student Services & Slots',
    icon: CreditCard,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    badge: 'Slots',
    category: 'services'
  },
  {
    id: 'complaints',
    label: 'Grievance & Complaints',
    icon: MessageSquareWarning,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    category: 'services'
  },
  {
    id: 'directory',
    label: 'Campus Directory',
    icon: MapPin,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    category: 'services'
  },
  {
    id: 'attendance',
    label: 'Section Attendance',
    icon: CheckSquare,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    category: 'services'
  },
  {
    id: 'events',
    label: 'Events & Placements',
    icon: GraduationCap,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    badge: 'T&P',
    category: 'services'
  },
  {
    id: 'simulator',
    label: 'What-If Simulator',
    icon: SlidersHorizontal,
    allowedRoles: ['super_admin', 'supervisor', 'hod'],
    badge: 'Sim',
    category: 'analytics'
  },
  {
    id: 'analytics',
    label: 'Workload & Fairness',
    icon: BarChart3,
    allowedRoles: ['super_admin', 'supervisor', 'hod'],
    category: 'analytics'
  },
  {
    id: 'audit-reports',
    label: 'Audit Logs & Reports',
    icon: FileText,
    allowedRoles: ['super_admin', 'supervisor', 'hod'],
    category: 'analytics'
  },
  {
    id: 'ai-assistant',
    label: 'AI Campus Assistant',
    icon: Sparkles,
    allowedRoles: ['super_admin', 'supervisor', 'hod', 'faculty', 'student'],
    badge: 'AI',
    category: 'core'
  }
];

interface Props {
  activeModule: string;
  onSelectModule: (id: string) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeModule,
  onSelectModule,
  userRole,
  isCollapsed,
  onToggleCollapse
}) => {
  const visibleItems = NAV_ITEMS.filter(item => item.allowedRoles.includes(userRole));

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 transition-all duration-200 flex flex-col z-20 shadow-xs ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header toggle */}
      <div className="h-12 border-b border-slate-200 flex items-center justify-between px-3">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Modules
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-blue-50 text-blue-900 font-semibold border-l-2 border-blue-700 pl-2.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-800'
                }`}
              />
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 text-[10px] text-slate-500 bg-slate-50/70 flex items-center gap-2.5">
          <img src="/mmu-logo.png" alt="MMU Logo" className="w-6 h-6 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-700 truncate">MMU Mullana Campus</p>
            <p className="truncate text-[10px] text-slate-500">Ambala, Haryana - 133207</p>
          </div>
        </div>
      )}
    </aside>
  );
};
