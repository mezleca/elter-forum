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

router.get("/gerenciar", verify, (req, res) => {
    Posts.find().then((posts) => {
        res.render("admin/gerenciar.handlebars", {posts: posts})
    })
});

router.get("/delete-post/:id", verify, (req, res) => {
    const id = req.params.id;

    Posts.deleteOne({ _id: id }).then(() => {
        res.redirect("/admin/gerenciar");
    }).catch((err) => {
        console.log(err);
        res.redirect("/admin/gerenciar");
    })
});

module.exports = router; 