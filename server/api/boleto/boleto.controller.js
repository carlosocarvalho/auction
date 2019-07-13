'use strict';

var _ = require('lodash');
var Boleto = require('./boleto.model');
var Util = require('../utils/util');
var BoletoObj = require('node-boleto').Boleto;
var Taxa = require('../taxa/taxa.model');

// Get list of roles
exports.index = function (req, res) {
  Boleto.find({ deleted: false }, function (err, boletos) {
    if (err) { return handleError(res, err); }
    return res.json(200, boletos);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');
  Boleto.find({ active: true, deleted: false }, function (err, boletos) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, boletos);
  });
};


exports.generate = function (req, res) {
  console.log('generate');
  var boleto = new BoletoObj({
    'banco': "bradesco",
    'data_emissao': new Date(),
    'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
    'valor': 1500,
    'nosso_numero': "6",
    'numero_documento': "1",
    'cedente': "Pagar.me Pagamentos S/A",
    'cedente_cnpj': "18589315000181",
    'agencia': "2878",
    'codigo_cedente': "469",
    'carteira': "25",
    'pagador': "Nome do pagador\nCPF: 000.000.000-00",
    'local_de_pagamento': "PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.",
    'instrucoes': "Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.",
  });
  Boleto.barcodeRenderEngine = 'img';

  console.log("Linha digitável: " + boleto['linha_digitavel'])

  boleto.renderHTML(function (html) {
    // console.log(html.toString());
    //  res.setHead(202,{"Content-type":"text/html"});
    // res.send(html);
    //return res.json(200, html.toString());
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(html);
    res.end();
  });
};


exports.generateHtml = function (lote, leilaoId, valor, comprador, callback) {
  console.log('generateHtml');
  var _retorno = { erro: false, html: "" };
  Boleto.findOne({ deleted: false }, function (err, boletoObj) {
    console.log('generateHtml', 'achou o boleto');
    if (err) {
      console.log(err);
      callback(err, null);
      return;
    }
    Taxa.findOne({
      minValue: { $lte: valor }, maxValue: { $gte: valor }}, function(err, taxa) {
        
        if(taxa == null){
          console.log('generateHtml', 'nao achou a taxa. Cadastre as taxas');
          //callback(null, html);
          callback(null, _retorno.html);
          return;
        }
        console.log('generateHtml', 'achou o taxa');
        if (err) {
          console.log(err);
          callback(err, null);
          return;
        }

        
        var _valor = valor + ((valor * lote.comissao) / 100) + taxa._doc.appTax;
        var boleto = new BoletoObj({
          'banco': "bradesco",
          'data_emissao': new Date(),
          'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
          'valor': _valor,
          'nosso_numero': "6",
          'numero_documento': leilaoId.toString() + lote.numero,
          'cedente': boletoObj._doc.nomeEmpresa,
          'cedente_cnpj': boletoObj._doc.cnpjEmpresa,
          'agencia': boletoObj._doc.agencia,
          'codigo_cedente': boletoObj.codCedente ? boletoObj.codCedente : 0,
          'carteira': boletoObj._doc.carteira,
          'pagador': comprador,
          'local_de_pagamento': "PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.",
          'instrucoes': "Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.",
        });

        boleto.renderHTML(function (html) {
          console.log('generateHtml', 'gerou o html');
          callback(null, html);
          return;
        });
      });
  });




};

// Get a single role
exports.show = function (req, res) {

  Boleto.findById(req.params.id)
    .populate("estado")
    .populate("cidade")
    .exec(function (err, boleto) {
      if (err) { return handleError(res, err); }
      if (!boleto) { return res.send(404); }
      return res.json(boleto);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  console.log(req.body);
  Boleto.create(req.body, function (err, boleto) {
    if (err) { return handleError(res, err); }
    return res.json(201, boleto);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('>> to no update <<');
  console.log(req.body);
  if (req.body._id) { delete req.body._id; }
  Boleto.findById(req.params.id, function (err, boleto) {
    if (err) { return handleError(res, err); }
    if (!boleto) { return res.send(404); }
    var updated = _.merge(boleto, req.body);


    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, boleto);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Boleto.findById(req.params.id, function (err, boleto) {
//     if (err) { return handleError(res, err); }
//     if (!boleto) { return res.send(404); }
//     boleto.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Boleto.findById(req.params.id, function (err, boleto) {
    if (err) { return handleError(res, err); }
    if (!boleto) { return res.send(404); }
    boleto.deleted = true;
    boleto.active = false;
    boleto.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};


exports.search = function (req, res) {

  console.log(req.body);

  var user = req.user,
    page = req.body.page || 0,
    query = {},
    fields = {},
    paging = {
      skip: page * 10,
      limit: 10
    };

  query.deleted = false;

  if (req.body.nomeBanco)
    query.nomeBanco = new RegExp(req.body.nomeBanco, 'i');

  if (req.body.nomeEmpresa)
    query.nomeEmpresa = new RegExp(req.body.nomeEmpresa, 'i');

  if (req.body.cnpjEmpresa)
    query.cnpjEmpresa = new RegExp(req.body.cnpjEmpresa, 'i');

  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Boleto
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, boleto) {
      if (err) {
        return handleError(res, err);
      }
      Boleto.count(query, function (err, total) {
        var obj = {
          total: total,
          data: boleto
        };
        return res.json(200, obj);
      })
    });
};

function buildFilter(obj, query) {

  console.log('olha a query aqui ==>>> ', obj);

  if (obj.name)
    query.name = new RegExp(obj.name, 'i');


  if (obj.active)
    query.active = obj.active;

  return query;

}



function handleError(res, err) {
  return res.send(500, err);
};