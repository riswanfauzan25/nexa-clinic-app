import { AlertTriangle } from 'lucide-react';

export default function RegistrationCancelModal({ show, item, onConfirm, onClose }) {
  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Batalkan Kunjungan Pasien?</h3>
        <p className="text-slate-500 text-xs mb-2">Apakah Anda yakin ingin membatalkan kunjungan:</p>
        <p className="font-bold text-slate-800 text-sm mb-1">{item.patient_name}</p>
        <p className="font-mono text-blue-800 text-xs mb-6">({item.registration_number})</p>

        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            Ya, Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}
