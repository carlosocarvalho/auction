'use strict';

var _ = require('lodash');
var Comitente = require('./comitente.model');
var Util = require('../utils/util');

// Get list of roles
exports.index = function (req, res) {
  Comitente.find({ deleted: false }, function (err, comitentes) {
    if (err) { return handleError(res, err); }
    return res.json(200, comitentes);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');
  Comitente.find({ active: true, deleted: false, showPublic: true }, function (err, comitentes) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, comitentes);
  });
};

exports.getSimpleActive = function (req, res) {
  console.log('getSimpleActive');
  Comitente.find({ active: true, deleted: false, showPublic: true }, { _id: 1, simpleName: 1 }, function (err, comitentes) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, comitentes);
  });
};

// Get a single role
exports.show = function (req, res) {

  Comitente.findById(req.params.id)
    .populate('addressCity', 'nome_cidade')
    .populate('addressState', 'nome_estado')
    .exec(function (err, comitente) {
      if (err) { return handleError(res, err); }
      if (!comitente) { return res.send(404); }
      return res.json(comitente);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  console.log('create');
  console.log(req.body);

  if (req.body.tipoPessoa == '2') {
    req.body.simpleName = Util.removeAccents(req.body.name + ' ' + req.body.lastName);
  } else {
    req.body.simpleName = Util.removeAccents(req.body.nomeFantasia);
  }


  Comitente.create(req.body, function (err, comitente) {
    if (err) { return handleError(res, err); }
    return res.json(201, comitente);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  if (req.body._id) { delete req.body._id; }
  Comitente.findById(req.params.id, function (err, comitente) {
    if (err) { return handleError(res, err); }
    if (!comitente) { return res.send(404); }
    var updated = _.merge(comitente, req.body);


    if (updated.tipoPessoa == '2') {
      updated.simpleName = Util.removeAccents(updated.name + ' ' + updated.lastName);
    } else {
      updated.simpleName = Util.removeAccents(updated.nomeFantasia);
    }


    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, comitente);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Comitente.findById(req.params.id, function (err, comitente) {
//     if (err) { return handleError(res, err); }
//     if (!comitente) { return res.send(404); }
//     comitente.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Comitente.findById(req.params.id, function (err, comitente) {
    if (err) { return handleError(res, err); }
    if (!comitente) { return res.send(404); }
    comitente.deleted = true;
    comitente.active = false;
    comitente.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};


exports.search = function (req, res) {
  console.log('search');
  console.log(req.body);

  var user = req.user,
    page = req.body.page || 0,
    query = {},
    fields = {
      email: 1,
      doc1: 1,
      simpleName: 1,
      phone: 1,
      tipoPessoa: 1,
      active: 1
    },
    paging = {
      skip: page * 10,
      limit: 10
    };

  query.deleted = false;

  if (req.body.simpleName)
    query.simpleName = new RegExp(req.body.simpleName, 'i');

  if (req.body.tipoPessoa)
    query.tipoPessoa = req.body.tipoPessoa;

  if (req.body.doc1)
    query.doc1 = req.body.doc1;

  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Comitente
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, comitente) {
      if (err) {
        return handleError(res, err);
      }
      Comitente.count(query, function (err, total) {
        var obj = {
          total: total,
          data: comitente
        };
        return res.json(200, obj);
      })
    });
};


exports.getByMail = function (req, res, next) {
  console.log('getByMail');
  console.log(req.query.mail);
  var mail = req.query.mail;
  Comitente.findOne({
    email: mail,
    deleted: false
  }, function (err, comitente) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!comitente) return res.json(401);
    res.json(comitente);
  });
};

exports.getByDoc1 = function (req, res, next) {
  console.log('getByDoc1');
  console.log(req.query.doc1);
  var _doc1 = req.query.doc1;
  Comitente.findOne({
    doc1: _doc1
  }, function (err, comitente) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!comitente) return res.json(401);
    res.json(comitente);
  });
};
exports.getByDoc2 = function (req, res, next) {
  console.log('getByDoc2');
  console.log(req.query.doc2);
  var _doc2 = req.query.doc2;
  Comitente.findOne({
    doc2: _doc2
  }, function (err, comitente) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!comitente) return res.json(401);
    res.json(comitente);
  });
};


exports.auto = function (req, res) {

  console.log('--- auto ---');
  console.log(' params: ', req.params);

  var query = {
    simpleName: new RegExp(req.params.text, 'i'),
  },
    fields = {
      simpleName: 1
    };



  Comitente.find(query, fields, function (err, comitentes) {
    if (err) { return handleError(res, err); }
    console.log(comitentes);
    if (comitentes == undefined)
      comitentes = [];
    return res.json(200, comitentes);
  });
};

exports.activate = function (req, res) {

  var id = req.params.id;
  User.findById(id, function (err, _user) {

    if (err) return validationError(res, err);
    if (!_user) { return res.send(404); }

    _user.active = true;

    _user.save(function (err) {
      console.log(err);
      if (err) return validationError(res, err);
      return res.json(200);
    });
  });
};

function buildFilter(obj, query) {

  console.log('olha a query aqui ==>>> ', obj);

  if (obj.name)
    query.name = new RegExp(obj.name, 'i');



  return query;

}



function handleError(res, err) {
  return res.send(500, err);
}