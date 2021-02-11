const CompanyModel = require("../models/CompaniesModel");

exports.registerCompany = function (req, res, next) {
  const {
    name,
    email,
    password,
    username,

    phones,
    address,
  } = req.body;
  if (
    name === "" ||
    email === "" ||
    password === "" ||
    username === "" ||
    phones === "" ||
    address === ""
  ) {
    return next({
      type: "custom",
      title: "حقول فارغة",
      message: " املأ جميع الحقول",
    });
    // return customError(res, "حقول فارغة", " املأ جميع الحقول");
  }  else {
    CompanyModel.findOne()
      .or([{ email: req.body.email }, { name: req.body.name }])
      .exec(function (err, existingCompany) {
        if (err) {
          return next({
            type: "mongoose",
            err,
          });
          //   return MongooseErrors(res, err);
        }
        if (existingCompany) {
          return next({
            type: "custom",
            title: "الشركة موجودة",
            message: " الشركة  موجودة مسبقاً",
          });
        }
        const company = new CompanyModel(req.body);

        company.save((err, company) => {
          if (err) {
            return next({
              type: "check",
              err,
            });
            //return MongooseErrors(res, err);
          }
          company.generateToken((err, company) => {
            if (err) {
              return next({
                type: "mongoose",
                err,
              });
            }
            return res.status(200).json({
              success: true,
              token: company.token,
            });
          });
        });
      });
  }
};
exports.login =  function (req, res, next) {
      if (req.body.email === "" || req.body.password === "") {
        return next({
          type: "custom",
          title: "حقول فارغة",
          message: " املأ جميع الحقول",
        });
        // return customError(res, "حقول فارغة", " املأ جميع الحقول");
      }
      CompanyModel.findOne()
        .or([{ email: req.body.email }, { username: req.body.email }])
        .exec(function (err, company) {
          if (err) {
            return next({
              type: "mongoose",
              err,
            });
          }
          if (!company) {
            return next({
              type: "custom",
              title: "الشركة",
              message: " الشركة غير موجود",
            });
          }
          company.comparePasswords(req.body.password, function (err, isMatch) {
            if (err) {
              return next({
                type: "",
                err,
              });
            }
            if (!isMatch) {
              return next({
                type: "custom",
                title: "كلمة السر",
                message: "كلمة السر غير صحيحة",
              });
            }
  
            company.generateToken((err, company) => {
              if (err) {
                return next({
                  type: "mongoose",
                  err,
                });
              }
              return res.status(200).json({
                success: true,
                token: company.token,
              });
            });
          });
        });
    };
  
