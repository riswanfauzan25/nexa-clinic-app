import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';

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

  // Alert Success Global State (misal setelah Hapus)
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
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Detail Pasien State
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
    setFormSuccess('');

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
        setFormSuccess(response.message);
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess('');
          setGlobalSuccessAlert(isEditing ? 'Data pasien berhasil diperbarui!' : 'Data pasien baru berhasil ditambahkan!');
          fetchPatients(currentPage, search);
        }, 1200);
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

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '-';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Tahun`;
  };

  const canCreate = hasPermission('patients', 'create');
  const canEdit = hasPermission('patients', 'edit');
  const canDelete = hasPermission('patients', 'delete');

  return (
    <div className="space-y-6">
      
      {/* Alert Notifikasi Sukses Global */}
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

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Controls: Search & Refresh */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIK, Nama, atau No. RM (misal: RM-2026...)..."
              className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Total: <strong className="text-slate-800">{totalPatients}</strong> Pasien
            </span>
            <button
              onClick={() => fetchPatients(currentPage, search)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-6">No. RM</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">NIK</th>
                <th className="p-3.5">Jenis Kelamin</th>
                <th className="p-3.5">Tanggal Lahir</th>
                <th className="p-3.5">No. Telepon</th>
                <th className="p-3.5">Alamat</th>
                <th className="p-3.5 text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Memuat master data pasien...</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">Data pasien tidak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tambah pasien baru.</p>
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const noRM = p.medical_record_number || p.no_rm || '-';
                  const phone = p.phone_number || p.phone || '-';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-6 font-mono font-bold text-blue-800">
                        {noRM}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {p.nik}
                      </td>
                      <td className="p-3.5">
                        {p.gender === 'Laki-laki' ? (
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-semibold rounded text-[11px]">
                            Laki-laki
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 font-semibold rounded text-[11px]">
                            Perempuan
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {p.birth_date ? new Date(p.birth_date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {phone}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs truncate" title={p.address}>
                        {p.address || '-'}
                      </td>
                      <td className="p-3.5 text-right pr-6 space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetailModal(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-200 text-slate-800 hover:text-emerald-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                          title="Lihat Detail Pasien"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          Detail
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              setPatientToDelete(p);
                              setShowDeleteModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Halaman <strong className="text-slate-800">{currentPage}</strong> dari <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => fetchPatients(currentPage - 1, search)}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={() => fetchPatients(currentPage + 1, search)}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* MODAL DETAIL PASIEN LENGKAP */}
      {showDetailModal && selectedPatientDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Detail Identitas Pasien</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedPatientDetail.medical_record_number || selectedPatientDetail.no_rm}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">No. Rekam Medis</span>
                  <span className="font-mono font-bold text-blue-800 text-sm block">
                    {selectedPatientDetail.medical_record_number || selectedPatientDetail.no_rm}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">NIK (KTP)</span>
                  <span className="font-mono font-bold text-slate-800 text-xs block">
                    {selectedPatientDetail.nik}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Nama Lengkap Pasien</span>
                  <span className="font-bold text-slate-900">{selectedPatientDetail.name}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Jenis Kelamin</span>
                  <span>
                    {selectedPatientDetail.gender === 'Laki-laki' ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-semibold rounded text-[11px]">
                        Laki-laki
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 font-semibold rounded text-[11px]">
                        Perempuan
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Tanggal Lahir & Umur</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPatientDetail.birth_date ? new Date(selectedPatientDetail.birth_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'} ({calculateAge(selectedPatientDetail.birth_date)})
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">No. Telepon / WhatsApp</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedPatientDetail.phone_number || selectedPatientDetail.phone || '-'}
                  </span>
                </div>

                <div className="py-1.5">
                  <span className="text-slate-500 font-medium block mb-1">Alamat Lengkap</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                    {selectedPatientDetail.address || '-'}
                  </div>
                </div>

                <div className="flex justify-between py-1.5 pt-2 text-[11px] text-slate-400">
                  <span>Terdaftar pada:</span>
                  <span>
                    {selectedPatientDetail.created_at ? new Date(selectedPatientDetail.created_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : '-'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit Pasien */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIK (16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="3201234567890001"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama Pasien"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="081234567890"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Simpan Data Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 mb-1">Hapus Data Pasien?</h3>
            <p className="text-slate-500 text-xs mb-6">
              Apakah Anda yakin ingin menghapus data pasien <span className="font-bold text-slate-800">{patientToDelete?.name}</span> ({patientToDelete?.medical_record_number || patientToDelete?.no_rm})?
            </p>

            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeletePatient}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
