import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoDisclaimerBanner } from './components/DemoDisclaimerBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { TimetableModule } from './components/TimetableModule';
import { SubstitutionModule } from './components/SubstitutionModule';
import { AvailabilityModule } from './components/AvailabilityModule';
import { StaffRoomModule } from './components/StaffRoomModule';
import { StudentServicesModule } from './components/StudentServicesModule';
import { ComplaintsModule } from './components/ComplaintsModule';
import { DirectoryModule } from './components/DirectoryModule';
import { AttendanceModule } from './components/AttendanceModule';
import { EventsModule } from './components/EventsModule';
import { SimulatorModule } from './components/SimulatorModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { AuditReportsModule } from './components/AuditReportsModule';
import { AiAssistantModal } from './components/AiAssistantModal';
import { User, TimetableSlot, SubstitutionRequest, Room, NotificationItem } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [selectedSlotForSub, setSelectedSlotForSub] = useState<TimetableSlot | null>(null);

  const fetchInitialData = async () => {
    try {
      const [meRes, usersRes, statsRes, ttRes, subsRes, roomsRes, notifRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/auth/users'),
        fetch('/api/dashboard/stats'),
        fetch('/api/timetable'),
        fetch('/api/substitutions'),
        fetch('/api/rooms'),
        fetch('/api/notifications')
      ]);

      const meData = await meRes.json();
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      const ttData = await ttRes.json();
      const subsData = await subsRes.json();
      const roomsData = await roomsRes.json();
      const notifData = await notifRes.json();

      setCurrentUser(meData.user);
      setAllUsers(usersData);
      setStats(statsData);
      setTimetableSlots(ttData.slots || []);
      setSubstitutions(subsData || []);
      setRooms(roomsData || []);
      setNotifications(notifData || []);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        fetchInitialData();
      }
    } catch (err) {
      console.error('Switch user error:', err);
    }
  };

  const handleAddSlot = async (slotData: any) => {
    try {
      const res = await fetch('/api/timetable/slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotData)
      });
      const data = await res.json();
      if (data.success) {
        fetchInitialData();
        return { success: true };
      }
      return { error: data.error || 'Failed to add slot' };
    } catch (err: any) {
      return { error: err?.message || 'Network error' };
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notif read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifs read:', err);
    }
  };

  const handleRequestSubstituteModal = (slot: TimetableSlot) => {
    setSelectedSlotForSub(slot);
    setActiveModule('substitutions');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-blue-700 font-semibold text-sm">
          <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading MMU Smart Campus Operations...</span>
        </div>
      </div>
    );
  }

  const todaySlots = timetableSlots.filter(s => s.day === 'Monday');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Demo Disclaimer */}
      <DemoDisclaimerBanner
        totalRooms={stats?.totalRoomsConfigured || 400}
        totalClasses={stats?.totalClassesConfigured || 354}
      />

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onNavigateToModule={(mod) => setActiveModule(mod)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Content Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(id) => {
            if (id === 'ai-assistant') {
              setIsAiModalOpen(true);
            } else {
              setActiveModule(id);
            }
          }}
          userRole={currentUser.role}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && (
              <DashboardOverview
                currentUser={currentUser}
                stats={stats}
                todaySlots={todaySlots}
                onNavigate={(m) => setActiveModule(m)}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
                onRefreshStats={fetchInitialData}
              />
            )}

            {activeModule === 'timetable' && (
              <TimetableModule
                slots={timetableSlots}
                currentUser={currentUser}
                onAddSlot={handleAddSlot}
                onRefresh={fetchInitialData}
                onRequestSubstituteModal={handleRequestSubstituteModal}
              />
            )}

            {activeModule === 'substitutions' && (
              <SubstitutionModule
                substitutions={substitutions}
                currentUser={currentUser}
                slots={timetableSlots}
                onRefresh={fetchInitialData}
                selectedSlotForSub={selectedSlotForSub}
                onClearSelectedSlot={() => setSelectedSlotForSub(null)}
              />
            )}

            {activeModule === 'availability' && (
              <AvailabilityModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'staff-room' && (
              <StaffRoomModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'student-services' && (
              <StudentServicesModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'complaints' && (
              <ComplaintsModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'directory' && (
              <DirectoryModule
                rooms={rooms}
              />
            )}

            {activeModule === 'attendance' && (
              <AttendanceModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'events' && (
              <EventsModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'simulator' && (
              <SimulatorModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'analytics' && (
              <AnalyticsModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}

            {activeModule === 'audit-reports' && (
              <AuditReportsModule
                currentUser={currentUser}
                onRefresh={fetchInitialData}
              />
            )}
          </div>
        </main>
      </div>

      {/* AI Campus Assistant Floating Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentUser={currentUser}
        onNavigateToModule={(mod) => {
          setActiveModule(mod);
          setIsAiModalOpen(false);
        }}
      />
    </div>
  );
}
