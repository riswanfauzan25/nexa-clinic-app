import { Trash2 } from 'lucide-react';

export default function PolyclinicDeleteModal({ show, item, onConfirm, onClose }) {
  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Hapus Poliklinik?</h3>
        <p className="text-slate-500 text-xs mb-2">Apakah Anda yakin ingin menghapus poliklinik:</p>
        <p className="font-bold text-slate-800 text-sm mb-6">{item.name}</p>

        <div className="flex gap-3 text-xs">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors">Batal</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl cursor-pointer shadow-xs transition-colors">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}
