const jwt = require("jsonwebtoken");
require("dotenv").config();

function verify_token(req, res, next) {

    const token = req.cookies.token;
    const secret = process.env.MY_SECRET;

    if (!token) {
        res.redirect("/auth/login");
    }

    try {
        jwt.verify(token, secret);
        next();
    } catch (err) {
        console.log(err);
        res.clearCookie("token");
        res.redirect("/auth/login");
    }
}

module.exports = {token: jwt, verify: verify_token};