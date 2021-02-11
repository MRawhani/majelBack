const MongooseErrHandler = require('./MongooseErrHandler')
module.exports = {
  MongooseErrors: function(res,err) {
    return res
      .status(422)
      .send({ errors: MongooseErrHandler.normalizeErrors(err.errors) });
  },
  customError: function(res, title, message) {
    return res
      .status(422)
      .send({ errors: [{ title: title, success: false, message: message }] });
  }
};
  