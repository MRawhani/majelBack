const express = require("express");
const auth = require("../middlewares/auth");

const CompaniesModel = require("../models/CompaniesModel");
const ProductsController = require("../controllers/ProductsController");

const router = express.Router();
router.get(
    "/get",
    auth.authMiddleware(CompaniesModel),
  
    ProductsController.getProductsToShop
  );
  router.get(
    "/top-companies",
    
  
    ProductsController.findTopCompanies
  );
  router.post(
    "/getAll",
  
    ProductsController.getProductsToShop
  );
  router.post(
    "/add",
    auth.authMiddleware(CompaniesModel),
   
    ProductsController.createProduct
  );
  router.patch(
    "/edit/:id",
    auth.authMiddleware(CompaniesModel),
   
    ProductsController.editProduct
  );
  router.get(
    "/getById/:id",
   
    ProductsController.getProductById  
  );
  router.delete(
    "/delete",
    auth.authMiddleware(CompaniesModel),
   
    ProductsController.deleteRProduct
  );



module.exports = router;
