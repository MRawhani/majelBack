const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
  name: {
    type: String,
    unique: [true, "اسم الصنف لازم يكون غير مكرر"],
    required: [true, "اسم الصنف ضروري"],
  },
  description: {
    type: String,
  },
  photo:{
    type: String,
    required:true
  },
  products: [
    { type: Schema.Types.ObjectId, ref: `ProductsModel` }, 
  ],
  createdAt: { type: Date, default: Date.now },
});
// Duplicate the ID field.
CategoriesSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
CategoriesSchema.set('toJSON', {
  virtuals: true
});
module.exports = mongoose.model("CategoriesModel", CategoriesSchema);
