'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var LogSchema = new Schema({
  userId: { type: Schema.ObjectId, ref: 'User' },
  qObjectId: { type: Schema.ObjectId, ref: 'QObject' },
  type: String,
  fieldName: String,
  fieldOldValue: String,
  fieldNewValue: String,
  fieldId: Schema.ObjectId,
  emailHtml: String,
  createdDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Log', LogSchema);