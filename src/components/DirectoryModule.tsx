import React, { useState } from 'react';
import { 
  MapPin, Building2, Search, Filter, Layers, 
  DoorOpen, Check, Info, Users, Briefcase, GraduationCap 
} from 'lucide-react';
import { Room } from '../types';

interface Props {
  rooms: Room[];
}

export const DirectoryModule: React.FC<Props> = ({ rooms }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const buildings = Array.from(new Set(rooms.map(r => r.building)));

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = 
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase()) ||
      r.facilities.some(f => f.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedBuilding !== 'all' && r.building !== selectedBuilding) return false;
    if (selectedFloor !== 'all' && String(r.floor) !== selectedFloor) return false;
    if (selectedType !== 'all' && r.roomType !== selectedType) return false;

    return true;
  });

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'computer_lab': return 'Computer Laboratory';
      case 'lecture_hall': return 'Lecture Hall';
      case 'seminar_hall': return 'Seminar Auditorium';
      case 'staff_room': return 'Faculty Staff Lounge';
      case 'hod_office': return 'Head of Department Office';
      case 'admin_office': return 'Administrative Counter';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-700" />
            <span>Campus Location Directory & Office Finder</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable building, floor, laboratory, administrative offices, and faculty room locator.
          </p>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-center gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />
        <span>
          Illustrative building navigation for demonstration. Room layouts, numbers, and facility tags are fully customizable.
        </span>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room number (e.g. 102, Lab 302), facility, or office name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
          >
            <option value="all">All Campus Blocks</option>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
          >
            <option value="all">All Floors</option>
            <option value="1">1st Floor / Ground</option>
            <option value="2">2nd Floor</option>
            <option value="3">3rd Floor</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
          >
            <option value="all">All Room Types</option>
            <option value="computer_lab">Computer Laboratories</option>
            <option value="lecture_hall">Lecture Halls</option>
            <option value="seminar_hall">Seminar Auditoriums</option>
            <option value="hod_office">HOD / Dean Offices</option>
            <option value="staff_room">Faculty Staff Rooms</option>
            <option value="admin_office">Student Counters</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No locations matching criteria.
          </div>
        ) : (
          filteredRooms.map(room => (
            <div
              key={room.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-blue-900">
                      {room.code.split(' ')[0].substring(0, 3)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{room.code}</h3>
                      <p className="text-[11px] text-slate-500">{getRoomTypeLabel(room.roomType)}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Floor {room.floor}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-800 mt-3">
                  {room.name}
                </h4>

                <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.building}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Capacity: <strong className="text-slate-850">{room.capacity} Seats</strong>
                  </p>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Equipped Facilities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((fac, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  {room.hasAC && <span>AC</span>}
                  {room.hasProjector && <span>Display</span>}
                  {room.isAccessible && <span>Accessible</span>}
                </div>
                <span className="text-blue-700 font-medium">MMU Mullana</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
