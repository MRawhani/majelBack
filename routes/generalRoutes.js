const express = require("express");

const router = express.Router();

const GeneralController = require("../controllers/GeneralController");
//register
router.get(
  "/",

  GeneralController.getGeneral
);
module.exports = router;
