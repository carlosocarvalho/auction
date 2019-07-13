'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
  name: String,
  data:  Buffer,
  info: String,
  type: String,
  createdAt: { type: Date, default: new Date() },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Image', ImageSchema);