import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { History, X, Calendar, User, Building2, ChevronDown, ChevronUp, FileText, Stethoscope, Pill, RefreshCw } from 'lucide-react';

export default function PatientHistoryModal({ show, patient, onClose }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (show && patient?.id) {
      fetchHistory();
    }
  }, [show, patient]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/medical-records?patient_id=${patient.id}`);
      if (res.success) {
        setHistoryList(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching patient history:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Fetch details if not loaded
      const target = historyList.find((h) => h.id === id);
      if (target && !target.detailsLoaded) {
        try {
          const res = await api.get(`/medical-records/${id}`);
          if (res.success) {
            setHistoryList((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, ...res.data, detailsLoaded: true }
                  : item
              )
            );
          }
        } catch (err) {
          console.error('Error fetching history detail:', err);
        }
      }
    }
  };

  if (!show || !patient) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">Riwayat Rekam Medis Pasien</h3>
              <p className="text-white/80 text-xs mt-0.5 font-mono">
                {patient.name} | RM: {patient.medical_record_number}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Memuat riwayat rekam medis pasien...</p>
            </div>
          ) : historyList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Rekam Medis</p>
              <p className="text-xs text-slate-400 mt-1">Pasien ini belum memiliki riwayat pemeriksaan sebelumnya.</p>
            </div>
          ) : (
            historyList.map((item, index) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all">
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-blue-100 text-blue-800 font-bold rounded-lg flex items-center justify-center text-xs font-mono shrink-0">
                        #{historyList.length - index}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.polyclinic_name}</span>
                          <span className="text-slate-400 font-mono">({item.registration_number})</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.doctor_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-semibold text-xs hidden sm:inline">
                        {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-4 animate-fade-in">
                      {/* Vital Signs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 text-center">
                        <div><span className="text-slate-400 block text-[10px]">Tekanan Darah</span><strong className="text-slate-800">{item.blood_pressure || '-'}</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Suhu</span><strong className="text-slate-800">{item.body_temperature ? `${item.body_temperature} °C` : '-'}</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Berat Badan</span><strong className="text-slate-800">{item.weight ? `${item.weight} kg` : '-'}</strong></div>
                        <div><span className="text-slate-400 block text-[10px]">Tinggi Badan</span><strong className="text-slate-800">{item.height ? `${item.height} cm` : '-'}</strong></div>
                      </div>

                      {/* SOAP Summary */}
                      <div className="space-y-2">
                        <div className="p-2.5 bg-slate-50 rounded-lg">
                          <span className="font-bold text-blue-900 block text-[11px]">Subjective (Keluhan)</span>
                          <p className="text-slate-700 mt-0.5">{item.subjective}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg">
                          <span className="font-bold text-blue-900 block text-[11px]">Assessment (Diagnosa)</span>
                          <p className="text-slate-800 font-semibold mt-0.5">{item.assessment}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg">
                          <span className="font-bold text-blue-900 block text-[11px]">Plan (Terapi)</span>
                          <p className="text-slate-700 mt-0.5">{item.plan}</p>
                        </div>
                      </div>

                      {/* Procedures */}
                      {item.procedures && item.procedures.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-800 block mb-1 text-[11px] flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-700" />Tindakan Medis:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-700">
                            {item.procedures.map((p, i) => (
                              <li key={i}><strong>{p.procedure_name}</strong> {p.notes ? `- ${p.notes}` : ''}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Prescriptions */}
                      {item.prescriptions && item.prescriptions.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-800 block mb-1 text-[11px] flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5 text-blue-700" />Resep Obat:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-700">
                            {item.prescriptions.map((m, i) => (
                              <li key={i}>
                                <strong>{m.medicine_name}</strong> ({m.dosage}) - <span className="text-slate-500">{m.instructions}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg cursor-pointer transition-colors text-xs">
            Tutup Riwayat
          </button>
        </div>
      </div>
    </div>
  );
}
