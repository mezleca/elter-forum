const express = require("express");
const router = express.Router();

const Posts = require("../models/Post");
const User = require("../models/User");

const {token, verify} = require("../mw/token");

async function setup_posts(model) { 
    try {
      const posts = await model.find().sort({timestamp: -1});
      const posts_obj = {
        categorias: {
            general: {
                nome: "general",
                last_post: "",
                posts: []
            },
            media: {
                nome: "media",
                last_post: "",
                posts: []
            },
            anuncios: {
                nome: "anuncios",
                last_post: "",
                posts: []
            }
        }};

        posts.map((element) => { // codigo de cualidade
            if (element.categoria == "general") {
                posts_obj.categorias.general.posts.push(element); 
            }   
            else if (element.categoria == "anuncios") {
                posts_obj.categorias.anuncios.posts.push(element);  
            } 
            else if (element.categoria == "media") {
                posts_obj.categorias.media.posts.push(element);
            }
        })

        posts_obj.categorias.general.last_post = posts_obj.categorias.general.posts[0] || null;
        posts_obj.categorias.anuncios.last_post = posts_obj.categorias.anuncios.posts[0] || null;
        posts_obj.categorias.media.last_post = posts_obj.categorias.media.posts[0] || null;

        return posts_obj;

    } catch (error) {
      console.error('Erro ao obter o ultimo valor adicionado:', error);
      throw error;
    }
}

router.get("/", async (req, res) => {
    const posts = await setup_posts(Posts);
    res.render("user/categorias.handlebars", {categorias: posts.categorias});
})

router.get("/categoria/:name", async (req, res) => {

    const categoria = req.params.name;
    const posts = await setup_posts(Posts);
    res.render("user/posts.handlebars", {posts: posts.categorias[categoria].posts});
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