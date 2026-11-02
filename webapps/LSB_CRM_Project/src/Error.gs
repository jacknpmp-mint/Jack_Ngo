/**
 * Error.gs — Lỗi nghiệp vụ thống nhất + bọc phản hồi API.
 * Mọi hàm gọi từ giao diện đi qua Error_wrap_() nên trình duyệt luôn nhận
 * { ok: true, data } hoặc { ok: false, error: { code, message, details } }.
 */

var ERROR_CODES = {
  AUTH: ['Chưa xác định được người dùng', 'User not identified'],
  FORBIDDEN: ['Không đủ quyền', 'Not allowed'],
  NOT_FOUND: ['Không tìm thấy dữ liệu', 'Data not found'],
  VALIDATION: ['Dữ liệu chưa hợp lệ', 'Invalid data'],
  CONFLICT: ['Xung đột dữ liệu', 'Data conflict'],
  MODULE_DISABLED: ['Chức năng chưa kích hoạt', 'Feature not enabled'],
  STRUCTURE: ['Cấu trúc Google Sheet không khớp cấu hình', 'Google Sheet structure does not match the configuration'],
  LOCK: ['Hệ thống đang bận, thử lại sau vài giây', 'System busy, try again in a few seconds'],
  INTERNAL: ['Lỗi hệ thống', 'System error']
};

/** Thông điệp mặc định của mã lỗi theo ngôn ngữ hiện tại (v2.5: [vi, en]). */
function Error_text_(code) {
  var m = ERROR_CODES[code];
  return m ? L_(m[0], m[1]) : code;
}

/** Tạo lỗi nghiệp vụ. details: dữ liệu phụ (vd danh sách lỗi theo cột). */
function AppError_(code, message, details) {
  var e = new Error(message || Error_text_(code));
  e.appCode = ERROR_CODES[code] ? code : 'INTERNAL';
  if (details !== undefined) e.details = details;
  return e;
}

/** Chạy fn, chuẩn hóa kết quả/lỗi để trả về client. */
function Error_wrap_(fn, context) {
  try {
    return { ok: true, data: fn() };
  } catch (e) {
    var code = e && e.appCode ? e.appCode : 'INTERNAL';
    if (code === 'INTERNAL') {
      console.error('[LSB] ' + (context || '') + ' — ' + (e && e.stack ? e.stack : e));
    }
    return {
      ok: false,
      error: {
        code: code,
        message: code === 'INTERNAL' ? Error_text_('INTERNAL') + ': ' + (e && e.message ? e.message : e) : e.message,
        details: e && e.details !== undefined ? e.details : null
      }
    };
  }
}

/** Ném lỗi VALIDATION nếu danh sách lỗi không rỗng. */
function Error_throwIfErrors_(errors) {
  if (errors && errors.length) {
    var msg = errors.map(function (x) { return (x.field ? x.field + ': ' : '') + x.message; }).join(' · ');
    throw AppError_('VALIDATION', msg, errors);
  }
}
