'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
      autoIncrement = require('mongoose-auto-increment');
var config = require('../../config/environment');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var connection = mongoose.createConnection(config.mongo.uri);

autoIncrement.initialize(connection);

var NewsSchema = new Schema({
    name: String,
    emails: [
    	{
	    	email:String, 
	    	name: String
    	}
	],
    editable: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date() }
});

NewsSchema.plugin(autoIncrement.plugin, { model: 'News', field: 'cod', startAt: 1 });
NewsSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('News', NewsSchema);