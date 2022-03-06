const express = require("express");
const controlador = require("../controllers/empresasController");

const md_autenticacion=require("../middlewares/autenticacion");

var api = express.Router();

api.post("/agregarEmpleado",md_autenticacion.Auth,controlador.crearEmpleados);
api.get("/verEmpleados",md_autenticacion.Auth,controlador.verEmpleados)
api.get("/idEmpleado/:ID",md_autenticacion.Auth,controlador.empleadoPorId)
api.get("/empleadoNombre",md_autenticacion.Auth,controlador.empleadoPorNombre)
api.get("/empleadoPuesto",md_autenticacion.Auth,controlador.empleadoPorPuesto)
api.get("/departamentos",md_autenticacion.Auth,controlador.departamentos)
api.delete("/eliminar/:ID",md_autenticacion.Auth,controlador.borrarEmpleado)
api.put("/editarEmpleado/:ID",md_autenticacion.Auth,controlador.editarEmpleados)
api.get("/pdf",md_autenticacion.Auth,controlador.generarPdf)
api.get("/excel",md_autenticacion.Auth,controlador.generarExcel)

module.exports = api;