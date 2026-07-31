const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get All Medical Records (dengan Filter & Role-Aware)
 * Endpoint: GET /api/medical-records
 */
const getMedicalRecords = async (req, res) => {
  try {
    const search = req.query.search || '';
    const patient_id = req.query.patient_id || '';
    const registration_id = req.query.registration_id || '';

    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.medical_record_number LIKE ?)');
      const pattern = `%${search}%`;
      queryParams.push(pattern, pattern);
    }

    if (patient_id) {
      whereClauses.push('mr.patient_id = ?');
      queryParams.push(patient_id);
    }

    if (registration_id) {
      whereClauses.push('mr.registration_id = ?');
      queryParams.push(registration_id);
    }

    // Proteksi Otomatis: Jika user adalah Dokter, HANYA tampilkan rekam medis milik dokter tersebut
    if (req.user && req.user.role === 'Dokter') {
      whereClauses.push('r.doctor_id = ?');
      queryParams.push(req.user.id);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        mr.id,
        mr.registration_id,
        mr.patient_id,
        mr.subjective,
        mr.blood_pressure,
        mr.body_temperature,
        mr.weight,
        mr.height,
        mr.assessment,
        mr.plan,
        mr.created_at,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        p.birth_date,
        poly.name AS polyclinic_name,
        doc.name AS doctor_name,
        r.visit_date,
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number
      FROM medical_records mr
      JOIN registrations r ON mr.registration_id = r.id
      JOIN patients p ON mr.patient_id = p.id
      JOIN polyclinics poly ON r.polyclinic_id = poly.id
      JOIN users doc ON r.doctor_id = doc.id
      ${whereSql}
      ORDER BY mr.created_at DESC
    `;

    const [records] = await db.query(query, queryParams);

    return successResponse(res, records, 'Daftar rekam medis berhasil diambil.');
  } catch (error) {
    console.error('Error getMedicalRecords:', error);
    return errorResponse(res, 'Gagal mengambil daftar rekam medis.', error.message, 500);
  }
};

/**
 * Get Medical Record Detail (dengan Tindakan & Resep Obat)
 * Endpoint: GET /api/medical-records/:id
 */
const getMedicalRecordDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [mrRows] = await db.query(`
      SELECT 
        mr.id,
        mr.registration_id,
        mr.patient_id,
        mr.subjective,
        mr.blood_pressure,
        mr.body_temperature,
        mr.weight,
        mr.height,
        mr.assessment,
        mr.plan,
        mr.created_at,
        mr.updated_at,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        p.gender,
        p.birth_date,
        p.phone_number,
        p.address,
        poly.name AS polyclinic_name,
        doc.name AS doctor_name,
        r.visit_date,
        r.payment_method,
        r.chief_complaint,
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number
      FROM medical_records mr
      JOIN registrations r ON mr.registration_id = r.id
      JOIN patients p ON mr.patient_id = p.id
      JOIN polyclinics poly ON r.polyclinic_id = poly.id
      JOIN users doc ON r.doctor_id = doc.id
      WHERE mr.id = ?
    `, [id]);

    if (mrRows.length === 0) {
      return errorResponse(res, 'Rekam medis tidak ditemukan.', null, 404);
    }

    const medicalRecord = mrRows[0];

    const [procedures] = await db.query(`
      SELECT 
        pp.id,
        pp.procedure_id,
        proc.code AS procedure_code,
        proc.name AS procedure_name,
        pp.notes
      FROM patient_procedures pp
      JOIN procedures proc ON pp.procedure_id = proc.id
      WHERE pp.medical_record_id = ?
      ORDER BY pp.id ASC
    `, [id]);

    const [prescriptions] = await db.query(`
      SELECT 
        presc.id,
        presc.medicine_id,
        med.code AS medicine_code,
        med.name AS medicine_name,
        med.unit AS medicine_unit,
        presc.dosage,
        presc.instructions
      FROM patient_prescriptions presc
      JOIN medicines med ON presc.medicine_id = med.id
      WHERE presc.medical_record_id = ?
      ORDER BY presc.id ASC
    `, [id]);

    return successResponse(res, {
      ...medicalRecord,
      procedures,
      prescriptions
    }, 'Detail rekam medis berhasil diambil.');

  } catch (error) {
    console.error('Error getMedicalRecordDetail:', error);
    return errorResponse(res, 'Gagal mengambil detail rekam medis.', error.message, 500);
  }
};

/**
 * Get Patients Ready for Examination Today
 * Endpoint: GET /api/medical-records/ready
 */
const getPatientsReadyForExam = async (req, res) => {
  try {
    let whereClauses = [
      "(q.status IN ('Dipanggil', 'Melayani', 'Menunggu', 'Check In', 'Pemeriksaan', 'Calling', 'Serving', 'Waiting'))",
      "r.status != 'Cancelled'"
    ];
    let queryParams = [];

    if (req.user && req.user.role === 'Dokter') {
      whereClauses.push('r.doctor_id = ?');
      queryParams.push(req.user.id);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const [patients] = await db.query(`
      SELECT 
        q.id AS queue_id,
        q.queue_number,
        q.status AS queue_status,
        r.id AS registration_id,
        r.patient_id,
        r.chief_complaint,
        r.visit_date,
        r.payment_method,
        r.status AS registration_status,
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        p.birth_date,
        p.gender,
        poly.id AS polyclinic_id,
        poly.name AS polyclinic_name,
        doc.id AS doctor_id,
        doc.name AS doctor_name,
        (SELECT id FROM medical_records WHERE registration_id = r.id LIMIT 1) AS medical_record_id
      FROM queues q
      JOIN registrations r ON q.registration_id = r.id
      JOIN patients p ON r.patient_id = p.id
      JOIN polyclinics poly ON r.polyclinic_id = poly.id
      JOIN users doc ON r.doctor_id = doc.id
      ${whereSql}
      ORDER BY q.id ASC
    `, queryParams);

    return successResponse(res, patients, 'Daftar pasien siap diperiksa berhasil diambil.');
  } catch (error) {
    console.error('Error getPatientsReadyForExam:', error);
    return errorResponse(res, 'Gagal mengambil daftar pasien.', error.message, 500);
  }
};

/**
 * Create Medical Record (SOAP + Tindakan + Resep)
 * Endpoint: POST /api/medical-records
 */
const createMedicalRecord = async (req, res) => {
  try {
    const {
      registration_id,
      patient_id,
      subjective,
      blood_pressure,
      body_temperature,
      weight,
      height,
      assessment,
      plan,
      procedures = [],
      prescriptions = []
    } = req.body;

    if (!registration_id || !patient_id || !subjective || !assessment || !plan) {
      return errorResponse(res, 'Field wajib tidak lengkap (registration_id, patient_id, subjective, assessment, plan).', null, 400);
    }

    const [existing] = await db.query(
      'SELECT id FROM medical_records WHERE registration_id = ?',
      [registration_id]
    );
    if (existing.length > 0) {
      return errorResponse(res, 'Rekam medis untuk kunjungan ini sudah pernah dibuat.', null, 400);
    }

    const [insertResult] = await db.query(`
      INSERT INTO medical_records 
        (registration_id, patient_id, subjective, blood_pressure, body_temperature, weight, height, assessment, plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      registration_id, patient_id, subjective,
      blood_pressure || null, body_temperature || null,
      weight || null, height || null,
      assessment, plan
    ]);

    const medicalRecordId = insertResult.insertId;

    if (Array.isArray(procedures) && procedures.length > 0) {
      const procedureValues = procedures
        .filter(p => p.procedure_id)
        .map(p => [medicalRecordId, p.procedure_id, p.notes || null]);
      if (procedureValues.length > 0) {
        await db.query(
          'INSERT INTO patient_procedures (medical_record_id, procedure_id, notes) VALUES ?',
          [procedureValues]
        );
      }
    }

    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      const prescriptionValues = prescriptions
        .filter(p => p.medicine_id && p.dosage && p.instructions)
        .map(p => [medicalRecordId, p.medicine_id, p.dosage, p.instructions]);
      if (prescriptionValues.length > 0) {
        await db.query(
          'INSERT INTO patient_prescriptions (medical_record_id, medicine_id, dosage, instructions) VALUES ?',
          [prescriptionValues]
        );
      }
    }

    await db.query(
      "UPDATE registrations SET status = 'Selesai' WHERE id = ?",
      [registration_id]
    );
    await db.query(
      "UPDATE queues SET status = 'Selesai' WHERE registration_id = ?",
      [registration_id]
    );

    return successResponse(res, { id: medicalRecordId }, 'Rekam medis berhasil disimpan dan kunjungan dinyatakan Selesai.', 201);

  } catch (error) {
    console.error('Error createMedicalRecord:', error);
    return errorResponse(res, 'Gagal menyimpan rekam medis.', error.message, 500);
  }
};

/**
 * Update Medical Record
 * Endpoint: PUT /api/medical-records/:id
 */
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subjective, blood_pressure, body_temperature,
      weight, height, assessment, plan,
      procedures = [], prescriptions = []
    } = req.body;

    const [existing] = await db.query('SELECT id FROM medical_records WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Rekam medis tidak ditemukan.', null, 404);
    }

    await db.query(`
      UPDATE medical_records 
      SET subjective = ?, blood_pressure = ?, body_temperature = ?,
          weight = ?, height = ?, assessment = ?, plan = ?
      WHERE id = ?
    `, [subjective, blood_pressure || null, body_temperature || null,
        weight || null, height || null, assessment, plan, id]);

    await db.query('DELETE FROM patient_procedures WHERE medical_record_id = ?', [id]);
    if (Array.isArray(procedures) && procedures.length > 0) {
      const procedureValues = procedures
        .filter(p => p.procedure_id)
        .map(p => [id, p.procedure_id, p.notes || null]);
      if (procedureValues.length > 0) {
        await db.query(
          'INSERT INTO patient_procedures (medical_record_id, procedure_id, notes) VALUES ?',
          [procedureValues]
        );
      }
    }

    await db.query('DELETE FROM patient_prescriptions WHERE medical_record_id = ?', [id]);
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      const prescriptionValues = prescriptions
        .filter(p => p.medicine_id && p.dosage && p.instructions)
        .map(p => [id, p.medicine_id, p.dosage, p.instructions]);
      if (prescriptionValues.length > 0) {
        await db.query(
          'INSERT INTO patient_prescriptions (medical_record_id, medicine_id, dosage, instructions) VALUES ?',
          [prescriptionValues]
        );
      }
    }

    return successResponse(res, { id }, 'Rekam medis berhasil diperbarui.');
  } catch (error) {
    console.error('Error updateMedicalRecord:', error);
    return errorResponse(res, 'Gagal memperbarui rekam medis.', error.message, 500);
  }
};

/**
 * Delete Medical Record
 * Endpoint: DELETE /api/medical-records/:id
 */
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM medical_records WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Rekam medis tidak ditemukan.', null, 404);
    }

    await db.query('DELETE FROM medical_records WHERE id = ?', [id]);

    return successResponse(res, null, 'Rekam medis berhasil dihapus.');
  } catch (error) {
    console.error('Error deleteMedicalRecord:', error);
    return errorResponse(res, 'Gagal menghapus rekam medis.', error.message, 500);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordDetail,
  getPatientsReadyForExam,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};
