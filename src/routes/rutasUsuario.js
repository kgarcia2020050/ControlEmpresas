const express = require("express");
const controlador = require("../controllers/usuariosController");

const md_autenticacion = require("../middlewares/autenticacion");

var api = express.Router();

api.post("/login", controlador.Login);
api.post("/crearEmpresa", md_autenticacion.Auth, controlador.crearEmpresa);
api.put(
  "/editarEmpresa/:ID",
  md_autenticacion.Auth,
  controlador.editarEmpresas
);
api.delete(
  "/eliminarEmpresa/:ID",
  md_autenticacion.Auth,
  controlador.borrarEmpresas
);
api.get("/verEmpresas",md_autenticacion.Auth,controlador.verEmpresas)
module.exports = api;
