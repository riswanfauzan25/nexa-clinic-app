import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ClipboardList, Plus, X, CheckCircle2, Ticket } from 'lucide-react';
import RegistrationTable from './components/RegistrationTable';
import RegistrationFormModal from './components/RegistrationFormModal';
import RegistrationTicketModal from './components/RegistrationTicketModal';

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

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/registrations?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      if (response.success) {
        setRegistrations(response.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
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
  }, [search, statusFilter]);

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

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      const response = await api.put(`/registrations/${item.id}/status`, { status: newStatus });
      if (response.success) {
        setGlobalSuccessAlert(`Status kunjungan ${item.registration_number} diubah menjadi ${newStatus}.`);
        fetchRegistrations();
      }
    } catch (error) {
      alert(error.message || 'Gagal mengubah status pendaftaran.');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus pendaftaran ${item.registration_number} (${item.patient_name})?`)) return;
    try {
      const response = await api.delete(`/registrations/${item.id}`);
      if (response.success) {
        setGlobalSuccessAlert(`Pendaftaran ${item.registration_number} berhasil dihapus.`);
        fetchRegistrations();
      }
    } catch (error) {
      alert(error.message || 'Gagal menghapus data pendaftaran.');
    }
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
        totalCount={registrations.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        indexOfFirst={indexOfFirst}
        canEdit={canEdit}
        canDelete={canDelete}
        onRefresh={fetchRegistrations}
        onOpenTicket={handleOpenTicketModal}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
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
    </div>
  );
}
