const { MongooseErrors, customError } = require("../helpers/ErrorShow");
const CompanyModel = require("../models/CompanyModel");

module.exports = function(Model) {
  return function(req, res, next) {
    const company = res.locals.user;

    Model.findById(company.category._id, function(err, category) {
      if (err) {
      }
      if (!category) {
        return next({
          type: "custom",
          title: "غير مصرح",
          status: 401,
          message: "تحتاج لأن تكون مصرحاُ للقيام بالعملية"
        });
      }
    });
  };
};
