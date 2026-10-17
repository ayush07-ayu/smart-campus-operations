import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, ShieldCheck, Search, Filter, 
  Calendar, CheckCircle2, Clock, User, RefreshCw 
} from 'lucide-react';
import { AuditLogItem, User as UserType } from '../types';

interface Props {
  currentUser: UserType;
  onRefresh: () => void;
}

export const AuditReportsModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(err => console.error('Audit fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'User Name', 'Role', 'Action Type', 'Record ID', 'Description'];
    const rows = logs.map(l => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.actionType,
      l.recordId,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MMU_Audit_Trail_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(l => 
    l.description.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.actionType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <span>Audit Trail & Administrative Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System audit log for schedule changes, substitution approvals, and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user, action type, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredLogs.length}</strong> logged transactions
        </span>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="p-3.5 w-44">Timestamp</th>
                <th className="p-3.5">Authorized User</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5">Record ID</th>
                <th className="p-3.5">Audit Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">{log.userRole}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {log.recordId}
                  </td>
                  <td className="p-3.5 text-slate-700">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
