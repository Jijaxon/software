const mongoose=require("mongoose");

const UserScheme=new mongoose.Schema({
  username:{
    type:String,
    required:true,
    unique:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  password:{
    type:String,
    required:true,
  },
  role:{
    type:String,
    default:"user",
  },
  verify: {
    type: Boolean,
    default: false
  },
  verification_code: {
    type: String,
    default: ""
  },
});
const User=mongoose.model('User',UserScheme);
module.exports=User;