import { X, Printer, Ticket, CheckCircle2 } from 'lucide-react';

export default function RegistrationTicketModal({ show, registration, onClose }) {
  if (!show || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
        {/* Top bar (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-purple-700" />
            <h3 className="font-bold text-slate-800 text-sm">Pratinjau Tiket Antrean</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 text-center space-y-4 print:p-0">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">NEXA CLINIC</h2>
            <p className="text-[11px] text-slate-500">Sistem Informasi Pelayanan Kesehatan Pratama</p>
            <div className="border-b border-dashed border-slate-300 pt-2"></div>
          </div>

          <div className="py-2">
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Nomor Antrean Anda</p>
            <h1 className="text-5xl font-extrabold font-mono text-purple-900 my-1 tracking-wider">
              {registration.queue_number || 'A001'}
            </h1>
            <span className="inline-block px-3 py-0.5 bg-purple-100 text-purple-800 font-semibold rounded-full text-xs">
              {registration.polyclinic_name}
            </span>
          </div>

          <div className="border-y border-dashed border-slate-300 py-3 text-left space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Kunjungan:</span>
              <span className="font-mono font-bold text-slate-800">{registration.registration_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Pasien:</span>
              <span className="font-bold text-slate-900">{registration.patient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">No. RM:</span>
              <span className="font-mono text-slate-700">{registration.medical_record_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dokter Jaga:</span>
              <span className="text-slate-800 font-medium">{registration.doctor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal & Jam:</span>
              <span className="text-slate-700">{new Date(registration.created_at || Date.now()).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400 italic">
            <p>Harap menunggu nomor antrean Anda dipanggil di ruang tunggu.</p>
            <p>Terima kasih atas kunjungan Anda.</p>
          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 text-xs print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-xl cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
}
