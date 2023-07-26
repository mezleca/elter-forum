const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/User");

async function verify_token(req, res, next) {

    try {
        const token = req.cookies.token;
        const secret = process.env.MY_SECRET;
        const decoded = jwt.decode(token);  
        const user = await User.findById(decoded.id);

        if (!(user.role == "admin" || user.role == "owner")) {
            return res.json("voce nao tem permissao para acessar essa pagina")
        }

        if (!token) {
            res.redirect("/auth/login");
        }

        jwt.verify(token, secret);
        next();
    }
    catch(err) {
        console.log(err);
        res.clearCookie("token");
        res.redirect("/auth/login");
    }   
}

module.exports = {token: jwt, verify: verify_token, piroca: verify_token};