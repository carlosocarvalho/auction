'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BannerSchema = new Schema({
  name: String,
  image: { type: Schema.ObjectId, ref: 'Image' },
  startDate: Date,
  endDate: Date,
  leilao: { type: Schema.ObjectId, ref: 'Leilao' },
  description:String,
  ordem: Number,
  url: String,
  deleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('Banner', BannerSchema);