'use strict';

var express = require('express');
var controller = require('./imprensa.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();



router.get('/getActive', controller.getActive);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/search', auth.isAuthenticated(), controller.search);
router.post('/', auth.isAuthenticated(),  controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.delete('/:id', auth.isAuthenticated(),  controller.destroy);

module.exports = router;