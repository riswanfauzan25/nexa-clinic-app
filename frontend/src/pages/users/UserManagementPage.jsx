import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { UserPlus, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import UserTable from './components/UserTable';
import UserFormModal from './components/UserFormModal';
import UserDeleteModal from './components/UserDeleteModal';

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

export default function UserManagementPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [polyclinics, setPolyclinics] = useState([]);

  // Alert Notifikasi Sukses Global Banner
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
    permissions: DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran'],
    polyclinic_id: null
  });
  const [formError, setFormError] = useState('');
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

  // Fetch daftar poliklinik saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchPolyclinics = async () => {
      try {
        const res = await api.get('/polyclinics');
        if (res.success) setPolyclinics(res.data || []);
      } catch (e) { console.error('Gagal fetch polyclinics:', e); }
    };
    fetchPolyclinics();
  }, []);

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
      permissions: DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran'],
      polyclinic_id: null
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
      permissions: u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran'],
      polyclinic_id: u.polyclinic_id || null
    });
    setFormError('');
    setShowModal(true);
  };

  const handleRoleChange = (newRole) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS['Petugas Pendaftaran'],
      polyclinic_id: null  // reset poli saat ganti role
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
        setShowModal(false);
        setGlobalSuccessAlert(isEditing ? 'Data akun pengguna berhasil diperbarui!' : 'Akun pengguna baru berhasil disimpan!');
        fetchUsers();
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

      {/* Sub-Komponen 1: Table Pengguna */}
      <UserTable
        displayedUsers={displayedUsers}
        totalUsers={totalUsers}
        loading={loading}
        search={search}
        setSearch={setSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        fetchUsers={fetchUsers}
        onOpenEdit={handleOpenEditModal}
        onOpenDelete={(u) => {
          setUserToDelete(u);
          setShowDeleteModal(true);
        }}
        indexOfFirstUser={indexOfFirstUser}
      />

      {/* Sub-Komponen 2: Modal Form Create & Edit User */}
      <UserFormModal
        showModal={showModal}
        setShowModal={setShowModal}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        handleRoleChange={handleRoleChange}
        handleTogglePermission={handleTogglePermission}
        isChecked={isChecked}
        onSubmit={handleSubmitForm}
        submitting={submitting}
        formError={formError}
        polyclinics={polyclinics}
      />

      {/* Sub-Komponen 3: Modal Hapus User */}
      <UserDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        userToDelete={userToDelete}
        onConfirmDelete={handleDeleteUser}
      />

    </div>
  );
}
