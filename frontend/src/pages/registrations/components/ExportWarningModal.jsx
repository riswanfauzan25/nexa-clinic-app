import { AlertCircle } from 'lucide-react';

export default function ExportWarningModal({ show, message, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Informasi Export PDF</h3>
        <p className="text-slate-600 text-xs mb-6 leading-relaxed">
          {message || 'Tidak ada data pendaftaran yang tersedia untuk diexport ke file PDF.'}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
