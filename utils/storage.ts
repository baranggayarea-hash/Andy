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

const STORAGE_KEYS = {
  RESIDENTS: 'bmis_residents_v1',
  COMPLAINTS: 'bmis_complaints_v1',
  EMERGENCY_INCIDENTS: 'bmis_emergency_incidents_v1',
  EVACUATION_CENTERS: 'bmis_evacuation_centers_v1',
  EMERGENCY_ALERTS: 'bmis_emergency_alerts_v1',
  RESCUE_RESPONDERS: 'bmis_rescue_responders_v1',
  OPERATIONS: 'bmis_operations_v1',
  VISITORS: 'bmis_visitors_v1',
  EQUIPMENT: 'bmis_equipment_v1',
  OFFICIALS: 'bmis_officials_v1',
  BDRRM: 'bmis_bdrrm_v1',
};

export const getStoredResidents = (): Resident[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESIDENTS);
    return data ? JSON.parse(data) : INITIAL_RESIDENTS;
  } catch (e) {
    return INITIAL_RESIDENTS;
  }
};

export const saveStoredResidents = (residents: Resident[]) => {
  localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(residents));
};
export const saveResidents = saveStoredResidents;

export const getStoredComplaints = (): BlotterComplaint[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return data ? JSON.parse(data) : INITIAL_COMPLAINTS;
  } catch (e) {
    return INITIAL_COMPLAINTS;
  }
};

export const saveStoredComplaints = (complaints: BlotterComplaint[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
};
export const saveComplaints = saveStoredComplaints;

export const getStoredEmergencyIncidents = (): EmergencyIncident[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY_INCIDENTS);
    return data ? JSON.parse(data) : INITIAL_EMERGENCY_INCIDENTS;
  } catch (e) {
    return INITIAL_EMERGENCY_INCIDENTS;
  }
};

export const saveStoredEmergencyIncidents = (incidents: EmergencyIncident[]) => {
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_INCIDENTS, JSON.stringify(incidents));
};
export const getStoredIncidents = getStoredEmergencyIncidents;
export const saveStoredIncidents = saveStoredEmergencyIncidents;

export const getStoredEvacuationCenters = (): EvacuationCenter[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVACUATION_CENTERS);
    return data ? JSON.parse(data) : INITIAL_EVACUATION_CENTERS;
  } catch (e) {
    return INITIAL_EVACUATION_CENTERS;
  }
};

export const saveStoredEvacuationCenters = (centers: EvacuationCenter[]) => {
  localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(centers));
};

export const getStoredEmergencyAlerts = (): EmergencyAlert[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS);
    return data ? JSON.parse(data) : INITIAL_EMERGENCY_ALERTS;
  } catch (e) {
    return INITIAL_EMERGENCY_ALERTS;
  }
};

export const saveStoredEmergencyAlerts = (alerts: EmergencyAlert[]) => {
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(alerts));
};

export const getStoredRescueResponders = (): RescueResponder[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESCUE_RESPONDERS);
    return data ? JSON.parse(data) : INITIAL_RESCUE_RESPONDERS;
  } catch (e) {
    return INITIAL_RESCUE_RESPONDERS;
  }
};

export const saveStoredRescueResponders = (responders: RescueResponder[]) => {
  localStorage.setItem(STORAGE_KEYS.RESCUE_RESPONDERS, JSON.stringify(responders));
};
export const getStoredResponders = getStoredRescueResponders;
export const saveStoredResponders = saveStoredRescueResponders;

export const getStoredOperations = (): DailyOperationLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
    return data ? JSON.parse(data) : INITIAL_OPERATIONS_LOG;
  } catch (e) {
    return INITIAL_OPERATIONS_LOG;
  }
};

export const saveStoredOperations = (logs: DailyOperationLog[]) => {
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(logs));
};
export const saveOperations = saveStoredOperations;

export const getStoredVisitors = (): VisitorLogEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VISITORS);
    return data ? JSON.parse(data) : INITIAL_VISITOR_LOGS;
  } catch (e) {
    return INITIAL_VISITOR_LOGS;
  }
};

export const saveStoredVisitors = (visitors: VisitorLogEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
};
export const saveVisitors = saveStoredVisitors;

export const getStoredEquipment = (): EquipmentItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return data ? JSON.parse(data) : INITIAL_EQUIPMENT;
  } catch (e) {
    return INITIAL_EQUIPMENT;
  }
};

export const saveStoredEquipment = (equipment: EquipmentItem[]) => {
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
};
export const saveEquipment = saveStoredEquipment;

export const getStoredOfficials = (): BarangayOfficial[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OFFICIALS);
    return data ? JSON.parse(data) : INITIAL_OFFICIALS;
  } catch (e) {
    return INITIAL_OFFICIALS;
  }
};

export const saveStoredOfficials = (officials: BarangayOfficial[]) => {
  localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(officials));
};
export const saveOfficials = saveStoredOfficials;

export const getStoredBdrrm = (): BDRRMInfo => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BDRRM);
    return data ? JSON.parse(data) : INITIAL_BDRRM;
  } catch (e) {
    return INITIAL_BDRRM;
  }
};
export const getStoredBDRRM = getStoredBdrrm;

export const saveStoredBdrrm = (bdrrm: BDRRMInfo) => {
  localStorage.setItem(STORAGE_KEYS.BDRRM, JSON.stringify(bdrrm));
};
export const saveBDRRM = saveStoredBdrrm;

export const resetToDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.RESIDENTS, JSON.stringify(INITIAL_RESIDENTS));
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_INCIDENTS, JSON.stringify(INITIAL_EMERGENCY_INCIDENTS));
  localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(INITIAL_EVACUATION_CENTERS));
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(INITIAL_EMERGENCY_ALERTS));
  localStorage.setItem(STORAGE_KEYS.RESCUE_RESPONDERS, JSON.stringify(INITIAL_RESCUE_RESPONDERS));
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(INITIAL_OPERATIONS_LOG));
  localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(INITIAL_VISITOR_LOGS));
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
  localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(INITIAL_OFFICIALS));
  localStorage.setItem(STORAGE_KEYS.BDRRM, JSON.stringify(INITIAL_BDRRM));
};
