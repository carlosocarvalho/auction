'use strict';

var _ = require('lodash');
var Banner = require('./banner.model');
var Util = require('../utils/util');

// Get list of roles
exports.index = function (req, res) {
  Banner.find({deleted: false},function (err, banners) {
    if (err) { return handleError(res, err); }
    return res.json(200, banners);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');

  var _now = new Date();
  var query = { active: true, deleted: false };

  query.startDate = {
    $lte: _now
  };

  query.endDate = {
    $gte: _now
  };


  Banner.find(query, function (err, banners) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, banners);
  });
};

// Get a single role
exports.show = function (req, res) {

  Banner.findById(req.params.id)
    .exec(function (err, banner) {
      if (err) { return handleError(res, err); }
      if (!banner) { return res.send(404); }
      return res.json(banner);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  console.log(req.body);
  Banner.create(req.body, function (err, banner) {
    if (err) { return handleError(res, err); }
    return res.json(201, banner);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  if (req.body._id) { delete req.body._id; }
  Banner.findById(req.params.id, function (err, banner) {
    if (err) { return handleError(res, err); }
    if (!banner) { return res.send(404); }
    var updated = _.merge(banner, req.body);


    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, banner);
    });
  });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Banner.findById(req.params.id, function (err, banner) {
//     if (err) { return handleError(res, err); }
//     if (!banner) { return res.send(404); }
//     banner.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Banner.findById(req.params.id, function (err, banner) {
    if (err) { return handleError(res, err); }
    if (!banner) { return res.send(404); }
    banner.deleted = true;
    banner.active = false;
    banner.save(function (err) {
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
    query.name = new RegExp(req.body.name, 'i');

 // if (req.body.description)
 //   query.description = new RegExp(req.body.description, 'i');

  if (req.body.startDate) {
    query.startDate = {
      $gte: req.body.startDate
    };
  }
  
  if (req.body.endDate) {
    query.endDate = {
      $lte: req.body.endDate
    };
  }


  if (req.body.active !== undefined)
    query.active = req.body.active;

  console.log(query);

  Banner
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, banner) {
      if (err) {
        console.log(err);
        return handleError(res, err);
      }
      Banner.count(query, function (err, total) {
        var obj = {
          total: total,
          data: banner
        };
        return res.json(200, obj);
      })
    });
};

function buildFilter(obj, query) {

  console.log('olha a query aqui ==>>> ', obj);

  if (obj.name)
    query.name = new RegExp(obj.name, 'i');

  if (obj.startDate)
    query.startDate = new RegExp(obj.startDate);

  if (obj.endDate)
    query.endDate = new RegExp(obj.endDate);

  if (obj.active)
    query.active = obj.active;

  return query;

}



function handleError(res, err) {
  return res.send(500, err);
}