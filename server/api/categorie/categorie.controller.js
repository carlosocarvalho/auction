'use strict';

var _ = require('lodash');
var Categorie = require('./categorie.model');
var Util = require('../utils/util');

// Get list of roles
exports.index = function (req, res) {
  Categorie.find(function (err, categories) {
    if (err) { return handleError(res, err);
     }
    return res.json(200, categories);
  }).sort({
      order: 1
    });
};

exports.getActive = function (req, res) {
  Categorie.find({ active: true, deleted: false }, function (err, categories) {
    if (err) { return handleError(res, err); }
    return res.json(200, categories);
  });
};

exports.getByFather = function (req, res) {
  console.log('getByFather');
  console.log(req.body);
  var _fatherId = req.body.fatherId;
  Categorie.find({ fatherId: _fatherId }, function (err, logs) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

// Get a single role
exports.show = function (req, res) {

  Categorie.findById(req.params.id)
    .populate('fatherId', 'name')
    .exec(function (err, categorie) {
      if (err) { return handleError(res, err); }
      if (!categorie) { return res.send(404); }
      return res.json(categorie);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  req.body.simpleName = Util.removeAccents(req.body.name);
  console.log(req.body);
  Categorie.create(req.body, function (err, categorie) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(201, categorie);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  if (req.body._id) { delete req.body._id; }
  Categorie.findById(req.params.id, function (err, categorie) {
    if (err) { return handleError(res, err); }
    if (!categorie) { return res.send(404); }
    var updated = _.merge(categorie, req.body);
    updated.simpleName = Util.removeAccents(updated.name);
    console.log(updated.simpleName);

    if (req.body.fatherId === undefined) {
      updated.fatherId = undefined;
    }
    console.log(updated);
    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, categorie);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Categorie.findById(req.params.id, function (err, categorie) {
//     if (err) { return handleError(res, err); }
//     if (!categorie) { return res.send(404); }
//     categorie.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Categorie.findById(req.params.id, function (err, categorie) {
    if (err) { return handleError(res, err); }
    if (!categorie) { return res.send(404); }
    categorie.deleted = true;
    categorie.active = false;
    categorie.save(function (err) {
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

  if (req.body.name)
    query.simpleName = new RegExp(req.body.name, 'i');

  if (req.body.fatherId)
    query.fatherId = req.body.fatherId;

  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Categorie
    .find(query, fields, paging)
    .populate('fatherId')
    .sort({
      order: 1
    })
    .exec(function (err, categorie) {
      if (err) {
        return handleError(res, err);
      }
      Categorie.count(query, function (err, total) {
        var obj = {
          total: total,
          data: categorie
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


exports.auto = function (req, res) {

  console.log('--- auto ---');
  console.log(' params: ', req.params);

  //console.log(req.body);

  var query = {
    simpleName: new RegExp(req.params.text, 'i'),
    active: true,
    deleted: false
  },
    fields = {
      name: 1, _id: 1
    };

  if (req.params.id) {
    query._id = { $ne: req.params.id }
  }


  Categorie.find(query, fields, function (err, categories) {
    if (err) { return handleError(res, err); }
    return res.json(categories);
  });

};


// Get list of roles
exports.roots = function (req, res) {
  Categorie.find({ fatherId: undefined })
    .sort({ order: 1, name: 1 })
    .exec(function (err, categories) {
      if (err) { return handleError(res, err); }
      return res.json(200, categories);
    });
};

exports.getByCod = function (req, res) {

  Categorie.findOne({ categoriaId: req.body.cod })
    .populate('fatherId', 'name')
    .exec(function (err, categorie) {
      if (err) { return handleError(res, err); }
      if (!categorie) { return res.send(404); }
      return res.json(categorie);
    });
};

exports.getByName = function (req, res, next) {
  console.log('getByName');
  console.log(req.query.name);

  var SearchName = req.query.name;
  Categorie.findOne({
    name: SearchName,
    deleted: false
  }, function (err, categorie) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!categorie) return res.json(401);
    res.json(categorie);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}