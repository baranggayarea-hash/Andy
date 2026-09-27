import React, { useState } from 'react';
import { 
  Users, 
  Scale, 
  LifeBuoy, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight,
  Clock,
  Coins,
  ShieldCheck,
  HeartHandshake,
  Search,
  AlertTriangle,
  Building,
  Home,
  PhoneCall,
  BellRing,
  ClipboardList
} from 'lucide-react';
import { 
  Resident, 
  BlotterComplaint, 
  EmergencyIncident,
  EvacuationCenter,
  EmergencyAlert,
  DailyOperationLog, 
  BDRRMInfo 
} from '../types';
import { formatCurrency } from '../utils/formatters';

interface DashboardViewProps {
  residents: Resident[];
  complaints: BlotterComplaint[];
  incidents: EmergencyIncident[];
  evacuationCenters: EvacuationCenter[];
  emergencyAlerts: EmergencyAlert[];
  operations: DailyOperationLog[];
  visitors?: any[];
  bdrrm: BDRRMInfo;
  onNavigate: (tab: string) => void;
  onSelectComplaint: (complaint: BlotterComplaint) => void;
  onSelectResident: (resident: Resident) => void;
  onOpenNewBlotter: () => void;
  onOpenNewEmergency?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  residents,
  complaints,
  incidents,
  evacuationCenters,
  emergencyAlerts,
  operations,
  visitors,
  bdrrm,
  onNavigate,
  onSelectComplaint,
  onSelectResident,
  onOpenNewBlotter,
  onOpenNewEmergency,
}) => {
  const [aiReportModalOpen, setAiReportModalOpen] = useState(false);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportContent, setAiReportContent] = useState<string>('');
  const [quickResidentQuery, setQuickResidentQuery] = useState('');

  // Calculations
  const totalResidents = residents.length;
  const householdSet = new Set(residents.map(r => r.householdId));
  const totalHouseholds = householdSet.size;

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => 
    c.status === 'New / Pending' || 
    c.status === '1st Mediation' || 
    c.status === '2nd Conciliation' || 
    c.status === '3rd Arbitration'
  ).length;

  const settledComplaints = complaints.filter(c => c.status === 'Amicably Settled').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((settledComplaints / totalComplaints) * 100) : 100;

  // Emergency stats
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved / Stand-down');
  const criticalRedIncidents = incidents.filter(i => i.severity.includes('Code Red') && i.status !== 'Resolved / Stand-down');
  const totalEvacuees = evacuationCenters.reduce((sum, c) => sum + (c.currentOccupants || 0), 0);
  const totalCapacity = evacuationCenters.reduce((sum, c) => sum + c.capacityPersons, 0);
  const activeAlert = emergencyAlerts.find(a => a.isActive);

  // Sector breakdown
  const seniorsCount = residents.filter(r => r.sectorTags.includes('Senior Citizen') || r.age >= 60).length;
  const pwdsCount = residents.filter(r => r.sectorTags.includes('PWD (Person with Disability)')).length;
  const soloParentsCount = residents.filter(r => r.sectorTags.includes('Solo Parent')).length;
  const fourPsCount = residents.filter(r => r.sectorTags.includes('4Ps Beneficiary')).length;
  const votersCount = residents.filter(r => r.voterStatus === 'Registered').length;

  // Purok breakdown
  const purokCounts: Record<string, number> = {};
  residents.forEach(r => {
    purokCounts[r.purok] = (purokCounts[r.purok] || 0) + 1;
  });

  const urgentComplaints = complaints.filter(c => c.status !== 'Amicably Settled' && c.status !== 'Dismissed').slice(0, 4);
  const filteredQuickResidents = residents.filter(r => {
    if (!quickResidentQuery.trim()) return true;
    const q = quickResidentQuery.toLowerCase();
    return `${r.firstName} ${r.lastName} ${r.householdId}`.toLowerCase().includes(q);
  }).slice(0, 5);

  const handleGenerateAiReport = async () => {
    setAiReportLoading(true);
    setAiReportModalOpen(true);
    try {
      const logsSummary = operations.map(o => `${o.shift} (${o.activityType}): ${o.summary}`).join('\n');
      const response = await fetch('/api/ai/operations-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'Daily Operations & Emergency Rescue Report',
          stats: {
            residents: totalResidents,
            blottersTotal: totalComplaints,
            blottersSettled: settledComplaints,
            blottersPending: pendingComplaints,
            emergencyIncidents: activeIncidents.length,
            evacueesSheltered: totalEvacuees,
            patrolsCount: operations.length
          },
          logsSummary
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiReportContent(data.report);
      } else {
        setAiReportContent('Failed to generate report: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      setAiReportContent('Error contacting AI server: ' + err.message);
    } finally {
      setAiReportLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 4 Metric Cards Row (Professional Polish Archetype) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Residents */}
        <div 
          onClick={() => onNavigate('residents')}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-indigo-400 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Residents</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{totalResidents.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
              +{votersCount} Voters
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{totalHouseholds} Registered Households</p>
        </div>

        {/* Resident Complaints */}
        <div 
          onClick={() => onNavigate('complaints')}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-amber-400 transition-all cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resident Complaints</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{pendingComplaints}</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
              Active / In Progress
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{resolutionRate}% Resolution Rate ({settledComplaints} Resolved)</p>
        </div>

        {/* Emergency & Rescue Dispatches */}
        <div 
          onClick={() => onNavigate('emergency')}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emergency & Rescue</p>
            <LifeBuoy className="w-4 h-4 text-rose-500 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{activeIncidents.length}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              criticalRedIncidents.length > 0 
                ? 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse' 
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              {criticalRedIncidents.length > 0 ? `${criticalRedIncidents.length} Code Red` : 'All Stable'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">BDRRMC 24/7 Rapid Response Desk</p>
        </div>

        {/* Evacuation & Shelter Status */}
        <div 
          onClick={() => onNavigate('emergency')}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shelter & Evacuation</p>
            <Home className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{totalEvacuees}</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {evacuationCenters.filter(c => c.status === 'Open & Receiving').length} Hubs Open
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{totalCapacity} Total Capacity in Area 6</p>
        </div>
      </div>

      {/* 3 Columns Layout: Resident Directory + Urgent Complaints + Operations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Quick Resident Search (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Resident Search</h3>
            <button 
              onClick={() => onNavigate('residents')}
              className="text-indigo-600 hover:text-indigo-700 font-bold text-[10px] uppercase tracking-wider"
            >
              VIEW ALL
            </button>
          </div>

          <div className="p-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name or ID..."
                value={quickResidentQuery}
                onChange={(e) => setQuickResidentQuery(e.target.value)}
                className="w-full text-xs bg-slate-100 border-none rounded-lg py-2.5 pl-9 pr-3 outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 max-h-[380px]">
            {filteredQuickResidents.map((r) => {
              const initials = `${r.firstName[0] || ''}${r.lastName[0] || ''}`;
              return (
                <div 
                  key={r.id}
                  onClick={() => {
                    onSelectResident(r);
                    onNavigate('residents');
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{r.lastName}, {r.firstName} {r.middleName ? r.middleName[0] + '.' : ''}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight truncate">
                      {r.householdId} • {r.purok.split(' - ')[0]} • {r.sectorTags[0] || (r.isHouseholdHead ? 'Household Head' : 'Resident')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Urgent Complaints (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Resident Complaints & Grievances</h3>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 h-2 w-2 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                {pendingComplaints} Active Desk
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px]">
            {urgentComplaints.length > 0 ? (
              urgentComplaints.map((c, idx) => {
                const isUrgent = c.priority === 'Urgent' || idx === 0;
                const ticketNumber = c.complaintNumber || c.blotterNumber || 'CMP-000';
                return (
                  <div 
                    key={c.id}
                    onClick={() => {
                      onSelectComplaint(c);
                      onNavigate('complaints');
                    }}
                    className={`border-l-4 ${isUrgent ? 'border-red-500 bg-red-50/30' : 'border-amber-500 bg-amber-50/30'} p-3 rounded-r-lg cursor-pointer hover:shadow-xs transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{c.incidentCategory}</h4>
                      <span className={`text-[9px] font-bold bg-white px-1.5 py-0.5 rounded shrink-0 border ${
                        isUrgent ? 'text-red-600 border-red-200' : 'text-amber-600 border-amber-200'
                      }`}>
                        {c.priority ? `${c.priority.toUpperCase()} PRIO` : 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{c.narrative}</p>
                    <div className="mt-2 flex justify-between items-center pt-1 border-t border-slate-100/60">
                      <p className="text-[9px] text-slate-400">
                        {ticketNumber} • {c.incidentLocation.split(',')[0]}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c);
                          onNavigate('complaints');
                        }}
                        className="text-[10px] font-bold text-indigo-600 px-2 py-0.5 bg-white rounded border border-slate-200 shadow-xs uppercase tracking-wider hover:bg-indigo-50"
                      >
                        VIEW TICKET
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No active resident grievances recorded.</p>
            )}
          </div>
        </div>

        {/* Column 3: Daily Operations (3 Cols - Dark Slate Container) */}
        <div className="lg:col-span-3 bg-[#0F172A] text-slate-300 rounded-xl flex flex-col shadow-lg border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
              <span>Daily Operations</span>
            </h3>
            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
              Operations
            </span>
          </div>

          <div className="flex-1 p-4 space-y-5 overflow-y-auto max-h-[380px]">
            {/* Active Now Item */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Active Operations Shift</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                <p className="text-xs font-bold text-white mb-0.5">
                  {operations[0]?.shift || 'Morning Operations Shift (06:00 - 14:00)'}
                </p>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {operations[0]?.summary || 'Public works, road clearing, and administrative operations on duty.'}
                </p>
              </div>
            </div>

            {/* Shift Timeline */}
            <div className="relative pl-4 border-l border-slate-700 space-y-4">
              {operations.slice(0, 3).map((op, idx) => (
                <div key={op.id || idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-[#0F172A]"></div>
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">{op.logDate} • {op.shift.split(' ')[0]}</p>
                  <p className="text-xs font-semibold text-white truncate">{op.activityType}</p>
                  <p className="text-[10px] text-slate-400 truncate">OIC: {op.officerInCharge}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/50 space-y-2">
            <button 
              onClick={() => onNavigate('operations')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-2.5 rounded-lg transition-colors uppercase tracking-widest shadow-sm flex items-center justify-center gap-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Log Operations Shift</span>
            </button>
            <button
              onClick={handleGenerateAiReport}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold py-2 rounded-lg transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Operations Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Demographics & Social Welfare Analytics + BDRRMC Bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Purok Population Distribution (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Area 6 Purok & Sitio Population Distribution
              </h3>
              <p className="text-[11px] text-slate-500">Registered household census across Area 6 jurisdiction</p>
            </div>
            <button 
              onClick={() => onNavigate('residents')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(purokCounts).map(([purok, count]) => {
              const percentage = totalResidents > 0 ? Math.round((count / totalResidents) * 100) : 0;
              return (
                <div key={purok} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{purok}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{count} residents ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Welfare Tags */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Special & Vulnerable Sectors Roster
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-base font-bold text-slate-900">{seniorsCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">Senior Citizens</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-base font-bold text-slate-900">{pwdsCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">PWDs</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-base font-bold text-slate-900">{soloParentsCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">Solo Parents</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-base font-bold text-slate-900">{fourPsCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">4Ps Beneficiaries</div>
              </div>
            </div>
          </div>
        </div>

        {/* BDRRMC & Emergency Preparedness (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Disaster Desk Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                BDRRMC Disaster & Weather Status
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                bdrrm.alertLevel.includes('Normal') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {bdrrm.alertLevel.split(' ')[0]}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <p className="text-xs font-bold text-slate-900 mb-1">{bdrrm.advisoryTitle}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">{bdrrm.advisoryDetails}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Weather: <strong className="text-slate-800">{bdrrm.weatherCondition}</strong></span>
              <span className="text-[10px] font-mono text-slate-400">Updated: {bdrrm.updatedAt}</span>
            </div>

            <button
              onClick={() => onNavigate('emergency')}
              className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Open Emergency & Rescue Operations</span>
            </button>
          </div>

          {/* Emergency Hotlines */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Area 6 Emergency Quick Contacts
            </h4>
            <div className="space-y-2">
              {bdrrm.hotlines.slice(0, 3).map((hotline, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{hotline.label}</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">{hotline.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {aiReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Barangay Executive Operations Accomplishment Brief</h3>
                  <p className="text-[11px] text-slate-500">AI-generated official report for DILG & City Government submission</p>
                </div>
              </div>
              <button 
                onClick={() => setAiReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {aiReportLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-slate-600">Synthesizing census records, blotters, and tanod patrol logs...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-800">
                  {aiReportContent}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex justify-end space-x-2 bg-slate-50">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiReportContent);
                  alert('Report copied to clipboard!');
                }}
                disabled={aiReportLoading}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setAiReportModalOpen(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
