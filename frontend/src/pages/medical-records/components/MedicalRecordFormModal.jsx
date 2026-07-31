import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { FileText, X, AlertCircle, Plus, Trash2, Activity, Stethoscope, Pill, Check, Building2, User } from 'lucide-react';

export default function MedicalRecordFormModal({ show, patientData, medicines = [], onClose, onSuccess }) {
  const [procedures, setProcedures] = useState([]);
  const [loadingProcedures, setLoadingProcedures] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    subjective: '',
    blood_pressure: '',
    body_temperature: '',
    weight: '',
    height: '',
    assessment: '',
    plan: ''
  });

  // Dynamic Procedures Rows
  const [selectedProcedures, setSelectedProcedures] = useState([]);

  // Manual Procedure Modal State
  const [showManualProcedure, setShowManualProcedure] = useState(false);
  const [manualProcedureName, setManualProcedureName] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Dynamic Prescriptions Rows
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show && patientData) {
      setFormData({
        subjective: patientData.chief_complaint || '',
        blood_pressure: '',
        body_temperature: '',
        weight: '',
        height: '',
        assessment: '',
        plan: ''
      });
      setSelectedProcedures([]);
      setSelectedPrescriptions([]);
      setFormError('');
      fetchProceduresForPoli();
    }
  }, [show, patientData]);

  const fetchProceduresForPoli = async () => {
    if (!patientData) return;
    setLoadingProcedures(true);
    try {
      const polyId = patientData.polyclinic_id || '';
      const res = await api.get(`/procedures?polyclinic_id=${polyId}`);
      if (res.success) {
        setProcedures(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching procedures:', err);
    } finally {
      setLoadingProcedures(false);
    }
  };

  if (!show || !patientData) return null;

  // Add Procedure Row
  const handleAddProcedureRow = () => {
    setSelectedProcedures(prev => [...prev, { procedure_id: '', notes: '' }]);
  };

  const handleRemoveProcedureRow = (index) => {
    setSelectedProcedures(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcedureChange = (index, field, value) => {
    const updated = [...selectedProcedures];
    updated[index][field] = value;
    setSelectedProcedures(updated);
  };

  // Create Manual Procedure to Master Database for this Polyclinic
  const handleSaveManualProcedure = async (e) => {
    e.preventDefault();
    if (!manualProcedureName.trim() || !patientData) return;
    setManualSubmitting(true);
    try {
      const code = `TDK-${Date.now().toString().slice(-4)}`;
      const res = await api.post('/procedures', {
        code,
        name: manualProcedureName.trim(),
        polyclinic_id: patientData.polyclinic_id || null
      });

      if (res.success) {
        const newProc = res.data;
        setProcedures((prev) => [newProc, ...prev]);
        setSelectedProcedures((prev) => [...prev, { procedure_id: newProc.id, notes: '' }]);
        setManualProcedureName('');
        setShowManualProcedure(false);
      }
    } catch (err) {
      alert(err.message || 'Gagal menambahkan tindakan medis baru.');
    } finally {
      setManualSubmitting(false);
    }
  };

  // Add Prescription Row
  const handleAddPrescriptionRow = () => {
    setSelectedPrescriptions(prev => [...prev, { medicine_id: '', dosage: '3 x 1 Tablet', instructions: 'Sesudah makan' }]);
  };

  const handleRemovePrescriptionRow = (index) => {
    setSelectedPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...selectedPrescriptions];
    updated[index][field] = value;
    setSelectedPrescriptions(updated);
  };

  // Submit Form SOAP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!patientData) return;

    if (!formData.subjective.trim() || !formData.assessment.trim() || !formData.plan.trim()) {
      setFormError('Field Subjektif, Assessment (Diagnosa), dan Plan (Terapi) wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        registration_id: patientData?.registration_id,
        patient_id: patientData?.patient_id,
        subjective: formData.subjective,
        blood_pressure: formData.blood_pressure || null,
        body_temperature: formData.body_temperature || null,
        weight: formData.weight || null,
        height: formData.height || null,
        assessment: formData.assessment,
        plan: formData.plan,
        procedures: (Array.isArray(selectedProcedures) ? selectedProcedures : []).filter((p) => p && p.procedure_id),
        prescriptions: (Array.isArray(selectedPrescriptions) ? selectedPrescriptions : []).filter((m) => m && m.medicine_id && m.dosage && m.instructions)
      };

      const res = await api.post('/medical-records', payload);
      if (res.success) {
        onSuccess('Pemeriksaan SOAP berhasil disimpan dan status kunjungan Selesai!');
        onClose();
      }
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan rekam medis.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Stethoscope className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">Form Pemeriksaan Dokter (SOAP)</h3>
              <p className="text-blue-200 text-xs mt-0.5">
                {patientData?.patient_name || '-'} (No. RM: {patientData?.medical_record_number || '-'}) | {patientData?.polyclinic_name || '-'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Context Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 px-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 shrink-0">
          <div><span className="text-slate-400 block font-medium">Antrean</span><strong className="text-blue-900 font-mono text-sm font-bold">{patientData?.queue_number || '-'}</strong></div>
          <div><span className="text-slate-400 block font-medium">Jenis Bayar</span><strong className="text-slate-900 font-bold">{patientData?.payment_method || '-'}</strong></div>
          <div><span className="text-slate-400 block font-medium">Poliklinik</span><strong className="text-slate-900 font-bold">{patientData?.polyclinic_name || '-'}</strong></div>
          <div><span className="text-slate-400 block font-medium">Dokter Jaga</span><strong className="text-slate-900 font-bold">{patientData?.doctor_name || '-'}</strong></div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-900">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form id="soap-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Seksi 1: Vital Signs (Objective Physical) */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-700" /><span>1. Tanda-Tanda Vital & Pemeriksaan Fisik (Objective)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Tekanan Darah</label>
                  <input
                    type="text"
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                    placeholder="misal: 120/80 mmHg"
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Suhu Tubuh (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.body_temperature}
                    onChange={(e) => setFormData({ ...formData, body_temperature: e.target.value })}
                    placeholder="misal: 36.5"
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="misal: 65.0"
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="misal: 170.0"
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            </div>

            {/* Seksi 2: Catatan SOAP */}
            <div className="space-y-4">
              <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" /><span>2. Catatan Pemeriksaan Dokter (SOAP)</span>
              </h4>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Subjective (Keluhan Utama Pasien) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.subjective}
                  onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                  placeholder="Deskripsi keluhan pasien, riwayat penyakit..."
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-700"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Assessment (Diagnosa Dokter) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  placeholder="Diagnosa dokter (misal: Febris ec Infeksi Saluran Pernapasan Akut)..."
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-700"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Plan (Rencana Terapi & Tindak Lanjut) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  placeholder="Rencana terapi, instruksi istirahat, diet, atau kontrol ulang..."
                  className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-700"
                ></textarea>
              </div>
            </div>

            {/* Seksi 3: Input Tindakan Medis */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-700" /><span>3. Input Tindakan Medis ({patientData?.polyclinic_name || '-'})</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">Hanya menampilkan tindakan untuk {patientData?.polyclinic_name || '-'} & umum.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualProcedure(true)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-slate-300 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /><span>Ketik Manual</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProcedureRow}
                    className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /><span>Pilih dari Katalog</span>
                  </button>
                </div>
              </div>

              {selectedProcedures.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4 bg-white rounded-lg border border-dashed border-slate-300">
                  Belum ada tindakan medis yang dipilih. Klik tombol "+ Pilih dari Katalog" atau "+ Ketik Manual".
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedProcedures.map((row, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-300">
                      <select
                        value={row.procedure_id}
                        onChange={(e) => handleProcedureChange(index, 'procedure_id', e.target.value)}
                        className="flex-1 bg-white text-slate-900 font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-700 text-xs"
                      >
                        <option value="" className="text-slate-500">-- Pilih Jenis Tindakan --</option>
                        {procedures.map((p) => (
                          <option key={p.id} value={p.id} className="text-slate-900">
                            [{p.code}] {p.name} {p.polyclinic_name ? `(${p.polyclinic_name})` : '(Semua Poli)'}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleProcedureChange(index, 'notes', e.target.value)}
                        placeholder="Catatan tambahan tindakan..."
                        className="flex-1 bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-700 text-xs"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveProcedureRow(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        title="Hapus Baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seksi 4: Input Resep Obat */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-blue-700" /><span>4. Input Resep Obat Pasien</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">Pilih obat dari katalog master obat-obatan.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPrescriptionRow}
                  className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /><span>Tambah Obat</span>
                </button>
              </div>

              {selectedPrescriptions.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4 bg-white rounded-lg border border-dashed border-slate-300">
                  Belum ada resep obat yang ditambahkan. Klik tombol "+ Tambah Obat".
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedPrescriptions.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-slate-300 items-center">
                      <div className="sm:col-span-5">
                        <select
                          value={row.medicine_id}
                          onChange={(e) => handlePrescriptionChange(index, 'medicine_id', e.target.value)}
                          className="w-full bg-white text-slate-900 font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-700 text-xs"
                        >
                          <option value="" className="text-slate-500">-- Pilih Obat --</option>
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id} className="text-slate-900">
                              [{m.code}] {m.name} ({m.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={row.dosage}
                          onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                          placeholder="Dosis (misal: 3 x 1 Tablet)"
                          className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-700 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={row.instructions}
                          onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                          placeholder="Aturan (misal: Sesudah makan)"
                          className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-700 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePrescriptionRow(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Baris Obat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg cursor-pointer transition-colors text-xs">
            Batal
          </button>
          <button form="soap-form" type="submit" disabled={submitting} className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-50 text-xs flex items-center gap-1.5 shadow-xs">
            <Check className="w-4 h-4" /><span>{submitting ? 'Menyimpan SOAP...' : 'Simpan SOAP & Selesaikan Kunjungan'}</span>
          </button>
        </div>
      </div>

      {/* Modal Small Popup: Quick Manual Procedure Creator */}
      {showManualProcedure && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-[110]">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full shadow-2xl animate-scale-up">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Ketik Tindakan Medis Manual</h4>
            <p className="text-slate-500 text-xs mb-3">Tindakan ini akan otomatis disimpan ke katalog {patientData?.polyclinic_name || '-'}.</p>

            <form onSubmit={handleSaveManualProcedure} className="space-y-3 text-xs">
              <input
                type="text"
                value={manualProcedureName}
                onChange={(e) => setManualProcedureName(e.target.value)}
                placeholder="Nama tindakan (misal: Scaling Gigi Kompleks)"
                autoFocus
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 font-medium border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-700"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowManualProcedure(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting || !manualProcedureName.trim()}
                  className="px-4 py-1.5 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50"
                >
                  {manualSubmitting ? 'Menyimpan...' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
