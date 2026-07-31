import { useState, useEffect } from 'react';
import { X, AlertCircle, ClipboardList, User, Building2, Stethoscope, FileText } from 'lucide-react';

export default function RegistrationFormModal({
  show,
  patients = [],
  polyclinics = [],
  doctors = [],
  formData,
  setFormData,
  formError,
  submitting,
  onSubmit,
  onClose
}) {
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Filter dokter secara dinamis berdasarkan poliklinik yang dipilih
  useEffect(() => {
    if (formData.polyclinic_id) {
      const selectedPolyId = parseInt(formData.polyclinic_id, 10);
      const docsInPoly = doctors.filter(d => d.polyclinic_id === selectedPolyId);
      setFilteredDoctors(docsInPoly);
      
      // Reset pilihan dokter jika dokter sebelumnya tidak ada di poli baru
      if (formData.doctor_id && !docsInPoly.some(d => d.id === parseInt(formData.doctor_id, 10))) {
        setFormData(prev => ({ ...prev, doctor_id: '' }));
      }
    } else {
      setFilteredDoctors([]);
    }
  }, [formData.polyclinic_id, doctors]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative my-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-800" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Pendaftaran Kunjungan Pasien Baru</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
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

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Pilih Pasien */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Pilih Pasien Berobat <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 bg-white"
            >
              <option value="">-- Pilih Pasien (No. RM / Nama) --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.medical_record_number}] {p.name} (NIK: {p.nik})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Jika pasien belum pernah berobat, buat data pasien terlebih dahulu di modul Master Pasien.</p>
          </div>

          {/* Pilih Poliklinik Tujuan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Poliklinik Tujuan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.polyclinic_id}
              onChange={(e) => setFormData({ ...formData, polyclinic_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 bg-white"
            >
              <option value="">-- Pilih Poliklinik --</option>
              {polyclinics.map(poly => (
                <option key={poly.id} value={poly.id}>{poly.name}</option>
              ))}
            </select>
          </div>

          {/* Pilih Dokter Jaga (Filtered Dynamic) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              Dokter Penanggung Jawab <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
              disabled={!formData.polyclinic_id}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.polyclinic_id ? '-- Pilih Poliklinik Terlebih Dahulu --' : filteredDoctors.length === 0 ? '-- Tidak Ada Dokter Bertugas di Poli Ini --' : '-- Pilih Dokter Jaga --'}
              </option>
              {filteredDoctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
            {formData.polyclinic_id && filteredDoctors.length === 0 && (
              <p className="text-[11px] text-amber-600 font-medium mt-1">⚠️ Tidak ada akun Dokter yang ditugaskan di Poli ini. Atur poli dokter di Kelola Pengguna.</p>
            )}
          </div>

          {/* Keluhan Pasien */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Keluhan Utama / Gejala Pasien
            </label>
            <textarea
              rows={3}
              value={formData.complaint}
              onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
              placeholder="Contoh: Demam tinggi sejak 2 hari yang lalu, pusing, dan batuk kering..."
              className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 outline-none focus:border-blue-700"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
            >
              {submitting ? 'Memproses...' : 'Daftarkan & Terbitkan Antrean'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
