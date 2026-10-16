import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DutyRosterView } from './components/DutyRosterView.tsx';
import { SecurityView } from './components/SecurityView.tsx';
import { MessView } from './components/MessView.tsx';
import { HostelView } from './components/HostelView.tsx';
import { TransportView } from './components/TransportView.tsx';
import { MaintenanceView } from './components/MaintenanceView.tsx';
import { AttendanceLeaveView } from './components/AttendanceLeaveView.tsx';
import { StaffDirectoryView } from './components/StaffDirectoryView.tsx';
import { SchedulerView } from './components/SchedulerView.tsx';
import { AiAssistantModal } from './components/AiAssistantModal.tsx';
import {
  Department,
  CampusLocation,
  Employee,
  ShiftDefinition,
  DutyAssignment,
  ShiftSwapRequest,
  LeaveRequest,
  AttendanceRecord,
  SecurityGate,
  GateIncident,
  DailyMenu,
  KitchenTask,
  HostelComplaint,
  HostelInspection,
  VisitorRecord,
  CampusVehicle,
  TripSchedule,
  MaintenanceWorkOrder,
  NotificationItem,
  SchedulerExecutionLog,
  CampusAuditLog,
  UserRole,
} from './types/campus.ts';

export default function App() {
  // Current logged in demo role & identity
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [currentUserName, setCurrentUserName] = useState<string>('Dr. Rajesh Sharma');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Database state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftDefinition[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [gates, setGates] = useState<SecurityGate[]>([]);
  const [gateIncidents, setGateIncidents] = useState<GateIncident[]>([]);
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [kitchenTasks, setKitchenTasks] = useState<KitchenTask[]>([]);
  const [hostelComplaints, setHostelComplaints] = useState<HostelComplaint[]>([]);
  const [hostelInspections, setHostelInspections] = useState<HostelInspection[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [vehicles, setVehicles] = useState<CampusVehicle[]>([]);
  const [tripSchedules, setTripSchedules] = useState<TripSchedule[]>([]);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [schedulerLogs, setSchedulerLogs] = useState<SchedulerExecutionLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<CampusAuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Fetch full state from backend
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setDepartments(d.departments || []);
        setLocations(d.locations || []);
        setEmployees(d.employees || []);
        setShifts(d.shifts || []);
        setAssignments(d.assignments || []);
        setSwapRequests(d.swapRequests || []);
        setLeaves(d.leaves || []);
        setAttendance(d.attendance || []);
        setGates(d.gates || []);
        setGateIncidents(d.gateIncidents || []);
        setDailyMenus(d.dailyMenus || []);
        setKitchenTasks(d.kitchenTasks || []);
        setHostelComplaints(d.hostelComplaints || []);
        setHostelInspections(d.hostelInspections || []);
        setVisitors(d.visitors || []);
        setVehicles(d.vehicles || []);
        setTripSchedules(d.tripSchedules || []);
        setWorkOrders(d.workOrders || []);
        setNotifications(d.notifications || []);
        setSchedulerLogs(d.schedulerLogs || []);
        setAuditLogs(d.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load campus state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Trigger automated scheduler tick
  const handleTriggerScheduler = async () => {
    setIsSchedulerRunning(true);
    try {
      const res = await fetch('/api/scheduler/tick', { method: 'POST' });
      await res.json();
      await fetchState();
    } catch (err) {
      console.error('Failed to trigger scheduler:', err);
    } finally {
      setTimeout(() => setIsSchedulerRunning(false), 600);
    }
  };

  // Mark single notification read
  const handleNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications read
  const handleReadAllNotifications = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle role switch
  const handleRoleChange = (role: UserRole, name: string) => {
    setCurrentRole(role);
    setCurrentUserName(name);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Universal Top Bar */}
      <Navbar
        currentRole={currentRole}
        currentUserName={currentUserName}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
        onReadAllNotifications={handleReadAllNotifications}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onTriggerScheduler={handleTriggerScheduler}
        isSchedulerRunning={isSchedulerRunning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Bootstrapping Campus Operations Database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                currentRole={currentRole}
                currentUserName={currentUserName}
                departments={departments}
                locations={locations}
                employees={employees}
                assignments={assignments}
                swapRequests={swapRequests}
                leaves={leaves}
                gates={gates}
                hostelComplaints={hostelComplaints}
                vehicles={vehicles}
                workOrders={workOrders}
                onNavigateTab={setActiveTab}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
              />
            )}

            {activeTab === 'roster' && (
              <DutyRosterView
                currentRole={currentRole}
                currentUserName={currentUserName}
                departments={departments}
                locations={locations}
                employees={employees}
                shifts={shifts}
                assignments={assignments}
                swapRequests={swapRequests}
                onRefresh={fetchState}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
              />
            )}

            {activeTab === 'security' && (
              <SecurityView
                currentRole={currentRole}
                currentUserName={currentUserName}
                gates={gates}
                gateIncidents={gateIncidents}
                assignments={assignments}
                employees={employees}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'mess' && (
              <MessView
                currentRole={currentRole}
                currentUserName={currentUserName}
                dailyMenus={dailyMenus}
                kitchenTasks={kitchenTasks}
                assignments={assignments}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'hostel' && (
              <HostelView
                currentRole={currentRole}
                currentUserName={currentUserName}
                hostelComplaints={hostelComplaints}
                hostelInspections={hostelInspections}
                visitors={visitors}
                employees={employees}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'transport' && (
              <TransportView
                currentRole={currentRole}
                currentUserName={currentUserName}
                vehicles={vehicles}
                tripSchedules={tripSchedules}
                employees={employees}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceView
                currentRole={currentRole}
                currentUserName={currentUserName}
                workOrders={workOrders}
                employees={employees}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceLeaveView
                currentRole={currentRole}
                currentUserName={currentUserName}
                attendance={attendance}
                leaves={leaves}
                employees={employees}
                departments={departments}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'staff' && (
              <StaffDirectoryView
                currentRole={currentRole}
                currentUserName={currentUserName}
                departments={departments}
                employees={employees}
                onRefresh={fetchState}
              />
            )}

            {activeTab === 'scheduler' && (
              <SchedulerView
                currentRole={currentRole}
                currentUserName={currentUserName}
                schedulerLogs={schedulerLogs}
                notifications={notifications}
                onTriggerScheduler={handleTriggerScheduler}
                isSchedulerRunning={isSchedulerRunning}
              />
            )}
          </>
        )}
      </main>

      {/* AI Operations Assistant Drawer */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentRole={currentRole}
        currentUserName={currentUserName}
        onNavigateTab={(tab) => {
          setIsAiModalOpen(false);
          setActiveTab(tab);
        }}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">CampusOps AI</span>
            <span>·</span>
            <span>Integrated Campus Operations & Workforce Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Server Daemon: Active (60s tick)</span>
            <span>·</span>
            <span>Relational Store: Synced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
