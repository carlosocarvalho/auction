'use strict';

var _ = require('lodash');
var CondicaoVenda = require('./condicaoVenda.model');
var Util = require('../utils/util');

// Get list of roles
exports.index = function (req, res) {
  CondicaoVenda.find({deleted: false}, function (err, condicaoVendas) {
    if (err) { return handleError(res, err); }
    return res.json(200, condicaoVendas);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');
  CondicaoVenda.find({active:true, deleted: false},function (err, leilaos) {
      console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, leilaos);
  });
};

// Get a single role
exports.show = function (req, res) {
  console.log('condicao venda show');
  CondicaoVenda.findById(req.params.id)
    .exec(function (err, condicaoVenda) {
      if (err) { return handleError(res, err); }
      if (!condicaoVenda) { return res.send(404); }
      return res.json(condicaoVenda);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  console.log(req.body);
  CondicaoVenda.create(req.body, function (err, condicaoVenda) {
    if (err) { return handleError(res, err); }
    return res.json(201, condicaoVenda);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  if (req.body._id) { delete req.body._id; }
  CondicaoVenda.findById(req.params.id, function (err, condicaoVenda) {
    if (err) { return handleError(res, err); }
    if (!condicaoVenda) { return res.send(404); }
    var updated = _.merge(condicaoVenda, req.body);

    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, condicaoVenda);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   CondicaoVenda.findById(req.params.id, function (err, condicaoVenda) {
//     if (err) { return handleError(res, err); }
//     if (!condicaoVenda) { return res.send(404); }
//     condicaoVenda.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  CondicaoVenda.findById(req.params.id, function (err, condicaoVenda) {
    if (err) { return handleError(res, err); }
    if (!condicaoVenda) { return res.send(404); }
    condicaoVenda.deleted = true;
    condicaoVenda.active = false;
    condicaoVenda.save(function (err) {
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

  if (req.body.title)
    query.title = new RegExp(req.body.title, 'i');

  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  CondicaoVenda
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, condicaoVenda) {
      if (err) {
        return handleError(res, err);
      }
      CondicaoVenda.count(query, function (err, total) {
        var obj = {
          total: total,
          data: condicaoVenda
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

  // if (obj.departDate)
  //   query.departDate = obj.departDate;

  // if (obj.to)
  //   query.to = obj.to;

  // if (obj.returnDate)
  //   query.returnDate = obj.returnDate;

  return query;

}




function handleError(res, err) {
  return res.send(500, err);
}