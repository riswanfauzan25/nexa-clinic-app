import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, UserPlus, CheckCircle2, X } from 'lucide-react';
import PatientTable from './components/PatientTable';
import PatientFormModal from './components/PatientFormModal';
import PatientDetailModal from './components/PatientDetailModal';
import PatientDeleteModal from './components/PatientDeleteModal';

export default function PatientsPage() {
  const { hasPermission } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const limit = 10;

  // Alert Notifikasi Sukses 1x di Index
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  // Modal Form State (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    gender: 'Laki-laki',
    birth_date: '',
    phone_number: '',
    address: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Detail State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);

  // Modal Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const response = await api.get(`/patients?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`);
      if (response.success) {
        setPatients(response.data.patients || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalPatients(response.data.pagination?.totalRecords || response.data.pagination?.totalData || 0);
        setCurrentPage(response.data.pagination?.currentPage || 1);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1, search);
  }, [search]);

  // Auto clear global success alert setelah 4 detik
  useEffect(() => {
    if (globalSuccessAlert) {
      const timer = setTimeout(() => {
        setGlobalSuccessAlert('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccessAlert]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedPatientId(null);
    setFormData({
      nik: '',
      name: '',
      gender: 'Laki-laki',
      birth_date: '',
      phone_number: '',
      address: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (p) => {
    setIsEditing(true);
    setSelectedPatientId(p.id);
    setFormData({
      nik: p.nik,
      name: p.name,
      gender: p.gender,
      birth_date: p.birth_date ? p.birth_date.split('T')[0] : '',
      phone_number: p.phone_number || p.phone || '',
      address: p.address || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenDetailModal = (p) => {
    setSelectedPatientDetail(p);
    setShowDetailModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nik || !formData.name || !formData.birth_date) {
      setFormError('NIK, Nama Lengkap, dan Tanggal Lahir wajib diisi.');
      return;
    }

    if (formData.nik.length !== 16) {
      setFormError('NIK harus tepat 16 digit angka.');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/patients/${selectedPatientId}`, formData);
      } else {
        response = await api.post('/patients', formData);
      }

      if (response.success) {
        setShowModal(false);
        setGlobalSuccessAlert(isEditing ? 'Data pasien berhasil diperbarui!' : 'Data pasien baru berhasil disimpan!');
        fetchPatients(currentPage, search);
      }
    } catch (error) {
      setFormError(error.message || 'Gagal menyimpan data pasien.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      const response = await api.delete(`/patients/${patientToDelete.id}`);
      if (response.success) {
        setShowDeleteModal(false);
        const deletedName = patientToDelete.name;
        setPatientToDelete(null);
        setGlobalSuccessAlert(`Data pasien "${deletedName}" berhasil dihapus dari sistem!`);
        fetchPatients(currentPage, search);
      }
    } catch (error) {
      alert(error.message || 'Gagal menghapus data pasien.');
    }
  };

  const canCreate = hasPermission('patients', 'create');
  const canEdit = hasPermission('patients', 'edit');
  const canDelete = hasPermission('patients', 'delete');

  return (
    <div className="space-y-6">
      
      {/* Alert Notifikasi Sukses Global Banner */}
      {globalSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-center justify-between animate-fade-in text-xs text-emerald-800">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{globalSuccessAlert}</span>
          </div>
          <button 
            onClick={() => setGlobalSuccessAlert('')}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Modul Master Data</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Master Data Pasien</h1>
          <p className="text-slate-500 text-xs mt-1">
            Kelola identitas pasien, NIK, No. Rekam Medis (RM), kontak, dan alamat terdaftar.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pasien Baru</span>
          </button>
        )}
      </div>

      {/* Sub-Komponen 1: Data Table */}
      <PatientTable
        patients={patients}
        loading={loading}
        search={search}
        setSearch={setSearch}
        totalPatients={totalPatients}
        currentPage={currentPage}
        totalPages={totalPages}
        fetchPatients={fetchPatients}
        onOpenDetail={handleOpenDetailModal}
        onOpenEdit={handleOpenEditModal}
        onOpenDelete={(p) => {
          setPatientToDelete(p);
          setShowDeleteModal(true);
        }}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Sub-Komponen 2: Modal Form Create & Edit Pasien */}
      <PatientFormModal
        showModal={showModal}
        setShowModal={setShowModal}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitForm}
        submitting={submitting}
        formError={formError}
      />

      {/* Sub-Komponen 3: Modal Detail Pasien */}
      <PatientDetailModal
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        patient={selectedPatientDetail}
      />

      {/* Sub-Komponen 4: Modal Hapus Pasien */}
      <PatientDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        patientToDelete={patientToDelete}
        onConfirmDelete={handleDeletePatient}
      />

    </div>
  );
}
