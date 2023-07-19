const mongoose = require("./database");

const User = mongoose.model("User", {
    usuario: String,
    senha: String,
    email: String
});

module.exports = User;
