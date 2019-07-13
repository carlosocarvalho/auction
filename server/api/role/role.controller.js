'use strict';

var _ = require('lodash');
var Role = require('./role.model');

// Get list of roles
exports.index = function(req, res) {
  Role.find(function (err, roles) {
    if(err) { return handleError(res, err); }
    return res.json(200, roles);
  });
};

// Get a single role
exports.show = function(req, res) {
  Role.findById(req.params.id)
    .populate('pages.page', 'name')
    .exec(function (err, role) {
      if (err) { return handleError(res, err); }
      if (!role) { return res.send(404); }
      return res.json(role);
    });

    };

  exports.getActive = function (req, res) {
  console.log('getActive');
  Role.find({active:true, deleted: false},function (err, roles) {
      console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, roles);
  });

  /*Role.findById(req.params.id, function (err, role) {
    if(err) { return handleError(res, err); }
    if(!role) { return res.send(404); }
    return res.json(role);
  });*/
};

// Creates a new role in the DB.
exports.create = function(req, res) {
  Role.create(req.body, function(err, role) {
    if(err) { return handleError(res, err); }
    return res.json(201, role);
  });
};

// Updates an existing role in the DB.
exports.update = function(req, res) {
  var pages = req.body.pages;
  req.body.pages = [];
  if(req.body._id) { delete req.body._id; }
  Role.findById(req.params.id, function (err, role) {
    if (err) { return handleError(res, err); }
    if(!role) { return res.send(404); }
    var updated = _.merge(role, req.body);

    updated.pages = pages;

    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, role);
    });
  });
};

// Deletes a role from the DB.
exports.destroy = function(req, res) {
  Role.findById(req.params.id, function (err, role) {
    if(err) { return handleError(res, err); }
    if(!role) { return res.send(404); }
    role.deleted = true;
    role.active = false;
    role.save(function(err) {
      if(err) { return handleError(res, err); }
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
    query.name = new RegExp(req.body.name, 'i');

  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Role
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, role) {
      if (err) {
        return handleError(res, err);
      }
      Role.count(query, function (err, total) {
        var obj = {
          total: total,
          data: role
        };
        return res.json(200, obj);
      })
    });
};

function handleError(res, err) {
  return res.send(500, err);
}