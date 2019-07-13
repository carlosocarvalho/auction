'use strict';

var express = require('express');
var controller = require('./vendaDireta.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();



router.get('/getActive', controller.getActive);
router.get('/detail/:id', controller.detail);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/search', auth.isAuthenticated(), controller.search);
router.post('/getLotesRelacionados',  controller.getLotesRelacionados);
router.post('/getLotesRelacionadosPublico',  controller.getLotesRelacionadosPublico);
router.post('/getLotesRelacionadosPainel',  controller.getLotesRelacionadosPainel);
router.post('/getPropostas',  controller.getPropostas);
router.post('/getHabilitados',  controller.getHabilitados);
router.post('/addLote',  controller.addLote);
router.post('/updateLote',  controller.updateLote);
router.post('/getProx',  controller.getProx);
router.post('/addProposta', auth.isAuthenticated(),  controller.addProposta);
router.post('/getEncerrados',  controller.getEncerrados);
router.post('/', auth.isAuthenticated(),  controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.delete('/:id', auth.isAuthenticated(),  controller.destroy);
router.post('/habilitar/:id', auth.isAuthenticated(), controller.habilitar);
router.post('/aceitarProposta',  controller.aceitarProposta);



module.exports = router;