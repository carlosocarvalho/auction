'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var config = require('../../config/environment');

var connection = mongoose.createConnection(config.mongo.uri);

autoIncrement.initialize(connection);

var CategorieSchema = new Schema({
  name: String,
  simpleName: String,
  info: String,
  // icon:String,
  icon: { class: String, name: String },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  fatherId: { type: Schema.ObjectId, ref: 'Categorie' },
  oldId: Number,
  order: Number
});

CategorieSchema.plugin(autoIncrement.plugin, { model: 'Categorie', field: 'categoriaId', startAt: 1 });
module.exports = mongoose.model('Categorie', CategorieSchema);