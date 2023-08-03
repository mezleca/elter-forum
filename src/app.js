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

const {Mensagens} = require("./models/Mensagens");

io.on("connection", async (socket) => {

  socket.on('join-room', (name) => {
    socket.join(name);
  });

  socket.on('msg', async (data) => {

    const new_comment = new Mensagens({
      msg: data.msg,
      usuario: data.usuario,
      date:data.date
    }).save();

    const todas_msg = await Mensagens.find();

    io.to("chatbox").emit('msg', todas_msg);
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
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public/views'));

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

