const mongoose = require("./database");

const Comentarios = mongoose.model("Comentarios", {
    post_id: String,
    conteudo: String,
    usuario: String,
    date: String,
    role: String,
    timestamp: Number
});

module.exports = Comentarios;