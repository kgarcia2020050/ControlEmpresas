const Usuarios = require("../models/usuarios");
const encriptar = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const Empleados = require("../models/empleados");
const { discriminators } = require("../models/usuarios");

function Admin() {
  var modeloUsuario = new Usuarios();
  Usuarios.find({ rol: "ADMIN" }, (error, administrador) => {
    if (administrador.length == 0) {
      modeloUsuario.nombre = "Kenneth";
      modeloUsuario.usuario = "Admin";
      modeloUsuario.rol = "ADMIN";
      clave = "123456";
      encriptar.hash(clave, null, null, (error, claveEncriptada) => {
        modeloUsuario.password = claveEncriptada;
        modeloUsuario.save((error, administrador) => {
          if (error) console.log("Error en la peticion.");
          if (!administrador) console.log("No se pudo crear al administrador.");
          console.log("Administrador: " + administrador);
        });
      });
    } else {
      console.log(
        "Ya existe un administrador." + " Sus datos son " + administrador
      );
    }
  });
}

function crearEmpresa(req, res) {
  if (req.user.rol == "EMPRESA") {
    return res
      .status(500)
      .send({ Error: "Las empresas no pueden registrar otras empresas." });
  }

  var datos = req.body;
  var modeloEmpresas = new Usuarios();
  if (datos.nombreEmpresa && datos.usuario && datos.password) {
    modeloEmpresas.nombre = datos.nombreEmpresa;
    modeloEmpresas.usuario = datos.usuario;
    modeloEmpresas.rol = "EMPRESA";

    Usuarios.find(
      { nombre: { $regex: datos.nombreEmpresa, $options: "i" } },
      (error, empresaAgregada) => {
        if (empresaAgregada.length == 0) {
          encriptar.hash(
            datos.password,
            null,
            null,
            (error, claveEncriptada) => {
              modeloEmpresas.password = claveEncriptada;
              modeloEmpresas.save((error, empresaAgregada) => {
                if (error)
                  return res
                    .status(500)
                    .send({ Error: "Error en la peticion." });
                if (!empresaAgregada)
                  return res.status(404).send({
                    Error: "No se pudo crear a la empresa.",
                  });
                return res.status(200).send({ Empresa_nueva: empresaAgregada });
              });
            }
          );
        } else {
          return res.status(500).send({ Error: "Esta empresa ya existe." });
        }
      }
    );
  } else {
    return res.status.send({ Error: "Debes llenar los campos solicitados." });
  }
}

function Login(req, res) {
  var datos = req.body;
  Usuarios.findOne({ usuario: datos.usuario }, (error, usuarioEncontrado) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (usuarioEncontrado) {
      encriptar.compare(
        datos.password,
        usuarioEncontrado.password,
        (error, verificacionDePassword) => {
          if (verificacionDePassword) {
            if (datos.obtenerToken === "true") {
              return res
                .status(200)
                .send({ token: jwt.crearToken(usuarioEncontrado) });
            } else {
              usuarioEncontrado.password = undefined;
              return res.status(500).send({ Usuario: usuarioEncontrado });
            }
          } else {
            return res.status(500).send({ Error: "La clave no coincide." });
          }
        }
      );
    } else {
      return res.status(500).send({ Error: "Los datos de inicio no existen." });
    }
  });
}

function editarEmpresas(req, res) {
  if (req.user.rol == "EMPRESA") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede editar a las empresas." });
  }

  var idEmpresa = req.params.ID;
  var datos = req.body;

  if (datos.rol) {
    return res.status(500).send({
      Error: "No se puede editar el rol de una empresa.",
    });
  }
  if (datos.nombre == null && datos.usuario == null && datos.password == null) {
    return res.status(500).send({ Error: "No hay campos para modificar." });
  }

  if (datos.password) {
    Usuarios.findByIdAndUpdate(
      idEmpresa,
      datos,
      { new: true },
      (error, empresaEditada) => {
        encriptar.hash(datos.password, null, null, (error, claveEncriptada) => {
          empresaEditada.password = claveEncriptada;

          Usuarios.findByIdAndUpdate(
            idEmpresa,
            empresaEditada,
            { new: true },
            (error, actualizacion) => {
              if (error)
                return res
                  .status(500)
                  .send({ Error: "Esta empresa no existe." });
              if (!actualizacion)
                return res.status(400).send({
                  Error: "No se pudo editar la informacion de la empresa.",
                });
              return res
                .status(200)
                .send({ Empresa_actualizada: actualizacion });
            }
          );
        });
      }
    );
  } else if (datos.nombre && datos.usuario) {
    Usuarios.find(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, empresaEncontrada) => {
        if (empresaEncontrada.length == 0) {
          Usuarios.findByIdAndUpdate(
            idEmpresa,
            datos,
            { new: true },
            (error, empresaEditada) => {
              if (error)
                return res
                  .status(500)
                  .send({ Error: "Esta empresa no existe." });
              if (!empresaEditada)
                return res.status(400).send({
                  Error: "No se pudo editar la informacion de la empresa.",
                });
              return res
                .status(200)
                .send({ Empresa_actualizada: empresaEditada });
            }
          );
        } else {
          return res
            .status(500)
            .send({ Error: "Ya hay una empresa con el mismo nombre." });
        }
      }
    );
  }else{
    return res.status(500).send({Error:"Debes llenar los campos obligatorios. (Nombre y Usuario)"})
  }
}

function borrarEmpresas(req, res) {
  if (req.user.rol == "EMPRESA") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede eliminar empresas." });
  }

  var id = req.params.ID;

  Usuarios.findByIdAndDelete(id, { new: true }, (error, empresaEliminada) => {
    Empleados.find({ idEmpresa: id }, (error, empleadosEmpresa) => {
      Empleados.deleteMany({ idEmpresa: id }, (error, empleadosBorrados) => {
        if (error)
          return res.status(500).send({ Error: "Error en la peticion." });
        if (!empleadosBorrados)
          return res.status(404).send({
            Error: "No se pudo eliminar a los empleados de la empresa.",
          });
        if (empresaEliminada != null) {
          //if (empleadosBorrados != 0) {
          return res.status(200).send({
            Empresa_eliminada: empresaEliminada,
          });
          // }
        } else {
          return res.status(200).send({ Error: "No existe la empresa." });
        }
      });
    });
  });
}

function verEmpresas(req, res) {
  if (req.user.rol == "EMPRESA") {
    return res.status(500).send({
      Error: "Solo el administrador puede visualizar a las otras empresas.",
    });
  }

  Usuarios.find({ rol: "EMPRESA" }, (error, empresas) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!empresas)
      return res
        .status(404)
        .send({ Error: "No se pueden visualizar las empresas." });
    if (empresas != 0) {
      return res
        .status(200)
        .send({ Empresas: empresas, Empresas_registradas: empresas.length });
    } else {
      return res.status(500).send({ Error: "No hay ninguna empresa. " });
    }
  });
}

module.exports = {
  Admin,
  Login,
  crearEmpresa,
  editarEmpresas,
  borrarEmpresas,
  verEmpresas,
};
