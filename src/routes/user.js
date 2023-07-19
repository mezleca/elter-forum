const express = require("express");
const router = express.Router();

const Posts = require("../models/Post");

router.get("/", (req, res) => {
    Posts.find().then((posts) => {
        res.render("user/posts.handlebars", {posts: posts})
    })
})

module.exports = router;