import { X, ClipboardList, User, Building2, Stethoscope, CreditCard, FileText, Calendar, Tag } from 'lucide-react';

export default function RegistrationDetailModal({ show, registration, onClose }) {
  if (!show || !registration) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative my-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">Detail Pendaftaran Pasien</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Detail */}
        <div className="space-y-4 text-xs">
          {/* Box Nomor Antrean & Registrasi */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">No. Antrean</p>
              <h2 className="text-3xl font-black font-mono text-purple-900 mt-0.5">{registration.queue_number || '-'}</h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">No. Kunjungan</p>
              <p className="text-sm font-mono font-bold text-blue-800 mt-1">{registration.registration_number}</p>
            </div>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100">
            {/* Pasien */}
            <div className="pt-2 flex items-start gap-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Nama Pasien</p>
                <p className="font-bold text-slate-900 text-sm">{registration.patient_name}</p>
                <p className="font-mono text-slate-500 text-[11px]">No. RM: {registration.medical_record_number} {registration.nik ? `| NIK: ${registration.nik}` : ''}</p>
              </div>
            </div>

            {/* Poli Tujuan */}
            <div className="pt-2 flex items-start gap-3">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Poliklinik Tujuan</p>
                <p className="font-bold text-slate-800">{registration.polyclinic_name}</p>
              </div>
            </div>

            {/* Dokter Jaga */}
            <div className="pt-2 flex items-start gap-3">
              <Stethoscope className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Dokter Penanggung Jawab</p>
                <p className="font-bold text-slate-800">{registration.doctor_name}</p>
              </div>
            </div>

            {/* Pembayaran & Tanggal */}
            <div className="pt-2 flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Jenis Pembayaran</p>
                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-800 font-semibold rounded border border-blue-200 mt-0.5">
                  {registration.payment_method || 'Umum'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Tanggal Kunjungan</p>
                <p className="font-medium text-slate-800">
                  {new Date(registration.registration_date || registration.created_at || Date.now()).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="pt-2 flex items-start gap-3">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Status Kunjungan saat Ini</p>
                <p className="font-bold text-slate-800 mt-0.5">{registration.status}</p>
              </div>
            </div>

            {/* Keluhan Utama */}
            <div className="pt-2 flex items-start gap-3">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Keluhan Awal Pasien</p>
                <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">
                  {registration.complaint || registration.chief_complaint || 'Tidak ada catatan keluhan khusus.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-4 mt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
