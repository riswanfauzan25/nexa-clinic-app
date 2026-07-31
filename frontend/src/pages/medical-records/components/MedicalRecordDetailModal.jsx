import { X, FileText, Activity, Stethoscope, Pill, Calendar, User, Building2, Printer } from 'lucide-react';
import { printMedicalRecord } from '../../../utils/printMedicalRecord';

export default function MedicalRecordDetailModal({ show, record, onClose }) {
  if (!show || !record) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">Detail Rekam Medis Pasien</h3>
              <p className="text-white/80 text-xs mt-0.5 font-mono">{record.registration_number || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Patient Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 block font-medium">Nama Pasien</span>
              <strong className="text-slate-900 font-bold text-sm block mt-0.5">{record.patient_name}</strong>
              <span className="text-slate-500 font-mono">RM: {record.medical_record_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Poliklinik</span>
              <span className="inline-flex items-center gap-1 font-bold text-blue-800 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />{record.polyclinic_name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Dokter Pemeriksa</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-500" />{record.doctor_name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Tanggal Kunjungan</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {record.visit_date ? new Date(record.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </span>
            </div>
          </div>

          {/* Vital Signs (Objective Physical) */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-blue-800">
              <Activity className="w-4 h-4" /><span>Tanda-Tanda Vital & Fisik (Objective)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">Tekanan Darah</span>
                <strong className="text-slate-900 text-sm font-bold block mt-0.5">{record.blood_pressure || '-'}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">Suhu Tubuh</span>
                <strong className="text-slate-900 text-sm font-bold block mt-0.5">{record.body_temperature ? `${record.body_temperature} °C` : '-'}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">Berat Badan</span>
                <strong className="text-slate-900 text-sm font-bold block mt-0.5">{record.weight ? `${record.weight} kg` : '-'}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="text-slate-400 block text-[11px]">Tinggi Badan</span>
                <strong className="text-slate-900 text-sm font-bold block mt-0.5">{record.height ? `${record.height} cm` : '-'}</strong>
              </div>
            </div>
          </div>

          {/* Catatan SOAP */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-800">
              <FileText className="w-4 h-4" /><span>Catatan Pemeriksaan (SOAP)</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1">Subjective (Keluhan Utama Pasien)</span>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">{record.subjective || '-'}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1">Assessment (Diagnosa Dokter)</span>
                <p className="text-slate-800 font-semibold whitespace-pre-line leading-relaxed">{record.assessment || '-'}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1">Plan (Rencana Terapi & Tindakan)</span>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">{record.plan || '-'}</p>
              </div>
            </div>
          </div>

          {/* Tindakan Medis */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-blue-800">
              <Stethoscope className="w-4 h-4" /><span>Tindakan Medis yang Diberikan</span>
            </h4>
            {record.procedures && record.procedures.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 pl-4">Kode</th>
                      <th className="p-2.5">Nama Tindakan</th>
                      <th className="p-2.5">Catatan Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {record.procedures.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 pl-4 font-mono text-blue-800 font-bold">{p.procedure_code}</td>
                        <td className="p-2.5 font-bold text-slate-800">{p.procedure_name}</td>
                        <td className="p-2.5 text-slate-600">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">Tidak ada rincian tindakan medis.</p>
            )}
          </div>

          {/* Resep Obat */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-blue-800">
              <Pill className="w-4 h-4" /><span>Resep Obat & Dosis Pasien</span>
            </h4>
            {record.prescriptions && record.prescriptions.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 pl-4">Kode</th>
                      <th className="p-2.5">Nama Obat</th>
                      <th className="p-2.5">Dosis</th>
                      <th className="p-2.5">Aturan Minum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {record.prescriptions.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 pl-4 font-mono text-blue-800 font-bold">{m.medicine_code}</td>
                        <td className="p-2.5 font-bold text-slate-800">{m.medicine_name} <span className="text-slate-400 font-normal">({m.medicine_unit})</span></td>
                        <td className="p-2.5 font-semibold text-emerald-700">{m.dosage}</td>
                        <td className="p-2.5 text-slate-600">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">Tidak ada resep obat.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button
            onClick={() => printMedicalRecord(record)}
            className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Resume Medis & Resep</span>
          </button>
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg cursor-pointer transition-colors text-xs">
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
