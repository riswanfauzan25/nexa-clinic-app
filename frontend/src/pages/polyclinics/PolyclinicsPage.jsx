import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Building2, Plus, X, CheckCircle2 } from 'lucide-react';
import PolyclinicTable from './components/PolyclinicTable';
import PolyclinicFormModal from './components/PolyclinicFormModal';
import PolyclinicDeleteModal from './components/PolyclinicDeleteModal';

const ITEMS_PER_PAGE = 10;

export default function PolyclinicsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const [polyclinics, setPolyclinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchPolyclinics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/polyclinics?search=${encodeURIComponent(search)}`);
      if (response.success) { setPolyclinics(response.data || []); setCurrentPage(1); }
    } catch (error) { console.error('Error fetching polyclinics:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolyclinics(); }, [search]);

  useEffect(() => {
    if (globalSuccessAlert) {
      const t = setTimeout(() => setGlobalSuccessAlert(''), 4000);
      return () => clearTimeout(t);
    }
  }, [globalSuccessAlert]);

  const totalPages = Math.max(1, Math.ceil(polyclinics.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = polyclinics.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  const handleOpenCreate = () => {
    setIsEditing(false); setSelectedId(null);
    setFormData({ name: '', description: '' }); setFormError(''); setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true); setSelectedId(item.id);
    setFormData({ name: item.name, description: item.description || '' });
    setFormError(''); setShowModal(true);
  };

  const handleOpenDelete = (item) => { setItemToDelete(item); setShowDeleteModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    if (!formData.name.trim()) { setFormError('Nama Poliklinik wajib diisi.'); return; }
    setSubmitting(true);
    try {
      const response = isEditing
        ? await api.put(`/polyclinics/${selectedId}`, formData)
        : await api.post('/polyclinics', formData);
      if (response.success) {
        setShowModal(false);
        setGlobalSuccessAlert(isEditing ? 'Poliklinik berhasil diperbarui!' : 'Poliklinik baru berhasil ditambahkan!');
        fetchPolyclinics();
      }
    } catch (error) { setFormError(error.message || 'Gagal menyimpan data poliklinik.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await api.delete(`/polyclinics/${itemToDelete.id}`);
      if (response.success) {
        const name = itemToDelete.name;
        setShowDeleteModal(false); setItemToDelete(null);
        setGlobalSuccessAlert(`Poliklinik "${name}" berhasil dihapus!`);
        fetchPolyclinics();
      }
    } catch (error) { alert(error.message || 'Gagal menghapus poliklinik.'); }
  };

  return (
    <div className="space-y-6">
      {globalSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-center justify-between animate-fade-in text-xs text-emerald-800">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span>{globalSuccessAlert}</span>
          </div>
          <button onClick={() => setGlobalSuccessAlert('')} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /><span>Modul Master Data</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kelola Master Poliklinik</h1>
          <p className="text-slate-500 text-xs mt-1">Kelola daftar spesialisasi poliklinik aktif untuk pendaftaran pelayanan medis.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /><span>Tambah Poli Baru</span>
          </button>
        )}
      </div>

      <PolyclinicTable
        displayed={displayed} loading={loading} search={search} setSearch={setSearch}
        totalCount={polyclinics.length} currentPage={currentPage} totalPages={totalPages}
        setCurrentPage={setCurrentPage} indexOfFirst={indexOfFirst} isAdmin={isAdmin}
        onRefresh={fetchPolyclinics} onEdit={handleOpenEdit} onDelete={handleOpenDelete}
      />

      <PolyclinicFormModal
        show={showModal} isEditing={isEditing} formData={formData} setFormData={setFormData}
        formError={formError} submitting={submitting} onSubmit={handleSubmit} onClose={() => setShowModal(false)}
      />

      <PolyclinicDeleteModal
        show={showDeleteModal} item={itemToDelete} onConfirm={handleDelete}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
      />
    </div>
  );
}
