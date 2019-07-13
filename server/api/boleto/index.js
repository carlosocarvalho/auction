'use strict';

var express = require('express');
var controller = require('./boleto.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();


router.post('/search', auth.isAuthenticated(), controller.search);
router.get('/getActive', controller.getActive);
router.get('/generate', controller.generate);
router.get('/', controller.index);
router.get('/:id', controller.show);

router.post('/', auth.isAuthenticated(),  controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.delete('/:id', auth.isAuthenticated(),  controller.destroy);

module.exports = router;