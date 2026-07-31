import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ClipboardList, Plus, X, CheckCircle2, Ticket } from 'lucide-react';
import RegistrationTable from './components/RegistrationTable';
import RegistrationFormModal from './components/RegistrationFormModal';
import RegistrationTicketModal from './components/RegistrationTicketModal';
import RegistrationDeleteModal from './components/RegistrationDeleteModal';
import RegistrationCancelModal from './components/RegistrationCancelModal';

const ITEMS_PER_PAGE = 10;

export default function RegistrationsPage() {
  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission('registrations', 'create');
  const canEdit = hasPermission('registrations', 'edit');
  const canDelete = hasPermission('registrations', 'delete');

  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [polyclinics, setPolyclinics] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  // Modal Form Pendaftaran Baru
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    polyclinic_id: '',
    doctor_id: '',
    payment_method: 'Umum',
    complaint: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Cetak Tiket Antrean
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Modal Hapus & Pembatalan
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/registrations?search=${encodeURIComponent(search)}&status=${statusFilter}&date=${dateFilter}`);
      if (response.success) {
        const dataList = Array.isArray(response.data) ? response.data : (response.data?.registrations || []);
        setRegistrations(Array.isArray(dataList) ? dataList : []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data relasi untuk form dropdown
  const fetchMasterData = async () => {
    try {
      const resPatients = await api.get('/patients?limit=500').catch(() => ({ success: false }));
      if (resPatients.success) {
        const patientList = resPatients.data?.patients || resPatients.data || [];
        setPatients(Array.isArray(patientList) ? patientList : []);
      }

      const resPolys = await api.get('/polyclinics').catch(() => ({ success: false }));
      if (resPolys.success) setPolyclinics(Array.isArray(resPolys.data) ? resPolys.data : []);

      const resDocs = await api.get('/doctors').catch(() => ({ success: false }));
      if (resDocs.success) setDoctors(Array.isArray(resDocs.data) ? resDocs.data : []);
    } catch (e) {
      console.error('Error fetching master data for registration:', e);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [search, statusFilter, dateFilter]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (globalSuccessAlert) {
      const t = setTimeout(() => setGlobalSuccessAlert(''), 4000);
      return () => clearTimeout(t);
    }
  }, [globalSuccessAlert]);

  // Pagination
  const regList = Array.isArray(registrations) ? registrations : [];
  const totalPages = Math.max(1, Math.ceil(regList.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = regList.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  const handleOpenCreateModal = () => {
    setFormData({ patient_id: '', polyclinic_id: '', doctor_id: '', payment_method: 'Umum', complaint: '' });
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenTicketModal = (item) => {
    setSelectedTicket(item);
    setShowTicketModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.patient_id || !formData.polyclinic_id || !formData.doctor_id) {
      setFormError('Pasien, Poliklinik, dan Dokter wajib dipilih.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/registrations', formData);
      if (response.success) {
        setShowFormModal(false);
        setGlobalSuccessAlert(`Pendaftaran berhasil! No. Antrean: ${response.data.queue_number}`);
        fetchRegistrations();
        // Otomatis buka tiket antrean yang baru dibuat
        setSelectedTicket(response.data);
        setShowTicketModal(true);
      }
    } catch (error) {
      setFormError(error.message || 'Gagal membuat pendaftaran kunjungan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCancelModal = (item) => {
    setItemToCancel(item);
    setShowCancelModal(true);
  };

  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!itemToCancel) return;
    try {
      const response = await api.put(`/registrations/${itemToCancel.id}/status`, { status: 'Dibatalkan' });
      if (response.success) {
        setShowCancelModal(false);
        setGlobalSuccessAlert(`Kunjungan ${itemToCancel.registration_number} (${itemToCancel.patient_name}) berhasil dibatalkan.`);
        setItemToCancel(null);
        fetchRegistrations();
      }
    } catch (error) {
      alert(error.message || 'Gagal membatalkan kunjungan.');
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('Tidak ada data pendaftaran untuk diexport.');
      return;
    }

    const headers = ['No', 'No Antrean', 'No Kunjungan', 'Tanggal', 'No RM', 'Nama Pasien', 'NIK', 'Poli Tujuan', 'Dokter Jaga', 'Jenis Pembayaran', 'Status', 'Keluhan'];
    const rows = registrations.map((r, i) => [
      i + 1,
      r.queue_number || '-',
      r.registration_number || '-',
      r.registration_date ? new Date(r.registration_date).toLocaleDateString('id-ID') : '-',
      r.medical_record_number || '-',
      `"${(r.patient_name || '').replace(/"/g, '""')}"`,
      `'${r.nik || '-'}`,
      `"${(r.polyclinic_name || '').replace(/"/g, '""')}"`,
      `"${(r.doctor_name || '').replace(/"/g, '""')}"`,
      r.payment_method || 'Umum',
      r.status || '-',
      `"${(r.complaint || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pendaftaran_Pasien_${dateFilter || 'semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifikasi Global */}
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
            <ClipboardList className="w-4 h-4" />
            <span>Modul Transaksional Pelayanan</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Pendaftaran Kunjungan Pasien</h1>
          <p className="text-slate-500 text-xs mt-1">Daftarkan pasien ke Poli & Dokter, auto-generate No. Kunjungan & penerbitan Tiket Antrean.</p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pendaftaran Baru</span>
          </button>
        )}
      </div>

      {/* Registration Table */}
      <RegistrationTable
        displayed={displayed}
        loading={loading}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        totalCount={regList.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        indexOfFirst={indexOfFirst}
        canEdit={canEdit}
        canDelete={canDelete}
        onRefresh={fetchRegistrations}
        onOpenTicket={handleOpenTicketModal}
        onUpdateStatus={handleOpenCancelModal}
        onDelete={handleOpenDeleteModal}
        onExportCSV={handleExportCSV}
      />

      {/* Form Modal */}
      <RegistrationFormModal
        show={showFormModal}
        patients={patients}
        polyclinics={polyclinics}
        doctors={doctors}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        submitting={submitting}
        onSubmit={handleSubmitForm}
        onClose={() => setShowFormModal(false)}
      />

      {/* Ticket Preview Modal */}
      <RegistrationTicketModal
        show={showTicketModal}
        registration={selectedTicket}
        onClose={() => setShowTicketModal(false)}
      />

      {/* Modal Konfirmasi Pembatalan */}
      <RegistrationCancelModal
        show={showCancelModal}
        item={itemToCancel}
        onConfirm={handleConfirmCancel}
        onClose={() => { setShowCancelModal(false); setItemToCancel(null); }}
      />

      {/* Modal Konfirmasi Hapus */}
      <RegistrationDeleteModal
        show={showDeleteModal}
        item={itemToDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
      />
    </div>
  );
}
