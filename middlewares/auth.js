const MongooseErrHandler = require("../helpers/MongooseErrHandler");
const { MongooseErrors, customError } = require("../helpers/ErrorShow");
const config = require("./../config/index");
const jwt = require("jsonwebtoken");
exports.authMiddleware = function(Model) {
  return function(req, res, next) {
    const token = req.headers.authorization;

    if (token) {
      let user = null;
      try {
        user = parseToken(token);
      } catch (error) {
        return next({
          type: "custom",
          title: "مشكلة في التوكن",
          message: error.message
        });
       
      }

      Model.findOne({ _id: user._id, token: token.split(" ")[1] }, function(
        err,
        foundedUser
      ) {
        if (err) {
          return next({
            type: "mongoose",
            err
          });
        }

        if (foundedUser) {
          res.locals.user = foundedUser;
          next();
        } else {
          return NotAuthorized(next);
        }
      });
    } else {
      return NotAuthorized(next);
    }
  };
  function parseToken(token) {
    return jwt.verify(token.split(" ")[1], config.SECRET);
  }
  function NotAuthorized(next) {
    return next({
      type: "custom",
      title: "غير مصرح",
      status:401,
      message: "تحتاج لأن تكون مصرحاُ للقيام بالعملية"
    });
  }
};
