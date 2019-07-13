'use strict';

var _ = require('lodash');
const MAIL_URI = 'https://api.mailgun.net/v3';
const syncRequest = require('sync-request');
const request = require('request');
var FormData = require('form-data');
var fs = require('fs');
var config = require('../../config/environment');
var Log = require('../log/log.model');
var SockCtrl = require('../../socketCtrl');

var mailgun = require('mailgun-js')({ apiKey: config.MAIL_KEY, domain: config.MAIL_DOMAIN });
var Mail = require('./mail.model');


// Get a single goal
exports.sendMail = function (req, res) {
  console.log('sendMail');
  console.log(req.body);
  var mailgunUrl = req.body.mailgunUrl;
  var mailgunApiKey = req.body.mailgunApiKey;
  var _from = req.body.from;
  var _to = req.body.to;
  var _cc = req.body.cc;
  var _subject = req.body.subject;

  var _html = req.body.html;

  var attachs = [];
  let ret;
  if (req.body.attachs) {
    req.body.attachs.forEach(function (item) {
      attachs.push(item);
    });
  }


  var form = {
    from: _from,
    to: _to,
    cc: _cc,
    subject: _subject,
    html: _html,
    attachment: attachs
  };

  mailgun.messages().send(form, function (error, body) {
    console.log(body);
    if (!error) {
      console.log(body);
      return res.send(200, body);
    } else {
      console.log(error);
      return res.send(500, error);
    }
  });
};

exports.internalSendMail = function (form, callback) {
  console.log(form);
  mailgun.messages().send(form, function (error, body) {
    console.log(body);
    if(callback){
    callback(error, body);

    }
  });
};

var Mail = require('./mail.model');

// Get list of mails
exports.index = function (req, res) {
  Mail.find(function (err, mails) {
    if (err) { return handleError(res, err); }
    return res.json(200, mails);
  });
};

exports.getActive = function (req, res) {
  console.log('getActive');
  Mail.find({ active: true, deleted: false }, function (err, mails) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, mails);
  });
};


// Get a single mail
exports.show = function (req, res) {
  Mail.findById(req.params.id, function (err, mail) {
    if (err) { return handleError(res, err); }
    if (!mail) { return res.send(404); }
    return res.json(mail);
  });
};

exports.getByName = function (req, res) {
  Mail.findOne({ name: req.params.id }, function (err, mail) {
    console.log(err);
    if (err) { return handleError(res, err); }
    if (!mail) { return res.send(404); }
    return res.json(mail);
  });
};

// Creates a new mail in the DB.
exports.create = function (req, res) {
  Mail.create(req.body, function (err, mail) {
    if (err) { return handleError(res, err); }
    return res.json(201, mail);
  });
};

// Updates an existing mail in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Mail.findById(req.params.id, function (err, mail) {
    if (err) { return handleError(res, err); }
    if (!mail) { return res.send(404); }
    var updated = _.merge(mail, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, mail);
    });
  });
};

// Deletes a mail from the DB.
exports.destroy = function (req, res) {
  Mail.findById(req.params.id, function (err, mail) {
    if (err) { return handleError(res, err); }
    if (!mail) { return res.send(404); }
    mail.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}