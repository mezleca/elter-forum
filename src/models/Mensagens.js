const mongoose = require("./database");

const Mensagens = mongoose.model("Mensagen", {
    usuario: String,
    date: String,
    msg: String,
});

module.exports = {Mensagens};
