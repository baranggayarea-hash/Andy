export type Purok = 
  | 'Purok 1 - San Jose Proper'
  | 'Purok 2 - Riverside'
  | 'Purok 3 - Mabuhay'
  | 'Purok 4 - Pag-asa'
  | 'Purok 5 - Ilaya'
  | 'Purok 6 - Annex Proper'
  | 'Sitio Area 6 Extension';

export type SectorTag = 
  | 'Senior Citizen'
  | 'PWD (Person with Disability)'
  | 'Solo Parent'
  | '4Ps Beneficiary'
  | 'Youth (15-30)'
  | 'Indigent'
  | 'Pregnant / Lactating'
  | 'OFW Family';

export type CivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Live-in';

export interface Resident {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName?: string; // Jr., Sr., III
  alias?: string;
  gender: 'Male' | 'Female' | 'Other';
  birthDate: string;
  age: number;
  civilStatus: CivilStatus;
  contactNumber: string;
  email?: string;
  houseNumber: string;
  streetName: string;
  purok: Purok;
  householdId: string;
  isHouseholdHead: boolean;
  occupation: string;
  monthlyIncomeRange?: '< ₱10,000' | '₱10,000 - ₱20,000' | '₱20,001 - ₱40,000' | '₱40,000+';
  educationalAttainment: 'Elementary' | 'High School' | 'Vocational' | 'College Undergraduate' | 'College Graduate' | 'Post Graduate';
  voterStatus: 'Registered' | 'Unregistered';
  precinctNumber?: string;
  sectorTags: SectorTag[];
  bloodType?: string;
  emergencyContact: {
    name: string;
    relation: string;
    contact: string;
  };
  dateRegistered: string;
  photoUrl?: string;
  remarks?: string;
  isArchived?: boolean;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ResidentComplaintStatus = 
  | 'Received / Under Review'
  | 'Assigned / Tanod Dispatched'
  | 'Action Taken / In Progress'
  | 'Resolved & Closed'
  | 'Dismissed / Invalid';

export type ResidentComplaintCategory = 
  | 'Noise & Curfew Disturbance'
  | 'Sanitation & Garbage Disposal'
  | 'Animal Nuisance & Stray Pets'
  | 'Illegal Parking & Road Obstruction'
  | 'Drainage & Clogged Canal'
  | 'Streetlight & Facility Maintenance'
  | 'Neighborhood Conflict / Boundary'
  | 'Public Safety & Disturbance'
  | 'Verbal Harassment & Dispute'
  | 'Other Resident Grievance';

export interface ComplaintActionLog {
  id: string;
  actionDate: string;
  actionTime: string;
  actionBy: string; // e.g. "Officer Gabriel Morales (Chief Tanod)"
  actionType: 'Inspection / Site Visit' | 'Notice / Advisory Issued' | 'Clean-up / Physical Action' | 'Verbal Warning' | 'Resident Follow-up' | 'Resolved On-Site';
  description: string;
}

export interface ResidentComplaint {
  id: string;
  complaintNumber: string; // e.g. CMP-2026-0038
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  purok: Purok;
  incidentCategory: ResidentComplaintCategory;
  priority: ComplaintPriority;
  
  // Complainant Resident
  complainantIds?: string[];
  complainantNames: string[];
  complainantContacts: string[];
  complainantAddresses: string[];
  isAnonymous?: boolean;

  // Respondent / Subject of Complaint
  respondentIds?: string[];
  respondentNames: string[];
  respondentAddresses?: string[];

  // Complaint Details
  narrative: string;
  requestedAction?: string;

  // Barangay Action & Desk Handling
  status: ResidentComplaintStatus;
  assignedOfficer: string;
  actionLogs: ComplaintActionLog[];
  resolutionSummary?: string;
  recordedBy: string;
  createdAt: string;
  resolvedAt?: string;
  remarks?: string;

  // Backwards compatibility field
  blotterNumber?: string;
}

// Aliases for compatibility
export type BlotterComplaint = ResidentComplaint;
export type BlotterStatus = ResidentComplaintStatus;
export type IncidentCategory = ResidentComplaintCategory;

export type EmergencyIncidentType = 
  | 'Flood / River Overflow'
  | 'Structure Fire'
  | 'Medical Emergency / Trauma'
  | 'Landslide / Soil Erosion'
  | 'Road Accident / Collision'
  | 'Severe Typhoon & Wind Hazard'
  | 'Search and Rescue'
  | 'Structural Collapse / Hazard'
  | 'Chemical / LPG Gas Leak'
  | 'Electrical Fire / Sparking Post';

export type IncidentSeverity = 
  | 'Code Red (Critical - Immediate Dispatch)'
  | 'Code Orange (High Priority)'
  | 'Code Yellow (Moderate / Monitored)'
  | 'Code Green (Low / Advisory)';

export type IncidentResponseStatus = 
  | 'Reported / Triaged'
  | 'Team Dispatched'
  | 'On-Scene Operation'
  | 'Rescued / Controlled'
  | 'Resolved / Stand-down';

export interface EmergencyIncident {
  id: string;
  incidentCode: string; // e.g. RES-2026-0042
  incidentType: EmergencyIncidentType;
  severity: IncidentSeverity;
  purok: Purok;
  exactLocation: string;
  callerName: string;
  callerContact: string;
  reportedAt: string;
  description: string;
  personsAtRisk: number;
  vulnerablePersonsNoted: string[]; // e.g. ["Senior (82yo)", "Infant (6mo)", "Bedridden PWD"]
  assignedUnit: string; // e.g. "Area 6 QRT-Alpha", "Medic Rescue 1", "Water Rescue Team"
  status: IncidentResponseStatus;
  dispatchedAt?: string;
  onSceneAt?: string;
  resolvedAt?: string;
  casualties: number;
  injuries: number;
  rescuedCount: number;
  equipmentUsed: string[];
  evacuationCenterAssigned?: string;
  notes?: string;
  loggedBy: string;
}

export interface EvacuationCenter {
  id: string;
  name: string;
  location: string;
  purok: Purok;
  capacityPersons: number;
  currentOccupants: number;
  currentFamilies: number;
  status: 'Open & Receiving' | 'At Capacity (Full)' | 'Standby / Prepared' | 'Deactivated';
  hasMedicalPost: boolean;
  hasGeneratorPower: boolean;
  hasPotableWater: boolean;
  reliefFoodPacksAvailable: number;
  focalPerson: string;
  contactNumber: string;
  notes?: string;
}

export interface EmergencyAlert {
  id: string;
  alertTitle: string;
  alertLevel: 'Critical / Red Alert' | 'Severe / Orange Advisory' | 'Yellow Warning' | 'Public Advisory';
  affectedPuroks: string[]; // ['Purok 2 - Riverside', 'Purok 5 - Ilaya'] or ['All Area 6 Puroks']
  message: string;
  directive: 'Immediate Evacuation' | 'Pre-emptive Evacuation' | 'Stay Indoors & Monitor' | 'Standard Precaution';
  issuedAt: string;
  expiresAt: string;
  issuedBy: string;
  isActive: boolean;
}

export interface RescueResponder {
  id: string;
  name: string;
  callsign: string;
  role: 'Team Leader' | 'Paramedic / First Aider' | 'Water Rescue Diver' | 'Fire Auxiliary' | 'Tanod Emergency Driver' | 'Comms & Logistics';
  contact: string;
  status: 'On Duty' | 'Dispatched' | 'On Standby' | 'Resting';
  assignedPurok?: Purok;
}

export type TanodShift = 
  | 'Morning Shift (06:00 - 14:00)'
  | 'Afternoon Shift (14:00 - 22:00)'
  | 'Night Shift (22:00 - 06:00)'
  | 'Morning Shift (6:00 AM - 2:00 PM)'
  | 'Afternoon Shift (2:00 PM - 10:00 PM)'
  | 'Graveyard Patrol (10:00 PM - 6:00 AM)';

export interface DailyOperationLog {
  id: string;
  logDate: string;
  shift: TanodShift;
  officerInCharge: string;
  dutyTanods: string[];
  activityType: 
    | 'Routine Patrol'
    | 'Curfew Enforcement'
    | 'Traffic Assistance'
    | 'Emergency Response'
    | 'Special Event Security'
    | 'Inspection'
    | 'Area 6 Perimeter & Street Patrol'
    | 'Minor Curfew & Oplan Roving'
    | 'Traffic Flow & Alley Clearing'
    | 'Disaster & Weather Monitoring (BDRRMC)'
    | 'Public Assistance / Emergency Response'
    | 'Barangay Hall Security & Frontline Duty';
  locationCovered?: string;
  puroksCovered?: string[];
  summary: string;
  incidentsNoted?: number;
  incidentsLoggedCount?: number;
  status?: 'Completed' | 'Ongoing';
  createdAt?: string;
}

export interface PeaceAndOrderOutpost {
  id: string;
  name: string;
  location: string;
  purok: Purok;
  assignedOfficer: string;
  tanodsOnDuty: string[];
  contactNumber: string;
  radioChannel: string;
  status: 'Manned & Active' | 'Roving Patrol' | 'Standby' | 'Shift Relieved';
  equipmentOnPost: string[];
  lastRoundTime: string;
}

export interface VisitorLogEntry {
  id: string;
  visitorName?: string;
  fullName?: string;
  address: string;
  contactNumber: string;
  purpose: string;
  timeIn: string;
  timeOut?: string;
  date?: string;
  visitDate?: string;
  attendedBy?: string;
  officeOrPersonToVisit?: string;
  remarks?: string;
  status?: 'Inside Hall' | 'Departed';
}

export interface EquipmentItem {
  id: string;
  propertyNumber?: string;
  assetCode?: string;
  itemName: string;
  category: string;
  totalQuantity?: number;
  availableQuantity?: number;
  condition: string;
  storageLocation?: string;
  lastInspected?: string;
  status?: 'Available' | 'Borrowed' | 'Under Maintenance';
  currentBorrower?: {
    name: string;
    contact: string;
    address: string;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
  };
}

export type EquipmentAsset = EquipmentItem;

export interface BarangayOfficial {
  id: string;
  name: string;
  position: string;
  committee?: string;
  contactNumber: string;
  email?: string;
  photoUrl?: string;
  term: string;
  isSignatory?: boolean;
  schedule?: string;
}

export interface BDRRMInfo {
  alertLevel: 'Normal (Green)' | 'Advisory (Yellow)' | 'Alert (Orange)' | 'Emergency (Red)';
  advisoryTitle: string;
  advisoryDetails: string;
  weatherCondition: string;
  updatedAt: string;
  hotlines: { label: string; number: string }[];
  evacuationCenters: { name: string; location?: string; capacity: number | string; currentCount?: number; status: 'Ready' | 'Occupied' | 'Full' }[];
}
