import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ProceduresPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/procedures?search=${encodeURIComponent(search)}`);
      if (response.success) {
        setProcedures(response.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProcedures(); }, [search]);

  useEffect(() => {
    if (globalSuccessAlert) {
      const t = setTimeout(() => setGlobalSuccessAlert(''), 4000);
      return () => clearTimeout(t);
    }
  }, [globalSuccessAlert]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(procedures.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = procedures.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  const handleOpenCreate = () => {
    setIsEditing(false); setSelectedId(null);
    setFormData({ code: `TDK-00${procedures.length + 1}`, name: '' });
    setFormError(''); setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true); setSelectedId(item.id);
    setFormData({ code: item.code, name: item.name });
    setFormError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    if (!formData.code.trim() || !formData.name.trim()) { setFormError('Kode dan Nama Tindakan Medis wajib diisi.'); return; }
    setSubmitting(true);
    try {
      const response = isEditing
        ? await api.put(`/procedures/${selectedId}`, formData)
        : await api.post('/procedures', formData);
      if (response.success) {
        setShowModal(false);
        setGlobalSuccessAlert(isEditing ? 'Tindakan medis berhasil diperbarui!' : 'Tindakan medis baru berhasil ditambahkan!');
        fetchProcedures();
      }
    } catch (error) {
      setFormError(error.message || 'Gagal menyimpan data tindakan medis.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await api.delete(`/procedures/${itemToDelete.id}`);
      if (response.success) {
        const name = itemToDelete.name;
        setShowDeleteModal(false); setItemToDelete(null);
        setGlobalSuccessAlert(`Tindakan medis "${name}" berhasil dihapus!`);
        fetchProcedures();
      }
    } catch (error) { alert(error.message || 'Gagal menghapus tindakan medis.'); }
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
            <Stethoscope className="w-4 h-4" /><span>Modul Master Data</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kelola Master Tindakan Medis</h1>
          <p className="text-slate-500 text-xs mt-1">Kelola katalog jenis tindakan & pelayanan medis yang digunakan pada pemeriksaan Dokter (SOAP).</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" /><span>Tambah Tindakan Baru</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search & Count Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode atau nama tindakan..." className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 outline-none" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">Total: <strong className="text-slate-800">{procedures.length}</strong> Tindakan Medis</span>
            <button onClick={fetchProcedures} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Refresh Data">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-6">No</th>
                <th className="p-3.5">Kode Tindakan</th>
                <th className="p-3.5">Nama Tindakan Medis</th>
                {isAdmin && <th className="p-3.5 text-right pr-6">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" /><span>Memuat data tindakan medis...</span>
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-400">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600 text-sm">Data tindakan medis belum tersedia</p>
                  <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tambah tindakan baru.</p>
                </td></tr>
              ) : (
                displayed.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-slate-500">{indexOfFirst + idx + 1}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-800">{item.code}</td>
                    <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                    {isAdmin && (
                      <td className="p-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                        <button onClick={() => handleOpenEdit(item)} className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer">
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />Edit
                        </button>
                        <button onClick={() => { setItemToDelete(item); setShowDeleteModal(true); }} className="px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" />Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">Halaman <strong className="text-slate-800">{currentPage}</strong> dari <strong className="text-slate-800">{totalPages}</strong></span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /><span>Sebelumnya</span>
            </button>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1">
              <span>Berikutnya</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{isEditing ? 'Edit Tindakan Medis' : 'Tambah Tindakan Medis Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Tindakan <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="TDK-001" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 font-mono" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Tindakan Medis <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Konsultasi & Pemeriksaan Umum" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700" />
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50 shadow-xs">{submitting ? 'Menyimpan...' : 'Simpan Tindakan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6" /></div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Hapus Tindakan Medis?</h3>
            <p className="text-slate-500 text-xs mb-6">Apakah Anda yakin ingin menghapus tindakan <span className="font-bold text-slate-800">{itemToDelete?.name}</span> ({itemToDelete?.code})?</p>
            <div className="flex gap-3 text-xs">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer">Batal</button>
              <button type="button" onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl cursor-pointer shadow-xs">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
