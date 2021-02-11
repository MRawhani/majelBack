const moment = require("moment");
const mongoose = require("mongoose");

// const CompanyModel = require("../../models/CompanyModel");
// const { checkIfDatesAreValid } = require("../../helpers/GenericObjects");
const ProductsModel = require("../models/ProductsModel");
const CompaniesModel = require("../models/CompaniesModel");
const CategoriesModel = require("../models/CategoriesModel");

exports.createProduct = function (req, res, next) {
  let data = { ...req.body };
  const company = res.locals.user;


  CategoriesModel.findById(data.categoryName, function (err, category) {
    if (err) {
      return next({ type: "check", err });
    }
    if (!category) {
      return next({
        type: "custom",
        title: "الصنف",
        message: "نوع الصنف اللي دخلته غير موجود",
      });
    }
    const product = new ProductsModel(data);
    product.company = company;
    ProductsModel.create(product, function (err, savedProduct) {
      if (err) {
        return next({ type: "check", err });
      }
      CompaniesModel.updateOne(
        { _id: company.id },
        {
          $inc: { productsLength: 1 },
          $push: { products: savedProduct },
        },
        function (err) {
          if (err) {
            return next({ type: "mongoose", err });
          }
        }
      );
      category.products.push(savedProduct);
      category.save(function (err) {
        if (err) {
          return next({ type: "mongoose", err });
        }
      });

      return res.status(200).json({ success: true, savedProduct });
    });
  });
};

exports.getProductsToShop = function (req, res, next) {
  let order = req.body.order ? req.body.order : "asc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let date = req.body.date;
  let address ;
  console.log(req.body);
  const company = res.locals.user;

  let findArgs =company ? {
    _id: { $in: company.products },
  } : {}
  let qty = 1;
  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      }  else if (key === "address")  {
        address = req.body.filters[key];

      }else{
        findArgs[key] = req.body.filters[key];

      }
    }
  }
  console.log(findArgs);

  // .populate("bookings")
  ProductsModel.find(findArgs)
    .populate("company", "email address phones name")
    .populate("categoryName")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec(function (err, products) {
      if (err) {
        return next({ type: "check", err });
      }
      let choosenProducts = products;
    
      if (address) {
        choosenProducts = choosenProducts.filter((element) => {
  
        return  address.some(e => {
            return (
              element.company._doc.address  == e
            );

          });
          
        });
     
      }
      return res.status(200).json({
        success: true,
        data: { size: choosenProducts.length, products: choosenProducts },
      });
    });
  return res.status(200);
};


exports.getProductById =function (req, res, next) {
    const productId = req.params.id;

    ProductsModel.findById(productId)
      .populate("company", "name phones address _id")
      .populate("categoryName")
      .exec(function (err, foundProduct) {
        if (err) {
          return next({ type: "check", err });
        }
        if (!foundProduct) {
          return next({
            type: "custom",
            title: "المنتج",
            message: "المنتج اللي بتحاول توصل له غير موجود ",
          });
        }
        if (foundProduct.deleted) {
          return next({
            type: "custom",
            title: "المنتج",
            message: "المنتج اللي بتحاول توصل له قد احتذف",
          });
        }
        return res.status(200).json({ success: true, foundProduct });
      });
  };


exports.editProduct =  function (req, res, next) {
    const data = req.body;
 
    const comapny = res.locals.user;
    if (data.categoryName) {
      CategoriesModel.findById(data.categoryName, function (err, category) {
        if (err) {
          return next({ type: "check", err });
        }
        if (!category) {
          return next({
            type: "custom",
            title: "الصنف",
            message: "نوع الصنف اللي دخلته غير موجود",
          });
        }
      });
    }

    ProductsModel.findById(req.params.id)
      .populate("company")
      .exec(function (err, foundProduct) {
        if (err) {
          return next({ type: "check", err });
        }

        if (!foundProduct) {
          return next({
            type: "custom",
            title: "المنتج",
            message: "المنتج غير موجود",
          });
        }

        if (comapny.id !== foundProduct.company.id) {
          return next({
            type: "custom",
            title: "غير مصرح",
            message: "انت لست صاحب هذا العرض لتقزم بتعديله",
          });
        }
       
        foundProduct.set(data);

        foundProduct.save(function (err, updatedProduct) {
          if (err) {
            return next({ type: "check", err });
          }
          return res.status(200).json({ success: true, updatedProduct });
        });
      });
  };

exports.deleteRProduct = function (req, res, next) {
  
    const company = res.locals.user;
    // we still need a populate for boooking but when we create booking,
    // we can pass the select object in the function as closure>> same goes with updae mehtod
    ProductsModel.findById(req.params.id)
      .populate("company", "_id")
      .exec(function (err, foundProduct) {
        if (err) {
          return next({ type: "check", err });
        }
        if (!foundProduct) {
          return next({
            type: "custom",
            title: "المنتج",
            message: "المنتج غير موجود",
          });
        }

        if (company.id !== foundProduct.company.id) {
          return next({
            type: "custom",
            title: "غير مصرح",
            message: "انت لست صاحب هذا العرض لتقزم بحذفه",
          });
        }
        if (foundProduct.deleted) {
          return next({
            type: "custom",
            title: "المنتج",
            message: "المنتج محذوف من قبل",
          });
        }
       
        foundProduct.deleted = true;
        foundProduct.available = false;

        foundProduct.save(function (err, updatedProduct) {
          if (err) {
            return next({ type: "check", err });
          }
          return res.status(200).json({
            success: true,
            name: updatedProduct.name ,
          });
        });
      });
  };
  exports.findTopCompanies = function (req, res, next) {
    ProductsModel.aggregate(
      [
        
        
        {
          $group: {
            _id: "$company",
  
            value2: { $sum: { $multiply: ["$visitsCount", "$bookedTimes"] } },
            bookedTimes: { $sum: "$bookedTimes" },
            visitsCount: { $sum: "$visitsCount" },
            value: { $sum: 1},
  
          },
        },
        { $sort: {value2:-1} },
      
        { $limit: 5 },
        {
          $lookup: {
            from: "companymodels",
            localField: "_id",
            foreignField: "_id",
            as: "_id",
          },
        },
        { $unwind: { path: "$_id" } },
        { $project: { 
          'name':'$_id.name',
          '_id':'$_id._id',
       
          'value': 1,
          'value2': 1,
          'bookedTimes': 1,
          'visitsCount': 1,
         } },
  
      ],
      function (err, doc) {
        if (err) {
          return next({ type: "check", err });
        }
  
        return res.send(doc);
      }
    );
  };
// exports.findTopCompanies = function (req, res, next) {
//   ProductsModel.aggregate(
//     [
      
      
//       {
//         $group: {
//           _id: "$company",

//           value2: { $sum: { $multiply: ["$visitsCount", "$bookedTimes"] } },
//           bookedTimes: { $sum: "$bookedTimes" },
//           visitsCount: { $sum: "$visitsCount" },
//           value: { $sum: 1},

//         },
//       },
//       { $sort: {value2:-1} },
    
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: "CompaniesModel",
//           localField: "_id",
//           foreignField: "_id",
//           as: "_id",
//         },
//       },
//       { $unwind: { path: "$_id" } },
//       { $project: { 
//         'name':'$_id.companyName',
//         '_id':'$_id._id',
     
//         'photos':'$_id.photos',
//         'value': 1,
//         'value2': 1,
//         'bookedTimes': 1,
//         'visitsCount': 1,
//        } },

//     ],
//     function (err, doc) {
//       if (err) {
//         return next({ type: "check", err });
//       }

//       return res.send(doc);
//     }
//   );
// };


