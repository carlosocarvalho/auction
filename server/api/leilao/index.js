'use strict';

var express = require('express');
var controller = require('./leilao.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();



router.get('/finalizarLotes', controller.getFinalizarLotes);
router.get('/getActive', controller.getActive);
router.get('/detail/:id', controller.detail);
router.get('/getLoteDetail/:id', controller.getLoteDetail);
router.get('/getPainel/:id', controller.getPainel);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/search', auth.isAuthenticated(), controller.search);
router.post('/getLotesRelacionados',  controller.getLotesRelacionados);
router.post('/getLotesRelacionadosPublico',  controller.getLotesRelacionadosPublico);
router.post('/getLotesRelacionadosPainel',  controller.getLotesRelacionadosPainel);
router.post('/getLances',  controller.getLances);
router.post('/getLancesByUser',auth.isAuthenticated(), controller.getLancesByUser);
router.post('/getPropostasByUser', auth.isAuthenticated(), controller.getPropostasByUser);
router.post('/getLancesArrematadosByUser',auth.isAuthenticated(), controller.getLancesArrematadosByUser);
router.post('/getHabilitados', auth.isAuthenticated(), controller.getHabilitados);
router.post('/addLote',  controller.addLote);
router.post('/updateLote',  controller.updateLote);
router.post('/getProx',  controller.getProx);
router.post('/getEncerrados',  controller.getEncerrados);
router.post('/', auth.isAuthenticated(),  controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(),  controller.update);
router.delete('/:id', auth.isAuthenticated(),  controller.destroy);
router.post('/habilitar/:id', auth.isAuthenticated(), controller.habilitar);
router.post('/lance', auth.isAuthenticated(), controller.lance);
router.post('/getItensRelacionados',  controller.getItensRelacionados);
router.post('/getEndTime',  controller.getEndTime);
router.post('/getLeiloesByLote',  controller.getLeiloesByLote);
router.post('/addProposta', auth.isAuthenticated(),  controller.addProposta);
router.post('/getBuscaLotesHome',  controller.getBuscaLotesHome);
router.post('/posLeilao',  controller.posLeilao);
router.post('/importExcel',  controller.importExcel);
router.post('/getPrevNextLote',  controller.getPrevNextLote);
router.post('/getLoteNumber',  controller.getLoteNumber);

module.exports = router;