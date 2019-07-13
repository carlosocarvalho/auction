'use strict';

var express = require('express');
var controller = require('./lote.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();



router.get('/getActive', controller.getActive);
router.get('/groupByCategoria/:id', controller.groupByCategoria);
router.get('/groupByCategoriaGeral', controller.groupByCategoriaGeral);
router.post('/groupBySubCategoria/:id', controller.groupBySubCategoria);
router.get('/groupByEstado/:id', controller.groupByEstado);
router.get('/groupByEstadoGeral', controller.groupByEstadoGeral);
router.post('/groupByCidade/:id', controller.groupByCidade);
router.get('/groupVendasByCategoria/:id', controller.groupVendasByCategoria);
router.post('/groupVendasBySubCategoria/:id', controller.groupVendasBySubCategoria);
router.get('/:id', controller.show);
router.get('/', controller.index);
//router.get('/getPainel/:id', controller.getPainel);
router.post('/search', auth.isAuthenticated(), controller.search);
router.post('/disponiveis', auth.isAuthenticated(), controller.disponiveis);
router.post('/setAvaiable', auth.isAuthenticated(), controller.setAvaiable);
router.post('/', auth.isAuthenticated(),  controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.delete('/:id', auth.isAuthenticated(),  controller.destroy);
router.post('/getMenuByCategoria', controller.getMenuByCategoria);
router.post('/importExcel', controller.importExcel);



module.exports = router;