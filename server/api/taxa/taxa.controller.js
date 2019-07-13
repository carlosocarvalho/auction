'use strict';

var _ = require('lodash');
var Taxa = require('./taxa.model');
var Util = require('../utils/util');

// Get list of roles
exports.index = function (req, res) {
  Taxa.find({deleted: false},function (err, taxas) {
    if (err) { return handleError(res, err); }
    return res.json(200, taxas);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');
  Taxa.find({active:true, deleted: false},function (err, taxas) {
      console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, taxas);
  });
};

// Get a single role
exports.show = function (req, res) {

  Taxa.findById(req.params.id)
    .exec(function (err, taxa) {
      if (err) { return handleError(res, err); }
      if (!taxa) { return res.send(404); }
      return res.json(taxa);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  console.log(req.body);
  Taxa.create(req.body, function (err, taxa) {
    if (err) { return handleError(res, err); }
    return res.json(201, taxa);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  console.log(req.body);
  if (req.body._id) { delete req.body._id; }
  Taxa.findById(req.params.id, function (err, taxa) {
    if (err) { return handleError(res, err); }
    if (!taxa) { return res.send(404); }
    var updated = _.merge(taxa, req.body);

    console.log(taxa);
   
    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, taxa);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Taxa.findById(req.params.id, function (err, taxa) {
//     if (err) { return handleError(res, err); }
//     if (!taxa) { return res.send(404); }
//     taxa.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Taxa.findById(req.params.id, function (err, taxa) {
    if (err) { return handleError(res, err); }
    if (!taxa) { return res.send(404); }
    taxa.deleted = true;
    taxa.active = false;
    taxa.save(function (err) {
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

    if (req.body.name)
    query.name = new RegExp(req.body.name, 'i');

  if (req.body.minValue) {
    query.minValue = {
      $gte: req.body.minValue
    };
  }
  if (req.body.maxValue) {
    query.maxValue = {
      $lte: req.body.maxValue
    };
  }
  
  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Taxa
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, taxa) {
      if (err) {
        return handleError(res, err);
      }
      Taxa.count(query, function (err, total) {
        var obj = {
          total: total,
          data: taxa
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