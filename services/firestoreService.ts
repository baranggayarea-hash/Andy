import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
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
} from '../types';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_COMPLAINTS, 
  INITIAL_EMERGENCY_INCIDENTS,
  INITIAL_EVACUATION_CENTERS,
  INITIAL_EMERGENCY_ALERTS,
  INITIAL_RESCUE_RESPONDERS,
  INITIAL_OPERATIONS_LOG, 
  INITIAL_VISITOR_LOGS, 
  INITIAL_EQUIPMENT, 
  INITIAL_OFFICIALS, 
  INITIAL_BDRRM 
} from '../data/mockData';

// Collection Paths
export const COLLECTIONS = {
  RESIDENTS: 'residents',
  COMPLAINTS: 'complaints',
  EMERGENCY_INCIDENTS: 'emergencyIncidents',
  EVACUATION_CENTERS: 'evacuationCenters',
  EMERGENCY_ALERTS: 'emergencyAlerts',
  OPERATIONS: 'operations',
  VISITORS: 'visitors',
  EQUIPMENT: 'equipment',
  OFFICIALS: 'officials',
  BDRRM: 'bdrrm'
} as const;

// Helper to seed initial dataset into Firestore if empty
export async function seedInitialFirestoreData() {
  try {
    const resSnap = await getDocs(collection(db, COLLECTIONS.RESIDENTS));
    if (resSnap.empty) {
      console.log('Seeding initial Barangay San Jose Annex Area 6 data to Firestore...');
      
      const batch = writeBatch(db);

      // Seed Residents
      INITIAL_RESIDENTS.forEach(res => {
        batch.set(doc(db, COLLECTIONS.RESIDENTS, res.id), res);
      });

      // Seed Complaints
      INITIAL_COMPLAINTS.forEach(comp => {
        batch.set(doc(db, COLLECTIONS.COMPLAINTS, comp.id), comp);
      });

      // Seed Emergency Incidents
      INITIAL_EMERGENCY_INCIDENTS.forEach(inc => {
        batch.set(doc(db, COLLECTIONS.EMERGENCY_INCIDENTS, inc.id), inc);
      });

      // Seed Evacuation Centers
      INITIAL_EVACUATION_CENTERS.forEach(evac => {
        batch.set(doc(db, COLLECTIONS.EVACUATION_CENTERS, evac.id), evac);
      });

      // Seed Emergency Alerts
      INITIAL_EMERGENCY_ALERTS.forEach(alert => {
        batch.set(doc(db, COLLECTIONS.EMERGENCY_ALERTS, alert.id), alert);
      });

      // Seed Operations
      INITIAL_OPERATIONS_LOG.forEach(op => {
        batch.set(doc(db, COLLECTIONS.OPERATIONS, op.id), op);
      });

      // Seed Visitors
      INITIAL_VISITOR_LOGS.forEach(vis => {
        batch.set(doc(db, COLLECTIONS.VISITORS, vis.id), vis);
      });

      // Seed Equipment
      INITIAL_EQUIPMENT.forEach(eq => {
        batch.set(doc(db, COLLECTIONS.EQUIPMENT, eq.id), eq);
      });

      // Seed Officials
      INITIAL_OFFICIALS.forEach(off => {
        batch.set(doc(db, COLLECTIONS.OFFICIALS, off.id), off);
      });

      // Seed BDRRM
      batch.set(doc(db, COLLECTIONS.BDRRM, 'main_advisory'), INITIAL_BDRRM);

      await batch.commit();
      console.log('Initial Barangay data seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
  }
}

// ----------------- RESIDENTS -----------------
export function subscribeResidents(
  onUpdate: (data: Resident[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.RESIDENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Resident[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Resident);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveResidentToFirestore(resident: Resident): Promise<void> {
  const path = `${COLLECTIONS.RESIDENTS}/${resident.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.RESIDENTS, resident.id), resident, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteResidentFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.RESIDENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.RESIDENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- COMPLAINTS -----------------
export function subscribeComplaints(
  onUpdate: (data: BlotterComplaint[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.COMPLAINTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: BlotterComplaint[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as BlotterComplaint);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveComplaintToFirestore(complaint: BlotterComplaint): Promise<void> {
  const path = `${COLLECTIONS.COMPLAINTS}/${complaint.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.COMPLAINTS, complaint.id), complaint, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteComplaintFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.COMPLAINTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.COMPLAINTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- EMERGENCY INCIDENTS -----------------
export function subscribeEmergencyIncidents(
  onUpdate: (data: EmergencyIncident[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.EMERGENCY_INCIDENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: EmergencyIncident[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as EmergencyIncident);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveEmergencyIncidentToFirestore(inc: EmergencyIncident): Promise<void> {
  const path = `${COLLECTIONS.EMERGENCY_INCIDENTS}/${inc.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EMERGENCY_INCIDENTS, inc.id), inc, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEmergencyIncidentFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.EMERGENCY_INCIDENTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EMERGENCY_INCIDENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- EVACUATION CENTERS -----------------
export function subscribeEvacuationCenters(
  onUpdate: (data: EvacuationCenter[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.EVACUATION_CENTERS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: EvacuationCenter[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as EvacuationCenter);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveEvacuationCenterToFirestore(center: EvacuationCenter): Promise<void> {
  const path = `${COLLECTIONS.EVACUATION_CENTERS}/${center.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EVACUATION_CENTERS, center.id), center, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEvacuationCenterFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.EVACUATION_CENTERS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EVACUATION_CENTERS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- EMERGENCY ALERTS -----------------
export function subscribeEmergencyAlerts(
  onUpdate: (data: EmergencyAlert[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.EMERGENCY_ALERTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: EmergencyAlert[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as EmergencyAlert);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveEmergencyAlertToFirestore(alert: EmergencyAlert): Promise<void> {
  const path = `${COLLECTIONS.EMERGENCY_ALERTS}/${alert.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EMERGENCY_ALERTS, alert.id), alert, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEmergencyAlertFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.EMERGENCY_ALERTS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EMERGENCY_ALERTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ----------------- OPERATIONS -----------------
export function subscribeOperations(
  onUpdate: (data: DailyOperationLog[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.OPERATIONS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: DailyOperationLog[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as DailyOperationLog);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveOperationToFirestore(log: DailyOperationLog): Promise<void> {
  const path = `${COLLECTIONS.OPERATIONS}/${log.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.OPERATIONS, log.id), log, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------- VISITORS -----------------
export function subscribeVisitors(
  onUpdate: (data: VisitorLogEntry[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.VISITORS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: VisitorLogEntry[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as VisitorLogEntry);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveVisitorToFirestore(visitor: VisitorLogEntry): Promise<void> {
  const path = `${COLLECTIONS.VISITORS}/${visitor.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.VISITORS, visitor.id), visitor, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------- EQUIPMENT -----------------
export function subscribeEquipment(
  onUpdate: (data: EquipmentItem[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.EQUIPMENT;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: EquipmentItem[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as EquipmentItem);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveEquipmentToFirestore(item: EquipmentItem): Promise<void> {
  const path = `${COLLECTIONS.EQUIPMENT}/${item.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EQUIPMENT, item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ----------------- OFFICIALS -----------------
export function subscribeOfficials(
  onUpdate: (data: BarangayOfficial[]) => void,
  onError?: (error: unknown) => void
) {
  const path = COLLECTIONS.OFFICIALS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: BarangayOfficial[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data(), id: docSnap.id } as BarangayOfficial);
      });
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------- BDRRM -----------------
export function subscribeBDRRM(
  onUpdate: (data: BDRRMInfo) => void,
  onError?: (error: unknown) => void
) {
  const path = `${COLLECTIONS.BDRRM}/main_advisory`;
  return onSnapshot(
    doc(db, COLLECTIONS.BDRRM, 'main_advisory'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as BDRRMInfo);
      }
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveBDRRMToFirestore(bdrrm: BDRRMInfo): Promise<void> {
  const path = `${COLLECTIONS.BDRRM}/main_advisory`;
  try {
    await setDoc(doc(db, COLLECTIONS.BDRRM, 'main_advisory'), bdrrm, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
