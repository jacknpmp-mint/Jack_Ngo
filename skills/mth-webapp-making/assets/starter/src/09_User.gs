/**
 * 09_User.gs — Module Người dùng & danh mục: bảng nhân sự APP.STAFF.table (tài khoản, phân quyền)
 * và các bảng danh mục có cột Active (Y/N). Chỉ Admin được sửa (PERMISSION.CATALOG_WRITE).
 * Bảo vệ để app luôn còn ≥ 1 Admin đang hoạt động.
 */

function User_me_(user) {
  return { user: user, caps: Auth_capabilities_(user) };
}

function User_activeAdmins_(excludeId) {
  var S = APP.STAFF;
  return Data_all_(S.table).filter(function (s) {
    return s[S.access] === 'Admin' && String(s[S.active]).toUpperCase() === 'Y' && s[S.id] !== excludeId;
  });
}

function User_hooks_() {
  var S = APP.STAFF, out = {};
  CATALOG_TABLES.forEach(function (t) {
    if (!SCHEMA[t] || !SCHEMA[t].columns.some(function (c) { return c.name === 'Active'; })) return;
    out[t] = { beforeSave: function (rec) { rec.Active = String(rec.Active || 'Y').toUpperCase(); } };
  });
  if (!SCHEMA[S.table]) return out;
  out[S.table] = {
    beforeSave: function (rec, ctx) {
      rec[S.active] = String(rec[S.active] || 'Y').toUpperCase();
      var losesAdmin = ctx.old && ctx.old[S.access] === 'Admin' &&
        (rec[S.access] !== 'Admin' || rec[S.active] !== 'Y');
      if (losesAdmin && !User_activeAdmins_(rec[S.id]).length) {
        throw AppError_('VALIDATION', L_('Phải còn ít nhất 1 Admin đang hoạt động.', 'At least 1 active Admin must remain.'),
          [{ field: S.access, message: L_('không thể bỏ Admin cuối cùng', 'cannot remove the last Admin') }]);
      }
      if (ctx.user && ctx.old && ctx.old[S.id] === ctx.user.staffId && losesAdmin) {
        ctx.warnings.push(L_('Bạn vừa tự hạ quyền của chính mình — tải lại app để áp dụng.', 'You just lowered your own access — reload the app to apply it.'));
      }
    },
    beforeDelete: function (old, ctx) {
      if (ctx.user && old[S.id] === ctx.user.staffId) {
        throw AppError_('CONFLICT', L_('Không thể tự xóa tài khoản của chính mình.', 'You cannot delete your own account.'));
      }
      if (old[S.access] === 'Admin' && !User_activeAdmins_(old[S.id]).length) {
        throw AppError_('CONFLICT', L_('Không thể xóa Admin cuối cùng.', 'Cannot delete the last Admin.'));
      }
    }
  };
  return out;
}
