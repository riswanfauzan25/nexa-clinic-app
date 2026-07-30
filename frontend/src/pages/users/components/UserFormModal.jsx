import { X, AlertCircle, User, Lock, Shield, Sliders, ShieldCheck } from 'lucide-react';

export default function UserFormModal({
  showModal,
  setShowModal,
  isEditing,
  formData,
  setFormData,
  handleRoleChange,
  handleTogglePermission,
  isChecked,
  onSubmit,
  submitting,
  formError
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-800" />
            {isEditing ? 'Edit Akun & Otorisasi Hak Akses' : 'Tambah Pengguna & Atur RBAC'}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Error */}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
  );
}
