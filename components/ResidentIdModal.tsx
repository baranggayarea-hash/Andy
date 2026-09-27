import React from 'react';
import { CreditCard, Printer, X, ShieldCheck, QrCode } from 'lucide-react';
import { Resident, BarangayOfficial } from '../types';
import { formatDate } from '../utils/formatters';

interface ResidentIdModalProps {
  resident: Resident;
  officials: BarangayOfficial[];
  onClose: () => void;
}

export const ResidentIdModal: React.FC<ResidentIdModalProps> = ({
  resident,
  officials,
  onClose,
}) => {
  const captain = officials.find(o => o.position.includes('Punong Barangay'))?.name || 'Hon. Rodrigo M. Alvarez';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl no-print">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Barangay Resident ID Card</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* ID Card Display Area */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center space-y-6">
          {/* FRONT OF ID */}
          <div className="w-[380px] h-[240px] bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-4 text-white shadow-xl border-2 border-emerald-500/40 relative overflow-hidden flex flex-col justify-between print-page">
            {/* Hologram subtle shine effect */}
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-cinzel font-bold text-[9px] text-white border border-emerald-300/40">
                  SJ-A6
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-emerald-300 font-sans font-bold">Republic of the Philippines</div>
                  <div className="text-[11px] font-extrabold tracking-tight text-white leading-tight">BARANGAY SAN JOSE ANNEX (AREA 6)</div>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                RESIDENT ID
              </span>
            </div>

            {/* Middle Section: Photo + Resident Details */}
            <div className="flex items-center space-x-3 py-1">
              {/* Photo Box */}
              <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-emerald-400/50 flex flex-col items-center justify-center text-center overflow-hidden flex-shrink-0 shadow">
                <div className="font-bold text-lg text-emerald-300 font-cinzel">
                  {resident.firstName.charAt(0)}{resident.lastName.charAt(0)}
                </div>
                <span className="text-[7.5px] text-slate-400 font-mono mt-1">AREA 6</span>
              </div>

              {/* Data Fields */}
              <div className="space-y-0.5 text-[9.5px] font-sans flex-1">
                <div className="font-bold text-xs text-white leading-tight">
                  {resident.lastName}, {resident.firstName} {resident.middleName?.charAt(0)}. {resident.extensionName || ''}
                </div>
                <div className="text-emerald-300 text-[8.5px]">
                  <strong>ID:</strong> <span className="font-mono">{resident.id}</span> • <strong>HH:</strong> <span className="font-mono">{resident.householdId}</span>
                </div>
                <div className="text-slate-300 text-[8.5px]">
                  {resident.houseNumber} {resident.streetName}, {resident.purok}
                </div>
                <div className="text-slate-300 text-[8.5px] flex justify-between pt-0.5">
                  <span>DOB: <strong>{resident.birthDate}</strong></span>
                  <span>Blood: <strong>{resident.bloodType || 'O+'}</strong></span>
                </div>
                <div className="text-slate-300 text-[8.5px]">
                  Voter: <strong className="text-emerald-300">{resident.voterStatus}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Footer & Captain Signature */}
            <div className="flex items-end justify-between pt-1 border-t border-emerald-500/30 text-[8px]">
              <div>
                <span className="text-slate-400 block text-[7.5px]">ISSUED: {formatDate(new Date().toISOString())}</span>
                <span className="text-emerald-400 font-mono text-[7px]">SECURE-BARANGAY-ID-PH</span>
              </div>

              <div className="text-right">
                <div className="font-bold text-white text-[9px] uppercase leading-none">{captain}</div>
                <div className="text-[7px] text-emerald-300 font-sans font-bold">Punong Barangay</div>
              </div>
            </div>
          </div>

          {/* BACK OF ID */}
          <div className="w-[380px] h-[240px] bg-slate-900 rounded-2xl p-4 text-white shadow-xl border-2 border-slate-700 relative overflow-hidden flex flex-col justify-between print-page">
            <div className="space-y-1 text-[8.5px] font-sans text-slate-300 border-b border-slate-800 pb-2">
              <div className="font-bold text-emerald-400 text-[9px] uppercase">Terms and Conditions</div>
              <p className="leading-tight text-[8px] text-slate-400">
                This Barangay Identification Card certifies that the bearer is a bonafide resident of Barangay San Jose Annex Area 6. If lost and found, please return to Barangay San Jose Annex Hall, Area 6.
              </p>
            </div>

            {/* Emergency Contact */}
            <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700 text-[8.5px] space-y-0.5">
              <div className="font-bold text-rose-400 uppercase text-[7.5px]">In Case of Emergency Notify:</div>
              <div className="text-white font-semibold">{resident.emergencyContact.name || 'Next of Kin'} ({resident.emergencyContact.relation || 'Relative'})</div>
              <div className="text-slate-300 font-mono">Contact: {resident.emergencyContact.contact || resident.contactNumber || 'Barangay Hall Desk'}</div>
            </div>

            {/* QR / Barcode Stamp */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[8px] text-slate-400">
              <div className="space-y-0.5">
                <div className="font-mono text-emerald-400">QR: {resident.id}-SJ-A6</div>
                <div>Hotline: (02) 8921-4450</div>
              </div>

              <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
