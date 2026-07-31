import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FileText, Search, RefreshCw, Stethoscope, CheckCircle2, History, User, Building2, Calendar, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import MedicalRecordFormModal from './components/MedicalRecordFormModal';
import MedicalRecordDetailModal from './components/MedicalRecordDetailModal';
import PatientHistoryModal from './components/PatientHistoryModal';

const ITEMS_PER_PAGE = 10;

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'Dokter';

  const [activeTab, setActiveTab] = useState('ready'); // 'ready' (antrean hari ini) | 'history' (semua rekam medis)

  // Ready Patients state
  const [readyPatients, setReadyPatients] = useState([]);
  const [loadingReady, setLoadingReady] = useState(true);

  // All Medical Records state
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Common catalog state
  const [medicines, setMedicines] = useState([]);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPatientForExam, setSelectedPatientForExam] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);

  const fetchReadyPatients = async () => {
    setLoadingReady(true);
    try {
      const res = await api.get('/medical-records/ready');
      if (res.success) {
        setReadyPatients(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching ready patients:', err);
    } finally {
      setLoadingReady(false);
    }
  };

  const fetchMedicalRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await api.get(`/medical-records?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setMedicalRecords(res.data || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      if (res.success) {
        setMedicines(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching medicines catalog:', err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (activeTab === 'ready') {
      fetchReadyPatients();
    } else {
      fetchMedicalRecords();
    }
  }, [activeTab, search]);

  useEffect(() => {
    if (globalSuccessAlert) {
      const t = setTimeout(() => setGlobalSuccessAlert(''), 4000);
      return () => clearTimeout(t);
    }
  }, [globalSuccessAlert]);

  // Open SOAP Form Modal
  const handleOpenExamForm = (patient) => {
    setSelectedPatientForExam(patient);
    setShowFormModal(true);
  };

  // Open Record Detail Modal
  const handleOpenRecordDetail = async (recordId) => {
    try {
      const res = await api.get(`/medical-records/${recordId}`);
      if (res.success) {
        setSelectedRecordDetail(res.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      alert('Gagal memuat detail rekam medis.');
    }
  };

  // Open Patient History Modal
  const handleOpenPatientHistory = (patientInfo) => {
    if (!patientInfo) return;
    setSelectedPatientForHistory({
      id: patientInfo.patient_id || patientInfo.id,
      name: patientInfo.patient_name || patientInfo.name,
      medical_record_number: patientInfo.medical_record_number
    });
    setShowHistoryModal(true);
  };

  // Filtered List for Ready Patients Tab
  const filteredReady = (Array.isArray(readyPatients) ? readyPatients : []).filter(
    (p) =>
      (p?.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p?.medical_record_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (p?.queue_number || '').toLowerCase().includes(search.toLowerCase())
  );

  // Filtered List for History Tab
  const filteredHistory = (Array.isArray(medicalRecords) ? medicalRecords : []).filter(
    (m) =>
      (m?.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m?.medical_record_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (m?.assessment || '').toLowerCase().includes(search.toLowerCase())
  );

  const currentList = activeTab === 'ready' ? filteredReady : filteredHistory;
  const totalPages = Math.max(1, Math.ceil(currentList.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = currentList.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {globalSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-center justify-between animate-fade-in text-xs text-emerald-800">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{globalSuccessAlert}</span>
          </div>
          <button onClick={() => setGlobalSuccessAlert('')} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Modul Transaksional Dokter</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Pemeriksaan Dokter & Rekam Medis (SOAP)</h1>
          <p className="text-slate-500 text-xs mt-1">
            Pemeriksaan fisik (vital sign), pencatatan rekam medis SOAP, input tindakan medis, dan resep obat pasien.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('ready'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ready' ? 'bg-white text-blue-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Antrean Siap Diperiksa ({readyPatients.length})
          </button>
          <button
            onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-blue-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Semua Rekam Medis
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasien, no RM, no antrean..."
              className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Total: <strong className="text-slate-800">{currentList.length}</strong> {activeTab === 'ready' ? 'Pasien Antrean' : 'Rekam Medis'}
            </span>
            <button
              onClick={() => (activeTab === 'ready' ? fetchReadyPatients() : fetchMedicalRecords())}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${(activeTab === 'ready' ? loadingReady : loadingRecords) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-6">No</th>
                {activeTab === 'ready' && <th className="p-3.5">No. Antrean</th>}
                <th className="p-3.5">Pasien / No. RM</th>
                <th className="p-3.5">Poliklinik & Dokter</th>
                {activeTab === 'ready' ? <th className="p-3.5">Keluhan Awal</th> : <th className="p-3.5">Diagnosa (Assessment)</th>}
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'ready' ? loadingReady : loadingRecords) ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Memuat data pemeriksaan pasien...</span>
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">
                      {activeTab === 'ready' ? 'Tidak ada antrean pasien yang perlu diperiksa' : 'Belum ada data rekam medis'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeTab === 'ready' ? 'Pasien yang berstatus Dipanggil / Melayani akan otomatis muncul di sini.' : 'Coba ubah kata kunci pencarian Anda.'}
                    </p>
                  </td>
                </tr>
              ) : (
                displayed.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-slate-500">{indexOfFirst + idx + 1}</td>

                    {/* No Antrean jika tab ready */}
                    {activeTab === 'ready' && (
                      <td className="p-3.5 font-mono font-extrabold text-blue-900 text-sm">{item.queue_number}</td>
                    )}

                    {/* Pasien Info */}
                    <td className="p-3.5">
                      <strong className="text-slate-900 block font-bold text-sm">{item.patient_name}</strong>
                      <span className="text-slate-400 font-mono">RM: {item.medical_record_number}</span>
                    </td>

                    {/* Poli & Dokter */}
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 block">{item.polyclinic_name}</span>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />{item.doctor_name}
                      </span>
                    </td>

                    {/* Keluhan / Assessment */}
                    <td className="p-3.5 max-w-xs truncate text-slate-700">
                      {activeTab === 'ready' ? (item.chief_complaint || '-') : (item.assessment || '-')}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {activeTab === 'ready' ? (
                        (item.medical_record_id || item.queue_status === 'Selesai' || item.queue_status === 'Completed') ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />Selesai
                          </span>
                        ) : item.queue_status === 'Melayani' || item.queue_status === 'Serving' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
                            Sedang Diperiksa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Siap Diperiksa
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />Terekam
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                      {/* Tombol Periksa (Form SOAP) */}
                      {activeTab === 'ready' && !item.medical_record_id && item.queue_status !== 'Selesai' && item.queue_status !== 'Completed' && (
                        <button
                          onClick={() => handleOpenExamForm(item)}
                          className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Periksa Pasien</span>
                        </button>
                      )}

                      {/* Tombol Lihat Detail Rekam Medis jika sudah pernah ada */}
                      {(item.medical_record_id || activeTab === 'history') && (
                        <button
                          onClick={() => handleOpenRecordDetail(item.medical_record_id || item.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail SOAP</span>
                        </button>
                      )}

                      {/* Tombol Riwayat Rekam Medis */}
                      <button
                        onClick={() => handleOpenPatientHistory(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Lihat Seluruh Riwayat Kunjungan Pasien"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>Riwayat</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Halaman <strong className="text-slate-800">{currentPage}</strong> dari <strong className="text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Form SOAP Modal */}
      <MedicalRecordFormModal
        show={showFormModal}
        patientData={selectedPatientForExam}
        medicines={medicines}
        onClose={() => { setShowFormModal(false); setSelectedPatientForExam(null); }}
        onSuccess={(msg) => {
          setGlobalSuccessAlert(msg);
          setActiveTab('history');
          fetchReadyPatients();
          fetchMedicalRecords();
        }}
      />

      {/* Detail Modal */}
      <MedicalRecordDetailModal
        show={showDetailModal}
        record={selectedRecordDetail}
        onClose={() => { setShowDetailModal(false); setSelectedRecordDetail(null); }}
      />

      {/* History Modal */}
      <PatientHistoryModal
        show={showHistoryModal}
        patient={selectedPatientForHistory}
        onClose={() => { setShowHistoryModal(false); setSelectedPatientForHistory(null); }}
      />
    </div>
  );
}
