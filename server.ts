import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
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
} from './src/types/campus.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini SDK client per gemini-api skill instructions
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// In-Memory Campus Database & Persistence
// ==========================================
interface CampusDatabase {
  departments: Department[];
  locations: CampusLocation[];
  employees: Employee[];
  shifts: ShiftDefinition[];
  assignments: DutyAssignment[];
  swapRequests: ShiftSwapRequest[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  gates: SecurityGate[];
  gateIncidents: GateIncident[];
  dailyMenus: DailyMenu[];
  kitchenTasks: KitchenTask[];
  hostelComplaints: HostelComplaint[];
  hostelInspections: HostelInspection[];
  visitors: VisitorRecord[];
  vehicles: CampusVehicle[];
  tripSchedules: TripSchedule[];
  workOrders: MaintenanceWorkOrder[];
  notifications: NotificationItem[];
  schedulerLogs: SchedulerExecutionLog[];
  auditLogs: CampusAuditLog[];
}

const DB_FILE = path.resolve(process.cwd(), 'campus_db.json');

const INITIAL_DB: CampusDatabase = {
  departments: [
    {
      id: 'dept-sec',
      code: 'SEC',
      name: 'Campus Security & Vigilance',
      description: 'Physical perimeter safety, 24/7 gate control, visitor validation, and emergency response.',
      hodName: 'Col. Ranjit Verma (Retd)',
      supervisorName: 'Vikram Singh',
      totalStaff: 8,
      contactExtension: 'ext-4011',
    },
    {
      id: 'dept-trn',
      code: 'TRN',
      name: 'Transport & Fleet Services',
      description: 'Campus shuttle fleet, city student transit routes, vehicle fitness, and driver coordination.',
      hodName: 'Eng. Hardeep Malhotra',
      supervisorName: 'Gurpreet Singh',
      totalStaff: 5,
      contactExtension: 'ext-4022',
    },
    {
      id: 'dept-hst',
      code: 'HST',
      name: 'Hostel Administration & Caretaking',
      description: 'Student hostel blocks, room allocation, maintenance grievances, hygiene and night curfews.',
      hodName: 'Prof. Ananya Sen',
      supervisorName: 'Sunita Rao',
      totalStaff: 6,
      contactExtension: 'ext-4033',
    },
    {
      id: 'dept-mss',
      code: 'MSS',
      name: 'Campus Mess & Food Services',
      description: 'Central dining operations, culinary shifts, food safety compliance, and diet provisions.',
      hodName: 'Chef Vinod Mathur',
      supervisorName: 'Anil Verma',
      totalStaff: 7,
      contactExtension: 'ext-4044',
    },
    {
      id: 'dept-mnt',
      code: 'MNT',
      name: 'Estate Maintenance & Civil Works',
      description: 'Power distribution, plumbing, HVAC, civil repair work orders, and lab utility upkeep.',
      hodName: 'Prof. Arvind Mehta',
      supervisorName: 'Kavita Nair',
      totalStaff: 6,
      contactExtension: 'ext-4055',
    },
    {
      id: 'dept-hkp',
      code: 'HKP',
      name: 'Housekeeping & Environmental Hygiene',
      description: 'Classrooms, laboratory disinfection, waste management, and campus grounds sanitation.',
      hodName: 'Smt. Saroj Chawla',
      supervisorName: 'Rajender Negi',
      totalStaff: 6,
      contactExtension: 'ext-4066',
    },
    {
      id: 'dept-adm',
      code: 'ADM',
      name: 'Campus Central Administration',
      description: 'Executive oversight, HR policy, inter-departmental audits, and institutional compliance.',
      hodName: 'Dr. Rajesh Sharma',
      supervisorName: 'Meera Desai',
      totalStaff: 4,
      contactExtension: 'ext-4001',
    },
  ],

  locations: [
    {
      id: 'loc-gate-main',
      name: 'Main Gate (Gate 1)',
      departmentId: 'dept-sec',
      category: 'gate',
      minStaffPerShift: { morning: 2, evening: 2, night: 2 },
    },
    {
      id: 'loc-gate-north',
      name: 'North Gate (Gate 2)',
      departmentId: 'dept-sec',
      category: 'gate',
      minStaffPerShift: { morning: 1, evening: 1, night: 1 },
    },
    {
      id: 'loc-gate-hostel',
      name: 'Hostel Perimeter Gate (Gate 3)',
      departmentId: 'dept-sec',
      category: 'gate',
      minStaffPerShift: { morning: 1, evening: 1, night: 2 },
    },
    {
      id: 'loc-gate-lib',
      name: 'Central Library Post',
      departmentId: 'dept-sec',
      category: 'gate',
      minStaffPerShift: { morning: 1, evening: 1, night: 1 },
    },
    {
      id: 'loc-hst-a',
      name: 'Block A (Boys Hostel)',
      departmentId: 'dept-hst',
      category: 'hostel',
      minStaffPerShift: { morning: 2, evening: 1, night: 1 },
    },
    {
      id: 'loc-hst-b',
      name: 'Block B (Girls Hostel)',
      departmentId: 'dept-hst',
      category: 'hostel',
      minStaffPerShift: { morning: 2, evening: 2, night: 2 },
    },
    {
      id: 'loc-hst-c',
      name: 'Block C (PG Scholars Hostel)',
      departmentId: 'dept-hst',
      category: 'hostel',
      minStaffPerShift: { morning: 1, evening: 1, night: 1 },
    },
    {
      id: 'loc-mess-main',
      name: 'Central Dining Hall & Kitchen',
      departmentId: 'dept-mss',
      category: 'mess',
      minStaffPerShift: { morning: 3, evening: 3, night: 1 },
    },
    {
      id: 'loc-trn-depot',
      name: 'Campus Motor Pool & Depot',
      departmentId: 'dept-trn',
      category: 'transport',
      minStaffPerShift: { morning: 2, evening: 2, night: 1 },
    },
    {
      id: 'loc-mnt-substation',
      name: 'Primary Electrical Substation & Pumps',
      departmentId: 'dept-mnt',
      category: 'facility',
      minStaffPerShift: { morning: 2, evening: 1, night: 1 },
    },
    {
      id: 'loc-acad-central',
      name: 'Central Academic Complex',
      departmentId: 'dept-hkp',
      category: 'academic',
      minStaffPerShift: { morning: 3, evening: 2, night: 1 },
    },
  ],

  employees: [
    {
      id: 'emp-001',
      employeeCode: 'ADM-101',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@campus.edu',
      phone: '+91 98110 12001',
      departmentId: 'dept-adm',
      role: 'Super Admin',
      jobTitle: 'Director of Campus Operations',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'RS',
    },
    {
      id: 'emp-002',
      employeeCode: 'SEC-201',
      name: 'Vikram Singh',
      email: 'vikram.singh@campus.edu',
      phone: '+91 98110 12002',
      departmentId: 'dept-sec',
      role: 'Security Supervisor',
      jobTitle: 'Chief Security Officer',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      shiftPreference: 'morning',
      weeklyOffDay: 1,
      status: 'active',
      avatarInitials: 'VS',
    },
    {
      id: 'emp-003',
      employeeCode: 'SEC-301',
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@campus.edu',
      phone: '+91 98110 12003',
      departmentId: 'dept-sec',
      role: 'Employee / Staff',
      jobTitle: 'Senior Security Guard',
      reportingToId: 'emp-002',
      reportingToName: 'Vikram Singh',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'RK',
    },
    {
      id: 'emp-004',
      employeeCode: 'SEC-302',
      name: 'Ajay Pal',
      email: 'ajay.pal@campus.edu',
      phone: '+91 98110 12004',
      departmentId: 'dept-sec',
      role: 'Employee / Staff',
      jobTitle: 'Security Guard',
      reportingToId: 'emp-002',
      reportingToName: 'Vikram Singh',
      shiftPreference: 'evening',
      weeklyOffDay: 2,
      status: 'active',
      avatarInitials: 'AP',
    },
    {
      id: 'emp-005',
      employeeCode: 'SEC-303',
      name: 'Sunil Yadav',
      email: 'sunil.yadav@campus.edu',
      phone: '+91 98110 12005',
      departmentId: 'dept-sec',
      role: 'Employee / Staff',
      jobTitle: 'Night Patrol Officer',
      reportingToId: 'emp-002',
      reportingToName: 'Vikram Singh',
      shiftPreference: 'night',
      weeklyOffDay: 3,
      status: 'active',
      avatarInitials: 'SY',
    },
    {
      id: 'emp-006',
      employeeCode: 'SEC-304',
      name: 'Devendra Joshi',
      email: 'devendra.joshi@campus.edu',
      phone: '+91 98110 12006',
      departmentId: 'dept-sec',
      role: 'Employee / Staff',
      jobTitle: 'Security Guard',
      reportingToId: 'emp-002',
      reportingToName: 'Vikram Singh',
      shiftPreference: 'night',
      weeklyOffDay: 4,
      status: 'active',
      avatarInitials: 'DJ',
    },
    {
      id: 'emp-007',
      employeeCode: 'HST-201',
      name: 'Sunita Rao',
      email: 'sunita.rao@campus.edu',
      phone: '+91 98110 12007',
      departmentId: 'dept-hst',
      role: 'Hostel Warden',
      jobTitle: 'Chief Hostel Warden',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'SR',
    },
    {
      id: 'emp-008',
      employeeCode: 'HST-301',
      name: 'Kamla Bhatt',
      email: 'kamla.bhatt@campus.edu',
      phone: '+91 98110 12008',
      departmentId: 'dept-hst',
      role: 'Employee / Staff',
      jobTitle: 'Assistant Warden (Block B)',
      reportingToId: 'emp-007',
      reportingToName: 'Sunita Rao',
      shiftPreference: 'evening',
      weeklyOffDay: 1,
      status: 'active',
      avatarInitials: 'KB',
    },
    {
      id: 'emp-009',
      employeeCode: 'MSS-201',
      name: 'Anil Verma',
      email: 'anil.verma@campus.edu',
      phone: '+91 98110 12009',
      departmentId: 'dept-mss',
      role: 'Mess Manager',
      jobTitle: 'Dining Operations Manager',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      shiftPreference: 'morning',
      weeklyOffDay: 1,
      status: 'active',
      avatarInitials: 'AV',
    },
    {
      id: 'emp-010',
      employeeCode: 'MSS-301',
      name: 'Suresh Tiwari',
      email: 'suresh.tiwari@campus.edu',
      phone: '+91 98110 12010',
      departmentId: 'dept-mss',
      role: 'Employee / Staff',
      jobTitle: 'Head Culinary Cook',
      reportingToId: 'emp-009',
      reportingToName: 'Anil Verma',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'ST',
    },
    {
      id: 'emp-011',
      employeeCode: 'MSS-302',
      name: 'Gopal Das',
      email: 'gopal.das@campus.edu',
      phone: '+91 98110 12011',
      departmentId: 'dept-mss',
      role: 'Employee / Staff',
      jobTitle: 'Mess Pantry Assistant',
      reportingToId: 'emp-009',
      reportingToName: 'Anil Verma',
      shiftPreference: 'evening',
      weeklyOffDay: 2,
      status: 'active',
      avatarInitials: 'GD',
    },
    {
      id: 'emp-012',
      employeeCode: 'MSS-303',
      name: 'Manoj Bisht',
      email: 'manoj.bisht@campus.edu',
      phone: '+91 98110 12012',
      departmentId: 'dept-mss',
      role: 'Employee / Staff',
      jobTitle: 'Kitchen Hygiene Lead',
      reportingToId: 'emp-009',
      reportingToName: 'Anil Verma',
      shiftPreference: 'morning',
      weeklyOffDay: 3,
      status: 'active',
      avatarInitials: 'MB',
    },
    {
      id: 'emp-013',
      employeeCode: 'TRN-201',
      name: 'Gurpreet Singh',
      email: 'gurpreet.singh@campus.edu',
      phone: '+91 98110 12013',
      departmentId: 'dept-trn',
      role: 'Transport Manager',
      jobTitle: 'Fleet Logistics Officer',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'GS',
    },
    {
      id: 'emp-014',
      employeeCode: 'TRN-301',
      name: 'Harbhajan Singh',
      email: 'harbhajan.singh@campus.edu',
      phone: '+91 98110 12014',
      departmentId: 'dept-trn',
      role: 'Employee / Staff',
      jobTitle: 'Heavy Vehicle Bus Driver',
      reportingToId: 'emp-013',
      reportingToName: 'Gurpreet Singh',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'HS',
    },
    {
      id: 'emp-015',
      employeeCode: 'TRN-302',
      name: 'Kuldeep Verma',
      email: 'kuldeep.verma@campus.edu',
      phone: '+91 98110 12015',
      departmentId: 'dept-trn',
      role: 'Employee / Staff',
      jobTitle: 'Shuttle Driver & Mechanic',
      reportingToId: 'emp-013',
      reportingToName: 'Gurpreet Singh',
      shiftPreference: 'evening',
      weeklyOffDay: 2,
      status: 'active',
      avatarInitials: 'KV',
    },
    {
      id: 'emp-016',
      employeeCode: 'MNT-201',
      name: 'Kavita Nair',
      email: 'kavita.nair@campus.edu',
      phone: '+91 98110 12016',
      departmentId: 'dept-mnt',
      role: 'Maintenance Supervisor',
      jobTitle: 'Superintending Engineer',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'KN',
    },
    {
      id: 'emp-017',
      employeeCode: 'MNT-301',
      name: 'Imran Khan',
      email: 'imran.khan@campus.edu',
      phone: '+91 98110 12017',
      departmentId: 'dept-mnt',
      role: 'Employee / Staff',
      jobTitle: 'Senior Campus Electrician',
      reportingToId: 'emp-016',
      reportingToName: 'Kavita Nair',
      shiftPreference: 'morning',
      weeklyOffDay: 1,
      status: 'active',
      avatarInitials: 'IK',
    },
    {
      id: 'emp-018',
      employeeCode: 'MNT-302',
      name: 'Naresh Joshi',
      email: 'naresh.joshi@campus.edu',
      phone: '+91 98110 12018',
      departmentId: 'dept-mnt',
      role: 'Employee / Staff',
      jobTitle: 'Master Plumber',
      reportingToId: 'emp-016',
      reportingToName: 'Kavita Nair',
      shiftPreference: 'morning',
      weeklyOffDay: 2,
      status: 'active',
      avatarInitials: 'NJ',
    },
    {
      id: 'emp-019',
      employeeCode: 'HKP-301',
      name: 'Sunita Devi',
      email: 'sunita.devi@campus.edu',
      phone: '+91 98110 12019',
      departmentId: 'dept-hkp',
      role: 'Employee / Staff',
      jobTitle: 'Lead Housekeeping Attendant',
      reportingToId: 'emp-016',
      reportingToName: 'Kavita Nair',
      shiftPreference: 'morning',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'SD',
    },
    {
      id: 'emp-020',
      employeeCode: 'ADM-201',
      name: 'Meera Desai',
      email: 'meera.desai@campus.edu',
      phone: '+91 98110 12020',
      departmentId: 'dept-adm',
      role: 'Management / Auditor',
      jobTitle: 'Institutional Compliance Auditor',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'MD',
    },
    {
      id: 'emp-021',
      employeeCode: 'MNT-101',
      name: 'Prof. Arvind Mehta',
      email: 'arvind.mehta@campus.edu',
      phone: '+91 98110 12021',
      departmentId: 'dept-mnt',
      role: 'HOD',
      jobTitle: 'Head of Department (Estate & Infrastructure)',
      reportingToId: 'emp-001',
      reportingToName: 'Dr. Rajesh Sharma',
      weeklyOffDay: 0,
      status: 'active',
      avatarInitials: 'AM',
    },
  ],

  shifts: [
    {
      id: 'shift-morn',
      name: 'Morning Shift',
      code: 'morning',
      startTime: '06:00',
      endTime: '14:00',
      colorTag: '#0284c7',
    },
    {
      id: 'shift-eve',
      name: 'Evening Shift',
      code: 'evening',
      startTime: '14:00',
      endTime: '22:00',
      colorTag: '#d97706',
    },
    {
      id: 'shift-night',
      name: 'Night Shift',
      code: 'night',
      startTime: '22:00',
      endTime: '06:00',
      colorTag: '#7c3aed',
    },
    {
      id: 'shift-gen',
      name: 'General Day Shift',
      code: 'general',
      startTime: '09:00',
      endTime: '17:00',
      colorTag: '#16a34a',
    },
  ],

  assignments: [
    {
      id: 'asgn-101',
      date: '2026-10-16',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      shiftHours: '06:00 - 14:00',
      shiftCode: 'morning',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      locationId: 'loc-gate-main',
      locationName: 'Main Gate (Gate 1)',
      employeeId: 'emp-003',
      employeeName: 'Ramesh Kumar',
      employeeCode: 'SEC-301',
      status: 'scheduled',
      attendanceStatus: 'present',
      checkInTime: '05:55',
      checkInMethod: 'supervisor_verified',
      notes: 'Stationed at vehicular boom barrier.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-102',
      date: '2026-10-16',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      shiftHours: '06:00 - 14:00',
      shiftCode: 'morning',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      locationId: 'loc-gate-main',
      locationName: 'Main Gate (Gate 1)',
      employeeId: 'emp-004',
      employeeName: 'Ajay Pal',
      employeeCode: 'SEC-302',
      status: 'scheduled',
      attendanceStatus: 'present',
      checkInTime: '06:02',
      checkInMethod: 'qr_scanner',
      notes: 'Visitor logging and ID card inspection.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-103',
      date: '2026-10-16',
      shiftId: 'shift-eve',
      shiftName: 'Evening Shift',
      shiftHours: '14:00 - 22:00',
      shiftCode: 'evening',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      locationId: 'loc-gate-north',
      locationName: 'North Gate (Gate 2)',
      employeeId: 'emp-004',
      employeeName: 'Ajay Pal',
      employeeCode: 'SEC-302',
      status: 'scheduled',
      attendanceStatus: 'pending',
      notes: 'Evening student dispatch surveillance.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-104',
      date: '2026-10-16',
      shiftId: 'shift-night',
      shiftName: 'Night Shift',
      shiftHours: '22:00 - 06:00',
      shiftCode: 'night',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      locationId: 'loc-gate-hostel',
      locationName: 'Hostel Perimeter Gate (Gate 3)',
      employeeId: 'emp-005',
      employeeName: 'Sunil Yadav',
      employeeCode: 'SEC-303',
      status: 'scheduled',
      attendanceStatus: 'pending',
      notes: 'Hostel curfew verification and emergency vehicle entry.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-105',
      date: '2026-10-16',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      shiftHours: '06:00 - 14:00',
      shiftCode: 'morning',
      departmentId: 'dept-mss',
      departmentName: 'Campus Mess & Food Services',
      locationId: 'loc-mess-main',
      locationName: 'Central Dining Hall & Kitchen',
      employeeId: 'emp-010',
      employeeName: 'Suresh Tiwari',
      employeeCode: 'MSS-301',
      status: 'scheduled',
      attendanceStatus: 'present',
      checkInTime: '05:40',
      checkInMethod: 'supervisor_verified',
      notes: 'Breakfast preparation & diet kitchen head.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-106',
      date: '2026-10-16',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      shiftHours: '06:00 - 14:00',
      shiftCode: 'morning',
      departmentId: 'dept-mss',
      departmentName: 'Campus Mess & Food Services',
      locationId: 'loc-mess-main',
      locationName: 'Central Dining Hall & Kitchen',
      employeeId: 'emp-012',
      employeeName: 'Manoj Bisht',
      employeeCode: 'MSS-303',
      status: 'scheduled',
      attendanceStatus: 'present',
      checkInTime: '06:10',
      checkInMethod: 'qr_scanner',
      notes: 'Morning dishwashing line & sanitation.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-107',
      date: '2026-10-16',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      shiftHours: '06:00 - 14:00',
      shiftCode: 'morning',
      departmentId: 'dept-trn',
      departmentName: 'Transport & Fleet Services',
      locationId: 'loc-trn-depot',
      locationName: 'Campus Motor Pool & Depot',
      employeeId: 'emp-014',
      employeeName: 'Harbhajan Singh',
      employeeCode: 'TRN-301',
      status: 'scheduled',
      attendanceStatus: 'present',
      checkInTime: '06:15',
      checkInMethod: 'supervisor_verified',
      notes: 'Trip 1 Route: Campus to City Metro Station.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-108',
      date: '2026-10-16',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      shiftHours: '06:00 - 14:00',
      shiftCode: 'morning',
      departmentId: 'dept-mnt',
      departmentName: 'Estate Maintenance & Civil Works',
      locationId: 'loc-mnt-substation',
      locationName: 'Primary Electrical Substation & Pumps',
      employeeId: 'emp-017',
      employeeName: 'Imran Khan',
      employeeCode: 'MNT-301',
      status: 'scheduled',
      attendanceStatus: 'present',
      checkInTime: '06:30',
      checkInMethod: 'manual',
      notes: 'Phase balancer routine testing.',
      createdAt: '2026-10-15T18:00:00Z',
    },
    {
      id: 'asgn-109',
      date: '2026-10-17',
      shiftId: 'shift-night',
      shiftName: 'Night Shift',
      shiftHours: '22:00 - 06:00',
      shiftCode: 'night',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      locationId: 'loc-gate-main',
      locationName: 'Main Gate (Gate 1)',
      employeeId: 'emp-006',
      employeeName: 'Devendra Joshi',
      employeeCode: 'SEC-304',
      status: 'suggested',
      isSuggested: true,
      attendanceStatus: 'pending',
      notes: 'Automated AI proposal: Balanced night rest rotation.',
      createdAt: '2026-10-16T01:00:00Z',
    },
  ],

  swapRequests: [
    {
      id: 'swap-01',
      assignmentId: 'asgn-104',
      date: '2026-10-16',
      requestingEmployeeId: 'emp-005',
      requestingEmployeeName: 'Sunil Yadav',
      targetEmployeeId: 'emp-006',
      targetEmployeeName: 'Devendra Joshi',
      reason: 'Urgent family medical visit in the evening.',
      status: 'pending',
      createdAt: '2026-10-16T00:30:00Z',
    },
  ],

  leaves: [
    {
      id: 'leave-01',
      employeeId: 'emp-018',
      employeeName: 'Naresh Joshi',
      departmentId: 'dept-mnt',
      departmentName: 'Estate Maintenance & Civil Works',
      leaveType: 'Casual',
      startDate: '2026-10-17',
      endDate: '2026-10-18',
      reason: 'Personal family ceremony in home town.',
      status: 'approved',
      approvedBy: 'Kavita Nair',
      approvedAt: '2026-10-15T14:30:00Z',
      replacementEmployeeId: 'emp-017',
      replacementEmployeeName: 'Imran Khan (Covering emergency pipe valve isolations)',
      createdAt: '2026-10-14T10:00:00Z',
    },
  ],

  attendance: [
    {
      id: 'att-001',
      date: '2026-10-16',
      employeeId: 'emp-003',
      employeeName: 'Ramesh Kumar',
      employeeCode: 'SEC-301',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      checkIn: '05:55',
      status: 'present',
      verificationMethod: 'supervisor_verified',
      verifiedBy: 'Vikram Singh',
      notes: 'Physically inspected gate register.',
    },
    {
      id: 'att-002',
      date: '2026-10-16',
      employeeId: 'emp-004',
      employeeName: 'Ajay Pal',
      employeeCode: 'SEC-302',
      departmentId: 'dept-sec',
      departmentName: 'Campus Security & Vigilance',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      checkIn: '06:02',
      status: 'present',
      verificationMethod: 'qr_scanner',
      notes: 'Scanned digital gate badge #SEC-QR-01.',
    },
    {
      id: 'att-003',
      date: '2026-10-16',
      employeeId: 'emp-010',
      employeeName: 'Suresh Tiwari',
      employeeCode: 'MSS-301',
      departmentId: 'dept-mss',
      departmentName: 'Campus Mess & Food Services',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      checkIn: '05:40',
      status: 'present',
      verificationMethod: 'supervisor_verified',
      verifiedBy: 'Anil Verma',
      notes: 'Arrived early for breakfast steam kettle setup.',
    },
    {
      id: 'att-004',
      date: '2026-10-16',
      employeeId: 'emp-014',
      employeeName: 'Harbhajan Singh',
      employeeCode: 'TRN-301',
      departmentId: 'dept-trn',
      departmentName: 'Transport & Fleet Services',
      shiftId: 'shift-morn',
      shiftName: 'Morning Shift',
      checkIn: '06:15',
      status: 'present',
      verificationMethod: 'supervisor_verified',
      verifiedBy: 'Gurpreet Singh',
      notes: 'Bus inspection pre-trip clearance verified.',
    },
  ],

  gates: [
    {
      id: 'gate-01',
      gateCode: 'GATE-01',
      name: 'Main Campus Boulevard Gate',
      type: 'vehicular',
      status: 'operational',
      currentGuardsOnDuty: 2,
      requiredGuards: 2,
      radioChannel: 'VHF-Channel 01',
    },
    {
      id: 'gate-02',
      gateCode: 'GATE-02',
      name: 'North Academic & Labs Gate',
      type: 'mixed',
      status: 'operational',
      currentGuardsOnDuty: 1,
      requiredGuards: 1,
      radioChannel: 'VHF-Channel 02',
    },
    {
      id: 'gate-03',
      gateCode: 'GATE-03',
      name: 'Hostels & Residential Perimeter Gate',
      type: 'pedestrian',
      status: 'restricted',
      currentGuardsOnDuty: 1,
      requiredGuards: 2,
      radioChannel: 'VHF-Channel 03',
    },
    {
      id: 'gate-04',
      gateCode: 'GATE-04',
      name: 'Library & Sports Complex Gate',
      type: 'pedestrian',
      status: 'operational',
      currentGuardsOnDuty: 1,
      requiredGuards: 1,
      radioChannel: 'VHF-Channel 04',
    },
  ],

  gateIncidents: [
    {
      id: 'inc-001',
      gateId: 'gate-01',
      gateName: 'Main Campus Boulevard Gate',
      reportedByGuardId: 'emp-003',
      reportedByGuardName: 'Ramesh Kumar',
      timestamp: '2026-10-16T06:45:00Z',
      severity: 'medium',
      title: 'Commercial Delivery Vehicle Without Gate Pass',
      description: 'Heavy logistics truck carrying lab equipment arrived without pre-issued visitor QR barcode. Held at outer bay until estate office clearance.',
      visitorOrVehicleInfo: 'Truck DL-1L-4492 (SafeSpeed Cargo)',
      status: 'investigating',
      supervisorReviewNotes: 'Contacted Lab Store Manager. Store assistant confirmed dispatch.',
    },
  ],

  dailyMenus: [
    {
      id: 'menu-01',
      date: '2026-10-16',
      meal: 'Breakfast',
      items: ['Idli & Crispy Vada', 'Fresh Coconut Chutney & Vegetable Sambar', 'Boiled Eggs', 'Sprouted Moong Salad', 'Tea & Filter Coffee'],
      headChef: 'Suresh Tiwari',
      dietaryNotes: 'High-protein option available. Separate vegetarian preparation counter.',
      preparedServingsTarget: 850,
      status: 'served',
    },
    {
      id: 'menu-02',
      date: '2026-10-16',
      meal: 'Lunch',
      items: ['Dal Makhani', 'Paneer Butter Masala', 'Jeera Pulao', 'Fresh Tawa Roti', 'Boondi Raita', 'Green Salad & Papad'],
      headChef: 'Suresh Tiwari',
      dietaryNotes: 'Gluten-free rice option segregated.',
      preparedServingsTarget: 1100,
      status: 'in_prep',
    },
    {
      id: 'menu-03',
      date: '2026-10-16',
      meal: 'Dinner',
      items: ['Mix Vegetable Curry', 'Yellow Moong Dal Tadka', 'Steamed Rice', 'Chapati', 'Gulab Jamun'],
      headChef: 'Gopal Das',
      dietaryNotes: 'Light evening nutrition scheme.',
      preparedServingsTarget: 950,
      status: 'planned',
    },
  ],

  kitchenTasks: [
    {
      id: 'kt-01',
      date: '2026-10-16',
      meal: 'Breakfast',
      title: 'Cold Storage Temperature Audit & Batter Inspection',
      assignedStaffName: 'Manoj Bisht',
      assignedStaffId: 'emp-012',
      category: 'Hygiene Inspection',
      status: 'completed',
      completedAt: '05:30',
    },
    {
      id: 'kt-02',
      date: '2026-10-16',
      meal: 'Lunch',
      title: 'Vegetable Sanitization and Precision Chopping',
      assignedStaffName: 'Gopal Das',
      assignedStaffId: 'emp-011',
      category: 'Preparation',
      status: 'in_progress',
    },
    {
      id: 'kt-03',
      date: '2026-10-16',
      meal: 'Daily Cleaning',
      title: 'Exhaust Chimney Degreasing and Floor Deep Scrub',
      assignedStaffName: 'Manoj Bisht',
      assignedStaffId: 'emp-012',
      category: 'Dishwashing',
      status: 'pending',
    },
  ],

  hostelComplaints: [
    {
      id: 'comp-001',
      complaintCode: 'HST-CMP-401',
      hostelBlock: 'Block A (Boys)',
      roomNumber: 'A-208',
      residentName: 'Kunal Singhania',
      studentRollNo: 'CS-2024-042',
      category: 'Electrical',
      priority: 'high',
      description: 'Study desk power point sparking when laptop charger plugged in. Short circuit risk.',
      assignedStaffId: 'emp-017',
      assignedStaffName: 'Imran Khan',
      deadline: '2026-10-16',
      status: 'in_progress',
      hasAttachment: true,
      createdAt: '2026-10-15T16:00:00Z',
    },
    {
      id: 'comp-002',
      complaintCode: 'HST-CMP-402',
      hostelBlock: 'Block B (Girls)',
      roomNumber: 'B-314',
      residentName: 'Pooja Kashyap',
      studentRollNo: 'EE-2023-118',
      category: 'Plumbing',
      priority: 'urgent',
      description: 'Continuous water leakage from overhead shower mixer valve causing slippery floor.',
      assignedStaffId: 'emp-018',
      assignedStaffName: 'Naresh Joshi',
      deadline: '2026-10-15', // Intentionally past deadline to trigger overdue alert
      status: 'open',
      hasAttachment: true,
      createdAt: '2026-10-14T09:00:00Z',
    },
    {
      id: 'comp-003',
      complaintCode: 'HST-CMP-403',
      hostelBlock: 'Block C (PG Scholars)',
      roomNumber: 'C-102',
      residentName: 'Anand Rathi',
      studentRollNo: 'PHD-2022-005',
      category: 'Internet/Wi-Fi',
      priority: 'normal',
      description: 'Floor Wi-Fi access point drops packet connection frequently during research downloads.',
      assignedStaffId: 'emp-017',
      assignedStaffName: 'Imran Khan',
      deadline: '2026-10-18',
      status: 'open',
      createdAt: '2026-10-15T20:00:00Z',
    },
  ],

  hostelInspections: [
    {
      id: 'insp-01',
      date: '2026-10-15',
      hostelBlock: 'Block B (Girls Hostel)',
      floor: 'Floor 2 & 3',
      wardenName: 'Sunita Rao',
      scorePercent: 94,
      hygieneStatus: 'Excellent',
      fireSafetyChecked: true,
      notes: 'Corridors clear of obstruction. Fire extinguishers verified up to date.',
    },
  ],

  visitors: [
    {
      id: 'vis-01',
      visitorName: 'Mr. Satish Kashyap (Guardian)',
      contactNumber: '+91 99887 65432',
      residentVisited: 'Pooja Kashyap (B-314)',
      hostelBlock: 'Block B (Girls)',
      roomNumber: 'B-314',
      checkInTime: '10:15',
      idProofType: 'National ID',
      status: 'checked_in',
    },
  ],

  vehicles: [
    {
      id: 'veh-01',
      vehicleNumber: 'DL-1PA-8801',
      model: 'Tata Marcopolo Starbus 42',
      type: 'Bus (42 Seater)',
      fuelType: 'CNG',
      assignedDriverId: 'emp-014',
      assignedDriverName: 'Harbhajan Singh',
      assignedAttendantName: 'Baldev Ram',
      fitnessValidUntil: '2027-04-30',
      insuranceValidUntil: '2027-03-15',
      nextServiceDueDate: '2026-10-20', // Due in 4 days -> Maintenance alert!
      status: 'active',
      mileageKm: 48200,
    },
    {
      id: 'veh-02',
      vehicleNumber: 'DL-1PA-8802',
      model: 'Ashok Leyland Sunshine 42',
      type: 'Bus (42 Seater)',
      fuelType: 'Diesel',
      assignedDriverId: 'emp-015',
      assignedDriverName: 'Kuldeep Verma',
      assignedAttendantName: 'Sanjay Kumar',
      fitnessValidUntil: '2026-10-22', // Due in 6 days!
      insuranceValidUntil: '2027-01-10',
      nextServiceDueDate: '2026-11-15',
      status: 'active',
      mileageKm: 62400,
    },
    {
      id: 'veh-03',
      vehicleNumber: 'DL-1EV-0104',
      model: 'Mahindra e-Supro Green Shuttle',
      type: 'Electric Shuttle (14 Seater)',
      fuelType: 'Electric',
      fitnessValidUntil: '2028-02-28',
      insuranceValidUntil: '2027-06-30',
      nextServiceDueDate: '2026-12-05',
      status: 'active',
      mileageKm: 14200,
    },
  ],

  tripSchedules: [
    {
      id: 'trip-01',
      tripCode: 'TRP-101',
      date: '2026-10-16',
      routeName: 'Route 1: Campus Express to Central Metro Station',
      origin: 'Campus Main Gate Terminal',
      destination: 'Central Metro Hub (Platform 3)',
      vehicleId: 'veh-01',
      vehicleNumber: 'DL-1PA-8801',
      driverId: 'emp-014',
      driverName: 'Harbhajan Singh',
      attendantName: 'Baldev Ram',
      departureTime: '07:30',
      expectedArrivalTime: '08:20',
      status: 'completed',
      actualDepartureTime: '07:32',
      actualArrivalTime: '08:18',
      notes: 'Morning student run. 38 students boarded.',
    },
    {
      id: 'trip-02',
      tripCode: 'TRP-102',
      date: '2026-10-16',
      routeName: 'Route 2: Campus to Tech City & South Station',
      origin: 'Campus Main Gate Terminal',
      destination: 'Tech City South Station',
      vehicleId: 'veh-02',
      vehicleNumber: 'DL-1PA-8802',
      driverId: 'emp-015',
      driverName: 'Kuldeep Verma',
      attendantName: 'Sanjay Kumar',
      departureTime: '16:30',
      expectedArrivalTime: '17:35',
      status: 'scheduled',
      notes: 'Evening staff and research faculty transit.',
    },
  ],

  workOrders: [
    {
      id: 'wo-001',
      workOrderCode: 'WO-2026-891',
      title: 'Repair Substation Capacitor Bank 2 Fault',
      departmentCategory: 'Electrical',
      location: 'Primary Electrical Substation & Pumps',
      priority: 'critical',
      assignedEmployeeId: 'emp-017',
      assignedEmployeeName: 'Imran Khan',
      reportedBy: 'Kavita Nair',
      reportedDate: '2026-10-15',
      deadline: '2026-10-16',
      status: 'in_progress',
      beforePhotoDescription: 'Burn marks visible on relay terminal block 3.',
      createdAt: '2026-10-15T08:00:00Z',
    },
    {
      id: 'wo-002',
      workOrderCode: 'WO-2026-892',
      title: 'Replace Leaking Booster Pump Flange Gasket',
      departmentCategory: 'Plumbing',
      location: 'Hostel Water Distribution Pump Room',
      priority: 'high',
      assignedEmployeeId: 'emp-018',
      assignedEmployeeName: 'Naresh Joshi',
      reportedBy: 'Sunita Rao',
      reportedDate: '2026-10-13',
      deadline: '2026-10-15', // Past deadline -> Overdue!
      status: 'open',
      beforePhotoDescription: 'High pressure seepage on 4-inch cast iron coupling.',
      createdAt: '2026-10-13T10:00:00Z',
    },
    {
      id: 'wo-003',
      workOrderCode: 'WO-2026-893',
      title: 'Air Handling Unit Filter Replacement & Duct Sanitization',
      departmentCategory: 'HVAC',
      location: 'Central Academic Complex (Auditorium)',
      priority: 'medium',
      assignedEmployeeId: 'emp-017',
      assignedEmployeeName: 'Imran Khan',
      reportedBy: 'Prof. Arvind Mehta',
      reportedDate: '2026-10-14',
      deadline: '2026-10-18',
      status: 'completed',
      workRemarks: 'Replaced 8 HEPA filters, calibrated airflow damper actuator.',
      supervisorApprovalDate: '2026-10-15T17:00:00Z',
      materialsUsed: '8x HEPA 24x24 filters, 1x Damper sealing gasket',
      beforePhotoDescription: 'Dust clogged mesh on pre-filter intake.',
      afterPhotoDescription: 'Clean sealed filter housing with 0.02 delta-P reading.',
      createdAt: '2026-10-14T11:00:00Z',
    },
  ],

  notifications: [
    {
      id: 'notif-01',
      type: 'overdue_work',
      severity: 'alert',
      title: 'Overdue Maintenance Work Order',
      message: 'Work order WO-2026-892 (Booster Pump Flange Gasket) reached deadline on 2026-10-15 without resolution.',
      departmentId: 'dept-mnt',
      relatedEntityId: 'wo-002',
      isRead: false,
      timestamp: '2026-10-16T01:30:00Z',
    },
    {
      id: 'notif-02',
      type: 'vehicle_maintenance',
      severity: 'warning',
      title: 'Bus Maintenance Scheduled Soon',
      message: 'Tata Marcopolo Bus DL-1PA-8801 regular service is due in 4 days (2026-10-20).',
      departmentId: 'dept-trn',
      relatedEntityId: 'veh-01',
      isRead: false,
      timestamp: '2026-10-16T01:00:00Z',
    },
    {
      id: 'notif-03',
      type: 'shift_swap',
      severity: 'info',
      title: 'Shift Swap Request Pending Supervisor Approval',
      message: 'Sunil Yadav requested Devendra Joshi to cover Night Shift at Hostel Perimeter Gate on 2026-10-16.',
      departmentId: 'dept-sec',
      relatedEntityId: 'swap-01',
      isRead: false,
      timestamp: '2026-10-16T00:35:00Z',
    },
  ],

  schedulerLogs: [
    {
      id: 'sched-log-01',
      timestamp: '2026-10-16T01:55:00Z',
      triggersRun: [
        'Check-In Compliance Monitor',
        'Overdue Task & SLA Evaluator',
        'Fleet Maintenance Forecast',
        'Unfilled Duty Roster Scanner',
      ],
      alertsGenerated: 3,
      status: 'success',
      summary: 'Automated daemon cycle completed: 1 overdue work order flagged, 1 upcoming vehicle service reminder emitted, 1 pending shift swap verified.',
    },
  ],

  auditLogs: [
    {
      id: 'audit-001',
      action: 'Shift Attendance Verified',
      category: 'security',
      actorName: 'Vikram Singh',
      actorRole: 'Security Supervisor',
      details: 'Physically verified Ramesh Kumar check-in at Main Gate (05:55).',
      timestamp: '2026-10-16T05:56:00Z',
    },
    {
      id: 'audit-002',
      action: 'Work Order Approved',
      category: 'maintenance',
      actorName: 'Kavita Nair',
      actorRole: 'Maintenance Supervisor',
      details: 'Approved completed work order WO-2026-893 (AHU Filter Replacement) after inspection.',
      timestamp: '2026-10-15T17:05:00Z',
    },
  ],
};

// Database loader and saver
let campusDb: CampusDatabase = { ...INITIAL_DB };

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      campusDb = JSON.parse(data);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Failed to load database, using initial seeds:', err);
    campusDb = { ...INITIAL_DB };
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(campusDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

loadDb();

// Log audit helper
function recordAudit(
  action: string,
  category: CampusAuditLog['category'],
  actorName: string,
  actorRole: UserRole,
  details: string
) {
  const audit: CampusAuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    category,
    actorName,
    actorRole,
    details,
    timestamp: new Date().toISOString(),
  };
  campusDb.auditLogs.unshift(audit);
  if (campusDb.auditLogs.length > 200) {
    campusDb.auditLogs.pop();
  }
  saveDb();
}

// ==========================================
// Conflict & Validation Business Logic
// ==========================================

// Check if an employee is on approved leave on a given date
function isEmployeeOnApprovedLeave(employeeId: string, dateStr: string): boolean {
  return campusDb.leaves.some((leave) => {
    if (leave.employeeId !== employeeId || leave.status !== 'approved') return false;
    return dateStr >= leave.startDate && dateStr <= leave.endDate;
  });
}

// Convert 24h HH:mm to minutes from midnight
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Check if two shift time windows overlap (accounting for overnight shifts e.g. 22:00 to 06:00)
function shiftsOverlap(s1Start: string, s1End: string, s2Start: string, s2End: string): boolean {
  let m1Start = timeToMinutes(s1Start);
  let m1End = timeToMinutes(s1End);
  let m2Start = timeToMinutes(s2Start);
  let m2End = timeToMinutes(s2End);

  if (m1End <= m1Start) m1End += 24 * 60;
  if (m2End <= m2Start) m2End += 24 * 60;

  return Math.max(m1Start, m2Start) < Math.min(m1End, m2End);
}

// Check for employee duty roster overlapping shift on date
function checkShiftConflict(
  employeeId: string,
  date: string,
  newShiftId: string,
  excludeAssignmentId?: string
): { hasConflict: boolean; reason?: string } {
  // 1. Approved leave conflict
  if (isEmployeeOnApprovedLeave(employeeId, date)) {
    return {
      hasConflict: true,
      reason: 'Employee has approved leave on this date. Duty cannot be assigned.',
    };
  }

  // 2. Overlapping duty assignment conflict
  const targetShift = campusDb.shifts.find((s) => s.id === newShiftId);
  if (!targetShift) return { hasConflict: false };

  const existingAssignments = campusDb.assignments.filter(
    (a) =>
      a.employeeId === employeeId &&
      a.date === date &&
      a.status !== 'absent' &&
      a.status !== 'swapped' &&
      a.id !== excludeAssignmentId
  );

  for (const existing of existingAssignments) {
    const existingShift = campusDb.shifts.find((s) => s.id === existing.shiftId);
    if (!existingShift) continue;

    if (
      shiftsOverlap(
        targetShift.startTime,
        targetShift.endTime,
        existingShift.startTime,
        existingShift.endTime
      )
    ) {
      return {
        hasConflict: true,
        reason: `Overlapping shift conflict: ${existing.employeeName} is already assigned to '${existing.shiftName}' (${existingShift.startTime}-${existingShift.endTime}) at '${existing.locationName}' on ${date}.`,
      };
    }
  }

  return { hasConflict: false };
}

// Check driver overlapping trip conflict
function checkDriverTripConflict(
  driverId: string,
  date: string,
  departureTime: string,
  arrivalTime: string,
  excludeTripId?: string
): { hasConflict: boolean; reason?: string } {
  // Check approved leave
  if (isEmployeeOnApprovedLeave(driverId, date)) {
    return {
      hasConflict: true,
      reason: 'Driver is on approved leave on this date.',
    };
  }

  const driverTrips = campusDb.tripSchedules.filter(
    (t) =>
      t.driverId === driverId &&
      t.date === date &&
      t.status !== 'cancelled' &&
      t.id !== excludeTripId
  );

  for (const trip of driverTrips) {
    if (shiftsOverlap(departureTime, arrivalTime, trip.departureTime, trip.expectedArrivalTime)) {
      return {
        hasConflict: true,
        reason: `Driver trip overlap conflict: Driver is already assigned to '${trip.tripCode}: ${trip.routeName}' from ${trip.departureTime} to ${trip.expectedArrivalTime}.`,
      };
    }
  }

  return { hasConflict: false };
}

// ==========================================
// Server-Side Automated Scheduler Engine
// ==========================================
function runSchedulerDaemonCycle(): SchedulerExecutionLog {
  const triggersRun: string[] = [
    'Check-In Compliance Monitor',
    'Overdue Maintenance & Grievance SLA',
    'Transport Vehicle Fitness & Service Alerts',
    'Shift Staffing Deficit Monitor',
  ];
  let alertsCount = 0;
  const now = new Date();
  const todayStr = '2026-10-16'; // Environment baseline date
  const currentMinutes = 2 * 60 + 10; // 02:10 AM local time baseline

  // 1. Missed check-in check
  for (const assignment of campusDb.assignments) {
    if (
      assignment.date === todayStr &&
      assignment.status === 'scheduled' &&
      assignment.attendanceStatus === 'pending'
    ) {
      const shift = campusDb.shifts.find((s) => s.id === assignment.shiftId);
      if (shift) {
        const startMin = timeToMinutes(shift.startTime);
        // If current time is > 15 mins past shift start
        if (currentMinutes > startMin + 15) {
          const notifKey = `missed-${assignment.id}`;
          const alreadyExists = campusDb.notifications.some(
            (n) => n.relatedEntityId === assignment.id && n.type === 'missed_checkin'
          );
          if (!alreadyExists) {
            campusDb.notifications.unshift({
              id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              type: 'missed_checkin',
              severity: 'alert',
              title: `Missed Check-In Alert: ${assignment.employeeName}`,
              message: `${assignment.employeeName} has not checked in for ${assignment.shiftName} at ${assignment.locationName}. Shift started at ${shift.startTime}.`,
              departmentId: assignment.departmentId,
              relatedEntityId: assignment.id,
              isRead: false,
              timestamp: now.toISOString(),
            });
            assignment.attendanceStatus = 'missed';
            alertsCount++;
          }
        }
      }
    }
  }

  // 2. Overdue Work Orders
  for (const wo of campusDb.workOrders) {
    if (wo.status !== 'completed' && wo.deadline < todayStr) {
      const alreadyExists = campusDb.notifications.some(
        (n) => n.relatedEntityId === wo.id && n.type === 'overdue_work'
      );
      if (!alreadyExists) {
        campusDb.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          type: 'overdue_work',
          severity: 'alert',
          title: `Overdue Work Order: ${wo.workOrderCode}`,
          message: `'${wo.title}' assigned to ${wo.assignedEmployeeName} exceeded deadline ${wo.deadline}. Immediate supervisor escalation required.`,
          departmentId: 'dept-mnt',
          relatedEntityId: wo.id,
          isRead: false,
          timestamp: now.toISOString(),
        });
        alertsCount++;
      }
    }
  }

  // 3. Overdue Hostel Complaints
  for (const comp of campusDb.hostelComplaints) {
    if (comp.status !== 'resolved' && comp.deadline < todayStr) {
      const alreadyExists = campusDb.notifications.some(
        (n) => n.relatedEntityId === comp.id && n.type === 'overdue_work'
      );
      if (!alreadyExists) {
        campusDb.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          type: 'overdue_work',
          severity: 'alert',
          title: `Overdue Hostel Grievance: ${comp.complaintCode}`,
          message: `Hostel complaint in ${comp.hostelBlock} (Room ${comp.roomNumber}) exceeded target SLA (${comp.deadline}).`,
          departmentId: 'dept-hst',
          relatedEntityId: comp.id,
          isRead: false,
          timestamp: now.toISOString(),
        });
        alertsCount++;
      }
    }
  }

  // 4. Vehicle maintenance alerts
  for (const veh of campusDb.vehicles) {
    if (veh.status === 'active') {
      const daysUntilService = Math.round(
        (new Date(veh.nextServiceDueDate).getTime() - new Date(todayStr).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysUntilService >= 0 && daysUntilService <= 7) {
        const alreadyExists = campusDb.notifications.some(
          (n) => n.relatedEntityId === veh.id && n.type === 'vehicle_maintenance'
        );
        if (!alreadyExists) {
          campusDb.notifications.unshift({
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            type: 'vehicle_maintenance',
            severity: 'warning',
            title: `Vehicle Service Approaching: ${veh.vehicleNumber}`,
            message: `${veh.model} (${veh.vehicleNumber}) is due for regular maintenance in ${daysUntilService} days (${veh.nextServiceDueDate}).`,
            departmentId: 'dept-trn',
            relatedEntityId: veh.id,
            isRead: false,
            timestamp: now.toISOString(),
          });
          alertsCount++;
        }
      }
    }
  }

  const log: SchedulerExecutionLog = {
    id: `sched-log-${Date.now()}`,
    timestamp: now.toISOString(),
    triggersRun,
    alertsGenerated: alertsCount,
    status: 'success',
    summary: `Scheduler cycle executed at ${now.toLocaleTimeString()}: ${alertsCount} fresh automated alerts generated across active monitors.`,
  };

  campusDb.schedulerLogs.unshift(log);
  if (campusDb.schedulerLogs.length > 50) {
    campusDb.schedulerLogs.pop();
  }
  saveDb();
  return log;
}

// Background scheduler timer every 60 seconds
setInterval(() => {
  try {
    runSchedulerDaemonCycle();
  } catch (err) {
    console.error('Scheduler periodic run error:', err);
  }
}, 60000);

// ==========================================
// API Routes
// ==========================================

// Bootstrap / Full State
app.get('/api/state', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: campusDb,
  });
});

// Departments
app.get('/api/departments', (req: Request, res: Response) => {
  res.json(campusDb.departments);
});

app.post('/api/departments', (req: Request, res: Response) => {
  const { code, name, description, hodName, supervisorName, contactExtension, actorName, actorRole } = req.body;
  if (!code || !name) {
    res.status(400).json({ error: 'Department code and name are required.' });
    return;
  }
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    code: code.toUpperCase(),
    name,
    description: description || '',
    hodName: hodName || 'TBD',
    supervisorName: supervisorName || 'TBD',
    totalStaff: 0,
    contactExtension: contactExtension || 'ext-4000',
  };
  campusDb.departments.push(newDept);
  recordAudit('Department Created', 'admin', actorName || 'Admin', actorRole || 'Super Admin', `Created department ${name} (${code})`);
  saveDb();
  res.json({ success: true, department: newDept });
});

// Employees
app.get('/api/employees', (req: Request, res: Response) => {
  res.json(campusDb.employees);
});

app.post('/api/employees', (req: Request, res: Response) => {
  const {
    employeeCode,
    name,
    email,
    phone,
    departmentId,
    role,
    jobTitle,
    reportingToId,
    shiftPreference,
    weeklyOffDay,
    actorName,
    actorRole,
  } = req.body;

  if (!name || !departmentId || !role) {
    res.status(400).json({ error: 'Name, department, and role are required.' });
    return;
  }

  const reportingEmp = campusDb.employees.find((e) => e.id === reportingToId);
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const newEmp: Employee = {
    id: `emp-${Date.now()}`,
    employeeCode: employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
    phone: phone || '+91 98110 00000',
    departmentId,
    role,
    jobTitle: jobTitle || 'Staff Specialist',
    reportingToId,
    reportingToName: reportingEmp?.name,
    shiftPreference: shiftPreference || 'any',
    weeklyOffDay: weeklyOffDay !== undefined ? Number(weeklyOffDay) : 0,
    status: 'active',
    avatarInitials: initials || 'EM',
  };

  campusDb.employees.push(newEmp);

  // Update totalStaff in department
  const dept = campusDb.departments.find((d) => d.id === departmentId);
  if (dept) dept.totalStaff += 1;

  recordAudit(
    'Employee Enrolled',
    'admin',
    actorName || 'Admin',
    actorRole || 'Super Admin',
    `Enrolled employee ${name} (${newEmp.employeeCode}) as ${role} in ${dept?.name || departmentId}`
  );

  saveDb();
  res.json({ success: true, employee: newEmp });
});

// Shifts definitions
app.get('/api/shifts', (req: Request, res: Response) => {
  res.json(campusDb.shifts);
});

app.put('/api/shifts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { startTime, endTime, colorTag, name, actorName, actorRole } = req.body;
  const shift = campusDb.shifts.find((s) => s.id === id);
  if (!shift) {
    res.status(404).json({ error: 'Shift definition not found' });
    return;
  }
  if (startTime) shift.startTime = startTime;
  if (endTime) shift.endTime = endTime;
  if (colorTag) shift.colorTag = colorTag;
  if (name) shift.name = name;

  recordAudit(
    'Shift Timings Updated',
    'roster',
    actorName || 'Supervisor',
    actorRole || 'Department Supervisor',
    `Updated shift ${shift.name} timings to ${shift.startTime}-${shift.endTime}`
  );
  saveDb();
  res.json({ success: true, shift });
});

// Duty Roster
app.get('/api/roster', (req: Request, res: Response) => {
  const { date, departmentId } = req.query;
  let result = campusDb.assignments;
  if (date) {
    result = result.filter((a) => a.date === date);
  }
  if (departmentId) {
    result = result.filter((a) => a.departmentId === departmentId);
  }
  res.json(result);
});

// Create Duty Assignment with Overlap Prevention
app.post('/api/roster', (req: Request, res: Response) => {
  const {
    date,
    shiftId,
    locationId,
    employeeId,
    notes,
    isSuggested,
    actorName,
    actorRole,
  } = req.body;

  if (!date || !shiftId || !locationId || !employeeId) {
    res.status(400).json({ error: 'Date, shift, location, and employee are required.' });
    return;
  }

  // 1. Conflict Check: Overlap & Approved Leave
  const conflict = checkShiftConflict(employeeId, date, shiftId);
  if (conflict.hasConflict) {
    res.status(409).json({ error: conflict.reason });
    return;
  }

  const shift = campusDb.shifts.find((s) => s.id === shiftId);
  const employee = campusDb.employees.find((e) => e.id === employeeId);
  const location = campusDb.locations.find((l) => l.id === locationId);
  const department = campusDb.departments.find((d) => d.id === (location?.departmentId || employee?.departmentId));

  if (!shift || !employee || !location) {
    res.status(400).json({ error: 'Invalid shift, employee, or location identifier.' });
    return;
  }

  const newAssignment: DutyAssignment = {
    id: `asgn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date,
    shiftId,
    shiftName: shift.name,
    shiftHours: `${shift.startTime} - ${shift.endTime}`,
    shiftCode: shift.code,
    departmentId: department?.id || employee.departmentId,
    departmentName: department?.name || 'Department',
    locationId,
    locationName: location.name,
    employeeId,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    status: isSuggested ? 'suggested' : 'scheduled',
    isSuggested: !!isSuggested,
    attendanceStatus: 'pending',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  campusDb.assignments.push(newAssignment);

  // Send assignment notification
  campusDb.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'upcoming_shift',
    severity: 'info',
    title: `New Duty Assignment: ${shift.name}`,
    message: `${employee.name} assigned to ${location.name} on ${date} (${shift.startTime}-${shift.endTime}).`,
    departmentId: newAssignment.departmentId,
    relatedEntityId: newAssignment.id,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  recordAudit(
    'Duty Assignment Scheduled',
    'roster',
    actorName || 'Supervisor',
    actorRole || 'Department Supervisor',
    `Assigned ${employee.name} to ${location.name} for ${shift.name} on ${date}`
  );

  saveDb();
  res.json({ success: true, assignment: newAssignment });
});

// Confirm Suggested Assignments (Scheduling Assistant)
app.post('/api/roster/confirm-suggestions', (req: Request, res: Response) => {
  const { assignmentIds, actorName, actorRole } = req.body;
  let count = 0;
  for (const asgn of campusDb.assignments) {
    if (asgn.status === 'suggested' && (!assignmentIds || assignmentIds.includes(asgn.id))) {
      asgn.status = 'scheduled';
      asgn.isSuggested = false;
      count++;
    }
  }

  recordAudit(
    'Scheduling Suggestions Approved',
    'roster',
    actorName || 'Supervisor',
    actorRole || 'Department Supervisor',
    `Approved and locked ${count} AI-suggested duty assignments.`
  );

  saveDb();
  res.json({ success: true, confirmedCount: count });
});

// Delete assignment
app.delete('/api/roster/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = campusDb.assignments.findIndex((a) => a.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const removed = campusDb.assignments.splice(index, 1)[0];
  saveDb();
  res.json({ success: true, removed });
});

// Automated Scheduling Assistant Generator
app.post('/api/roster/auto-schedule', (req: Request, res: Response) => {
  const { date, departmentId, actorName, actorRole } = req.body;
  if (!date) {
    res.status(400).json({ error: 'Date is required for auto scheduling.' });
    return;
  }

  const targetLocations = campusDb.locations.filter(
    (l) => !departmentId || l.departmentId === departmentId
  );

  const generatedSuggestions: DutyAssignment[] = [];
  const activeEmployees = campusDb.employees.filter(
    (e) => (!departmentId || e.departmentId === departmentId) && e.status === 'active'
  );

  for (const loc of targetLocations) {
    const shiftsToFill = ['morning', 'evening', 'night'] as const;

    for (const shiftCode of shiftsToFill) {
      const shiftDef = campusDb.shifts.find((s) => s.code === shiftCode);
      if (!shiftDef) continue;

      const requiredStaff = loc.minStaffPerShift[shiftCode] || 1;
      const alreadyAssignedCount = campusDb.assignments.filter(
        (a) => a.date === date && a.locationId === loc.id && a.shiftId === shiftDef.id && a.status !== 'absent'
      ).length;

      const deficit = requiredStaff - alreadyAssignedCount;
      if (deficit <= 0) continue;

      // Find suitable employees without conflicts
      let filled = 0;
      for (const emp of activeEmployees) {
        if (filled >= deficit) break;

        // Check if on leave
        if (isEmployeeOnApprovedLeave(emp.id, date)) continue;

        // Check conflict with existing assignments
        const conflict = checkShiftConflict(emp.id, date, shiftDef.id);
        if (conflict.hasConflict) continue;

        // Avoid assigning multiple times in this suggestion run
        const alreadyInGen = generatedSuggestions.some(
          (g) => g.employeeId === emp.id && g.date === date
        );
        if (alreadyInGen) continue;

        const dept = campusDb.departments.find((d) => d.id === (loc.departmentId || emp.departmentId));
        const newProposal: DutyAssignment = {
          id: `asgn-sugg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date,
          shiftId: shiftDef.id,
          shiftName: shiftDef.name,
          shiftHours: `${shiftDef.startTime} - ${shiftDef.endTime}`,
          shiftCode: shiftDef.code,
          departmentId: dept?.id || emp.departmentId,
          departmentName: dept?.name || 'Department',
          locationId: loc.id,
          locationName: loc.name,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeCode: emp.employeeCode,
          status: 'suggested',
          isSuggested: true,
          attendanceStatus: 'pending',
          notes: `Scheduling Assistant: Fulfilled staffing quota (${requiredStaff} required).`,
          createdAt: new Date().toISOString(),
        };

        generatedSuggestions.push(newProposal);
        campusDb.assignments.push(newProposal);
        filled++;
      }
    }
  }

  recordAudit(
    'Auto Scheduling Run',
    'roster',
    actorName || 'Assistant',
    actorRole || 'Department Supervisor',
    `Generated ${generatedSuggestions.length} suggested shift assignments for ${date}.`
  );

  saveDb();
  res.json({
    success: true,
    suggestionsCount: generatedSuggestions.length,
    suggestions: generatedSuggestions,
  });
});

// Shift Swap Requests
app.get('/api/roster/swaps', (req: Request, res: Response) => {
  res.json(campusDb.swapRequests);
});

app.post('/api/roster/swaps', (req: Request, res: Response) => {
  const { assignmentId, requestingEmployeeId, targetEmployeeId, reason } = req.body;
  const assignment = campusDb.assignments.find((a) => a.id === assignmentId);
  const requester = campusDb.employees.find((e) => e.id === requestingEmployeeId);
  const target = campusDb.employees.find((e) => e.id === targetEmployeeId);

  if (!assignment || !requester || !target) {
    res.status(400).json({ error: 'Invalid assignment or employee details.' });
    return;
  }

  // Check if target is on leave or has overlapping assignment
  const conflict = checkShiftConflict(targetEmployeeId, assignment.date, assignment.shiftId);
  if (conflict.hasConflict) {
    res.status(409).json({ error: `Replacement staff conflict: ${conflict.reason}` });
    return;
  }

  const swap: ShiftSwapRequest = {
    id: `swap-${Date.now()}`,
    assignmentId,
    date: assignment.date,
    requestingEmployeeId,
    requestingEmployeeName: requester.name,
    targetEmployeeId,
    targetEmployeeName: target.name,
    reason: reason || 'Personal emergency',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  campusDb.swapRequests.unshift(swap);

  // Notify supervisor
  campusDb.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'shift_swap',
    severity: 'info',
    title: 'Shift Swap Request Submitted',
    message: `${requester.name} requested ${target.name} to take duty on ${assignment.date} (${assignment.shiftName}).`,
    departmentId: assignment.departmentId,
    relatedEntityId: swap.id,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ success: true, swap });
});

app.post('/api/roster/swaps/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, supervisorRemarks, reviewerName, reviewerRole } = req.body; // 'approve' | 'reject'
  const swap = campusDb.swapRequests.find((s) => s.id === id);
  if (!swap) {
    res.status(404).json({ error: 'Swap request not found' });
    return;
  }

  swap.status = action === 'approve' ? 'approved' : 'rejected';
  swap.reviewedBy = reviewerName || 'Supervisor';
  swap.reviewedAt = new Date().toISOString();
  swap.supervisorRemarks = supervisorRemarks || '';

  if (action === 'approve') {
    // Update the assignment to the new target employee
    const asgn = campusDb.assignments.find((a) => a.id === swap.assignmentId);
    const targetEmp = campusDb.employees.find((e) => e.id === swap.targetEmployeeId);
    if (asgn && targetEmp) {
      asgn.employeeId = targetEmp.id;
      asgn.employeeName = targetEmp.name;
      asgn.employeeCode = targetEmp.employeeCode;
      asgn.notes = `${asgn.notes || ''} [Swapped from ${swap.requestingEmployeeName} with supervisor approval]`.trim();
    }
  }

  recordAudit(
    `Shift Swap ${action === 'approve' ? 'Approved' : 'Rejected'}`,
    'roster',
    reviewerName || 'Supervisor',
    reviewerRole || 'Department Supervisor',
    `${reviewerName} ${action}d swap for duty on ${swap.date} between ${swap.requestingEmployeeName} and ${swap.targetEmployeeName}`
  );

  saveDb();
  res.json({ success: true, swap });
});

// Attendance & Check-In
app.get('/api/attendance', (req: Request, res: Response) => {
  const { date, departmentId } = req.query;
  let result = campusDb.attendance;
  if (date) result = result.filter((a) => a.date === date);
  if (departmentId) result = result.filter((a) => a.departmentId === departmentId);
  res.json(result);
});

app.post('/api/attendance/check-in', (req: Request, res: Response) => {
  const {
    assignmentId,
    employeeId,
    method, // 'supervisor_verified' | 'qr_scanner' | 'manual'
    verifiedBy,
    actorName,
    actorRole,
  } = req.body;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayStr = '2026-10-16';

  let assignment = campusDb.assignments.find((a) => a.id === assignmentId);
  if (!assignment && employeeId) {
    assignment = campusDb.assignments.find(
      (a) => a.employeeId === employeeId && a.date === todayStr
    );
  }

  if (assignment) {
    assignment.attendanceStatus = 'present';
    assignment.checkInTime = timeStr;
    assignment.checkInMethod = method || 'supervisor_verified';
  }

  const employee = campusDb.employees.find(
    (e) => e.id === (assignment?.employeeId || employeeId)
  );

  if (!employee) {
    res.status(400).json({ error: 'Employee not found' });
    return;
  }

  const attRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    date: todayStr,
    employeeId: employee.id,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    departmentId: employee.departmentId,
    departmentName: campusDb.departments.find((d) => d.id === employee.departmentId)?.name || 'Dept',
    shiftId: assignment?.shiftId || 'shift-morn',
    shiftName: assignment?.shiftName || 'Morning Shift',
    checkIn: timeStr,
    status: 'present',
    verificationMethod: method || 'supervisor_verified',
    verifiedBy: verifiedBy || actorName || 'Shift Incharge',
    notes: `Punched via ${method || 'supervisor verification'}`,
  };

  campusDb.attendance.unshift(attRecord);

  recordAudit(
    'Attendance Punched',
    'attendance',
    actorName || employee.name,
    actorRole || employee.role,
    `${employee.name} punched in at ${timeStr} via ${method || 'supervisor verification'}`
  );

  saveDb();
  res.json({ success: true, record: attRecord, assignment });
});

// Leave Management
app.get('/api/leaves', (req: Request, res: Response) => {
  res.json(campusDb.leaves);
});

app.post('/api/leaves', (req: Request, res: Response) => {
  const { employeeId, leaveType, startDate, endDate, reason, actorName, actorRole } = req.body;
  const emp = campusDb.employees.find((e) => e.id === employeeId);
  if (!emp || !startDate || !endDate) {
    res.status(400).json({ error: 'Employee, start date, and end date are required.' });
    return;
  }

  // Look for replacement candidate within same department who is free
  const replacement = campusDb.employees.find(
    (e) => e.departmentId === emp.departmentId && e.id !== emp.id && e.status === 'active'
  );

  const leave: LeaveRequest = {
    id: `leave-${Date.now()}`,
    employeeId,
    employeeName: emp.name,
    departmentId: emp.departmentId,
    departmentName: campusDb.departments.find((d) => d.id === emp.departmentId)?.name || 'Dept',
    leaveType: leaveType || 'Casual',
    startDate,
    endDate,
    reason: reason || '',
    status: 'pending',
    replacementEmployeeId: replacement?.id,
    replacementEmployeeName: replacement ? `${replacement.name} (Suggested Cover)` : undefined,
    createdAt: new Date().toISOString(),
  };

  campusDb.leaves.unshift(leave);

  campusDb.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'leave_approval',
    severity: 'info',
    title: 'New Leave Application',
    message: `${emp.name} applied for ${leave.leaveType} leave from ${startDate} to ${endDate}.`,
    departmentId: emp.departmentId,
    relatedEntityId: leave.id,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json({ success: true, leave });
});

app.post('/api/leaves/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reviewerName, reviewerRole } = req.body; // 'approve' | 'reject'
  const leave = campusDb.leaves.find((l) => l.id === id);
  if (!leave) {
    res.status(404).json({ error: 'Leave request not found' });
    return;
  }

  leave.status = action === 'approve' ? 'approved' : 'rejected';
  leave.approvedBy = reviewerName || 'Department HOD';
  leave.approvedAt = new Date().toISOString();

  if (action === 'approve') {
    // Flag employee duty assignments during this range as absent / needing replacement
    for (const asgn of campusDb.assignments) {
      if (
        asgn.employeeId === leave.employeeId &&
        asgn.date >= leave.startDate &&
        asgn.date <= leave.endDate
      ) {
        asgn.status = 'absent';
        asgn.notes = `Approved leave granted (${leave.leaveType}). Needs replacement.`;
      }
    }
  }

  recordAudit(
    `Leave ${action === 'approve' ? 'Approved' : 'Rejected'}`,
    'attendance',
    reviewerName || 'HOD',
    reviewerRole || 'HOD',
    `${reviewerName} ${action}d ${leave.leaveType} leave for ${leave.employeeName} (${leave.startDate} to ${leave.endDate})`
  );

  saveDb();
  res.json({ success: true, leave });
});

// Security & Gates
app.get('/api/security/gates', (req: Request, res: Response) => {
  res.json(campusDb.gates);
});

app.get('/api/security/incidents', (req: Request, res: Response) => {
  res.json(campusDb.gateIncidents);
});

app.post('/api/security/incidents', (req: Request, res: Response) => {
  const {
    gateId,
    reportedByGuardId,
    severity,
    title,
    description,
    visitorOrVehicleInfo,
    actorName,
    actorRole,
  } = req.body;

  const gate = campusDb.gates.find((g) => g.id === gateId);
  const guard = campusDb.employees.find((e) => e.id === reportedByGuardId);

  const incident: GateIncident = {
    id: `inc-${Date.now()}`,
    gateId: gateId || 'gate-01',
    gateName: gate?.name || 'Main Gate',
    reportedByGuardId: guard?.id || 'emp-003',
    reportedByGuardName: guard?.name || actorName || 'Security Guard',
    timestamp: new Date().toISOString(),
    severity: severity || 'medium',
    title: title || 'Perimeter Security Incident',
    description: description || '',
    visitorOrVehicleInfo: visitorOrVehicleInfo || '',
    status: 'open',
  };

  campusDb.gateIncidents.unshift(incident);

  campusDb.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'incident_alert',
    severity: incident.severity === 'critical' || incident.severity === 'high' ? 'alert' : 'warning',
    title: `Security Incident: ${incident.title}`,
    message: `Reported at ${incident.gateName} by ${incident.reportedByGuardName}: ${incident.description}`,
    departmentId: 'dept-sec',
    relatedEntityId: incident.id,
    isRead: false,
    timestamp: new Date().toISOString(),
  });

  recordAudit(
    'Security Incident Logged',
    'security',
    actorName || guard?.name || 'Guard',
    actorRole || 'Security Supervisor',
    `Logged security incident: ${incident.title} at ${incident.gateName}`
  );

  saveDb();
  res.json({ success: true, incident });
});

// Mess Operations
app.get('/api/mess/menus', (req: Request, res: Response) => {
  res.json(campusDb.dailyMenus);
});

app.get('/api/mess/tasks', (req: Request, res: Response) => {
  res.json(campusDb.kitchenTasks);
});

app.post('/api/mess/tasks/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, actorName, actorRole } = req.body;
  const task = campusDb.kitchenTasks.find((t) => t.id === id);
  if (!task) {
    res.status(404).json({ error: 'Kitchen task not found' });
    return;
  }
  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date().toLocaleTimeString();
  }
  recordAudit('Kitchen Task Updated', 'admin', actorName || 'Mess Staff', actorRole || 'Mess Manager', `Updated task '${task.title}' to ${status}`);
  saveDb();
  res.json({ success: true, task });
});

// Hostel Operations
app.get('/api/hostel/complaints', (req: Request, res: Response) => {
  res.json(campusDb.hostelComplaints);
});

app.post('/api/hostel/complaints', (req: Request, res: Response) => {
  const {
    hostelBlock,
    roomNumber,
    residentName,
    studentRollNo,
    category,
    priority,
    description,
    assignedStaffId,
    deadline,
    actorName,
    actorRole,
  } = req.body;

  const staff = campusDb.employees.find((e) => e.id === assignedStaffId);

  const complaint: HostelComplaint = {
    id: `comp-${Date.now()}`,
    complaintCode: `HST-CMP-${Math.floor(100 + Math.random() * 900)}`,
    hostelBlock: hostelBlock || 'Block A (Boys)',
    roomNumber: roomNumber || 'A-101',
    residentName: residentName || 'Student Resident',
    studentRollNo: studentRollNo || 'STU-2025-01',
    category: category || 'Electrical',
    priority: priority || 'normal',
    description: description || '',
    assignedStaffId: staff?.id,
    assignedStaffName: staff?.name,
    deadline: deadline || '2026-10-18',
    status: 'open',
    hasAttachment: false,
    createdAt: new Date().toISOString(),
  };

  campusDb.hostelComplaints.unshift(complaint);

  recordAudit(
    'Hostel Grievance Filed',
    'hostel',
    actorName || 'Hostel Warden',
    actorRole || 'Hostel Warden',
    `Registered hostel complaint ${complaint.complaintCode} for Room ${roomNumber} (${hostelBlock})`
  );

  saveDb();
  res.json({ success: true, complaint });
});

app.post('/api/hostel/complaints/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, resolutionRemarks, actorName, actorRole } = req.body;
  const complaint = campusDb.hostelComplaints.find((c) => c.id === id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found' });
    return;
  }
  complaint.status = status;
  if (resolutionRemarks) complaint.resolutionRemarks = resolutionRemarks;
  if (status === 'resolved') {
    complaint.resolvedAt = new Date().toISOString();
  }
  recordAudit(
    'Hostel Complaint Updated',
    'hostel',
    actorName || 'Supervisor',
    actorRole || 'Hostel Warden',
    `Updated grievance ${complaint.complaintCode} to status: ${status}`
  );
  saveDb();
  res.json({ success: true, complaint });
});

app.get('/api/hostel/inspections', (req: Request, res: Response) => {
  res.json(campusDb.hostelInspections);
});

app.get('/api/hostel/visitors', (req: Request, res: Response) => {
  res.json(campusDb.visitors);
});

app.post('/api/hostel/visitors', (req: Request, res: Response) => {
  const { visitorName, contactNumber, residentVisited, hostelBlock, roomNumber, idProofType } = req.body;
  const visitor: VisitorRecord = {
    id: `vis-${Date.now()}`,
    visitorName: visitorName || 'Visitor',
    contactNumber: contactNumber || '+91 90000 00000',
    residentVisited: residentVisited || 'Student',
    hostelBlock: hostelBlock || 'Block A (Boys)',
    roomNumber: roomNumber || '101',
    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    idProofType: idProofType || 'National ID',
    status: 'checked_in',
  };
  campusDb.visitors.unshift(visitor);
  saveDb();
  res.json({ success: true, visitor });
});

// Transport Fleet & Trips
app.get('/api/transport/vehicles', (req: Request, res: Response) => {
  res.json(campusDb.vehicles);
});

app.get('/api/transport/trips', (req: Request, res: Response) => {
  res.json(campusDb.tripSchedules);
});

app.post('/api/transport/trips', (req: Request, res: Response) => {
  const {
    date,
    routeName,
    origin,
    destination,
    vehicleId,
    driverId,
    attendantName,
    departureTime,
    expectedArrivalTime,
    actorName,
    actorRole,
  } = req.body;

  if (!date || !vehicleId || !driverId || !departureTime || !expectedArrivalTime) {
    res.status(400).json({ error: 'Date, vehicle, driver, departure, and arrival times are required.' });
    return;
  }

  // Prevent driver overlapping trip conflicts
  const conflict = checkDriverTripConflict(driverId, date, departureTime, expectedArrivalTime);
  if (conflict.hasConflict) {
    res.status(409).json({ error: conflict.reason });
    return;
  }

  const veh = campusDb.vehicles.find((v) => v.id === vehicleId);
  const driver = campusDb.employees.find((e) => e.id === driverId);

  const trip: TripSchedule = {
    id: `trip-${Date.now()}`,
    tripCode: `TRP-${Math.floor(100 + Math.random() * 900)}`,
    date,
    routeName: routeName || 'Campus Route',
    origin: origin || 'Campus Terminal',
    destination: destination || 'City Center',
    vehicleId,
    vehicleNumber: veh?.vehicleNumber || 'Bus',
    driverId,
    driverName: driver?.name || 'Driver',
    attendantName: attendantName || 'Attendant',
    departureTime,
    expectedArrivalTime,
    status: 'scheduled',
  };

  campusDb.tripSchedules.push(trip);

  recordAudit(
    'Bus Trip Scheduled',
    'transport',
    actorName || 'Transport Manager',
    actorRole || 'Transport Manager',
    `Scheduled trip ${trip.tripCode} on ${trip.routeName} with driver ${trip.driverName}`
  );

  saveDb();
  res.json({ success: true, trip });
});

// Authorize substitute driver
app.post('/api/transport/trips/:id/substitute-driver', (req: Request, res: Response) => {
  const { id } = req.params;
  const { substituteDriverId, reason, authorizerName, authorizerRole } = req.body;
  const trip = campusDb.tripSchedules.find((t) => t.id === id);
  const subDriver = campusDb.employees.find((e) => e.id === substituteDriverId);

  if (!trip || !subDriver) {
    res.status(400).json({ error: 'Invalid trip or substitute driver' });
    return;
  }

  // Conflict check for substitute driver
  const conflict = checkDriverTripConflict(substituteDriverId, trip.date, trip.departureTime, trip.expectedArrivalTime, trip.id);
  if (conflict.hasConflict) {
    res.status(409).json({ error: `Substitute driver conflict: ${conflict.reason}` });
    return;
  }

  const oldDriver = trip.driverName;
  trip.driverId = subDriver.id;
  trip.driverName = subDriver.name;
  trip.isSubstituteDriver = true;
  trip.authorizedBySupervisor = authorizerName || 'Transport Supervisor';
  trip.notes = `${trip.notes || ''} [Authorized substitute from ${oldDriver} due to: ${reason || 'unavailability'}]`.trim();

  recordAudit(
    'Substitute Driver Authorized',
    'transport',
    authorizerName || 'Transport Manager',
    authorizerRole || 'Transport Manager',
    `Authorized substitute driver ${subDriver.name} replacing ${oldDriver} for trip ${trip.tripCode}`
  );

  saveDb();
  res.json({ success: true, trip });
});

// Maintenance Work Orders
app.get('/api/maintenance/work-orders', (req: Request, res: Response) => {
  res.json(campusDb.workOrders);
});

app.post('/api/maintenance/work-orders', (req: Request, res: Response) => {
  const {
    title,
    departmentCategory,
    location,
    priority,
    assignedEmployeeId,
    reportedBy,
    deadline,
    beforePhotoDescription,
    actorName,
    actorRole,
  } = req.body;

  const staff = campusDb.employees.find((e) => e.id === assignedEmployeeId);

  const wo: MaintenanceWorkOrder = {
    id: `wo-${Date.now()}`,
    workOrderCode: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
    title: title || 'Maintenance Task',
    departmentCategory: departmentCategory || 'Electrical',
    location: location || 'Campus Block',
    priority: priority || 'medium',
    assignedEmployeeId: staff?.id || 'emp-017',
    assignedEmployeeName: staff?.name || 'Technician',
    reportedBy: reportedBy || actorName || 'Facility Manager',
    reportedDate: '2026-10-16',
    deadline: deadline || '2026-10-18',
    status: 'open',
    beforePhotoDescription: beforePhotoDescription || '',
    createdAt: new Date().toISOString(),
  };

  campusDb.workOrders.unshift(wo);

  recordAudit(
    'Work Order Created',
    'maintenance',
    actorName || 'Supervisor',
    actorRole || 'Maintenance Supervisor',
    `Created maintenance work order ${wo.workOrderCode} (${wo.title}) assigned to ${wo.assignedEmployeeName}`
  );

  saveDb();
  res.json({ success: true, workOrder: wo });
});

app.post('/api/maintenance/work-orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, workRemarks, materialsUsed, afterPhotoDescription, actorName, actorRole } = req.body;
  const wo = campusDb.workOrders.find((w) => w.id === id);
  if (!wo) {
    res.status(404).json({ error: 'Work order not found' });
    return;
  }

  wo.status = status;
  if (workRemarks) wo.workRemarks = workRemarks;
  if (materialsUsed) wo.materialsUsed = materialsUsed;
  if (afterPhotoDescription) wo.afterPhotoDescription = afterPhotoDescription;
  if (status === 'completed') {
    wo.supervisorApprovalDate = new Date().toISOString();
  }

  recordAudit(
    'Work Order Status Updated',
    'maintenance',
    actorName || 'Supervisor',
    actorRole || 'Maintenance Supervisor',
    `Updated work order ${wo.workOrderCode} to ${status}`
  );

  saveDb();
  res.json({ success: true, workOrder: wo });
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(campusDb.notifications);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = campusDb.notifications.find((n) => n.id === id);
  if (notif) notif.isRead = true;
  saveDb();
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  for (const n of campusDb.notifications) {
    n.isRead = true;
  }
  saveDb();
  res.json({ success: true });
});

// Scheduler Control & History
app.get('/api/scheduler', (req: Request, res: Response) => {
  res.json({
    status: 'active',
    intervalSeconds: 60,
    config: {
      missedCheckInGraceMinutes: 15,
      maintenanceAdvanceAlertDays: 7,
      overdueSlaCheckEnabled: true,
      deduplicationEnabled: true,
    },
    logs: campusDb.schedulerLogs,
  });
});

app.post('/api/scheduler/tick', (req: Request, res: Response) => {
  const log = runSchedulerDaemonCycle();
  res.json({ success: true, log });
});

// Audit Log
app.get('/api/audit', (req: Request, res: Response) => {
  res.json(campusDb.auditLogs);
});

// ==========================================
// AI Campus Operations Assistant
// Powered by server-side Gemini 3.8 Flash
// ==========================================
app.post('/api/ai/query', async (req: Request, res: Response) => {
  const { query, userRole, userName } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query prompt is required.' });
    return;
  }

  // Construct Role-tailored Context
  const todayStr = '2026-10-16';
  const tomorrowStr = '2026-10-17';

  // 1. Unfilled shifts tomorrow
  const unfilledShiftsTomorrow: string[] = [];
  for (const loc of campusDb.locations) {
    for (const shiftCode of ['morning', 'evening', 'night'] as const) {
      const shiftDef = campusDb.shifts.find((s) => s.code === shiftCode);
      if (!shiftDef) continue;
      const minRequired = loc.minStaffPerShift[shiftCode] || 1;
      const assigned = campusDb.assignments.filter(
        (a) => a.date === tomorrowStr && a.locationId === loc.id && a.shiftId === shiftDef.id && a.status === 'scheduled'
      ).length;
      if (assigned < minRequired) {
        unfilledShiftsTomorrow.push(
          `${loc.name} [${shiftDef.name}]: ${assigned}/${minRequired} filled (${minRequired - assigned} deficit)`
        );
      }
    }
  }

  // 2. Guards available for night shift
  const securityEmployees = campusDb.employees.filter((e) => e.departmentId === 'dept-sec' && e.status === 'active');
  const nightShiftDef = campusDb.shifts.find((s) => s.code === 'night');
  const availableNightGuards: string[] = [];
  for (const guard of securityEmployees) {
    if (nightShiftDef) {
      const conflict = checkShiftConflict(guard.id, todayStr, nightShiftDef.id);
      if (!conflict.hasConflict) {
        availableNightGuards.push(`${guard.name} (${guard.employeeCode}, pref: ${guard.shiftPreference || 'any'})`);
      }
    }
  }

  // 3. Overdue hostel complaints
  const overdueHostelComplaints = campusDb.hostelComplaints
    .filter((c) => c.status !== 'resolved' && c.deadline < todayStr)
    .map((c) => `${c.complaintCode}: ${c.description} (Room ${c.roomNumber}, Priority: ${c.priority}, Assigned: ${c.assignedStaffName || 'Unassigned'}, Due: ${c.deadline})`);

  // 4. Vehicles with upcoming maintenance
  const upcomingBusMaintenance = campusDb.vehicles
    .filter((v) => {
      const diff = Math.round((new Date(v.nextServiceDueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
      return diff <= 10;
    })
    .map((v) => `${v.vehicleNumber} (${v.model}): Service due ${v.nextServiceDueDate}, Fitness valid until ${v.fitnessValidUntil}`);

  // 5. Department pending workload
  const deptWorkloads = campusDb.departments.map((d) => {
    const openWO = campusDb.workOrders.filter((w) => w.status !== 'completed').length;
    const openComplaints = campusDb.hostelComplaints.filter((c) => c.status !== 'resolved').length;
    const pendingAtt = campusDb.assignments.filter((a) => a.date === todayStr && a.departmentId === d.id && a.attendanceStatus === 'pending').length;
    return `${d.name} (${d.code}): ${openWO} open work orders, ${openComplaints} hostel complaints, ${pendingAtt} pending check-ins today`;
  });

  const promptContext = `
You are the Smart Campus Operations AI Assistant for our University Campus Operations & Workforce Management System.
Current System Date: ${todayStr} (Simulation baseline)
Logged In User: ${userName || 'Supervisor'} (Role: ${userRole || 'Super Admin'})

Current Real System Operational State:
- Unfilled Shifts Tomorrow (${tomorrowStr}):
${unfilledShiftsTomorrow.length > 0 ? unfilledShiftsTomorrow.join('\n') : 'All locations meet minimum staffing requirements for tomorrow.'}

- Security Guards Available for Night Shift Tonight:
${availableNightGuards.length > 0 ? availableNightGuards.join('\n') : 'No guards currently free for night shift.'}

- Overdue Hostel Complaints (Exceeded SLA):
${overdueHostelComplaints.length > 0 ? overdueHostelComplaints.join('\n') : 'No overdue hostel complaints currently.'}

- Campus Vehicles Requiring Maintenance Soon:
${upcomingBusMaintenance.length > 0 ? upcomingBusMaintenance.join('\n') : 'All vehicles within nominal maintenance schedules.'}

- Department Operational Workload Summary:
${deptWorkloads.join('\n')}

- Active Shift Swap Requests: ${campusDb.swapRequests.filter((s) => s.status === 'pending').length} pending review.
- Active Leaves: ${campusDb.leaves.filter((l) => l.status === 'approved').length} staff on approved leave.

User Question: "${query}"

Instructions:
1. Provide a direct, authoritative, professional operations answer grounded strictly in the live system data above.
2. If the user asks about unfilled shifts, available guards, overdue tasks, bus maintenance, or workloads, list the exact codes, names, and actionable recommendations.
3. Keep the tone crisp and operational (like a university director of operations briefing).
4. Do not make up fake data outside the provided state. If authorized by the user role, guide them to the specific module to take action (e.g. "Go to Duty Roster to confirm proposed replacements", "Open Transport to schedule service").
`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContext,
      });

      const text = response.text || 'Unable to generate operational summary.';
      res.json({
        success: true,
        answer: text,
        source: 'Gemini 3.8 Flash Server Model',
      });
      return;
    }
  } catch (error: any) {
    console.error('Gemini API call failed, using intelligent rule-based engine fallback:', error);
  }

  // Graceful deterministic fallback if API key is not configured or rate limited
  let fallbackAnswer = '';
  const qLower = query.toLowerCase();

  if (qLower.includes('unfilled') || qLower.includes('tomorrow')) {
    fallbackAnswer = `**Unfilled Shifts for Tomorrow (${tomorrowStr}):**\n\n` +
      (unfilledShiftsTomorrow.length > 0
        ? unfilledShiftsTomorrow.map((u) => `• ${u}`).join('\n') +
          `\n\n*Operational Action:* Run the automated **Scheduling Assistant** in the **Duty Roster** tab to populate qualified replacement staff without conflicts.`
        : 'All campus locations and shift slots currently satisfy required minimum staffing quotas for tomorrow.');
  } else if (qLower.includes('guard') || qLower.includes('night')) {
    fallbackAnswer = `**Security Guards Available for Night Shift (${todayStr}):**\n\n` +
      (availableNightGuards.length > 0
        ? availableNightGuards.map((g) => `• ${g}`).join('\n') +
          `\n\n*Note:* None of these guards have overlapping morning/evening shifts today or approved leaves. You can assign them via **Security Gate Management**.`
        : 'All active security guards are currently rostered or on weekly rest.');
  } else if (qLower.includes('hostel') || qLower.includes('complaint') || qLower.includes('overdue')) {
    fallbackAnswer = `**Overdue Hostel Grievances / Complaints:**\n\n` +
      (overdueHostelComplaints.length > 0
        ? overdueHostelComplaints.map((c) => `• ${c}`).join('\n') +
          `\n\n*Action:* Escalate to the assigned maintenance technician in **Hostel Management**.`
        : 'No overdue hostel grievances at this time.');
  } else if (qLower.includes('bus') || qLower.includes('vehicle') || qLower.includes('maintenance')) {
    fallbackAnswer = `**Upcoming Campus Fleet Maintenance:**\n\n` +
      (upcomingBusMaintenance.length > 0
        ? upcomingBusMaintenance.map((b) => `• ${b}`).join('\n') +
          `\n\n*Protocol:* Contact the Campus Motor Pool to reserve a substitute vehicle before grounding the bus for workshop inspection.`
        : 'All vehicles in the campus fleet have valid fitness certificates and services up to date.');
  } else if (qLower.includes('workload') || qLower.includes('highest')) {
    fallbackAnswer = `**Campus Department Workload Analysis:**\n\n` +
      deptWorkloads.map((w) => `• ${w}`).join('\n') +
      `\n\n**Highest Pending Workload:** Estate Maintenance & Civil Works (MNT) currently holds the most open service orders and high-priority infrastructure repairs.`;
  } else {
    fallbackAnswer = `**Smart Campus Operations Briefing:**\n\n` +
      `• **Unfilled Shifts Tomorrow:** ${unfilledShiftsTomorrow.length} slots requiring attention\n` +
      `• **Available Night Guards:** ${availableNightGuards.length} guards on standby\n` +
      `• **Overdue Work/Complaints:** ${overdueHostelComplaints.length} overdue hostel grievances, ${campusDb.workOrders.filter((w) => w.status !== 'completed' && w.deadline < todayStr).length} overdue work orders\n` +
      `• **Fleet Alert:** Bus DL-1PA-8801 due for service on 2026-10-20\n\n` +
      `You can ask targeted queries like *"Which shifts are unfilled tomorrow?"*, *"Which guards are available for night shift?"*, or *"Which buses have upcoming maintenance?"*.`;
  }

  res.json({
    success: true,
    answer: fallbackAnswer,
    source: 'Campus Rules & Live Operational Analytics Engine',
  });
});

// ==========================================
// Vite Dev Middleware & Static File Serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Campus Operations Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
