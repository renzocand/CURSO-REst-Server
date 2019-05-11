const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

let app = express();

let Categoria = require('../models/categoria')

//============================
// Mostrar todas las categorias
//=============================
app.get('/categoria', async (req,res)=>{
    let categoria = await Categoria.find()
        .sort('descripcion')
        .populate('usuario','nombre email')
        res.json(categoria)
})

//============================
// Mostrar una categoria por ID
//=============================
app.get('/categoria/:id',verificaToken, async (req,res)=>{
    let id = req.params.id
    let categoria = await Categoria.findById(id);

    res.json({
        ok: true,
        categoria
    })
})


app.post('/categoria',verificaToken, async (req,res)=>{
    let body = req.body
    let categoriaDB = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    await categoriaDB.save()

    res.json({
        ok : true,
        mensaje: 'se creo la categoria correctamente'
    })

})

app.delete('/categoria/:id',[verificaToken, verificaAdmin_Role ], async (req,res)=>{
    let id = req.params.id;
    await Categoria.findByIdAndRemove(id);
    res.json({
        ok: true,
        mensaje: 'Categoria eliminada'
    })
})


app.put('/categoria/:id',verificaToken, async (req,res)=>{
    let id = req.params.id;
    let body = req.body;
    let categoriaDB = {
        descripcion: body.descripcion
    }
    let categoria = await Categoria.findByIdAndUpdate(id, {$set:categoriaDB}, {new: true});
    res.json({
        ok: true,
        categoria
    })
})









module.exports = app;