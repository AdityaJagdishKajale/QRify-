const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema({

 text:String,
 type:String,

 scans:{
  type:Number,
  default:0
 },

 expireAt:Date,

 password:String,

 oneTime:{
  type:Boolean,
  default:false
 },

 used:{
  type:Boolean,
  default:false
 },

 createdAt:{
  type:Date,
  default:Date.now
 }

});

module.exports = mongoose.model("QR",qrSchema);