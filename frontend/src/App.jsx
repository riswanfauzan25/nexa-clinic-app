import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { LogOut, UserCheck, Shield, Stethoscope, ClipboardList } from 'lucide-react';

function MainApp() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Memuat Aplikasi Nexa Clinic...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrator':
        return <Shield className="w-6 h-6 text-amber-400" />;
      case 'Dokter':
        return <Stethoscope className="w-6 h-6 text-cyan-400" />;
      default:
        return <ClipboardList className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          {getRoleIcon(user.role)}
        </div>
        
        <span className="inline-block px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
          {user.role}
        </span>

        <h1 className="text-2xl font-bold text-white mb-1">Selamat Datang, {user.name}!</h1>
        <p className="text-slate-400 text-sm mb-6">Username: @{user.username}</p>

        <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Status Autentikasi JWT:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Terverifikasi
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>ID Pengguna:</span>
            <span className="text-slate-200 font-mono">#{user.id}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
