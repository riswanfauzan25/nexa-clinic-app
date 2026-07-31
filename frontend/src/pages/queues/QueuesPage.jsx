import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Monitor,
  Clock,
  UserCheck,
  ListOrdered
} from 'lucide-react';
import QueueTable from './components/QueueTable';
import QueueSkipModal from './components/QueueSkipModal';

const ITEMS_PER_PAGE = 10;

export default function QueuesPage() {
  const { user } = useAuth();
  const [queues, setQueues] = useState([]);
  const [polyclinics, setPolyclinics] = useState([]);
  const [selectedPolyclinic, setSelectedPolyclinic] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Default: Semua Status
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Audio Voice State
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modal Lewati Antrean
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [itemToSkip, setItemToSkip] = useState(null);

  const fetchPolyclinics = async () => {
    try {
      const res = await api.get('/polyclinics');
      if (res.success) setPolyclinics(res.data || []);
    } catch (e) {
      console.error('Error fetchPolyclinics:', e);
    }
  };

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/queues?polyclinic_id=${selectedPolyclinic}`);
      if (res.success) setQueues(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetchQueues:', e);
      setQueues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolyclinics();
  }, []);

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 10000);
    return () => clearInterval(interval);
  }, [selectedPolyclinic]);

  // Filter Search & Status Filter Client Side
  const safeQueues = Array.isArray(queues) ? queues : [];
  const filteredQueues = safeQueues.filter(item => {
    // Status Filter
    if (statusFilter && item.queue_status !== statusFilter) {
      return false;
    }

    // Search Filter
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item.queue_number?.toLowerCase().includes(s) ||
      item.patient_name?.toLowerCase().includes(s) ||
      item.medical_record_number?.toLowerCase().includes(s) ||
      item.doctor_name?.toLowerCase().includes(s)
    );
  });

  // Stats
  const waitingCount = filteredQueues.filter(q => q.queue_status === 'Menunggu').length;
  const callingQueue = filteredQueues.find(q => q.queue_status === 'Dipanggil');
  const servingCount = filteredQueues.filter(q => q.queue_status === 'Melayani').length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredQueues.length / ITEMS_PER_PAGE));
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayed = filteredQueues.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  // Fungsi Panggil Suara (Mengeja lengkap: A, 0, 0, 1)
  const speakQueue = (queueNumber, polyName) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Memisah karakter agar mengeja tepat per angka (Misal: A001 -> A, 0, 0, 1)
    const formattedCode = queueNumber.split('').join(', ');
    
    const textToSpeak = `Nomor antrean, ${formattedCode}, harap menuju ke ${polyName}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleCall = async (queue) => {
    try {
      const res = await api.put(`/queues/${queue.queue_id}/call`);
      if (res.success) {
        speakQueue(queue.queue_number, queue.polyclinic_name);
        fetchQueues();
      }
    } catch (e) {
      alert(e.message || 'Gagal memanggil antrean.');
    }
  };

  const handleOpenSkipModal = (queue) => {
    setItemToSkip(queue);
    setShowSkipModal(true);
  };

  const handleConfirmSkip = async () => {
    if (!itemToSkip) return;
    try {
      const res = await api.put(`/queues/${itemToSkip.queue_id}/skip`);
      if (res.success) {
        setShowSkipModal(false);
        setItemToSkip(null);
        fetchQueues();
      }
    } catch (e) {
      alert(e.message || 'Gagal melewati antrean.');
    }
  };

  const handleServe = async (queue) => {
    try {
      const res = await api.put(`/queues/${queue.queue_id}/serve`);
      if (res.success) fetchQueues();
    } catch (e) {
      alert(e.message || 'Gagal mengubah status pelayanan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">
            <ListOrdered className="w-4 h-4" />
            <span>Modul Operasional Loket & Antrean</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Kelola & Panggil Antrean Pasien</h1>
          <p className="text-slate-500 text-xs mt-1">Panggil nomor antrean loket dengan audio suara Bahasa Indonesia real-time.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              soundEnabled ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Suara Aktif' : 'Suara Mute'}</span>
          </button>

          <a
            href="/queue-display"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Monitor className="w-4 h-4" />
            <span>Buka Display TV Monitor</span>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Menunggu</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{waitingCount}</h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm flex items-center justify-between bg-purple-50/40">
          <div>
            <p className="text-xs text-purple-800 font-semibold uppercase tracking-wider">Sedang Dipanggil</p>
            <h3 className="text-2xl font-bold text-purple-900 font-mono mt-1">{callingQueue ? callingQueue.queue_number : '-'}</h3>
          </div>
          <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center animate-pulse">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dalam Pemeriksaan</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{servingCount}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Standard Queue Table Component */}
      <QueueTable
        displayed={displayed}
        loading={loading}
        search={search}
        setSearch={setSearch}
        selectedPolyclinic={selectedPolyclinic}
        setSelectedPolyclinic={setSelectedPolyclinic}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        polyclinics={polyclinics}
        totalCount={filteredQueues.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        indexOfFirst={indexOfFirst}
        onRefresh={fetchQueues}
        onCall={handleCall}
        onServe={handleServe}
        onSkip={handleOpenSkipModal}
      />

      {/* Modal Konfirmasi Lewati Antrean */}
      <QueueSkipModal
        show={showSkipModal}
        queue={itemToSkip}
        onConfirm={handleConfirmSkip}
        onClose={() => { setShowSkipModal(false); setItemToSkip(null); }}
      />
    </div>
  );
}
