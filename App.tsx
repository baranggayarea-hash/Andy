import React, { useState, useEffect } from 'react';
import { 
  Resident, 
  BlotterComplaint, 
  EmergencyIncident, 
  EvacuationCenter, 
  EmergencyAlert, 
  RescueResponder, 
  DailyOperationLog, 
  VisitorLogEntry, 
  EquipmentItem, 
  BarangayOfficial, 
  BDRRMInfo 
} from './types';
import { 
  getStoredResidents, 
  saveStoredResidents,
  getStoredComplaints, 
  saveStoredComplaints,
  getStoredIncidents,
  saveStoredIncidents,
  getStoredEvacuationCenters,
  saveStoredEvacuationCenters,
  getStoredEmergencyAlerts,
  saveStoredEmergencyAlerts,
  getStoredResponders,
  saveStoredResponders,
  getStoredOperations, 
  saveStoredOperations,
  getStoredVisitors, 
  saveStoredVisitors,
  getStoredEquipment, 
  saveStoredEquipment,
  getStoredOfficials,
  getStoredBdrrm,
  saveStoredBdrrm,
  resetToDemoData
} from './utils/storage';
import { 
  subscribeResidents, 
  saveResidentToFirestore, 
  deleteResidentFromFirestore,
  subscribeComplaints,
  saveComplaintToFirestore,
  deleteComplaintFromFirestore,
  subscribeEmergencyIncidents,
  saveEmergencyIncidentToFirestore,
  deleteEmergencyIncidentFromFirestore,
  subscribeEvacuationCenters,
  saveEvacuationCenterToFirestore,
  deleteEvacuationCenterFromFirestore,
  subscribeEmergencyAlerts,
  saveEmergencyAlertToFirestore,
  deleteEmergencyAlertFromFirestore,
  subscribeOperations,
  saveOperationToFirestore,
  subscribeVisitors,
  saveVisitorToFirestore,
  subscribeEquipment,
  saveEquipmentToFirestore,
  subscribeOfficials,
  subscribeBDRRM,
  saveBDRRMToFirestore,
  seedInitialFirestoreData
} from './services/firestoreService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ResidentsView } from './components/ResidentsView';
import { ComplaintsView } from './components/ComplaintsView';
import { EmergencyRescueView } from './components/EmergencyRescueView';
import { OperationsView } from './components/OperationsView';
import { OfficialsView } from './components/OfficialsView';
import { ResidentIdModal } from './components/ResidentIdModal';

function MainAppContent() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'residents' | 'complaints' | 'emergency' | 'operations' | 'officials'>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Primary Data State
  const [residents, setResidents] = useState<Resident[]>(getStoredResidents());
  const [complaints, setComplaints] = useState<BlotterComplaint[]>(getStoredComplaints());
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(getStoredIncidents());
  const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenter[]>(getStoredEvacuationCenters());
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(getStoredEmergencyAlerts());
  const [responders, setResponders] = useState<RescueResponder[]>(getStoredResponders());
  const [operations, setOperations] = useState<DailyOperationLog[]>(getStoredOperations());
  const [visitors, setVisitors] = useState<VisitorLogEntry[]>(getStoredVisitors());
  const [equipment, setEquipment] = useState<EquipmentItem[]>(getStoredEquipment());
  const [officials, setOfficials] = useState<BarangayOfficial[]>(getStoredOfficials());
  const [bdrrm, setBdrrm] = useState<BDRRMInfo>(getStoredBdrrm());

  // Cross-Navigation & Modal Linkage State
  const [selectedComplaintDetail, setSelectedComplaintDetail] = useState<BlotterComplaint | null>(null);
  const [selectedResidentForIdCard, setSelectedResidentForIdCard] = useState<Resident | null>(null);

  const { isFirebaseConnected } = useAuth();

  // Firestore Real-Time Subscriptions
  useEffect(() => {
    if (!isFirebaseConnected) return;

    const unsubs: (() => void)[] = [];

    // Subscribe Residents
    const unsubResidents = subscribeResidents((data) => {
      if (data && data.length > 0) {
        setResidents(data);
      }
    });
    unsubs.push(unsubResidents);

    // Subscribe Complaints
    const unsubComplaints = subscribeComplaints((data) => {
      if (data && data.length > 0) {
        setComplaints(data);
      }
    });
    unsubs.push(unsubComplaints);

    // Subscribe Emergency Incidents
    const unsubIncidents = subscribeEmergencyIncidents((data) => {
      if (data && data.length > 0) {
        setIncidents(data);
      }
    });
    unsubs.push(unsubIncidents);

    // Subscribe Evacuation Centers
    const unsubEvac = subscribeEvacuationCenters((data) => {
      if (data && data.length > 0) {
        setEvacuationCenters(data);
      }
    });
    unsubs.push(unsubEvac);

    // Subscribe Emergency Alerts
    const unsubAlerts = subscribeEmergencyAlerts((data) => {
      if (data && data.length > 0) {
        setEmergencyAlerts(data);
      }
    });
    unsubs.push(unsubAlerts);

    // Subscribe Operations
    const unsubOperations = subscribeOperations((data) => {
      if (data && data.length > 0) {
        setOperations(data);
      }
    });
    unsubs.push(unsubOperations);

    // Subscribe Visitors
    const unsubVisitors = subscribeVisitors((data) => {
      if (data && data.length > 0) {
        setVisitors(data);
      }
    });
    unsubs.push(unsubVisitors);

    // Subscribe Equipment
    const unsubEquipment = subscribeEquipment((data) => {
      if (data && data.length > 0) {
        setEquipment(data);
      }
    });
    unsubs.push(unsubEquipment);

    // Subscribe Officials
    const unsubOfficials = subscribeOfficials((data) => {
      if (data && data.length > 0) {
        setOfficials(data);
      }
    });
    unsubs.push(unsubOfficials);

    // Subscribe BDRRM
    const unsubBdrrm = subscribeBDRRM((data) => {
      if (data) {
        setBdrrm(data);
      }
    });
    unsubs.push(unsubBdrrm);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [isFirebaseConnected]);

  // Sync to local storage
  useEffect(() => {
    saveStoredResidents(residents);
  }, [residents]);

  useEffect(() => {
    saveStoredComplaints(complaints);
  }, [complaints]);

  useEffect(() => {
    saveStoredIncidents(incidents);
  }, [incidents]);

  useEffect(() => {
    saveStoredEvacuationCenters(evacuationCenters);
  }, [evacuationCenters]);

  useEffect(() => {
    saveStoredEmergencyAlerts(emergencyAlerts);
  }, [emergencyAlerts]);

  useEffect(() => {
    saveStoredResponders(responders);
  }, [responders]);

  useEffect(() => {
    saveStoredOperations(operations);
  }, [operations]);

  useEffect(() => {
    saveStoredVisitors(visitors);
  }, [visitors]);

  useEffect(() => {
    saveStoredEquipment(equipment);
  }, [equipment]);

  useEffect(() => {
    saveStoredBdrrm(bdrrm);
  }, [bdrrm]);

  // Resident CRUD
  const handleAddResident = (res: Resident) => {
    setResidents(prev => [res, ...prev]);
    saveResidentToFirestore(res).catch(console.error);
  };

  const handleUpdateResident = (res: Resident) => {
    setResidents(prev => prev.map(r => r.id === res.id ? res : r));
    saveResidentToFirestore(res).catch(console.error);
  };

  const handleDeleteResident = (id: string) => {
    setResidents(prev => prev.filter(r => r.id !== id));
    deleteResidentFromFirestore(id).catch(console.error);
  };

  // Complaint CRUD
  const handleAddComplaint = (c: BlotterComplaint) => {
    setComplaints(prev => [c, ...prev]);
    saveComplaintToFirestore(c).catch(console.error);
  };

  const handleUpdateComplaint = (c: BlotterComplaint) => {
    setComplaints(prev => prev.map(item => item.id === c.id ? c : item));
    saveComplaintToFirestore(c).catch(console.error);
  };

  const handleDeleteComplaint = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    deleteComplaintFromFirestore(id).catch(console.error);
  };

  // Emergency Incident CRUD
  const handleAddIncident = (inc: EmergencyIncident) => {
    setIncidents(prev => [inc, ...prev]);
    saveEmergencyIncidentToFirestore(inc).catch(console.error);
  };

  const handleUpdateIncident = (inc: EmergencyIncident) => {
    setIncidents(prev => prev.map(item => item.id === inc.id ? inc : item));
    saveEmergencyIncidentToFirestore(inc).catch(console.error);
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(item => item.id !== id));
    deleteEmergencyIncidentFromFirestore(id).catch(console.error);
  };

  // Evacuation Center CRUD
  const handleAddEvacuationCenter = (center: EvacuationCenter) => {
    setEvacuationCenters(prev => [center, ...prev]);
    saveEvacuationCenterToFirestore(center).catch(console.error);
  };

  const handleUpdateEvacuationCenter = (center: EvacuationCenter) => {
    setEvacuationCenters(prev => prev.map(c => c.id === center.id ? center : c));
    saveEvacuationCenterToFirestore(center).catch(console.error);
  };

  // Emergency Alert CRUD
  const handleAddEmergencyAlert = (alert: EmergencyAlert) => {
    setEmergencyAlerts(prev => [alert, ...prev]);
    saveEmergencyAlertToFirestore(alert).catch(console.error);
  };

  const handleUpdateEmergencyAlert = (alert: EmergencyAlert) => {
    setEmergencyAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
    saveEmergencyAlertToFirestore(alert).catch(console.error);
  };

  // Operation Logs
  const handleAddOperation = (log: DailyOperationLog) => {
    setOperations(prev => [log, ...prev]);
    saveOperationToFirestore(log).catch(console.error);
  };

  // Visitor Logs
  const handleAddVisitor = (vis: VisitorLogEntry) => {
    setVisitors(prev => [vis, ...prev]);
    saveVisitorToFirestore(vis).catch(console.error);
  };

  const handleUpdateVisitor = (vis: VisitorLogEntry) => {
    setVisitors(prev => prev.map(v => v.id === vis.id ? vis : v));
    saveVisitorToFirestore(vis).catch(console.error);
  };

  // Equipment Logs
  const handleAddEquipment = (item: EquipmentItem) => {
    setEquipment(prev => [item, ...prev]);
    saveEquipmentToFirestore(item).catch(console.error);
  };

  const handleUpdateEquipment = (item: EquipmentItem) => {
    setEquipment(prev => prev.map(eq => eq.id === item.id ? item : eq));
    saveEquipmentToFirestore(item).catch(console.error);
  };

  // BDRRM Update
  const handleUpdateBDRRM = (info: BDRRMInfo) => {
    setBdrrm(info);
    saveBDRRMToFirestore(info).catch(console.error);
  };

  const activeEmergencyCount = incidents.filter(i => i.status !== 'Resolved / Stand-down').length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-800 selection:bg-rose-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as any);
          if (tab !== 'complaints') setSelectedComplaintDetail(null);
        }}
        onOpenNewResident={() => setActiveTab('residents')}
        onOpenNewBlotter={() => setActiveTab('complaints')}
        onOpenNewEmergency={() => setActiveTab('emergency')}
        onOpenNewOperationLog={() => setActiveTab('operations')}
        bdrrm={bdrrm}
        pendingBlotterCount={complaints.filter(c => c.status !== 'Amicably Settled' && c.status !== 'Dismissed').length}
        activeEmergencyCount={activeEmergencyCount}
        onResetData={() => {
          resetToDemoData();
          seedInitialFirestoreData().then(() => window.location.reload());
        }}
        searchQuery={globalSearch}
        setSearchQuery={setGlobalSearch}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            residents={residents}
            complaints={complaints}
            incidents={incidents}
            evacuationCenters={evacuationCenters}
            emergencyAlerts={emergencyAlerts}
            operations={operations}
            bdrrm={bdrrm}
            onNavigate={(tab) => setActiveTab(tab as any)}
            onSelectComplaint={(c) => {
              setSelectedComplaintDetail(c);
              setActiveTab('complaints');
            }}
            onSelectResident={() => {
              setActiveTab('residents');
            }}
            onOpenNewBlotter={() => {
              setActiveTab('complaints');
            }}
            onOpenNewEmergency={() => {
              setActiveTab('emergency');
            }}
          />
        )}

        {activeTab === 'residents' && (
          <ResidentsView
            residents={residents}
            onAddResident={handleAddResident}
            onUpdateResident={handleUpdateResident}
            onDeleteResident={handleDeleteResident}
            onSelectResidentForEmergency={() => {
              setActiveTab('emergency');
            }}
            onSelectResidentForId={(r) => {
              setSelectedResidentForIdCard(r);
            }}
            searchQuery={globalSearch}
            setSearchQuery={setGlobalSearch}
          />
        )}

        {activeTab === 'complaints' && (
          <ComplaintsView
            complaints={complaints}
            residents={residents}
            officials={officials}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaint={handleUpdateComplaint}
            onDeleteComplaint={handleDeleteComplaint}
            searchQuery={globalSearch}
            setSearchQuery={setGlobalSearch}
            selectedComplaintFromOutside={selectedComplaintDetail}
            onClearSelectedOutside={() => setSelectedComplaintDetail(null)}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyRescueView
            incidents={incidents}
            evacuationCenters={evacuationCenters}
            emergencyAlerts={emergencyAlerts}
            responders={responders}
            residents={residents}
            equipment={equipment}
            officials={officials}
            onAddIncident={handleAddIncident}
            onUpdateIncident={handleUpdateIncident}
            onDeleteIncident={handleDeleteIncident}
            onAddEvacuationCenter={handleAddEvacuationCenter}
            onUpdateEvacuationCenter={handleUpdateEvacuationCenter}
            onAddEmergencyAlert={handleAddEmergencyAlert}
            onUpdateEmergencyAlert={handleUpdateEmergencyAlert}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsView
            operations={operations}
            equipment={equipment}
            bdrrm={bdrrm}
            officials={officials}
            onAddOperation={handleAddOperation}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onUpdateBdrrm={handleUpdateBDRRM}
          />
        )}

        {activeTab === 'officials' && (
          <OfficialsView officials={officials} />
        )}
      </main>

      {/* Official Barangay Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/40 flex items-center justify-center font-cinzel font-bold text-rose-300 text-xs">
              A6
            </div>
            <div>
              <div className="font-bold text-slate-200">Barangay Management Information System (BMIS)</div>
              <div className="text-[11px] text-slate-400">Barangay San Jose Annex Area 6 • Republic of the Philippines</div>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] space-y-0.5">
            <div>Philippine Disaster Risk Reduction & Management Act (RA 10121) & RA 7160 Compliant</div>
            <div className="text-slate-500 font-mono">BDRRMC 24/7 Operations Desk • Firestore Cloud Persistence Online</div>
          </div>
        </div>
      </footer>

      {/* Resident ID Modal */}
      {selectedResidentForIdCard && (
        <ResidentIdModal
          resident={selectedResidentForIdCard}
          officials={officials}
          onClose={() => setSelectedResidentForIdCard(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
