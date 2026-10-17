import React, { useState } from 'react';
import { 
  Calendar, Filter, Plus, Download, Search, Check, 
  AlertCircle, Clock, MapPin, User as UserIcon, BookOpen, 
  Layers, CheckCircle2
} from 'lucide-react';
import { TimetableSlot, User, DayOfWeek } from '../types';

interface Props {
  slots: TimetableSlot[];
  currentUser: User;
  onAddSlot: (slotData: any) => Promise<{ success?: boolean; error?: string }>;
  onRefresh: () => void;
  onRequestSubstituteModal: (slot: TimetableSlot) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_BLOCKS = [
  { start: '09:00', end: '10:00', label: '09:00 - 10:00 AM' },
  { start: '10:00', end: '11:00', label: '10:00 - 11:00 AM' },
  { start: '11:00', end: '12:00', label: '11:00 - 12:00 PM' },
  { start: '12:00', end: '13:00', label: '12:00 - 01:00 PM' },
  { start: '14:00', end: '15:00', label: '02:00 - 03:00 PM' },
  { start: '15:00', end: '16:00', label: '03:00 - 04:00 PM' },
  { start: '16:00', end: '17:00', label: '04:00 - 05:00 PM' },
];

export const TimetableModule: React.FC<Props> = ({
  slots,
  currentUser,
  onAddSlot,
  onRefresh,
  onRequestSubstituteModal
}) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('MCA');
  const [selectedSection, setSelectedSection] = useState<string>('MCA 1st Year - Section A');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New slot form state
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:00',
    subjectCode: 'MCA-205',
    subjectName: 'Distributed Systems & Microservices',
    sectionId: 'sec_mca_1a',
    facultyId: 'usr_faculty_amit',
    roomId: 'rm_lh_105',
    type: 'Lecture'
  });

  const filteredSlots = slots.filter(slot => {
    if (selectedProgram && slot.programCode !== selectedProgram) return false;
    if (selectedSection && slot.sectionName !== selectedSection) return false;
    if (viewMode === 'daily' && slot.day !== selectedDay) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Day', 'Start Time', 'End Time', 'Program', 'Section', 'Subject Code', 'Subject Name', 'Room', 'Faculty', 'Type', 'Adjustment Status'];
    const rows = filteredSlots.map(s => [
      s.day,
      s.startTime,
      s.endTime,
      s.programCode,
      `"${s.sectionName}"`,
      s.subjectCode,
      `"${s.subjectName}"`,
      s.roomCode,
      `"${s.adjustedFacultyName ? s.adjustedFacultyName + ' (Substitute)' : s.facultyName}"`,
      s.type,
      s.isAdjusted ? `Adjusted: ${s.adjustmentReason || 'Approved'}` : 'Normal'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MMU_Timetable_${selectedProgram}_${selectedSection.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const res = await onAddSlot(newSlot);
      if (res.error) {
        setFormError(res.error);
      } else {
        setFormSuccess('New timetable slot successfully scheduled!');
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccess('');
          onRefresh();
        }, 1200);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to schedule slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManageTimetable = currentUser.role === 'super_admin' || currentUser.role === 'supervisor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            <span>Department Timetable Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of Computer Applications • MCA, BCA & B.Sc AI/ML Programs
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManageTimetable && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Class</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Export filtered timetable as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Program Select */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Academic Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="MCA">MCA (Master of Computer Applications)</option>
              <option value="BCA">BCA (Bachelor of Computer Applications)</option>
              <option value="B.Sc AI/ML">B.Sc AI & Machine Learning</option>
            </select>
          </div>

          {/* Section Select */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Class Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="MCA 1st Year - Section A">MCA 1st Year - Section A (60 Students)</option>
              <option value="MCA 1st Year - Section B">MCA 1st Year - Section B (58 Students)</option>
              <option value="BCA 2nd Year - Section B">BCA 2nd Year - Section B (62 Students)</option>
              <option value="B.Sc AI/ML 1st Year - Sec A">B.Sc AI/ML 1st Year - Sec A (45 Students)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              View Layout
            </label>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly Matrix
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily List
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'daily' && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDay === day ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timetable Grid / Matrix View */}
      {viewMode === 'weekly' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="p-3 w-28 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-3 text-center border-l border-slate-200">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {TIME_BLOCKS.map(block => (
                  <tr key={block.start} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                      <div className="text-slate-900 text-xs font-bold">{block.start}</div>
                      <div className="text-[10px] text-slate-500">{block.end}</div>
                    </td>

                    {DAYS.map(day => {
                      const slot = filteredSlots.find(s => 
                        s.day === day && 
                        ((block.start >= s.startTime && block.start < s.endTime) ||
                         (block.end > s.startTime && block.end <= s.endTime) ||
                         (s.startTime === block.start))
                      );

                      if (!slot) {
                        return (
                          <td key={day} className="p-2 border-l border-slate-200 text-center text-slate-400 bg-slate-50/30">
                            <span className="text-[10px] italic">Free Period</span>
                          </td>
                        );
                      }

                      const isLab = slot.type.includes('Lab') || slot.type.includes('Practical');

                      return (
                        <td key={day} className="p-2 border-l border-slate-200">
                          <div
                            className={`p-2.5 rounded-lg border text-left transition-colors ${
                              isLab 
                                ? 'bg-blue-50/80 border-blue-200' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-xs text-slate-900">{slot.subjectCode}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isLab ? 'bg-blue-200 text-blue-900' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {slot.type.split(' ')[0]}
                              </span>
                            </div>

                            <p className="text-[11px] font-semibold text-slate-800 line-clamp-1" title={slot.subjectName}>
                              {slot.subjectName}
                            </p>

                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600">
                              <span className="font-bold text-blue-700">{slot.roomCode}</span>
                              <span className="truncate max-w-[90px]" title={slot.adjustedFacultyName || slot.facultyName}>
                                {slot.adjustedFacultyName ? `${slot.adjustedFacultyName} (Sub)` : slot.facultyName}
                              </span>
                            </div>

                            {currentUser.role === 'faculty' && slot.facultyId === currentUser.id && (
                              <button
                                onClick={() => onRequestSubstituteModal(slot)}
                                className="mt-2 w-full text-center py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                              >
                                Find Substitute
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Daily List View */
        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
              No classes scheduled for {selectedDay} in {selectedSection}
            </div>
          ) : (
            filteredSlots.map(slot => (
              <div
                key={slot.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 text-center bg-slate-50 py-2 rounded-lg border border-slate-200 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">{slot.startTime}</span>
                    <span className="text-[10px] text-slate-500 block">to {slot.endTime}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{slot.subjectCode}</span>
                      <span className="text-xs font-semibold text-slate-700">{slot.subjectName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {slot.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                      <span className="flex items-center gap-1 font-semibold text-blue-700">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{slot.roomCode}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{slot.adjustedFacultyName ? `${slot.adjustedFacultyName} (Substitute)` : slot.facultyName}</span>
                      </span>
                      <span>•</span>
                      <span>{slot.sectionName}</span>
                    </div>
                  </div>
                </div>

                {currentUser.role === 'faculty' && slot.facultyId === currentUser.id && (
                  <button
                    onClick={() => onRequestSubstituteModal(slot)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                  >
                    Request Substitute
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Schedule New Academic Session</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Automatic validation engine checks for room overlap and faculty double-booking.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Practical / Lab">Practical / Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Exam Duty">Exam Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={newSlot.subjectCode}
                    onChange={(e) => setNewSlot({ ...newSlot, subjectCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    placeholder="e.g. MCA-205"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={newSlot.subjectName}
                    onChange={(e) => setNewSlot({ ...newSlot, subjectName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    placeholder="Subject title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Faculty</label>
                  <select
                    value={newSlot.facultyId}
                    onChange={(e) => setNewSlot({ ...newSlot, facultyId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value="usr_faculty_amit">Dr. Amit Verma (Assoc. Prof)</option>
                    <option value="usr_faculty_sunita">Dr. Sunita Rao (Asst. Prof)</option>
                    <option value="usr_faculty_rohit">Prof. Rohit Kumar (Asst. Prof)</option>
                    <option value="usr_faculty_neha">Dr. Neha Kapoor (Asst. Prof)</option>
                    <option value="usr_supervisor">Prof. Vikram Mehta (Coordinator)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Classroom / Lab</label>
                  <select
                    value={newSlot.roomId}
                    onChange={(e) => setNewSlot({ ...newSlot, roomId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value="rm_lh_105">LH-105 (Smart Lecture Hall - 80 Cap)</option>
                    <option value="rm_lh_106">LH-106 (Lecture Hall - 75 Cap)</option>
                    <option value="rm_lh_205">LH-205 (Lecture Room - 70 Cap)</option>
                    <option value="rm_lab_302">Lab 302 (Advanced Computing - 65 Cap)</option>
                    <option value="rm_lab_301">Lab 301 (Software Engg Lab - 60 Cap)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Verifying...' : 'Validate & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
