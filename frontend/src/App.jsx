import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/dashboard/DashboardPage';
import UserManagementPage from './pages/users/UserManagementPage';
import PatientsPage from './pages/patients/PatientsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Memuat Aplikasi Nexa Clinic...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'users':
        return <UserManagementPage />;
      case 'patients':
        return <PatientsPage />;
      case 'registrations':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Pasien</h2>
            <p className="text-slate-500 text-sm">Modul Pendaftaran Kunjungan akan dirender di sini...</p>
          </div>
        );
      case 'queues':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Kelola Antrean</h2>
            <p className="text-slate-500 text-sm">Modul Pemanggilan & Status Antrean akan dirender di sini...</p>
          </div>
        );
      case 'medical-records':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Pemeriksaan Dokter (SOAP)</h2>
            <p className="text-slate-500 text-sm">Modul Input Rekam Medis SOAP & Resep Obat akan dirender di sini...</p>
          </div>
        );
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
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
