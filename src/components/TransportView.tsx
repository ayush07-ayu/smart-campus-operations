import React, { useState } from 'react';
import {
  Bus,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserCheck,
  Wrench,
  X,
  FileCheck,
  AlertOctagon,
} from 'lucide-react';
import {
  CampusVehicle,
  TripSchedule,
  Employee,
  UserRole,
} from '../types/campus.ts';

interface TransportViewProps {
  currentRole: UserRole;
  currentUserName: string;
  vehicles: CampusVehicle[];
  tripSchedules: TripSchedule[];
  employees: Employee[];
  onRefresh: () => void;
}

export const TransportView: React.FC<TransportViewProps> = ({
  currentRole,
  currentUserName,
  vehicles,
  tripSchedules,
  employees,
  onRefresh,
}) => {
  const [showTripModal, setShowTripModal] = useState(false);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [activeTripForSubstitute, setActiveTripForSubstitute] = useState<TripSchedule | null>(null);

  // New Trip Form
  const [tripDate, setTripDate] = useState('2026-10-16');
  const [routeName, setRouteName] = useState('Route 1: Campus to Central Metro');
  const [origin, setOrigin] = useState('Campus Terminal');
  const [destination, setDestination] = useState('Central Metro Hub');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [driverId, setDriverId] = useState('');
  const [attendantName, setAttendantName] = useState('Baldev Ram');
  const [departureTime, setDepartureTime] = useState('11:00');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('11:50');
  const [tripError, setTripError] = useState<string | null>(null);
  const [tripLoading, setTripLoading] = useState(false);

  // Substitute Driver Form
  const [subDriverId, setSubDriverId] = useState('');
  const [subReason, setSubReason] = useState('');
  const [subError, setSubError] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  const todayStr = '2026-10-16';

  // Driver employees
  const drivers = employees.filter((e) => e.departmentId === 'dept-trn' && e.status === 'active');

  // Handle Create Trip
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setTripError(null);
    setTripLoading(true);

    try {
      const res = await fetch('/api/transport/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: tripDate,
          routeName,
          origin,
          destination,
          vehicleId,
          driverId,
          attendantName,
          departureTime,
          expectedArrivalTime,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTripError(data.error || 'Failed to schedule trip');
      } else {
        setShowTripModal(false);
        onRefresh();
      }
    } catch (err: any) {
      setTripError(err.message || 'Network error');
    } finally {
      setTripLoading(false);
    }
  };

  // Handle Authorize Substitute Driver
  const handleAuthorizeSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTripForSubstitute) return;
    setSubError(null);
    setSubLoading(true);

    try {
      const res = await fetch(`/api/transport/trips/${activeTripForSubstitute.id}/substitute-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          substituteDriverId: subDriverId,
          reason: subReason,
          authorizerName: currentUserName,
          authorizerRole: currentRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubError(data.error || 'Failed to authorize substitute');
      } else {
        setShowSubstituteModal(false);
        setSubReason('');
        onRefresh();
      }
    } catch (err: any) {
      setSubError(err.message || 'Network error');
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Campus Mobility & Shuttle Logistics</span>
            <span>·</span>
            <span className="text-slate-500 font-normal">Overlapping Trip Conflict Lock</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transport & Fleet Services
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bus fleet tracking, route schedules, driver conflict prevention, and substitute authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setTripError(null);
              setShowTripModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Bus Trip</span>
          </button>
        </div>
      </div>

      {/* Vehicle Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((veh) => {
          const daysToService = Math.round(
            (new Date(veh.nextServiceDueDate).getTime() - new Date(todayStr).getTime()) /
              (1000 * 3600 * 24)
          );
          const isServiceSoon = daysToService >= 0 && daysToService <= 7;

          return (
            <div
              key={veh.id}
              className={`p-5 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
                isServiceSoon ? 'border-amber-300 ring-1 ring-amber-300/60' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {veh.vehicleNumber}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      veh.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {veh.status}
                  </span>
                </div>

                <h2 className="font-bold text-slate-900 text-sm mt-2">{veh.model}</h2>
                <div className="text-slate-500 text-xs mt-0.5">{veh.type} · {veh.fuelType}</div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 font-mono text-slate-600 tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Odometer:</span>
                    <span className="font-semibold text-slate-800">{veh.mileageKm.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fitness Valid:</span>
                    <span className="text-slate-700">{veh.fitnessValidUntil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Service:</span>
                    <span className={isServiceSoon ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                      {veh.nextServiceDueDate} {isServiceSoon ? `(In ${daysToService}d)` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {isServiceSoon && (
                <div className="mt-4 p-2 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Workshop service maintenance scheduled soon.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trip Schedules Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Transit Route Schedules ({tripSchedules.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned vehicles, designated drivers, route timings, and substitute driver status.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live fleet dispatch</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="py-2.5 font-medium">Trip Code</th>
                <th className="py-2.5 font-medium">Route & Terminals</th>
                <th className="py-2.5 font-medium">Vehicle</th>
                <th className="py-2.5 font-medium">Driver</th>
                <th className="py-2.5 font-medium">Timings</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium text-right">Substitute Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tripSchedules.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-900">{trip.tripCode}</td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-900 block">{trip.routeName}</span>
                    <span className="text-slate-400 font-mono text-[11px] block">
                      {trip.origin} ⟶ {trip.destination}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-800">{trip.vehicleNumber}</td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{trip.driverName}</div>
                    <div className="text-slate-400 text-[11px]">Attendant: {trip.attendantName}</div>
                  </td>
                  <td className="py-3 font-mono tabular-nums text-slate-700">
                    {trip.departureTime} - {trip.expectedArrivalTime}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        trip.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : trip.status === 'scheduled'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {trip.status !== 'completed' ? (
                      <button
                        onClick={() => {
                          setActiveTripForSubstitute(trip);
                          setShowSubstituteModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                      >
                        {trip.isSubstituteDriver ? 'Change Substitute' : 'Authorize Substitute'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Trip Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Schedule Bus Trip */}
      {showTripModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule Campus Transit Trip</h3>
              <button onClick={() => setShowTripModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tripError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tripError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Assigned Vehicle</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Route Name</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                  placeholder="e.g. Route 3: North Campus Express"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Origin Terminal</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Destination Hub</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Assigned Driver</label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="">Select Qualified Driver...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.employeeCode})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Backend will prevent driver assignment if an overlapping trip or approved leave exists.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Departure Time (24h)</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Expected Arrival Time (24h)</label>
                  <input
                    type="time"
                    value={expectedArrivalTime}
                    onChange={(e) => setExpectedArrivalTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTripModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tripLoading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {tripLoading ? 'Verifying Conflict...' : 'Schedule Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Authorize Substitute Driver */}
      {showSubstituteModal && activeTripForSubstitute && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Authorize Substitute Driver</h3>
              <button onClick={() => setShowSubstituteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {subError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{subError}</span>
              </div>
            )}

            <form onSubmit={handleAuthorizeSubstitute} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-bold text-slate-900">{activeTripForSubstitute.tripCode}: {activeTripForSubstitute.routeName}</div>
                <div className="text-slate-600 font-mono text-[11px] mt-1">
                  Time: {activeTripForSubstitute.departureTime}-{activeTripForSubstitute.expectedArrivalTime} · Current: {activeTripForSubstitute.driverName}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Authorized Substitute Driver</label>
                <select
                  value={subDriverId}
                  onChange={(e) => setSubDriverId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="">Select Replacement Driver...</option>
                  {drivers
                    .filter((d) => d.id !== activeTripForSubstitute.driverId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.employeeCode})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Supervisor Authorization Reason</label>
                <textarea
                  rows={3}
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  required
                  placeholder="e.g. Primary driver reported medical indisposition / vehicle handover verified"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubstituteModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {subLoading ? 'Authorizing...' : 'Authorize & Sign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
