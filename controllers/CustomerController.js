const mongoose = require("mongoose");
const CustomerModel = require("../models/CustomersModel");

exports.registerCustomer = function(req, res, next) {
  const {
    name,
    email,
    password,
  
    phones,
    address,
    
  } = req.body;
  if (
    name === "" ||
    email === "" ||
    password === "" ||
  
    phones === "" ||
    address === ""
  ) {
    return next({
      type: "custom",
      title: "حقول فارغة",
      message: " املأ جميع الحقول"
    });
    // return customError(res, "حقول فارغة", " املأ جميع الحقول");
  }  else {
 
      CustomerModel.findOne()
        .or([{ email: req.body.email }, { name: req.body.name }])
        .exec(function(err, existingCustomer) {
          if (err) {
            return next({
              type: "check",
              err
            });
            //   return MongooseErrors(res, err);
          }
          if (existingCustomer) {
            return customError(res, "الزبون موجودة", " الزبون  موجودة مسبقاً");
          }
          const Customer = new CustomerModel(req.body);

          Customer.save((err, customer) => {
            if (err) {
              return next({
                type: "check",
                err
              });
              //return MongooseErrors(res, err);
            }
            customer.generateToken((err, customer) => {
              if (err) {
                return next({
                  type: "mongoose",
                  err
                });
              }
              return res.status(200).json({
                success: true,
                token: customer.token
              });
            });
           
          });
        });
  
  }
};
exports.login = function(req, res, next) {
  if (req.body.email === "" || req.body.password === "") {
    return next({
      type: "custom",
      title: "حقول فارغة",
      message: " املأ جميع الحقول"
    });
    // return customError(res, "حقول فارغة", " املأ جميع الحقول");
  }
  CustomerModel.findOne()
    .or([{ email: req.body.email }])
    .exec(function(err, customer) {
      if (err) {
        return next({
          type: "mongoose",
          err
        });
      }
      if (!customer)
        return next({
          type: "custom",
          title: "المستخدم",
          message: " المستخدم غير موجود"
        });

      customer.comparePasswords(req.body.password, function(err, isMatch) {
        if (err) {
          return next({
            type: "",
            err
          });
        }
        if (!isMatch)
          return next({
            type: "custom",
            title: "كلمة السر",
            message: "كلمة السر غير صحيحة"
          });

        customer.generateToken((err, customer) => {
          if (err) {
            return next({
              type: "mongoose",
              err
            });
          }
          return res.status(200).json({
            success: true,
            token: customer.token
          });
        });
      });
    });
};
exports.editCustomer =  async function (req, res, next) {
  const data = req.body;
  
  CustomerModel.findById(req.params.id).exec(function (err, foundCustomer) {
    if (err) {
      return next({ type: "check", err });
    }

    if (!foundCustomer) {
      return next({
        type: "custom",
        title: "المستخدم",
        message: "المستخدم غير موجود",
      });
    }

    foundCustomer.set(data);
    foundCustomer.save(function (err, updatedProduct) {
      if (err) {
        return next({ type: "check", err });
      }
      return res.status(200).json({ success: true, updatedProduct });
    });
  });
  };

  exports.getCustomerById =  function (req, res, next) {
      const productId = req.params.id;
  
      CustomerModel.findById(productId)
        .exec(function (err, foundCustomer) {
          if (err) {
            return next({ type: "check", err });
          }
          if (!foundCustomer) {
            return next({
              type: "custom",
              title: "المستخدم",
              message: "المستخدم اللي بتحاول توصل له غير موجود ",
            });
          }
          if (foundCustomer.deleted) {
            return next({
              type: "custom",
              title: "المستخدم",
              message: "المستخدم اللي بتحاول توصل له قد احتذف",
            });
          }
          return res.status(200).json({ success: true, foundCustomer });
        });
    };
  
exports.getCustomerLikes = function(req, res,next) {
  const customer = res.locals.user;
  CustomerModel.findById(
    { _id: customer._id }
    
  ).populate({
    path: 'likes.like',
   select:'_id name type'
  }).exec(function(err,doc){
    if (err) {
      return next({
        type: "mongoose",
        err
      });


    }
    return res.status(200).json({
      success: true,
      likesFound: doc.likes
    });
  })
};


exports.getCustomerBookings = function(req, res,next) {
  const customer = res.locals.user;
  CustomerModel.findById(
    { _id: customer._id }
    
  ).populate({
    path: "bookings",
    populate:{path:"product",select:"_id  name"}
  }).exec(function(err,doc){
    if (err) {
      return next({
        type: "check",
        err
      });
   }
    return res.status(200).json({
      success: true,
      bookingsFound: doc.bookings
    });
  })
};


exports.getCustomersToShop = function (req, res, next) {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;
  let string = req.body.string;
 
  
  let findArgs = string ?{$or:[ { "name": { $regex: string, $options: "i" } },
  {
    "username": { $regex: string, $options: "i" },
    "phones": { $regex: string, $options: "i" },
  }]
    
  }:{}

  
  console.log(findArgs);

  CustomerModel.find(findArgs)
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec(function (err, customers) {
      if (err) {
        return next({ type: "check", err });
      }
     
      return res.status(200).json({
       size: customers.length, customers 
      });
    });
  return res.status(200);
};

exports.getBookingsByModel = function (req, res, next) {
  
 //if the model name is changed change it in front too
  const model = req.query.model
  CustomerModel.aggregate([{
    $match: {
        _id: mongoose.Types.ObjectId(req.params.id)
    }
}, {
    $project: {
       
        "email": 1,
        "bookings": {
            "$filter": {
                "input": "$bookings",
                "as": "result",
                cond: {
                    $eq: ["$$result.onModel", model]
                }
            }
        }
    }
}],function (err, customers) {
      if (err) {
        return next({ type: "check", err });
      }
      CustomerModel.populate(customers, {path: "bookings.booking",populate:{path:'product',select:"name"}}, function(err,customer){
        return res.status(200).json({
        customerBookings:customer.length>0?customer[0].bookings:customer
         });
      });

      
    }); 

};

exports.suspendCustomer =  function (req, res, next) {
  CustomerModel.updateOne(
    { _id: req.params.id },
    {
      suspended: true,
    },
    function (err, doc) {
      if (err) {
        return next({ type: "check", err });
      }
      if (doc.nModified===0) {
        return next({
          type: "custom",
          title: "العملية",
          message: " لم تتم عملية الإيقاف",
        });
      }
     else{
      return res.status(200).json({
        success: true,
        receipt: doc,
      });
     }
    }
  );
  };
  exports.unSuspendCustomer =  function (req, res, next) {
    CustomerModel.updateOne(
      { _id: req.params.id },
      {
        suspended: false,
      },
      function (err, doc) {
        if (err) {
          return next({ type: "check", err });
        }
        if (doc.nModified===0) {
          return next({
            type: "custom",
            title: "العملية",
            message: " لم تتم عملية الغاء الإيقاف",
          });
        }
       else{
        return res.status(200).json({
          success: true,
          receipt: doc,
        });
       }
      }
    );
    };

