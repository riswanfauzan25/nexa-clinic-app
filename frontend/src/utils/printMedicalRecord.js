/**
 * Helper utility to generate & print official Resume Medis & Prescription document
 */
export const printMedicalRecord = (record) => {
  if (!record) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir oleh browser. Harap izinkan pop-up untuk mencetak resume medis.');
    return;
  }

  const visitDateFormatted = record.visit_date
    ? new Date(record.visit_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-';

  const proceduresHtml = record.procedures && record.procedures.length > 0 ? `
    <div class="section-title">3. Tindakan Medis</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 100px;">Kode</th>
          <th>Nama Tindakan</th>
          <th>Catatan</th>
        </tr>
      </thead>
      <tbody>
        ${record.procedures.map(p => `
          <tr>
            <td><strong>${p.procedure_code}</strong></td>
            <td>${p.procedure_name}</td>
            <td>${p.notes || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  const prescriptionsHtml = record.prescriptions && record.prescriptions.length > 0 ? `
    <div class="section-title">4. Resep Obat</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 100px;">Kode</th>
          <th>Nama Obat</th>
          <th>Dosis</th>
          <th>Aturan Minum</th>
        </tr>
      </thead>
      <tbody>
        ${record.prescriptions.map(m => `
          <tr>
            <td><strong>${m.medicine_code}</strong></td>
            <td>${m.medicine_name} (${m.medicine_unit})</td>
            <td><strong>${m.dosage}</strong></td>
            <td>${m.instructions}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Resume Medis Pasien - ${record.patient_name}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; font-size: 12px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { margin: 0; font-size: 18px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 3px 0 0 0; font-size: 11px; color: #64748b; }
          .title { text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 16px; text-transform: uppercase; text-decoration: underline; color: #0f172a; }
          .patient-box { width: 100%; border: 1px solid #cbd5e1; border-collapse: collapse; margin-bottom: 16px; }
          .patient-box td { padding: 6px 10px; border: 1px solid #cbd5e1; font-size: 11px; }
          .label { font-weight: bold; color: #475569; width: 130px; background: #f8fafc; }
          .section-title { font-size: 11px; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 16px; margin-bottom: 8px; }
          .vital-grid { display: flex; gap: 12px; margin-bottom: 12px; }
          .vital-card { flex: 1; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; text-align: center; background: #f8fafc; }
          .vital-card span { display: block; font-size: 10px; color: #64748b; font-weight: bold; }
          .vital-card strong { font-size: 12px; color: #0f172a; }
          .soap-box { border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; background: #fafafa; }
          .soap-box strong { color: #1e3a8a; display: block; margin-bottom: 3px; font-size: 10px; text-transform: uppercase; }
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 12px; }
          table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-size: 11px; }
          table.data-table th { background-color: #f1f5f9; font-weight: bold; color: #334155; }
          .signature { margin-top: 35px; float: right; text-align: center; width: 200px; }
          .signature p { margin-top: 55px; font-weight: bold; text-decoration: underline; }
          @media print {
            body { margin: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NEXA CLINIC MEDICAL CENTER</h1>
          <p>Jl. Raya Kesehatan No. 123, Bandung | Telp: (022) 7890-1234 | Email: info@nexaclinic.com</p>
        </div>

        <div class="title">RESUME REKAM MEDIS & RESEP PASIEN</div>

        <table class="patient-box">
          <tr>
            <td class="label">Nama Pasien</td>
            <td><strong>${record.patient_name}</strong></td>
            <td class="label">No. Rekam Medis</td>
            <td><strong>${record.medical_record_number}</strong></td>
          </tr>
          <tr>
            <td class="label">No. Registrasi</td>
            <td>${record.registration_number || '-'}</td>
            <td class="label">Tgl. Kunjungan</td>
            <td>${visitDateFormatted}</td>
          </tr>
          <tr>
            <td class="label">Poliklinik</td>
            <td>${record.polyclinic_name || '-'}</td>
            <td class="label">Dokter Pemeriksa</td>
            <td>${record.doctor_name || '-'}</td>
          </tr>
        </table>

        <div class="section-title">1. Tanda-Tanda Vital & Pemeriksaan Fisik</div>
        <div class="vital-grid">
          <div class="vital-card"><span>TEKANAN DARAH</span><strong>${record.blood_pressure || '-'}</strong></div>
          <div class="vital-card"><span>SUHU TUBUH</span><strong>${record.body_temperature ? record.body_temperature + ' °C' : '-'}</strong></div>
          <div class="vital-card"><span>BERAT BADAN</span><strong>${record.weight ? record.weight + ' kg' : '-'}</strong></div>
          <div class="vital-card"><span>TINGGI BADAN</span><strong>${record.height ? record.height + ' cm' : '-'}</strong></div>
        </div>

        <div class="section-title">2. Catatan Pemeriksaan Dokter (SOAP)</div>
        <div class="soap-box">
          <strong>Subjective (Keluhan Utama):</strong>
          <div>${record.subjective || '-'}</div>
        </div>
        <div class="soap-box">
          <strong>Assessment (Diagnosa Dokter):</strong>
          <div><strong>${record.assessment || '-'}</strong></div>
        </div>
        <div class="soap-box">
          <strong>Plan (Rencana Terapi & Instruksi):</strong>
          <div>${record.plan || '-'}</div>
        </div>

        ${proceduresHtml}

        ${prescriptionsHtml}

        <div class="signature">
          <p>Dokter Pemeriksa,</p>
          <p>(${record.doctor_name || 'Dokter Pemeriksa'})</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
