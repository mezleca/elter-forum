const express = require("express");
const router = express.Router();

const Posts = require("../models/Post");
const User = require("../models/User");

const {token, verify} = require("../mw/token");

router.get("/", async (req, res) => {
    
    Posts.find().then((posts) => {
        console.log(posts);
        res.render("user/posts.handlebars", {posts: posts})
    })
})

router.get("/profile", async (req, res) => {

    try {
        const _token = req.cookies.token;
        const saco = token.decode(_token, process.env.MY_SECRET);
        
        const user_info = await User.findOne({_id: saco.id});
        res.render("user/perfil.handlebars", {usuario: user_info.usuario, role: user_info.role});
        
    } catch(err) {
        res.json({
            error: `${err}`
        });
    }
})

router.get("/profile/:id", async (req, res) => {

    try {
        const id = req.params.id; 
        const post = await Posts.findOne({_id: id});
        const user = await User.findOne({usuario: post.usuario});

        res.render("user/perfil.handlebars", {usuario: user.usuario, role: user.role});
        
    } catch(err) {
        res.json({
            error: `${err}`
        });
    }
})

module.exports = router;