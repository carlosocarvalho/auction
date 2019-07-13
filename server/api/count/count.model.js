'use strict';

/*
*	Wesley Inacio
* 	30/05/2017
* 	Contador que serve para multiplas funcionalidades
*/

var mongoose = require('mongoose'),
	Schema 	 = mongoose.Schema;

var CountSchema = new Schema({
	name: String,
	counter: Number
});

module.exports = mongoose.model('Count', CountSchema);