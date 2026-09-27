import React from 'react';
import { Printer, X, ShieldAlert, CheckCircle, AlertTriangle, LifeBuoy, MapPin, Clock, Users, Phone } from 'lucide-react';
import { EmergencyIncident, BarangayOfficial } from '../types';
import { formatDate } from '../utils/formatters';

interface PrintableEmergencyReportModalProps {
  incident: EmergencyIncident;
  officials: BarangayOfficial[];
  onClose: () => void;
}

export const PrintableEmergencyReportModal: React.FC<PrintableEmergencyReportModalProps> = ({
  incident,
  officials,
  onClose
}) => {
  const punongBarangay = officials.find(o => o.position.includes('Punong Barangay'))?.name || 'Hon. Rodrigo M. Alvarez';
  const bdrrmChair = officials.find(o => o.committee?.includes('Disaster') || o.name.includes('Ramos'))?.name || 'Hon. Ernesto V. Ramos';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 print:p-0 print:bg-white animate-in fade-in duration-150">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:rounded-none flex flex-col my-4">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 rounded-lg text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Official BDRRMC Emergency Incident & Rescue After-Action Report</h3>
              <p className="text-xs text-slate-400">Incident Code: {incident.incidentCode} • NDRRMC / DILG Standard Compliant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl flex items-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Standard Letter / A4 Print Format) */}
        <div className="print-page p-8 sm:p-12 text-slate-900 bg-white font-sans text-xs sm:text-sm selection:bg-rose-100">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-slate-800 flex items-center justify-center font-cinzel font-bold text-center text-xs p-1 text-slate-800 shrink-0">
                BARANGAY<br/>SEAL
              </div>
              <div className="text-center flex-1">
                <p className="text-xs tracking-widest uppercase font-semibold text-slate-600">Republic of the Philippines</p>
                <p className="text-xs tracking-widest uppercase font-semibold text-slate-600">National Capital Region / Local Government Unit</p>
                <h1 className="text-base sm:text-lg font-bold font-cinzel uppercase text-slate-900 tracking-wider">
                  Barangay San Jose Annex Area 6
                </h1>
                <p className="text-xs font-bold text-rose-700 tracking-wider uppercase mt-0.5">
                  Barangay Disaster Risk Reduction & Management Council (BDRRMC)
                </p>
                <p className="text-[10px] text-slate-500">
                  Emergency Operations Center (EOC) • Rescue 911 Hotline: (02) 8892-9111 • Area 6 Dispatch Desk
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-rose-800 flex items-center justify-center font-cinzel font-bold text-center text-xs p-1 text-rose-800 shrink-0">
                BDRRMC<br/>RESCUE
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center mb-6">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
              Emergency Incident After-Action Report (AAR)
            </h2>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Control Reference: <span className="font-bold text-slate-900">{incident.incidentCode}</span> • Official Incident Log
            </p>
          </div>

          {/* Section 1: Incident Summary & Classification */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Incident Type</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">{incident.incidentType}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Severity Alarm</span>
              <span className={`font-bold text-xs ${incident.severity.includes('Red') ? 'text-rose-600' : 'text-amber-600'}`}>
                {incident.severity}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Jurisdiction Purok</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">{incident.purok}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Operational Status</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">{incident.status}</span>
            </div>
          </div>

          {/* Section 2: Caller, Location & Timeline */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              I. Dispatch Timeline & Caller Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p><span className="text-slate-500 font-medium">Exact Landmark/Location:</span> <strong className="text-slate-900">{incident.exactLocation}</strong></p>
                <p className="mt-1"><span className="text-slate-500 font-medium">Reporting Party:</span> <strong className="text-slate-900">{incident.callerName}</strong></p>
                <p className="mt-1"><span className="text-slate-500 font-medium">Caller Contact:</span> <strong className="text-slate-900">{incident.callerContact}</strong></p>
                <p className="mt-1"><span className="text-slate-500 font-medium">Report Logged By:</span> <strong className="text-slate-900">{incident.loggedBy}</strong></p>
              </div>
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p><span className="text-slate-500">Call Logged:</span> <strong>{new Date(incident.reportedAt).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}</strong></p>
                <p><span className="text-slate-500">Dispatched:</span> <strong>{incident.dispatchedAt ? new Date(incident.dispatchedAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }) : 'Immediate upon call'}</strong></p>
                <p><span className="text-slate-500">Arrived On-Scene:</span> <strong>{incident.onSceneAt ? new Date(incident.onSceneAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }) : 'En route'}</strong></p>
                <p><span className="text-slate-500">Resolved / Stand-down:</span> <strong>{incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' }) : 'Active Monitoring'}</strong></p>
              </div>
            </div>
          </div>

          {/* Section 3: Casualty & Rescue Statistics */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              II. Casualty, Rescue & Evacuee Count
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-lg font-bold text-slate-900">{incident.personsAtRisk}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Persons at Risk</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-lg font-bold text-emerald-700">{incident.rescuedCount}</div>
                <div className="text-[10px] text-emerald-600 uppercase font-semibold">Successfully Rescued</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-lg font-bold text-amber-700">{incident.injuries}</div>
                <div className="text-[10px] text-amber-600 uppercase font-semibold">Injuries Treated</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-lg font-bold text-rose-700">{incident.casualties}</div>
                <div className="text-[10px] text-rose-600 uppercase font-semibold">Fatalities</div>
              </div>
            </div>

            {incident.vulnerablePersonsNoted && incident.vulnerablePersonsNoted.length > 0 && (
              <div className="mt-3 p-2.5 bg-rose-50/60 border border-rose-200/80 rounded-lg text-xs">
                <span className="font-bold text-rose-800">Special Vulnerable Sectors Documented on Scene:</span>
                <ul className="list-disc list-inside mt-1 text-slate-700 space-y-0.5">
                  {incident.vulnerablePersonsNoted.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {incident.evacuationCenterAssigned && (
              <div className="text-xs text-slate-700 mt-2">
                <strong>Assigned Evacuation Center:</strong> {incident.evacuationCenterAssigned}
              </div>
            )}
          </div>

          {/* Section 4: Narrative & Responders */}
          <div className="border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              III. Operational Narrative & Actions Taken
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3 rounded-lg border border-slate-100">
              {incident.description}
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Responding Unit:</span>
                <strong className="text-slate-900">{incident.assignedUnit}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Disaster Equipment / Gear Deployed:</span>
                <span className="text-slate-800">{incident.equipmentUsed.join(', ') || 'Standard emergency rescue pack'}</span>
              </div>
            </div>

            {incident.notes && (
              <div className="mt-2 text-xs text-slate-600 italic">
                <strong>Officer Notes:</strong> {incident.notes}
              </div>
            )}
          </div>

          {/* Section 5: Official Signatures Block */}
          <div className="mt-12 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                  {incident.loggedBy}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Incident Action Recorder / Tanod Desk
                </div>
              </div>

              <div>
                <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                  {bdrrmChair}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Barangay Disaster Risk Officer
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                  {punongBarangay}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Punong Barangay / BDRRMC Chairman
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
              Report rendered via San Jose Annex Area 6 MIS • Philippine Disaster Risk Reduction & Management Act (RA 10121) Compliant
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
