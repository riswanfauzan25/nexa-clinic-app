import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Volume2, Clock } from 'lucide-react';

export default function QueueDisplayPage() {
  const [queues, setQueues] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchQueues = async () => {
    try {
      const res = await api.get('/queues');
      if (res.success) setQueues(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetchQueues display:', e);
    }
  };

  useEffect(() => {
    fetchQueues();
    const intervalQueues = setInterval(fetchQueues, 3000);
    const intervalClock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(intervalQueues);
      clearInterval(intervalClock);
    };
  }, []);

  const callingQueue = queues.find(q => q.queue_status === 'Dipanggil');
  const waitingQueues = queues.filter(q => q.queue_status === 'Menunggu').slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-6 flex flex-col justify-between font-sans">
      {/* Header Klinik Simpel Background Putih */}
      <header className="bg-white border border-slate-300 rounded-xl px-8 py-5 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">NEXA CLINIC</h1>
          <p className="text-slate-500 text-xs mt-0.5">Papan Layanan Antrean Pasien Ruang Tunggu</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold font-mono text-blue-900">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-slate-500 text-xs mt-0.5 font-medium">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 flex-1">
        {/* Box Nomor Dipanggil Utama (Warna Terang Standar) */}
        <section className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-sm">
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Antrean Dipanggil</span>
            {callingQueue && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" /> SEDANG DIPANGGIL
              </span>
            )}
          </div>

          <div className="my-auto py-10">
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Nomor Antrean</p>
            <h2 className="text-8xl md:text-9xl font-black font-mono text-blue-900 tracking-wider">
              {callingQueue ? callingQueue.queue_number : '---'}
            </h2>

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Poliklinik Tujuan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {callingQueue ? callingQueue.polyclinic_name : 'Belum Ada Panggilan'}
              </h3>
              <p className="text-slate-600 text-xs font-medium mt-1">
                {callingQueue ? `Dokter: ${callingQueue.doctor_name}` : 'Silakan menunggu giliran Anda'}
              </p>
            </div>
          </div>

          <div className="text-slate-500 text-xs bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 w-full">
            Mohon bersiap ketika nomor antrean Anda dipanggil di atas.
          </div>
        </section>

        {/* Sidebar Antrean Berikutnya (Warna Terang Standar) */}
        <section className="lg:col-span-5 bg-white border border-slate-300 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Daftar Antrean Selanjutnya</h3>
            </div>

            <div className="space-y-3">
              {waitingQueues.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-sm font-medium">Tidak ada antrean menunggu saat ini.</p>
                </div>
              ) : (
                waitingQueues.map((q) => (
                  <div key={q.queue_id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <span className="px-3.5 py-1.5 bg-blue-100 text-blue-900 font-mono font-bold text-xl rounded-lg border border-blue-200">
                        {q.queue_number}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{q.patient_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{q.polyclinic_name}</p>
                      </div>
                    </div>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-3 py-1 rounded-md font-semibold">Menunggu</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <footer className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            Sistem Antrean Klinik Pasien &copy; Nexa Clinic
          </footer>
        </section>
      </main>
    </div>
  );
}
