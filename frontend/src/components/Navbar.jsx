import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronDown,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  if (!user) return null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dokter':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Side: Logo Branding & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-800 text-white rounded-xl flex items-center justify-center shadow-xs">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">Nexa Clinic</h1>
                <p className="text-xs text-slate-400 font-medium">Information System</p>
              </div>
            </div>
          </div>

          {/* Right Side: Profile Dropdown Box */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-blue-800 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4" />
              </div>
              
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Overlay (z-50) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800 leading-snug">{user.name}</p>
                  <p className="text-xs text-slate-400 font-mono mb-2">@{user.username}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${getRoleBadgeColor(user.role)}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Modal Konfirmasi Logout (z-[100] untuk berada di atas seluruh elemen termasuk Sidebar) */}
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
