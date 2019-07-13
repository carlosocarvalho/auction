'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TaxaSchema = new Schema({
  name: String,
  minValue: Number,
   maxValue: Number,
  appTax: Number,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Taxa', TaxaSchema);