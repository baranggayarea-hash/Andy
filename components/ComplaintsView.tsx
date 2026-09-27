import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Printer, 
  ShieldAlert, 
  MessageSquareWarning, 
  Trash2, 
  User, 
  Eye, 
  AlertTriangle, 
  Filter, 
  Send, 
  FileCheck2,
  Wrench,
  Megaphone,
  UserX,
  Phone,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ResidentComplaint, 
  Resident, 
  BarangayOfficial, 
  ResidentComplaintCategory, 
  ComplaintPriority, 
  ResidentComplaintStatus, 
  ComplaintActionLog, 
  Purok 
} from '../types';
import { formatDate, generateComplaintNumber } from '../utils/formatters';
import { PUROKS } from '../data/mockData';
import { PrintableComplaintTicketModal } from './PrintableComplaintTicketModal';

interface ComplaintsViewProps {
  complaints: ResidentComplaint[];
  residents: Resident[];
  officials?: BarangayOfficial[];
  onAddComplaint: (complaint: ResidentComplaint) => void;
  onUpdateComplaint: (complaint: ResidentComplaint) => void;
  onDeleteComplaint: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedComplaintFromOutside?: ResidentComplaint | null;
  onClearSelectedOutside?: () => void;
}

const COMPLAINT_CATEGORIES: ResidentComplaintCategory[] = [
  'Noise & Curfew Disturbance',
  'Sanitation & Garbage Disposal',
  'Animal Nuisance & Stray Pets',
  'Illegal Parking & Road Obstruction',
  'Drainage & Clogged Canal',
  'Streetlight & Facility Maintenance',
  'Neighborhood Conflict / Boundary',
  'Public Safety & Disturbance',
  'Verbal Harassment & Dispute',
  'Other Resident Grievance'
];

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  complaints,
  residents,
  officials = [],
  onAddComplaint,
  onUpdateComplaint,
  onDeleteComplaint,
  searchQuery,
  setSearchQuery,
  selectedComplaintFromOutside,
  onClearSelectedOutside,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [purokFilter, setPurokFilter] = useState<string>('ALL');
  
  const [selectedCase, setSelectedCase] = useState<ResidentComplaint | null>(
    selectedComplaintFromOutside || complaints[0] || null
  );

  // Modals
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [aiAdviceModalOpen, setAiAdviceModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdviceText, setAiAdviceText] = useState<string>('');

  // New Action Log Entry State
  const [newActionType, setNewActionType] = useState<ComplaintActionLog['actionType']>('Inspection / Site Visit');
  const [newActionOfficer, setNewActionOfficer] = useState('Officer Gabriel T. Morales (Chief Tanod)');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [newActionStatusUpdate, setNewActionStatusUpdate] = useState<ResidentComplaintStatus | ''>('');

  // Resolution Form State
  const [resolutionSummary, setResolutionSummary] = useState('');

  // New Resident Complaint Form State
  const [complainantType, setComplainantType] = useState<'registered' | 'manual' | 'anonymous'>('registered');
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || '');
  const [newForm, setNewForm] = useState<{
    category: ResidentComplaintCategory;
    priority: ComplaintPriority;
    incidentDate: string;
    incidentTime: string;
    incidentLocation: string;
    purok: Purok;
    complainantName: string;
    complainantContact: string;
    complainantAddress: string;
    isAnonymous: boolean;
    respondentName: string;
    respondentAddress: string;
    narrative: string;
    requestedAction: string;
    assignedOfficer: string;
  }>({
    category: 'Noise & Curfew Disturbance',
    priority: 'Medium',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '14:00',
    incidentLocation: 'Rosal St., Area 6',
    purok: 'Purok 6 - Annex Proper',
    complainantName: '',
    complainantContact: '',
    complainantAddress: 'Barangay San Jose Annex Area 6',
    isAnonymous: false,
    respondentName: '',
    respondentAddress: 'Barangay San Jose Annex Area 6',
    narrative: '',
    requestedAction: 'Tanod on-site inspection and issuance of compliance advisory.',
    assignedOfficer: 'Officer Gabriel T. Morales (Chief Tanod)'
  });

  const handleOpenNew = () => {
    setComplainantType('registered');
    const firstRes = residents[0];
    setNewForm({
      category: 'Noise & Curfew Disturbance',
      priority: 'Medium',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: new Date().toTimeString().slice(0, 5),
      incidentLocation: firstRes ? `${firstRes.houseNumber} ${firstRes.streetName}` : 'Area 6, San Jose Annex',
      purok: firstRes ? firstRes.purok : 'Purok 6 - Annex Proper',
      complainantName: firstRes ? `${firstRes.firstName} ${firstRes.lastName}` : '',
      complainantContact: firstRes ? firstRes.contactNumber : '',
      complainantAddress: firstRes ? `${firstRes.houseNumber} ${firstRes.streetName}, ${firstRes.purok}` : 'Barangay San Jose Annex Area 6',
      isAnonymous: false,
      respondentName: '',
      respondentAddress: 'Area 6, Barangay San Jose Annex',
      narrative: '',
      requestedAction: 'Tanod on-site verification and verbal warning / compliance notice.',
      assignedOfficer: 'Officer Gabriel T. Morales (Chief Tanod)'
    });
    setNewModalOpen(true);
  };

  const handleResidentSelect = (resId: string) => {
    setSelectedResidentId(resId);
    const res = residents.find(r => r.id === resId);
    if (res) {
      setNewForm(prev => ({
        ...prev,
        complainantName: `${res.firstName} ${res.lastName}`,
        complainantContact: res.contactNumber,
        complainantAddress: `${res.houseNumber} ${res.streetName}, ${res.purok}`,
        purok: res.purok
      }));
    }
  };

  const handleSaveNewComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.narrative.trim()) {
      alert('Please enter the complaint narrative/details.');
      return;
    }
    if (complainantType !== 'anonymous' && !newForm.complainantName.trim()) {
      alert('Please specify complainant name or select Anonymous.');
      return;
    }

    const ticketNumber = generateComplaintNumber();
    const newComplaint: ResidentComplaint = {
      id: `cmp-${Date.now()}`,
      complaintNumber: ticketNumber,
      blotterNumber: ticketNumber,
      incidentDate: newForm.incidentDate,
      incidentTime: newForm.incidentTime,
      incidentLocation: newForm.incidentLocation,
      purok: newForm.purok,
      incidentCategory: newForm.category,
      priority: newForm.priority,
      complainantIds: complainantType === 'registered' && selectedResidentId ? [selectedResidentId] : [],
      complainantNames: complainantType === 'anonymous' ? ['Anonymous Resident'] : [newForm.complainantName],
      complainantContacts: complainantType === 'anonymous' ? ['Confidential'] : [newForm.complainantContact || 'N/A'],
      complainantAddresses: complainantType === 'anonymous' ? ['Area 6 (Confidential)'] : [newForm.complainantAddress],
      isAnonymous: complainantType === 'anonymous',
      respondentNames: [newForm.respondentName || 'Unspecified Concern'],
      respondentAddresses: [newForm.respondentAddress],
      narrative: newForm.narrative,
      requestedAction: newForm.requestedAction,
      status: 'Received / Under Review',
      assignedOfficer: newForm.assignedOfficer,
      actionLogs: [
        {
          id: `act-${Date.now()}`,
          actionDate: newForm.incidentDate,
          actionTime: newForm.incidentTime,
          actionBy: 'Barangay Grievance Desk',
          actionType: 'Notice / Advisory Issued',
          description: `Complaint ticket ${ticketNumber} received and registered at Area 6 Desk. Assigned to ${newForm.assignedOfficer}.`
        }
      ],
      recordedBy: 'Barangay Public Assistance Desk',
      createdAt: new Date().toISOString()
    };

    onAddComplaint(newComplaint);
    setNewModalOpen(false);
    setSelectedCase(newComplaint);
  };

  // Add Action Log to selected complaint
  const handleAddActionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newActionDescription.trim()) {
      alert('Please describe the action taken or inspection findings.');
      return;
    }

    const newLog: ComplaintActionLog = {
      id: `act-${Date.now()}`,
      actionDate: new Date().toISOString().split('T')[0],
      actionTime: new Date().toTimeString().slice(0, 5),
      actionBy: newActionOfficer,
      actionType: newActionType,
      description: newActionDescription.trim()
    };

    let nextStatus: ResidentComplaintStatus = selectedCase.status;
    if (newActionStatusUpdate) {
      nextStatus = newActionStatusUpdate;
    } else if (selectedCase.status === 'Received / Under Review') {
      nextStatus = 'Assigned / Tanod Dispatched';
    }

    const updated: ResidentComplaint = {
      ...selectedCase,
      status: nextStatus,
      actionLogs: [...(selectedCase.actionLogs || []), newLog]
    };

    onUpdateComplaint(updated);
    setSelectedCase(updated);
    setNewActionDescription('');
    setNewActionStatusUpdate('');
  };

  // Resolve & Close Complaint
  const handleResolveComplaint = () => {
    if (!selectedCase) return;
    const summary = resolutionSummary.trim() || 'Issue inspected on-site by Barangay Tanod and resolved amicably with resident compliance.';

    const updated: ResidentComplaint = {
      ...selectedCase,
      status: 'Resolved & Closed',
      resolvedAt: new Date().toISOString(),
      resolutionSummary: summary,
      actionLogs: [
        ...(selectedCase.actionLogs || []),
        {
          id: `act-${Date.now()}`,
          actionDate: new Date().toISOString().split('T')[0],
          actionTime: new Date().toTimeString().slice(0, 5),
          actionBy: selectedCase.assignedOfficer || 'Punong Barangay & Tanod Desk',
          actionType: 'Resolved On-Site',
          description: `Complaint officially resolved and closed: ${summary}`
        }
      ]
    };

    onUpdateComplaint(updated);
    setSelectedCase(updated);
    setResolutionSummary('');

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // AI Resident Complaint Action Advisor
  const handleAskAiAdvisor = async (complaint: ResidentComplaint) => {
    setAiLoading(true);
    setAiAdviceModalOpen(true);
    try {
      const res = await fetch('/api/ai/complaint-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentCategory: complaint.incidentCategory,
          narrative: complaint.narrative,
          complainantNames: complaint.complainantNames,
          respondentNames: complaint.respondentNames,
          location: complaint.incidentLocation,
          priority: complaint.priority
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiAdviceText(data.advice);
      } else {
        setAiAdviceText('Failed to obtain AI action advice: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      setAiAdviceText('Error connecting to AI service: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtering
  const filteredComplaints = complaints.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      c.complaintNumber?.toLowerCase().includes(q) ||
      c.blotterNumber?.toLowerCase().includes(q) ||
      c.incidentLocation.toLowerCase().includes(q) ||
      c.narrative.toLowerCase().includes(q) ||
      (c.complainantNames || []).some(n => n.toLowerCase().includes(q)) ||
      (c.respondentNames || []).some(n => n.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.incidentCategory === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesPurok = purokFilter === 'ALL' || c.purok === purokFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesPurok;
  });

  // Analytics counts
  const totalComplaints = complaints.length;
  const underReviewCount = complaints.filter(c => c.status === 'Received / Under Review').length;
  const dispatchedCount = complaints.filter(c => c.status === 'Assigned / Tanod Dispatched' || c.status === 'Action Taken / In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved & Closed').length;
  const resolutionPercentage = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Printable Slip Modal */}
      {ticketModalOpen && selectedCase && (
        <PrintableComplaintTicketModal
          complaint={selectedCase}
          officials={officials}
          onClose={() => setTicketModalOpen(false)}
        />
      )}

      {/* Top Banner & Quick Analytics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <span>Resident Complaints & Grievance Desk</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Public Assistance, Tanod Dispatch, Citizen Nuisance & Neighborhood Action Center (Area 6)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>File Resident Complaint</span>
            </button>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Grievances</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalComplaints}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Registered in Area 6 Desk</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Under Review</p>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">{underReviewCount}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Awaiting initial evaluation</p>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Tanod / Action Dispatched</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{dispatchedCount}</p>
            <p className="text-[10px] text-blue-700 mt-0.5">Field inspection & clean-up in progress</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Resolved & Closed</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                {resolutionPercentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{resolvedCount}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Compliance verified on-site</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket #, resident, respondent, street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Received / Under Review">Under Review</option>
              <option value="Assigned / Tanod Dispatched">Tanod Dispatched</option>
              <option value="Action Taken / In Progress">Action In Progress</option>
              <option value="Resolved & Closed">Resolved & Closed</option>
              <option value="Dismissed / Invalid">Dismissed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {COMPLAINT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Purok Filter */}
          <div className="lg:col-span-1">
            <select
              value={purokFilter}
              onChange={(e) => setPurokFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Puroks</option>
              {PUROKS.map(p => (
                <option key={p} value={p}>{p.split(' - ')[0]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Complaints (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-600">
              Complaints List ({filteredComplaints.length})
            </span>
            <span className="text-[10px] text-slate-400">Click ticket to view desk</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[720px] overflow-y-auto">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map(c => {
                const isSelected = selectedCase?.id === c.id;
                const isUrgent = c.priority === 'Urgent';
                const isHigh = c.priority === 'High';
                const ticketNum = c.complaintNumber || c.blotterNumber || 'CMP-000';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : isUrgent 
                          ? 'border-rose-500 hover:bg-rose-50/30' 
                          : isHigh 
                            ? 'border-amber-500 hover:bg-amber-50/30' 
                            : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ticketNum}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                          isUrgent ? 'text-rose-700 bg-rose-50 border-rose-200' :
                          isHigh ? 'text-amber-700 bg-amber-50 border-amber-200' :
                          'text-slate-600 bg-slate-100 border-slate-200'
                        }`}>
                          {c.priority || 'Normal'}
                        </span>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        c.status === 'Resolved & Closed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        c.status === 'Action Taken / In Progress' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        c.status === 'Assigned / Tanod Dispatched' ? 'text-indigo-700 bg-indigo-50 border-indigo-200' :
                        c.status === 'Dismissed / Invalid' ? 'text-slate-500 bg-slate-100 border-slate-200' :
                        'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                      {c.incidentCategory}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {c.narrative}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.purok.split(' - ')[0]} • {c.incidentLocation.split(',')[0]}</span>
                      </span>
                      <span>{formatDate(c.incidentDate)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">No resident complaints found matching filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Complaint Desk / Action Center (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedCase ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
              {/* Header with Ticket & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {selectedCase.complaintNumber || selectedCase.blotterNumber || 'CMP-2026-0000'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      selectedCase.priority === 'Urgent' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                      selectedCase.priority === 'High' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                      'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {selectedCase.priority || 'Normal'} Priority
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                    {selectedCase.incidentCategory}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                    title="Print Official Complaint Slip"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>

                  <button
                    onClick={() => handleAskAiAdvisor(selectedCase)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Action Advisor</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete complaint ticket ${selectedCase.complaintNumber || selectedCase.blotterNumber}?`)) {
                        onDeleteComplaint(selectedCase.id);
                        setSelectedCase(null);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Complaint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status & Timing Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Desk Status</span>
                  <span className="font-bold text-indigo-700">{selectedCase.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Purok Area</span>
                  <span className="font-semibold text-slate-800">{selectedCase.purok}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Filing Timestamp</span>
                  <span className="font-medium text-slate-700">{formatDate(selectedCase.incidentDate)} {selectedCase.incidentTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Officer in Charge</span>
                  <span className="font-semibold text-slate-800 truncate block">{selectedCase.assignedOfficer || 'Tanod Desk'}</span>
                </div>
              </div>

              {/* Complainant vs Target Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Complainant Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Complainant (Nagsusumbong)
                    </span>
                    {selectedCase.isAnonymous && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        CONFIDENTIAL
                      </span>
                    )}
                  </div>
                  {selectedCase.isAnonymous ? (
                    <div className="text-slate-500 italic py-1">
                      Resident requested confidential / anonymous reporting protection.
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {(selectedCase.complainantNames || []).join(', ') || 'Resident'}
                      </p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        <span className="text-slate-400">Contact:</span> {(selectedCase.complainantContacts || []).join(', ') || 'N/A'}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <span className="text-slate-400">Address:</span> {(selectedCase.complainantAddresses || []).join(', ') || selectedCase.incidentLocation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Target / Respondent Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 block">
                    Concern Target / Respondent (Inirereklamo)
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {(selectedCase.respondentNames || []).join(', ') || 'Unspecified Hazard'}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      <span className="text-slate-400">Location:</span> {selectedCase.incidentLocation}
                    </p>
                    {selectedCase.respondentAddresses && selectedCase.respondentAddresses.length > 0 && (
                      <p className="text-slate-600 text-[11px]">
                        <span className="text-slate-400">Address:</span> {selectedCase.respondentAddresses.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Grievance Narrative */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Grievance Narrative / Detalye ng Reklamo
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  {selectedCase.narrative}
                </div>
                {selectedCase.requestedAction && (
                  <div className="text-[11px] text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                    <span className="font-bold">Resident Requested Action:</span> {selectedCase.requestedAction}
                  </div>
                )}
              </div>

              {/* Action Logs Timeline */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>Barangay Field Actions & Tanod Inspection Log</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(selectedCase.actionLogs || []).length} Recorded Entries
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedCase.actionLogs && selectedCase.actionLogs.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                      {selectedCase.actionLogs.map((log, index) => (
                        <div key={log.id || index} className="p-3 text-xs bg-white space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono text-slate-400">{log.actionDate} • {log.actionTime}</span>
                            <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {log.actionType}
                            </span>
                          </div>
                          <p className="text-slate-800 text-[11px] leading-relaxed">{log.description}</p>
                          <p className="text-[10px] text-slate-400">
                            Conducted by: <span className="font-medium text-slate-600">{log.actionBy}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      No field action logged yet. Use the form below to record tanod inspection or notices.
                    </p>
                  )}
                </div>

                {/* Add New Action Log Form */}
                {selectedCase.status !== 'Resolved & Closed' && (
                  <form onSubmit={handleAddActionLog} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      + Record Tanod Inspection or Field Action
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Action Type</label>
                        <select
                          value={newActionType}
                          onChange={(e) => setNewActionType(e.target.value as any)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        >
                          <option value="Inspection / Site Visit">Inspection / Site Visit</option>
                          <option value="Notice / Advisory Issued">Notice / Advisory Issued</option>
                          <option value="Clean-up / Physical Action">Clean-up / Physical Action</option>
                          <option value="Verbal Warning">Verbal Warning</option>
                          <option value="Resident Follow-up">Resident Follow-up</option>
                          <option value="Resolved On-Site">Resolved On-Site</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Officer in Charge</label>
                        <input
                          type="text"
                          value={newActionOfficer}
                          onChange={(e) => setNewActionOfficer(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                          placeholder="Officer name & designation"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Action Taken / Findings</label>
                      <textarea
                        rows={2}
                        value={newActionDescription}
                        onChange={(e) => setNewActionDescription(e.target.value)}
                        placeholder="Detail what the Tanod / Barangay Officer did on-site (e.g. inspected loud sound system, issued 24-hr clean-up notice)..."
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                      <div className="w-full sm:w-auto">
                        <select
                          value={newActionStatusUpdate}
                          onChange={(e) => setNewActionStatusUpdate(e.target.value as any)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
                        >
                          <option value="">Status: Keep Current ({selectedCase.status})</option>
                          <option value="Assigned / Tanod Dispatched">Change to: Tanod Dispatched</option>
                          <option value="Action Taken / In Progress">Change to: In Progress</option>
                          <option value="Resolved & Closed">Change to: Resolved & Closed</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Field Action</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Resolution Section */}
              {selectedCase.status === 'Resolved & Closed' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold uppercase tracking-wider text-emerald-800 text-[11px]">
                      Case Officially Resolved & Closed
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed pt-1">
                    {selectedCase.resolutionSummary || 'Resident complaint resolved with full compliance and peace verified on-site.'}
                  </p>
                  {selectedCase.resolvedAt && (
                    <p className="text-[10px] text-emerald-700 font-mono mt-1">
                      Resolved Date: {formatDate(selectedCase.resolvedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-indigo-900 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>Conclude & Close Resident Grievance</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter final resolution note (e.g. resident removed obstruction, dogs caged, audio shut down)..."
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    className="w-full text-xs bg-white border border-indigo-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleResolveComplaint}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Resolved & Closed</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 space-y-3">
              <MessageSquareWarning className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Complaint Selected</h3>
              <p className="text-xs max-w-sm mx-auto">
                Select an existing ticket from the left panel to review tanod action logs, print tickets, or file a new resident grievance.
              </p>
              <button
                onClick={handleOpenNew}
                className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider"
              >
                + File New Complaint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Complaint Intake Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>File New Resident Complaint / Grievance</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Barangay San Jose Annex Area 6 Citizen Intake</p>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveNewComplaint} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Complainant Selection Method */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Complainant Resident
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setComplainantType('registered');
                      if (residents[0]) handleResidentSelect(residents[0].id);
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      complainantType === 'registered'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Select Registered Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComplainantType('manual');
                      setNewForm(prev => ({
                        ...prev,
                        complainantName: '',
                        complainantContact: '',
                        complainantAddress: 'Barangay San Jose Annex Area 6'
                      }));
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      complainantType === 'manual'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Enter Custom Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComplainantType('anonymous');
                      setNewForm(prev => ({
                        ...prev,
                        complainantName: 'Anonymous Resident',
                        complainantContact: 'Confidential',
                        complainantAddress: 'Area 6 (Confidential)'
                      }));
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      complainantType === 'anonymous'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Anonymous / Confidential
                  </button>
                </div>

                {complainantType === 'registered' && (
                  <div className="pt-1">
                    <select
                      value={selectedResidentId}
                      onChange={(e) => handleResidentSelect(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800"
                    >
                      {residents.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.firstName} {r.lastName} • {r.purok} ({r.houseNumber} {r.streetName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {complainantType === 'manual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Complainant Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newForm.complainantName}
                        onChange={(e) => setNewForm({ ...newForm, complainantName: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={newForm.complainantContact}
                        onChange={(e) => setNewForm({ ...newForm, complainantContact: e.target.value })}
                        placeholder="0917-000-0000"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category, Priority & Purok */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Category *</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    {COMPLAINT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Priority Level</label>
                  <select
                    value={newForm.priority}
                    onChange={(e) => setNewForm({ ...newForm, priority: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Code Red</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Purok *</label>
                  <select
                    value={newForm.purok}
                    onChange={(e) => setNewForm({ ...newForm, purok: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    {PUROKS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exact Location & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Specific Incident Street / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={newForm.incidentLocation}
                    onChange={(e) => setNewForm({ ...newForm, incidentLocation: e.target.value })}
                    placeholder="e.g. Block 4 Lot 12, Rosal St. corner Sampaguita"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Date & Time</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={newForm.incidentDate}
                      onChange={(e) => setNewForm({ ...newForm, incidentDate: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-1.5"
                    />
                    <input
                      type="time"
                      value={newForm.incidentTime}
                      onChange={(e) => setNewForm({ ...newForm, incidentTime: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Subject / Respondent Party */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Subject / Party Inirereklamo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={newForm.respondentName}
                      onChange={(e) => setNewForm({ ...newForm, respondentName: e.target.value })}
                      placeholder="Name of neighbor, sari-sari store, or hazard description"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newForm.respondentAddress}
                      onChange={(e) => setNewForm({ ...newForm, respondentAddress: e.target.value })}
                      placeholder="Address or location of subject"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Grievance Narrative */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Incident Narrative & Facts *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newForm.narrative}
                  onChange={(e) => setNewForm({ ...newForm, narrative: e.target.value })}
                  placeholder="Clearly describe the incident, nuisance, or hazard (e.g. loud videoke past curfew, blocked drainage from construction waste, unconfined stray dog)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Requested Action & Assigned Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Requested Barangay Action</label>
                  <input
                    type="text"
                    value={newForm.requestedAction}
                    onChange={(e) => setNewForm({ ...newForm, requestedAction: e.target.value })}
                    placeholder="e.g. Tanod dispatch, clear road obstruction, advisory notice"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Assigned Tanod / Kagawad</label>
                  <input
                    type="text"
                    value={newForm.assignedOfficer}
                    onChange={(e) => setNewForm({ ...newForm, assignedOfficer: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-sm"
                >
                  Register Complaint Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Complaint Action Advisor Modal */}
      {aiAdviceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-indigo-900 text-white rounded-t-2xl">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Barangay AI Action Advisor</h3>
                  <p className="text-xs text-indigo-200">
                    Ordinance Guidance, Tanod Inspection Protocol & Compliance Draft
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiAdviceModalOpen(false)}
                className="text-indigo-200 hover:text-white text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-slate-600">
                    Evaluating resident complaint under City Ordinances & Area 6 Directives...
                  </p>
                </div>
              ) : (
                <div className="prose prose-xs max-w-none text-slate-800 space-y-3 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                  {aiAdviceText}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setAiAdviceModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
