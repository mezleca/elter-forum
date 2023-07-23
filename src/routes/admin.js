const express = require("express");
const router = express.Router();
require("dotenv").config();

const User = require("../models/User");
const Posts = require("../models/Post");

const {verify, token} = require("../mw/token");

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
  
    return `${day}/${month}/${year} - ${hour}:${minute}`;
}

router.get("/", verify, (req, res) => {
    res.redirect("criar-post")
});

router.get("/criar-post", verify, (req, res) => {
    const cookie = req.cookies.token;
    const _token = token.decode(cookie);  

    User.findById(_token.id).then((user) => {       
        res.render("admin/criar.handlebars", {usuario: user.usuario});
    }).catch((err) => {
        console.log(err);
        res.redirect("/logout");
    });
});

router.post("/criar-post", verify, async (req, res) => {

    const {titulo, conteudo} = req.body;

    const date = new Date();
    const time = formatDate(date);
    const cookie = req.cookies.token;
    const _token = token.decode(cookie);
    const user_role = _token.role;

    try {
        const user = await User.findById(_token.id);
        const new_post = new Posts({
            titulo: titulo,
            conteudo: conteudo,
            usuario: user.usuario,
            date: time,
            role: user_role
        }).save();

        res.redirect("criar-post");
    } catch(err) {
        console.log(err);
        res.redirect("criar-post");
    }
});

router.get("/gerenciar", verify, (req, res) => {
    Posts.find().then((posts) => {
        console.log(posts)
        res.render("admin/gerenciar.handlebars", {posts: posts})
    })
});

router.get("/delete-post/:id", verify, (req, res) => {
    const id = req.params.id;

    Posts.deleteOne({ _id: id }).then(() => {
        console.log("post deletado com sucesso");
        res.redirect("/admin/gerenciar");
    }).catch((err) => {
        console.log(err);
        res.redirect("/admin/gerenciar");
    })
});

module.exports = router; 