const mongoose = require("mongoose");
const app = require("./app");

const crearAdmin=require("./src/controllers/usuariosController")

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/ControlEmpresas", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexion exitosa");

    app.listen(3030, function () {});
  })
  .catch((error) => console.log(error));

crearAdmin.Admin()