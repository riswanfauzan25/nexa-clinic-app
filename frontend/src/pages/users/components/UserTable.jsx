import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const DEFAULT_ROLE_PERMISSIONS = {
  Administrator: {
    patients: ['view', 'create', 'edit', 'delete'],
    polyclinics: ['view', 'create', 'edit', 'delete'],
    procedures: ['view', 'create', 'edit', 'delete'],
    medicines: ['view', 'create', 'edit', 'delete'],
    registrations: ['view', 'create', 'edit', 'delete'],
    queues: ['view', 'call', 'edit'],
    'medical-records': ['view', 'create', 'edit']
  },
  Dokter: {
    patients: ['view'],
    polyclinics: [],
    procedures: [],
    medicines: [],
    registrations: ['view'],
    queues: ['view', 'call', 'edit'],
    'medical-records': ['view', 'create', 'edit']
  },
  'Petugas Pendaftaran': {
    patients: ['view', 'create', 'edit', 'delete'],
    polyclinics: [],
    procedures: [],
    medicines: [],
    registrations: ['view', 'create', 'edit', 'delete'],
    queues: ['view', 'call', 'edit'],
    'medical-records': []
  }
};

export default function UserTable({
  displayedUsers,
  totalUsers,
  loading,
  search,
  setSearch,
  currentPage,
  totalPages,
  setCurrentPage,
  fetchUsers,
  onOpenEdit,
  onOpenDelete,
  indexOfFirstUser
}) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator':
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-semibold rounded text-[11px]">Administrator</span>;
      case 'Dokter':
        return <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold rounded text-[11px]">Dokter</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-semibold rounded text-[11px]">Petugas Pendaftaran</span>;
    }
  };

  const getUserPermissions = (u) => {
    if (!u.permissions) {
      return DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran'];
    }
    if (typeof u.permissions === 'string') {
      try {
        return JSON.parse(u.permissions);
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran'];
      }
    }
    return u.permissions;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Controls: Search & Total Count */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, username, atau role..."
            className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-500 font-medium">
            Total: <strong className="text-slate-800">{totalUsers}</strong> Pengguna
          </span>
          <button
            onClick={fetchUsers}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="p-3.5 pl-6">No</th>
              <th className="p-3.5">Nama Pengguna</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Role System</th>
              <th className="p-3.5 max-w-xs">Hak Akses Modul Aktif</th>
              <th className="p-3.5 text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <span>Memuat data pengguna...</span>
                </td>
              </tr>
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600 text-sm">Data pengguna tidak ditemukan</p>
                </td>
              </tr>
            ) : (
              displayedUsers.map((u, index) => {
                const perms = getUserPermissions(u);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-slate-500">{indexOfFirstUser + index + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 font-mono text-slate-600">@{u.username}</td>
                    <td className="p-3.5">{getRoleBadge(u.role)}</td>
                    <td className="p-3.5 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {u.role === 'Administrator' ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[10px] border border-slate-300">
                            Full Access All Modules
                          </span>
                        ) : (
                          <>
                            {perms.patients && perms.patients.length > 0 && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] border border-blue-200">
                                Pasien ({perms.patients.join(',')})
                              </span>
                            )}
                            {perms.polyclinics && perms.polyclinics.length > 0 && (
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] border border-indigo-200">
                                Poli ({perms.polyclinics.join(',')})
                              </span>
                            )}
                            {perms.procedures && perms.procedures.length > 0 && (
                              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] border border-teal-200">
                                Tindakan ({perms.procedures.join(',')})
                              </span>
                            )}
                            {perms.medicines && perms.medicines.length > 0 && (
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] border border-violet-200">
                                Obat ({perms.medicines.join(',')})
                              </span>
                            )}
                            {perms.registrations && perms.registrations.length > 0 && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] border border-emerald-200">
                                Pendaftaran ({perms.registrations.join(',')})
                              </span>
                            )}
                            {perms.queues && perms.queues.length > 0 && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] border border-purple-200">
                                Antrean ({perms.queues.join(',')})
                              </span>
                            )}
                            {perms['medical-records'] && perms['medical-records'].length > 0 && (
                              <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-[10px] border border-cyan-200">
                                SOAP Dokter ({perms['medical-records'].join(',')})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => onOpenEdit(u)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => onOpenDelete(u)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Hapus
                      </button>
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
