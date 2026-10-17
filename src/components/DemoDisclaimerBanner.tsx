import React from 'react';
import { Info, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  totalRooms: number;
  totalClasses: number;
}

export const DemoDisclaimerBanner: React.FC<Props> = ({ totalRooms, totalClasses }) => {
  return (
    <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
        <span className="font-semibold text-slate-900">MMU Mullana Operational Demo</span>
        <span className="hidden md:inline text-slate-300">|</span>
        <span className="text-slate-600">
          Configured with <strong className="text-slate-900">{totalRooms} Rooms</strong> and <strong className="text-slate-900">{totalClasses} Class Sections</strong> (Planning Parameters)
        </span>
      </div>

      <div className="flex items-center gap-4 text-slate-600">
        <div className="flex items-center gap-1.5 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Role-Based Access Enforced</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Campus Assistant Enabled</span>
        </div>
      </div>
    </div>
  );
};
