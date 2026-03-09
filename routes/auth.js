const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET="secretkey";

router.post("/signup", async(req,res)=>{

 const hash = await bcrypt.hash(req.body.password,10);

 const user = await User.create({
  email:req.body.email,
  password:hash
 });

 res.send("User Created");
});

router.post("/login", async(req,res)=>{

 const user = await User.findOne({email:req.body.email});

 if(!user) return res.send("User not found");

 const valid = await bcrypt.compare(req.body.password,user.password);

 if(!valid) return res.send("Wrong password");

 const token = jwt.sign({id:user._id},SECRET);

 res.json({token});
});

module.exports = router;