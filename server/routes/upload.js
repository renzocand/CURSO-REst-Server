const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto')
const fs = require('fs');
const path = require('path')
const app = express();

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function (req, res) {

  let tipo = req.params.tipo
  let id = req.params.id

  if (Object.keys(req.files).length == 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No se ha seleccionado ningun archivo'
    });
  }

  //Validar tipo
  let tiposValidos = ['productos', 'usuarios'];
  if (tiposValidos.indexOf(tipo) < 0) {
    res.status(400).json({
      ok: false,
      mensaje: `Los tipos permitidos son ${tiposValidos.join(', ')}`,
      tipo
    })
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let archivo = req.files.archivo;
  let nombrecortado = archivo.name.split('.');
  let extension = nombrecortado[nombrecortado.length - 1];

  //Extensiones permitidas
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
      ext: extension
    })
  }

  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function (err) {
    if (err)
      return res.status(500).json({
        ok: false,
        err
      });
  
      if(tipo === 'productos'){
        return imagenProducto(id, res, nombreArchivo);

      }
      if(tipo === 'usuarios'){
        return  imagenUsuario(id, res, nombreArchivo);
      }
      res.json({
        ok: false,
        mensaje: 'Eliga un tipo adecuado'
      })
  });
});

// FUNCION IMAGENUSUARIO
let imagenUsuario = async (id, res, nombreArchivo) => {
  try {
    usuarioDB = await Usuario.findById(id);
    if (!usuarioDB) {
      borrarArchivo(nombreArchivo, 'usuarios')
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe el usuario'
      })
    }

    borrarArchivo(usuarioDB.img, 'usuarios')

    usuarioDB.img = nombreArchivo;

    usuarioGuardado = await usuarioDB.save()
    res.json({
      ok: true,
      usuario: usuarioGuardado,
      img: nombreArchivo
    })

  } catch (error) {
    borrarArchivo(nombreArchivo, 'usuarios')
    res.status(500).json({
      ok: false,
      error
    })
  }

}

// FUNCION IMAGENPRODUCTO
let imagenProducto = async (id, res, nombreArchivo) => {
  try {
    let productoDB = await Producto.findById(id);
    if (!productoDB) {
      borrarArchivo(nombreArchivo, 'productos')
      return res.json({
        ok: false,
        mensaje: 'No existe ese producto'
      })
    }
    borrarArchivo(productoDB.img, 'productos')
    productoDB.img = nombreArchivo;
    let productoGuardado = await productoDB.save();
    res.json({
      ok: false,
      producto: productoGuardado,
      img: nombreArchivo,
      mensaje: 'Se guardo correctamente'
    })
  } catch (error) {
    borrarArchivo(nombreArchivo, 'productos')
    res.status(500).json({
      ok: false,
      error
    })
  }

}

let borrarArchivo = (nombreImagen, tipo) => {
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)

  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen)
  }
}

module.exports = app;