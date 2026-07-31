import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Users, 
  UserCheck, 
  ListOrdered, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  ArrowUpRight,
  Activity,
  Calendar,
  Stethoscope,
  ChevronRight,
  Building2,
  User,
  PlusCircle,
  ClipboardList,
  Check,
  X,
  Shield,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalPatients: 0,
    todayPatients: 0,
    todayQueues: 0,
    waitingPatients: 0,
    completedPatients: 0,
    doctors: [],
    polyclinics: [],
    roleUsers: []
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/summary');
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="text-blue-700 font-semibold uppercase tracking-wider">{user?.role}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Selamat Datang, {user?.name}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {user?.role === 'Administrator' && 'Panel Pengawasan Operasional & Matriks Hak Akses Sistem Klinik Pratama.'}
            {user?.role === 'Dokter' && 'Panel Pelayanan Medis, Diagnosa SOAP, & Pengelolaan Pemeriksaan Pasien.'}
            {user?.role === 'Petugas Pendaftaran' && 'Panel Front Office Loket Pendaftaran & Pemanggilan Antrean Pasien.'}
          </p>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-300 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ROLE VIEW 1: DOKTER */}
      {user?.role === 'Dokter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-800">Pasien Menunggu Diperiksa</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-1">
                  {loading ? '...' : summary.waitingPatients}
                </h3>
                <p className="text-[11px] text-amber-700 mt-1">Pasien siap di ruang tunggu</p>
              </div>
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-teal-200 bg-teal-50/20 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-teal-800">Pasien Selesai Diperiksa</p>
                <h3 className="text-3xl font-bold text-teal-700 mt-1">
                  {loading ? '...' : summary.completedPatients}
                </h3>
                <p className="text-[11px] text-teal-700 mt-1">Pemeriksaan SOAP selesai hari ini</p>
              </div>
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-800">Total Kunjungan Poli Hari Ini</p>
                <h3 className="text-3xl font-bold text-blue-800 mt-1">
                  {loading ? '...' : summary.todayPatients}
                </h3>
                <p className="text-[11px] text-blue-700 mt-1">Pasien berobat hari ini</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-800">Aksi Medis Dokter</span>
              <h2 className="text-lg font-bold text-slate-800">Mulai Pemeriksaan Pasien (SOAP)</h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Input keluhan subjektif, tanda vital objektif, diagnosa assessment, rencana terapi plan, tindakan medis, & resep obat.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('medical-records')}
              className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Buka Form SOAP Dokter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ROLE VIEW 2: PETUGAS PENDAFTARAN */}
      {user?.role === 'Petugas Pendaftaran' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-800">Pendaftaran Kunjungan Hari Ini</p>
                <h3 className="text-3xl font-bold text-emerald-700 mt-1">
                  {loading ? '...' : summary.todayPatients}
                </h3>
                <p className="text-[11px] text-emerald-600 mt-1">Pasien telah didaftarkan ke Poli</p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-800">Total Nomor Antrean Terbit</p>
                <h3 className="text-3xl font-bold text-purple-800 mt-1">
                  {loading ? '...' : summary.todayQueues}
                </h3>
                <p className="text-[11px] text-purple-700 mt-1">Nomor antrean A001, A002, dst.</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <ListOrdered className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-800">Total Pasien Terdaftar</p>
                <h3 className="text-3xl font-bold text-blue-800 mt-1">
                  {loading ? '...' : summary.totalPatients}
                </h3>
                <p className="text-[11px] text-blue-700 mt-1">Master data pasien klinik</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('registrations')}
              className="p-5 bg-white border border-slate-200 hover:border-blue-700 rounded-xl text-left shadow-sm hover:shadow-md transition-all group cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-800 text-sm">Pendaftaran Kunjungan Baru</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daftarkan pasien ke Dokter/Poli & terbitkan antrean</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('queues')}
              className="p-5 bg-white border border-slate-200 hover:border-blue-700 rounded-xl text-left shadow-sm hover:shadow-md transition-all group cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
                  <ListOrdered className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-800 text-sm">Panggil Loket Antrean</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Panggil antrean berikutnya & perbarui status</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-700 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* ROLE VIEW 3: ADMINISTRATOR */}
      {user?.role === 'Administrator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Pasien</span>
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : summary.totalPatients}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Master pasien terdaftar</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Pasien Hari Ini</span>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : summary.todayPatients}</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> Total Kunjungan
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Antrean Hari Ini</span>
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <ListOrdered className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : summary.todayQueues}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Nomor antrean terbit</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Pasien Menunggu</span>
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-amber-600">{loading ? '...' : summary.waitingPatients}</h3>
                <p className="text-[11px] text-amber-700 font-medium mt-1">Menunggu pelayanan</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Selesai Dilayani</span>
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-teal-700">{loading ? '...' : summary.completedPatients}</h3>
                <p className="text-[11px] text-teal-700 font-medium mt-1">Pemeriksaan selesai</p>
              </div>
            </div>
          </div>

          {/* MATRIKS CHECKLIST HAK AKSES ROLE (RBAC) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-800" />
                  Matriks Hak Akses Role (RBAC System Control)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar ketersediaan fitur & batasan izin untuk masing-masing role pengguna
                </p>
              </div>
            </div>

            {(() => {
              // Helper membaca permission per role secara dinamis
              const checkRolePerm = (roleName, moduleKey, actionKey = 'view') => {
                const targetUser = summary.roleUsers?.find(u => u.role === roleName);
                if (!targetUser) return false;
                if (targetUser.role === 'Administrator') return true;
                if (targetUser.permissions && typeof targetUser.permissions === 'object') {
                  const m = targetUser.permissions[moduleKey];
                  return Array.isArray(m) && m.includes(actionKey);
                }
                return false;
              };

              const dokterItems = [
                { label: 'Lihat Daftar Antrean Pasien', allowed: checkRolePerm('Dokter', 'queues', 'view') },
                { label: 'Input Rekam Medis SOAP', allowed: checkRolePerm('Dokter', 'medical-records', 'create') },
                { label: 'Input Tindakan Medis & Resep', allowed: checkRolePerm('Dokter', 'medical-records', 'edit') },
                { label: 'Lihat Riwayat Berobat Pasien', allowed: checkRolePerm('Dokter', 'patients', 'view') },
                { label: 'Tambah / Edit Master Pasien', allowed: checkRolePerm('Dokter', 'patients', 'create') || checkRolePerm('Dokter', 'patients', 'edit') },
                { label: 'Pendaftaran Kunjungan Baru', allowed: checkRolePerm('Dokter', 'registrations', 'create') }
              ];

              const pendaftaranItems = [
                { label: 'Tambah, Edit, & Kelola Pasien', allowed: checkRolePerm('Petugas Pendaftaran', 'patients', 'create') },
                { label: 'Pendaftaran Pasien ke Poli', allowed: checkRolePerm('Petugas Pendaftaran', 'registrations', 'create') },
                { label: 'Generate Nomor Antrean (A001...)', allowed: checkRolePerm('Petugas Pendaftaran', 'queues', 'view') },
                { label: 'Panggil Loket Antrean', allowed: checkRolePerm('Petugas Pendaftaran', 'queues', 'call') },
                { label: 'Input Diagnosa SOAP Dokter', allowed: checkRolePerm('Petugas Pendaftaran', 'medical-records', 'create') },
                { label: 'Input Resep Obat Pasien', allowed: checkRolePerm('Petugas Pendaftaran', 'medical-records', 'edit') }
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Card Dokter */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-cyan-700" />
                        <h3 className="font-bold text-slate-800 text-sm">Role Dokter</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded border border-cyan-200">
                        Medis
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs">
                      {dokterItems.map((item, i) => (
                        <li key={i} className={`flex items-center gap-2 ${item.allowed ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                          {item.allowed ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Pendaftaran */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-blue-700" />
                        <h3 className="font-bold text-slate-800 text-sm">Role Pendaftaran</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                        Front Office
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs">
                      {pendaftaranItems.map((item, i) => (
                        <li key={i} className={`flex items-center gap-2 ${item.allowed ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                          {item.allowed ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Admin */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <h3 className="font-bold text-slate-800 text-sm">Role Administrator</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200">
                        Full Access
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs">
                      {['Full Access Master Data Pasien', 'Full Access Pendaftaran Kunjungan', 'Full Access Kelola & Panggil Antrean', 'Full Access Monitoring SOAP Dokter', 'Full Access Dashboard & Statistik', 'Otorisasi Hak Akses Sistem (RBAC)'].map((lbl, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{lbl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Dynamic Doctors & Polyclinics Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <Stethoscope className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dokter & Layanan Poli Klinik</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <User className="w-4 h-4 text-blue-700" />
              Dokter Terdaftar ({summary.doctors.length})
            </p>
            {summary.doctors.length > 0 ? (
              <div className="space-y-1">
                {summary.doctors.map((doc) => (
                  <div key={doc.id} className="text-slate-700 font-medium pl-5 relative before:content-['•'] before:absolute before:left-2 before:text-blue-600">
                    {doc.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">Belum ada data dokter</p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              Poliklinik Aktif ({summary.polyclinics.length})
            </p>
            {summary.polyclinics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {summary.polyclinics.map((poly) => (
                  <span key={poly.id} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-medium rounded border border-emerald-200 text-xs">
                    {poly.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">Belum ada data poli</p>
            )}
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Dokter dan Pelayanan Poli Yang Tersedia Saat Ini
        </div>
      </div>

    </div>
  );
}
