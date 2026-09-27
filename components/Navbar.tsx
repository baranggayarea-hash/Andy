import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Users, 
  MessageSquareWarning, 
  LifeBuoy, 
  Activity, 
  Building2, 
  Plus, 
  Search, 
  RotateCcw,
  Sparkles,
  User,
  ShieldCheck,
  Database,
  LogIn,
  LogOut,
  PhoneCall,
  ClipboardList
} from 'lucide-react';
import { BDRRMInfo } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewResident?: () => void;
  onOpenNewBlotter?: () => void;
  onOpenNewEmergency?: () => void;
  onOpenNewOperationLog?: () => void;
  bdrrm?: BDRRMInfo;
  pendingBlotterCount?: number;
  activeEmergencyCount?: number;
  onResetData?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewResident,
  onOpenNewBlotter,
  onOpenNewEmergency,
  onOpenNewOperationLog,
  bdrrm,
  pendingBlotterCount = 0,
  activeEmergencyCount = 0,
  onResetData,
  searchQuery = '',
  setSearchQuery
}) => {
  const [pstTime, setPstTime] = useState<string>('');
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, isFirebaseConnected, loginWithGoogle, loginAsGuest, logout } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const dateStr = now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      setPstTime(`${dateStr} • ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'complaints', label: 'Resident Complaints', icon: MessageSquareWarning, badge: pendingBlotterCount > 0 ? pendingBlotterCount : null },
    { id: 'emergency', label: 'Emergency & Rescue', icon: LifeBuoy, badge: activeEmergencyCount > 0 ? `${activeEmergencyCount} SOS` : null },
    { id: 'operations', label: 'Daily Operations', icon: ClipboardList },
    { id: 'officials', label: 'Council Directory', icon: Building2 },
  ];

  return (
    <header className="shrink-0 sticky top-0 z-40 shadow-sm no-print">
      {/* Primary Command Header */}
      <div className="h-16 bg-[#0F172A] text-white flex items-center justify-between px-4 sm:px-6 shadow-sm">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-base sm:text-lg text-white shadow-sm shrink-0">
            SJ
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold leading-none uppercase tracking-tight text-white flex items-center gap-2">
              San Jose Annex Area 6
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
              Management Information System
            </p>
          </div>
        </div>

        {/* Center/Right: Search, Date/Status, and Admin Badge */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Global Quick Search */}
          {setSearchQuery && (
            <div className="relative hidden md:block w-48 lg:w-60">
              <input
                type="text"
                placeholder="Search name, ID or OR#..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-800 text-slate-100 placeholder-slate-400 border border-slate-700 rounded-lg py-2 pl-9 pr-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Quick Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Action</span>
            </button>

            {quickMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
                onClick={() => setQuickMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Quick Actions
                </div>
                {onOpenNewResident && (
                  <button
                    onClick={onOpenNewResident}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors font-medium"
                  >
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Register New Resident</span>
                  </button>
                )}
                {onOpenNewBlotter && (
                  <button
                    onClick={onOpenNewBlotter}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors font-medium"
                  >
                    <MessageSquareWarning className="w-4 h-4 text-amber-500" />
                    <span>File Resident Complaint</span>
                  </button>
                )}
                {onOpenNewEmergency && (
                  <button
                    onClick={onOpenNewEmergency}
                    className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-bold"
                  >
                    <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Log Emergency SOS Incident</span>
                  </button>
                )}
                {onOpenNewOperationLog && (
                  <button
                    onClick={onOpenNewOperationLog}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 transition-colors font-medium"
                  >
                    <ClipboardList className="w-4 h-4 text-purple-500" />
                    <span>Log Daily Operations Shift</span>
                  </button>
                )}
                {onResetData && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={onResetData}
                      className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 flex items-center space-x-2 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Reset Demo Data</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Time & Cloud Status */}
          <div className="text-right hidden lg:block">
            <p className="text-xs font-semibold text-slate-200">{pstTime || 'Loading...'}</p>
            <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              <span>{isFirebaseConnected ? 'Firebase Cloud Synced' : 'Connecting to Cloud...'}</span>
            </p>
          </div>

          {/* User Profile / Auth Control */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg py-1.5 px-2.5 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentUser?.displayName || (currentUser ? 'Barangay Staff' : 'Local Admin')}
                </p>
                <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider leading-none mt-0.5">
                  {currentUser?.email || 'Authorized MIS User'}
                </p>
              </div>
              <div className="w-7 h-7 bg-slate-700 rounded-md flex items-center justify-center border border-slate-600 text-slate-200 overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">
                    {currentUser?.displayName || 'Barangay San Jose Annex Admin'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email || 'System Session (Active)'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded px-2 py-0.5 w-fit">
                    <Database className="w-3 h-3" />
                    <span>Firestore Database Active</span>
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  {!currentUser ? (
                    <>
                      <button
                        onClick={() => loginWithGoogle()}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 rounded-lg transition-colors font-medium"
                      >
                        <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Sign In with Google</span>
                      </button>
                      <button
                        onClick={() => loginAsGuest()}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2 rounded-lg transition-colors font-medium"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sign In as Guest Officer</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 rounded-lg transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out from MIS</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <nav className="bg-white h-12 border-b border-slate-200 flex items-center px-4 sm:px-6 gap-6 sm:gap-8 overflow-x-auto scrollbar-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`h-full flex items-center gap-2 px-1 uppercase tracking-wider text-xs font-bold transition-colors whitespace-nowrap relative ${
                isActive
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
