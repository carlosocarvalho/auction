'use strict';

var express = require('express');
var controller = require('./relatorio.controller');


var auth = require('../../auth/auth.service');

var router = express.Router();


router.get('/exportExcel/:id', controller.exportExcel);
router.get('/getBoleto/:id', controller.getBoleto);
router.post('/searchPrestacao', auth.isAuthenticated(), controller.searchPrestacao);
router.post('/getPrestacaoDetail', auth.isAuthenticated(), controller.getPrestacaoDetail);
router.post('/getLotesRelacionadosPrestacao',  controller.getLotesRelacionadosPrestacao);
router.post('/clonar', auth.isAuthenticated(), controller.clonar);
router.post('/liberarLotes', auth.isAuthenticated(), controller.liberarLotes);
router.post('/gerarNota', auth.isAuthenticated(), controller.gerarNota);
router.get('/getNota/:id', auth.isAuthenticated(), controller.getNota);
router.post('/confirmarPagamento', auth.isAuthenticated(), controller.confirmarPagamento);
router.post('/adicionarComprador', auth.isAuthenticated(), controller.adicionarComprador);
router.post('/adicionarComprador', auth.isAuthenticated(), controller.adicionarComprador);
router.post('/getLotesPropostas', auth.isAuthenticated(), controller.getLotesPropostas);
router.post('/getLoteDetailSimple', auth.isAuthenticated(), controller.getLoteDetailSimple);
router.post('/aceitarProposta', auth.isAuthenticated(), controller.aceitarProposta);
router.post('/negarProposta', auth.isAuthenticated(), controller.negarProposta);
router.post('/contraProposta', auth.isAuthenticated(), controller.contraProposta);
router.post('/condicionalAceitar', auth.isAuthenticated(), controller.condicionalAceitar);
router.post('/condicionalNegar', auth.isAuthenticated(), controller.condicionalNegar);
router.post('/condicionalContraProposta', auth.isAuthenticated(), controller.condicionalContraProposta);
router.post('/verificaGerarBaixa', auth.isAuthenticated(), controller.verificaGerarBaixa);
router.post('/gerarBaixa', auth.isAuthenticated(), controller.gerarBaixa);

module.exports = router;

