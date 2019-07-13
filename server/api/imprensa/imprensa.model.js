'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImprensaSchema = new Schema({
  title: String,
  image: { type: Schema.ObjectId, ref: 'Image' },
  link: String,
  description:String,
  pdf:String, 
  video:String,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Imprensa', ImprensaSchema);