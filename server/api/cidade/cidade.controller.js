'use strict';

var _ = require('lodash');
var Cidade = require('./cidade.model');

// Get list of logs
exports.index = function (req, res) {
  Cidade.find(function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

exports.getByEstado = function (req, res) {
  console.log('getByEstado');
  console.log(req.body);
  var codEstado = req.body.cod_estado;
  Cidade.find({ cod_estado: codEstado }, function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

exports.getByCod = function (req, res) {
  console.log('getByCod');
  console.log(req.body);
  var cod = req.body.cod;
  Cidade.findOne({ cod_cidade: cod }, function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

exports.getByName = function (req, res) {
  console.log('getByName');
  console.log(req.body);
  var name = req.body.name;
  Cidade.findOne({ nome_cidade: name }, function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

// Get a single service
exports.show = function (req, res) {
  Cidade.findById(req.params.id, function (err, cidade) {
    if (err) { return handleError(res, err); }
    if (!cidade) { return res.send(404); }
    return res.json(cidade);
  });
};

// Creates a new cidade in the DB.
exports.create = function (req, res) {
  Cidade.create(req.body, function (err, cidade) {
    if (err) {
      return handleError(res, err);
    }
    SockCtrl.emit(cidade);
    return res.json(201, cidade);
  });
};

// Updates an existing cidade in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Cidade.findById(req.params.id, function (err, cidade) {
    if (err) { return handleError(res, err); }
    if (!cidade) { return res.send(404); }
    var updated = _.merge(cidade, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, cidade);
    });
  });
};

// Deletes a cidade from the DB.
exports.destroy = function (req, res) {
  Cidade.findById(req.params.id, function (err, cidade) {
    if (err) { return handleError(res, err); }
    if (!cidade) { return res.send(404); }
    cidade.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}