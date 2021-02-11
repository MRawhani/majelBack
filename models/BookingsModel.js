const mongoose = require("mongoose");
const ValidationMessages = require("../helpers/ValidationMessages");

const Schema = mongoose.Schema;

const BookingsSchema = new Schema({
  no: {
    type: Number,
    // unique: [true, "يجب أن يكون رقم السند فريداً"],
    reguired: "لازم تدخل رقم",
  },
 
  quantity: {
    type: Number,
    required: " الكمية  مطلوبة",
  
  },
   
  isQuarter: {
    type: Boolean,
   
    default: false
  },
     
  isFull: {
    type: Boolean,
   
    default: true
  },
  isHalf: {
    type: Boolean,
   
    default: false
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
  paid: {
    type: Boolean,
    default: false,
  },
   address: {
     type: Schema.Types.ObjectId, ref: "AddressModel",
    required: "العنوان مطلوب"
  },
  addressDesc: {
    type: String,
   
  },
  totalPrice: {
    type: Number,
    required: ValidationMessages("السعر ")
  },
 

  product: { type: Schema.Types.ObjectId, ref: "ProductsModel" ,required:ValidationMessages('المنتج ')},
  deleted: { type: Boolean, default: false },
  
  customer: { type: Schema.Types.ObjectId, ref: "CustomersModel" },
  createdAt: { type: Date, default: Date.now }
});

BookingsSchema.pre("save", async function (next) {
  const booking = this;
  if (booking.isNew) {
    const result = await model.find().sort({ no: -1 }).limit(1);
    booking.no = result.length === 0 ? 1 : Number(result[0].no) + 1;
    next();
  } else {
    next();
  }
});
const model= mongoose.model("BookingsModel", BookingsSchema);
module.exports =model
