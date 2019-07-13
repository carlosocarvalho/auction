'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BoletoSchema = new Schema({
  agencia: Number,
  digAgencia: Number,
  conta: Number,
  digConta: Number,
  prazo: Number,
  carteira: Number,
  taxa: Number,
  codBanco: Number,
  nomeBanco: String,
  gerente: String,
  telefone: String,
  nomeEmpresa: String,
  cnpjEmpresa: String,
  endEmpresa: String,
  codCedente: Number,
  instrPagamento: String,
  localPagamento: String,
  estado: { type: Schema.ObjectId, ref: 'Estado' },
  cidade: { type: Schema.ObjectId, ref: 'Cidade' },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Boleto', BoletoSchema);