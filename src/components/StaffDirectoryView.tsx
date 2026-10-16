import React, { useState } from 'react';
import {
  Users,
  Building,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  Phone,
  Mail,
  X,
  Briefcase,
  GitFork,
} from 'lucide-react';
import {
  Department,
  Employee,
  UserRole,
} from '../types/campus.ts';

interface StaffDirectoryViewProps {
  currentRole: UserRole;
  currentUserName: string;
  departments: Department[];
  employees: Employee[];
  onRefresh: () => void;
}

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  currentRole,
  currentUserName,
  departments,
  employees,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);

  // Department form
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptHod, setDeptHod] = useState('');
  const [deptSupervisor, setDeptSupervisor] = useState('');
  const [deptExt, setDeptExt] = useState('');

  // Employee form
  const [empName, setEmpName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDeptId, setEmpDeptId] = useState(departments[0]?.id || '');
  const [empRole, setEmpRole] = useState<UserRole>('Employee / Staff');
  const [empJobTitle, setEmpJobTitle] = useState('Staff Specialist');
  const [empReportingToId, setEmpReportingToId] = useState('');
  const [empPref, setEmpPref] = useState<'morning' | 'evening' | 'night' | 'any'>('any');
  const [empOffDay, setEmpOffDay] = useState(0);

  // Filter employees
  const filteredEmployees = employees.filter((e) => {
    if (selectedDeptId !== 'all' && e.departmentId !== selectedDeptId) return false;
    if (selectedRole !== 'all' && e.role !== selectedRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Create Department
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: deptCode,
          name: deptName,
          description: deptDesc,
          hodName: deptHod,
          supervisorName: deptSupervisor,
          contactExtension: deptExt,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowDeptModal(false);
      setDeptCode('');
      setDeptName('');
      setDeptDesc('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Enroll Employee
  const handleEnrollEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: empCode,
          name: empName,
          email: empEmail,
          phone: empPhone,
          departmentId: empDeptId,
          role: empRole,
          jobTitle: empJobTitle,
          reportingToId: empReportingToId || undefined,
          shiftPreference: empPref,
          weeklyOffDay: empOffDay,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowEmpModal(false);
      setEmpName('');
      setEmpCode('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Organizational Hierarchy & Directory</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Role-Based Access Control</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Departments & Workforce Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional departments, job titles, reporting lines, shift preferences, and permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Department</span>
          </button>
          <button
            onClick={() => setShowEmpModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Employee</span>
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const headcount = employees.filter((e) => e.departmentId === dept.id).length;
          return (
            <div
              key={dept.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    Ext: {dept.contactExtension}
                  </span>
                </div>
                <h2 className="font-bold text-slate-900 text-sm mt-2">{dept.name}</h2>
                <p className="text-slate-600 text-xs mt-1 leading-snug line-clamp-2">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Head of Dept:</span>
                  <span className="font-medium text-slate-800">{dept.hodName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Supervisor:</span>
                  <span className="font-medium text-slate-800">{dept.supervisorName}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Staff Count:</span>
                  <span className="font-bold text-indigo-700 tabular-nums">{headcount} Members</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by staff name, employee code, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter staff by department"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            aria-label="Filter staff by role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Department Supervisor">Department Supervisor</option>
            <option value="Security Supervisor">Security Supervisor</option>
            <option value="Hostel Warden">Hostel Warden</option>
            <option value="Mess Manager">Mess Manager</option>
            <option value="Transport Manager">Transport Manager</option>
            <option value="Maintenance Supervisor">Maintenance Supervisor</option>
            <option value="Employee / Staff">Employee / Staff</option>
            <option value="Management / Auditor">Management / Auditor</option>
          </select>

          <span className="text-slate-500 font-mono text-xs">
            {filteredEmployees.length} staff members
          </span>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-2.5 font-medium">Employee</th>
                <th className="py-2.5 font-medium">Department</th>
                <th className="py-2.5 font-medium">System Role</th>
                <th className="py-2.5 font-medium">Reporting Relationship</th>
                <th className="py-2.5 font-medium">Shift Preference</th>
                <th className="py-2.5 font-medium">Weekly Rest</th>
                <th className="py-2.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const dept = departments.find((d) => d.id === emp.departmentId);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.avatarInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{emp.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            {emp.employeeCode} · {emp.jobTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-700">{dept?.name || 'Central'}</td>
                    <td className="py-3 font-medium text-indigo-700">{emp.role}</td>
                    <td className="py-3 text-slate-600 font-mono text-[11px]">
                      {emp.reportingToName ? (
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-slate-400" />
                          <span>Reports to: {emp.reportingToName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Department Head</span>
                      )}
                    </td>
                    <td className="py-3 capitalize text-slate-700 font-mono text-[11px]">
                      {emp.shiftPreference || 'any'}
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-[11px]">
                      {dayNames[emp.weeklyOffDay]}
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Department */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Campus Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Department Code</label>
                  <input
                    type="text"
                    placeholder="e.g. LAB"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Phone Extension</label>
                  <input
                    type="text"
                    placeholder="ext-4077"
                    value={deptExt}
                    onChange={(e) => setDeptExt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Central Research Laboratories"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  placeholder="Operational responsibilities..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Head of Department (HOD)</label>
                  <input
                    type="text"
                    placeholder="Prof. Name"
                    value={deptHod}
                    onChange={(e) => setDeptHod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Supervisor Name</label>
                  <input
                    type="text"
                    placeholder="Supervisor Name"
                    value={deptSupervisor}
                    onChange={(e) => setDeptSupervisor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Employee */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Enroll Staff Member</h3>
              <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollEmployee} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand Kumar"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Employee Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SEC-309"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Department</label>
                  <select
                    value={empDeptId}
                    onChange={(e) => setEmpDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Assigned Role</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Employee / Staff">Employee / Staff</option>
                    <option value="Department Supervisor">Department Supervisor</option>
                    <option value="Security Supervisor">Security Supervisor</option>
                    <option value="Hostel Warden">Hostel Warden</option>
                    <option value="Mess Manager">Mess Manager</option>
                    <option value="Transport Manager">Transport Manager</option>
                    <option value="Maintenance Supervisor">Maintenance Supervisor</option>
                    <option value="HOD">HOD</option>
                    <option value="Management / Auditor">Management / Auditor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Job Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Patrol Guard"
                    value={empJobTitle}
                    onChange={(e) => setEmpJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Reporting Supervisor</label>
                  <select
                    value={empReportingToId}
                    onChange={(e) => setEmpReportingToId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="">None / Self Reporting</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Shift Preference</label>
                  <select
                    value={empPref}
                    onChange={(e) => setEmpPref(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="any">Flexible / Any Shift</option>
                    <option value="morning">Morning Shift</option>
                    <option value="evening">Evening Shift</option>
                    <option value="night">Night Shift</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Designated Weekly Off</label>
                  <select
                    value={empOffDay}
                    onChange={(e) => setEmpOffDay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {dayNames.map((day, idx) => (
                      <option key={day} value={idx}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Enroll Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
