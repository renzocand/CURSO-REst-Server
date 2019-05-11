const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion')

let app = express();
let Producto = require('../models/producto');


app.get('/productos', async (req, res) => {

    let Desde = req.query.desde || 0;
    Desde = Number(Desde)
    let limite = req.query.limite || 5;
    limite = Number(limite)

    let productos = await Producto.find()
        .populate("usuario", "nombre email")
        .populate("categoria")
        .skip(Desde)
        .limit(limite)

    res.json({
        ok: true,
        productos
    })
})

app.post('/productos', verificaToken, async (req, res) => {
    try {
        let body = req.body;
        let productoDB = new Producto({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible,
            categoria: body.categoria,
            usuario: req.usuario._id
        });
        await productoDB.save();
        res.json({
            ok: true,
            mensaje: 'Se creo correctamente'
        })
    } catch (error) {
        res.json({
            err: 'Hubo un error'
        })
    }
})

app.get('/productos/:id',async (req,res)=>{
    let id = req.params.id;
    let producto = await Producto.findById(id)
        .populate('usuario')
        .populate('categoria')
    res.json({
        ok:true,
        producto
    })
})


app.put('/productos/:id', async(req,res)=>{
    let id = req.params.id;
    let body = req.body;
    let cambio = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
    }
    await Producto.findByIdAndUpdate(id,{$set:cambio},{new:true});
    res.json({
        ok:true,
        mensaje: 'Tu producto se modifico correctamente'
    })
})

app.delete('/productos/:id', async(req,res)=>{
    let id = req.params.id;
    let cambiar = {
        disponible: false
    }
    await Producto.findByIdAndUpdate(id,{$set:cambiar},{new:true});

    res.json({
        ok:true,
        mensaje: 'Archivo borrado correctamente'
    })
})


module.exports = app;