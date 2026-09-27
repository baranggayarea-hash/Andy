import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  Printer,
  Users
} from 'lucide-react';
import { BarangayOfficial } from '../types';

interface OfficialsViewProps {
  officials: BarangayOfficial[];
}

export const OfficialsView: React.FC<OfficialsViewProps> = ({ officials }) => {
  const captain = officials.find(o => o.position.includes('Punong Barangay'));
  const kagawads = officials.filter(o => o.position.includes('Kagawad') || o.position.includes('Sangguniang'));
  const appointed = officials.filter(o => !o.position.includes('Punong Barangay') && !o.position.includes('Kagawad'));

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Sangguniang Barangay & Barangay Administration Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Elected and appointed officials of Barangay San Jose Annex Area 6 (Term 2023 - 2026)
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors no-print border border-slate-200"
        >
          <Printer className="w-4 h-4" />
          <span>Print Directory</span>
        </button>
      </div>

      {/* Punong Barangay Showcase Card */}
      {captain && (
        <div className="bg-[#0F172A] rounded-xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-md">
              {captain.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                HEAD OF LOCAL GOVERNMENT
              </span>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">{captain.name}</h3>
              <p className="text-xs font-semibold text-indigo-300">{captain.position}</p>
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{captain.contactNumber}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{captain.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-1 sm:max-w-xs w-full">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Executive Schedule</div>
            <div className="text-slate-100 font-medium">{captain.schedule || 'Monday to Friday (8:00 AM - 5:00 PM)'}</div>
            <div className="text-[10px] text-emerald-400 font-mono pt-1">Term: {captain.term}</div>
          </div>
        </div>
      )}

      {/* Sangguniang Barangay Kagawads */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Sangguniang Barangay Councilors (Kagawad)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kagawads.map((k) => (
            <div key={k.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm border border-slate-200">
                  {k.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">{k.name}</h4>
                  <p className="text-[11px] text-emerald-700 font-semibold">{k.position}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Committee Chairmanship</span>
                  <span className="font-medium text-slate-800">{k.committee}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>{k.contactNumber}</span>
                  <span className="font-mono text-[10px] text-slate-400">{k.term}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointed Staff & Key Officers */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Appointed Barangay Administrative & Security Officers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appointed.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">{a.name}</h4>
                <p className="text-[11px] text-purple-700 font-semibold">{a.position}</p>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-mono">{a.contactNumber}</div>
                <div className="text-[10px] text-slate-400">{a.schedule}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
