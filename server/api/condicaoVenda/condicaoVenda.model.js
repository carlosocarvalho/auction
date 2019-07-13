'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CondicaoVendaSchema = new Schema({
  title: String,
  description: String,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
    oldId: Number,
});

module.exports = mongoose.model('CondicaoVenda', CondicaoVendaSchema);