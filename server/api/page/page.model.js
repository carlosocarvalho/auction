'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PageSchema = new Schema({
  codigo: Number,
  name: String,
  info: String,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Page', PageSchema);