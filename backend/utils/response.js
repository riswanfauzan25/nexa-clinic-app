/**
 * Helper Standar Response API sesuai Spesifikasi Take Home Test
 */

/**
 * Format Response Sukses
 * @param {Object} res - Express response object
 * @param {Any} data - Data payload yang ingin dikembalikan
 * @param {String} message - Pesan sukses
 * @param {Number} statusCode - HTTP status code (Default: 200)
 */
const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Format Response Error
 * @param {Object} res - Express response object
 * @param {String} message - Pesan deskripsi error
 * @param {Any} errors - Detail objek error/validasi
 * @param {Number} statusCode - HTTP status code (Default: 400)
 */
const errorResponse = (res, message = 'Error', errors = null, statusCode = 400) => {
  const responsePayload = {
    success: false,
    message
  };

  if (errors !== null) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  errorResponse
};
