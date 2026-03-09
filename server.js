const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/qrify")
.then(()=>console.log("DB Connected"));

// serve frontend
app.use(express.static('public'));

// Home route (fallback)
app.get("/", (req,res)=>{
 res.send("QRify Server Running");
});

app.use("/auth", require("./routes/auth"));
app.use("/qr", require("./routes/qr"));

app.listen(3008, ()=>{
 console.log("Server running on port 3008");
});