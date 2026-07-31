import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Pill, Plus, X, CheckCircle2 } from 'lucide-react';
import MedicineTable from './components/MedicineTable';
import MedicineFormModal from './components/MedicineFormModal';
import MedicineDeleteModal from './components/MedicineDeleteModal';

const ITEMS_PER_PAGE = 10;

export default function MedicinesPage() {
  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission('medicines', 'create');
  const canEdit = hasPermission('medicines', 'edit');
  const canDelete = hasPermission('medicines', 'delete');

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', unit: 'Tablet' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/medicines?search=${encodeURIComponent(search)}`);
      if (response.success) { setMedicines(response.data || []); setCurrentPage(1); }
    } catch (error) { console.error('Error fetching medicines:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedicines(); }, [search]);

  useEffect(() => {
    if (globalSuccessAlert) {
      const t = setTimeout(() => setGlobalSuccessAlert(''), 4000);
      return () => clearTimeout(t);
    }
  }, [globalSuccessAlert]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(medicines.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = medicines.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  const handleOpenCreate = () => {
    setIsEditing(false); setSelectedId(null);
    setFormData({ code: `OBT-00${medicines.length + 1}`, name: '', unit: 'Tablet' });
    setFormError(''); setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true); setSelectedId(item.id);
    setFormData({ code: item.code, name: item.name, unit: item.unit });
    setFormError(''); setShowModal(true);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item); setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    if (!formData.code.trim() || !formData.name.trim() || !formData.unit.trim()) {
      setFormError('Kode, Nama, dan Satuan Obat wajib diisi.'); return;
    }
    setSubmitting(true);
    try {
      const response = isEditing
        ? await api.put(`/medicines/${selectedId}`, formData)
        : await api.post('/medicines', formData);
      if (response.success) {
        setShowModal(false);
        setGlobalSuccessAlert(isEditing ? 'Data obat berhasil diperbarui!' : 'Obat baru berhasil ditambahkan!');
        fetchMedicines();
      }
    } catch (error) { setFormError(error.message || 'Gagal menyimpan data obat.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await api.delete(`/medicines/${itemToDelete.id}`);
      if (response.success) {
        const name = itemToDelete.name;
        setShowDeleteModal(false); setItemToDelete(null);
        setGlobalSuccessAlert(`Data obat "${name}" berhasil dihapus!`);
        fetchMedicines();
      }
    } catch (error) { alert(error.message || 'Gagal menghapus data obat.'); }
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {globalSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-center justify-between animate-fade-in text-xs text-emerald-800">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span>{globalSuccessAlert}</span>
          </div>
          <button onClick={() => setGlobalSuccessAlert('')} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
            <Pill className="w-4 h-4" /><span>Modul Master Data</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kelola Master Obat-obatan</h1>
          <p className="text-slate-500 text-xs mt-1">Kelola katalog obat-obatan dan satuan stok yang digunakan untuk resep Dokter.</p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Obat Baru</span>
          </button>
        )}
      </div>

      {/* Table Component */}
      <MedicineTable
        displayed={displayed}
        loading={loading}
        search={search}
        setSearch={setSearch}
        totalCount={medicines.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        indexOfFirst={indexOfFirst}
        canEdit={canEdit}
        canDelete={canDelete}
        onRefresh={fetchMedicines}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Form Modal Component */}
      <MedicineFormModal
        show={showModal}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />

      {/* Delete Modal Component */}
      <MedicineDeleteModal
        show={showDeleteModal}
        item={itemToDelete}
        onConfirm={handleDelete}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
      />
    </div>
  );
}
