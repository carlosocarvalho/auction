'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.post('/sendEmail', controller.sendEmail);

router.post('/autoPublic', controller.autoPublic);
router.get('/list', controller.list);
router.get('/:id/activate', controller.activate);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.post('/add', controller.create);
router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
//router.put('/:id', auth.isAuthenticated(),  controller.update);
//router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.post('/', controller.create);
router.post('/verifyMail', controller.verifyMail);
router.post('/saveNewPassword', controller.saveNewPassword);
router.post('/saveNewPasswordWithoutCode', controller.saveNewPasswordWithoutCode);
router.post('/saveResetedPassword', controller.saveResetedPassword);
router.post('/search', auth.isAuthenticated(), controller.search);
router.get('/getById', auth.isAuthenticated(), controller.getById);
router.get('/getByMail',  controller.getByMail);
router.get('/getByLogin',  controller.getByLogin);
router.get('/getByDoc1',  controller.getByDoc1);
router.get('/getByDoc2',  controller.getByDoc2);
router.get('/exportToExcel/:simpleName/:login/:startDate/:endDate/:categorieId/:tipoPessoa/:doc1/:active', controller.exportToExcel)
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', controller.showUser);
router.post('/importExcel', controller.importExcel);

// auth.isAuthenticated()
module.exports = router;