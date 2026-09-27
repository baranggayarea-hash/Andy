import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  PhoneCall, 
  LifeBuoy, 
  Users, 
  Home, 
  Radio, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Activity, 
  Flame, 
  Droplets, 
  Ambulance, 
  Truck, 
  Zap, 
  Utensils, 
  HeartPulse, 
  ChevronRight, 
  Sparkles,
  Volume2,
  BellRing,
  ExternalLink,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { 
  EmergencyIncident, 
  EvacuationCenter, 
  EmergencyAlert, 
  RescueResponder, 
  Resident, 
  EquipmentItem, 
  BarangayOfficial, 
  Purok,
  EmergencyIncidentType,
  IncidentSeverity,
  IncidentResponseStatus
} from '../types';
import { formatDate } from '../utils/formatters';
import { PrintableEmergencyReportModal } from './PrintableEmergencyReportModal';

interface EmergencyRescueViewProps {
  incidents: EmergencyIncident[];
  evacuationCenters: EvacuationCenter[];
  emergencyAlerts: EmergencyAlert[];
  responders: RescueResponder[];
  residents: Resident[];
  equipment: EquipmentItem[];
  officials: BarangayOfficial[];
  onAddIncident: (incident: EmergencyIncident) => void;
  onUpdateIncident: (incident: EmergencyIncident) => void;
  onDeleteIncident: (id: string) => void;
  onAddEvacuationCenter: (center: EvacuationCenter) => void;
  onUpdateEvacuationCenter: (center: EvacuationCenter) => void;
  onAddEmergencyAlert: (alert: EmergencyAlert) => void;
  onUpdateEmergencyAlert: (alert: EmergencyAlert) => void;
  onSelectResidentForEmergency?: (resident: Resident) => void;
}

export const EmergencyRescueView: React.FC<EmergencyRescueViewProps> = ({
  incidents,
  evacuationCenters,
  emergencyAlerts,
  responders,
  residents,
  equipment,
  officials,
  onAddIncident,
  onUpdateIncident,
  onDeleteIncident,
  onAddEvacuationCenter,
  onUpdateEvacuationCenter,
  onAddEmergencyAlert,
  onUpdateEmergencyAlert,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'evacuation' | 'priority_census' | 'alerts' | 'responders'>('incidents');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [purokFilter, setPurokFilter] = useState<string>('all');

  // Modals
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [evacModalOpen, setEvacModalOpen] = useState(false);
  const [selectedIncidentForPrint, setSelectedIncidentForPrint] = useState<EmergencyIncident | null>(null);
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<EmergencyIncident | null>(null);

  // Form State: New Incident
  const [incidentForm, setIncidentForm] = useState<{
    incidentType: EmergencyIncidentType;
    severity: IncidentSeverity;
    purok: Purok;
    exactLocation: string;
    callerName: string;
    callerContact: string;
    description: string;
    personsAtRisk: number;
    vulnerableSectors: string[];
    assignedUnit: string;
    equipmentUsed: string[];
    evacuationCenterAssigned: string;
  }>({
    incidentType: 'Flood / River Overflow',
    severity: 'Code Red (Critical - Immediate Dispatch)',
    purok: 'Purok 2 - Riverside',
    exactLocation: '',
    callerName: '',
    callerContact: '',
    description: '',
    personsAtRisk: 1,
    vulnerableSectors: [],
    assignedUnit: 'Area 6 Water Rescue QRT-Alpha',
    equipmentUsed: ['Life Vests (10 pcs)', 'Rescue Boat Aluminum #1'],
    evacuationCenterAssigned: 'San Jose Annex Multi-Purpose Covered Court'
  });

  // Form State: New Emergency Broadcast Alert
  const [alertForm, setAlertForm] = useState<{
    alertTitle: string;
    alertLevel: 'Critical / Red Alert' | 'Severe / Orange Advisory' | 'Yellow Warning' | 'Public Advisory';
    affectedPuroks: string;
    message: string;
    directive: 'Immediate Evacuation' | 'Pre-emptive Evacuation' | 'Stay Indoors & Monitor' | 'Standard Precaution';
  }>({
    alertTitle: 'RED ALERT: Heavy Downpour & Rising Creek Overflow Warning',
    alertLevel: 'Critical / Red Alert',
    affectedPuroks: 'Purok 2 - Riverside, Sitio Area 6 Extension',
    message: 'Water level at San Jose Creek has reached Warning Stage 3. Residents living within 15 meters of riverbanks must evacuate immediately.',
    directive: 'Immediate Evacuation'
  });

  // Form State: New Evacuation Center
  const [evacForm, setEvacForm] = useState<{
    name: string;
    location: string;
    purok: Purok;
    capacityPersons: number;
    hasMedicalPost: boolean;
    hasGeneratorPower: boolean;
    hasPotableWater: boolean;
    reliefFoodPacksAvailable: number;
    focalPerson: string;
    contactNumber: string;
    notes: string;
  }>({
    name: '',
    location: '',
    purok: 'Purok 6 - Annex Proper',
    capacityPersons: 150,
    hasMedicalPost: true,
    hasGeneratorPower: true,
    hasPotableWater: true,
    reliefFoodPacksAvailable: 100,
    focalPerson: 'Hon. Ernesto V. Ramos',
    contactNumber: '0917-889-2106',
    notes: ''
  });

  // Quick dispatch presets
  const handlePrefillIncidentForResident = (resident: Resident) => {
    const isRiverside = resident.purok === 'Purok 2 - Riverside';
    const vulnerableTags: string[] = [];
    if (resident.age >= 60) vulnerableTags.push(`Senior Citizen (${resident.age}yo)`);
    if (resident.sectorTags?.some(t => t.includes('PWD'))) vulnerableTags.push('Person with Disability (PWD)');
    if (resident.sectorTags?.some(t => t.includes('Solo Parent'))) vulnerableTags.push('Solo Parent with Dependents');

    setIncidentForm({
      incidentType: isRiverside ? 'Flood / River Overflow' : 'Medical Emergency / Trauma',
      severity: isRiverside ? 'Code Red (Critical - Immediate Dispatch)' : 'Code Orange (High Priority)',
      purok: resident.purok,
      exactLocation: `${resident.houseNumber ? resident.houseNumber + ' ' : ''}${resident.streetName || ''}, ${resident.purok}`,
      callerName: `${resident.firstName} ${resident.lastName}`,
      callerContact: resident.contactNumber || resident.emergencyContact?.contact || '0917-000-0000',
      description: `Emergency rescue & assisted evacuation requested for resident ${resident.firstName} ${resident.lastName}. Special concerns: ${vulnerableTags.join(', ') || 'Resident requires mobility assistance'}.`,
      personsAtRisk: 1,
      vulnerableSectors: vulnerableTags,
      assignedUnit: isRiverside ? 'Area 6 Water Rescue QRT-Alpha' : 'Barangay Emergency Ambulance & Medic Unit 1',
      equipmentUsed: isRiverside ? ['Rescue Boat Aluminum #1', 'Life Vests (4 pcs)'] : ['First Aid Trauma Kit', 'Stretcher'],
      evacuationCenterAssigned: 'San Jose Annex Multi-Purpose Covered Court'
    });
    setIncidentModalOpen(true);
  };

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch = 
        inc.incidentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.exactLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSeverity = severityFilter === 'all' || inc.severity.includes(severityFilter);
      const matchStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchPurok = purokFilter === 'all' || inc.purok === purokFilter;

      return matchSearch && matchSeverity && matchStatus && matchPurok;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter, purokFilter]);

  // Priority Census: High-risk vulnerable residents
  const priorityVulnerableResidents = useMemo(() => {
    return residents.filter(r => {
      const isSenior = r.age >= 60;
      const isPwd = r.sectorTags?.includes('PWD');
      const isChild = r.age <= 5;
      const isFloodProne = r.purok === 'Purok 2 - Riverside';
      const isLandslideProne = r.purok === 'Purok 5 - Ilaya';

      // Vulnerable or in critical danger zones
      return (isSenior || isPwd || isChild) && (isFloodProne || isLandslideProne || true);
    });
  }, [residents]);

  // Aggregate metrics
  const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved / Stand-down').length;
  const criticalRedCount = incidents.filter(i => i.severity.includes('Code Red') && i.status !== 'Resolved / Stand-down').length;
  const totalEvacueesSheltered = evacuationCenters.reduce((sum, c) => sum + (c.currentOccupants || 0), 0);
  const totalEvacueeFamilies = evacuationCenters.reduce((sum, c) => sum + (c.currentFamilies || 0), 0);
  const totalRescuedCount = incidents.reduce((sum, i) => sum + (i.rescuedCount || 0), 0);
  const totalCenterCapacity = evacuationCenters.reduce((sum, c) => sum + c.capacityPersons, 0);

  // Active Broadcast Alert
  const activeAlert = emergencyAlerts.find(a => a.isActive);

  // Handlers
  const handleCreateIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: EmergencyIncident = {
      id: `inc-${Date.now()}`,
      incidentCode: `RES-2026-${String(incidents.length + 40).padStart(4, '0')}`,
      incidentType: incidentForm.incidentType,
      severity: incidentForm.severity,
      purok: incidentForm.purok,
      exactLocation: incidentForm.exactLocation || `${incidentForm.purok}, Area 6`,
      callerName: incidentForm.callerName || 'Barangay Resident',
      callerContact: incidentForm.callerContact || '0900-000-0000',
      reportedAt: new Date().toISOString(),
      description: incidentForm.description,
      personsAtRisk: Number(incidentForm.personsAtRisk) || 1,
      vulnerablePersonsNoted: incidentForm.vulnerableSectors,
      assignedUnit: incidentForm.assignedUnit,
      status: 'Team Dispatched',
      dispatchedAt: new Date().toISOString(),
      casualties: 0,
      injuries: 0,
      rescuedCount: 0,
      equipmentUsed: incidentForm.equipmentUsed,
      evacuationCenterAssigned: incidentForm.evacuationCenterAssigned,
      loggedBy: 'BDRRM Operations Desk (Hon. Rodrigo M. Alvarez / Staff)'
    };

    onAddIncident(newInc);
    setIncidentModalOpen(false);
  };

  const handleUpdateStatus = (incident: EmergencyIncident, nextStatus: IncidentResponseStatus) => {
    const updated: EmergencyIncident = {
      ...incident,
      status: nextStatus,
      onSceneAt: nextStatus === 'On-Scene Operation' && !incident.onSceneAt ? new Date().toISOString() : incident.onSceneAt,
      resolvedAt: nextStatus === 'Resolved / Stand-down' ? new Date().toISOString() : incident.resolvedAt,
      rescuedCount: nextStatus === 'Rescued / Controlled' || nextStatus === 'Resolved / Stand-down' 
        ? (incident.rescuedCount > 0 ? incident.rescuedCount : incident.personsAtRisk)
        : incident.rescuedCount
    };
    onUpdateIncident(updated);
    if (selectedIncidentDetail?.id === incident.id) {
      setSelectedIncidentDetail(updated);
    }
  };

  const handleCreateAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      alertTitle: alertForm.alertTitle,
      alertLevel: alertForm.alertLevel,
      affectedPuroks: alertForm.affectedPuroks.split(',').map(s => s.trim()),
      message: alertForm.message,
      directive: alertForm.directive,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      issuedBy: 'Hon. Rodrigo M. Alvarez, Punong Barangay & BDRRMC Chairman',
      isActive: true
    };
    onAddEmergencyAlert(newAlert);
    setAlertModalOpen(false);
  };

  const handleCreateEvacSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCenter: EvacuationCenter = {
      id: `evac-${Date.now()}`,
      name: evacForm.name,
      location: evacForm.location || 'Barangay San Jose Annex Area 6',
      purok: evacForm.purok,
      capacityPersons: Number(evacForm.capacityPersons) || 100,
      currentOccupants: 0,
      currentFamilies: 0,
      status: 'Standby / Prepared',
      hasMedicalPost: evacForm.hasMedicalPost,
      hasGeneratorPower: evacForm.hasGeneratorPower,
      hasPotableWater: evacForm.hasPotableWater,
      reliefFoodPacksAvailable: Number(evacForm.reliefFoodPacksAvailable) || 50,
      focalPerson: evacForm.focalPerson || 'BDRRM Committee',
      contactNumber: evacForm.contactNumber || '0917-889-2106',
      notes: evacForm.notes
    };
    onAddEvacuationCenter(newCenter);
    setEvacModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="inline-flex items-center space-x-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>BDRRMC 24/7 Operations Center</span>
              </span>
              <span className="text-xs text-slate-300 font-mono">Area 6 Emergency Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-cinzel">
              Emergency & Rescue Operations Command
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Barangay Disaster Risk Reduction & Management Council (BDRRMC) central dispatch, river flood monitoring, vulnerable citizen evacuation triage, and rescue asset deployment.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setIncidentModalOpen(true)}
              className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/60 active:scale-95 transition-all"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Log SOS Incident</span>
            </button>

            <button
              onClick={() => setAlertModalOpen(true)}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/60 active:scale-95 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Alert</span>
            </button>

            <button
              onClick={() => setEvacModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-3.5 py-3 rounded-2xl flex items-center space-x-1.5 transition-colors"
              title="Add Evacuation Center"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Add Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Broadcast Emergency Alert Bar (If any active) */}
      {activeAlert && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-rose-300/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-white/20 rounded-xl text-white shrink-0 mt-0.5">
              <BellRing className="w-6 h-6 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white text-rose-900 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeAlert.alertLevel}
                </span>
                <span className="bg-rose-900/60 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                  Directive: {activeAlert.directive}
                </span>
                <span className="text-xs text-rose-100 font-mono">
                  Affected: {activeAlert.affectedPuroks.join(', ')}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                {activeAlert.alertTitle}
              </h4>
              <p className="text-xs sm:text-sm text-rose-100 mt-0.5 leading-snug">
                {activeAlert.message}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => {
                onUpdateEmergencyAlert({ ...activeAlert, isActive: false });
              }}
              className="bg-black/30 hover:bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
            >
              Stand Down Alert
            </button>
          </div>
        </div>
      )}

      {/* Emergency Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active SOS Incidents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Incidents</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeIncidentsCount}</div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-rose-700 font-semibold">{criticalRedCount} Critical Code Red</span>
            </div>
          </div>
        </div>

        {/* Card 2: Evacuees Sheltered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sheltered Evacuees</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalEvacueesSheltered}</div>
            <div className="text-xs text-slate-500 mt-1">
              <span>{totalEvacueeFamilies} Families • {evacuationCenters.filter(c => c.status === 'Open & Receiving').length} Centers Open</span>
            </div>
          </div>
        </div>

        {/* Card 3: Persons Rescued */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Persons Rescued</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{totalRescuedCount}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">
              100% Evacuation Safety Rate
            </div>
          </div>
        </div>

        {/* Card 4: Vulnerable Priority Citizens */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Census</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{priorityVulnerableResidents.length}</div>
            <div className="text-xs text-amber-700 mt-1 font-medium">
              Seniors, PWDs & Infants in Area 6
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSubTab === 'incidents'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Active Dispatches & SOS Log ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evacuation')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSubTab === 'evacuation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Evacuation Centers ({evacuationCenters.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('priority_census')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSubTab === 'priority_census'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Vulnerable Priority Roster ({priorityVulnerableResidents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSubTab === 'alerts'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Early Warning Broadcasts ({emergencyAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('responders')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSubTab === 'responders'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Ambulance className="w-4 h-4" />
          <span>Rescue Assets & QRT ({responders.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: ACTIVE INCIDENTS & DISPATCH LOG */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search emergency by code, caller, street, or hazard type..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="Code Red">Code Red (Critical)</option>
                <option value="Code Orange">Code Orange (High)</option>
                <option value="Code Yellow">Code Yellow (Moderate)</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
              >
                <option value="all">All Operational Statuses</option>
                <option value="Reported / Triaged">Reported / Triaged</option>
                <option value="Team Dispatched">Team Dispatched</option>
                <option value="On-Scene Operation">On-Scene Operation</option>
                <option value="Rescued / Controlled">Rescued / Controlled</option>
                <option value="Resolved / Stand-down">Resolved / Stand-down</option>
              </select>

              <select
                value={purokFilter}
                onChange={e => setPurokFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
              >
                <option value="all">All Puroks</option>
                <option value="Purok 1 - San Jose Proper">Purok 1</option>
                <option value="Purok 2 - Riverside">Purok 2 Riverside</option>
                <option value="Purok 3 - Mabuhay">Purok 3</option>
                <option value="Purok 4 - Pag-asa">Purok 4</option>
                <option value="Purok 5 - Ilaya">Purok 5 Ilaya</option>
                <option value="Purok 6 - Annex Proper">Purok 6</option>
                <option value="Sitio Area 6 Extension">Sitio Area 6 Ext</option>
              </select>
            </div>
          </div>

          {/* Incidents List Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredIncidents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No Matching Emergency Incidents Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  All active dispatches are either resolved or no emergency matches your active search filters.
                </p>
              </div>
            ) : (
              filteredIncidents.map(incident => {
                const isCritical = incident.severity.includes('Code Red');
                const isResolved = incident.status === 'Resolved / Stand-down';

                return (
                  <div 
                    key={incident.id} 
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md ${
                      isCritical && !isResolved 
                        ? 'border-rose-400 bg-rose-50/20' 
                        : isResolved 
                          ? 'border-slate-200 opacity-90' 
                          : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Code, Type & Severity */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                            {incident.incidentCode}
                          </span>

                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            incident.severity.includes('Code Red')
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : incident.severity.includes('Code Orange')
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {incident.severity}
                          </span>

                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            incident.status === 'Resolved / Stand-down'
                              ? 'bg-emerald-100 text-emerald-800'
                              : incident.status === 'On-Scene Operation'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            ● {incident.status}
                          </span>

                          <span className="text-xs text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(incident.reportedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                          <span>{incident.incidentType}</span>
                          <span className="text-xs text-slate-400 font-normal">at</span>
                          <span className="text-rose-700 font-semibold">{incident.purok}</span>
                        </h3>

                        <p className="text-xs text-slate-600 font-medium flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{incident.exactLocation}</span>
                          <span className="text-slate-400">• Caller: {incident.callerName} ({incident.callerContact})</span>
                        </p>

                        <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {incident.description}
                        </p>

                        {/* Vulnerable sector tags if noted */}
                        {incident.vulnerablePersonsNoted && incident.vulnerablePersonsNoted.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Vulnerable:</span>
                            {incident.vulnerablePersonsNoted.map((tag, idx) => (
                              <span key={idx} className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Quick Operational Status Pipeline & Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-end justify-between gap-3 shrink-0 w-full lg:w-72 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                        <div className="text-right w-full">
                          <div className="text-[11px] text-slate-500 font-medium">Assigned Response Team:</div>
                          <div className="text-xs font-bold text-slate-900 truncate">{incident.assignedUnit}</div>
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            {incident.rescuedCount} rescued of {incident.personsAtRisk} at risk
                          </div>
                        </div>

                        {/* Status Progression Pipeline Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full justify-end">
                          {incident.status === 'Reported / Triaged' && (
                            <button
                              onClick={() => handleUpdateStatus(incident, 'Team Dispatched')}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                            >
                              Dispatch QRT
                            </button>
                          )}

                          {incident.status === 'Team Dispatched' && (
                            <button
                              onClick={() => handleUpdateStatus(incident, 'On-Scene Operation')}
                              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                            >
                              Mark On-Scene
                            </button>
                          )}

                          {incident.status === 'On-Scene Operation' && (
                            <button
                              onClick={() => handleUpdateStatus(incident, 'Rescued / Controlled')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                            >
                              Mark Rescued
                            </button>
                          )}

                          {incident.status === 'Rescued / Controlled' && (
                            <button
                              onClick={() => handleUpdateStatus(incident, 'Resolved / Stand-down')}
                              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                            >
                              Stand-down / Close
                            </button>
                          )}

                          {/* Print Official After-Action Report Modal */}
                          <button
                            onClick={() => setSelectedIncidentForPrint(incident)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-colors"
                            title="Print BDRRMC After-Action Report"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Print Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EVACUATION CENTERS & SHELTER LOGISTICS */}
      {activeSubTab === 'evacuation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Area 6 Evacuation Centers Network</h3>
              <p className="text-xs text-slate-500">Live capacity monitoring, amenities status, and relief food supply.</p>
            </div>
            <button
              onClick={() => setEvacModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Evacuation Hub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evacuationCenters.map(center => {
              const occupancyPct = Math.min(100, Math.round((center.currentOccupants / (center.capacityPersons || 1)) * 100));
              const isFull = center.currentOccupants >= center.capacityPersons;

              return (
                <div key={center.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            center.status === 'Open & Receiving'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                              : center.status === 'At Capacity (Full)'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            ● {center.status}
                          </span>
                          <span className="text-xs text-slate-500">{center.purok}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{center.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{center.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Occupancy: <strong>{center.currentOccupants}</strong> / {center.capacityPersons} persons</span>
                        <span className={`font-bold ${occupancyPct > 85 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {occupancyPct}% Filled
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct > 85 ? 'bg-rose-500' : occupancyPct > 50 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {center.currentFamilies} Families Registered
                      </div>
                    </div>

                    {/* Amenities Badges */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className={`p-2 rounded-xl flex items-center space-x-1.5 ${center.hasMedicalPost ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                        <HeartPulse className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">Medical Post</span>
                      </div>

                      <div className={`p-2 rounded-xl flex items-center space-x-1.5 ${center.hasGeneratorPower ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-400'}`}>
                        <Zap className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">Generator</span>
                      </div>

                      <div className={`p-2 rounded-xl flex items-center space-x-1.5 ${center.hasPotableWater ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-400'}`}>
                        <Droplets className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">Water Supply</span>
                      </div>

                      <div className="p-2 rounded-xl bg-orange-50 text-orange-800 flex items-center space-x-1.5">
                        <Utensils className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{center.reliefFoodPacksAvailable} Relief Packs</span>
                      </div>
                    </div>
                  </div>

                  {/* Focal Person & Toggle Status */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">FOCAL PERSON:</span>
                      <strong className="text-slate-800">{center.focalPerson}</strong>
                      <span className="text-slate-500 ml-1">({center.contactNumber})</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {center.status !== 'Open & Receiving' ? (
                        <button
                          onClick={() => onUpdateEvacuationCenter({ ...center, status: 'Open & Receiving' })}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all"
                        >
                          Activate Center
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateEvacuationCenter({ ...center, status: 'Standby / Prepared', currentOccupants: 0, currentFamilies: 0 })}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VULNERABLE PRIORITY CENSUS EVACUATION ROSTER */}
      {activeSubTab === 'priority_census' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-amber-900">
              <h4 className="font-bold text-amber-950">High-Risk Vulnerable Population Evacuation Matrix</h4>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Directly synchronized with the Barangay Resident Census. Identifies Senior Citizens, PWDs, Infants, and Pregnant mothers in high-risk flood zones (Purok 2 Riverside) and landslide zones (Purok 5 Ilaya). Use the "Dispatch Rescue / Check-in" button to immediately log an emergency evacuation dispatch.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Resident Name</th>
                    <th className="px-4 py-3">Purok & Zone Hazard</th>
                    <th className="px-4 py-3">Age / Category</th>
                    <th className="px-4 py-3">Emergency Contact</th>
                    <th className="px-4 py-3 text-right">Rapid Evacuation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityVulnerableResidents.map(res => {
                    const isRiverside = res.purok === 'Purok 2 - Riverside';
                    const isSenior = res.age >= 60;
                    const isPwd = res.sectorTags?.includes('PWD');

                    return (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{res.lastName}, {res.firstName} {res.middleName || ''}</div>
                          <div className="text-[11px] text-slate-500">{res.houseNumber || ''} {res.streetName || ''}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-800">{res.purok}</span>
                          {isRiverside && (
                            <span className="ml-2 inline-flex items-center text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                              Flood Zone 1
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {isSenior && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Senior ({res.age}yo)</span>}
                            {isPwd && <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">PWD</span>}
                            {res.bloodType && <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">Blood: {res.bloodType}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          <div>{res.emergencyContact?.name || 'Nearest Family'}</div>
                          <div className="font-mono text-slate-500">{res.emergencyContact?.contactNumber || res.contactNumber}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handlePrefillIncidentForResident(res)}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all inline-flex items-center space-x-1"
                          >
                            <LifeBuoy className="w-3.5 h-3.5" />
                            <span>Dispatch Rescue Check-in</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EARLY WARNING BROADCASTS */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Barangay Early Warning & Siren Broadcasts</h3>
              <p className="text-xs text-slate-500">Official warnings disseminated to Purok leaders, megaphones, and Tanod radios.</p>
            </div>
            <button
              onClick={() => setAlertModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast New Warning</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {emergencyAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-sm ${
                  alert.isActive ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        alert.alertLevel.includes('Critical')
                          ? 'bg-rose-600 text-white'
                          : alert.alertLevel.includes('Severe')
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                      }`}>
                        {alert.alertLevel}
                      </span>
                      <span className="text-xs font-bold text-slate-700">Directive: {alert.directive}</span>
                      <span className="text-xs text-slate-400">
                        Issued: {new Date(alert.issuedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{alert.alertTitle}</h4>
                    <p className="text-xs text-slate-600">{alert.message}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Affected Zones:</strong> {alert.affectedPuroks.join(', ')} • <strong>Authority:</strong> {alert.issuedBy}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    {alert.isActive ? (
                      <button
                        onClick={() => onUpdateEmergencyAlert({ ...alert, isActive: false })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Deactivate Alert
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateEmergencyAlert({ ...alert, isActive: true })}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Re-Broadcast
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: RESCUE ASSETS & QRT */}
      {activeSubTab === 'responders' && (
        <div className="space-y-6">
          {/* Quick Responders Grid */}
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Quick Response Team (QRT) Responders on Duty</h3>
            <p className="text-xs text-slate-500 mb-3">Field rescue leads, paramedics, water rescue divers, and emergency drivers.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {responders.map(resp => (
                <div key={resp.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-rose-700">{resp.callsign}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        resp.status === 'Dispatched' 
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : resp.status === 'On Duty'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {resp.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{resp.name}</h4>
                    <p className="text-xs text-slate-500">{resp.role}</p>
                    <p className="text-[11px] text-slate-600 font-mono flex items-center space-x-1 pt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{resp.contact}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rescue Equipment Inventory Highlights */}
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Area 6 Disaster Rescue & Emergency Equipment Status</h3>
            <p className="text-xs text-slate-500 mb-3">Physical gear deployed and available in the Barangay Hall Logistics Storage.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {equipment.slice(0, 8).map(eq => (
                <div key={eq.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-mono text-slate-400 block">{eq.assetCode || eq.propertyNumber}</span>
                  <h5 className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={eq.itemName}>{eq.itemName}</h5>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-slate-500">{eq.category}</span>
                    <span className={`font-semibold ${eq.status === 'Available' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {eq.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: LOG NEW SOS EMERGENCY CALL */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-600 rounded-xl">
                  <PhoneCall className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Log Rapid Emergency SOS / Rescue Dispatch</h3>
                  <p className="text-xs text-rose-200">Barangay San Jose Annex Area 6 24/7 Dispatch Desk</p>
                </div>
              </div>
              <button onClick={() => setIncidentModalOpen(false)} className="text-slate-300 hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateIncidentSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Emergency Incident Type *
                  </label>
                  <select
                    value={incidentForm.incidentType}
                    onChange={e => setIncidentForm({ ...incidentForm, incidentType: e.target.value as EmergencyIncidentType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="Flood / River Overflow">Flood / River Overflow</option>
                    <option value="Structure Fire">Structure Fire</option>
                    <option value="Medical Emergency / Trauma">Medical Emergency / Trauma</option>
                    <option value="Landslide / Soil Erosion">Landslide / Soil Erosion</option>
                    <option value="Road Accident / Collision">Road Accident / Collision</option>
                    <option value="Severe Typhoon & Wind Hazard">Severe Typhoon & Wind Hazard</option>
                    <option value="Search and Rescue">Search and Rescue</option>
                    <option value="Structural Collapse / Hazard">Structural Collapse / Hazard</option>
                    <option value="Chemical / LPG Gas Leak">Chemical / LPG Gas Leak</option>
                    <option value="Electrical Fire / Sparking Post">Electrical Fire / Sparking Post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alarm Severity Level *
                  </label>
                  <select
                    value={incidentForm.severity}
                    onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value as IncidentSeverity })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="Code Red (Critical - Immediate Dispatch)">Code Red (Critical - Immediate Dispatch)</option>
                    <option value="Code Orange (High Priority)">Code Orange (High Priority)</option>
                    <option value="Code Yellow (Moderate / Monitored)">Code Yellow (Moderate / Monitored)</option>
                    <option value="Code Green (Low / Advisory)">Code Green (Low / Advisory)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Purok / Sector *
                  </label>
                  <select
                    value={incidentForm.purok}
                    onChange={e => setIncidentForm({ ...incidentForm, purok: e.target.value as Purok })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="Purok 1 - San Jose Proper">Purok 1 - San Jose Proper</option>
                    <option value="Purok 2 - Riverside">Purok 2 - Riverside (Critical Flood Zone)</option>
                    <option value="Purok 3 - Mabuhay">Purok 3 - Mabuhay</option>
                    <option value="Purok 4 - Pag-asa">Purok 4 - Pag-asa</option>
                    <option value="Purok 5 - Ilaya">Purok 5 - Ilaya (Slope Hazard Zone)</option>
                    <option value="Purok 6 - Annex Proper">Purok 6 - Annex Proper</option>
                    <option value="Sitio Area 6 Extension">Sitio Area 6 Extension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Persons at Risk / Trapped Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={incidentForm.personsAtRisk}
                    onChange={e => setIncidentForm({ ...incidentForm, personsAtRisk: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exact Landmark / Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lower Creek Alley 3, near Footbridge 2, 2nd floor balcony"
                  value={incidentForm.exactLocation}
                  onChange={e => setIncidentForm({ ...incidentForm, exactLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Caller / Reporting Party Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maritess Sunga"
                    value={incidentForm.callerName}
                    onChange={e => setIncidentForm({ ...incidentForm, callerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Caller Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="0917-xxx-xxxx"
                    value={incidentForm.callerContact}
                    onChange={e => setIncidentForm({ ...incidentForm, callerContact: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Narrative & Immediate Hazard Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe emergency condition, depth of water, trapped occupants, accessibility of alleys..."
                  value={incidentForm.description}
                  onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Rescue Unit
                  </label>
                  <select
                    value={incidentForm.assignedUnit}
                    onChange={e => setIncidentForm({ ...incidentForm, assignedUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Area 6 Water Rescue QRT-Alpha">Area 6 Water Rescue QRT-Alpha</option>
                    <option value="Barangay Emergency Ambulance & Medic Unit 1">Barangay Emergency Ambulance & Medic Unit 1</option>
                    <option value="BFP Auxiliary Volunteer Squad & Tanod Fire Watch">BFP Auxiliary Volunteer Squad & Tanod Fire Watch</option>
                    <option value="BDRRMC Engineering & Evacuation Taskforce">BDRRMC Engineering & Evacuation Taskforce</option>
                    <option value="Medic Unit 2 & Traffic Enforcer Tanod">Medic Unit 2 & Traffic Enforcer Tanod</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Evacuation Center Destination
                  </label>
                  <select
                    value={incidentForm.evacuationCenterAssigned}
                    onChange={e => setIncidentForm({ ...incidentForm, evacuationCenterAssigned: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  >
                    {evacuationCenters.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-rose-950/40 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Execute Immediate Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BROADCAST EMERGENCY ALERT */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-red-700 to-rose-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
                <div>
                  <h3 className="font-bold text-base">Broadcast Area 6 Emergency Early Warning Alert</h3>
                  <p className="text-xs text-rose-200">Instant notification for Purok coordinators, Tanods, and siren systems</p>
                </div>
              </div>
              <button onClick={() => setAlertModalOpen(false)} className="text-slate-300 hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAlertSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Level *
                </label>
                <select
                  value={alertForm.alertLevel}
                  onChange={e => setAlertForm({ ...alertForm, alertLevel: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Critical / Red Alert">Critical / Red Alert (Forced Evacuation)</option>
                  <option value="Severe / Orange Advisory">Severe / Orange Advisory (Pre-emptive Evacuation)</option>
                  <option value="Yellow Warning">Yellow Warning (Heightened Vigilance)</option>
                  <option value="Public Advisory">Public Advisory (Informational)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  value={alertForm.alertTitle}
                  onChange={e => setAlertForm({ ...alertForm, alertTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Resident Directive *
                  </label>
                  <select
                    value={alertForm.directive}
                    onChange={e => setAlertForm({ ...alertForm, directive: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Immediate Evacuation">Immediate Evacuation</option>
                    <option value="Pre-emptive Evacuation">Pre-emptive Evacuation</option>
                    <option value="Stay Indoors & Monitor">Stay Indoors & Monitor</option>
                    <option value="Standard Precaution">Standard Precaution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Affected Puroks
                  </label>
                  <input
                    type="text"
                    value={alertForm.affectedPuroks}
                    onChange={e => setAlertForm({ ...alertForm, affectedPuroks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Public Warning Message *
                </label>
                <textarea
                  rows={3}
                  value={alertForm.message}
                  onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>Transmit Official Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER EVACUATION CENTER */}
      {evacModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Home className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base">Register Designated Evacuation Hub</h3>
                  <p className="text-xs text-slate-300">San Jose Annex Emergency Shelter Network</p>
                </div>
              </div>
              <button onClick={() => setEvacModalOpen(false)} className="text-slate-300 hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateEvacSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Jose Annex High School Gym"
                  value={evacForm.name}
                  onChange={e => setEvacForm({ ...evacForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Purok *
                  </label>
                  <select
                    value={evacForm.purok}
                    onChange={e => setEvacForm({ ...evacForm, purok: e.target.value as Purok })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Purok 1 - San Jose Proper">Purok 1 - San Jose Proper</option>
                    <option value="Purok 2 - Riverside">Purok 2 - Riverside</option>
                    <option value="Purok 3 - Mabuhay">Purok 3 - Mabuhay</option>
                    <option value="Purok 4 - Pag-asa">Purok 4 - Pag-asa</option>
                    <option value="Purok 5 - Ilaya">Purok 5 - Ilaya</option>
                    <option value="Purok 6 - Annex Proper">Purok 6 - Annex Proper</option>
                    <option value="Sitio Area 6 Extension">Sitio Area 6 Extension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maximum Capacity (Persons) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={evacForm.capacityPersons}
                    onChange={e => setEvacForm({ ...evacForm, capacityPersons: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={evacForm.hasMedicalPost}
                    onChange={e => setEvacForm({ ...evacForm, hasMedicalPost: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Medical Post</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={evacForm.hasGeneratorPower}
                    onChange={e => setEvacForm({ ...evacForm, hasGeneratorPower: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Generator</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={evacForm.hasPotableWater}
                    onChange={e => setEvacForm({ ...evacForm, hasPotableWater: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Potable Water</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Focal Person / In-Charge
                  </label>
                  <input
                    type="text"
                    value={evacForm.focalPerson}
                    onChange={e => setEvacForm({ ...evacForm, focalPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Hotline
                  </label>
                  <input
                    type="text"
                    value={evacForm.contactNumber}
                    onChange={e => setEvacForm({ ...evacForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEvacModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  Save Evacuation Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE AFTER-ACTION REPORT MODAL */}
      {selectedIncidentForPrint && (
        <PrintableEmergencyReportModal
          incident={selectedIncidentForPrint}
          officials={officials}
          onClose={() => setSelectedIncidentForPrint(null)}
        />
      )}
    </div>
  );
};
