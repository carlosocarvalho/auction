'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var CodigoPostalSchema = new Schema({
    cod_estado: Number,
    cod_cidade: Number ,
    bairro: String,  
    tipo_rua: String,
    nome_rua: String, 
    termsOfUse: String,
    support: String,  
    cod_postal: Number,
    extensao_cod_postal: Number

});


module.exports = mongoose.model('CodigoPostal', CodigoPostalSchema);