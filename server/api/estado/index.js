'use strict';

var express = require('express');
var controller = require('./estado.controller');


var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/getAll',  controller.index);
router.get('/',  controller.index);
router.get('/:id',  controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/getByCod', auth.isAuthenticated(), controller.getByCod);
router.post('/getByName', auth.isAuthenticated(), controller.getByName);

module.exports = router;
