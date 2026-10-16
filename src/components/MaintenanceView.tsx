import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  FileText,
  UserCheck,
  X,
  Filter,
} from 'lucide-react';
import {
  MaintenanceWorkOrder,
  Employee,
  UserRole,
} from '../types/campus.ts';

interface MaintenanceViewProps {
  currentRole: UserRole;
  currentUserName: string;
  workOrders: MaintenanceWorkOrder[];
  employees: Employee[];
  onRefresh: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  currentRole,
  currentUserName,
  workOrders,
  employees,
  onRefresh,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignoffModal, setShowSignoffModal] = useState(false);
  const [activeWorkOrder, setActiveWorkOrder] = useState<MaintenanceWorkOrder | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<
    'Electrical' | 'Plumbing' | 'HVAC' | 'Civil/Carpentry' | 'Housekeeping' | 'Laboratory'
  >('Electrical');
  const [formLocation, setFormLocation] = useState('Central Academic Complex');
  const [formPriority, setFormPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [formAssignedId, setFormAssignedId] = useState('');
  const [formDeadline, setFormDeadline] = useState('2026-10-18');
  const [formBeforePhoto, setFormBeforePhoto] = useState('');

  // Signoff states
  const [signStatus, setSignStatus] = useState<'in_progress' | 'pending_supervisor_signoff' | 'completed'>('completed');
  const [signRemarks, setSignRemarks] = useState('');
  const [signMaterials, setSignMaterials] = useState('');
  const [signAfterPhoto, setSignAfterPhoto] = useState('');

  const todayStr = '2026-10-16';

  // Technicians & maintenance staff
  const technicians = employees.filter(
    (e) => (e.departmentId === 'dept-mnt' || e.departmentId === 'dept-hkp') && e.status === 'active'
  );

  // Filtered list
  const filteredOrders = workOrders.filter((w) => {
    if (categoryFilter !== 'all' && w.departmentCategory !== categoryFilter) return false;
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    return true;
  });

  // Handle Create Work Order
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/maintenance/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          departmentCategory: formCategory,
          location: formLocation,
          priority: formPriority,
          assignedEmployeeId: formAssignedId,
          reportedBy: currentUserName,
          deadline: formDeadline,
          beforePhotoDescription: formBeforePhoto,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowCreateModal(false);
      setFormTitle('');
      setFormBeforePhoto('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Signoff Work Order
  const handleSignoffWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkOrder) return;
    try {
      await fetch(`/api/maintenance/work-orders/${activeWorkOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: signStatus,
          workRemarks: signRemarks,
          materialsUsed: signMaterials,
          afterPhotoDescription: signAfterPhoto,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      setShowSignoffModal(false);
      setSignRemarks('');
      setSignMaterials('');
      setSignAfterPhoto('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Estate Facilities & Engineering Services</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">SLA & Work Order Control</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Maintenance & Housekeeping
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Electrical, plumbing, HVAC, laboratory equipment maintenance, and supervisor inspection sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Filter work orders by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="Civil/Carpentry">Civil/Carpentry</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Laboratory">Laboratory</option>
            </select>
          </div>

          <select
            aria-label="Filter work orders by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_supervisor_signoff">Pending Sign-off</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-xs">
          Showing {filteredOrders.length} of {workOrders.length} work orders
        </span>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-2.5 font-medium">Order Code</th>
                <th className="py-2.5 font-medium">Job Title & Location</th>
                <th className="py-2.5 font-medium">Category</th>
                <th className="py-2.5 font-medium">Assigned Technician</th>
                <th className="py-2.5 font-medium">Priority</th>
                <th className="py-2.5 font-medium">Deadline SLA</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium text-right">Sign-off Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((wo) => {
                const isOverdue = wo.status !== 'completed' && wo.deadline < todayStr;
                return (
                  <tr key={wo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{wo.workOrderCode}</td>
                    <td className="py-3 max-w-sm">
                      <div className="font-semibold text-slate-900 leading-tight">{wo.title}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">{wo.location}</div>
                      {wo.beforePhotoDescription && (
                        <div className="text-[10px] text-slate-400 mt-1 italic">
                          Condition: {wo.beforePhotoDescription}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-slate-800">{wo.departmentCategory}</span>
                    </td>
                    <td className="py-3 font-medium text-slate-900">{wo.assignedEmployeeName}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          wo.priority === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : wo.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </td>
                    <td className="py-3 font-mono tabular-nums">
                      <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {wo.deadline}
                      </span>
                      {isOverdue && <span className="text-[10px] text-rose-600 block uppercase font-bold">Overdue</span>}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          wo.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : wo.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-700'
                            : wo.status === 'pending_supervisor_signoff'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {wo.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {wo.status !== 'completed' ? (
                        <button
                          onClick={() => {
                            setActiveWorkOrder(wo);
                            setSignStatus(wo.status === 'open' ? 'in_progress' : 'completed');
                            setShowSignoffModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          Update / Sign-off
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-mono font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Work Order */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Maintenance Work Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Work Order Title</label>
                <input
                  type="text"
                  placeholder="e.g. Substation transformer cooling fan replacement"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Department Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Civil/Carpentry">Civil/Carpentry</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="critical">Critical (Immediate Emergency)</option>
                    <option value="high">High (24h Target)</option>
                    <option value="medium">Medium (72h Routine)</option>
                    <option value="low">Low (Preventative Cycle)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Campus Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Complex Lab 4"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Responsible Employee / Technician</label>
                <select
                  value={formAssignedId}
                  onChange={(e) => setFormAssignedId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="">Select Technician...</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.jobTitle} · {t.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Initial Fault Condition / Before Photo Notes</label>
                <textarea
                  rows={2}
                  placeholder="Record defect signs, leakage rate, electrical sparks, or equipment error codes..."
                  value={formBeforePhoto}
                  onChange={(e) => setFormBeforePhoto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update / Signoff Work Order */}
      {showSignoffModal && activeWorkOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Work Order Completion & Sign-off</h3>
              <button onClick={() => setShowSignoffModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignoffWorkOrder} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-bold text-slate-900">{activeWorkOrder.workOrderCode}: {activeWorkOrder.title}</div>
                <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                  Location: {activeWorkOrder.location} · Assigned: {activeWorkOrder.assignedEmployeeName}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Target Status</label>
                <select
                  value={signStatus}
                  onChange={(e) => setSignStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="pending_supervisor_signoff">Pending Supervisor Sign-off</option>
                  <option value="completed">Completed & Supervisor Approved</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Technician Work Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Details of repair done, tests performed, voltage/flow rate calibrated..."
                  value={signRemarks}
                  onChange={(e) => setSignRemarks(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Spare Parts & Materials Consumed</label>
                <input
                  type="text"
                  placeholder="e.g. 2x 25A MCB, 5m Copper wire, Teflon tape"
                  value={signMaterials}
                  onChange={(e) => setSignMaterials(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">After-Work Condition / Inspection Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Clean finish verified, zero leakage recorded under test pressure"
                  value={signAfterPhoto}
                  onChange={(e) => setSignAfterPhoto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSignoffModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Sign & Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
