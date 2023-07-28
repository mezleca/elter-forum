const express = require("express");
const exphbs = require('express-handlebars');
const mongoose = require("mongoose");
const parser = require("cookie-parser");
const path = require('path');

const admin_routes = require("./routes/admin");
const user_routes = require("./routes/user");
const auth_routes = require("./routes/auth");

const app = express();

// Helper para verificar igualdade
const handlebars = exphbs.create({
    defaultLayout: 'main', // Define o layout padrão
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      ifEqual: function(a, b, options) {
        if (a === b) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    }
  })

app.engine("handlebars", handlebars.engine);

app.set('view-engine', "handlebars");
app.set('views', path.join(__dirname, 'views'));

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

