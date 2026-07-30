import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  ListOrdered, 
  Stethoscope, 
  ShieldCheck,
  LogOut,
  X,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, logout, hasPermission } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'users',
      label: 'Kelola Pengguna',
      icon: ShieldCheck
    },
    {
      id: 'patients',
      label: 'Master Data Pasien',
      icon: Users
    },
    {
      id: 'registrations',
      label: 'Pendaftaran Pasien',
      icon: ClipboardList
    },
    {
      id: 'queues',
      label: 'Kelola Antrean',
      icon: ListOrdered
    },
    {
      id: 'medical-records',
      label: 'Pemeriksaan Dokter',
      icon: Stethoscope
    }
  ];

  const accessibleMenus = menuItems.filter(item => {
    if (item.id === 'users') return user?.role === 'Administrator';
    if (item.id === 'dashboard') return true;
    return hasPermission(item.id, 'view');
  });

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
      {/* Mobile Drawer Overlay Backdrop (z-40) */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Container (z-40 di mobile, z-20 di desktop) */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-40 md:z-20
        w-64 bg-white border-r border-slate-200 
        flex flex-col justify-between p-4 shadow-sm md:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Mobile Header inside Drawer */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 md:hidden">
            <span className="font-bold text-slate-800 text-sm">Navigasi Menu</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Menu Utama
            </p>
            {accessibleMenus.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-blue-800 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Profile & Logout Card inside Drawer */}
        <div className="pt-4 border-t border-slate-200 md:hidden">
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

      {/* Modal Konfirmasi Logout Mobile (z-[100]) */}
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
