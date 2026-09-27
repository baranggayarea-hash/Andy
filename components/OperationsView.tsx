import React, { useState } from 'react';
import { 
  ClipboardList, 
  Package, 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Car, 
  Layers, 
  Truck, 
  Sparkles, 
  Wrench, 
  Building, 
  FileText, 
  UserCheck, 
  CheckCircle, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { 
  DailyOperationLog, 
  EquipmentItem, 
  BDRRMInfo, 
  TanodShift,
  BarangayOfficial
} from '../types';
import { formatDate } from '../utils/formatters';

interface OperationsViewProps {
  operations: DailyOperationLog[];
  equipment: EquipmentItem[];
  bdrrm: BDRRMInfo;
  officials: BarangayOfficial[];
  onAddOperation: (log: DailyOperationLog) => void;
  onAddEquipment: (item: EquipmentItem) => void;
  onUpdateEquipment: (item: EquipmentItem) => void;
  onUpdateBdrrm?: (bdrrm: BDRRMInfo) => void;
  visitors?: any[];
  onAddVisitor?: any;
  onUpdateVisitor?: any;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
  operations,
  equipment,
  officials,
  onAddOperation,
  onAddEquipment,
  onUpdateEquipment,
}) => {
  const [activeTab, setActiveTab] = useState<'logbook' | 'equipment'>('logbook');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');

  // Modals
  const [opModalOpen, setOpModalOpen] = useState(false);
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [aiReportModalOpen, setAiReportModalOpen] = useState(false);
  const [aiReportText, setAiReportText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Operation Log Form State
  const [opForm, setOpForm] = useState<{
    shift: TanodShift;
    officerInCharge: string;
    dutyTanods: string;
    activityType: DailyOperationLog['activityType'];
    puroksCovered: string;
    locationCovered: string;
    summary: string;
    incidentsNoted: number;
    status: 'Completed' | 'Ongoing';
  }>({
    shift: 'Morning Shift (06:00 - 14:00)',
    officerInCharge: 'Hon. Danilo G. Castillo (Committee on Infrastructure & Works)',
    dutyTanods: 'Rolando Reyes, Bernardo Cruz, Jeffrey Delos Santos',
    activityType: 'Traffic Flow & Alley Clearing',
    puroksCovered: 'Purok 1 - San Jose Proper, Purok 6 - Annex Proper',
    locationCovered: 'Area 6 Main Access Road & Market Frontage',
    summary: 'Conducted road clearing along main boulevard, inspected streetlights along Rosal St., and assisted school zone traffic flow.',
    incidentsNoted: 0,
    status: 'Completed'
  });

  // Equipment Form State
  const [equipForm, setEquipForm] = useState<{
    itemName: string;
    propertyNumber: string;
    category: string;
    borrowerName: string;
    borrowerContact: string;
    borrowerAddress: string;
    purpose: string;
    expectedReturnDate: string;
  }>({
    itemName: 'Heavy Duty Grass Cutter (Stihl FS-250)',
    propertyNumber: `EQ-OPS-${Math.floor(1000 + Math.random() * 9000)}`,
    category: 'Public Works & Maintenance',
    borrowerName: 'Purok 3 Clean-up Volunteer Team',
    borrowerContact: '0917-889-2101',
    borrowerAddress: 'Purok 3 - Sampaguita',
    purpose: 'Community Drainage & Alley Clean-up Drive',
    expectedReturnDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Handle Save Operation Log
  const handleSaveOperationLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyOperationLog = {
      id: `op-${Date.now()}`,
      logDate: new Date().toISOString().split('T')[0],
      shift: opForm.shift,
      officerInCharge: opForm.officerInCharge,
      dutyTanods: opForm.dutyTanods.split(',').map(s => s.trim()).filter(Boolean),
      activityType: opForm.activityType,
      puroksCovered: opForm.puroksCovered.split(',').map(s => s.trim()).filter(Boolean),
      locationCovered: opForm.locationCovered,
      summary: opForm.summary,
      incidentsNoted: Number(opForm.incidentsNoted) || 0,
      incidentsLoggedCount: Number(opForm.incidentsNoted) || 0,
      status: opForm.status,
      createdAt: new Date().toISOString()
    };
    onAddOperation(newLog);
    setOpModalOpen(false);
  };

  // Handle Save Equipment
  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      itemName: equipForm.itemName,
      propertyNumber: equipForm.propertyNumber,
      category: equipForm.category,
      status: 'Borrowed',
      condition: 'Good / Serviceable',
      currentBorrower: {
        name: equipForm.borrowerName,
        contact: equipForm.borrowerContact,
        address: equipForm.borrowerAddress,
        borrowDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: equipForm.expectedReturnDate,
        purpose: equipForm.purpose
      }
    };
    onAddEquipment(newItem);
    setEquipModalOpen(false);
  };

  // Handle Return Equipment
  const handleReturnEquipment = (item: EquipmentItem) => {
    const updated: EquipmentItem = {
      ...item,
      status: 'Available',
      currentBorrower: undefined
    };
    onUpdateEquipment(updated);
  };

  // AI Operations Brief
  const handleGenerateAiReport = async () => {
    setAiLoading(true);
    setAiReportModalOpen(true);
    try {
      const res = await fetch('/api/ai/operations-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'Today - Daily Operations & Public Services Accomplishment Report',
          stats: {
            shiftsCount: operations.length,
            completedTasks: operations.filter(o => o.status === 'Completed').length,
            equipmentAssets: equipment.length
          },
          logsSummary: operations.map(o => `[${o.shift}] ${o.activityType}: ${o.summary} (Status: ${o.status || 'Completed'})`).join('\n')
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiReportText(data.report);
      } else {
        setAiReportText('Failed to generate operations brief: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      setAiReportText('Error generating operations brief: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Operations
  const filteredOperations = operations.filter(op => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      op.shift.toLowerCase().includes(q) ||
      op.officerInCharge.toLowerCase().includes(q) ||
      op.activityType.toLowerCase().includes(q) ||
      op.summary.toLowerCase().includes(q) ||
      op.dutyTanods.some(t => t.toLowerCase().includes(q));

    const matchesShift = shiftFilter === 'ALL' || op.shift.includes(shiftFilter);
    const matchesActivity = activityFilter === 'ALL' || op.activityType === activityFilter;

    return matchesSearch && matchesShift && matchesActivity;
  });

  const completedShifts = operations.filter(o => o.status === 'Completed').length;
  const availableEquipment = equipment.filter(e => e.status === 'Available').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <span>Daily Operations</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Barangay Public Services, Street Clearing, Sanitation, Facility Maintenance & Operational Shifts (Area 6)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateAiReport}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Operations Brief</span>
          </button>

          {activeTab === 'logbook' && (
            <button
              onClick={() => setOpModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Operations Shift</span>
            </button>
          )}

          {activeTab === 'equipment' && (
            <button
              onClick={() => setEquipModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Borrow / Assign Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Quick Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations Logged</p>
            <ClipboardList className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{operations.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Recorded duty shifts</p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Completed Shifts</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{completedShifts} / {operations.length}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Cleared & finalized reports</p>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Equipment In Service</p>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{availableEquipment} / {equipment.length}</p>
          <p className="text-[10px] text-blue-700 mt-0.5">Available for field operations</p>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Operations</p>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-emerald-400 mt-1 uppercase truncate">
            {operations[0]?.shift.split(' ')[0] || 'Morning'} Shift Online
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Area 6 Barangay Hall</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm space-x-1">
        <button
          onClick={() => setActiveTab('logbook')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'logbook' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Operations & Shift Logbook</span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'equipment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Equipment & Facility Logistics ({equipment.length})</span>
        </button>
      </div>

      {/* Tab 1: Operations Logbook */}
      {activeTab === 'logbook' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search shift, officer, activity, summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">All Shifts</option>
                <option value="Morning">Morning Shift (06:00 - 14:00)</option>
                <option value="Afternoon">Afternoon Shift (14:00 - 22:00)</option>
                <option value="Night">Night Shift (22:00 - 06:00)</option>
              </select>

              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="ALL">All Activity Types</option>
                <option value="Traffic Flow & Alley Clearing">Traffic Flow & Road Clearing</option>
                <option value="Area 6 Perimeter & Street Patrol">Area 6 Field Monitoring</option>
                <option value="Curfew Enforcement">Curfew Monitoring</option>
                <option value="Barangay Hall Security & Frontline Duty">Barangay Hall Duty</option>
                <option value="Inspection">Public Infrastructure Inspection</option>
              </select>
            </div>
          </div>

          {/* Operation Log Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOperations.map((op) => (
              <div key={op.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                    {op.shift}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">{formatDate(op.logDate)}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Officer / Supervisor in Charge</span>
                    <span className="font-bold text-slate-900">{op.officerInCharge}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Duty Personnel / Staff</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {op.dutyTanods.map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {op.puroksCovered && op.puroksCovered.length > 0 && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Puroks Covered</span>
                      <p className="text-slate-700 text-[11px] font-medium">{op.puroksCovered.join(', ')}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Activity Type</span>
                    <span className="font-semibold text-indigo-900 bg-indigo-50/60 px-2 py-0.5 rounded inline-block text-[11px] mt-0.5">
                      {op.activityType}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Shift Summary & Actions</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic text-[11px] leading-relaxed mt-0.5">
                      "{op.summary}"
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    op.status === 'Completed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {op.status || 'Completed'}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {op.locationCovered || 'Area 6 Sector'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Equipment & Facility Logistics */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Multicab Service */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-indigo-600" />
                  <span>Area 6 Operations Multicab</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Serviceable
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Plate No: <strong className="text-slate-900">SAA-4821</strong></p>
              <p className="text-[11px] text-slate-600">Designated Driver: <strong className="text-slate-900">Allan Diaz</strong></p>
              <p className="text-[11px] text-slate-600">Fuel Level: <strong className="text-emerald-600">75% Full</strong></p>
              <div className="pt-2 text-[10px] text-slate-400">Assigned for public service hauling, road clearing & community support</div>
            </div>

            {/* Utility Motorcycle */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Operations Utility Motorcycles</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Units: <strong className="text-slate-900">MC-01 & MC-02</strong></p>
              <p className="text-[11px] text-slate-600">Sector: <strong className="text-slate-900">Area 6 Paved & Unpaved Alleys</strong></p>
              <p className="text-[11px] text-slate-600">Condition: <strong className="text-emerald-600">Fully Maintained</strong></p>
              <div className="pt-2 text-[10px] text-slate-400">Rapid dispatch unit for neighborhood notices and inspection</div>
            </div>

            {/* Maintenance Equipment Base */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Barangay Maintenance Depot</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-600">Location: <strong className="text-slate-900">Hall Ground Floor Storage</strong></p>
              <p className="text-[11px] text-slate-600">Custodians: <strong className="text-slate-900">Barangay General Services</strong></p>
              <p className="text-[11px] text-slate-600">Inventory Status: <strong className="text-emerald-600">Cataloged</strong></p>
              <div className="pt-2 text-[10px] text-slate-400">Grass cutters, chainsaws, sound systems, tents & clearing gear</div>
            </div>
          </div>

          {/* Equipment Inventory & Borrowing Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-800">
                Equipment & Facility Logistics Registry
              </span>
              <span className="text-slate-400">Public Service & Operations Assets</span>
            </div>

            <div className="divide-y divide-slate-100">
              {equipment.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.itemName}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.propertyNumber || item.assetCode || 'EQ-00'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Category: {item.category} • Condition: {item.condition}
                    </p>
                    {item.currentBorrower && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit mt-1">
                        Checked out by: <strong>{item.currentBorrower.name}</strong> for {item.currentBorrower.purpose} (Return: {item.currentBorrower.expectedReturnDate})
                      </p>
                    )}
                  </div>

                  <div>
                    {item.status === 'Borrowed' ? (
                      <button
                        onClick={() => handleReturnEquipment(item)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase"
                      >
                        Return to Depot
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-[10px] uppercase">
                        Available in Depot
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Operations Shift Log */}
      {opModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                <span>Log Daily Operations Shift</span>
              </h3>
              <button onClick={() => setOpModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold p-1">×</button>
            </div>

            <form onSubmit={handleSaveOperationLog} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Duty Shift *</label>
                  <select
                    value={opForm.shift}
                    onChange={(e) => setOpForm({ ...opForm, shift: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                    <option value="Afternoon Shift (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                    <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Activity Type *</label>
                  <select
                    value={opForm.activityType}
                    onChange={(e) => setOpForm({ ...opForm, activityType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Traffic Flow & Alley Clearing">Traffic Flow & Alley Clearing</option>
                    <option value="Area 6 Perimeter & Street Patrol">Area 6 Field Monitoring</option>
                    <option value="Inspection">Public Infrastructure Inspection</option>
                    <option value="Barangay Hall Security & Frontline Duty">Barangay Hall Duty</option>
                    <option value="Curfew Enforcement">Curfew Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Supervisor / Officer In Charge *</label>
                <input
                  type="text"
                  required
                  value={opForm.officerInCharge}
                  onChange={(e) => setOpForm({ ...opForm, officerInCharge: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Duty Staff / Personnel (Comma separated) *</label>
                <input
                  type="text"
                  required
                  value={opForm.dutyTanods}
                  onChange={(e) => setOpForm({ ...opForm, dutyTanods: e.target.value })}
                  placeholder="e.g. Rolando Reyes, Bernardo Cruz"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Puroks Covered</label>
                  <input
                    type="text"
                    value={opForm.puroksCovered}
                    onChange={(e) => setOpForm({ ...opForm, puroksCovered: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Shift Status</label>
                  <select
                    value={opForm.status}
                    onChange={(e) => setOpForm({ ...opForm, status: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Shift Summary & Actions Accomplished *</label>
                <textarea
                  rows={3}
                  required
                  value={opForm.summary}
                  onChange={(e) => setOpForm({ ...opForm, summary: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase text-xs shadow-sm"
                >
                  Save Shift Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Check Out / Borrow Equipment */}
      {equipModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span>Check Out Operations Equipment</span>
              </h3>
              <button onClick={() => setEquipModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold p-1">×</button>
            </div>

            <form onSubmit={handleSaveEquipment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={equipForm.itemName}
                  onChange={(e) => setEquipForm({ ...equipForm, itemName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Property Number</label>
                  <input
                    type="text"
                    value={equipForm.propertyNumber}
                    onChange={(e) => setEquipForm({ ...equipForm, propertyNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Category</label>
                  <input
                    type="text"
                    value={equipForm.category}
                    onChange={(e) => setEquipForm({ ...equipForm, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Borrower / Assignee Name *</label>
                  <input
                    type="text"
                    required
                    value={equipForm.borrowerName}
                    onChange={(e) => setEquipForm({ ...equipForm, borrowerName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={equipForm.borrowerContact}
                    onChange={(e) => setEquipForm({ ...equipForm, borrowerContact: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Purpose / Operation *</label>
                <input
                  type="text"
                  required
                  value={equipForm.purpose}
                  onChange={(e) => setEquipForm({ ...equipForm, purpose: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">Expected Return Date</label>
                <input
                  type="date"
                  value={equipForm.expectedReturnDate}
                  onChange={(e) => setEquipForm({ ...equipForm, expectedReturnDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEquipModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase text-xs shadow-sm"
                >
                  Record Check Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Operations Brief */}
      {aiReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-indigo-900 text-white rounded-t-2xl">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Executive Operations Accomplishment Brief</span>
              </h3>
              <button onClick={() => setAiReportModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold p-1">×</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-bold text-slate-600 uppercase tracking-wider text-xs">
                    Compiling daily operational data & municipal accomplishment summary...
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
                  {aiReportText}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setAiReportModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
