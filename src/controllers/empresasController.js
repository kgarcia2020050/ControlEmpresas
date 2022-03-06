const Empleados = require("../models/empleados");
("use strict");

const PDFDocument = require("../Pdf/TablasPdf");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");

function crearEmpleados(req, res) {
  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden agregar a sus empleados." });
  }

  var datos = req.body;
  var modeloEmpleados = new Empleados();

  if (datos.nombre && datos.puesto && datos.departamento) {
    modeloEmpleados.nombreEmpleado = datos.nombre;
    modeloEmpleados.puestoEmpleado = datos.puesto;
    modeloEmpleados.deptEmpleado = datos.departamento;

    modeloEmpleados.idEmpresa = req.user.sub;

    modeloEmpleados.save((error, nuevoEmpleado) => {
      if (error)
        return res.status(404).send({ Error: "Error en la peticion." });
      if (error)
        return res
          .status(500)
          .send({ Error: "No se pudo agregar al empleado." });

      Empleados.find(
        { idEmpresa: req.user.sub },
        (error, nuestrosEmpleados) => {
          return res.status(200).send({
            Nuevo_empleado: nuevoEmpleado,
            Cantidad_de_empleados: nuestrosEmpleados.length,
          });
        }
      );
    });
  } else {
    return res.status(500).send({ Error: "Debes rellenar los campos." });
  }
}

function verEmpleados(req, res) {
  if (req.user.rol == "ADMIN") {
    return res.status(500).send({
      Error: "Solo las empresas pueden visualizar a sus empleados.",
    });
  }
  Empleados.find({ idEmpresa: req.user.sub }, (error, nuestrosEmpleados) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion" });
    if (!nuestrosEmpleados)
      return res
        .status(500)
        .send({ Error: "Error al querer visualizar a sus empleados." });
    if (nuestrosEmpleados.length != 0) {
      return res.status(200).send({
        Empleados: nuestrosEmpleados,
        Cantidad_de_empleados: nuestrosEmpleados.length,
      });
    } else {
      return res.status(200).send({ Mensaje: "No tienes ningun empleado." });
    }
  });
}

function empleadoPorId(req, res) {
  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden visualizar a sus empleados." });
  }
  var idUser = req.params.ID;

  Empleados.find(
    { _id: idUser, idEmpresa: req.user.sub },
    (error, empleadoEncontrado) => {
      if (error)
        return res.status(500).send({ Error: "No existe el empleado." });
      if (!empleadoEncontrado)
        return res
          .status(404)
          .send({ Error: "Solo puedes buscar dentro de tus empleados." });

      if (empleadoEncontrado != 0) {
        return res.status(200).send({ Empleado: empleadoEncontrado });
      } else {
        return res.status(200).send({ Mensaje: "No existe el empleado." });
      }
    }
  );
}

function empleadoPorNombre(req, res) {
  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden visualizar a sus empleados." });
  }
  var userName = req.body.nombreEmpleado;

  Empleados.find(
    {
      nombreEmpleado: { $regex: userName, $options: "i" },
      idEmpresa: req.user.sub,
    },
    (error, usuarioEcontrado) => {
      if (error)
        return res.status(500).send({ Error: "Error en la peticion." });
      if (!usuarioEcontrado)
        return res.status(404).send({ Error: "No existe el empleado." });

      if (usuarioEcontrado != 0) {
        return res.status(200).send({
          Empleados: usuarioEcontrado,
          Empleados_con_el_nombre: usuarioEcontrado.length,
        });
      } else {
        return res
          .status(200)
          .send({ Mensaje: "No hay ningun empleado con ese nombre." });
      }
    }
  );
}

function empleadoPorPuesto(req, res) {
  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden visualizar a sus empleados." });
  }

  var puesto = req.body.puesto;
  Empleados.find(
    {
      puestoEmpleado: { $regex: puesto, $options: "i" },
      idEmpresa: req.user.sub,
    },
    (error, usuarioEcontrado) => {
      if (error)
        return res.status(500).send({ Error: "Error en la peticion." });
      if (!usuarioEcontrado)
        return res.status(404).send({ Error: "El puesto no existe." });
      if (usuarioEcontrado != 0) {
        return res.status(200).send({
          Empleados: usuarioEcontrado,
          Empleados_con_el_puesto: usuarioEcontrado.length,
        });
      } else {
        return res
          .status(200)
          .send({ Mensaje: "No hay empleados con ese puesto." });
      }
    }
  );
}

function departamentos(req, res) {
  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden visualizar a sus empleados." });
  }
  var dept = req.body.departamento;

  Empleados.find(
    {
      deptEmpleado: { $regex: dept, $options: "i" },
      idEmpresa: req.user.sub,
    },
    (error, usuarioEcontrado) => {
      if (error)
        return res.status(500).send({ Error: "Error en la peticion." });
      if (!usuarioEcontrado)
        return res.status(404).send({ Error: "No existe el departamento." });
      if (usuarioEcontrado != 0) {
        return res.status(200).send({
          Empleados: usuarioEcontrado,
          Empleados_en_el_departamento: usuarioEcontrado.length,
        });
      } else {
        return res
          .status(200)
          .send({ Mensaje: "No hay empleados en este departamento." });
      }
    }
  );
}

function editarEmpleados(req, res) {
  var idEmpleado = req.params.ID;
  var datos = req.body;

  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden modificar a sus empleados." });
  }

  Empleados.findOneAndUpdate(
    { _id: idEmpleado, idEmpresa: req.user.sub },
    datos,
    { new: true },
    (error, empleadoEditado) => {
      if (error)
        return res.status(500).send({ Error: "El empleado no existe." });
      if (!empleadoEditado)
        return res
          .status(404)
          .send({ Error: "Solo puedes editar a tus empleados." });

      return res.status(200).send({ Empleado_actualizado: empleadoEditado });
    }
  );
}

function borrarEmpleado(req, res) {
  var idEmpleado = req.params.ID;

  if (req.user.rol == "ADMIN") {
    return res
      .status(500)
      .send({ Error: "Solo las empresas pueden eliminar a sus empleados." });
  }
  Empleados.findOneAndDelete(
    { _id: idEmpleado, idEmpresa: req.user.sub },
    (err, empleadoEliminado) => {
      if (err) return res.status(500).send({ Error: "El empleado no existe." });
      if (!empleadoEliminado)
        return res
          .status(404)
          .send({ Error: "Solo puedes eliminar a tus empleados." });
      return res.status(200).send({
        Empleado_eliminado: empleadoEliminado,
      });
    }
  );
}

function generarPdf(req, res) {
  if (req.user.rol == "ADMIN") {
    return res.status(500).send({
      Error: "Solo las empresas pueden descargar la lista de sus empleados.",
    });
  }

  Empleados.find({ idEmpresa: req.user.sub }, (error, nuestrosEmpleados) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!nuestrosEmpleados)
      return res.status(404).send({ Error: "No se pudo generar el PDF." });
    if (nuestrosEmpleados == 0) {
      return res.status(500).send({ Error: "No tienes ningun empleado." });
    }

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream("Empleados de " + req.user.nombre + ".pdf"));
    doc.pipe(res);
    doc
      //.image("../Pdf/pngwing.com.png")
      .fillColor("#141414")
      .strokeColor("#22366B")
      .fontSize(20)
      .text("Empleados de " + req.user.nombre, { align: "center" })
      .fontSize(10)
      .moveDown();

    const table = {
      headers: ["ID", "Nombre", "Puesto", "Departamento"],
      rows: [],
    };

    for (const datos of nuestrosEmpleados) {
      table.rows.push([
        datos._id,
        datos.nombreEmpleado,
        datos.puestoEmpleado,
        datos.deptEmpleado,
      ]);
    }

    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold"),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
    });

    doc.end();
  });
}

function generarExcel(req, res) {
  if (req.user.rol == "ADMIN") {
    return res.status(500).send({
      Error: "Solo las empresas pueden descargar la lista de sus empleados.",
    });
  }
  Empleados.find({ idEmpresa: req.user.sub }, (error, nuestrosEmpleados) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!nuestrosEmpleados)
      return res
        .status(404)
        .send({ Error: "No se pudo generar el archivo Excel." });
    if (nuestrosEmpleados == 0) {
      return res.status(500).send({ Error: "No tienes ningun empleado." });
    }
    /*  for (const datos of nuestrosEmpleados) {
      var info = [
        {
          Nombre: datos.nombreEmpleado,
          Puesto: datos.puestoEmpleado,
          Departamento: datos.deptEmpleado,
        },
      ];
    } */

    var workBook = XLSX.utils.book_new();

    for (var a = 0; a < nuestrosEmpleados.length; a++) {
      var info = [
        {
          "Empleados de": req.user.nombre,
          Nombre: nuestrosEmpleados[a].nombreEmpleado,
          Puesto: nuestrosEmpleados[a].puestoEmpleado,
          Departameto: nuestrosEmpleados[a].deptEmpleado,
        },
      ];

      var workSheet = XLSX.utils.json_to_sheet(info);

      XLSX.utils.book_append_sheet(workBook, workSheet, "info");

      XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });

      XLSX.write(workBook, { bookType: "xlsx", type: "binary" });

      XLSX.writeFile(workBook, "Empleados de " + req.user.nombre + ".xlsx");

      return res.status(200).send({ Exito: "Archivo excel creado." });
    }
  });
}

module.exports = {
  crearEmpleados,
  verEmpleados,
  editarEmpleados,
  borrarEmpleado,
  generarPdf,
  generarExcel,
  empleadoPorNombre,
  empleadoPorId,
  empleadoPorPuesto,
  departamentos,
};
