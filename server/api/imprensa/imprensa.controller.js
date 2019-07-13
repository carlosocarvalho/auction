'use strict';

var _ = require('lodash');
var Imprensa = require('./imprensa.model');
var Util = require('../utils/util');

// Get list of roles
exports.index = function (req, res) {
  Imprensa.find({deleted: false},function (err, imprensas) {
    if (err) { return handleError(res, err); }
    return res.json(200, imprensas);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');
  Imprensa.find({active:true, deleted: false},function (err, imprensas) {
      console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, imprensas);
  });
};

// Get a single role
exports.show = function (req, res) {

  Imprensa.findById(req.params.id)
    .exec(function (err, imprensa) {
      if (err) { return handleError(res, err); }
      if (!imprensa) { return res.send(404); }
      return res.json(imprensa);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  console.log(req.body);
  Imprensa.create(req.body, function (err, imprensa) {
    if (err) { return handleError(res, err); }
    return res.json(201, imprensa);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  if (req.body._id) { delete req.body._id; }
  Imprensa.findById(req.params.id, function (err, imprensa) {
    if (err) { return handleError(res, err); }
    if (!imprensa) { return res.send(404); }
    var updated = _.merge(imprensa, req.body);

   
    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, imprensa);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Imprensa.findById(req.params.id, function (err, imprensa) {
//     if (err) { return handleError(res, err); }
//     if (!imprensa) { return res.send(404); }
//     imprensa.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Imprensa.findById(req.params.id, function (err, imprensa) {
    if (err) { return handleError(res, err); }
    if (!imprensa) { return res.send(404); }
    imprensa.deleted = true;
    imprensa.active = false;
    imprensa.save(function (err) {
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


  if (req.body.title)
    query.title = new RegExp(req.body.title, 'i');

  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Imprensa
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, imprensa) {
      if (err) {
        return handleError(res, err);
      }
      Imprensa.count(query, function (err, total) {
        var obj = {
          total: total,
          data: imprensa
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
}