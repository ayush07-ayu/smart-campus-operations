export type UserRole = 
  | 'super_admin'
  | 'supervisor'
  | 'hod'
  | 'faculty'
  | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  programId?: string;
  programName?: string;
  sectionId?: string;
  sectionName?: string;
  designation?: string;
  avatar: string;
  phone?: string;
  cabin?: string;
  teachingSubjects?: string[];
  weeklyHoursLimit?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  buildingId: string;
  hodName: string;
  totalFaculty: number;
  totalStudents: number;
}

export interface AcademicProgram {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  durationYears: number;
  currentSemesters: number[];
}

export interface Section {
  id: string;
  programId: string;
  programCode: string;
  year: number;
  semester: number;
  name: string; // e.g. "Section A"
  enrolledStudents: number;
  classRepresentative?: string;
}

export interface Room {
  id: string;
  code: string; // e.g. "Lab 302"
  name: string;
  building: string;
  floor: number;
  roomType: 'computer_lab' | 'lecture_hall' | 'seminar_hall' | 'staff_room' | 'admin_office' | 'hod_office';
  capacity: number;
  departmentId?: string;
  facilities: string[];
  hasProjector: boolean;
  hasAC: boolean;
  isAccessible: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  programCode: string;
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomCode: string;
  type: 'Lecture' | 'Practical / Lab' | 'Tutorial' | 'Exam Duty';
  isAdjusted?: boolean;
  adjustedFacultyId?: string;
  adjustedFacultyName?: string;
  adjustmentReason?: string;
}

export type SubstitutionStatus = 
  | 'Pending'
  | 'Accepted by Substitute'
  | 'Awaiting Approval'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface SubstitutionRequest {
  id: string;
  timetableSlotId: string;
  originalFacultyId: string;
  originalFacultyName: string;
  substituteFacultyId: string;
  substituteFacultyName: string;
  subjectName: string;
  subjectCode: string;
  sectionName: string;
  roomCode: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: SubstitutionStatus;
  requestedAt: string;
  reviewedByHodAt?: string;
  hodDecisionNotes?: string;
  recommendationReason?: string;
  compatibilityScore?: number;
}

export interface FacultyLeave {
  id: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  leaveType: 'Casual' | 'Medical' | 'Duty / Conference' | 'Earned';
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  affectedSlotsCount: number;
  affectedSlotIds: string[];
  substitutionsAssigned: boolean;
}

export interface StudentServiceCounter {
  id: string;
  serviceType: 'id_card' | 'bus_pass' | 'uniform' | 'degree_cert';
  name: string;
  location: string;
  operatingHours: string;
  dailyCapacity: number;
  currentBooked: number;
  requiredDocuments: string[];
  timeSlots: {
    id: string;
    programEligibility: string[]; // e.g. ["MCA", "BCA"]
    timeWindow: string; // e.g. "02:00 PM - 03:00 PM"
    maxCapacity: number;
    bookedCount: number;
  }[];
}

export interface StudentServiceBooking {
  id: string;
  tokenNumber: string;
  studentId: string;
  studentName: string;
  programCode: string;
  serviceType: string;
  serviceName: string;
  date: string;
  timeWindow: string;
  counterLocation: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export type ComplaintCategory = 
  | 'Classroom or Lab'
  | 'Faculty or Academic'
  | 'Computer & Internet'
  | 'Cleaning & Sanitation'
  | 'ID Card or Bus Pass'
  | 'Infrastructure & Maintenance'
  | 'Hostel & Amenities'
  | 'Other';

export type ComplaintStatus = 
  | 'Submitted'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Information'
  | 'Resolved'
  | 'Reopened';

export interface Complaint {
  id: string;
  referenceNo: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programCode: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  location: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolutionRemarks?: string;
  internalNotes?: string[];
}

export interface CampusEvent {
  id: string;
  title: string;
  category: 'Seminar' | 'Workshop' | 'Placement Drive' | 'Guest Lecture' | 'Cultural' | 'Examination' | 'Department Meeting' | 'Administrative';
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizingDepartment: string;
  eligibleAudience: string;
  registrationRequired: boolean;
  registrationLink?: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  registeredCount: number;
  isPlacement?: boolean;
  companyName?: string;
  packageOffered?: string;
}

export interface SectionAttendanceSummary {
  id: string;
  date: string;
  programCode: string;
  year: number;
  sectionName: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  isVerified: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string; // target user, or undefined if broadcast
  roleTarget?: UserRole | 'all';
  title: string;
  message: string;
  category: 'Substitution' | 'Timetable' | 'Leave' | 'Grievance' | 'Event' | 'StudentService' | 'System';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionId?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: 'SUBSTITUTION_REQUESTED' | 'SUBSTITUTION_ACCEPTED' | 'SUBSTITUTION_APPROVED' | 'SUBSTITUTION_REJECTED' | 'LEAVE_RECORDED' | 'TIMETABLE_MODIFIED' | 'COMPLAINT_RESOLVED' | 'ROOM_RESERVED' | 'SIMULATION_COMMITTED';
  recordId: string;
  description: string;
  details?: Record<string, any>;
}

export interface WhatIfSimulationRequest {
  scenarioType: 'FACULTY_ABSENCE' | 'LAB_MAINTENANCE' | 'EXAM_DUTY_REASSIGNMENT';
  facultyId?: string;
  roomId?: string;
  date: string;
  notes?: string;
}

export interface SimulationAlternative {
  slotId: string;
  subjectName: string;
  sectionName: string;
  timeSlot: string;
  originalFaculty: string;
  suggestedSubstituteId?: string;
  suggestedSubstituteName?: string;
  alternateRoomId?: string;
  alternateRoomCode?: string;
  score: number;
  reason: string;
  hasConflict: boolean;
}

export interface SimulationResult {
  simulationId: string;
  scenarioType: string;
  affectedSlotsCount: number;
  alternatives: SimulationAlternative[];
  overallFeasibility: 'High' | 'Medium' | 'Low';
  workloadImpactSummary: string;
  generatedAt: string;
}
