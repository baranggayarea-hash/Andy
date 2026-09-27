import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  LifeBuoy, 
  CreditCard, 
  Home, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  CheckCircle, 
  X,
  UserCheck,
  Tag
} from 'lucide-react';
import { Resident, Purok, SectorTag } from '../types';
import { formatDate, calculateAge } from '../utils/formatters';

interface ResidentsViewProps {
  residents: Resident[];
  onAddResident: (resident: Resident) => void;
  onUpdateResident: (resident: Resident) => void;
  onDeleteResident: (id: string) => void;
  onSelectResidentForEmergency?: (resident: Resident) => void;
  onSelectResidentForId: (resident: Resident) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const PUROK_LIST: Purok[] = [
  'Purok 1 - San Jose Proper',
  'Purok 2 - Riverside',
  'Purok 3 - Mabuhay',
  'Purok 4 - Pag-asa',
  'Purok 5 - Ilaya',
  'Purok 6 - Annex Proper',
  'Sitio Area 6 Extension'
];

const SECTOR_TAGS: SectorTag[] = [
  'Senior Citizen',
  'PWD (Person with Disability)',
  'Solo Parent',
  '4Ps Beneficiary',
  'Youth (15-30)',
  'Indigent',
  'Pregnant / Lactating',
  'OFW Family'
];

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  residents,
  onAddResident,
  onUpdateResident,
  onDeleteResident,
  onSelectResidentForEmergency,
  onSelectResidentForId,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedPurok, setSelectedPurok] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedVoter, setSelectedVoter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'households'>('table');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [selectedResidentDetails, setSelectedResidentDetails] = useState<Resident | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Resident>>({
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    alias: '',
    gender: 'Male',
    birthDate: '1995-01-01',
    civilStatus: 'Single',
    contactNumber: '',
    email: '',
    houseNumber: '',
    streetName: '',
    purok: 'Purok 6 - Annex Proper',
    householdId: 'HH-0100',
    isHouseholdHead: false,
    occupation: '',
    educationalAttainment: 'High School',
    voterStatus: 'Registered',
    precinctNumber: '',
    sectorTags: [],
    bloodType: 'O+',
    emergencyContact: {
      name: '',
      relation: '',
      contact: ''
    },
    remarks: ''
  });

  const handleOpenAdd = () => {
    setEditingResident(null);
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      extensionName: '',
      alias: '',
      gender: 'Male',
      birthDate: '1995-01-01',
      civilStatus: 'Single',
      contactNumber: '09',
      email: '',
      houseNumber: '',
      streetName: 'Area 6 Main Street',
      purok: 'Purok 6 - Annex Proper',
      householdId: `HH-${Math.floor(1000 + Math.random() * 9000)}`,
      isHouseholdHead: false,
      occupation: '',
      educationalAttainment: 'High School',
      voterStatus: 'Registered',
      precinctNumber: '0042A',
      sectorTags: [],
      bloodType: 'O+',
      emergencyContact: {
        name: '',
        relation: '',
        contact: ''
      },
      remarks: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({ ...resident });
    setModalOpen(true);
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      alert('First Name and Last Name are required.');
      return;
    }

    const calculatedAge = calculateAge(formData.birthDate || '1995-01-01');

    if (editingResident) {
      const updated: Resident = {
        ...editingResident,
        ...(formData as Resident),
        age: calculatedAge,
      };
      onUpdateResident(updated);
    } else {
      const newResident: Resident = {
        ...(formData as Resident),
        id: `res-${Date.now()}`,
        age: calculatedAge,
        dateRegistered: new Date().toISOString().split('T')[0],
      };
      onAddResident(newResident);
    }
    setModalOpen(false);
  };

  const handleSectorToggle = (tag: SectorTag) => {
    const currentTags = formData.sectorTags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, sectorTags: currentTags.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, sectorTags: [...currentTags, tag] });
    }
  };

  // Filter Logic
  const filteredResidents = residents.filter(r => {
    const fullName = `${r.firstName} ${r.middleName} ${r.lastName} ${r.extensionName || ''} ${r.alias || ''}`.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      fullName.includes(searchQuery.toLowerCase()) ||
      r.householdId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactNumber.includes(searchQuery) ||
      r.streetName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPurok = selectedPurok === 'ALL' || r.purok === selectedPurok;
    const matchesSector = selectedSector === 'ALL' || r.sectorTags.includes(selectedSector as SectorTag);
    const matchesVoter = selectedVoter === 'ALL' || r.voterStatus === selectedVoter;

    return matchesSearch && matchesPurok && matchesSector && matchesVoter;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'First Name', 'Middle Name', 'Last Name', 'Age', 'Gender', 'Purok', 'Street', 'Household ID', 'Head?', 'Voter Status', 'Sectors', 'Contact'];
    const rows = filteredResidents.map(r => [
      r.id,
      r.firstName,
      r.middleName,
      r.lastName,
      r.age,
      r.gender,
      `"${r.purok}"`,
      `"${r.streetName}"`,
      r.householdId,
      r.isHouseholdHead ? 'YES' : 'NO',
      r.voterStatus,
      `"${r.sectorTags.join(', ')}"`,
      r.contactNumber
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Barangay_San_Jose_Annex_Area6_Census_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group by Household for Household View
  const householdsMap: Record<string, Resident[]> = {};
  residents.forEach(r => {
    if (!householdsMap[r.householdId]) {
      householdsMap[r.householdId] = [];
    }
    householdsMap[r.householdId].push(r);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Resident Census & Demographic Profiling</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered resident roster, households, and sectoral classifications for Barangay San Jose Annex Area 6
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register Resident</span>
          </button>
        </div>
      </div>

      {/* Filters & View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, household, street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Purok Filter */}
          <div>
            <select
              value={selectedPurok}
              onChange={(e) => setSelectedPurok(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="ALL">All Puroks & Sitios (Area 6)</option>
              {PUROK_LIST.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="ALL">All Sectors (Senior, PWD, 4Ps, etc.)</option>
              {SECTOR_TAGS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Voter Filter & View Mode */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedVoter}
              onChange={(e) => setSelectedVoter(e.target.value)}
              className="flex-1 bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="ALL">All Voters</option>
              <option value="Registered">Registered Voters Only</option>
              <option value="Unregistered">Unregistered</option>
            </select>

            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('households')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${viewMode === 'households' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Families
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-800">{filteredResidents.length}</strong> of {residents.length} residents</span>
          {(selectedPurok !== 'ALL' || selectedSector !== 'ALL' || selectedVoter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedPurok('ALL');
                setSelectedSector('ALL');
                setSelectedVoter('ALL');
                setSearchQuery('');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* View Mode 1: Table List */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4">Address (Area 6)</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Household</th>
                  <th className="py-3.5 px-4">Sectors & Tags</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResidents.length > 0 ? (
                  filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-emerald-200">
                            {r.firstName.charAt(0)}{r.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs hover:text-emerald-600 cursor-pointer" onClick={() => setSelectedResidentDetails(r)}>
                              {r.lastName}, {r.firstName} {r.middleName} {r.extensionName || ''}
                            </div>
                            {r.alias && (
                              <div className="text-[11px] text-slate-400 font-medium">"{r.alias}"</div>
                            )}
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{r.contactNumber || 'No contact'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{r.purok}</div>
                        <div className="text-[11px] text-slate-500">{r.houseNumber} {r.streetName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{r.age} yrs • {r.gender}</div>
                        <div className="text-[11px] text-slate-500">{r.civilStatus} • {r.occupation || 'N/A'}</div>
                        <div className="text-[10px] mt-0.5 font-semibold text-emerald-700">
                          {r.voterStatus === 'Registered' ? `Voter (Precinct ${r.precinctNumber || 'A6'})` : 'Non-Voter'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-800">{r.householdId}</div>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                          r.isHouseholdHead ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.isHouseholdHead ? 'Household Head' : 'Member'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {r.sectorTags && r.sectorTags.length > 0 ? (
                            r.sectorTags.map(tag => (
                              <span 
                                key={tag} 
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                  tag.includes('Senior') 
                                    ? 'bg-amber-100 text-amber-800'
                                    : tag.includes('PWD')
                                    ? 'bg-blue-100 text-blue-800'
                                    : tag.includes('Solo')
                                    ? 'bg-purple-100 text-purple-800'
                                    : tag.includes('4Ps')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">Regular Resident</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {onSelectResidentForEmergency && (
                            <button
                              onClick={() => onSelectResidentForEmergency(r)}
                              title="Dispatch Emergency / Rescue for Resident"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <LifeBuoy className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectResidentForId(r)}
                            title="Generate Barangay Resident ID Card"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedResidentDetails(r)}
                            title="View Full Profile"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Resident"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${r.firstName} ${r.lastName} from census?`)) {
                                onDeleteResident(r.id);
                              }
                            }}
                            title="Delete Resident"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No residents found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 2: Household Grouping */}
      {viewMode === 'households' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(householdsMap).map(([hhId, members]) => {
            const head = members.find(m => m.isHouseholdHead) || members[0];
            return (
              <div key={hhId} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {hhId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      Family of {head ? `${head.lastName}, ${head.firstName}` : 'Registered Household'}
                    </h3>
                    <p className="text-xs text-slate-500">{head?.houseNumber} {head?.streetName}, {head?.purok}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {members.length} Members
                  </span>
                </div>

                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${m.isHouseholdHead ? 'bg-purple-600' : 'bg-emerald-400'}`}></span>
                        <div>
                          <span className="font-semibold text-slate-900">{m.firstName} {m.lastName}</span>
                          <span className="text-slate-400 text-[11px] ml-1.5">({m.age}y, {m.civilStatus})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {m.isHouseholdHead && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            Head
                          </span>
                        )}
                        <button 
                          onClick={() => setSelectedResidentDetails(m)}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px]"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resident Detail Modal */}
      {selectedResidentDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                  {selectedResidentDetails.firstName.charAt(0)}{selectedResidentDetails.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedResidentDetails.firstName} {selectedResidentDetails.middleName} {selectedResidentDetails.lastName} {selectedResidentDetails.extensionName || ''}
                  </h3>
                  <p className="text-xs text-slate-500">Resident ID: {selectedResidentDetails.id} • Household: {selectedResidentDetails.householdId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedResidentDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Age & Gender</span>
                  <span className="font-semibold text-slate-800">{selectedResidentDetails.age} years old ({selectedResidentDetails.gender})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedResidentDetails.birthDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Civil Status</span>
                  <span className="font-semibold text-slate-800">{selectedResidentDetails.civilStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Number</span>
                  <span className="font-semibold text-slate-800">{selectedResidentDetails.contactNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Occupation</span>
                  <span className="font-semibold text-slate-800">{selectedResidentDetails.occupation || 'None / Student'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Voter Status</span>
                  <span className="font-semibold text-emerald-700">{selectedResidentDetails.voterStatus} ({selectedResidentDetails.precinctNumber || 'Area 6'})</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Residential Address (Area 6)</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedResidentDetails.houseNumber} {selectedResidentDetails.streetName}, {selectedResidentDetails.purok}, Barangay San Jose Annex Area 6
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Sectoral Registries</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedResidentDetails.sectorTags && selectedResidentDetails.sectorTags.length > 0 ? (
                    selectedResidentDetails.sectorTags.map(tag => (
                      <span key={tag} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No specific social welfare tags</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Emergency Contact Person</h4>
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex justify-between">
                  <div>
                    <span className="font-semibold text-rose-950">{selectedResidentDetails.emergencyContact.name || 'Not provided'}</span>
                    <span className="text-rose-700 ml-2">({selectedResidentDetails.emergencyContact.relation || 'Relation'})</span>
                  </div>
                  <span className="font-mono font-bold text-rose-900">{selectedResidentDetails.emergencyContact.contact || 'No phone'}</span>
                </div>
              </div>

              {selectedResidentDetails.remarks && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Official Notes & Remarks</h4>
                  <p className="text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    {selectedResidentDetails.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end space-x-2 bg-slate-50 rounded-b-2xl">
              {onSelectResidentForEmergency && (
                <button
                  onClick={() => {
                    const r = selectedResidentDetails;
                    setSelectedResidentDetails(null);
                    onSelectResidentForEmergency(r);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Emergency Rescue / Dispatch</span>
                </button>
              )}

              <button
                onClick={() => {
                  const r = selectedResidentDetails;
                  setSelectedResidentDetails(null);
                  onSelectResidentForId(r);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Print ID Card</span>
              </button>

              <button
                onClick={() => setSelectedResidentDetails(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Resident Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingResident ? 'Update Resident Profile' : 'Register New Resident to Area 6 Census'}
                </h3>
                <p className="text-xs text-slate-500">Official Barangay San Jose Annex demographic enrollment</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1">
                1. Personal Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Juan"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Dela Cruz"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Bautista"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Suffix (Ext.)</label>
                  <input
                    type="text"
                    value={formData.extensionName}
                    onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="Jr., Sr., III"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Alias / Palayaw</label>
                  <input
                    type="text"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Nonoy"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Civil Status</label>
                  <select
                    value={formData.civilStatus}
                    onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Live-in">Live-in</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="0917-000-0000"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Tricycle Driver / Teacher"
                  />
                </div>
              </div>

              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pt-3 pb-1">
                2. Area 6 Residence & Household
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Purok / Sitio *</label>
                  <select
                    value={formData.purok}
                    onChange={(e) => setFormData({ ...formData, purok: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  >
                    {PUROK_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">House / Lot No.</label>
                  <input
                    type="text"
                    value={formData.houseNumber}
                    onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Block 4 Lot 12"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Street / Alley Name</label>
                  <input
                    type="text"
                    value={formData.streetName}
                    onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Sampaguita St."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Household ID</label>
                  <input
                    type="text"
                    value={formData.householdId}
                    onChange={(e) => setFormData({ ...formData, householdId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="HH-0012"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHouseholdHead}
                      onChange={(e) => setFormData({ ...formData, isHouseholdHead: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800">Is Household Head?</span>
                  </label>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Voter Status</label>
                  <select
                    value={formData.voterStatus}
                    onChange={(e) => setFormData({ ...formData, voterStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                  >
                    <option value="Registered">Registered Voter</option>
                    <option value="Unregistered">Unregistered</option>
                  </select>
                </div>
              </div>

              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pt-3 pb-1">
                3. Special Sectors & Welfare Tags
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SECTOR_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleSectorToggle(tag)}
                    className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                      (formData.sectorTags || []).includes(tag)
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tag}</span>
                    {(formData.sectorTags || []).includes(tag) && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pt-3 pb-1">
                4. Emergency Contact Person
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact!, name: e.target.value } 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Maria Bautista"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Relation</label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.relation || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact!, relation: e.target.value } 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="e.g. Spouse / Mother"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.contact || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact!, contact: e.target.value } 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-emerald-500"
                    placeholder="0918-000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Remarks / Medical or Assistance Notes</label>
                <textarea
                  rows={2}
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                  placeholder="e.g. Maintenance medication at health center, TODA driver, volunteer tanod..."
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-sm transition-all"
                >
                  {editingResident ? 'Save Changes' : 'Enroll Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
