const mongoose = require("mongoose");

mongoose.connect(process.env.MY_DATABASE).then(() => {
    console.log("conectado com sucesso a database");
}).catch((err) => {
    console.log(err)
})

module.exports = mongoose;