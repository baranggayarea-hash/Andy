import React from 'react';
import { Printer, X, ShieldAlert, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';
import { ResidentComplaint, BarangayOfficial } from '../types';
import { formatDate } from '../utils/formatters';

interface PrintableComplaintTicketModalProps {
  complaint: ResidentComplaint | null;
  officials: BarangayOfficial[];
  onClose: () => void;
}

export const PrintableComplaintTicketModal: React.FC<PrintableComplaintTicketModalProps> = ({
  complaint,
  officials,
  onClose,
}) => {
  if (!complaint) return null;

  const captain = officials.find(o => o.position.toLowerCase().includes('punong') || o.position.toLowerCase().includes('captain')) || {
    name: 'HON. RODRIGO M. ALVAREZ',
    position: 'Punong Barangay / Barangay Captain'
  };

  const secretary = officials.find(o => o.position.toLowerCase().includes('secretary')) || {
    name: 'HON. MA. TERESA C. RAMOS',
    position: 'Barangay Secretary'
  };

  const chiefTanod = officials.find(o => o.position.toLowerCase().includes('tanod')) || {
    name: 'OFFICER GABRIEL T. MORALES',
    position: 'Chief Barangay Tanod / BPAT Commander'
  };

  const handlePrint = () => {
    window.print();
  };

  const displayTicketNum = complaint.complaintNumber || complaint.blotterNumber || 'CMP-2026-0000';

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150">
        {/* Modal Controls Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Official Barangay Resident Complaint Slip • {displayTicketNum}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors text-lg font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-8 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print:p-6 print:m-0 print:shadow-none" id="printable-complaint-slip">
          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900 relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-black bg-slate-100 text-slate-800 uppercase shrink-0">
                SEAL
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-slate-600">
                  Republic of the Philippines • City / Province of Bulacan
                </p>
                <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  Barangay San Jose Annex (Area 6)
                </h1>
                <p className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  Office of the Punong Barangay • Public Assistance & Grievance Desk
                </p>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-indigo-800 flex items-center justify-center text-xs font-black bg-indigo-50 text-indigo-900 uppercase shrink-0">
                BPAT
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-xs">
              <div className="text-left font-mono">
                <span className="text-slate-500">TICKET NO:</span>{' '}
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{displayTicketNum}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">FILING DATE:</span>{' '}
                <span className="font-semibold text-slate-900">{formatDate(complaint.incidentDate)} {complaint.incidentTime}</span>
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="my-5 text-center">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 bg-slate-100 py-1.5 border-y border-slate-300">
              Resident Complaint & Action Slip
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              Katibayan ng Opisyal na Sumbong at Aksyong Pambarangay
            </p>
          </div>

          {/* Incident Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-5">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Category</span>
              <span className="font-bold text-slate-900">{complaint.incidentCategory}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Priority</span>
              <span className={`font-bold inline-block px-1.5 py-0.5 rounded text-[10px] uppercase ${
                complaint.priority === 'Urgent' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                complaint.priority === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-slate-200 text-slate-800'
              }`}>
                {complaint.priority || 'Normal'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Jurisdiction / Purok</span>
              <span className="font-semibold text-slate-900">{complaint.purok}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Desk Status</span>
              <span className="font-bold text-indigo-700">{complaint.status}</span>
            </div>
          </div>

          {/* Complainant & Subject Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-5">
            {/* Complainant Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                Complainant (Nagsusumbong)
              </p>
              {complaint.isAnonymous ? (
                <div className="p-2 bg-slate-200 rounded text-slate-700 italic font-medium">
                  Confidential / Anonymous Resident Report (Protected under Area 6 Citizen Safety Policy)
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {(complaint.complainantNames || []).join(', ') || 'Concerned Resident'}
                  </p>
                  <p className="text-slate-600">
                    <span className="text-slate-400">Contact:</span> {(complaint.complainantContacts || []).join(', ') || 'N/A'}
                  </p>
                  <p className="text-slate-600">
                    <span className="text-slate-400">Address:</span> {(complaint.complainantAddresses || []).join(', ') || complaint.incidentLocation}
                  </p>
                </div>
              )}
            </div>

            {/* Respondent / Target Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                Concern Subject / Respondent (Inirereklamo o Pook)
              </p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {(complaint.respondentNames || []).join(', ') || 'Unspecified Party'}
                </p>
                <p className="text-slate-600">
                  <span className="text-slate-400">Location:</span> {complaint.incidentLocation}
                </p>
                {complaint.respondentAddresses && complaint.respondentAddresses.length > 0 && (
                  <p className="text-slate-600">
                    <span className="text-slate-400">Address:</span> {complaint.respondentAddresses.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="text-xs mb-5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Grievance Narrative / Detalye ng Reklamo
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs">
              {complaint.narrative}
            </div>
            {complaint.requestedAction && (
              <div className="mt-2 text-[11px] text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                <span className="font-bold">Requested Remedy:</span> {complaint.requestedAction}
              </div>
            )}
          </div>

          {/* Action Log History */}
          <div className="text-xs mb-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Official Barangay Actions & Tanod Field Reports
            </p>
            {complaint.actionLogs && complaint.actionLogs.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-[11px]">
                {complaint.actionLogs.map((log, index) => (
                  <div key={log.id || index} className="p-2.5 flex items-start gap-3 bg-white">
                    <span className="font-mono text-slate-400 shrink-0 text-[10px]">
                      {log.actionDate} {log.actionTime}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 mr-2">[{log.actionType}]</span>
                      <span className="text-slate-600">{log.description}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                      By: {log.actionBy}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 italic text-[11px] text-center">
                Initial complaint received. Field inspection and tanod dispatch in queue.
              </div>
            )}
          </div>

          {/* Resolution Summary if Closed */}
          {complaint.status === 'Resolved & Closed' && complaint.resolutionSummary && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 mb-6">
              <p className="font-bold text-emerald-800 uppercase text-[10px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Resolution & Final Outcome
              </p>
              <p className="text-[11px] leading-relaxed">{complaint.resolutionSummary}</p>
              {complaint.resolvedAt && (
                <p className="text-[10px] text-emerald-700 mt-1 font-mono">
                  Closed on: {formatDate(complaint.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {/* Signatures & Seal Block */}
          <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-12 flex items-end justify-center">
                <div className="w-36 border-b border-slate-800"></div>
              </div>
              <p className="font-bold text-slate-900 mt-1 text-[11px]">
                {complaint.isAnonymous ? 'CONFIDENTIAL REPORT' : (complaint.complainantNames?.[0] || 'Complainant')}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Complainant Acknowledgment</p>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center">
                <div className="w-36 border-b border-slate-800"></div>
              </div>
              <p className="font-bold text-slate-900 mt-1 text-[11px]">
                {complaint.assignedOfficer || chiefTanod.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Investigating Officer / Tanod</p>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center">
                <div className="w-36 border-b border-slate-800"></div>
              </div>
              <p className="font-bold text-slate-900 mt-1 text-[11px]">
                {captain.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Punong Barangay</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400 uppercase tracking-widest font-mono">
            Barangay San Jose Annex Area 6 MIS • Official Citizen Grievance Record • Computer-Generated Slip
          </div>
        </div>
      </div>
    </div>
  );
};
