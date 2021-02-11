const express = require("express");

const router = express.Router();

const Company = require("../controllers/CompaniesController");
//register
router.post(
  "/register-company",

  Company.registerCompany
);
router.post(
  "/login-company",

  Company.login
);
module.exports = router;
