'use strict';

var express = require('express');
var controller = require('./dashboard.controller');


var auth = require('../../auth/auth.service');

var router = express.Router();


router.post('/main', controller.main);

module.exports = router;

