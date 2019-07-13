'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
	id: Number,
	code: String,
	local_code: String,
	name: String,
	continent: String,
	iso_country: String,
	wikipedia_link: String,
	keywords: String,
	createdAt: { type: Date, default: new Date() },
	active: { type: Boolean, default: true }
});

module.exports = mongoose.model('State', StateSchema);
