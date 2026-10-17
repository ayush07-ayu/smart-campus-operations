import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Bus, Shirt, CheckCircle2, AlertCircle, AlertTriangle,
  Clock, MapPin, Calendar, FileText, Ticket, 
  ChevronRight, RefreshCw
} from 'lucide-react';
import { StudentServiceCounter, StudentServiceBooking, User } from '../types';

interface Props {
  currentUser: User;
  onRefresh: () => void;
}

export const StudentServicesModule: React.FC<Props> = ({ currentUser, onRefresh }) => {
  const [counters, setCounters] = useState<StudentServiceCounter[]>([]);
  const [myBookings, setMyBookings] = useState<StudentServiceBooking[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<StudentServiceCounter | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('2026-10-21');
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchServiceData = () => {
    fetch('/api/student-services/counters')
      .then(res => res.json())
      .then(data => {
        setCounters(data);
        if (data.length > 0 && !selectedCounter) {
          setSelectedCounter(data[0]);
          if (data[0].timeSlots.length > 0) {
            setSelectedSlotId(data[0].timeSlots[0].id);
          }
        }
      });

    fetch('/api/student-services/my-bookings')
      .then(res => res.json())
      .then(data => setMyBookings(data));
  };

  useEffect(() => {
    fetchServiceData();
  }, []);

  const handleSelectCounter = (counter: StudentServiceCounter) => {
    setSelectedCounter(counter);
    if (counter.timeSlots.length > 0) {
      setSelectedSlotId(counter.timeSlots[0].id);
    }
    setBookingMessage(null);
  };

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounter || !selectedSlotId) return;

    setIsSubmitting(true);
    setBookingMessage(null);

    try {
      const res = await fetch('/api/student-services/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterId: selectedCounter.id,
          timeSlotId: selectedSlotId,
          date: bookingDate
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingMessage({
          type: 'success',
          text: `Slot confirmed! Token generated: ${data.booking.tokenNumber}. Show this at ${selectedCounter.location}.`
        });
        fetchServiceData();
        onRefresh();
      } else {
        setBookingMessage({ type: 'error', text: data.error || 'Failed to book slot' });
      }
    } catch (err: any) {
      setBookingMessage({ type: 'error', text: err?.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-700" />
            <span>Student Services & Time-Slot Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Program-wise scheduled windows for ID card issuance, bus pass verification, and university uniforms.
          </p>
        </div>

        <button
          onClick={fetchServiceData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Slots</span>
        </button>
      </div>

      {/* Notice on demo schedule */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-center gap-3 shadow-xs">
        <Clock className="w-4 h-4 text-blue-700 flex-shrink-0" />
        <span>
          <strong>Configured Service Windows:</strong> MCA students: <strong>2:00 PM – 3:00 PM</strong> • BCA students: <strong>3:00 PM – 4:00 PM</strong> • B.Sc AI/ML: <strong>4:00 PM – 5:00 PM</strong>.
        </span>
      </div>

      {bookingMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            bookingMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {bookingMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{bookingMessage.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Counters */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Service Counters
          </h2>

          {counters.map((c) => {
            const isSelected = selectedCounter?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCounter(c)}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                      {c.serviceType === 'id_card' && <CreditCard className="w-4 h-4 text-blue-700" />}
                      {c.serviceType === 'bus_pass' && <Bus className="w-4 h-4 text-amber-700" />}
                      {c.serviceType === 'uniform' && <Shirt className="w-4 h-4 text-purple-700" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{c.name}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.operatingHours}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'text-blue-700' : ''}`} />
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[150px]">{c.location}</span>
                  </span>
                  <span className="text-blue-700 font-semibold">{c.currentBooked}/{c.dailyCapacity} Booked</span>
                </div>
              </button>
            );
          })}

          {/* Student's Active Booking Passes */}
          {myBookings.length > 0 && (
            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-blue-700" />
                <span>My Active Token Passes</span>
              </h3>

              <div className="space-y-2">
                {myBookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-blue-800 tracking-wider font-mono">{b.tokenNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {b.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{b.serviceName}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                      <span>Date: {b.date}</span>
                      <span className="text-slate-700 font-medium">{b.timeWindow}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{b.counterLocation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Slot Booking Details */}
        <div className="lg:col-span-8">
          {selectedCounter ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  {selectedCounter.location}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedCounter.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hours: {selectedCounter.operatingHours} • Daily Processing Cap: {selectedCounter.dailyCapacity} tokens
                </p>
              </div>

              {/* Required Documents Checklist */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Mandatory Documents Required at Counter</span>
                </h3>
                <ul className="space-y-1.5 text-slate-700">
                  {selectedCounter.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Time Slots Selection */}
              <form onSubmit={handleBookSlot} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Appointment Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-2">
                    Select Eligible Program Window
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCounter.timeSlots.map((ts) => {
                      const isSelected = selectedSlotId === ts.id;
                      const isFull = ts.bookedCount >= ts.maxCapacity;

                      return (
                        <div
                          key={ts.id}
                          onClick={() => !isFull && setSelectedSlotId(ts.id)}
                          className={`p-3.5 rounded-lg border text-left transition-colors ${
                            isFull
                              ? 'bg-slate-50 opacity-60 cursor-not-allowed border-slate-200'
                              : isSelected
                              ? 'bg-blue-50/80 border-blue-600 shadow-xs cursor-pointer'
                              : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{ts.timeWindow}</span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {ts.bookedCount}/{ts.maxCapacity} Booked
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {ts.programEligibility.map((p, i) => (
                              <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {p}
                              </span>
                            ))}
                          </div>

                          <div className="mt-2 text-[10px]">
                            {isFull ? (
                              <span className="text-rose-700 font-bold">Window Full</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">{ts.maxCapacity - ts.bookedCount} slots left</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600">
                    Booking for: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.programName || 'MCA'})
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlotId}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Appointment Slot'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Select a service counter on the left to view available windows.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
