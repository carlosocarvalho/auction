'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Lances_arrematadoSchema = new Schema({
  oldId: Number,
  LOTE_ID: Number,
  LEILAO_ID:  Number,
  VENDIDO:  String,
  USER_ID: Number, 
  TOTAL: Number,
  VALOR_ANTES_PROPOSTA: Number,
  DATAHORA: Date,
  LANCE_ID:Number,
  LIBERADO:String,
  CONDICIONAL:String,
  ENCERRADO:String,
  FECHADO:String
});

module.exports = mongoose.model('Lances_arrematado', Lances_arrematadoSchema);