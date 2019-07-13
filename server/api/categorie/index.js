'use strict';

var express = require('express');
var controller = require('./categorie.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();


router.get('/auto/:id/:text', controller.auto);
router.get('/auto/:text', controller.auto);
router.post('/getByFather', controller.getByFather);
router.get('/getActive', controller.getActive);
router.get('/getByName', controller.getByName);
router.get('/roots', controller.roots);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/search', auth.isAuthenticated(), controller.search);
router.post('/', auth.isAuthenticated(),  controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.delete('/:id', auth.isAuthenticated(),  controller.destroy);
router.post('/getByCod', auth.isAuthenticated(), controller.getByCod);

module.exports = router;