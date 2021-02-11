const mongoose = require("mongoose");
const ValidationMessages = require("../helpers/ValidationMessages");

const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
  name: {
    type: String,
    unique: [true, "ادخل الاسم الفريد اللي تستخدمه في المحل"],
    required: "لازم تدخل للمنتج اسم"
  },
  description: {
    type: String,
    required: ValidationMessages("الوصف")
  },
  price: {
    type: Number,
    required: ValidationMessages("السعر لليلة")
  },
  
  photos: [
    {
      type: String,
      required: ValidationMessages("")
    }
  ],
  
  bookedTimes: {
    type: Number,
    //set: v=> this.bookings&&this.bookings.length,
    default: 0
  },
  
  allowed: {
    type: Number,
    //set: v=> this.bookings&&this.bookings.length,
    default: 1000
  },
  
  available: {
    type: Boolean,
    default: true
  },
  assets: [{ type: String }],
  bookings: [{ type: Schema.Types.ObjectId, ref: "BookingsModel"}],
  hasHalf:{
    type: Boolean,
    default: false
  },
  hasQuarter:{
    type: Boolean,
    default: false
  },
  
  visitsCount:{
    type: Number,
    default: 0,
  },
  visits: [
    {
      ip: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],

 

  categoryName: { type: Schema.Types.ObjectId, ref: "CategoriesModel",required:ValidationMessages('اسم الصنف') },
  company: { type: Schema.Types.ObjectId, ref: "CompanyModel" ,required:ValidationMessages('الشركة المالكة')},
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ProductsModel", ProductsSchema);
