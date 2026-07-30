import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Lock, 
  User, 
  AlertCircle
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      
      {/* Container Form */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-center mb-4 border border-blue-100">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Nexa Clinic</h1>
          <p className="text-slate-500 text-sm mt-1">Mini Clinic Information System</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-white border border-slate-300 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-800 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-800 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Masuk</span>
            )}
          </button>
           <footer className="mt-8 text-slate-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Nexa Clinic System
      </footer>
        </form>
      </div>

     
    </div>
  );
}