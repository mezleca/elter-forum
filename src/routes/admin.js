const express = require("express");
const router = express.Router();
require("dotenv").config();

const Posts = require("../models/Post");
const {verify} = require("../mw/token");

router.get("/", verify, (req, res) => {
    res.redirect("criar-post")
});

router.get("/criar-post", verify, (req, res) => {
    res.render("admin/criar.handlebars");
});

router.post("/criar-post", verify, (req, res) => {

    const {titulo, conteudo, usuario} = req.body;

    console.log(titulo, conteudo, usuario);

    const new_post = new Posts({
        titulo: titulo,
        conteudo: conteudo,
        usuario: usuario
    });

    new_post.save().then(() => {
        res.json("post criado com sucesso");
    }).catch((err) => {
        console.log(err);
    });

    res.redirect("criar-post")
});

router.get("/gerenciar",verify,  (req, res) => {
    Posts.find().then((posts) => {
        console.log(posts)
        res.render("admin/gerenciar.handlebars", {posts: posts})
    })
});

router.get("/delete-post/:id",verify,  (req, res) => {
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