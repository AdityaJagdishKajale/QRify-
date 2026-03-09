const router = require("express").Router();
const QR = require("../models/QR");
const QRCode = require("qrcode");

// generate QR
router.post("/generate", async(req,res)=>{

 const {text,type,expireAt,password,oneTime} = req.body;

 const qr = await QR.create({
  text,
  type,
  expireAt,
  password,
  oneTime
 });

 const link = "http://localhost:3008/r/" + qr._id;

 const image = await QRCode.toDataURL(link);

 res.json({
  qr:image,
  redirect:link
 });

});

// dynamic redirect
router.get("/r/:id", async(req,res)=>{

 const qr = await QR.findById(req.params.id);

 if(!qr) return res.send("QR not found");

 if(qr.expireAt && new Date() > qr.expireAt)
  return res.send("QR expired");

 if(qr.password){
  const pass = req.query.password;

  if(pass !== qr.password)
   return res.send("Password required");

 }

 if(qr.oneTime && qr.used)
  return res.send("QR already used");

 qr.scans++;

 if(qr.oneTime)
  qr.used = true;

 await qr.save();

 res.redirect(qr.text);

});

// dashboard (view all QR codes)
router.get("/dashboard", async(req,res)=>{

 const data = await QR.find();

 res.json(data);

});

module.exports = router;