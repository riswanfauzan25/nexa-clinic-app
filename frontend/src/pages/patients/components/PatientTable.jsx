import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ChevronLeft,
  ChevronRight,
  Eye 
} from 'lucide-react';

export default function PatientTable({ 
  patients, 
  loading, 
  search, 
  setSearch, 
  totalPatients, 
  currentPage, 
  totalPages, 
  fetchPatients, 
  onOpenDetail, 
  onOpenEdit, 
  onOpenDelete, 
  canEdit, 
  canDelete 
}) {
  return (
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
                        onClick={() => onOpenDetail(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-200 text-slate-800 hover:text-emerald-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                        title="Lihat Detail Pasien"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        Detail
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => onOpenEdit(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onOpenDelete(p)}
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
  );
}
