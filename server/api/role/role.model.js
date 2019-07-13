'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var RoleSchema = new Schema({
  name: String,
  info: String,
  pages:[{
    page: { type: Schema.ObjectId, ref: 'Page' },
    read: Boolean,
    write: Boolean,
    delete: Boolean
  }],
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Role', RoleSchema);