import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, AlertTriangle, CheckCircle2, 
  Calendar, Users, BookOpen, Search, RefreshCw, BarChart2 
} from 'lucide-react';
import { SectionAttendanceSummary, User } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

export const AttendanceModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [summaries, setSummaries] = useState<SectionAttendanceSummary[]>([]);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [date, setDate] = useState<string>('2026-10-16');
  const [programCode, setProgramCode] = useState<string>('MCA');
  const [sectionName, setSectionName] = useState<string>('MCA 1st Year - Section A');
  const [subjectCode, setSubjectCode] = useState<string>('MCA-203');
  const [subjectName, setSubjectName] = useState<string>('Full-Stack Web Engineering');
  const [totalEnrolled, setTotalEnrolled] = useState<number>(60);
  const [presentCount, setPresentCount] = useState<number>(55);

  const fetchAttendance = () => {
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => setSummaries(data));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          programCode,
          year: 1,
          sectionName,
          subjectCode,
          subjectName,
          totalEnrolled,
          presentCount
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Attendance submitted! Present: ${data.summary.presentCount}/${data.summary.totalEnrolled} (${data.summary.attendancePercentage}%)`
        });
        setTimeout(() => {
          setShowRecordModal(false);
          setMessage(null);
          fetchAttendance();
          onRefresh();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit attendance' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRecord = currentUser.role !== 'student';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-700" />
            <span>Section-Wise Student Attendance Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section summaries, faculty headcount entry, and mandatory 75% exam eligibility tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canRecord && (
            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Class Attendance</span>
            </button>
          )}

          <button
            onClick={fetchAttendance}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Summaries Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Academic Section</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Faculty</th>
                <th className="p-3.5 text-center">Enrolled</th>
                <th className="p-3.5 text-center">Present</th>
                <th className="p-3.5 text-center">Absent</th>
                <th className="p-3.5 text-right">Attendance Rate</th>
                <th className="p-3.5 text-center">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summaries.map(att => {
                const isCompliant = att.attendancePercentage >= 75;

                return (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 text-slate-600 font-mono">{att.date}</td>
                    <td className="p-3.5 font-bold text-slate-900">{att.sectionName}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{att.subjectCode}</div>
                      <div className="text-[11px] text-slate-500">{att.subjectName}</div>
                    </td>
                    <td className="p-3.5 text-slate-700">{att.facultyName}</td>
                    <td className="p-3.5 text-center text-slate-700">{att.totalEnrolled}</td>
                    <td className="p-3.5 text-center text-emerald-700 font-semibold">{att.presentCount}</td>
                    <td className="p-3.5 text-center text-rose-700 font-semibold">{att.absentCount}</td>
                    <td className="p-3.5 text-right font-bold text-sm text-slate-900">
                      {att.attendancePercentage}%
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isCompliant 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isCompliant ? 'Above 75%' : 'Below Threshold'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Attendance Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-700" />
              <span>Record Section Attendance</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter headcount for authorized class. Duplicate submissions for the same slot are blocked.
            </p>

            {message && (
              <div className={`p-3 mb-4 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleRecordAttendance} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value="MCA 1st Year - Section A">MCA 1st Year - Section A</option>
                    <option value="MCA 1st Year - Section B">MCA 1st Year - Section B</option>
                    <option value="BCA 2nd Year - Section B">BCA 2nd Year - Section B</option>
                    <option value="B.Sc AI/ML 1st Year - Sec A">B.Sc AI/ML 1st Year - Sec A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Enrolled</label>
                  <input
                    type="number"
                    value={totalEnrolled}
                    onChange={(e) => setTotalEnrolled(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Present Count</label>
                  <input
                    type="number"
                    value={presentCount}
                    onChange={(e) => setPresentCount(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center text-slate-700">
                <span>Calculated Attendance Rate:</span>
                <span className="font-extrabold text-blue-800">
                  {totalEnrolled > 0 ? ((presentCount / totalEnrolled) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Recording...' : 'Submit Headcount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
