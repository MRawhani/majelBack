const express = require("express");
const auth = require("../middlewares/auth");

const BookingsController = require("../controllers/BookingsController");
const CustomersModel = require("../models/CustomersModel");
const CompaniesModel = require("../models/CompaniesModel");

const router = express.Router();
router.post(
    "/create-booking",
    auth.authMiddleware(CustomersModel),
  
    BookingsController.createBooking
  );
  router.post(
    "/getBookingsPerDate",
    auth.authMiddleware(CompaniesModel),
    BookingsController.getBookingsPerDate
  );
  router.patch(
    "/editBooking/:id",
    auth.authMiddleware(CompaniesModel),
    BookingsController.editBooking
  );
  router.patch(
    "/editBookingCustomer/:id",
    auth.authMiddleware(CustomersModel),
    BookingsController.editBookingCustomer
  );
module.exports = router;
 