import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function PolyclinicsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const [polyclinics, setPolyclinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  // Modal Form State (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchPolyclinics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/polyclinics?search=${encodeURIComponent(search)}`);
      if (response.success) {
        setPolyclinics(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching polyclinics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolyclinics();
  }, [search]);

  useEffect(() => {
    if (globalSuccessAlert) {
      const timer = setTimeout(() => setGlobalSuccessAlert(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccessAlert]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({ name: '', description: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setSelectedId(item.id);
    setFormData({ name: item.name, description: item.description || '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nama Poliklinik wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/polyclinics/${selectedId}`, formData);
      } else {
        response = await api.post('/polyclinics', formData);
      }

      if (response.success) {
        setShowModal(false);
        setGlobalSuccessAlert(isEditing ? 'Poliklinik berhasil diperbarui!' : 'Poliklinik baru berhasil ditambahkan!');
        fetchPolyclinics();
      }
    } catch (error) {
      setFormError(error.message || 'Gagal menyimpan data poliklinik.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await api.delete(`/polyclinics/${itemToDelete.id}`);
      if (response.success) {
        setShowDeleteModal(false);
        const name = itemToDelete.name;
        setItemToDelete(null);
        setGlobalSuccessAlert(`Poliklinik "${name}" berhasil dihapus!`);
        fetchPolyclinics();
      }
    } catch (error) {
      alert(error.message || 'Gagal menghapus poliklinik.');
    }
  };

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
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Modul Master Data</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kelola Master Poliklinik</h1>
          <p className="text-slate-500 text-xs mt-1">
            Kelola daftar spesialisasi poliklinik aktif untuk pendaftaran pelayanan medis.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Poli Baru</span>
          </button>
        )}
      </div>

      {/* Data Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama poliklinik..."
              className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 outline-none"
            />
          </div>

          <button
            onClick={fetchPolyclinics}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-6">No</th>
                <th className="p-3.5">Nama Poliklinik</th>
                <th className="p-3.5">Deskripsi Pelayanan</th>
                {isAdmin && <th className="p-3.5 text-right pr-6">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Memuat data poliklinik...</span>
                  </td>
                </tr>
              ) : polyclinics.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">Data poliklinik belum tersedia</p>
                  </td>
                </tr>
              ) : (
                polyclinics.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3.5 text-slate-600 max-w-md">{item.description || '-'}</td>
                    {isAdmin && (
                      <td className="p-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setShowDeleteModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Edit Poliklinik' : 'Tambah Poliklinik Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Poliklinik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Poli Mata, Poli Kebidanan..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pelayanan</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan singkat cakupan pelayanan poliklinik..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Simpan Poliklinik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Hapus Poliklinik?</h3>
            <p className="text-slate-500 text-xs mb-6">
              Apakah Anda yakin ingin menghapus poliklinik <span className="font-bold text-slate-800">{itemToDelete?.name}</span>?
            </p>
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl cursor-pointer shadow-xs"
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
