'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var EstadoSchema = new Schema({
    cod_estado: Number,
    nome_estado: String
});


module.exports = mongoose.model('Estado', EstadoSchema);