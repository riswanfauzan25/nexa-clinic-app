import { X, Eye } from 'lucide-react';

export default function PatientDetailModal({ 
  showDetailModal, 
  setShowDetailModal, 
  patient 
}) {
  if (!showDetailModal || !patient) return null;

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '-';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Tahun`;
  };

  const noRM = patient.medical_record_number || patient.no_rm || '-';
  const phone = patient.phone_number || patient.phone || '-';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Detail Identitas Pasien</h3>
              <p className="text-xs text-slate-400 font-mono">{noRM}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDetailModal(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">No. Rekam Medis</span>
              <span className="font-mono font-bold text-blue-800 text-sm block">{noRM}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">NIK (KTP)</span>
              <span className="font-mono font-bold text-slate-800 text-xs block">{patient.nik}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Nama Lengkap Pasien</span>
              <span className="font-bold text-slate-900">{patient.name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Jenis Kelamin</span>
              <span>
                {patient.gender === 'Laki-laki' ? (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 font-semibold rounded text-[11px]">
                    Laki-laki
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 font-semibold rounded text-[11px]">
                    Perempuan
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Tanggal Lahir & Umur</span>
              <span className="font-semibold text-slate-800">
                {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                }) : '-'} ({calculateAge(patient.birth_date)})
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">No. Telepon / WhatsApp</span>
              <span className="font-mono font-semibold text-slate-800">{phone}</span>
            </div>

            <div className="py-1.5">
              <span className="text-slate-500 font-medium block mb-1">Alamat Lengkap</span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                {patient.address || '-'}
              </div>
            </div>

            <div className="flex justify-between py-1.5 pt-2 text-[11px] text-slate-400">
              <span>Terdaftar pada:</span>
              <span>
                {patient.created_at ? new Date(patient.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : '-'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
