import { Stethoscope, X, AlertCircle } from 'lucide-react';

export default function ProcedureFormModal({ show, isEditing, formData, setFormData, polyclinics = [], formError, submitting, onSubmit, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-blue-800" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? 'Edit Tindakan Medis' : 'Tambah Tindakan Medis Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kode Tindakan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Contoh: TDK-005"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Tindakan Medis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Konsultasi & Pemeriksaan Umum"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Berlaku untuk Poliklinik
            </label>
            <select
              value={formData.polyclinic_id || ''}
              onChange={(e) => setFormData({ ...formData, polyclinic_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-700"
            >
              <option value="">-- Semua Poliklinik (Global) --</option>
              {polyclinics.map((poly) => (
                <option key={poly.id} value={poly.id}>
                  {poly.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Pilih poli spesifik atau biarkan "Semua Poliklinik" agar muncul di seluruh poli.</p>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50 shadow-xs transition-colors">
              {submitting ? 'Menyimpan...' : isEditing ? 'Perbarui Tindakan' : 'Simpan Tindakan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
