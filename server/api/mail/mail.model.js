'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MailSchema = new Schema({
  codigo: Number,
  name: String,
  html: String,
  subject:String,
  from:String,
  to:String,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Mail', MailSchema);