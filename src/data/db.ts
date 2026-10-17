import { 
  User, Department, AcademicProgram, Section, Room, 
  TimetableSlot, SubstitutionRequest, FacultyLeave, 
  StudentServiceCounter, StudentServiceBooking, 
  Complaint, CampusEvent, SectionAttendanceSummary, 
  NotificationItem, AuditLogItem, DayOfWeek, UserRole
} from '../types';

export class CampusDatabase {
  users: User[] = [
    {
      id: 'usr_admin',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@mmu.ac.in',
      role: 'super_admin',
      departmentId: 'dept_admin',
      departmentName: 'Academic Affairs Administration',
      designation: 'Dean of Academic Affairs',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      cabin: 'Admin Block, Room 101'
    },
    {
      id: 'usr_supervisor',
      name: 'Prof. Vikram Mehta',
      email: 'vikram.mehta@mmu.ac.in',
      role: 'supervisor',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      designation: 'Timetable Coordinator & Associate Professor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      cabin: 'Ramanujan Hall, Room 204 (Cabin C-4)',
      teachingSubjects: ['Cloud Computing', 'Computer Networks'],
      weeklyHoursLimit: 18
    },
    {
      id: 'usr_hod',
      name: 'Dr. Ananya Sen',
      email: 'ananya.sen@mmu.ac.in',
      role: 'hod',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      designation: 'Head of Department & Professor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      cabin: 'Ramanujan Hall, Room 102 (HOD Office)',
      teachingSubjects: ['Data Structures & Algorithms', 'Research Methodology'],
      weeklyHoursLimit: 14
    },
    {
      id: 'usr_faculty_amit',
      name: 'Dr. Amit Verma',
      email: 'amit.verma@mmu.ac.in',
      role: 'faculty',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      designation: 'Associate Professor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      cabin: 'Ramanujan Hall, Room 204 (Desk F-12)',
      teachingSubjects: ['Advanced Data Structures', 'Machine Learning', 'Python Programming'],
      weeklyHoursLimit: 20
    },
    {
      id: 'usr_faculty_sunita',
      name: 'Dr. Sunita Rao',
      email: 'sunita.rao@mmu.ac.in',
      role: 'faculty',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      designation: 'Assistant Professor (Senior Scale)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      cabin: 'Ramanujan Hall, Room 204 (Desk F-08)',
      teachingSubjects: ['Database Management Systems', 'Advanced Data Structures', 'SQL & NoSQL'],
      weeklyHoursLimit: 20
    },
    {
      id: 'usr_faculty_rohit',
      name: 'Prof. Rohit Kumar',
      email: 'rohit.kumar@mmu.ac.in',
      role: 'faculty',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      designation: 'Assistant Professor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      cabin: 'Ramanujan Hall, Room 204 (Desk F-03)',
      teachingSubjects: ['Full-Stack Web Development', 'Software Engineering', 'React & Node.js'],
      weeklyHoursLimit: 20
    },
    {
      id: 'usr_faculty_neha',
      name: 'Dr. Neha Kapoor',
      email: 'neha.kapoor@mmu.ac.in',
      role: 'faculty',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      designation: 'Assistant Professor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
      cabin: 'Ramanujan Hall, Room 204 (Desk F-15)',
      teachingSubjects: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
      weeklyHoursLimit: 20
    },
    {
      id: 'usr_student_ayush',
      name: 'Ayush Sati',
      email: 'ayushsati019@gmail.com',
      role: 'student',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      programId: 'prog_mca',
      programName: 'Master of Computer Applications (MCA)',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      phone: '+91 98765 43210'
    },
    {
      id: 'usr_student_priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@student.mmu.ac.in',
      role: 'student',
      departmentId: 'dept_ca',
      departmentName: 'Department of Computer Applications',
      programId: 'prog_bca',
      programName: 'Bachelor of Computer Applications (BCA)',
      sectionId: 'sec_bca_2b',
      sectionName: 'BCA 2nd Year - Section B',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      phone: '+91 98123 45678'
    }
  ];

  departments: Department[] = [
    {
      id: 'dept_ca',
      name: 'Department of Computer Applications',
      code: 'DCA',
      buildingId: 'bld_ramanujan',
      hodName: 'Dr. Ananya Sen',
      totalFaculty: 24,
      totalStudents: 580
    },
    {
      id: 'dept_cse',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
      buildingId: 'bld_aryabhata',
      hodName: 'Dr. Sanjeev Gupta',
      totalFaculty: 42,
      totalStudents: 1120
    },
    {
      id: 'dept_mgmt',
      name: 'Department of Management Studies',
      code: 'DMS',
      buildingId: 'bld_management',
      hodName: 'Dr. Ritu Singhal',
      totalFaculty: 18,
      totalStudents: 450
    }
  ];

  programs: AcademicProgram[] = [
    {
      id: 'prog_mca',
      departmentId: 'dept_ca',
      name: 'Master of Computer Applications',
      code: 'MCA',
      durationYears: 2,
      currentSemesters: [1, 2, 3, 4]
    },
    {
      id: 'prog_bca',
      departmentId: 'dept_ca',
      name: 'Bachelor of Computer Applications',
      code: 'BCA',
      durationYears: 3,
      currentSemesters: [1, 2, 3, 4, 5, 6]
    },
    {
      id: 'prog_bsc_ai',
      departmentId: 'dept_ca',
      name: 'B.Sc. Artificial Intelligence & Machine Learning',
      code: 'B.Sc AI/ML',
      durationYears: 3,
      currentSemesters: [1, 2, 3, 4]
    }
  ];

  sections: Section[] = [
    {
      id: 'sec_mca_1a',
      programId: 'prog_mca',
      programCode: 'MCA',
      year: 1,
      semester: 2,
      name: 'MCA 1st Year - Section A',
      enrolledStudents: 60,
      classRepresentative: 'Ayush Sati'
    },
    {
      id: 'sec_mca_1b',
      programId: 'prog_mca',
      programCode: 'MCA',
      year: 1,
      semester: 2,
      name: 'MCA 1st Year - Section B',
      enrolledStudents: 58,
      classRepresentative: 'Aakash Verma'
    },
    {
      id: 'sec_bca_2a',
      programId: 'prog_bca',
      programCode: 'BCA',
      year: 2,
      semester: 4,
      name: 'BCA 2nd Year - Section A',
      enrolledStudents: 65,
      classRepresentative: 'Rohan Mittal'
    },
    {
      id: 'sec_bca_2b',
      programId: 'prog_bca',
      programCode: 'BCA',
      year: 2,
      semester: 4,
      name: 'BCA 2nd Year - Section B',
      enrolledStudents: 62,
      classRepresentative: 'Priya Sharma'
    },
    {
      id: 'sec_bsc_ai_1',
      programId: 'prog_bsc_ai',
      programCode: 'B.Sc AI/ML',
      year: 1,
      semester: 2,
      name: 'B.Sc AI/ML 1st Year - Sec A',
      enrolledStudents: 45,
      classRepresentative: 'Divya Khurana'
    }
  ];

  rooms: Room[] = [
    {
      id: 'rm_lab_302',
      code: 'Lab 302',
      name: 'Advanced Computing & AI Laboratory',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 3,
      roomType: 'computer_lab',
      capacity: 65,
      departmentId: 'dept_ca',
      facilities: ['65 Intel i7 Workstations', 'GPU Cluster Access', 'Dual Gigabit Ethernet', 'Centralized UPS'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_lab_301',
      code: 'Lab 301',
      name: 'Full-Stack Software Engineering Lab',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 3,
      roomType: 'computer_lab',
      capacity: 60,
      departmentId: 'dept_ca',
      facilities: ['60 Intel i5 Workstations', 'Overhead 4K Projector', 'Interactive Smart Screen'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_lab_201',
      code: 'Lab 201',
      name: 'Database & Cloud Systems Lab',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 2,
      roomType: 'computer_lab',
      capacity: 55,
      departmentId: 'dept_ca',
      facilities: ['Oracle & PostgreSQL Sandbox', 'Network Racks', 'Smart Audio System'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_lh_105',
      code: 'LH-105',
      name: 'Smart Lecture Amphitheatre 105',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 1,
      roomType: 'lecture_hall',
      capacity: 80,
      departmentId: 'dept_ca',
      facilities: ['Tiered Seating', 'Dual Laser Projector', 'Lapel Microphones', 'Central AC'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_lh_106',
      code: 'LH-106',
      name: 'Lecture Hall 106',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 1,
      roomType: 'lecture_hall',
      capacity: 75,
      departmentId: 'dept_ca',
      facilities: ['Projector', 'Podium Mic', 'Surround Sound'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_lh_205',
      code: 'LH-205',
      name: 'Smart Lecture Hall 205',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 2,
      roomType: 'lecture_hall',
      capacity: 70,
      departmentId: 'dept_ca',
      facilities: ['Smart Board', 'Acoustic Wall Paneling', 'AC'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_hod_102',
      code: 'Room 102',
      name: 'Head of Department Office (DCA)',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 1,
      roomType: 'hod_office',
      capacity: 12,
      departmentId: 'dept_ca',
      facilities: ['Meeting Conference Table', 'Display Screen', 'Document Vault'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_staff_204',
      code: 'Room 204',
      name: 'Department Faculty Lounge & Staff Room',
      building: 'Academic Block 1 (Ramanujan Hall)',
      floor: 2,
      roomType: 'staff_room',
      capacity: 35,
      departmentId: 'dept_ca',
      facilities: ['24 Faculty Workstations', 'Discussion Pods', 'Pantry & Coffee Counter', 'Lockers'],
      hasProjector: false,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_sem_aryabhata',
      code: 'Auditorium A',
      name: 'Aryabhata Central Seminar Hall',
      building: 'Academic Block 2 (Aryabhata Hall)',
      floor: 1,
      roomType: 'seminar_hall',
      capacity: 250,
      facilities: ['Conference Stage', 'Dual LED Video Walls', 'Dolby Audio', 'Video Conferencing Kit'],
      hasProjector: true,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_admin_counter3',
      code: 'Counter 3',
      name: 'Student ID & Registration Service Counter',
      building: 'Administrative Block',
      floor: 1,
      roomType: 'admin_office',
      capacity: 20,
      facilities: ['Biometric Scanners', 'PVC Card Printers', 'Queue Display'],
      hasProjector: false,
      hasAC: true,
      isAccessible: true
    },
    {
      id: 'rm_transport_counter1',
      code: 'Counter 1 (Transport)',
      name: 'University Bus Pass & Logistics Cell',
      building: 'Administrative Block',
      floor: 1,
      roomType: 'admin_office',
      capacity: 15,
      facilities: ['RFID Token Programmer', 'Route Scheduling Terminal'],
      hasProjector: false,
      hasAC: false,
      isAccessible: true
    }
  ];

  timetableSlots: TimetableSlot[] = [
    // Monday
    {
      id: 'slot_mon_09_mca_a',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      subjectCode: 'MCA-201',
      subjectName: 'Advanced Data Structures & Algorithms',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_mon_10_mca_a',
      day: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      subjectCode: 'MCA-202',
      subjectName: 'Database Management Systems & NoSQL',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_sunita',
      facultyName: 'Dr. Sunita Rao',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_mon_11_mca_a',
      day: 'Monday',
      startTime: '11:00',
      endTime: '13:00',
      subjectCode: 'MCA-205P',
      subjectName: 'Machine Learning & Python Practical Lab',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      roomId: 'rm_lab_302',
      roomCode: 'Lab 302',
      type: 'Practical / Lab'
    },
    {
      id: 'slot_mon_14_mca_a',
      day: 'Monday',
      startTime: '14:00',
      endTime: '15:00',
      subjectCode: 'MCA-203',
      subjectName: 'Full-Stack Web Engineering',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_rohit',
      facultyName: 'Prof. Rohit Kumar',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_mon_15_mca_a',
      day: 'Monday',
      startTime: '15:00',
      endTime: '16:00',
      subjectCode: 'MCA-204',
      subjectName: 'Artificial Intelligence & Neural Nets',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_neha',
      facultyName: 'Dr. Neha Kapoor',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    // Monday BCA & MCA B
    {
      id: 'slot_mon_09_mca_b',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      subjectCode: 'MCA-202',
      subjectName: 'Database Management Systems & NoSQL',
      sectionId: 'sec_mca_1b',
      sectionName: 'MCA 1st Year - Section B',
      programCode: 'MCA',
      facultyId: 'usr_faculty_sunita',
      facultyName: 'Dr. Sunita Rao',
      roomId: 'rm_lh_106',
      roomCode: 'LH-106',
      type: 'Lecture'
    },
    {
      id: 'slot_mon_11_bca_2b',
      day: 'Monday',
      startTime: '11:00',
      endTime: '12:00',
      subjectCode: 'BCA-401',
      subjectName: 'Object Oriented Programming with Java',
      sectionId: 'sec_bca_2b',
      sectionName: 'BCA 2nd Year - Section B',
      programCode: 'BCA',
      facultyId: 'usr_faculty_rohit',
      facultyName: 'Prof. Rohit Kumar',
      roomId: 'rm_lh_205',
      roomCode: 'LH-205',
      type: 'Lecture'
    },
    // Tuesday
    {
      id: 'slot_tue_09_mca_a',
      day: 'Tuesday',
      startTime: '09:00',
      endTime: '10:00',
      subjectCode: 'MCA-203',
      subjectName: 'Full-Stack Web Engineering',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_rohit',
      facultyName: 'Prof. Rohit Kumar',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_tue_10_mca_a',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '11:00',
      subjectCode: 'MCA-201',
      subjectName: 'Advanced Data Structures & Algorithms',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_tue_11_mca_a',
      day: 'Tuesday',
      startTime: '11:00',
      endTime: '13:00',
      subjectCode: 'MCA-206P',
      subjectName: 'Cloud & DevOps Lab',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_supervisor',
      facultyName: 'Prof. Vikram Mehta',
      roomId: 'rm_lab_301',
      roomCode: 'Lab 301',
      type: 'Practical / Lab'
    },
    {
      id: 'slot_tue_14_mca_a',
      day: 'Tuesday',
      startTime: '14:00',
      endTime: '15:00',
      subjectCode: 'MCA-204',
      subjectName: 'Artificial Intelligence & Neural Nets',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_neha',
      facultyName: 'Dr. Neha Kapoor',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    // Wednesday
    {
      id: 'slot_wed_09_mca_a',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '10:00',
      subjectCode: 'MCA-202',
      subjectName: 'Database Management Systems & NoSQL',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_sunita',
      facultyName: 'Dr. Sunita Rao',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_wed_10_mca_a',
      day: 'Wednesday',
      startTime: '10:00',
      endTime: '11:00',
      subjectCode: 'MCA-201',
      subjectName: 'Advanced Data Structures & Algorithms',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_wed_11_mca_a',
      day: 'Wednesday',
      startTime: '11:00',
      endTime: '12:00',
      subjectCode: 'MCA-204',
      subjectName: 'Artificial Intelligence & Neural Nets',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_neha',
      facultyName: 'Dr. Neha Kapoor',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_wed_14_mca_a',
      day: 'Wednesday',
      startTime: '14:00',
      endTime: '16:00',
      subjectCode: 'MCA-207P',
      subjectName: 'Web & Mobile Dev Laboratory',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_rohit',
      facultyName: 'Prof. Rohit Kumar',
      roomId: 'rm_lab_301',
      roomCode: 'Lab 301',
      type: 'Practical / Lab'
    },
    // Thursday
    {
      id: 'slot_thu_09_mca_a',
      day: 'Thursday',
      startTime: '09:00',
      endTime: '10:00',
      subjectCode: 'MCA-203',
      subjectName: 'Full-Stack Web Engineering',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_rohit',
      facultyName: 'Prof. Rohit Kumar',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_thu_10_mca_a',
      day: 'Thursday',
      startTime: '10:00',
      endTime: '11:00',
      subjectCode: 'MCA-202',
      subjectName: 'Database Management Systems & NoSQL',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_sunita',
      facultyName: 'Dr. Sunita Rao',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_thu_11_mca_a',
      day: 'Thursday',
      startTime: '11:00',
      endTime: '12:00',
      subjectCode: 'MCA-201',
      subjectName: 'Advanced Data Structures & Algorithms',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    // Friday
    {
      id: 'slot_fri_09_mca_a',
      day: 'Friday',
      startTime: '09:00',
      endTime: '10:00',
      subjectCode: 'MCA-201',
      subjectName: 'Advanced Data Structures & Algorithms',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_fri_10_mca_a',
      day: 'Friday',
      startTime: '10:00',
      endTime: '11:00',
      subjectCode: 'MCA-204',
      subjectName: 'Artificial Intelligence & Neural Nets',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_faculty_neha',
      facultyName: 'Dr. Neha Kapoor',
      roomId: 'rm_lh_105',
      roomCode: 'LH-105',
      type: 'Lecture'
    },
    {
      id: 'slot_fri_14_mca_a',
      day: 'Friday',
      startTime: '14:00',
      endTime: '16:00',
      subjectCode: 'MCA-SEM',
      subjectName: 'Industry Tech Seminar & Project Presentation',
      sectionId: 'sec_mca_1a',
      sectionName: 'MCA 1st Year - Section A',
      programCode: 'MCA',
      facultyId: 'usr_hod',
      facultyName: 'Dr. Ananya Sen',
      roomId: 'rm_sem_aryabhata',
      roomCode: 'Auditorium A',
      type: 'Lecture'
    }
  ];

  substitutions: SubstitutionRequest[] = [
    {
      id: 'sub_req_101',
      timetableSlotId: 'slot_fri_09_mca_a',
      originalFacultyId: 'usr_faculty_amit',
      originalFacultyName: 'Dr. Amit Verma',
      substituteFacultyId: 'usr_faculty_sunita',
      substituteFacultyName: 'Dr. Sunita Rao',
      subjectName: 'Advanced Data Structures & Algorithms',
      subjectCode: 'MCA-201',
      sectionName: 'MCA 1st Year - Section A',
      roomCode: 'LH-105',
      date: '2026-10-17',
      startTime: '09:00',
      endTime: '10:00',
      reason: 'Attending University Curriculum Revision Committee meeting',
      status: 'Awaiting Approval',
      requestedAt: '2026-10-16 14:30',
      recommendationReason: 'Free during 09:00-10:00, strong Data Structures teaching expertise, balanced weekly load (14h/20h).',
      compatibilityScore: 94
    },
    {
      id: 'sub_req_102',
      timetableSlotId: 'slot_mon_10_mca_a',
      originalFacultyId: 'usr_faculty_sunita',
      originalFacultyName: 'Dr. Sunita Rao',
      substituteFacultyId: 'usr_faculty_rohit',
      substituteFacultyName: 'Prof. Rohit Kumar',
      subjectName: 'Database Management Systems & NoSQL',
      subjectCode: 'MCA-202',
      sectionName: 'MCA 1st Year - Section A',
      roomCode: 'LH-105',
      date: '2026-10-12',
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Medical checkup leave',
      status: 'Approved',
      requestedAt: '2026-10-10 11:20',
      reviewedByHodAt: '2026-10-10 16:40',
      hodDecisionNotes: 'Approved by Dr. Ananya Sen (HOD). Schedule updated accordingly.',
      recommendationReason: 'Prof. Rohit Kumar is available at 10 AM on Monday with no lab conflicts.',
      compatibilityScore: 89
    }
  ];

  leaves: FacultyLeave[] = [
    {
      id: 'leave_201',
      facultyId: 'usr_faculty_amit',
      facultyName: 'Dr. Amit Verma',
      departmentId: 'dept_ca',
      startDate: '2026-10-17',
      endDate: '2026-10-17',
      leaveType: 'Duty / Conference',
      reason: 'Curriculum Board Meeting at Central Directorate',
      status: 'Approved',
      affectedSlotsCount: 1,
      affectedSlotIds: ['slot_fri_09_mca_a'],
      substitutionsAssigned: true
    },
    {
      id: 'leave_202',
      facultyId: 'usr_faculty_neha',
      facultyName: 'Dr. Neha Kapoor',
      departmentId: 'dept_ca',
      startDate: '2026-10-20',
      endDate: '2026-10-21',
      leaveType: 'Casual',
      reason: 'Family engagement',
      status: 'Pending',
      affectedSlotsCount: 3,
      affectedSlotIds: ['slot_mon_15_mca_a', 'slot_tue_14_mca_a', 'slot_wed_11_mca_a'],
      substitutionsAssigned: false
    }
  ];

  serviceCounters: StudentServiceCounter[] = [
    {
      id: 'srv_id_card',
      serviceType: 'id_card',
      name: 'Smart Student Identity Card Issuance & Validation',
      location: 'Administrative Block — Ground Floor, Counter 3',
      operatingHours: '09:30 AM – 04:30 PM (Mon–Fri)',
      dailyCapacity: 120,
      currentBooked: 84,
      requiredDocuments: [
        'Provisional Admission Slip / MMU Fee Receipt',
        'Government ID Proof (Aadhaar / Voter ID / Passport)',
        'Two Passport-size Photographs in University Dress Code'
      ],
      timeSlots: [
        {
          id: 'ts_id_mca',
          programEligibility: ['MCA', 'M.Tech CSE'],
          timeWindow: '02:00 PM – 03:00 PM',
          maxCapacity: 40,
          bookedCount: 28
        },
        {
          id: 'ts_id_bca',
          programEligibility: ['BCA'],
          timeWindow: '03:00 PM – 04:00 PM',
          maxCapacity: 40,
          bookedCount: 35
        },
        {
          id: 'ts_id_bsc',
          programEligibility: ['B.Sc AI/ML', 'B.Tech CSE'],
          timeWindow: '04:00 PM – 05:00 PM',
          maxCapacity: 40,
          bookedCount: 21
        }
      ]
    },
    {
      id: 'srv_bus_pass',
      serviceType: 'bus_pass',
      name: 'Campus Transportation & Bus Pass Dispatch',
      location: 'Administrative Block — Ground Floor, Transport Counter 1',
      operatingHours: '10:00 AM – 04:00 PM (Mon–Fri)',
      dailyCapacity: 90,
      currentBooked: 52,
      requiredDocuments: [
        'Hostel / Day Scholar verification form',
        'Bus Route Fee Paid Receipt for Current Semester',
        'Existing ID Card or Admission Letter'
      ],
      timeSlots: [
        {
          id: 'ts_bus_mca',
          programEligibility: ['MCA', 'B.Sc AI/ML'],
          timeWindow: '01:30 PM – 02:30 PM',
          maxCapacity: 30,
          bookedCount: 19
        },
        {
          id: 'ts_bus_bca',
          programEligibility: ['BCA'],
          timeWindow: '02:30 PM – 03:30 PM',
          maxCapacity: 30,
          bookedCount: 22
        },
        {
          id: 'ts_bus_eng',
          programEligibility: ['B.Tech CSE', 'Management'],
          timeWindow: '03:30 PM – 04:30 PM',
          maxCapacity: 30,
          bookedCount: 11
        }
      ]
    },
    {
      id: 'srv_uniform',
      serviceType: 'uniform',
      name: 'Official University Uniform & Blazer Distribution',
      location: 'Student Amenities Centre — Counter B (Opposite Ramanujan Hall)',
      operatingHours: '11:00 AM – 05:00 PM',
      dailyCapacity: 100,
      currentBooked: 67,
      requiredDocuments: [
        'Uniform Token slip issued during orientation',
        'Department fee payment challan'
      ],
      timeSlots: [
        {
          id: 'ts_uni_all',
          programEligibility: ['MCA', 'BCA', 'B.Sc AI/ML'],
          timeWindow: '03:00 PM – 04:30 PM',
          maxCapacity: 50,
          bookedCount: 38
        }
      ]
    }
  ];

  bookings: StudentServiceBooking[] = [
    {
      id: 'bk_1001',
      tokenNumber: 'MMU-ID-2026-084',
      studentId: 'usr_student_ayush',
      studentName: 'Ayush Sati',
      programCode: 'MCA',
      serviceType: 'id_card',
      serviceName: 'Smart Student Identity Card Issuance',
      date: '2026-10-19',
      timeWindow: '02:00 PM – 03:00 PM',
      counterLocation: 'Administrative Block — Counter 3',
      status: 'Confirmed',
      createdAt: '2026-10-15 10:14'
    }
  ];

  complaints: Complaint[] = [
    {
      id: 'cmp_1042',
      referenceNo: 'MMU-GRV-2026-1042',
      studentId: 'usr_student_ayush',
      studentName: 'Ayush Sati',
      studentEmail: 'ayushsati019@gmail.com',
      programCode: 'MCA 1st Year',
      category: 'Computer & Internet',
      subject: 'Lab 302 Ethernet wall drops #14 and #15 non-functional',
      description: 'During practical session, network drops at station 14 and 15 lost LAN connectivity. Docker container pulls and local cluster nodes failed to connect.',
      location: 'Ramanujan Hall, 3rd Floor, Lab 302 (Workstations 14 & 15)',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-10-15 14:15',
      updatedAt: '2026-10-16 09:30',
      assignedTo: 'Campus Network Operations Centre (NOC Team)',
      internalNotes: [
        '2026-10-15 16:00: Switch port 18 re-patched by technician.',
        '2026-10-16 09:30: Verifying signal continuity with Fluke cable tester.'
      ]
    },
    {
      id: 'cmp_1038',
      referenceNo: 'MMU-GRV-2026-1038',
      studentId: 'usr_student_priya',
      studentName: 'Priya Sharma',
      studentEmail: 'priya.sharma@student.mmu.ac.in',
      programCode: 'BCA 2nd Year',
      category: 'Classroom or Lab',
      subject: 'HDMI cable flickering on projector in Lecture Hall 205',
      description: 'Projector display blinks off every 4-5 minutes when presentations run. Requires replacement cable or port soldering.',
      location: 'Ramanujan Hall, 2nd Floor, LH-205',
      priority: 'Medium',
      status: 'Assigned',
      createdAt: '2026-10-14 11:20',
      updatedAt: '2026-10-15 08:45',
      assignedTo: 'AV & Classroom Technology Cell'
    },
    {
      id: 'cmp_1025',
      referenceNo: 'MMU-GRV-2026-1025',
      studentId: 'usr_student_ayush',
      studentName: 'Ayush Sati',
      studentEmail: 'ayushsati019@gmail.com',
      programCode: 'MCA 1st Year',
      category: 'Infrastructure & Maintenance',
      subject: 'Lab 301 Air conditioning duct rattling noise',
      description: 'Ceiling AC duct vibration noise during lectures makes it hard to hear the instructor in the back rows.',
      location: 'Ramanujan Hall, 3rd Floor, Lab 301',
      priority: 'Low',
      status: 'Resolved',
      createdAt: '2026-10-08 10:00',
      updatedAt: '2026-10-11 15:30',
      assignedTo: 'HVAC Maintenance Section',
      resolutionRemarks: 'Rubber vibration dampers installed on duct bracket mounting. Noise reduced to normal ambient dB.'
    }
  ];

  events: CampusEvent[] = [
    {
      id: 'evt_placement_tcs',
      title: 'TCS Digital & Prime National Campus Placement Drive 2026-27',
      category: 'Placement Drive',
      description: 'Annual flagship recruitment drive for final year MCA, BCA, and B.Tech CSE students. Roles offered: Systems Engineer, Digital Specialist Engineer, and Prime R&D.',
      date: '2026-10-28',
      startTime: '09:30 AM',
      endTime: '05:30 PM',
      venue: 'Aryabhata Central Seminar Hall & Computer Labs 301-302',
      organizingDepartment: 'Central Training & Placement Cell (T&P)',
      eligibleAudience: 'MCA 2nd Year, BCA 3rd Year, B.Tech Final Year (Min 60% with no active backlogs)',
      registrationRequired: true,
      registrationLink: 'https://placement.mmu.ac.in/drives/tcs-2026',
      status: 'Scheduled',
      registeredCount: 248,
      isPlacement: true,
      companyName: 'Tata Consultancy Services',
      packageOffered: '₹ 7.50 LPA – ₹ 11.50 LPA'
    },
    {
      id: 'evt_ai_workshop',
      title: 'State-Level Workshop: Building Agentic Workflows with Gemini & Cloud Run',
      category: 'Workshop',
      description: 'Hands-on practical workshop featuring senior cloud architects. Students will build full-stack autonomous agents, tool integrations, and real-time LLM systems.',
      date: '2026-10-22',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'Advanced Computing Lab 302, Ramanujan Hall',
      organizingDepartment: 'Department of Computer Applications',
      eligibleAudience: 'Open to all MCA, BCA, and B.Sc AI/ML students',
      registrationRequired: true,
      status: 'Scheduled',
      registeredCount: 65
    },
    {
      id: 'evt_infosys_drive',
      title: 'Infosys Specialist Programmer & DSE Recruitment Drive',
      category: 'Placement Drive',
      description: 'Online coding assessment followed by technical interviews for high-performance software developers.',
      date: '2026-11-04',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      venue: 'Online Assessment + Admin Conference Hall',
      organizingDepartment: 'Central T&P Cell',
      eligibleAudience: 'MCA & B.Tech graduates (Batch of 2026)',
      registrationRequired: true,
      status: 'Scheduled',
      registeredCount: 180,
      isPlacement: true,
      companyName: 'Infosys Ltd',
      packageOffered: '₹ 6.25 LPA – ₹ 9.50 LPA'
    },
    {
      id: 'evt_curriculum_conclave',
      title: 'University Academic Council & Curriculum Conclave 2026',
      category: 'Department Meeting',
      description: 'Review of emerging technologies course syllabi, industry partnerships, and credit structures for next academic cycle.',
      date: '2026-10-25',
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      venue: 'Dean Academic Council Room, Admin Block',
      organizingDepartment: 'Office of Dean Academic Affairs',
      eligibleAudience: 'Deans, HODs, and Department Timetable Coordinators',
      registrationRequired: false,
      status: 'Scheduled',
      registeredCount: 32
    }
  ];

  attendanceSummaries: SectionAttendanceSummary[] = [
    {
      id: 'att_001',
      date: '2026-10-16',
      programCode: 'MCA',
      year: 1,
      sectionName: 'MCA 1st Year - Section A',
      subjectCode: 'MCA-201',
      subjectName: 'Advanced Data Structures & Algorithms',
      facultyName: 'Dr. Amit Verma',
      totalEnrolled: 60,
      presentCount: 54,
      absentCount: 6,
      attendancePercentage: 90.0,
      isVerified: true
    },
    {
      id: 'att_002',
      date: '2026-10-16',
      programCode: 'MCA',
      year: 1,
      sectionName: 'MCA 1st Year - Section A',
      subjectCode: 'MCA-204',
      subjectName: 'Artificial Intelligence & Neural Nets',
      facultyName: 'Dr. Neha Kapoor',
      totalEnrolled: 60,
      presentCount: 51,
      absentCount: 9,
      attendancePercentage: 85.0,
      isVerified: true
    },
    {
      id: 'att_003',
      date: '2026-10-15',
      programCode: 'BCA',
      year: 2,
      sectionName: 'BCA 2nd Year - Section B',
      subjectCode: 'BCA-401',
      subjectName: 'Object Oriented Programming with Java',
      facultyName: 'Prof. Rohit Kumar',
      totalEnrolled: 62,
      presentCount: 56,
      absentCount: 6,
      attendancePercentage: 90.3,
      isVerified: true
    },
    {
      id: 'att_004',
      date: '2026-10-15',
      programCode: 'MCA',
      year: 1,
      sectionName: 'MCA 1st Year - Section B',
      subjectCode: 'MCA-202',
      subjectName: 'Database Management Systems & NoSQL',
      facultyName: 'Dr. Sunita Rao',
      totalEnrolled: 58,
      presentCount: 49,
      absentCount: 9,
      attendancePercentage: 84.5,
      isVerified: true
    }
  ];

  notifications: NotificationItem[] = [
    {
      id: 'notif_01',
      userId: 'usr_faculty_sunita',
      title: 'Duty Substitution Request Received',
      message: 'Dr. Amit Verma requested you to take MCA-201 (09:00-10:00 AM) on Friday Oct 17. Reason: Attending Committee meeting.',
      category: 'Substitution',
      timestamp: '2026-10-16 14:32',
      isRead: false,
      actionId: 'sub_req_101'
    },
    {
      id: 'notif_02',
      userId: 'usr_hod',
      title: 'Duty Adjustment Awaiting HOD Approval',
      message: 'Duty adjustment for Friday Oct 17 (MCA 1st Yr Sec A) between Dr. Amit Verma and Dr. Sunita Rao requires your authorization.',
      category: 'Substitution',
      timestamp: '2026-10-16 14:35',
      isRead: false,
      actionId: 'sub_req_101'
    },
    {
      id: 'notif_03',
      userId: 'usr_student_ayush',
      title: 'Grievance Status Updated to In Progress',
      message: 'Ticket MMU-GRV-2026-1042 (Lab 302 Ethernet drops) was assigned to Campus NOC. Field technician currently inspecting switch ports.',
      category: 'Grievance',
      timestamp: '2026-10-16 09:30',
      isRead: false,
      actionId: 'cmp_1042'
    },
    {
      id: 'notif_04',
      roleTarget: 'student',
      title: 'TCS Placement Drive Registration Open',
      message: 'Registrations are now live for the TCS National Campus Recruitment Drive 2026. Last date to submit resume is Oct 25.',
      category: 'Event',
      timestamp: '2026-10-15 16:00',
      isRead: true,
      actionId: 'evt_placement_tcs'
    },
    {
      id: 'notif_05',
      userId: 'usr_student_ayush',
      title: 'ID Card Collection Window Confirmed',
      message: 'Your slot for Smart ID Card collection is confirmed for Monday Oct 19, 02:00 PM at Administrative Block Counter 3. Token: MMU-ID-2026-084.',
      category: 'StudentService',
      timestamp: '2026-10-15 10:15',
      isRead: true,
      actionId: 'bk_1001'
    }
  ];

  auditLogs: AuditLogItem[] = [
    {
      id: 'log_901',
      timestamp: '2026-10-16 14:30:22',
      userId: 'usr_faculty_amit',
      userName: 'Dr. Amit Verma',
      userRole: 'faculty',
      actionType: 'SUBSTITUTION_REQUESTED',
      recordId: 'sub_req_101',
      description: 'Submitted substitution request for Friday 09:00 slot to Dr. Sunita Rao.',
      details: { subject: 'MCA-201', section: 'MCA 1st Yr Sec A', reason: 'Curriculum committee' }
    },
    {
      id: 'log_900',
      timestamp: '2026-10-15 14:15:08',
      userId: 'usr_student_ayush',
      userName: 'Ayush Sati',
      userRole: 'student',
      actionType: 'COMPLAINT_RESOLVED',
      recordId: 'cmp_1042',
      description: 'Lodged ticket MMU-GRV-2026-1042 for Lab 302 Ethernet drop failure.',
      details: { priority: 'High', location: 'Lab 302' }
    },
    {
      id: 'log_899',
      timestamp: '2026-10-10 16:40:11',
      userId: 'usr_hod',
      userName: 'Dr. Ananya Sen',
      userRole: 'hod',
      actionType: 'SUBSTITUTION_APPROVED',
      recordId: 'sub_req_102',
      description: 'Authorized substitution request for Dr. Sunita Rao by Prof. Rohit Kumar.',
      details: { slot: 'slot_mon_10_mca_a', date: '2026-10-12' }
    }
  ];

  // Configurable campus assumptions
  campusConfig = {
    totalConfiguredRooms: 400,
    totalConfiguredClasses: 354,
    universityName: 'Maharishi Markandeshwar (MMU)',
    campusLocation: 'Mullana, Ambala, Haryana - 133207',
    academicYear: '2026-2027',
    currentSemesterTerm: 'Even Semester (Jan - Jun 2026)',
    activeNotice: 'Mid-term examinations scheduled from November 15, 2026. Ensure 75% attendance compliance.'
  };

  currentUser: User = this.users[0]; // default Super Admin

  // Helper methods
  getUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  setCurrentUser(id: string) {
    const user = this.getUserById(id);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }
}

// Singleton database instance
export const db = new CampusDatabase();
