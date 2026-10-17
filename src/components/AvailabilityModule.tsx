import React, { useState, useEffect } from 'react';
import { 
  DoorOpen, CheckCircle2, XCircle, Search, Filter, 
  Calendar, Clock, Building2, Cpu, Check, AlertCircle, 
  RefreshCw, Layers
} from 'lucide-react';
import { Room, User, DayOfWeek } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_OPTIONS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export const AvailabilityModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedTime, setSelectedTime] = useState<string>('11:00');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [roomData, setRoomData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reservationModalRoom, setReservationModalRoom] = useState<any | null>(null);
  const [reservationPurpose, setReservationPurpose] = useState<string>('Special Hands-On Workshop');
  const [resSuccess, setResSuccess] = useState<string>('');
  const [resError, setResError] = useState<string>('');

  const fetchAvailability = () => {
    setIsLoading(true);
    let url = `/api/rooms/availability?day=${selectedDay}&time=${selectedTime}`;
    if (selectedType !== 'all') {
      url += `&type=${selectedType}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.rooms) {
          setRoomData(data.rooms);
        }
      })
      .catch(err => console.error('Availability fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDay, selectedTime, selectedType]);

  const handleReserveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setResError('');
    setResSuccess('');

    try {
      const res = await fetch('/api/rooms/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: reservationModalRoom.room.id,
          day: selectedDay,
          startTime: selectedTime,
          endTime: `${parseInt(selectedTime.split(':')[0], 10) + 1}:00`,
          purpose: reservationPurpose
        })
      });

      const data = await res.json();
      if (data.success) {
        setResSuccess(`Room ${reservationModalRoom.room.code} reserved successfully! Master schedule updated.`);
        setTimeout(() => {
          setReservationModalRoom(null);
          setResSuccess('');
          fetchAvailability();
          onRefresh();
        }, 1200);
      } else {
        setResError(data.error || 'Failed to reserve room.');
      }
    } catch (err: any) {
      setResError(err?.message || 'Network error.');
    }
  };

  const availableCount = roomData.filter(r => r.isAvailable).length;
  const occupiedCount = roomData.filter(r => !r.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-blue-700" />
            <span>Classroom & Laboratory Availability</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy and reservation management across Ramanujan Hall & Aryabhata Complex.
          </p>
        </div>

        <button
          onClick={fetchAvailability}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Day of Week */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Time Slot
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t}>{t} - {parseInt(t.split(':')[0], 10) + 1}:00</option>
              ))}
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Facility Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="all">All Facilities</option>
              <option value="computer_lab">Computer Laboratories Only</option>
              <option value="lecture_hall">Lecture Halls Only</option>
              <option value="seminar_hall">Central Seminar Halls</option>
            </select>
          </div>
        </div>

        {/* Real-time counters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{availableCount} Available</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>{occupiedCount} Occupied</span>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            Querying room reservation schedule...
          </div>
        ) : (
          roomData.map(({ room, isAvailable, status, currentSession }) => (
            <div
              key={room.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-colors flex flex-col justify-between ${
                isAvailable ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      {room.code}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-700 mt-0.5 line-clamp-1">
                      {room.name}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <p className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.building} • Floor {room.floor}</span>
                  </p>
                  <p>Capacity: <strong className="text-slate-800">{room.capacity} Students</strong></p>
                </div>

                {!isAvailable && currentSession && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Current Session ({currentSession.startTime} - {currentSession.endTime})
                    </span>
                    <p className="font-bold text-slate-900">{currentSession.subjectCode}</p>
                    <p className="text-[11px] text-slate-600 truncate">{currentSession.subjectName}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Instructor: {currentSession.facultyName} • {currentSession.sectionName}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.facilities.slice(0, 3).map((f: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  {room.hasAC && <span>AC</span>}
                  {room.hasProjector && <span>Display</span>}
                  {room.isAccessible && <span>Accessible</span>}
                </div>

                {isAvailable && currentUser.role !== 'student' && (
                  <button
                    onClick={() => setReservationModalRoom({ room, isAvailable, currentSession })}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Reserve Slot
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reservation Modal */}
      {reservationModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-700" />
              <span>Reserve {reservationModalRoom.room.code}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule: {selectedDay} at {selectedTime} • {reservationModalRoom.room.name}
            </p>

            {resError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{resError}</span>
              </div>
            )}

            {resSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{resSuccess}</span>
              </div>
            )}

            <form onSubmit={handleReserveRoom} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Purpose of Reservation
                </label>
                <input
                  type="text"
                  value={reservationPurpose}
                  onChange={(e) => setReservationPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  placeholder="e.g. Workshop Session"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p>Location: <strong>{reservationModalRoom.room.building}</strong></p>
                <p>Capacity: <strong>{reservationModalRoom.room.capacity} Workstations</strong></p>
                <p>Reserved By: <strong>{currentUser.name} ({currentUser.role})</strong></p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReservationModalRoom(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
