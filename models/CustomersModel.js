const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const customersSchema = new Schema({
  name: {
    type: String,
    unique: true,
    reguired: "اسم الزبون ضروري",
    min: [1, "الاسم قصير"],
    max: [100, "الاسم كبير للغاية"]
  },
  email: {
    type: String,

    unique: true,
    lowercase: true,
    required: "الإيميل مطلوب",
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
  },
  
  password: {
    type: String,
    required: "كلمة السر  مطلوبة",
    min: [4, "كلمة السر قصيرة"],
    max: [50, "كلمة السر طويلة جداً"]
  },

  phone: {
    type: Number,
    required: " التلفون  مطلوبة",
  
  },
  
  
  
  address: {
     type: Schema.Types.ObjectId, ref: "AddressModel",
    required: "العنوان مطلوب"
  },
 
  bookingsLength: {
    type: Number,
   
    default: 0
  },

 
  bookings: [{ type: Schema.Types.ObjectId, ref: "BookingsModel" }],
  token: {
    type: String
  },
  createdAt: { type: Date, default: Date.now }
});

customersSchema.methods.generateToken = function(cb) {
  var customer = this;
  var token = jwt.sign(
    {
      _id: customer._id,
     
      name: customer.name,

      email: customer.email,
    
    },
    config.SECRET,
    { expiresIn: "1h" }
  );
  customer.token = token;
  customer.save(function(err, customer) {
    if (err) return cb(err);
    cb(null, customer);
  });
};
customersSchema.pre("save", function(next) {
  const customer = this;
  if (customer.isModified("password")) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(customer.password, salt, function(err, hash) {
        // Store hash in your password DB.
        customer.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

customersSchema.methods.comparePasswords = function(enteredPassword, cb) {
  bcrypt.compare(enteredPassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
module.exports = mongoose.model("CustomersModel", customersSchema);
