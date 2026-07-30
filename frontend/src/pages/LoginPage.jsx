import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  ClipboardList 
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username || !password) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  // Quick fill untuk mempermudah testing evaluasi
  const handleQuickFill = (userType) => {
    setErrorMsg('');
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else if (userType === 'dokter') {
      setUsername('dokter');
      setPassword('password123');
    } else if (userType === 'pendaftaran') {
      setUsername('pendaftaran');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Activity className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nexa Clinic</h1>
          <p className="text-slate-400 text-sm mt-1">Mini Clinic Information System</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-teal-400 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-slate-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-teal-400 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-slate-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Masuk ke Aplikasi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Preset Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs text-center text-slate-400 font-medium mb-3">
            Akun Pengujian Demo (Klik untuk Autofill):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 rounded-xl text-slate-300 hover:text-teal-400 transition-all text-xs gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('dokter')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 rounded-xl text-slate-300 hover:text-teal-400 transition-all text-xs gap-1.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">Dokter</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('pendaftaran')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 rounded-xl text-slate-300 hover:text-teal-400 transition-all text-xs gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Pendaftaran</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-slate-500 text-xs text-center">
        © 2026 Nexa Clinic System • Powered by React.js & Node.js
      </footer>
    </div>
  );
}
