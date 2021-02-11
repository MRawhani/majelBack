
const mongoose = require("mongoose");
const moment = require("moment");
const ProductsModel = require("../models/ProductsModel");
const CustomerModel = require("../models/CustomersModel");
const BookingsModel = require("../models/BookingsModel");

exports.createBooking = function (req, res, next) {
  const {
    isFull,


    quantity,
    totalPrice,

    isHalf,
    isQuarter,
    product,
    address,
    addressDesc
  } = req.body;
  const customer = res.locals.user;
  if (customer.suspended) {
    return next({
      type: "custom",
      title: "موقوف",
      message: " المستخدم موقوف عن اضافة اي حجز، تواصل بادارة المنصة للتفاصيل",
    });
  }
  
  const booking = new BookingsModel({
    isFull,
    isHalf,
    isQuarter,
    
        quantity,
        totalPrice,
    
        product,
        address,
        addressDesc
  });
 
  ProductsModel.findById(product)
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

      if (foundProduct.allowed < booking.quantity) {
        return next({
          type: "custom",
          title: "الكمية",
          message: "الكمية اكبر من الكمية المتاحة",
        });
      }
      booking.customer = customer;
      booking.product = foundProduct;
      foundProduct.bookings.push(booking);
      foundProduct.bookedTimes = foundProduct.bookedTimes + 1;
      booking.save(function (err, savedBooking) {
        if (err) {
          return next({ type: "check", err });
        }
        foundProduct.save();
        CustomerModel.updateOne(
          { _id: customer.id },
          {
            $push: {
              bookings:  booking.id,
               
            },
            $inc: { bookingsLength: +1 },
          },
          function () {
            if (err) {
                return next({ type: "check", err });
              }
            return res.status(200).json({
                
                success: true,
               
              });
          }
        );
         } )
    
    });
};


exports.getBookingsPerDate = function (req, res, next) {
    const { createdAtStart, createdAtEnd } = req.body.date;
    const { filterInput } = req.body;
    let limit = req.query.perPage ? parseInt(req.query.perPage) : 100;
    let skip = req.query.page ? parseInt(req.query.page) : 0;
    const orderBy = req.query.orderBy ? req.query.orderBy : "createdAt";
    const orderDirection = req.query.orderDirection
      ? req.query.orderDirection
      : "asc";
  
    const company = res.locals.user;
    let filter = [];
     if (createdAtEnd && createdAtStart) {
      const nwDate = moment(new Date(createdAtStart), "YMD")
        .startOf("day")
        .toDate();
      const nwDate2 = moment(new Date(createdAtEnd), "YMD").endOf("day").toDate();
  
      filter = [
        {
          product: { $in: company.products },
          createdAt: { $gte: nwDate, $lte: nwDate2 },
        },
        {
          createdAt: { $gte: nwDate, $lte: nwDate2 },
          product: { $in: company.products },
        },
      ];
    }
   
        let nwFilterInput = [];
        filterInput.length <= 0
          ? nwFilterInput.push({})
          : filterInput.forEach((element) => {
              let obj = {};
              if (Array.isArray(element.value)) {
                let v = [];
                element.value.forEach((element) => {
                  v.push(element === "true");
                });
                obj[element.field] = { $in: v };
              } else if (isNaN(+element.value)) {
                obj[element.field] = { $regex: element.value, $options: "i" };
              } else {
                obj[element.field] = parseInt(element.value);
              }
              nwFilterInput.push(obj);
            });
  
        var sortObject = {};
  
        // You can't use variables as keys in object literals. Give this a try:
        sortObject[orderBy] = orderDirection === "desc" ? -1 : 1;
          BookingsModel.aggregate(
          [
            {
              $match: { $or: filter },
            },
            {
              $lookup: {
                from: "customersmodels",
                localField: "customer",
                foreignField: "_id",
                as: "customer",
              },
            },
            { $unwind: { path: "$customer" } },
            {
              $lookup: {
                from: "productsmodels",
                localField: "product",
                foreignField: "_id",
                as: "product",
              },
            },
            { $unwind: { path: "$product" } },
  
            {
              $lookup: {
                from: "companymodels",
                localField: "product.company",
                foreignField: "_id",
                as: "product.company",
              },
            },
            { $unwind: { path: "$product.company" } },
  
            { $match: { $and: nwFilterInput } },
            {
              //this allows for tow operations in one stage
              $facet: {
                edges: [
                  { $sort: sortObject },
                  { $skip: skip * limit },
                  { $limit: limit },
                ],
                pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
              },
            },
            // {
            //   $group: {
            //     _id: 0,
            //     total: {
            //       $sum: "$paid",
            //     },
            //     count: { $sum: 1 },
            //   },
            // },
            // {$project:{
            //   total: {
            //           $sum: "$paid",
            //         },
            //         count: { $sum: 1 },
            //       },
            // }
          ],
          function (err, count) {
            if (err) {
              return next({ type: "check", err });
            }
            return res.status(200).json({
              data: count.length > 0 ? count[0].edges : [],
              page: skip,
              totalCount:
                count.length > 0
                  ? count[0].pageInfo[0]
                    ? count[0].pageInfo[0].count
                    : 0
                  : 0,
              totalPrice: count.length > 0 ? count[0].total : 0,
            });
          }
        );
    
  };

  exports.editBooking = function (req, res, next) {
    const { paid, delivered, cancelled } = req.body;
    const company = res.locals.user;
  
    if (
      !Boolean(String(paid)) ||
      !Boolean(String(delivered)) ||
      !Boolean(String(cancelled)) 
    ) {
      return next({
        type: "custom",
        title: "قيم غير صحيحة",
        message: " هناك قيم غير صحيحة",
      });
    }
    const newData = {
      paid: paid === "true" || paid === true,
      delivered: delivered === "true" || delivered === true,
     
      cancelled: cancelled === "true" || cancelled === true,
    };
    BookingsModel.findOne({
      _id: req.params.id,
    })
      .populate({
        path: "product",
        populate: { path: "company", model: "CompanyModel" },
      })
      .exec(function (err, doc) {
        if (err) {
          return next({ type: "check", err });
        }
        if (doc.product.company.id !== company.id) {
          return next({
            type: "custom",
            title: "غير مصرح",
            message: "انت لست صاحب هذا العرض لتقزم بتعديله",
          });
        }
        doc.set(newData);
        doc.save(function (err, newdoc) {
          if (err) {
            return next({ type: "check", err });
          }
          return res.send({ success: true, newdoc });
        });
      });
  };
  exports.editBookingCustomer = function (req, res, next) {
    const {  cancelled } = req.body;
    const user = res.locals.user;
  

    const newData = {
     
      cancelled: true,
    };
    BookingsModel.findOne({
      _id: req.params.id,
    })
      .populate({
        path: "customer",
      })
      .exec(function (err, doc) {
        if (err) {
          return next({ type: "check", err });
        }
        if (doc.customer.id !== user.id) {
          return next({
            type: "custom",
            title: "غير مصرح",
            message: "انت لست صاحب هذا العرض لتقزم بتعديله",
          });
        }
        doc.set(newData);
        doc.save(function (err, newdoc) {
          if (err) {
            return next({ type: "check", err });
          }
          return res.send({ success: true, newdoc });
        });
      });
  };