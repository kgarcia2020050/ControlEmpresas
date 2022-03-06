const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EmpleadosSchema = new Schema({
  nombreEmpleado: String,
  puestoEmpleado:String,
  deptEmpleado:String,
  idEmpresa:{type:Schema.Types.ObjectId,ref:"Empresas"}
});

module.exports = mongoose.model("Empleados", EmpleadosSchema);
