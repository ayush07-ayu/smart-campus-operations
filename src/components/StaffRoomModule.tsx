import React, { useState, useEffect } from 'react';
import { 
  Coffee, User, MapPin, Clock, BookOpen, Search, 
  CheckCircle2, AlertTriangle, Building2, Phone, Mail, 
  Calendar, RefreshCw
} from 'lucide-react';
import { User as UserType } from '../types';

interface Props {
  currentUser: UserType;
  onRefresh: () => void;
}

export const StaffRoomModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [facultyData, setFacultyData] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFacultyPresence = () => {
    setIsLoading(true);
    fetch('/api/staff-room/faculty')
      .then(res => res.json())
      .then(data => {
        setFacultyData(data);
      })
      .catch(err => console.error('Staff room fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFacultyPresence();
  }, []);

  const filteredFaculty = facultyData.filter(({ faculty, status, cabin }) => {
    const matchesSearch = 
      faculty.name.toLowerCase().includes(search.toLowerCase()) ||
      (faculty.teachingSubjects || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase())) ||
      cabin.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Teaching':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'On Leave':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-blue-700" />
            <span>Staff Room & Faculty Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department Faculty Lounge (Room 204, Ramanujan Hall) • Schedule-based presence information
          </p>
        </div>

        <button
          onClick={fetchFacultyPresence}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty name, subject expertise, or desk number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Teachers ({facultyData.length})
          </button>
          <button
            onClick={() => setStatusFilter('Available')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'Available' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Available Now
          </button>
          <button
            onClick={() => setStatusFilter('Teaching')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'Teaching' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            In Lecture
          </button>
          <button
            onClick={() => setStatusFilter('On Leave')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'On Leave' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            On Leave
          </button>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            Querying faculty schedules...
          </div>
        ) : (
          filteredFaculty.map(({ faculty, status, statusLabel, cabin, currentActivity, nextClass }) => (
            <div
              key={faculty.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={faculty.avatar}
                      alt={faculty.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{faculty.name}</h3>
                      <p className="text-[11px] text-slate-500">{faculty.designation}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(status)}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Desk / Cabin</span>
                      <span className="font-semibold text-slate-800">{cabin}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Status</span>
                      <span className="text-slate-700">{currentActivity}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-purple-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Next Scheduled Class</span>
                      <span className="text-slate-700 font-medium">{nextClass}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Teaching Specializations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(faculty.teachingSubjects || []).map((sub: string, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[170px]">{faculty.email}</span>
                <span className="text-[10px] text-slate-500">MMU Faculty</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
