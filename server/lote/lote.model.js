'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LoteSchema = new Schema({
  comitente: { type: Schema.ObjectId, ref: 'Comitente' },
  leilao: { type: Schema.ObjectId, ref: 'Leilao' },
  leilaoHistory: [{ type: Schema.ObjectId, ref: 'Leilao' }],
  vendaDireta: { type: Schema.ObjectId, ref: 'VendaDireta' },
  categoria: { type: Schema.ObjectId, ref: 'Categorie' },
  subCategoria: { type: Schema.ObjectId, ref: 'Categorie' },
  estado: { type: Schema.ObjectId, ref: 'Estado' },
  cidade: { type: Schema.ObjectId, ref: 'Cidade' },
  principalImage: { type: Schema.ObjectId, ref: 'Image' },
  image: { type: Schema.ObjectId, ref: 'Image' },
  images: [{ type: Schema.ObjectId, ref: 'Image' }],
  tags: [String],
  video_link: String,
  retirado: {type:Boolean, default: false},
  vendido:  {type:Boolean, default: false},
  disponivel:  {type:Boolean, default: true},
  extra_info: String, 
  description: String,
  details: String,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  oldId:Number,
  LEILAO_ID:Number
});

module.exports = mongoose.model('Lote', LoteSchema);