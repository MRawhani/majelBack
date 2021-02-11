const { MongooseErrors, customError } = require("../helpers/ErrorShow");
exports.isAdmin = function(req, res, next) {
  const user = res.locals.user;
  if (user.role === 0) {
    return customError(res, "NOTADMIN", "انت لست مسؤول");
  }
  next();
};
