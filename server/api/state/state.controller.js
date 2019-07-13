'use strict';

var _ = require('lodash');
var State = require('./state.model');

// Get list of states
exports.index = function(req, res) {
  State.find(function (err, states) {
    if(err) { return handleError(res, err); }
    return res.json(200, states);
  });
};


exports.auto = function(req, res) {

  console.log('--- auto ---');
  console.log(' params: ', req.params);

  var query = {
      name: new RegExp(req.params.text, 'i')
    },
    fields = {
      name: 1, isocode: 1
    };


  State.find(query, fields, function (err, states) {
    if(err) { return handleError(res, err); }
    return res.json(states);
  });
};



function handleError(res, err) {
  return res.send(500, err);
}