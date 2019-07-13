'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  autoIncrement = require('mongoose-auto-increment');

var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');


var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);


var config = require('../../config/environment');

var connection = mongoose.createConnection(config.mongo.uri);

autoIncrement.initialize(connection);

var Proposta = new Schema({
  comprador: { type: Schema.ObjectId, ref: 'User' },
  valor: Number,
  vencedor: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  contraPropostaValor: Number,
  contraProposta: { type: Boolean, default: false },
  aceita: { type: Boolean, default: false },
  recusada: { type: Boolean, default: false },
  respondida: { type: Boolean, default: false }
});

var Lotes = new Schema({
  lote: { type: Schema.ObjectId, ref: 'Lote' },
  valorMinimoVenda: Number,
  comissao: Number,
  propostas: [Proposta],
  visitas: Number,
  numero:String,
  encerrado: { type: Boolean, default: false },
  vendido: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
});

var VendaDiretaSchema = new Schema({
  description: String,
  status: Number,
  tipo: Number,
  comitente: { type: Schema.ObjectId, ref: 'Comitente' },
  condicaoVenda: { type: Schema.ObjectId, ref: 'CondicaoVenda' },
  startDateTime: Date,
  retirada: String,
  visitacao: String,
  info_extra: String,
  lotes: [Lotes],
  usuariosHabilitados: [{ type: Schema.ObjectId, ref: 'User' }],
  encerrado: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  oldId: Number
});

VendaDiretaSchema.plugin(deepPopulate);
VendaDiretaSchema.plugin(autoIncrement.plugin, { model: 'VendaDireta', field: 'vendaDiretaId', startAt: 1 });
VendaDiretaSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('VendaDireta', VendaDiretaSchema);
