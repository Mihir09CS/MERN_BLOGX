const AdminActionLog = require("../models/AdminActionLog");

const logAdminAction = async ({
  admin,
  action,
  targetType,
  targetId,
  meta = {},
}) => {
  await AdminActionLog.create({
    admin,
    action,
    targetType,
    targetId,
    meta,
  });
};

module.exports =  logAdminAction ;
