const express = require("express");
const cors = require("cors");
var app = express();

const rutaUsers=require("./src/routes/rutasUsuario")
const rutaEmpresas=require("./src/routes/rutasEmpresas")
 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());
app.use("/api",rutaUsers,rutaEmpresas)
module.exports = app;
