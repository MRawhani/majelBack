const mongoose = require("mongoose");
const ValidationMessages = require("../helpers/ValidationMessages");

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  city: {
    type: String,
    required: ValidationMessages("المدينة")
  },
  street: {
  type:String,
  required: ValidationMessages("الشارع")
  
  },
 
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("AddressModel", addressSchema);
