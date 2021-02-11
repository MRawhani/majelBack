const MongooseErrHandler = require("./../helpers/MongooseErrHandler");

module.exports = function(err, req, res, next) {
  
  if (err.type === "check") {
    err =
      err.err.errmsg && err.err.errmsg.split(" ")[0] === "E11000"
        ? { type: "custom", title: "مكرر", message: "الاسم مكرر" }
        : err.err.name === "CastError"
        ? { type: "", err: err.err }
        : { type: "mongoose", err: err.err };
  }
  if (err.type === "custom") {
    return res.status(err.status ? err.status : 422).send({
      success: false,
      errors: [{ name: err.title, message: err.message }]
    });
  } else if (err.type === "mongoose") {
    return res
      .status(err.status ? err.status : 422)
      .send({ errors: MongooseErrHandler.normalizeErrors(err.err.errors) });
  } else if (err.status >= 400 && err.status <= 500) {
    return res.status(err.status).send({ success: false, errors:[err.err]  });
  } else {
    return res.status(500).send({
      success: false,
      errors: err.message
        ? formError(err.message)
        : err.err
        ? formError(err.err.message)
        : err
    });
  }
};

function formError(message, title = "خطأ") {
  return [{ name: title, message: message }];
}
