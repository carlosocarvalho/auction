'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ComitenteSchema = new Schema({
  tipoPessoa: { type: String, default: '1' },
  showPublic: { type: Boolean, default: true },
  email: { type: String, lowercase: true },
  phone: String,
  celPhone: String,
  name: String,
  lastName: String,
  simpleName: String,
  doc1: String,
  doc2: String,
  gender: String,

  razaoSocial: String,
  nomeFantasia: String,
  contact: String,
  contactDoc1: String,

  addressType: String,
  postalCode: String,
  addressStreet: String,
  addressNumber: String,
  addressComplement: String,
  addressState: { type: Schema.ObjectId, ref: 'Estado' },
  addressCity: { type: Schema.ObjectId, ref: 'Cidade' },
  addressRegion: String,

  bank: String,
  agency: String,
  agencyDigit: String,
  account: String,
  accountDigit: String,

  info: String,

  parceiro: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  image: { type: Schema.ObjectId, ref: 'Image' },
  idAntigo:Number
});

module.exports = mongoose.model('Comitente', ComitenteSchema);