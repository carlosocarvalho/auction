'use strict';

var _ = require('lodash');

var Leilao = require('../leilao/leilao.model');
var User = require('../user/user.model');
var SockCtrl = require('../../socketCtrl');

// Get list of logs
exports.index = function (req, res) {
  Cidade.find(function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

exports.main = function (req, res) {
  console.log('main');
  console.log(req.body);
  var _obj = {};
  Leilao.count({ status: 2, active: true, deleted: false }, function (err, lAndamento) {
    if (err) { return handleError(res, err); }
    _obj.lAndamento = lAndamento;
    Leilao.count({ active: true, deleted: false }, function (err, tLeilao) {
      if (err) { return handleError(res, err); }
      _obj.tLeilao = tLeilao;
      User.count({ active: true, deleted: false }, function (err,tUsuarios) {
        if (err) { return handleError(res, err); }
        _obj.tUsuarios = tUsuarios;
        _obj.cUsuarios = SockCtrl.getCount();
        return res.json(200, _obj);
      });
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}