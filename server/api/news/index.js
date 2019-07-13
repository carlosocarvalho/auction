'use strict';

var express = require('express');
var controller = require('./news.controller');


var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/getAll',  controller.index);
router.get('/',  controller.index);
router.get('/:id',  controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/signNewsLetter', controller.signNewsLetter);
router.post('/search', controller.search);
router.post('/addNewsLetterMail', controller.addNewsLetterMail);
router.post('/getNewsMails', controller.getNewsMails);
router.post('/editNewsLetterMail', controller.editNewsLetterMail);
router.post('/deleteNewsLetterMail', controller.deleteNewsLetterMail);
router.post('/importExcel', controller.importExcel);
router.get('/exportExcel/:id', controller.exportExcel);
module.exports = router;

