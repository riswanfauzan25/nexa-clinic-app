import { 
  ClipboardList, 
  Search, 
  Trash2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function RegistrationTable({
  displayed,
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  totalCount,
  currentPage,
  totalPages,
  setCurrentPage,
  indexOfFirst,
  canEdit,
  canDelete,
  onRefresh,
  onOpenTicket,
  onUpdateStatus,
  onDelete,
  onExportPDF
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Waiting':
      case 'Menunggu':
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-semibold rounded text-[11px] flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Menunggu
          </span>
        );
      case 'Check In':
        return (
          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 font-semibold rounded text-[11px] flex items-center gap-1 w-fit">
            <Ticket className="w-3 h-3 text-purple-600" /> Check In
          </span>
        );
      case 'In Examination':
      case 'Pemeriksaan':
      case 'Sedang Diperiksa':
        return (
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-semibold rounded text-[11px] flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-blue-600 animate-pulse" /> Pemeriksaan
          </span>
        );
      case 'Completed':
      case 'Selesai':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold rounded text-[11px] flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai
          </span>
        );
      case 'Cancelled':
      case 'Dibatalkan':
        return (
          <span className="px-2.5 py-0.5 bg-red-50 text-red-800 border border-red-200 font-semibold rounded text-[11px] flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3 text-red-600" /> Dibatalkan
          </span>
        );
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No. Kunjungan, No. RM, atau Nama..."
              className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 outline-none"
            />
          </div>

          {/* Filter Tanggal Kunjungan (Opsional) */}
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto bg-white border border-slate-300 focus:border-blue-700 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer font-medium"
              title="Filter Tanggal Kunjungan"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 bg-white border border-slate-300 focus:border-blue-700 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Check In">Check In</option>
            <option value="Pemeriksaan">Pemeriksaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={onExportPDF}
            className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export / Cetak Laporan Pendaftaran ke PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Total: <strong className="text-slate-800">{totalCount}</strong> Pendaftaran
          </span>
          <button
            onClick={onRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh Data"
          >
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
              <th className="p-3.5">No. Antrean</th>
              <th className="p-3.5">No. Kunjungan</th>
              <th className="p-3.5">Data Pasien</th>
              <th className="p-3.5">Poli Tujuan</th>
              <th className="p-3.5">Dokter Jaga</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <span>Memuat data pendaftaran kunjungan...</span>
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-slate-400">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600 text-sm">Belum ada pendaftaran kunjungan</p>
                  <p className="text-xs text-slate-400 mt-0.5">Daftarkan pasien berobat untuk menerbitkan tiket antrean.</p>
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-6 font-mono text-slate-500">{indexOfFirst + idx + 1}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-mono font-bold rounded-lg border border-purple-200 text-xs">
                      {item.queue_number || '-'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-blue-800">{item.registration_number}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{item.patient_name}</p>
                    <p className="text-[11px] font-mono text-slate-500">{item.medical_record_number}</p>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{item.polyclinic_name}</td>
                  <td className="p-3.5 text-slate-700">{item.doctor_name}</td>
                  <td className="p-3.5">{getStatusBadge(item.status)}</td>
                  <td className="p-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onOpenTicket(item)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Cetak Tiket Antrean"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Tiket</span>
                    </button>

                    {(canEdit && (item.status === 'Waiting' || item.status === 'Menunggu')) && (
                      <button
                        onClick={() => onUpdateStatus(item, 'Dibatalkan')}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        Batalkan
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">
          Halaman <strong className="text-slate-800">{currentPage}</strong> dari <strong className="text-slate-800">{totalPages}</strong>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
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
