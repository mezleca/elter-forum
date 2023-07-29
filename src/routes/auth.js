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
    res.render("user/cadastro.handlebars");
}) 

router.post("/login", async (req, res) => {
    const {email, senha} = req.body;

    const email_exist = await User.findOne({ email: email });
    if (!email_exist){
        return res.render("user/login.handlebars", {error: {msg: "email nao encontrado!"}});
    }

    if (!await bcrypt.compare(senha, email_exist.senha)) {
        return res.render("user/login.handlebars", {error: {msg: "senha invalida"}});
    }
    else {
        const data = token.sign({ id: email_exist._id, name: email_exist.usuario, role: email_exist.role }, process.env.MY_SECRET);

        res.cookie('token', data, { maxAge: 604800000, httpOnly: true }); // 7 dias
        res.redirect("/");
    }
})

router.post("/cadastro", async (req, res) => { // TODO: talvez utilizar algum outro modulo especifico para o popup?
    const {usuario, email, senha} = req.body;

    const email_exist = await User.findOne({ email: email });
    if (email_exist) { 
        return res.render("user/cadastro.handlebars", {error: {msg: "ja existe um usuario com esse email!"}});
    }

    const user_exist = await User.findOne({ usuario: usuario });
    if (user_exist) {
        return res.render("user/cadastro.handlebars", {error: {msg: "ja existe um usuario com esse nome!"}});
    }

    const hashed_pass = await bcrypt.hash(senha, 15);
    const new_user = new User({
        usuario: usuario,
        email: email,
        senha: hashed_pass,
        role: "admin"
    }).save();

    res.redirect("/auth/login");
})

module.exports = router;