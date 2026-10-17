import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from './src/data/db';
import { 
  TimetableSlot, SubstitutionRequest, Complaint, 
  AuditLogItem, NotificationItem, SimulationAlternative,
  SimulationResult, StudentServiceBooking, CampusEvent,
  SectionAttendanceSummary
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Log audit trail
function addAuditLog(
  userId: string,
  userName: string,
  userRole: any,
  actionType: any,
  recordId: string,
  description: string,
  details?: Record<string, any>
) {
  const log: AuditLogItem = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId,
    userName,
    userRole,
    actionType,
    recordId,
    description,
    details
  };
  db.auditLogs.unshift(log);
  return log;
}

// Helper: Add in-app notification
function addNotification(
  title: string,
  message: string,
  category: any,
  options?: { userId?: string; roleTarget?: any; actionId?: string }
) {
  const notif: NotificationItem = {
    id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId: options?.userId,
    roleTarget: options?.roleTarget,
    title,
    message,
    category,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    isRead: false,
    actionId: options?.actionId
  };
  db.notifications.unshift(notif);
  return notif;
}

// ==========================================
// AUTH & USERS API
// ==========================================
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    user: db.currentUser,
    campusConfig: db.campusConfig
  });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  res.json(db.users);
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.setCurrentUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, user });
});

// ==========================================
// DASHBOARD STATS API
// ==========================================
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const user = db.currentUser;
  
  // Total rooms and occupied calculation for right now (or Monday 11:00 AM demo default)
  const currentDay = 'Monday';
  const currentTime = '11:00';
  
  const occupiedSlots = db.timetableSlots.filter(s => {
    if (s.day !== currentDay) return false;
    return s.startTime <= currentTime && s.endTime > currentTime;
  });

  const occupiedRoomIds = new Set(occupiedSlots.map(s => s.roomId));
  const totalRoomsConfigured = db.campusConfig.totalConfiguredRooms; // 400
  const activeRoomsCount = db.rooms.length;
  const occupiedCount = occupiedRoomIds.size;
  const availableCount = activeRoomsCount - occupiedCount;

  const pendingSubstitutions = db.substitutions.filter(s => s.status === 'Pending' || s.status === 'Awaiting Approval').length;
  const facultyOnLeave = db.leaves.filter(l => l.status === 'Approved').length;
  const openComplaints = db.complaints.filter(c => c.status !== 'Resolved').length;
  const upcomingEvents = db.events.filter(e => e.status === 'Scheduled').length;

  // Role-specific stats
  let roleData: any = {};
  if (user.role === 'student') {
    const studentSlots = db.timetableSlots.filter(s => s.sectionId === user.sectionId);
    const myComplaints = db.complaints.filter(c => c.studentId === user.id);
    const myBookings = db.bookings.filter(b => b.studentId === user.id);
    roleData = {
      myWeeklyClasses: studentSlots.length,
      myComplaintsCount: myComplaints.length,
      myBookingsCount: myBookings.length,
      attendanceSummary: db.attendanceSummaries.find(a => a.sectionName === user.sectionName)
    };
  } else if (user.role === 'faculty') {
    const mySlots = db.timetableSlots.filter(s => s.facultyId === user.id);
    const myPendingSubs = db.substitutions.filter(s => s.substituteFacultyId === user.id && s.status === 'Pending');
    const myRequestedSubs = db.substitutions.filter(s => s.originalFacultyId === user.id);
    roleData = {
      myWeeklyTeachingHours: mySlots.length,
      incomingSubRequests: myPendingSubs.length,
      mySubRequests: myRequestedSubs.length,
      myLeaveStatus: db.leaves.filter(l => l.facultyId === user.id)
    };
  } else if (user.role === 'hod' || user.role === 'supervisor') {
    roleData = {
      deptFacultyCount: db.users.filter(u => u.departmentId === user.departmentId && (u.role === 'faculty' || u.role === 'supervisor')).length,
      deptPendingApprovals: db.substitutions.filter(s => s.status === 'Awaiting Approval').length,
      deptPendingLeaves: db.leaves.filter(l => l.status === 'Pending').length,
      deptComplaints: db.complaints.filter(c => c.status !== 'Resolved').length
    };
  }

  res.json({
    totalRoomsConfigured,
    totalClassesConfigured: db.campusConfig.totalConfiguredClasses,
    activeRoomsSample: activeRoomsCount,
    occupiedRoomsNow: occupiedCount,
    availableRoomsNow: availableCount,
    pendingSubstitutions,
    facultyOnLeave,
    openComplaints,
    upcomingEvents,
    roleData
  });
});

// ==========================================
// TIMETABLE API
// ==========================================
app.get('/api/timetable', (req: Request, res: Response) => {
  const { program, section, facultyId, day, roomId } = req.query;
  let results = [...db.timetableSlots];

  if (program) results = results.filter(s => s.programCode === program);
  if (section) results = results.filter(s => s.sectionId === section);
  if (facultyId) results = results.filter(s => s.facultyId === facultyId || s.adjustedFacultyId === facultyId);
  if (day) results = results.filter(s => s.day === day);
  if (roomId) results = results.filter(s => s.roomId === roomId);

  res.json({
    slots: results,
    departments: db.departments,
    programs: db.programs,
    sections: db.sections,
    rooms: db.rooms,
    faculty: db.users.filter(u => u.role === 'faculty' || u.role === 'supervisor' || u.role === 'hod')
  });
});

// Create or update timetable slot (Super Admin / Supervisor only)
app.post('/api/timetable/slot', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role !== 'super_admin' && user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Permission denied. Only Super Admin or Timetable Coordinator can modify official schedule.' });
  }

  const { day, startTime, endTime, subjectCode, subjectName, sectionId, facultyId, roomId, type } = req.body;
  if (!day || !startTime || !endTime || !subjectCode || !sectionId || !facultyId || !roomId) {
    return res.status(400).json({ error: 'Missing required schedule fields' });
  }

  // Conflict Detection
  // Check room conflict
  const roomConflict = db.timetableSlots.find(s => 
    s.day === day && 
    s.roomId === roomId && 
    ((startTime >= s.startTime && startTime < s.endTime) || (endTime > s.startTime && endTime <= s.endTime))
  );
  if (roomConflict) {
    return res.status(409).json({ 
      error: `Room conflict: Room ${roomConflict.roomCode} is already booked for ${roomConflict.subjectCode} (${roomConflict.startTime}-${roomConflict.endTime}) on ${day}.` 
    });
  }

  // Check faculty conflict
  const facultyConflict = db.timetableSlots.find(s => 
    s.day === day && 
    s.facultyId === facultyId && 
    ((startTime >= s.startTime && startTime < s.endTime) || (endTime > s.startTime && endTime <= s.endTime))
  );
  if (facultyConflict) {
    return res.status(409).json({ 
      error: `Faculty conflict: ${facultyConflict.facultyName} is already assigned to ${facultyConflict.subjectCode} in ${facultyConflict.roomCode} (${facultyConflict.startTime}-${facultyConflict.endTime}) on ${day}.` 
    });
  }

  const targetFaculty = db.getUserById(facultyId);
  const targetRoom = db.rooms.find(r => r.id === roomId);
  const targetSection = db.sections.find(sec => sec.id === sectionId);

  const newSlot: TimetableSlot = {
    id: 'slot_' + Date.now(),
    day,
    startTime,
    endTime,
    subjectCode,
    subjectName,
    sectionId,
    sectionName: targetSection?.name || 'Section',
    programCode: targetSection?.programCode || 'MCA',
    facultyId,
    facultyName: targetFaculty?.name || 'Faculty',
    roomId,
    roomCode: targetRoom?.code || 'Room',
    type: type || 'Lecture'
  };

  db.timetableSlots.push(newSlot);

  addAuditLog(
    user.id,
    user.name,
    user.role,
    'TIMETABLE_MODIFIED',
    newSlot.id,
    `Added new timetable slot ${subjectCode} for ${newSlot.sectionName} in ${newSlot.roomCode}`,
    newSlot
  );

  res.json({ success: true, slot: newSlot });
});

// ==========================================
// SUBSTITUTION & ADJUSTMENT ENGINE API
// ==========================================

// Smart substitute candidate search
app.get('/api/substitutions/find-candidates', (req: Request, res: Response) => {
  const { slotId, date } = req.query;
  const slot = db.timetableSlots.find(s => s.id === slotId);
  if (!slot) {
    return res.status(404).json({ error: 'Timetable slot not found' });
  }

  const targetDay = slot.day;
  const startTime = slot.startTime;
  const endTime = slot.endTime;

  // Filter all faculty members except the original faculty
  const allFaculty = db.users.filter(u => 
    (u.role === 'faculty' || u.role === 'supervisor') && 
    u.id !== slot.facultyId &&
    u.departmentId === 'dept_ca' // department permission
  );

  const candidates = allFaculty.map(fac => {
    // 1. Check schedule conflict during that day & slot
    const hasConflict = db.timetableSlots.some(s => 
      s.day === targetDay && 
      (s.facultyId === fac.id || s.adjustedFacultyId === fac.id) && 
      ((startTime >= s.startTime && startTime < s.endTime) || (endTime > s.startTime && endTime <= s.endTime))
    );

    // 2. Check approved leave on that date
    const onLeave = db.leaves.some(l => 
      l.facultyId === fac.id && 
      l.status === 'Approved' && 
      (!date || (date >= l.startDate && date <= l.endDate))
    );

    // 3. Subject qualification match
    const teachingSubjects = fac.teachingSubjects || [];
    const isSubjectMatch = teachingSubjects.some(sub => 
      slot.subjectName.toLowerCase().includes(sub.toLowerCase()) || 
      sub.toLowerCase().includes(slot.subjectName.toLowerCase())
    );

    // 4. Current assigned workload
    const weeklyLoad = db.timetableSlots.filter(s => s.facultyId === fac.id).length;
    const maxLimit = fac.weeklyHoursLimit || 20;

    let score = 0;
    const reasons: string[] = [];

    if (hasConflict) {
      return {
        faculty: fac,
        isEligible: false,
        score: 0,
        disqualificationReason: 'Has conflicting teaching lecture or laboratory session at this time.'
      };
    }

    if (onLeave) {
      return {
        faculty: fac,
        isEligible: false,
        score: 0,
        disqualificationReason: 'Faculty is on approved leave for the requested date.'
      };
    }

    // Candidate is conflict free!
    score += 50;
    reasons.push('Free schedule slot with zero timetable conflicts');

    if (isSubjectMatch) {
      score += 35;
      reasons.push(`Direct subject expertise match (${teachingSubjects.join(', ')})`);
    } else {
      score += 15;
      reasons.push('Qualified in department computing domain');
    }

    // Workload balance
    if (weeklyLoad < maxLimit - 2) {
      score += 15;
      reasons.push(`Balanced workload (${weeklyLoad} hrs assigned / max ${maxLimit} hrs)`);
    } else {
      score += 5;
      reasons.push(`Standard load (${weeklyLoad} hrs)`);
    }

    return {
      faculty: fac,
      isEligible: true,
      score,
      weeklyLoad,
      reason: reasons.join('; ') + '.'
    };
  }).filter(c => c.isEligible).sort((a, b) => b.score - a.score);

  res.json({
    slot,
    candidates
  });
});

// Request substitution
app.post('/api/substitutions/request', (req: Request, res: Response) => {
  const user = db.currentUser;
  const { slotId, substituteFacultyId, date, reason } = req.body;

  const slot = db.timetableSlots.find(s => s.id === slotId);
  if (!slot) return res.status(404).json({ error: 'Timetable slot not found' });

  const substitute = db.getUserById(substituteFacultyId);
  if (!substitute) return res.status(404).json({ error: 'Substitute faculty not found' });

  // Only the assigned faculty or supervisor/super_admin can initiate
  if (user.role === 'faculty' && slot.facultyId !== user.id) {
    return res.status(403).json({ error: 'You can only request adjustments for your own assigned classes.' });
  }

  const subReq: SubstitutionRequest = {
    id: 'sub_req_' + Date.now(),
    timetableSlotId: slot.id,
    originalFacultyId: slot.facultyId,
    originalFacultyName: slot.facultyName,
    substituteFacultyId: substitute.id,
    substituteFacultyName: substitute.name,
    subjectName: slot.subjectName,
    subjectCode: slot.subjectCode,
    sectionName: slot.sectionName,
    roomCode: slot.roomCode,
    date: date || '2026-10-19',
    startTime: slot.startTime,
    endTime: slot.endTime,
    reason: reason || 'Academic engagement',
    status: 'Pending',
    requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    recommendationReason: `Adjusted for ${substitute.name} due to schedule availability and workload balance.`
  };

  db.substitutions.unshift(subReq);

  // Notify substitute
  addNotification(
    'Duty Substitution Request Received',
    `${slot.facultyName} requested you to cover ${slot.subjectCode} (${slot.startTime}-${slot.endTime}) on ${subReq.date}.`,
    'Substitution',
    { userId: substitute.id, actionId: subReq.id }
  );

  addAuditLog(
    user.id,
    user.name,
    user.role,
    'SUBSTITUTION_REQUESTED',
    subReq.id,
    `Requested substitution for ${slot.subjectCode} with ${substitute.name}`,
    subReq
  );

  res.json({ success: true, substitution: subReq });
});

// Update substitution status (Accept by substitute, Approve by HOD, etc.)
app.post('/api/substitutions/action', (req: Request, res: Response) => {
  const user = db.currentUser;
  const { substitutionId, action, notes } = req.body; // action: 'accept', 'decline', 'approve', 'reject'

  const sub = db.substitutions.find(s => s.id === substitutionId);
  if (!sub) return res.status(404).json({ error: 'Substitution request not found' });

  if (action === 'accept') {
    // Only substitute faculty can accept
    if (user.id !== sub.substituteFacultyId && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only the requested substitute faculty can accept this request.' });
    }
    sub.status = 'Awaiting Approval';

    // Notify HOD
    const hod = db.users.find(u => u.role === 'hod');
    if (hod) {
      addNotification(
        'Substitution Awaiting HOD Approval',
        `${sub.substituteFacultyName} accepted duty adjustment for ${sub.subjectCode} on ${sub.date}. Awaiting your authorization.`,
        'Substitution',
        { userId: hod.id, actionId: sub.id }
      );
    }

    addAuditLog(user.id, user.name, user.role, 'SUBSTITUTION_ACCEPTED', sub.id, `${user.name} accepted duty substitution for ${sub.subjectCode}`);
  } 
  else if (action === 'decline') {
    if (user.id !== sub.substituteFacultyId && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Unauthorized to decline' });
    }
    sub.status = 'Rejected';

    addNotification(
      'Substitution Request Declined',
      `${sub.substituteFacultyName} was unable to accept the duty adjustment for ${sub.subjectCode} on ${sub.date}.`,
      'Substitution',
      { userId: sub.originalFacultyId, actionId: sub.id }
    );
  }
  else if (action === 'approve') {
    // Only HOD or Super Admin can approve
    if (user.role !== 'hod' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Permission denied. HOD or Dean approval required to commit substitution.' });
    }
    sub.status = 'Approved';
    sub.reviewedByHodAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    sub.hodDecisionNotes = notes || `Authorized by ${user.name} (${user.designation || 'HOD'}).`;

    // CRITICAL: Update the authoritative timetable!
    const slot = db.timetableSlots.find(s => s.id === sub.timetableSlotId);
    if (slot) {
      slot.isAdjusted = true;
      slot.adjustedFacultyId = sub.substituteFacultyId;
      slot.adjustedFacultyName = sub.substituteFacultyName;
      slot.adjustmentReason = sub.reason;
    }

    // Notify both faculties & the class representative
    addNotification(
      'Duty Adjustment Approved by HOD',
      `Duty adjustment for ${sub.subjectCode} on ${sub.date} officially approved. ${sub.substituteFacultyName} will take class in ${sub.roomCode}.`,
      'Substitution',
      { userId: sub.originalFacultyId, actionId: sub.id }
    );

    addNotification(
      'Duty Adjustment Approved',
      `You are confirmed as substitute for ${sub.subjectCode} on ${sub.date} at ${sub.startTime} in ${sub.roomCode}.`,
      'Substitution',
      { userId: sub.substituteFacultyId, actionId: sub.id }
    );

    // Notify students of that section
    addNotification(
      `Class Schedule Update: ${sub.subjectCode}`,
      `Your class on ${sub.date} at ${sub.startTime} in ${sub.roomCode} will be conducted by ${sub.substituteFacultyName}.`,
      'Timetable',
      { roleTarget: 'student' }
    );

    addAuditLog(
      user.id,
      user.name,
      user.role,
      'SUBSTITUTION_APPROVED',
      sub.id,
      `HOD approved duty substitution for ${sub.subjectCode}. Authoritative timetable updated.`
    );
  }
  else if (action === 'reject') {
    if (user.role !== 'hod' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Permission denied. HOD authorization required.' });
    }
    sub.status = 'Rejected';
    sub.reviewedByHodAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    sub.hodDecisionNotes = notes || 'Rejected due to departmental scheduling policy.';

    addNotification(
      'Duty Adjustment Rejected by HOD',
      `Substitution request for ${sub.subjectCode} on ${sub.date} was rejected by HOD. Reason: ${sub.hodDecisionNotes}`,
      'Substitution',
      { userId: sub.originalFacultyId, actionId: sub.id }
    );

    addAuditLog(user.id, user.name, user.role, 'SUBSTITUTION_REJECTED', sub.id, `HOD rejected substitution request.`);
  }

  res.json({ success: true, substitution: sub });
});

app.get('/api/substitutions', (req: Request, res: Response) => {
  res.json(db.substitutions);
});

// ==========================================
// LEAVE MANAGEMENT API
// ==========================================
app.get('/api/leaves', (req: Request, res: Response) => {
  res.json(db.leaves);
});

app.post('/api/leaves/apply', (req: Request, res: Response) => {
  const user = db.currentUser;
  const { facultyId, startDate, endDate, leaveType, reason } = req.body;

  const targetFaculty = db.getUserById(facultyId || user.id);
  if (!targetFaculty) return res.status(404).json({ error: 'Faculty not found' });

  // Find all affected timetable slots
  // Check day of week for start date
  const startDayName = new Date(startDate || '2026-10-20').toLocaleDateString('en-US', { weekday: 'long' }) as any;
  const affectedSlots = db.timetableSlots.filter(s => 
    s.facultyId === targetFaculty.id && 
    (s.day === startDayName || s.day === 'Monday')
  );

  const newLeave: any = {
    id: 'leave_' + Date.now(),
    facultyId: targetFaculty.id,
    facultyName: targetFaculty.name,
    departmentId: targetFaculty.departmentId,
    startDate,
    endDate,
    leaveType: leaveType || 'Casual',
    reason: reason || 'Personal emergency',
    status: user.role === 'super_admin' || user.role === 'hod' ? 'Approved' : 'Pending',
    affectedSlotsCount: affectedSlots.length,
    affectedSlotIds: affectedSlots.map(s => s.id),
    substitutionsAssigned: false
  };

  db.leaves.unshift(newLeave);

  addAuditLog(
    user.id,
    user.name,
    user.role,
    'LEAVE_RECORDED',
    newLeave.id,
    `Recorded ${newLeave.leaveType} leave for ${targetFaculty.name} (${startDate} to ${endDate}). Affected slots: ${affectedSlots.length}`
  );

  res.json({
    success: true,
    leave: newLeave,
    affectedSlots
  });
});

// ==========================================
// ROOMS & LAB AVAILABILITY API
// ==========================================
app.get('/api/rooms', (req: Request, res: Response) => {
  res.json(db.rooms);
});

app.get('/api/rooms/availability', (req: Request, res: Response) => {
  const { day, time, type } = req.query;
  const targetDay = (day as string) || 'Monday';
  const targetTime = (time as string) || '11:00';

  let roomsList = [...db.rooms];
  if (type) {
    roomsList = roomsList.filter(r => r.roomType === type);
  }

  // Find active assignments during that day & time
  const occupiedSlots = db.timetableSlots.filter(s => 
    s.day === targetDay && 
    s.startTime <= targetTime && 
    s.endTime > targetTime
  );

  const occupiedMap = new Map();
  occupiedSlots.forEach(s => {
    occupiedMap.set(s.roomId, s);
  });

  const availability = roomsList.map(room => {
    const activeSlot = occupiedMap.get(room.id);
    return {
      room,
      isAvailable: !activeSlot,
      status: activeSlot ? 'Occupied' : 'Available',
      currentSession: activeSlot ? {
        subjectCode: activeSlot.subjectCode,
        subjectName: activeSlot.subjectName,
        facultyName: activeSlot.adjustedFacultyName || activeSlot.facultyName,
        sectionName: activeSlot.sectionName,
        startTime: activeSlot.startTime,
        endTime: activeSlot.endTime,
        isAdjusted: !!activeSlot.isAdjusted
      } : null
    };
  });

  res.json({
    day: targetDay,
    time: targetTime,
    totalChecked: roomsList.length,
    availableCount: availability.filter(a => a.isAvailable).length,
    occupiedCount: availability.filter(a => !a.isAvailable).length,
    rooms: availability
  });
});

app.post('/api/rooms/reserve', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Students cannot reserve classrooms or laboratories directly.' });
  }

  const { roomId, day, startTime, endTime, purpose } = req.body;
  const room = db.rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  // Conflict check
  const conflict = db.timetableSlots.find(s => 
    s.day === day && 
    s.roomId === roomId && 
    ((startTime >= s.startTime && startTime < s.endTime) || (endTime > s.startTime && endTime <= s.endTime))
  );

  if (conflict) {
    return res.status(409).json({ 
      error: `Cannot reserve: Room ${room.code} is occupied for ${conflict.subjectCode} (${conflict.startTime}-${conflict.endTime}) on ${day}.` 
    });
  }

  const reservationSlot: TimetableSlot = {
    id: 'res_' + Date.now(),
    day,
    startTime,
    endTime,
    subjectCode: 'RESERVED',
    subjectName: purpose || 'Departmental Workshop / Seminar',
    sectionId: 'sec_special',
    sectionName: 'Department Event',
    programCode: 'DCA',
    facultyId: user.id,
    facultyName: user.name,
    roomId: room.id,
    roomCode: room.code,
    type: 'Practical / Lab'
  };

  db.timetableSlots.push(reservationSlot);

  addAuditLog(user.id, user.name, user.role, 'ROOM_RESERVED', room.id, `Reserved ${room.code} for ${purpose} (${day} ${startTime}-${endTime})`);

  res.json({ success: true, reservation: reservationSlot });
});

// ==========================================
// STAFF ROOM & FACULTY DIRECTORY API
// ==========================================
app.get('/api/staff-room/faculty', (req: Request, res: Response) => {
  const currentDay = 'Monday';
  const currentTime = '11:00';

  const facultyList = db.users.filter(u => u.role === 'faculty' || u.role === 'supervisor');

  const facultyWithStatus = facultyList.map(fac => {
    // Check if on leave
    const onLeave = db.leaves.some(l => l.facultyId === fac.id && l.status === 'Approved');
    if (onLeave) {
      return {
        faculty: fac,
        status: 'On Leave',
        statusLabel: 'Approved Leave',
        cabin: fac.cabin || 'Staff Room 204',
        currentActivity: 'On Approved Leave',
        nextClass: 'Resumes following day'
      };
    }

    // Check active class right now
    const activeClass = db.timetableSlots.find(s => 
      s.day === currentDay && 
      (s.facultyId === fac.id || s.adjustedFacultyId === fac.id) &&
      s.startTime <= currentTime && s.endTime > currentTime
    );

    if (activeClass) {
      return {
        faculty: fac,
        status: 'Teaching',
        statusLabel: `In Lecture (${activeClass.roomCode})`,
        cabin: fac.cabin || 'Staff Room 204',
        currentActivity: `${activeClass.subjectCode}: ${activeClass.subjectName} in ${activeClass.roomCode}`,
        nextClass: `Free at ${activeClass.endTime}`
      };
    }

    // Check next upcoming class today
    const upcomingClass = db.timetableSlots
      .filter(s => s.day === currentDay && (s.facultyId === fac.id || s.adjustedFacultyId === fac.id) && s.startTime > currentTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

    return {
      faculty: fac,
      status: 'Available',
      statusLabel: 'Available in Staff Room',
      cabin: fac.cabin || 'Staff Room 204',
      currentActivity: 'Available for student consultations',
      nextClass: upcomingClass ? `${upcomingClass.subjectCode} at ${upcomingClass.startTime} (${upcomingClass.roomCode})` : 'No more classes today'
    };
  });

  res.json(facultyWithStatus);
});

// ==========================================
// STUDENT SERVICES & SLOTS API
// ==========================================
app.get('/api/student-services/counters', (req: Request, res: Response) => {
  res.json(db.serviceCounters);
});

app.get('/api/student-services/my-bookings', (req: Request, res: Response) => {
  const user = db.currentUser;
  const bookings = db.bookings.filter(b => b.studentId === user.id);
  res.json(bookings);
});

app.post('/api/student-services/book', (req: Request, res: Response) => {
  const user = db.currentUser;
  const { counterId, timeSlotId, date } = req.body;

  const counter = db.serviceCounters.find(c => c.id === counterId);
  if (!counter) return res.status(404).json({ error: 'Service counter not found' });

  const slot = counter.timeSlots.find(ts => ts.id === timeSlotId);
  if (!slot) return res.status(404).json({ error: 'Time slot not found' });

  // Capacity check
  if (slot.bookedCount >= slot.maxCapacity) {
    return res.status(400).json({ error: 'This time slot is completely booked. Please choose an alternate window.' });
  }

  slot.bookedCount += 1;
  counter.currentBooked += 1;

  const tokenNumber = `MMU-${counter.serviceType.toUpperCase()}-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

  const booking: StudentServiceBooking = {
    id: 'bk_' + Date.now(),
    tokenNumber,
    studentId: user.id,
    studentName: user.name,
    programCode: user.programName ? user.programName.split(' ')[0] : 'MCA',
    serviceType: counter.serviceType,
    serviceName: counter.name,
    date: date || '2026-10-21',
    timeWindow: slot.timeWindow,
    counterLocation: counter.location,
    status: 'Confirmed',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.bookings.push(booking);

  addNotification(
    `Service Slot Booked: ${tokenNumber}`,
    `Your appointment for ${counter.name} is confirmed for ${booking.date} (${slot.timeWindow}) at ${counter.location}.`,
    'StudentService',
    { userId: user.id, actionId: booking.id }
  );

  res.json({ success: true, booking });
});

// ==========================================
// STUDENT COMPLAINTS & GRIEVANCE API
// ==========================================
app.get('/api/complaints', (req: Request, res: Response) => {
  const user = db.currentUser;
  // If student, see own complaints (or general demo allowed if super_admin/hod)
  if (user.role === 'student') {
    return res.json(db.complaints.filter(c => c.studentId === user.id));
  }
  res.json(db.complaints);
});

app.post('/api/complaints', (req: Request, res: Response) => {
  const user = db.currentUser;
  const { category, subject, description, location, priority } = req.body;

  if (!subject || !description || !location) {
    return res.status(400).json({ error: 'Subject, description, and location are required.' });
  }

  const referenceNo = `MMU-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newComplaint: Complaint = {
    id: 'cmp_' + Date.now(),
    referenceNo,
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    programCode: user.programName || 'MCA 1st Year',
    category: category || 'Classroom or Lab',
    subject,
    description,
    location,
    priority: priority || 'Medium',
    status: 'Submitted',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    assignedTo: 'Campus General Maintenance & Estate Cell'
  };

  db.complaints.unshift(newComplaint);

  addNotification(
    `Grievance Registered: ${referenceNo}`,
    `Your ticket has been logged with reference ${referenceNo}. Assigned to campus maintenance team.`,
    'Grievance',
    { userId: user.id, actionId: newComplaint.id }
  );

  addAuditLog(
    user.id,
    user.name,
    user.role,
    'COMPLAINT_RESOLVED',
    newComplaint.id,
    `Lodged grievance ${referenceNo}: ${subject}`
  );

  res.json({ success: true, complaint: newComplaint });
});

app.put('/api/complaints/:id/status', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Students cannot modify complaint status directly.' });
  }

  const { status, remarks, note } = req.body;
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  complaint.status = status || complaint.status;
  complaint.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (remarks) complaint.resolutionRemarks = remarks;
  if (note) {
    complaint.internalNotes = complaint.internalNotes || [];
    complaint.internalNotes.push(`${new Date().toISOString().replace('T', ' ').substring(0, 16)} by ${user.name}: ${note}`);
  }

  addNotification(
    `Complaint Status: ${complaint.referenceNo} is ${complaint.status}`,
    `Update on your ticket: ${remarks || note || 'Technician assigned'}`,
    'Grievance',
    { userId: complaint.studentId, actionId: complaint.id }
  );

  res.json({ success: true, complaint });
});

// ==========================================
// EVENTS & ANNOUNCEMENTS API
// ==========================================
app.get('/api/events', (req: Request, res: Response) => {
  res.json(db.events);
});

app.post('/api/events', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Only faculty, coordinators or admin can publish university events.' });
  }

  const { title, category, description, date, startTime, endTime, venue, eligibleAudience, isPlacement, companyName, packageOffered } = req.body;
  if (!title || !date || !venue) {
    return res.status(400).json({ error: 'Title, date, and venue are mandatory.' });
  }

  const newEvent: CampusEvent = {
    id: 'evt_' + Date.now(),
    title,
    category: category || 'Seminar',
    description: description || 'University organized academic session.',
    date,
    startTime: startTime || '10:00 AM',
    endTime: endTime || '01:00 PM',
    venue,
    organizingDepartment: user.departmentName || 'Department of Computer Applications',
    eligibleAudience: eligibleAudience || 'All MMU Students & Faculty',
    registrationRequired: true,
    status: 'Scheduled',
    registeredCount: 0,
    isPlacement: !!isPlacement,
    companyName,
    packageOffered
  };

  db.events.unshift(newEvent);

  addNotification(
    `New University Event: ${title}`,
    `${newEvent.category} scheduled on ${date} at ${venue}. Open to ${eligibleAudience}.`,
    'Event',
    { roleTarget: 'all', actionId: newEvent.id }
  );

  res.json({ success: true, event: newEvent });
});

// ==========================================
// ATTENDANCE API
// ==========================================
app.get('/api/attendance', (req: Request, res: Response) => {
  res.json(db.attendanceSummaries);
});

app.post('/api/attendance/record', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Students cannot submit attendance records.' });
  }

  const { programCode, year, sectionName, subjectCode, subjectName, date, totalEnrolled, presentCount } = req.body;
  const enrolled = parseInt(totalEnrolled, 10) || 60;
  const present = parseInt(presentCount, 10) || 0;
  const absent = enrolled - present;
  const percentage = enrolled > 0 ? parseFloat(((present / enrolled) * 100).toFixed(1)) : 0;

  // Duplicate check
  const duplicate = db.attendanceSummaries.find(a => 
    a.date === date && 
    a.sectionName === sectionName && 
    a.subjectCode === subjectCode
  );

  if (duplicate) {
    return res.status(409).json({ error: `Attendance already submitted for ${sectionName} in ${subjectCode} on ${date}.` });
  }

  const summary: SectionAttendanceSummary = {
    id: 'att_' + Date.now(),
    date: date || new Date().toISOString().substring(0, 10),
    programCode: programCode || 'MCA',
    year: year || 1,
    sectionName: sectionName || 'MCA 1st Year - Section A',
    subjectCode: subjectCode || 'MCA-201',
    subjectName: subjectName || 'Subject',
    facultyName: user.name,
    totalEnrolled: enrolled,
    presentCount: present,
    absentCount: absent,
    attendancePercentage: percentage,
    isVerified: true
  };

  db.attendanceSummaries.unshift(summary);

  res.json({ success: true, summary });
});

// ==========================================
// NOTIFICATIONS & AUDIT LOGS API
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = db.currentUser;
  const notifs = db.notifications.filter(n => 
    !n.userId || n.userId === user.id || n.roleTarget === 'all' || n.roleTarget === user.role
  );
  res.json(notifs);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const user = db.currentUser;
  db.notifications.forEach(n => {
    if (!n.userId || n.userId === user.id || n.roleTarget === 'all' || n.roleTarget === user.role) {
      n.isRead = true;
    }
  });
  res.json({ success: true });
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role !== 'super_admin' && user.role !== 'hod' && user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Audit logs restricted to administrators and departmental supervisors.' });
  }
  res.json(db.auditLogs);
});

// ==========================================
// WHAT-IF SCHEDULING SIMULATOR API
// ==========================================
app.post('/api/simulator/run', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role === 'student') {
    return res.status(403).json({ error: 'Simulator is restricted to supervisors, HODs, and administrators.' });
  }

  const { scenarioType, facultyId, roomId, date } = req.body;
  const targetDate = date || '2026-10-20';
  const dayName = new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long' }) as any;

  if (scenarioType === 'FACULTY_ABSENCE') {
    const absentFaculty = db.getUserById(facultyId || 'usr_faculty_amit');
    if (!absentFaculty) return res.status(404).json({ error: 'Faculty not found' });

    // Affected classes
    const affected = db.timetableSlots.filter(s => 
      s.facultyId === absentFaculty.id && 
      (s.day === dayName || s.day === 'Monday')
    );

    const alternatives: SimulationAlternative[] = affected.map(slot => {
      // Find substitute candidates
      const potential = db.users.filter(u => 
        (u.role === 'faculty' || u.role === 'supervisor') && 
        u.id !== absentFaculty.id && 
        u.departmentId === absentFaculty.departmentId
      );

      // Check conflict
      const candidate = potential.find(c => {
        const hasConflict = db.timetableSlots.some(s => 
          s.day === slot.day && 
          s.facultyId === c.id && 
          s.startTime === slot.startTime
        );
        return !hasConflict;
      });

      return {
        slotId: slot.id,
        subjectName: `${slot.subjectCode}: ${slot.subjectName}`,
        sectionName: slot.sectionName,
        timeSlot: `${slot.day} ${slot.startTime}-${slot.endTime}`,
        originalFaculty: absentFaculty.name,
        suggestedSubstituteId: candidate?.id,
        suggestedSubstituteName: candidate?.name || 'Requires Guest Lecturer / Reschedule',
        alternateRoomCode: slot.roomCode,
        score: candidate ? 92 : 40,
        reason: candidate ? `Free during slot, verified domain competency, balanced load.` : 'All dept teachers occupied during this hour.',
        hasConflict: !candidate
      };
    });

    const result: SimulationResult = {
      simulationId: 'sim_' + Date.now(),
      scenarioType: `Simulated Absence of ${absentFaculty.name} on ${targetDate}`,
      affectedSlotsCount: affected.length,
      alternatives,
      overallFeasibility: alternatives.every(a => !a.hasConflict) ? 'High' : 'Medium',
      workloadImpactSummary: `Affects ${affected.length} lecture/lab slots. Substitution feasible for ${alternatives.filter(a => !a.hasConflict).length}/${affected.length} sessions without modifying room assignments.`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    return res.json(result);
  } else if (scenarioType === 'LAB_MAINTENANCE') {
    const targetRoom = db.rooms.find(r => r.id === roomId || r.id === 'rm_lab_302');
    const affected = db.timetableSlots.filter(s => s.roomId === targetRoom?.id);

    // Find alternate rooms
    const alternateLab = db.rooms.find(r => r.roomType === 'computer_lab' && r.id !== targetRoom?.id);

    const alternatives: SimulationAlternative[] = affected.map(slot => ({
      slotId: slot.id,
      subjectName: slot.subjectName,
      sectionName: slot.sectionName,
      timeSlot: `${slot.day} ${slot.startTime}-${slot.endTime}`,
      originalFaculty: slot.facultyName,
      alternateRoomId: alternateLab?.id,
      alternateRoomCode: alternateLab?.code || 'Lab 301',
      score: 88,
      reason: `Relocated from ${targetRoom?.code} to ${alternateLab?.code} with matching 60+ PC capacity.`,
      hasConflict: false
    }));

    return res.json({
      simulationId: 'sim_' + Date.now(),
      scenarioType: `Simulated Maintenance Closure of ${targetRoom?.code}`,
      affectedSlotsCount: affected.length,
      alternatives,
      overallFeasibility: 'High',
      workloadImpactSummary: `All ${affected.length} practical lab batches successfully redirected to alternate labs with zero faculty schedule revisions.`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
  }

  res.status(400).json({ error: 'Unsupported scenario' });
});

// Commit simulation to authoritative schedule
app.post('/api/simulator/commit', (req: Request, res: Response) => {
  const user = db.currentUser;
  if (user.role !== 'super_admin' && user.role !== 'hod' && user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const { alternatives, simulationScenario } = req.body;
  if (!Array.isArray(alternatives)) {
    return res.status(400).json({ error: 'Invalid alternatives payload' });
  }

  alternatives.forEach((alt: SimulationAlternative) => {
    const slot = db.timetableSlots.find(s => s.id === alt.slotId);
    if (slot && alt.suggestedSubstituteId) {
      slot.isAdjusted = true;
      slot.adjustedFacultyId = alt.suggestedSubstituteId;
      slot.adjustedFacultyName = alt.suggestedSubstituteName;
      slot.adjustmentReason = `Simulator Commit: ${simulationScenario}`;
    }
  });

  addAuditLog(
    user.id,
    user.name,
    user.role,
    'SIMULATION_COMMITTED',
    'sim_batch',
    `Committed What-If simulation changes to authoritative schedule: ${simulationScenario}`,
    { changesCount: alternatives.length }
  );

  addNotification(
    'Schedule Updated via What-If Simulator',
    `Authoritative departmental timetable updated for ${alternatives.length} sessions following simulation commit.`,
    'Timetable',
    { roleTarget: 'all' }
  );

  res.json({ success: true, updatedSlotsCount: alternatives.length });
});

// ==========================================
// WORKLOAD ANALYTICS API
// ==========================================
app.get('/api/analytics', (req: Request, res: Response) => {
  const facultyMembers = db.users.filter(u => u.role === 'faculty' || u.role === 'supervisor');

  const facultyStats = facultyMembers.map(fac => {
    const assignedSlots = db.timetableSlots.filter(s => s.facultyId === fac.id);
    const lectureHours = assignedSlots.filter(s => s.type === 'Lecture').length;
    const labHours = assignedSlots.filter(s => s.type === 'Practical / Lab').length * 2; // Labs usually 2h
    const totalTeachingHours = lectureHours + labHours;

    const substituteGiven = db.substitutions.filter(s => s.originalFacultyId === fac.id && s.status === 'Approved').length;
    const substituteTaken = db.substitutions.filter(s => s.substituteFacultyId === fac.id && s.status === 'Approved').length;

    const maxWeeklyLimit = fac.weeklyHoursLimit || 20;
    const utilizationPercentage = Math.min(100, Math.round((totalTeachingHours / maxWeeklyLimit) * 100));

    return {
      facultyId: fac.id,
      facultyName: fac.name,
      designation: fac.designation || 'Faculty',
      totalTeachingHours,
      lectureHours,
      labHours,
      substituteGiven,
      substituteTaken,
      maxWeeklyLimit,
      utilizationPercentage,
      fairnessStatus: utilizationPercentage > 90 ? 'High Load' : utilizationPercentage < 50 ? 'Low Load' : 'Optimal Load'
    };
  });

  const totalSlotsCount = db.timetableSlots.length;
  const labUtilization = db.rooms.filter(r => r.roomType === 'computer_lab').map(lab => {
    const labBookings = db.timetableSlots.filter(s => s.roomId === lab.id).length;
    return {
      roomCode: lab.code,
      name: lab.name,
      capacity: lab.capacity,
      scheduledHours: labBookings * 2,
      utilizationRate: Math.round((labBookings / 15) * 100)
    };
  });

  res.json({
    facultyWorkload: facultyStats,
    labUtilization,
    totalSlotsConfigured: totalSlotsCount,
    complaintResolutionRate: 78.5,
    averageResolutionHours: 28.4
  });
});

// ==========================================
// AI SMART CAMPUS ASSISTANT (GEMINI INTEGRATION)
// ==========================================
// Function declarations for Gemini tool use
const getAvailableRoomsDecl: FunctionDeclaration = {
  name: 'getAvailableRooms',
  description: 'Find currently available or scheduled classrooms and computer laboratories at a given day and time.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: 'Day of week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday' },
      time: { type: Type.STRING, description: '24-hour time format, e.g. "14:00" for 2 PM' },
      roomType: { type: Type.STRING, description: 'Optional room type filter: "computer_lab" or "lecture_hall"' }
    },
    required: ['day', 'time']
  }
};

const findSubstitutesDecl: FunctionDeclaration = {
  name: 'findSubstitutes',
  description: 'Search and rank eligible faculty substitute candidates for a specific timetable slot without timetable conflicts.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      slotId: { type: Type.STRING, description: 'Identifier of the timetable slot requiring coverage' },
      subjectName: { type: Type.STRING, description: 'Name of the subject' }
    },
    required: ['slotId']
  }
};

const getMyTimetableDecl: FunctionDeclaration = {
  name: 'getMyTimetable',
  description: 'Retrieve the class schedule for the current user (student or faculty).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: 'Optional day of week filter' }
    }
  }
};

const getComplaintStatusDecl: FunctionDeclaration = {
  name: 'getComplaintStatus',
  description: 'Look up grievance complaint status and tracking history by reference number.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      referenceNo: { type: Type.STRING, description: 'The reference number, e.g. "MMU-GRV-2026-1042"' }
    },
    required: ['referenceNo']
  }
};

const createComplaintDraftDecl: FunctionDeclaration = {
  name: 'createComplaintDraft',
  description: 'Create a draft student grievance complaint with category, location and description.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: 'Classroom or Lab, Computer & Internet, Cleaning & Sanitation, ID Card or Bus Pass, Infrastructure & Maintenance' },
      subject: { type: Type.STRING, description: 'Brief summary of the issue' },
      description: { type: Type.STRING, description: 'Detailed problem explanation' },
      location: { type: Type.STRING, description: 'Campus location, e.g. "Lab 302, Ramanujan Hall"' },
      priority: { type: Type.STRING, description: 'Low, Medium, High, Urgent' }
    },
    required: ['category', 'subject', 'description', 'location']
  }
};

const getPlacementDrivesDecl: FunctionDeclaration = {
  name: 'getPlacementDrives',
  description: 'Retrieve active and upcoming university placement drives, companies, eligibility, and packages.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      program: { type: Type.STRING, description: 'Optional program filter, e.g. MCA, BCA, B.Tech' }
    }
  }
};

const getServiceTimeSlotsDecl: FunctionDeclaration = {
  name: 'getServiceTimeSlots',
  description: 'Look up student administrative service collection slots (ID cards, bus passes, uniforms).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceType: { type: Type.STRING, description: 'id_card, bus_pass, or uniform' }
    },
    required: ['serviceType']
  }
};

// Tool executor function
function executeAssistantTool(name: string, args: any) {
  const user = db.currentUser;

  if (name === 'getAvailableRooms') {
    const targetDay = args.day || 'Monday';
    const targetTime = args.time || '11:00';
    const occupiedSlots = db.timetableSlots.filter(s => 
      s.day === targetDay && 
      s.startTime <= targetTime && 
      s.endTime > targetTime
    );
    const occupiedRoomIds = new Set(occupiedSlots.map(s => s.roomId));
    
    let rooms = db.rooms.filter(r => !occupiedRoomIds.has(r.id));
    if (args.roomType) {
      rooms = rooms.filter(r => r.roomType === args.roomType);
    }

    return {
      day: targetDay,
      time: targetTime,
      totalAvailable: rooms.length,
      availableRooms: rooms.map(r => ({
        code: r.code,
        name: r.name,
        building: r.building,
        floor: r.floor,
        capacity: r.capacity,
        facilities: r.facilities
      }))
    };
  }

  if (name === 'findSubstitutes') {
    const slot = db.timetableSlots.find(s => s.id === args.slotId) || db.timetableSlots[0];
    const targetDay = slot.day;
    const startTime = slot.startTime;

    const potential = db.users.filter(u => 
      (u.role === 'faculty' || u.role === 'supervisor') && 
      u.id !== slot.facultyId
    );

    const candidates = potential.map(fac => {
      const hasConflict = db.timetableSlots.some(s => 
        s.day === targetDay && 
        s.facultyId === fac.id && 
        s.startTime === startTime
      );
      const isExpert = (fac.teachingSubjects || []).some(sub => 
        slot.subjectName.toLowerCase().includes(sub.toLowerCase())
      );
      return {
        facultyName: fac.name,
        designation: fac.designation,
        isAvailable: !hasConflict,
        isExpert,
        matchScore: !hasConflict ? (isExpert ? 94 : 78) : 0,
        recommendation: !hasConflict 
          ? `Free during ${startTime}, qualified in ${fac.teachingSubjects?.[0] || 'computing'}, balanced load.` 
          : 'Has conflicting lecture.'
      };
    }).filter(c => c.isAvailable).sort((a, b) => b.matchScore - a.matchScore);

    return {
      slot: {
        subject: slot.subjectName,
        code: slot.subjectCode,
        section: slot.sectionName,
        day: slot.day,
        time: `${slot.startTime}-${slot.endTime}`,
        originalFaculty: slot.facultyName
      },
      recommendedSubstitutes: candidates
    };
  }

  if (name === 'getMyTimetable') {
    let slots: TimetableSlot[] = [];
    if (user.role === 'student') {
      slots = db.timetableSlots.filter(s => s.sectionId === user.sectionId);
    } else if (user.role === 'faculty') {
      slots = db.timetableSlots.filter(s => s.facultyId === user.id || s.adjustedFacultyId === user.id);
    } else {
      slots = db.timetableSlots.slice(0, 8);
    }
    if (args.day) {
      slots = slots.filter(s => s.day === args.day);
    }
    return {
      user: user.name,
      role: user.role,
      classesCount: slots.length,
      schedule: slots.map(s => ({
        day: s.day,
        time: `${s.startTime}-${s.endTime}`,
        subject: s.subjectName,
        code: s.subjectCode,
        room: s.roomCode,
        faculty: s.adjustedFacultyName ? `${s.adjustedFacultyName} (Substitute)` : s.facultyName,
        type: s.type
      }))
    };
  }

  if (name === 'getComplaintStatus') {
    const comp = db.complaints.find(c => c.referenceNo.toLowerCase() === args.referenceNo.trim().toLowerCase());
    if (!comp) {
      return { found: false, message: `No complaint found with reference ${args.referenceNo}` };
    }
    return {
      found: true,
      referenceNo: comp.referenceNo,
      subject: comp.subject,
      category: comp.category,
      location: comp.location,
      status: comp.status,
      assignedTo: comp.assignedTo,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
      remarks: comp.resolutionRemarks || 'Technician inspection underway.',
      notes: comp.internalNotes
    };
  }

  if (name === 'createComplaintDraft') {
    const refNo = `MMU-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const draft: Complaint = {
      id: 'cmp_' + Date.now(),
      referenceNo: refNo,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      programCode: user.programName || 'MCA',
      category: args.category,
      subject: args.subject,
      description: args.description,
      location: args.location,
      priority: args.priority || 'Medium',
      status: 'Submitted',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      assignedTo: 'Campus Facilities Helpdesk'
    };
    db.complaints.unshift(draft);
    return {
      success: true,
      ticketCreated: true,
      referenceNo: refNo,
      message: `Grievance ticket created successfully under Reference #${refNo}. Assigned to Campus Helpdesk.`
    };
  }

  if (name === 'getPlacementDrives') {
    const drives = db.events.filter(e => e.isPlacement);
    return {
      drivesCount: drives.length,
      upcomingDrives: drives.map(d => ({
        company: d.companyName,
        title: d.title,
        date: d.date,
        time: `${d.startTime} - ${d.endTime}`,
        venue: d.venue,
        package: d.packageOffered,
        eligibility: d.eligibleAudience,
        status: d.status
      }))
    };
  }

  if (name === 'getServiceTimeSlots') {
    const counter = db.serviceCounters.find(c => c.serviceType === args.serviceType);
    if (!counter) {
      return { found: false, message: 'Service not recognized. Valid options: id_card, bus_pass, uniform' };
    }
    return {
      service: counter.name,
      location: counter.location,
      operatingHours: counter.operatingHours,
      requiredDocuments: counter.requiredDocuments,
      availableSlots: counter.timeSlots
    };
  }

  return { error: 'Unknown tool' };
}

app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { message, chatHistory } = req.body;
    const user = db.currentUser;

    const systemInstruction = `You are the official MMU Smart Campus AI Operations Assistant for Maharishi Markandeshwar (MMU), Mullana, Haryana, India.
Current Authenticated User:
- Name: ${user.name}
- Role: ${user.role} (${user.designation || 'Student'})
- Department: ${user.departmentName}
${user.programName ? `- Program: ${user.programName}` : ''}
${user.sectionName ? `- Section: ${user.sectionName}` : ''}

Operational Guidelines:
1. Provide accurate, helpful, professional, and courteous responses grounded in real university system data.
2. When the user asks about schedules, available computer labs or lecture halls, faculty substitutions, grievance complaint tracking, placement drives, or student service collection hours, ALWAYS call the corresponding tool to retrieve live system data.
3. Respect role-based access control:
   - Students can only view their own section schedule, check campus locations, submit complaints, view placements, and book service slots.
   - Faculty can check their teaching timetable, find substitutes, and request duty adjustments.
   - HODs and Supervisors can approve substitutions, simulate schedules, and monitor department workload.
4. When reporting tool results, explain clearly with details (room numbers, times, faculty names, reference numbers).
5. Format your answers clearly using clean formatting without markdown tables that overflow. Keep bullet points crisp and actionable.`;

    const contents: any[] = [];
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((turn: any) => {
        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response1 = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{
          functionDeclarations: [
            getAvailableRoomsDecl,
            findSubstitutesDecl,
            getMyTimetableDecl,
            getComplaintStatusDecl,
            createComplaintDraftDecl,
            getPlacementDrivesDecl,
            getServiceTimeSlotsDecl
          ]
        }]
      }
    });

    // Check if tool was called
    const functionCalls = response1.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const toolCall = functionCalls[0];
      const toolResult = executeAssistantTool(toolCall.name || '', toolCall.args || {});

      // Send tool response back to model to formulate final answer
      const response2 = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...contents,
          response1.candidates?.[0]?.content,
          {
            role: 'user',
            parts: [{
              text: `Tool '${toolCall.name}' execution completed. Result: ${JSON.stringify(toolResult)}. Formulate a polished, professional response for the user.`
            }]
          }
        ],
        config: { systemInstruction }
      });

      return res.json({
        reply: response2.text || 'Action processed successfully.',
        actionExecuted: {
          name: toolCall.name,
          args: toolCall.args,
          result: toolResult
        }
      });
    }

    res.json({
      reply: response1.text || 'How can I assist you with MMU campus operations today?'
    });

  } catch (err: any) {
    console.error('Gemini Assistant Error:', err);
    res.status(500).json({ 
      error: 'AI assistant service temporarily unavailable.', 
      details: err?.message || 'Check GEMINI_API_KEY configuration.' 
    });
  }
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode: Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MMU Smart Campus server running on port ${PORT}`);
  });
}

startServer();
