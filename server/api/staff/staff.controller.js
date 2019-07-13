'use strict';

var _ = require('lodash');
var Staff = require('./staff.model');

// Get list of staffs
exports.index = function(req, res) {
  Staff.find(function (err, staffs) {
    if(err) { return handleError(res, err); }
    return res.json(200, staffs);
  });
};

// Get a single service
exports.show = function(req, res) {
  Staff.findById(req.params.id, function (err, staff) {
    if(err) { return handleError(res, err); }
    if(!staff) { return res.send(404); }
    return res.json(staff);
  });
};

// Creates a new staff in the DB.
exports.create = function(req, res) {
  Staff.create(req.body, function(err, staff) {    
    if(err) { 
      return handleError(res, err); 
    }
    return res.json(201, staff);
  });
};

// Updates an existing staff in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Staff.findById(req.params.id, function (err, staff) {
    if (err) { return handleError(res, err); }
    if(!staff) { return res.send(404); }
    var updated = _.merge(staff, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, staff);
    });
  });
};


// Updates an existing staff in the DB.
exports.addAppointment = function(req, res) {

  var appointment = {
    title : req.body.title,
    start: req.body.start,
    end: req.body.end,
    allDay: false
  };

  var mongoose = require('mongoose');

  appointment._id = mongoose.Types.ObjectId();

  // res.json(200, { _id:  req.body.id.id } );

  Staff.findById( req.body._id, function (err, staff) {
    if (err) { return handleError(res, err); }
    if(!staff) { return res.send(404); }
    
    staff.agenda = staff.agenda || [];

    staff.agenda.push(appointment);
    
    staff.save(function (err) {
      if (err) { return  res.send(err); }
      return res.json(200, staff);
    });
  });
};


exports.updateAppointment = function(req, res) {

  if(req.body._id) { delete req.body._id; }
  Staff.findById(req.params.id, function (err, staff) {


    staff.agenda = staff.agenda || [];

    staff.agenda.forEach(function(item){

      console.log("---item---");
      console.log(item);

      
      console.log("---/item---");


    });

    console.log("--------Novo------");
    console.log(req.body);
    console.log("--------/Novo-----");    


    console.log("--------Antigo------");
    console.log(staff);
    console.log("--------/Antigo-----");    

    return res.json(200, {});


    // if (err) { return handleError(res, err); }
    // if(!staff) { return res.send(404); }
    // var updated = _.merge(staff, req.body);
    // updated.save(function (err) {
    //   if (err) { return handleError(res, err); }
    //   return res.json(200, staff);
    // });
  });
};

// Deletes a staff from the DB.
exports.destroy = function(req, res) {
  Staff.findById(req.params.id, function (err, staff) {
    if(err) { return handleError(res, err); }
    if(!staff) { return res.send(404); }
    staff.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}