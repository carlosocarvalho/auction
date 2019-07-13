'use strict';

var express = require('express');
var controller = require('./mail.controller');

var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/sendMail', controller.sendMail);

router.get('/getActive', controller.getActive);
router.get('/getByName/:id', controller.getByName);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;