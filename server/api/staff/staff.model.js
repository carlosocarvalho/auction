'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var StaffSchema = new Schema({
  name: String,
  email: String,
  specialty: String,
  company: String,
  agenda: Array,
  createdDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Staff', StaffSchema);