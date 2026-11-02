/**
 * 09_User.gs — Module Người dùng & danh mục: LSB_Staff (tài khoản, phân quyền), LSB_Task.
 * Chỉ Admin được sửa (PERMISSION.CATALOG_WRITE). Bảo vệ để app luôn còn ≥ 1 Admin.
 */

function User_me_(user) {
  return { user: user, caps: Auth_capabilities_(user) };
}

function User_activeAdmins_(excludeId) {
  return Data_all_('LSB_Staff').filter(function (s) {
    return s.Access_level === 'Admin' && String(s.Active).toUpperCase() === 'Y' && s.Staff_id !== excludeId;
  });
}

function User_hooks_() {
  return {
    LSB_Staff: {
      beforeSave: function (rec, ctx) {
        rec.Active = String(rec.Active || 'Y').toUpperCase();
        var losesAdmin = ctx.old && ctx.old.Access_level === 'Admin' &&
          (rec.Access_level !== 'Admin' || rec.Active !== 'Y');
        if (losesAdmin && !User_activeAdmins_(rec.Staff_id).length) {
          throw AppError_('VALIDATION', L_('Phải còn ít nhất 1 Admin đang hoạt động.', 'At least 1 active Admin must remain.'),
            [{ field: 'Access_level', message: L_('không thể bỏ Admin cuối cùng', 'cannot remove the last Admin') }]);
        }
        if (ctx.user && ctx.old && ctx.old.Staff_id === ctx.user.staffId && losesAdmin) {
          ctx.warnings.push(L_('Bạn vừa tự hạ quyền của chính mình — tải lại app để áp dụng.', 'You just lowered your own access — reload the app to apply it.'));
        }
      },
      beforeDelete: function (old, ctx) {
        if (ctx.user && old.Staff_id === ctx.user.staffId) {
          throw AppError_('CONFLICT', L_('Không thể tự xóa tài khoản của chính mình.', 'You cannot delete your own account.'));
        }
        if (old.Access_level === 'Admin' && !User_activeAdmins_(old.Staff_id).length) {
          throw AppError_('CONFLICT', L_('Không thể xóa Admin cuối cùng.', 'Cannot delete the last Admin.'));
        }
      }
    },
    LSB_Task: {
      beforeSave: function (rec) {
        rec.Active = String(rec.Active || 'Y').toUpperCase();
      }
    }
  };
}
