/**
 * 03_Auth.gs — Xác thực & phân quyền.
 *  - Web App chạy USER_ACCESSING: Session.getActiveUser() trả email người đang mở app.
 *  - Chỉ email có trong LSB_Staff với Active = Y mới vào được.
 *  - Access_level: Viewer (xem) · Editor (thêm/sửa) · Admin (+ xóa, sửa LSB_Staff / LSB_Task).
 */

var AUTH_USER_ = null;

/** Người dùng hiện tại (đọc LSB_Staff). Ném AUTH nếu không có quyền vào app. */
function Auth_currentUser_() {
  if (AUTH_USER_) return AUTH_USER_;
  var email = '';
  try { email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase(); } catch (e) { email = ''; }
  if (!email) {
    throw AppError_('AUTH', L_('Không đọc được email tài khoản Google của bạn. Hãy đăng nhập Google và chắc chắn bạn đã được chia sẻ Google Sheet dữ liệu.', 'Could not read your Google account email. Sign in to Google and make sure the data Google Sheet is shared with you.'));
  }
  var staff = Data_all_('LSB_Staff').filter(function (s) {
    return String(s.Email).trim().toLowerCase() === email;
  })[0];
  if (!staff) throw AppError_('AUTH', 'Email ' + email + L_(' chưa có trong LSB_Staff. Liên hệ Admin để được thêm.', ' is not in LSB_Staff. Ask an Admin to add you.'));
  if (String(staff.Active).toUpperCase() !== 'Y') throw AppError_('AUTH', L_('Tài khoản ', 'Account ') + email + L_(' đang tạm khóa (Active = N).', ' is suspended (Active = N).'));
  var role = ROLE_LEVEL[staff.Access_level] ? staff.Access_level : 'Viewer';
  AUTH_USER_ = {
    email: email,
    staffId: staff.Staff_id,
    name: staff.Full_name || email,
    role: role,
    jobRole: staff.Role || '',
    level: ROLE_LEVEL[role]
  };
  return AUTH_USER_;
}

/** Đủ quyền tối thiểu minRole? */
function Auth_can_(user, minRole) {
  return !!user && user.level >= (ROLE_LEVEL[minRole] || 99);
}

/** Ném FORBIDDEN nếu không đủ quyền. */
function Auth_require_(user, minRole, actionLabel) {
  if (!Auth_can_(user, minRole)) {
    throw AppError_('FORBIDDEN', L_('Cần quyền ', 'Requires ') + minRole + L_(' để ', ' access to ') + (actionLabel || L_('thực hiện thao tác này', 'do this')) +
      L_(' (quyền của bạn: ', ' (your access: ') + (user ? user.role : '—') + ').');
  }
}

/** Quyền ghi theo bảng: danh mục cần Admin, còn lại Editor. */
function Auth_requireWrite_(user, table) {
  if (CATALOG_TABLES.indexOf(table) >= 0) Auth_require_(user, PERMISSION.CATALOG_WRITE, L_('sửa danh mục ', 'edit catalog ') + table);
  else Auth_require_(user, PERMISSION.WRITE, L_('thêm/sửa dữ liệu', 'add/edit data'));
}

/** Danh sách quyền gửi xuống client để ẩn/hiện nút. */
function Auth_capabilities_(user) {
  return {
    read: Auth_can_(user, PERMISSION.READ),
    write: Auth_can_(user, PERMISSION.WRITE),
    del: Auth_can_(user, PERMISSION.DELETE),
    catalog: Auth_can_(user, PERMISSION.CATALOG_WRITE),
    activity: Auth_can_(user, PERMISSION.ACTIVITY_READ)
  };
}
