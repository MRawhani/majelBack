const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const companySchema = new Schema({
  name: {
    type: String,
    unique: true,
    reguired: "اسم الشركة ضروري",
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
  username: {
    type: String,
    required: "اسم المستخدم مطلوب",
    min: [1, "الاسم قصير"],
    max: [100, "الاسم كبير للغاية"]
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
  profit: {
    type: Number,
    required: "يجب ان تحدد الربح للشركة",
    default: 0
  },
  productsLength: {
    type: Number,
   
    default: 0
  },

 
  products: [{ type: Schema.Types.ObjectId, ref: "ProductsModel" }],
  token: {
    type: String
  },
  createdAt: { type: Date, default: Date.now }
});

companySchema.methods.generateToken = function(cb) {
  var company = this;
  var token = jwt.sign(
    {
      _id: company._id,
      username: company.username,
      name: company.name,

      email: company.email,
    
    },
    config.SECRET,
    { expiresIn: "1h" }
  );
  company.token = token;
  company.save(function(err, company) {
    if (err) return cb(err);
    cb(null, company);
  });
};
companySchema.pre("save", function(next) {
  const company = this;
  if (company.isModified("password")) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(company.password, salt, function(err, hash) {
        // Store hash in your password DB.
        company.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

companySchema.methods.comparePasswords = function(enteredPassword, cb) {
  bcrypt.compare(enteredPassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
module.exports = mongoose.model("CompanyModel", companySchema);
