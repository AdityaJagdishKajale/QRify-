const jwt = require("jsonwebtoken");
const SECRET = "secret";

module.exports = function(req, res, next) {
  const authHeader = req.header("Authorization");
  if(!authHeader) return res.status(401).send("Access denied");
  const token = authHeader.split(" ")[1];
  if(!token) return res.status(401).send("Access denied");
  try {
    const verified = jwt.verify(token, SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};