const express = require("express");

const router = express.Router();

const Company = require("../controllers/CategoriesController");
//register
router.get(
  "/",

  Company.getCategories
);
router.post(
  "/create",

  Company.createCategory
);
router.put(
  "/:id",

  Company.editCategory
);
router.delete(
  "/:id",

  Company.deleteCategory
);
module.exports = router;
