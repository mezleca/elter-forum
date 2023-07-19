const mongoose = require("./database");

const Posts = mongoose.model("Post", {
    titulo: String,
    conteudo: String,
    usuario: String
});

module.exports = Posts;
