const express = require("express");
const CustomersModel = require("../models/CustomersModel");

const router = express.Router();
const auth = require("../middlewares/auth");

const Customer = require("../controllers/CustomerController");
//register
router.post(
  "/register",

  Customer.registerCustomer
);
router.post(
  "/login",

  Customer.login
);
router.get(
  "/getMyBookings",
  auth.authMiddleware(CustomersModel),
  Customer.getCustomerBookings
);
module.exports = router;
