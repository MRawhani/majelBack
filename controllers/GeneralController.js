const AddressModels = require("../models/AddressSchema");

exports.getGeneral = function (req, res, next) {
  AddressModels.find().exec(function (err, addresses) {
    if (err) {
      return next({
        type: "mongoose",
        err,
      });
      //   return MongooseErrors(res, err);
    }
   
    return res.status(200).json({
      success: true,
      addresses,
    });
  });
};
