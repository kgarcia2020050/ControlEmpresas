const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UsuariosSchema =new Schema({
  nombre: String,
  usuario: String,
  password: String,
  rol: String
});

module.exports = mongoose.model("Usuarios", UsuariosSchema);