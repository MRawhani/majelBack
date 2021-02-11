const CategoriesModel = require('../models/CategoriesModel')

exports.createCategory =  async function (req, res, next) {
    try {
      const data = req.body;
      const category = new CategoriesModel(data);
      const result = await category.save();
      return res.status(200).json(result);
    } catch (e) {
      const err =
        e.errmsg && e.errmsg.split(" ")[0] === "E11000"
          ? { type: "custom", title: "مكرر", message: "الاسم مكرر" }
          : { type: "mongoose", err: e }; 
      next(err);
    }
  };

exports.editCategory =  async function (req, res, next) {
    try {
      const { name } = req.body;
      const result = await CategoriesModel.updateOne({ _id: req.params.id }, {$set:{name}});
      return res.status(200).json({name});
    } catch (e) { 
      const err =
        e.errmsg && e.errmsg.split(" ")[0] === "E11000"
          ? { type: "custom", title: "مكرر", message: "الاسم مكرر" }
          : { type: "mongoose", err: e };
      next(err);
    }
  };

exports.deleteCategory =  function (req, res, next) {
    CategoriesModel.findById(req.params.id)
    .exec(function (err, foundCategory) {
      if (err) {
        return next({ type: "check", err });
      }
      if (!foundCategory) {
        return next({
          type: "custom",
          title: "الصنف",
          message: "الصنف غير موجود",
        });
      }

      if (foundCategory.products && foundCategory.products.length > 0) {
        return next({
          type: "custom",
          title: "الصنف",
          message: "لايمكنك حذف الصنف ولديه منتجات ",
        });
      }

      foundCategory.delete(function (err, updatedProduct) {
        if (err) {
          return next({ type: "check", err });
        }
        return res.status(200).json({
          success: true,
          name: updatedProduct.name || updatedProduct.doctorName,
        });
      });
    });
  };


exports.getCategories =  async function (req, res, next) {
    try {
      const result = await CategoriesModel.find({});
      return res.status(200).json(result);
    } catch (e) {
      const err =
        e.errmsg && e.errmsg.split(" ")[0] === "E11000"
          ? { type: "custom", title: "مكرر", message: "الاسم مكرر" }
          : { type: "mongoose", err: e };
      next(err);
    }
  };

