export type UserRole =
  | 'Super Admin'
  | 'Department Supervisor'
  | 'HOD'
  | 'Security Supervisor'
  | 'Hostel Warden'
  | 'Mess Manager'
  | 'Transport Manager'
  | 'Maintenance Supervisor'
  | 'Employee / Staff'
  | 'Management / Auditor';

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  hodName: string;
  supervisorName: string;
  totalStaff: number;
  contactExtension: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  departmentId: string;
  category: 'gate' | 'hostel' | 'mess' | 'transport' | 'academic' | 'facility';
  minStaffPerShift: {
    morning: number;
    evening: number;
    night: number;
    general?: number;
  };
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  role: UserRole;
  jobTitle: string;
  reportingToId?: string;
  reportingToName?: string;
  shiftPreference?: 'morning' | 'evening' | 'night' | 'any';
  weeklyOffDay: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  status: 'active' | 'on_leave' | 'inactive';
  avatarInitials: string;
}

export interface ShiftDefinition {
  id: string;
  name: string;
  code: 'morning' | 'evening' | 'night' | 'general';
  startTime: string; // HH:mm (24h)
  endTime: string;   // HH:mm (24h)
  departmentId?: string; // Optional custom shift per dept
  colorTag: string;
}

export interface DutyAssignment {
  id: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftName: string;
  shiftHours: string;
  shiftCode: 'morning' | 'evening' | 'night' | 'general';
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  status: 'scheduled' | 'completed' | 'absent' | 'swapped' | 'suggested';
  isSuggested?: boolean; // Set by Scheduling Assistant
  attendanceStatus: 'pending' | 'present' | 'late' | 'missed';
  checkInTime?: string;
  checkOutTime?: string;
  checkInMethod?: 'supervisor_verified' | 'qr_scanner' | 'manual';
  notes?: string;
  createdAt: string;
}

export interface ShiftSwapRequest {
  id: string;
  assignmentId: string;
  date: string;
  requestingEmployeeId: string;
  requestingEmployeeName: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetAssignmentId?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  supervisorRemarks?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  leaveType: 'Casual' | 'Sick' | 'Duty' | 'Emergency';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  departmentName: string;
  shiftId: string;
  shiftName: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'half_day' | 'absent';
  verificationMethod: 'supervisor_verified' | 'qr_scanner' | 'manual';
  verifiedBy?: string;
  notes?: string;
}

export interface SecurityGate {
  id: string;
  gateCode: string;
  name: string;
  type: 'pedestrian' | 'vehicular' | 'mixed';
  status: 'operational' | 'restricted' | 'closed';
  currentGuardsOnDuty: number;
  requiredGuards: number;
  radioChannel: string;
}

export interface GateIncident {
  id: string;
  gateId: string;
  gateName: string;
  reportedByGuardId: string;
  reportedByGuardName: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  visitorOrVehicleInfo?: string;
  status: 'open' | 'investigating' | 'resolved';
  supervisorReviewNotes?: string;
  resolvedAt?: string;
}

export interface DailyMenu {
  id: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Evening Snacks' | 'Dinner';
  items: string[];
  headChef: string;
  dietaryNotes: string;
  preparedServingsTarget: number;
  status: 'planned' | 'in_prep' | 'served' | 'closed';
}

export interface KitchenTask {
  id: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Daily Cleaning';
  title: string;
  assignedStaffName: string;
  assignedStaffId: string;
  category: 'Cooking' | 'Preparation' | 'Dishwashing' | 'Hygiene Inspection' | 'Inventory';
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface HostelComplaint {
  id: string;
  complaintCode: string;
  hostelBlock: 'Block A (Boys)' | 'Block B (Girls)' | 'Block C (PG Scholars)';
  roomNumber: string;
  residentName: string;
  studentRollNo: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry' | 'Internet/Wi-Fi' | 'Cleaning';
  priority: 'urgent' | 'high' | 'normal';
  description: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  deadline: string; // YYYY-MM-DD
  status: 'open' | 'in_progress' | 'pending_approval' | 'resolved';
  resolutionRemarks?: string;
  resolvedAt?: string;
  hasAttachment?: boolean;
  createdAt: string;
}

export interface HostelInspection {
  id: string;
  date: string;
  hostelBlock: string;
  floor: string;
  wardenName: string;
  scorePercent: number;
  hygieneStatus: 'Excellent' | 'Good' | 'Needs Attention';
  fireSafetyChecked: boolean;
  notes: string;
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  contactNumber: string;
  residentVisited: string;
  hostelBlock: string;
  roomNumber: string;
  checkInTime: string;
  checkOutTime?: string;
  idProofType: 'National ID' | 'Driver License' | 'Student ID';
  status: 'checked_in' | 'departed';
}

export interface CampusVehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  type: 'Bus (42 Seater)' | 'Minibus (24 Seater)' | 'Electric Shuttle (14 Seater)';
  fuelType: 'Diesel' | 'Electric' | 'CNG';
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedAttendantName?: string;
  fitnessValidUntil: string; // YYYY-MM-DD
  insuranceValidUntil: string;
  nextServiceDueDate: string; // YYYY-MM-DD
  status: 'active' | 'in_maintenance' | 'breakdown';
  mileageKm: number;
}

export interface TripSchedule {
  id: string;
  tripCode: string;
  date: string; // YYYY-MM-DD
  routeName: string;
  origin: string;
  destination: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  attendantName: string;
  departureTime: string; // HH:mm
  expectedArrivalTime: string; // HH:mm
  status: 'scheduled' | 'on_route' | 'completed' | 'delayed' | 'cancelled';
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  notes?: string;
  isSubstituteDriver?: boolean;
  authorizedBySupervisor?: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  workOrderCode: string;
  title: string;
  departmentCategory: 'Electrical' | 'Plumbing' | 'HVAC' | 'Civil/Carpentry' | 'Housekeeping' | 'Laboratory';
  location: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  reportedBy: string;
  reportedDate: string;
  deadline: string; // YYYY-MM-DD
  status: 'open' | 'in_progress' | 'pending_supervisor_signoff' | 'completed';
  workRemarks?: string;
  supervisorApprovalDate?: string;
  materialsUsed?: string;
  beforePhotoDescription?: string;
  afterPhotoDescription?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type:
    | 'missed_checkin'
    | 'upcoming_shift'
    | 'overdue_work'
    | 'vehicle_maintenance'
    | 'shift_swap'
    | 'leave_approval'
    | 'incident_alert'
    | 'system';
  severity: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  departmentId?: string;
  relatedEntityId?: string;
  isRead: boolean;
  timestamp: string;
}

export interface SchedulerExecutionLog {
  id: string;
  timestamp: string;
  triggersRun: string[];
  alertsGenerated: number;
  status: 'success' | 'warning' | 'error';
  summary: string;
}

export interface CampusAuditLog {
  id: string;
  action: string;
  category: 'roster' | 'attendance' | 'maintenance' | 'hostel' | 'transport' | 'security' | 'admin';
  actorName: string;
  actorRole: UserRole;
  details: string;
  timestamp: string;
}
