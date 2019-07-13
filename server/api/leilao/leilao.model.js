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
  contraPropostaValor: Number,
  contraProposta: { type: Boolean, default: false },
  aceita: { type: Boolean, default: false },
  recusada: { type: Boolean, default: false },
  respondida: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

var Lance = new Schema({
  comprador: { type: Schema.ObjectId, ref: 'User' },
  valor: Number,
  vencedor: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  manual: { type: Boolean, default: false },
  oldId: Number,
});

var Lotes = new Schema({
  lote: { type: Schema.ObjectId, ref: 'Lote' },
  valorMinimoVenda: Number,
  lanceInicial: Number,
  incremento: Number,
  comissao: Number,
  endTime: Date,
   numero: Number,
  lances: [Lance],
  lanceAtual: Lance,
  compradorAtual: String,
  visitas: Number,
  encerrado: { type: Boolean, default: false },
  vendido: { type: Boolean, default: false },
  condicional: { type: Boolean, default: false },
    condicionalResposta: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  movido: { type: Boolean, default: false },
  pagamentoGerado: { type: Boolean, default: false },
  pagamentoConfirmado: { type: Boolean, default: false },
  pagamentoConfirmadoNroBoleto:String,
  boletoHtml:String,
  nfeGerada: { type: Boolean, default: false },
  nota:{
    empresa:{ type: String, default: 'Leiloar Participações S.A.' },
    data:{ type: Date, default: new Date() },
    arrematante:String,
    endereco:String,
    numero:String,
    cidade:String,
    estado:String,
    cep:String,
    telefone:String,
    doc1:String,
    doc2:String,
    lotes:[{
      numero:String,
      descricao:String,
      valor:Number
    }],
    autenticacao:Schema.ObjectId,
    subTotal:Number,
    comissao:Number,
    taxa:Number,
    total:Number,
    numeracao: Number
  },
  notaGerada: { type: Boolean, default: false },
  propostas: [Proposta],
  propostaAceita: Proposta,
  modoVenda:{ type: String, default: 'lance' }
});

var LeilaoSchema = new Schema({
  description: String,
  status: Number,
  tipo: Number,
  comitentes: [{ type: Schema.ObjectId, ref: 'Comitente' }],
  condicaoVenda: { type: Schema.ObjectId, ref: 'CondicaoVenda' },
  endDateTime: Date,
  retirada: String,
  visitacao: String,
  info_extra: String,
  lotes: [Lotes],
  usuariosHabilitados: [{ type: Schema.ObjectId, ref: 'User' }],
  encerrado: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  isClone: { type: Boolean, default: false },
  cloneOf: { type: Schema.ObjectId, ref: 'Leilao' },
  oldId: Number,
  image: { type: Schema.ObjectId, ref: 'Image' }
});


LeilaoSchema.plugin(deepPopulate);
LeilaoSchema.plugin(autoIncrement.plugin, { model: 'Leilao', field: 'leilaoId', startAt: 1 });
LeilaoSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Leilao', LeilaoSchema);
