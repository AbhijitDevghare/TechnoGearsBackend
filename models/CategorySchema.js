const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema({
    name :{
        type:String,
        unique :true
    }
},
{
    timestamps:true
})

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
  