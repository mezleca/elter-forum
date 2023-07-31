const mongoose = require("./database");

let msg_array = [{
    msg: "mensagem de test",
    usuario: "elter-eduardo",
    date: "invalid time"
}];

const Mensagens = mongoose.model("Mensagen", {
    usuario: String,
    date: String,
    msg: String,
});

module.exports = {Mensagens, msg_array};
