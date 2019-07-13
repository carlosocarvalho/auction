'use strict';

var express = require('express');
var controller = require('./cep.controller');

var auth = require('../../auth/auth.service');

var router = express.Router();


router.get('/getAddressBrazil/:cep', controller.getAddressBrazil);
router.get('/getAddress/:cep', controller.getAddress);

module.exports = router;