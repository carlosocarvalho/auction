'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var CidadeSchema = new Schema({
    cod_estado: Number,
    cod_cidade: Number ,
    nome_cidade: String
});


module.exports = mongoose.model('Cidade', CidadeSchema);