const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const {token} = require("../mw/token");
const User = require("../models/User"); 
require("dotenv").config();

router.get("/login", (req, res) => {
    res.render("user/login.handlebars");
})

router.get("/cadastro", (req, res) => { 
    res.redirect("/auth/cadastro/none");
})

router.get("/cadastro/:status", (req, res) => {
    const status = req.params.status;

    // TODO: nem preciso dizer que isso e uma merda
    if (status == "none")
        res.render("user/cadastro.handlebars");
    else {
        res.render("user/cadastro.handlebars", {error: status});
    }
}) 

router.post("/login", async (req, res) => {
    const {email, senha} = req.body;

    const email_exist = await User.findOne({ email: email });
    if (!email_exist){
        return res.json("email nao encontrado");
    }

    if (!await bcrypt.compare(senha, email_exist.senha)) {
        return res.json("senha invalida");
    }
    else {
        const data = token.sign({ id: email_exist._id }, process.env.MY_SECRET);

        res.cookie('token', data, { maxAge: 604800000, httpOnly: true }); // 7 dias
        res.redirect("/");
    }
})

router.post("/cadastro", async (req, res) => {
    const {usuario, email, senha} = req.body;

    const email_exist = await User.findOne({ email: email });
    if (!email_exist) {

        const hashed_pass = await bcrypt.hash(senha, 15);

        const new_user = new User({
            usuario: usuario,
            email: email,
            senha: hashed_pass
        }).save();
    
        res.redirect("/auth/login");
    }
    else{
        res.redirect("/auth/cadastro/ja existe um usuario com esse email");
    }
})

module.exports = router;