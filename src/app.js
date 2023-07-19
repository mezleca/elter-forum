const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const parser = require("cookie-parser");

const admin_routes = require("./routes/admin");
const user_routes = require("./routes/user");
const auth_routes = require("./routes/auth");

const app = express();

app.engine("handlebars", handlebars.engine({defaultLayout: 'main', runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
}}));

app.set('view-engine', "handlebars");

app.use(express.urlencoded({
    extended: true
}));

app.use(parser());
app.use(express.json());
app.use("/admin", admin_routes);
app.use("/", user_routes);
app.use("/auth", auth_routes);

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/auth/login");
})

app.listen(8080, () => {
    console.log("servidor rodando");
})

