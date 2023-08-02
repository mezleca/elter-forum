const express = require("express");
const exphbs = require('express-handlebars');
const mongoose = require("mongoose");
const parser = require("cookie-parser");
const path = require('path');
const socket = require("socket.io");

const app = express();
const http = require("http").createServer(app);
const io = socket(http);

const admin_routes = require("./routes/admin");
const user_routes = require("./routes/user");
const auth_routes = require("./routes/auth");

const {Mensagens, msg_array} = require("./models/Mensagens");

io.on("connection", async (socket) => {

  console.log("Usuario conectado, id:", socket.id);

  socket.on('join-room', (name) => {
    socket.join(name);
  });

  socket.on('msg', async (data) => {
    msg_array.push({
      msg: data.msg,
      usuario: data.usuario,
      date: data.date || "Invalid data"
    })
    io.to("chatbox").emit('msg', msg_array);
  });
})

const handlebars = exphbs.create({
    defaultLayout: 'main',
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
      },
      jsonStringify: function (obj) {
        return JSON.stringify(obj);
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

http.listen(8080, () => {
    console.log("servidor rodando");
})

