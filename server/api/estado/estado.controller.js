'use strict';

var _ = require('lodash');
var Estado = require('./estado.model');
 var SockCtrl = require('../../socketCtrl');

// Get list of logs
exports.index = function (req, res) {
  Estado.find(function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

// Get a single service
exports.show = function (req, res) {
  Estado.findById(req.params.id, function (err, estado) {
    if (err) { return handleError(res, err); }
    if (!estado) { return res.send(404); }
    return res.json(estado);
  });
};

exports.getByCod = function (req, res) {
  console.log('getByCod');
  console.log(req.body);
  var cod = req.body.cod;
  Estado.findOne({ cod_estado: cod }, function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

exports.getByName = function (req, res) {
  console.log('getByName');
  console.log(req.body);
  var name = req.body.name;
  Estado.findOne({ nome_estado: name }, function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

// Creates a new estado in the DB.
exports.create = function (req, res) {
  Estado.create(req.body, function (err, estado) {
    if (err) {
      return handleError(res, err);
    }
    SockCtrl.emit(estado);
    return res.json(201, estado);
  });
};

// Updates an existing estado in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Estado.findById(req.params.id, function (err, estado) {
    if (err) { return handleError(res, err); }
    if (!estado) { return res.send(404); }
    var updated = _.merge(estado, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, estado);
    });
  });
};





// Deletes a estado from the DB.
exports.destroy = function (req, res) {
  Estado.findById(req.params.id, function (err, estado) {
    if (err) { return handleError(res, err); }
    if (!estado) { return res.send(404); }
    estado.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}