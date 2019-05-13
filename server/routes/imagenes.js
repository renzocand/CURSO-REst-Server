const express = require('express');
const fs = require('fs');
const path = require('path');
const {verificaTokenImg} = require('../middlewares/autenticacion')
let app = express();

app.get('/imagen/:tipo/:img',verificaTokenImg, (req,res)=>{
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`)
    let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');

    if(fs.existsSync(pathImg)){
        return res.sendFile(pathImg);
    }
    res.sendFile(noImagePath);

    
})

module.exports = app;