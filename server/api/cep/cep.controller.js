'use strict';

var _ = require('lodash');

const VIACEP_URI = 'https://viacep.com.br';

const syncRequest = require('sync-request');
var CodigoPostal = require('./codigoPostal.model');


// Get a single goal
exports.getAddressBrazil = function (req, res) {
  console.log('getAddressBrazil 22');
  var cep = req.params.cep;
  let data;
  data = syncRequest('GET', `${VIACEP_URI}/ws/${cep}/json`);
  data = JSON.parse(data.getBody());
  console.log(data);

  let retorno = {};
  retorno.nome_rua = data.logradouro;
  retorno.bairro = data.bairro;
  retorno.nome_cidade = data.localidade;
  retorno.nome_estado = data.uf;
  retorno.complemento = data.complemento;


  return res.json(retorno);
};


exports.getAddress = function (req, res) {
  console.log('getAddress');
  // console.log(req.params.cep);
  var cep = req.params.cep.toString();
  var ind = cep.length - 4;
  var qtd = cep.length - ind;
  console.log(cep);
   console.log(ind);
    console.log(qtd);
  var codPostalExtensao = parseInt(cep.substring(ind+1));
  var codPostal = parseInt(cep.substring(0, qtd));


  console.log(codPostal);
  console.log(codPostalExtensao);


  CodigoPostal.findOne({ cod_postal: codPostal, extensao_cod_postal: codPostalExtensao },
    function (err, codigoPostal) {
      if (err) { return handleError(res, err); }

      console.log(codigoPostal);
      return res.json(200, codigoPostal);
    });
};

function handleError(res, err) {
  return res.send(500, err);
}