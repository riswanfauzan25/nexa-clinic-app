import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ClipboardList, Plus, X, CheckCircle2, Ticket } from 'lucide-react';
import RegistrationTable from './components/RegistrationTable';
import RegistrationFormModal from './components/RegistrationFormModal';
import RegistrationTicketModal from './components/RegistrationTicketModal';
import RegistrationDeleteModal from './components/RegistrationDeleteModal';
import RegistrationCancelModal from './components/RegistrationCancelModal';
import ExportWarningModal from './components/ExportWarningModal';

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

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
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

  // Modal Peringatan Export Kosong
  const [showExportWarning, setShowExportWarning] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/registrations?search=${encodeURIComponent(search)}&status=${statusFilter}&date=${dateFilter}`);
      if (response.success) {
        const dataList = Array.isArray(response.data) ? response.data : (response.data?.registrations || []);
        setRegistrations(dataList);
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
  const totalPages = Math.max(1, Math.ceil(registrations.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = registrations.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

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

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await api.delete(`/registrations/${itemToDelete.id}`);
      if (response.success) {
        setShowDeleteModal(false);
        setGlobalSuccessAlert(`Pendaftaran ${itemToDelete.registration_number} (${itemToDelete.patient_name}) berhasil dihapus.`);
        setItemToDelete(null);
        fetchRegistrations();
      }
    } catch (error) {
      alert(error.message || 'Gagal menghapus data pendaftaran.');
    }
  };

  const handleExportPDF = () => {
    if (!Array.isArray(registrations) || registrations.length === 0) {
      setShowExportWarning(true);
      return;
    }

    const printWindow = window.open('', '_blank');
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const selectedDateLabel = dateFilter ? new Date(dateFilter).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Semua Tanggal';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Pendaftaran Pasien - Nexa Clinic</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 18px; color: #1e3a8a; }
          .header p { margin: 4px 0 0; font-size: 11px; color: #64748b; }
          .meta { margin-bottom: 15px; font-size: 11px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #64748b; }
          @media print {
            @page { size: landscape; margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NEXA CLINIC - LAPORAN PENDAFTARAN PASIEN</h1>
          <p>Sistem Informasi Manajemen Pelayanan Klinik Kesehatan</p>
        </div>
        <div class="meta">
          <div><strong>Filter Tanggal:</strong> ${selectedDateLabel} | <strong>Filter Status:</strong> ${statusFilter || 'Semua Status'}</div>
          <div><strong>Total Data:</strong> ${registrations.length} Pendaftaran | <strong>Dicetak:</strong> ${todayFormatted}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th width="30">No</th>
              <th>No. Antrean</th>
              <th>No. Kunjungan</th>
              <th>No. RM</th>
              <th>Nama Pasien</th>
              <th>Poli Tujuan</th>
              <th>Dokter Jaga</th>
              <th>Pembayaran</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${registrations.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${r.queue_number || '-'}</strong></td>
                <td>${r.registration_number || '-'}</td>
                <td>${r.medical_record_number || '-'}</td>
                <td><strong>${r.patient_name || '-'}</strong></td>
                <td>${r.polyclinic_name || '-'}</td>
                <td>${r.doctor_name || '-'}</td>
                <td>${r.payment_method || 'Umum'}</td>
                <td>${r.status || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Dicetak secara otomatis oleh Sistem Nexa Clinic</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
        totalCount={registrations.length}
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
        onExportPDF={handleExportPDF}
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

      {/* Modal Peringatan Export PDF Kosong */}
      <ExportWarningModal
        show={showExportWarning}
        message="Tidak ada data pendaftaran pada filter ini yang dapat diexport ke file PDF."
        onClose={() => setShowExportWarning(false)}
      />
    </div>
  );
}
