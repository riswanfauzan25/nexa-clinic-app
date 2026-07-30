import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Stethoscope,
  Pill,
  ClipboardList, 
  ListOrdered, 
  ShieldCheck,
  FolderKanban,
  Activity,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, logout, hasPermission } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // State Accordion untuk Submenu (Open/Close Dropdown Groups)
  const [openGroups, setOpenGroups] = useState({
    master: true,
    pelayanan: true,
    system: true
  });

  if (!user) return null;

  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Struktur Menu Terkelompok (Accordion Submenu Structure)
  const menuGroups = [
    {
      type: 'single',
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      type: 'group',
      key: 'system',
      label: 'Otorisasi System',
      icon: ShieldCheck,
      items: [
        {
          id: 'users',
          label: 'Kelola Pengguna & RBAC',
          icon: ShieldCheck,
          requiresAdmin: true
        }
      ]
    },
    {
      type: 'group',
      key: 'master',
      label: 'Master Data',
      icon: FolderKanban,
      items: [
        {
          id: 'patients',
          label: 'Data Pasien',
          icon: Users,
          module: 'patients'
        },
        {
          id: 'polyclinics',
          label: 'Data Poliklinik',
          icon: Building2,
          module: 'polyclinics'
        },
        {
          id: 'procedures',
          label: 'Tindakan Medis',
          icon: Stethoscope,
          module: 'procedures'
        },
        {
          id: 'medicines',
          label: 'Data Obat-obatan',
          icon: Pill,
          module: 'medicines'
        }
      ]
    },
    {
      type: 'group',
      key: 'pelayanan',
      label: 'Pelayanan Klinik',
      icon: Activity,
      items: [
        {
          id: 'registrations',
          label: 'Pendaftaran Pasien',
          icon: ClipboardList,
          module: 'registrations'
        },
        {
          id: 'queues',
          label: 'Kelola Antrean',
          icon: ListOrdered,
          module: 'queues'
        },
        {
          id: 'medical-records',
          label: 'Pemeriksaan Dokter (SOAP)',
          icon: Stethoscope,
          module: 'medical-records'
        }
      ]
    }
  ];

  // Auto expand group jika tab di dalam group tersebut aktif
  useEffect(() => {
    if (['patients', 'polyclinics', 'procedures', 'medicines'].includes(activeTab)) {
      setOpenGroups(prev => ({ ...prev, master: true }));
    } else if (['registrations', 'queues', 'medical-records'].includes(activeTab)) {
      setOpenGroups(prev => ({ ...prev, pelayanan: true }));
    } else if (activeTab === 'users') {
      setOpenGroups(prev => ({ ...prev, system: true }));
    }
  }, [activeTab]);

  const checkItemAccess = (item) => {
    if (item.requiresAdmin) return user?.role === 'Administrator';
    if (item.module) return hasPermission(item.module, 'view');
    return true;
  };

  const handleSelectMenu = (id) => {
    setActiveTab(id);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    logout();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-40 md:z-20
        w-64 bg-white border-r border-slate-200 
        flex flex-col justify-between p-4 shadow-sm md:shadow-none
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Mobile Header inside Drawer */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 md:hidden">
            <span className="font-bold text-slate-800 text-sm">Navigasi Menu</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items with Accordion Submenus */}
          <nav className="space-y-3">
            <p className="px-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
              Menu Utama System
            </p>

            {menuGroups.map((group) => {
              if (group.type === 'single') {
                const Icon = group.icon;
                const isActive = activeTab === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectMenu(group.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-blue-800 text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{group.label}</span>
                  </button>
                );
              }

              if (group.type === 'group') {
                const accessibleSubItems = group.items.filter(checkItemAccess);
                if (accessibleSubItems.length === 0) return null;

                const GroupIcon = group.icon;
                const isOpen = openGroups[group.key];
                const isGroupActive = accessibleSubItems.some(item => item.id === activeTab);

                return (
                  <div key={group.key} className="space-y-1">
                    {/* Parent Dropdown Button */}
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isGroupActive
                          ? 'text-blue-800 bg-blue-50/70'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GroupIcon className={`w-4 h-4 ${isGroupActive ? 'text-blue-800' : 'text-slate-400'}`} />
                        <span className="uppercase tracking-wider text-[11px]">{group.label}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Submenu Accordion Drawer */}
                    {isOpen && (
                      <div className="pl-4 pr-1 space-y-1 border-l-2 border-slate-100 ml-3 py-1 animate-fade-in">
                        {accessibleSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeTab === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleSelectMenu(subItem.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                isSubActive 
                                  ? 'bg-blue-800 text-white font-semibold shadow-xs' 
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                              <span>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </nav>
        </div>

        {/* Mobile Profile & Logout Card inside Drawer */}
        <div className="pt-4 border-t border-slate-200 md:hidden mt-6">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3">
            <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
            <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 mt-1 bg-blue-100 text-blue-800 rounded border border-blue-200">
              {user.role}
            </span>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Modal Konfirmasi Logout Mobile */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">Konfirmasi Logout</h3>
            <p className="text-slate-500 text-sm mb-6">
              Apakah Anda yakin ingin keluar dari sistem Nexa Clinic?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
