const mongoose = require("./database");

const Posts = mongoose.model("Post", {
    titulo: String,
    conteudo: String,
    usuario: String,
    date: String,
    role: String,
    categoria: String,
    timestamp: Number
});

module.exports = Posts;
