'use strict';

var _ = require('lodash');
var Log = require('./log.model');
 var SockCtrl = require('../../socketCtrl');

// Get list of logs
exports.index = function (req, res) {
  Log.find(function (err, logs) {
    if (err) { return handleError(res, err); }
    return res.json(200, logs);
  });
};

// Get a single service
exports.show = function (req, res) {
  Log.findById(req.params.id, function (err, log) {
    if (err) { return handleError(res, err); }
    if (!log) { return res.send(404); }
    return res.json(log);
  });
};

// Creates a new log in the DB.
exports.create = function (req, res) {
  Log.create(req.body, function (err, log) {
    if (err) {
      return handleError(res, err);
    }
    SockCtrl.emit(log);
    return res.json(201, log);
  });
};

// Updates an existing log in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Log.findById(req.params.id, function (err, log) {
    if (err) { return handleError(res, err); }
    if (!log) { return res.send(404); }
    var updated = _.merge(log, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, log);
    });
  });
};


exports.search = function (req, res) {

  console.log('--- search ---');

  var user = req.user,
    page = req.body.page || 0,
    query = {},
    fields = {},
    paging = {
      skip: page * 5,
      limit: 5
    };

  Log
    .find(query, fields, paging)
    .populate('userId','name')
    .sort({
      createdDate: -1
    })
    .exec(function (err, leeds) {

      if (err) {
        return handleError(res, err);
      }
      Log.count(query, function (err, total) {
        var obj = {
          total: total,
          data: leeds
        };
        return res.json(200, obj);

      })

    });
};



// Deletes a log from the DB.
exports.destroy = function (req, res) {
  Log.findById(req.params.id, function (err, log) {
    if (err) { return handleError(res, err); }
    if (!log) { return res.send(404); }
    log.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}