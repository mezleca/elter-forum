const express = require("express");
const router = express.Router();

const Posts = require("../models/Post");
const User = require("../models/User");
const Comentarios = require("../models/Comentarios");
const {msg_array} = require("../models/Mensagens");

const {token, verify_user} = require("../mw/token");

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
  
    return `${day}/${month}/${year} - ${hour}:${minute}`;
}

async function setup_posts(model, customid) { 
    try {
    if (!customid) {
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
    }
    else {
        const posts = await model.findOne({_id: customid});
        return posts;
    }

    } catch (error) {
      console.error('Erro ao obter o ultimo valor adicionado:', error);
      throw error;
    }
}

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/auth/login");
})

router.get("/", async (req, res) => {

    try {
        const _token = req.cookies.token;
        const decoded = token.decode(_token);
        const posts = await setup_posts(Posts);
        res.render("user/categorias.handlebars", {categorias: posts.categorias, msgs: msg_array, namers: decoded.name });
    }
    catch(err) {
        const posts = await setup_posts(Posts);
        res.render("user/categorias.handlebars", {categorias: posts.categorias, msgs: msg_array, error: "logue no site para ter acesso ao chat"});
    }
})

router.get("/categoria/:name", async (req, res) => {

    const categoria = req.params.name;
    const posts = await setup_posts(Posts);
    res.render("user/posts.handlebars", {posts: posts.categorias[categoria].posts});
})

router.get("/post/:id", async (req, res) => {
    const id = req.params.id;

    const posts = await setup_posts(Posts, id);
    const comentarios = await Comentarios.find({post_id: id}).sort({timestamp: -1}).exec();

    try {
        const _token = req.cookies.token;
        token.verify(_token, process.env.MY_SECRET);
        res.render("user/post.handlebars", {post: posts, comentario: comentarios, postid: id, logged: true});
    }
    catch(err) {
        res.render("user/post.handlebars", {post: posts, comentario: comentarios, postid: id, logged: false});
    }
})

router.post("/add-comentario", verify_user, async (req, res) => {
    const {conteudo, post_id} = req.body;

    const date = new Date();
    const time = formatDate(date);
    const cookie = req.cookies.token;
    const _token = token.decode(cookie);
    const user_role = _token.role;

    try {
        const user = await User.findById(_token.id);
        const new_comment = new Comentarios({
            post_id: post_id,
            conteudo: conteudo,
            usuario: user.usuario,
            date: time,
            role: user_role,
            timestamp: Date.now()
        }).save();

        res.redirect(`/post/${post_id}`);
    } catch(err) {
        res.redirect(`/post/${post_id}`);
        throw err;
    }
})

router.get("/profile", verify_user, async (req, res) => {

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

router.get("/trocar-nome", verify_user, async (req, res) => {
    res.render("user/change-name.handlebars");
})

router.post("/trocar-nome", verify_user, async (req, res) => { // feat chatgpt
    const { new_user } = req.body;

    try {
        const _token = req.cookies.token;
        const user = token.decode(_token);

        const postExists = await Posts.exists({ usuario: user.name });
        const userExists = await User.exists({ _id: user.id });
        const comentariosExists = await Comentarios.exists({ usuario: user.name });

        if (await User.exists({ usuario: new_user })) {
            return res.status(401).json("ja existe um usuario com esse nome");
        }

        if (postExists) {
            await Posts.updateMany({ usuario: user.name }, { $set: { usuario: new_user } });
        }

        if (userExists) {
            await User.findByIdAndUpdate(user.id, { usuario: new_user });
        }

        if (comentariosExists) {
            await Comentarios.updateMany({ usuario: user.name }, { $set: { usuario: new_user } });
        }
 
        res.clearCookie('token');
        res.redirect("/profile");
    } catch(err) {
        console.log(err);
        res.status(500).send('Ocorreu um erro ao trocar o nome de usuário.');
    }
});

router.get("/profile/:id", async (req, res) => {

    try {
        const id = req.params.id; 
        const user = await User.findOne({usuario: id});

        res.render("user/perfil.handlebars", {usuario: user.usuario, role: user.role});
        
    } catch(err) {
        res.json({
            error: `${err}`
        });
    }
})

router.get("/criar-post", verify_user, (req, res) => {
    const cookie = req.cookies.token;
    const _token = token.decode(cookie);  

    User.findById(_token.id).then((user) => {       
        res.render("admin/criar.handlebars", {usuario: user.usuario});
    }).catch((err) => {
        console.log(err);
        res.redirect("/logout");
    });
});

router.post("/criar-post", verify_user, async (req, res) => {

    const {titulo, conteudo, categoria} = req.body;

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
            role: user_role,
            categoria: categoria,
            timestamp: Date.now()
        }).save();

        res.redirect("criar-post");
    } catch(err) {
        console.log(err);
        res.redirect("criar-post");
    }
});

module.exports = router;