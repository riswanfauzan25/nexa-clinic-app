import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Check, 
  User, 
  Lock, 
  Shield, 
  RefreshCw,
  Sliders,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_ROLE_PERMISSIONS = {
  Administrator: {
    patients: ['view', 'create', 'edit', 'delete'],
    registrations: ['view', 'create', 'edit', 'delete'],
    queues: ['view', 'call', 'edit'],
    'medical-records': ['view', 'create', 'edit']
  },
  Dokter: {
    patients: ['view'],
    registrations: ['view'],
    queues: ['view', 'call', 'edit'],
    'medical-records': ['view', 'create', 'edit']
  },
  'Petugas Pendaftaran': {
    patients: ['view', 'create', 'edit', 'delete'],
    registrations: ['view', 'create', 'edit', 'delete'],
    queues: ['view', 'call', 'edit'],
    'medical-records': []
  }
};

export default function UserManagementPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Alert Notifikasi Global (misal setelah Hapus / Simpan)
  const [globalSuccessAlert, setGlobalSuccessAlert] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  // State Modal Form (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Petugas Pendaftaran',
    permissions: DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran']
  });
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State Modal Hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?search=${encodeURIComponent(search)}`);
      if (response.success) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1);
  }, [search]);

  // Auto clear notification alert
  useEffect(() => {
    if (globalSuccessAlert) {
      const timer = setTimeout(() => {
        setGlobalSuccessAlert('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccessAlert]);

  // Client-side pagination calculation
  const totalUsers = allUsers.length;
  const totalPages = Math.ceil(totalUsers / limit) || 1;
  const indexOfLastUser = currentPage * limit;
  const indexOfFirstUser = indexOfLastUser - limit;
  const displayedUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'Petugas Pendaftaran',
      permissions: DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran']
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (u) => {
    setIsEditing(true);
    setSelectedUserId(u.id);
    setFormData({
      name: u.name,
      username: u.username,
      password: '',
      role: u.role,
      permissions: u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran']
    });
    setFormError('');
    setShowModal(true);
  };

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran']
    });
  };

  const handleTogglePermission = (moduleKey, actionKey) => {
    const currentModulePerms = formData.permissions?.[moduleKey] || [];
    let updatedModulePerms;

    if (currentModulePerms.includes(actionKey)) {
      updatedModulePerms = currentModulePerms.filter(a => a !== actionKey);
    } else {
      updatedModulePerms = [...currentModulePerms, actionKey];
    }

    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [moduleKey]: updatedModulePerms
      }
    });
  };

  const isChecked = (moduleKey, actionKey) => {
    return formData.permissions?.[moduleKey]?.includes(actionKey) || false;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.username || (!isEditing && !formData.password) || !formData.role) {
      setFormError('Semua bidang wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(`/users/${selectedUserId}`, formData);
      } else {
        response = await api.post('/users', formData);
      }

      if (response.success) {
        setFormSuccess(response.message);
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess('');
          setGlobalSuccessAlert(isEditing ? 'Data akun pengguna berhasil diperbarui!' : 'Akun pengguna baru berhasil ditambahkan!');
          fetchUsers();
        }, 1200);
      }
    } catch (error) {
      setFormError(error.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await api.delete(`/users/${userToDelete.id}`);
      if (response.success) {
        setShowDeleteModal(false);
        const deletedUserName = userToDelete.name;
        setUserToDelete(null);
        setGlobalSuccessAlert(`Akun pengguna "${deletedUserName}" berhasil dihapus dari sistem!`);
        fetchUsers();
      }
    } catch (error) {
      alert(error.message || 'Gagal menghapus pengguna.');
    }
  };

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
            <ShieldCheck className="w-4 h-4" />
            <span>Modul Otorisasi Sistem</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kelola Pengguna</h1>
          <p className="text-slate-500 text-xs mt-1">
            Kelola akun pengguna, penetapan role, dan checklist hak akses otorisasi sistem.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Main Table Container */}
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
                <th className="p-3.5">Hak Akses Modul Aktif</th>
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
                displayedUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-6 font-mono text-slate-500">{indexOfFirstUser + index + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 font-mono text-slate-600">@{u.username}</td>
                    <td className="p-3.5">{getRoleBadge(u.role)}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.role === 'Administrator' ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[10px] border border-slate-300">
                            Full Access All Modules
                          </span>
                        ) : (
                          <>
                            {(!u.permissions || u.permissions.patients?.length > 0) && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] border border-blue-200">
                                Pasien ({u.permissions?.patients?.join(',') || 'view'})
                              </span>
                            )}
                            {(!u.permissions || u.permissions.registrations?.length > 0) && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] border border-emerald-200">
                                Pendaftaran ({u.permissions?.registrations?.join(',') || 'view'})
                              </span>
                            )}
                            {(!u.permissions || u.permissions.queues?.length > 0) && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] border border-purple-200">
                                Antrean ({u.permissions?.queues?.join(',') || 'view'})
                              </span>
                            )}
                            {(!u.permissions || u.permissions['medical-records']?.length > 0) && (
                              <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-[10px] border border-cyan-200">
                                SOAP Dokter ({u.permissions?.['medical-records']?.join(',') || 'view'})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(u);
                          setShowDeleteModal(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-300 rounded-md font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Modal Form Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-800" />
                {isEditing ? 'Edit Akun & Otorisasi Hak Akses' : 'Tambah Pengguna & Atur RBAC'}
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
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Dr. Ani Wijaya, Sp.PD"
                      className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 outline-none focus:border-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username</label>
                  <div className="relative">
                    <span className="text-slate-400 font-mono absolute left-3 top-1/2 -translate-y-1/2">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="username_pegawai"
                      className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 outline-none focus:border-blue-700 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isEditing ? 'Password Baru (Opsional)' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={isEditing ? 'Biarkan kosong jika tak diubah' : '••••••••'}
                      className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 outline-none focus:border-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Utama</label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 outline-none focus:border-blue-700 bg-white"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Dokter">Dokter</option>
                      <option value="Petugas Pendaftaran">Petugas Pendaftaran</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checklist Hak Akses Modul & Aksi */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-800" />
                    Checklist Hak Akses Modul & Aksi (RBAC)
                  </h4>
                  <span className="text-[10px] text-slate-500 italic">
                    {formData.role === 'Administrator' ? 'Administrator memiliki hak akses penuh ke seluruh modul' : 'Centang untuk memberi hak akses spesifik'}
                  </span>
                </div>

                {formData.role === 'Administrator' ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-medium text-xs">
                    Akun Administrator otomatis memiliki hak akses penuh (*Full Access*) ke seluruh modul dan aksi tanpa batasan.
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    
                    {/* Modul 1: Master Data Pasien */}
                    <div className="bg-white p-3 border border-slate-200 rounded-lg space-y-2">
                      <p className="font-bold text-slate-800 text-xs">1. Master Data Pasien</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('patients', 'view')}
                            onChange={() => handleTogglePermission('patients', 'view')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Lihat (Index)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('patients', 'create')}
                            onChange={() => handleTogglePermission('patients', 'create')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Tambah</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('patients', 'edit')}
                            onChange={() => handleTogglePermission('patients', 'edit')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Edit</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('patients', 'delete')}
                            onChange={() => handleTogglePermission('patients', 'delete')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Hapus</span>
                        </label>
                      </div>
                    </div>

                    {/* Modul 2: Pendaftaran Pasien */}
                    <div className="bg-white p-3 border border-slate-200 rounded-lg space-y-2">
                      <p className="font-bold text-slate-800 text-xs">2. Pendaftaran Kunjungan Pasien</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('registrations', 'view')}
                            onChange={() => handleTogglePermission('registrations', 'view')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Lihat (Index)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('registrations', 'create')}
                            onChange={() => handleTogglePermission('registrations', 'create')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Daftar Baru</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('registrations', 'edit')}
                            onChange={() => handleTogglePermission('registrations', 'edit')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Ubah Status</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('registrations', 'delete')}
                            onChange={() => handleTogglePermission('registrations', 'delete')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Hapus</span>
                        </label>
                      </div>
                    </div>

                    {/* Modul 3: Kelola Antrean */}
                    <div className="bg-white p-3 border border-slate-200 rounded-lg space-y-2">
                      <p className="font-bold text-slate-800 text-xs">3. Kelola & Panggil Antrean</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('queues', 'view')}
                            onChange={() => handleTogglePermission('queues', 'view')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Lihat Antrean</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('queues', 'call')}
                            onChange={() => handleTogglePermission('queues', 'call')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Panggil / Ubah Status</span>
                        </label>
                      </div>
                    </div>

                    {/* Modul 4: Pemeriksaan Dokter (SOAP) */}
                    <div className="bg-white p-3 border border-slate-200 rounded-lg space-y-2">
                      <p className="font-bold text-slate-800 text-xs">4. Pemeriksaan Dokter (SOAP)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('medical-records', 'view')}
                            onChange={() => handleTogglePermission('medical-records', 'view')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Lihat Rekam Medis</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked('medical-records', 'create')}
                            onChange={() => handleTogglePermission('medical-records', 'create')}
                            className="rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                          />
                          <span>Input SOAP & Resep</span>
                        </label>
                      </div>
                    </div>

                  </div>
                )}
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
                  {submitting ? 'Saving...' : 'Simpan Akun & Permissions'}
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
            
            <h3 className="text-base font-bold text-slate-900 mb-1">Hapus Akun Pengguna?</h3>
            <p className="text-slate-500 text-xs mb-6">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">{userToDelete?.name}</span> (@{userToDelete?.username})?
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
                onClick={handleDeleteUser}
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
