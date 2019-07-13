'use strict';

var _ = require('lodash');
var Leilao = require('../leilao/leilao.model');
var Lote = require('../lote/lote.model');
var Lote = require('../lote/lote.model');
var Cidade = require('../cidade/cidade.model');
var Estado = require('../estado/estado.model');
var User = require('../user/user.model');
var Taxa = require('../taxa/taxa.model');
var mongoose = require('mongoose');
var LeilaoCtrl = require('../leilao/leilao.controller');
var Mail = require('../mail/mail.model');
var MailCtrl = require('../mail/mail.controller');

var dateFormat = require('dateformat');
var moment = require('moment');


exports.searchPrestacao = function(req, res) {
    console.log(req.body);

    var user = req.user,
        page = req.body.page || 0,
        query = { status: 3, 'lotes.deleted': false },
        fields = {
            comitentes: 1, leilaoId: 1, description: 1, status: 1, active: 1, lotes: 1, usuariosHabilitados: 1, notaGerada: 1
        },
        paging = {
            skip: page * 10,
            limit: 10
        };

    query.deleted = false;

    if (req.body.leilaoId)
        query.leilaoId = req.body.leilaoId;

    if (req.body.description)
        query.description = new RegExp(req.body.description, 'i');

    if (req.body.comitentes !== undefined && req.body.comitentes.length > 0)
        query.comitentes = req.body.comitentes;

    if (req.body.active !== undefined)
        query.active = req.body.active;

    if (req.body.tipo !== undefined)
        query.tipo = req.body.tipo;

    if (req.body.status !== undefined)
        query.status = req.body.status;

    console.log(query);

    Leilao
        .find(query, fields, paging)
        .populate('comitentes', 'simpleName')
        .sort({
            leilaoId: -1
        })
        .exec(function(err, leilao) {
            if (err) {
                return handleError(res, err);
            }
            var _itens = [];
            for (var i = 0; i < leilao.length; i++) {
                var _leilao = leilao[i];

                var _countLotes = 0;
                var _countVend = 0;
                var _countMov = 0;
                var _countCond = 0;
                for (var j = 0; j < _leilao.lotes.length; j++) {
                    if (_leilao.lotes[j].vendido == true && _leilao.lotes[j].deleted == false && _leilao.lotes[j].movido == false) {
                        _countVend++;
                    }
                    if (_leilao.lotes[j].vendido == false && _leilao.lotes[j].deleted == false && _leilao.lotes[j].movido == false && _leilao.lotes[j].condicional == true) {
                        _countVend++;
                    }

                    if (_leilao.lotes[j].deleted == false) {
                        _countLotes++;
                    }

                    if (_leilao.lotes[j].vendido == false && _leilao.lotes[j].deleted == false && _leilao.lotes[j].movido == true) {
                        _countMov++;
                    }
                }
                _leilao.lotes = [];

                var _countHab = 0;
                if (_leilao.usuariosHabilitados) {
                    _countHab = _leilao.usuariosHabilitados.length;
                    _leilao.usuariosHabilitados = [];
                }


                var item = {
                    leilao: _leilao,
                    numLotes: _countLotes,
                    numVend: _countVend,
                    numHab: _countHab,
                    numMov: _countMov,
                    numCond: _countVend
                }

                _itens.push(item);
            }
            Leilao.count(query, function(err, total) {
                var obj = {
                    total: total,
                    data: _itens
                };
                return res.json(200, obj);
            })
        });
};

exports.getLotesRelacionadosPrestacao = function(req, res) {
    console.log('getLotesRelacionadosPrestacao');
    //console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };


    //  console.log(_ids);
    var query = null;

    query = { 'lotes.deleted': false };

    // Making filters
    if (req.body.active !== undefined)
        query['lotes.active'] = req.body.active;

    // Non-paid
    if (req.body.nonPaid) {
        query['lotes.vendido'] = true;
        query['lotes.pagamentoConfirmado'] = false;
    };

    // Non-sold
    if (req.body.nonSold) {
        query['lotes.vendido'] = false;
    };

    // No-purposes
    if (req.body.nonPurposes) {
        query['lotes.propostas.respondida'] = false;
    };

    //console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
            "_id": mongoose.Types.ObjectId(req.body.leilaoId)
        }
    })
        .unwind("lotes")
        .match(query)
        .project({
            "_id": 0,
            "lotes": {
                lote: 1, valorMinimoVenda: 1, vendido: 1, endTime: 1, numero: 1, lanceAtual: 1, active: 1,
                _id: 1, comissao: 1, visitas: 1, lanceInicial: 1, condicional: 1, pagamentoGerado: 1,
                pagamentoConfirmado: 1, notaGerada: 1, propostas: 1, propostaAceita: 1, modoVenda: 1, condicionalResposta: 1
            }
        })
        ;

    var options = { page: page, limit: paging.limit }

    Leilao.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
        if (err) {
            console.err(err);
            return handleError(res, err);
        }
        else {
            Lote.populate(results, { path: "lotes.lote", select: "description comitente image tags cidade estado" }, function(err, data) {
                User.populate(data, { path: "lotes.lanceAtual.comprador", select: "login" }, function(err, dataP) {
                    Cidade.populate(dataP, { path: "lotes.lote.cidade", select: "nome_cidade" }, function(err, dataC) {
                        Estado.populate(dataC, { path: "lotes.lote.estado", select: "nome_estado" }, function(err, dataE) {
                            User.populate(dataE, { path: "lotes.propostaAceita.comprador", select: "login" }, function(err, dataF) {
                                // console.log('populate');
                                var obj = {
                                    total: count,
                                    data: dataF
                                };
                                return res.json(200, obj);
                            });
                        });
                    });
                });
            });
        }
    });
};


exports.exportExcel = function(req, res) {
    var xl = require('excel4node');

    // Create a new instance of a Workbook class 
    var wb = new xl.Workbook();

    var _id = req.params.id;

    // Add Worksheets to the workbook 
    var ws = wb.addWorksheet('GERAL');

    // Create a reusable style 
    var sTitle = wb.createStyle({
        font: {
            color: '#FFFFFF',
            size: 14
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#CCCCCC'
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center'
        }
    });

    var sSubTitle = wb.createStyle({
        font: {
            color: '#FFFFFF',
            size: 14
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#a9a8a8'
        },
        alignment: {
            horizontal: 'left',
            vertical: 'center'
        }
    });

    var sNumber = wb.createStyle({
        numberFormat: '#,##0.00; (#,##0.00); -'
    });

    Leilao.findById(_id)
        .populate('comitentes', 'simpleName')
        .populate('lotes.lanceAtual.comprador', 'simpleName')
        .populate('lotes.lances.comprador', 'login cidade addressCity addressState')
        .populate('lotes.lote', 'id description comitente visitas compradores lances image tags')
        .deepPopulate('lotes.lote.comitente lotes.lote.estado lotes.lote.cidade lotes.lote.categoria lotes.lances.comprador.addressState lotes.lances.comprador.addressCity', {
            populate: {
                'lotes.lote.comitente': { select: 'simpleName image' },
                'lotes.lote.estado': { select: 'nome_estado' },
                'lotes.lote.cidade': { select: 'nome_cidade' },
                'lotes.lote.categoria': { select: 'name' },
                'lotes.lances.comprador.addressState': { select: 'nome_estado' },
                'lotes.lances.comprador.addressCity': { select: 'nome_cidade' }
            }
        })
        .exec(function(err, leilao) {
            if (err) { return handleError(res, err); }


            ws.cell(1, 1, 1, 13, true).string('Relatório Detalhado do Leilao: ' + leilao.leilaoId).style(sTitle);
            ws.row(1).setHeight(30);
            var _comitentes = '';
            for (var i = 0; i < leilao.comitentes.length; i++) {
                _comitentes += leilao.comitentes[i].simpleName + ', ';
                console.log(_comitentes);
            }
            ws.cell(2, 1, 2, 13, true).string('Comitentes: ' + _comitentes + ' HORA :' + dateFormat(leilao.endDateTime, "dd/mm/yyyy: h:MM:ss ")).style(sTitle);

            ws.cell(3, 1).string('LOTE');
            ws.cell(3, 2).string('DESCRIÇÃO');
            ws.cell(3, 3).string('CATEGORIA');
            ws.cell(3, 4).string('LC. INICIAL');
            ws.cell(3, 5).string('VMV');
            ws.cell(3, 6).string('GANHADOR');
            ws.cell(3, 7).string('LC. GANHADOR');
            ws.cell(3, 8).string('COMISSÃO');
            ws.cell(3, 9).string('LOCAL');
            ws.cell(3, 10).string('VISITAS');
            ws.cell(3, 11).string('USERS');
            ws.cell(3, 12).string('LANCES');
            ws.cell(3, 13).string('COND.');
            ws.cell(3, 1, 3, 13).style(sSubTitle);

            var _sumLanceInicial = 0;
            var _sumLanceVMV = 0;
            var _sumLanceGanhador = 0;
            var _sumComissao = 0;
            var _sumLances = 0;
            for (var j = 0; j < leilao.lotes.length; j++) {
                var i = j + 4;
                var _lote = leilao.lotes[j];

                console.log(i, _lote.lote);

                _sumLanceInicial += _lote.lanceInicial;
                _sumLanceVMV += _lote.valorMinimoVenda;

                if (_lote.lanceAtual && _lote.lanceAtual.valor) {
                    _sumLanceGanhador += _lote.lanceAtual.valor;
                    _sumComissao += (_lote.lanceAtual.valor * _lote.comissao) / 100;
                }


                _sumLances += _lote.lances.length;

                var _compradores = [];
                var _lances = [];
                // console.log('---> LANCES',_item.lotes.lances);
                if (_lote.lances) {
                    var _lances = _lote.lances;

                }
                //console.log("lances length", _lances);
                for (var k = 0; k < _lances.length; k++) {
                    var _lance = _lances[k];

                    var _existe = false;
                    for (var y = 0; y < _compradores.length; y++) {
                        console.log('aaa',_compradores[y], _lance.comprador)
                        if (_compradores[y] && _compradores[y].toString() === _lance.comprador.toString()) {
                            console.log('igual');
                            _existe = true;
                        }
                    }

                    if (_existe == false) {
                        _compradores.push(_lance.comprador);
                    }
                }

                ws.cell(i, 1).string(_lote.numero !== undefined ? _lote.numero.toString() : "-");
                ws.cell(i, 2).string(getVal("S", _lote.lote ? _lote.lote.description : ""));
                ws.cell(i, 3).string(getVal("S", _lote.lote && _lote.lote.categoria ? 
                    _lote.lote.categoria.name : ""));

                // ws.cell(i, 3).string(getVal("S", _lote.lote ? _lote.lote.name : ""));
                // ws.cell(i, 3).string(_lote.lote.categoria.name);
                ws.cell(i, 4).number(_lote.lanceInicial).style(sNumber);
                ws.cell(i, 5).number(_lote.valorMinimoVenda).style(sNumber);
                ws.cell(i, 6).string(_lote.lanceAtual == undefined || _lote.lanceAtual.comprador == undefined ? '' : _lote.lanceAtual.comprador.simpleName);
                ws.cell(i, 7).number(_lote.lanceAtual == undefined || _lote.lanceAtual.valor == undefined ? 0 : _lote.lanceAtual.valor).style(sNumber);

                ws.cell(i, 8).number(_lote.lanceAtual == undefined || _lote.lanceAtual.valor == undefined ? 0 : (_lote.lanceAtual.valor * _lote.comissao) / 100).style(sNumber);
                // ws.cell(i, 9).string(_lote.lote.cidade.nome_cidade + ' - ' + _lote.lote.estado.nome_estado);

                ws.cell(i, 9).string(getVal("S", _lote.lote && _lote.lote.cidade ? 
                    _lote.lote.cidade.nome_estado : ""));

                ws.cell(i, 10).number(_lote.visitas == undefined ? 0 : _lote.visitas);
                ws.cell(i, 11).number(_compradores.length);
                ws.cell(i, 12).number(_lote.lances.length);
                ws.cell(i, 13).string(_lote.condicional ? "SIM" : "NÃO");


                // var wLote = wb.addWorksheet(_lote.lote.description);
                // wLote.cell(1, 1, 1, 4, true).string('Relatório dos Lances: ' + _lote.lote.description).style(sTitle);
                // wLote.cell(2, 1).string('LOGIN');
                // wLote.cell(2, 2).string('LOCALIZAÇÃO');
                // wLote.cell(2, 3).string('VALOR');
                // wLote.cell(2, 4).string('DATA HORA');
                // wLote.cell(2, 1, 2, 4).style(sSubTitle);

                // for (var y = 0; y < _lote.lances.length; y++) {
                //     var _lance = _lote.lances[y];
                //     var z = y + 3;
                //     wLote.cell(z, 1).string(_lance.comprador.login);
                //     wLote.cell(z, 2).string(_lance.comprador.addressCity.nome_cidade + ' - ' + _lance.comprador.addressState.nome_estado);
                //     wLote.cell(z, 3).number(_lance.valor).style(sNumber);
                //     wLote.cell(z, 4).date(new Date(_lance.createdAt)).style({ numberFormat: 'dd/mm/yyyy HH:mm:ss' });;
                // }


            }
            //console.log(_sumLanceGanhador);
            var _footerLine = 4 + leilao.lotes.length;
            ws.cell(_footerLine, 1).number(leilao.lotes.length);
            ws.cell(_footerLine, 4).number(_sumLanceInicial).style(sNumber);
            ws.cell(_footerLine, 5).number(_sumLanceVMV).style(sNumber);
            ws.cell(_footerLine, 7).number(_sumLanceGanhador).style(sNumber);
            ws.cell(_footerLine, 8).number(_sumComissao).style(sNumber);
            ws.cell(_footerLine, 12).number(_sumLances);
            ws.cell(_footerLine, 1, _footerLine, 13).style(sSubTitle);



            wb.write('Relatorio_Leilao_' + leilao.leilaoId + '.xlsx', res);
        });



};

function getVal(type, obj) 
{
    

    switch(type)
    {
        case "S":
            if(obj === undefined)
                return "";
            else
                return obj.toString();

        case "N":

            if(obj === undefined)
                return 0;
            else
                return obj;

        case "B":

            if(obj === undefined)
                return false;
            else
                return obj;
    }
    
    return obj;

}

exports.getPrestacaoDetail = function(req, res) {
    var _id = req.body.leilaoId;

    Leilao.findById(_id)
        .populate('comitentes', 'simpleName')
        .populate('lotes.lanceAtual.comprador', 'simpleName')
        .populate('lotes.lances.comprador', 'login cidade addressCity addressState')
        .populate('lotes.lote', 'id description comitente visitas compradores lances image tags')
        .deepPopulate('lotes.lote.comitente lotes.lote.estado lotes.lote.cidade lotes.lote.categoria lotes.lances.comprador.addressState lotes.lances.comprador.addressCity', {
            populate: {
                'lotes.lote.comitente': { select: 'simpleName image' },
                'lotes.lote.estado': { select: 'nome_estado' },
                'lotes.lote.cidade': { select: 'nome_cidade' },
                'lotes.lote.categoria': { select: 'name' },
                'lotes.lances.comprador.addressState': { select: 'nome_estado' },
                'lotes.lances.comprador.addressCity': { select: 'nome_cidade' }
            }
        })
        .exec(function(err, leilao) {
            if (err) { return handleError(res, err); }
            return res.json(200, leilao);

        });



};

exports.clonar = function(req, res) {
    console.log('clonar');
    console.log(req.body);
    var _idLeilao = req.body.leilaoId;
    var _dataEncerramento = req.body.dataEncerramento;

    //  console.log(_ids);
    var query = null;

    query = { 'lotes.deleted': false, 'lotes.encerrado': true, 'lotes.vendido': false, 'lotes.deleted': false, 'lotes.movido': false };



    //console.log(query);

    Leilao.aggregate({
        "$match": {
            "_id": mongoose.Types.ObjectId(_idLeilao)
        }
    })
        .unwind("lotes")
        .match(query)
        .project({
            "_id": 0,
            description: 1,
            comitentes: 1,
            condicaoVenda: 1,
            retirada: 1,
            visitacao: 1,
            info_extra: 1,
            tipo: 1,
            "lotes": {
                lote: 1, valorMinimoVenda: 1, numero: 1, comissao: 1, lanceInicial: 1, incremento: 1, endTime: 1, _id: 1
            }
        }).exec(function(err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }

            //console.log(data);

            var novoLeilao = new Leilao({
                description: data[0].description,
                comitentes: data[0].comitentes,
                condicaoVenda: data[0].condicaoVenda,
                retirada: data[0].retirada,
                visitacao: data[0].visitacao,
                info_extra: data[0].info_extra,
                tipo: data[0].tipo,
                status: 1,
                endDateTime: _dataEncerramento,
                deleted: false,
                active: true,
                encerrado: false,
                isClone: true,
                cloneOf: _idLeilao,
                lotes: []
            });


            for (var i = 0; i < data.length; i++) {
                var _data = new Date(_dataEncerramento).toISOString().substring(0, 10);
                var _hora = dateFormat(data[i].lotes.endTime, "h:MM:ss ");
                //moment(_dataEncerramento)
                console.log(_hora);
                console.log(_data + ' ' + _hora);
                var _lote = {
                    endTime: new Date(_data + ' ' + _hora),
                    lote: data[i].lotes.lote,
                    numero: data[i].lotes.numero,
                    lanceInicial: data[i].lotes.lanceInicial,
                    comissao: data[i].lotes.comissao,
                    incremento: data[i].lotes.incremento,
                    visitas: 0,
                    valorMinimoVenda: data[i].lotes.valorMinimoVenda
                };

                novoLeilao.lotes.push(_lote);
            }

            Leilao.create(novoLeilao, function(err, novoLeilaoSalvo) {
                console.log(err);
                if (err) { return handleError(res, err); }

                //marcar lotes como movidos
                var _ids = [];
                var _idsLotes = [];
                for (var j = 0; j < data.length; j++) {
                    console.log(j);
                    _ids.push(data[j].lotes._id);
                    _idsLotes.push(data[j].lotes.lote);

                    Leilao.update({ 'lotes._id': data[j].lotes._id }, { $set: { 'lotes.$.movido': true } },
                        { multi: true },
                        function(err, result) {
                            console.log('atualizacao INDEX --->', this.index);
                            console.log('atualizacao --->', data[this.index].lotes._id);
                            if (err) {
                                console.log(err);

                                return handleError(res, err);
                            }
                        }.bind({ index: j }));
                }


                Lote.update({ _id: { $in: _idsLotes } }, { $set: { disponivel: false, leilao: novoLeilaoSalvo._id } },
                    { multi: true },
                    function(errLote, lote) {
                        if (errLote) {
                            console.log(errLote);
                            return handleError(res, errLote);
                        }

                        return res.json(201, novoLeilaoSalvo);
                    });



            });


        })
        ;

};


exports.liberarLotes = function(req, res) {
    console.log('liberarLotes');
    console.log(req.body);
    var _idLeilao = req.body.leilaoId;

    //  console.log(_ids);
    var query = null;

    query = { 'lotes.deleted': false, 'lotes.encerrado': true, 'lotes.vendido': false, 'lotes.deleted': false, 'lotes.movido': false };



    //console.log(query);

    Leilao.aggregate({
        "$match": {
            "_id": mongoose.Types.ObjectId(_idLeilao)
        }
    })
        .unwind("lotes")
        .match(query)
        .project({
            "_id": 0,
            "lotes": {
                lote: 1, _id: 1
            }
        }).exec(function(err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }


            //marcar lotes como movidos
            var _ids = [];
            var _idsLotes = [];
            console.log(data);
            for (var j = 0; j < data.length; j++) {
                console.log(j);
                _ids.push(data[j].lotes._id);
                _idsLotes.push(data[j].lotes.lote);


                Leilao.update({ 'lotes._id': data[j].lotes._id }, { $set: { 'lotes.$.movido': true } },
                    { multi: true },
                    function(err, result) {
                        console.log('atualizacao INDEX --->', this.index);
                        console.log('atualizacao --->', data[this.index].lotes._id);
                        if (err) {
                            console.log(err);

                            return handleError(res, err);
                        }
                    }.bind({ index: j }));
            }

            Lote.update({ _id: { $in: _idsLotes } }, { $set: { disponivel: true, leilao: undefined } },
                { multi: true },
                function(errLote, lote) {
                    if (errLote) {
                        console.log(errLote);
                        return handleError(res, errLote);
                    }

                    return res.json(201, { ok: 1 });
                });

        })
        ;





};


exports.getBoleto = function(req, res) {
    Leilao.findOne({ 'lotes._id': req.params.id },
        { 'lotes.$': 1 },
        function(err, leilao) {
            if (err) { return handleError(res, err); }
            if (!leilao) { return res.send(404); }

            console.log(leilao.lotes[0].boletoHtml);
            // res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            // res.write(leilao.lotes[0].boletoHtml);
            // res.end();
            console.log('retona jsson');
            return res.json(200, { html: leilao.lotes[0].boletoHtml });
        });

};

exports.gerarNota = function(req, res) {

    var _loteId = req.body.loteId;

    Leilao.findOne({ 'lotes._id': _loteId })
        .populate('lotes.lote', 'id description details')
        .populate('lotes.lanceAtual.comprador', 'simpleName addressStreet addressNumber addressState addressCity postalCode phone doc1 doc2')
        .deepPopulate('lotes.lanceAtual.comprador.addressState lotes.lanceAtual.comprador.addressCity', {
            populate: {
                'lotes.lanceAtual.comprador.addressState': { select: 'nome_estado' },
                'lotes.lanceAtual.comprador.addressCity': { select: 'nome_cidade' }
            }
        })
        .exec(
        function(err, leilao) {
            if (err) { return handleError(res, err); }
            if (!leilao) { return res.send(404); }

            Taxa.findOne({
                minValue: { $lte: leilao.lotes[0].lanceAtual.valor }, maxValue: { $gte: leilao.lotes[0].lanceAtual.valor }
            }, function(err, taxa) {

                console.log('gerarNota', 'achou o taxa');
                if (err) { return handleError(res, err); }

                var _comissao = ((leilao.lotes[0].lanceAtual.valor * leilao.lotes[0].comissao) / 100);
                var _total = leilao.lotes[0].lanceAtual.valor + ((leilao.lotes[0].lanceAtual.valor * leilao.lotes[0].comissao) / 100) + taxa.appTax;
                
                
                if(leilao.lotes[0].lanceAtual.comprador == undefined || leilao.lotes[0].lanceAtual.comprador == null)
                {
                    var _nota = {
                    empresa: "Leiloar",
                    arrematante: "Arrematante indefinido",
                    endereco: "Endereço indefinido",
                    numero: "Número indefinido",
                    cidade: "Cidade indefinido",
                    estado: "Estado indefinido",
                    cep: "Cep indefinido",
                    telefone: "Telefone indefinido",
                    doc1: "Documento indefinido",
                    doc2: "Documento indefinido",
                    lotes: [{
                        numero: leilao.lotes[0].numero,
                        descricao: leilao.lotes[0].lote.details,
                        valor: leilao.lotes[0].lanceAtual.valor
                    }],
                    autenticacao: mongoose.Types.ObjectId(),
                    subTotal: leilao.lotes[0].lanceAtual.valor,
                    comissao: _comissao,
                    taxa: taxa.appTax,
                    total: _total
                };
                
                }else{


                var _nota = {
                    empresa: "Leiloar",
                    arrematante: leilao.lotes[0].lanceAtual.comprador.name,
                    endereco: leilao.lotes[0].lanceAtual.comprador.addressStreet,
                    numero: leilao.lotes[0].lanceAtual.comprador.addressNumber,
                    cidade: leilao.lotes[0].lanceAtual.comprador.addressCity.nome_cidade,
                    estado: leilao.lotes[0].lanceAtual.comprador.addressState.nome_estado,
                    cep: leilao.lotes[0].lanceAtual.comprador.postalCode,
                    telefone: leilao.lotes[0].lanceAtual.comprador.phone,
                    doc1: leilao.lotes[0].lanceAtual.comprador.doc1,
                    doc2: leilao.lotes[0].lanceAtual.comprador.doc2,
                    lotes: [{
                        numero: leilao.lotes[0].numero,
                        descricao: leilao.lotes[0].lote.details,
                        valor: leilao.lotes[0].lanceAtual.valor
                    }],
                    autenticacao: mongoose.Types.ObjectId(),
                    subTotal: leilao.lotes[0].lanceAtual.valor,
                    comissao: _comissao,
                    taxa: taxa.appTax,
                    total: _total
                };

                }


                Leilao.update({ 'lotes._id': _loteId }, { $set: { 'lotes.$.nota': _nota, 'lotes.$.notaGerada': true } },
                    function(err, result) {
                        console.log('atualizacao NOTA --->');
                        if (err) {
                            console.log(err);

                            return handleError(res, err);
                        }

                        console.log('retona jsson');
                        return res.json(200, { ok: 1 });
                    });


            });
        });
};

exports.confirmarPagamento = function(req, res) {

    var _loteId = req.body.loteId;
    var _boleto = req.body.boleto;

    Leilao.update({ 'lotes._id': _loteId }, {
        $set: {
            'lotes.$.pagamentoConfirmado': true,
            'lotes.$.pagamentoConfirmadoNroBoleto': _boleto
        }
    },
        function(err, result) {
            console.log('confirmarPagamento --->');
            if (err) {
                console.log(err);

                return handleError(res, err);
            }

            console.log('retona jsson');
            return res.json(200, { ok: 1 });
        });
};

exports.getNota = function(req, res) {
    Leilao.findOne({ 'lotes._id': req.params.id },
        function(err, leilao) {
            if (err) { return handleError(res, err); }
            if (!leilao) { return res.send(404); }

            console.log(leilao.lotes[0].nota);
            // res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            // res.write(leilao.lotes[0].boletoHtml);
            // res.end();
            console.log('retona jsson');
            return res.json(200, { nota: leilao.lotes[0].nota });
        });

};

exports.adicionarComprador = function(req, res) {
    console.log('adicionarComprador');

    var _user = req.user._id;
    var _lance = req.body.lance;

    //marcar como vendido
    //gerar pagamento

    Leilao.findOneAndUpdate({ 'lotes._id': req.body.leilaoLoteId },
        {
            $push: { 'lotes.$.lances': _lance },
            $set: { 'lotes.$.lanceAtual': _lance, 'lotes.$.vendido': true, 'lotes.$.pagamentoGerado': false }
        },
        function(err, leilao) {
            console.log('comprador manual');
            LeilaoCtrl.gerarPagamentos(function() {
                //console.log(leilao);
                console.log(err);

                if (err) { return handleError(res, err); }
                if (!leilao) { return res.send(404); }

                return res.json(200, leilao);
            });



        });
};

exports.getLotesPropostas = function(req, res) {
    console.log('getLotesPropostas');
    console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };

    var query = {};



    console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
            "lotes._id": mongoose.Types.ObjectId(req.body.loteId)
        }
    })
        .unwind("lotes")
        .unwind("lotes.propostas")
        .match({ "lotes._id": mongoose.Types.ObjectId(req.body.loteId) })
        .sort("-lotes.propostas.createdAt")
        .project({
            "_id": 0,
            "lotes.propostas": 1,
            "lotes.propostaAceita": 1
        })
        ;

    var options = { page: page, limit: paging.limit }

    Leilao.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
        if (err) {
            console.err(err);
            return handleError(res, err);
        }
        else {
            User.populate(results, { path: "lotes.propostas.comprador", select: "login addressCity addressState" }, function(err, data) {
                Cidade.populate(data, { path: "lotes.propostas.comprador.addressCity", select: "nome_cidade" }, function(err, dataC) {
                    Estado.populate(data, { path: "lotes.propostas.comprador.addressState", select: "nome_estado" }, function(err, dataE) {
                        //     console.log('populate');
                        var obj = {
                            total: count,
                            data: dataE
                        };
                        return res.json(200, obj);
                    });
                });
            });
        }
    });
};


exports.getLoteDetailSimple = function(req, res) {
    console.log('getLoteDetailSimple');
    Leilao.findOne({ 'lotes._id': req.body.loteId },
        {
            'lotes.$': 1,
            description: 1, leilaoId: 1, comitentes: 1, endDateTime: 1
        })
        .populate("lotes.lote", "id description comitente  ")
        .deepPopulate('lotes.lote.comitente', 'simpleName image')
        .exec(
        function(err, leilao) {
            console.log(err);
            if (err) { return handleError(res, err); }

            if (!leilao) { return res.send(404); }

            return res.json(leilao);

        });
};



exports.aceitarProposta = function(req, res) {
    console.log('aceitarProposta');
    console.log(req.body);

    var _idLote = req.body.loteId;
    var _idProposta = req.body.propostaId;

    Leilao.findOne({ "lotes._id": _idLote, "lotes.propostas._id": _idProposta })
        .deepPopulate("lotes.propostas.comprador", "simpleName email")
        .exec(function(err, leilao) {
            if (err) { return handleError(res, err); }
            if (!leilao) { return res.send(404); }
            var form = {};

            var _proposta = {};
            var _loteNumero = "";

            var _continuaLotes = true;
            var _continuaProp = true;

            var _propNegadas = [];
            for (var i = 0; i < leilao.lotes.length; i++) {
                if (_continuaLotes) {
                    console.log(leilao.lotes[i]._id, _idLote);
                    if (leilao.lotes[i]._id == _idLote) {
                        console.log('achou o lote');
                        _loteNumero = leilao.lotes[i].numero;
                        _continuaLotes = false;
                        for (var j = 0; j < leilao.lotes[i].propostas.length; j++) {
                            // if (_continuaProp) {
                            if (leilao.lotes[i].propostas[j]._id == _idProposta) {
                                _continuaProp = false;
                                console.log('achou a proposta');

                                leilao.lotes[i].propostas[j].aceita = true;
                                leilao.lotes[i].propostas[j].recusada = false;
                                leilao.lotes[i].propostas[j].respondida = true;
                                _proposta = leilao.lotes[i].propostas[j];

                                leilao.lotes[i].vendido = true;
                                leilao.lotes[i].condicional = false;
                                //gerarPagamento
                                leilao.lotes[i].pagamentoGerado = true;
                                leilao.lotes[i].propostaAceita = _proposta;
                                leilao.lotes[i].modoVenda = 'proposta';

                            } else {
                                //marcar outras como recusadas
                                if (leilao.lotes[i].propostas[j].recusada == false && leilao.lotes[i].propostas[j].respondida == false) {
                                    leilao.lotes[i].propostas[j].aceita = false;
                                    leilao.lotes[i].propostas[j].recusada = true;
                                    leilao.lotes[i].propostas[j].respondida = true;

                                    _propNegadas.push(leilao.lotes[i].propostas[j]);
                                }
                            }
                            // }
                        }
                    }
                }
            }

            //  console.log(updated);
            leilao.markModified('lotes');


            leilao.save(function(err) {
                console.log(err);
                if (err) { return handleError(res, err); }

                Mail.findOne({ name: 'lote_leilao_vencedor_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    var _html = resultMail.html.toString().replace("[USER]", _proposta.comprador.simpleName);
                    _html = _html.replace("[PROPOSTA]", _proposta.valor);
                    _html = _html.replace("[LOTE]", _loteNumero);
                    _html = _html.replace("[LEILAO]", leilao.description);
                    form = {
                        from: resultMail.from,
                        to: _proposta.comprador.email,
                        subject: resultMail.subject,
                        html: _html
                    };

                    MailCtrl.internalSendMail(form);
                });



                Mail.findOne({ name: 'lote_leilao_recusada_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    for (var i = 0; i < _propNegadas.length; i++) {
                        var _html = resultMail.html.toString().replace("[USER]", _propNegadas[i].comprador.simpleName);
                        _html = _html.replace("[PROPOSTA]", _propNegadas[i].valor);
                        _html = _html.replace("[LOTE]", _loteNumero);
                        _html = _html.replace("[LEILAO]", leilao.description);
                        var form2 = {
                            from: resultMail.from,
                            to: _propNegadas[i].comprador.email,
                            subject: resultMail.subject,
                            html: _html
                        };

                        MailCtrl.internalSendMail(form2);
                    }
                });


                return res.json({ ok: 1 });


            });
        });





};

exports.negarProposta = function(req, res) {
    console.log('negarProposta');
    console.log(req.body);

    var _idLote = req.body.loteId;
    var _idProposta = req.body.propostaId;

    Leilao.findOne({ "lotes._id": _idLote, "lotes.propostas._id": _idProposta })
        .deepPopulate("lotes.propostas.comprador", "simpleName email")
        .exec(function(err, leilao) {
            if (err) { return handleError(res, err); }
            if (!leilao) { return res.send(404); }
            var form = {};

            var _proposta = {};
            var _loteNumero = "";

            var _continuaLotes = true;
            var _continuaProp = true;
            for (var i = 0; i < leilao.lotes.length; i++) {
                if (_continuaLotes) {
                    console.log(leilao.lotes[i]._id, _idLote);
                    if (leilao.lotes[i]._id == _idLote) {
                        console.log('achou o lote');
                        _loteNumero = leilao.lotes[i].numero;
                        _continuaLotes = false;
                        for (var j = 0; j < leilao.lotes[i].propostas.length; j++) {
                            if (_continuaProp) {
                                if (leilao.lotes[i].propostas[j]._id == _idProposta) {
                                    _continuaProp = false;
                                    console.log('achou o proposta');

                                    leilao.lotes[i].propostas[j].aceita = false;
                                    leilao.lotes[i].propostas[j].recusada = true;
                                    leilao.lotes[i].propostas[j].respondida = true;
                                    _proposta = leilao.lotes[i].propostas[j];

                                }
                            }
                        }
                    }
                }
            }

            //  console.log(updated);
            leilao.markModified('lotes');


            leilao.save(function(err) {
                console.log(err);
                if (err) { return handleError(res, err); }

                Mail.findOne({ name: 'lote_leilao_recusada_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    var _html = resultMail.html.toString().replace("[USER]", _proposta.comprador.simpleName);
                    _html = _html.replace("[PROPOSTA]", _proposta.valor);
                    _html = _html.replace("[LOTE]", _loteNumero);
                    _html = _html.replace("[LEILAO]", leilao.description);
                    form = {
                        from: resultMail.from,
                        to: _proposta.comprador.email,
                        subject: resultMail.subject,
                        html: _html
                    };

                    MailCtrl.internalSendMail(form, function(err, body) {
                        if (err) {
                            return handleError(res, err);
                        }

                        return res.json(200, body);
                    });
                });


            });
        });


};



exports.contraProposta = function(req, res) {
    console.log('contraProposta');
    console.log(req.body);

    var _idLote = req.body.loteId;
    var _idProposta = req.body.propostaId;
    var _contraPropostaValor = req.body.contraPropostaValor;

    Leilao.findOne({ "lotes._id": _idLote, "lotes.propostas._id": _idProposta })
        .deepPopulate("lotes.propostas.comprador", "simpleName email")
        .exec(function(err, leilao) {
            if (err) { return handleError(res, err); }
            if (!leilao) { return res.send(404); }
            var form = {};

            var _proposta = {};
            var _loteNumero = "";

            var _continuaLotes = true;
            var _continuaProp = true;

            var _propNegadas = [];
            for (var i = 0; i < leilao.lotes.length; i++) {
                if (_continuaLotes) {
                    console.log(leilao.lotes[i]._id, _idLote);
                    if (leilao.lotes[i]._id == _idLote) {
                        console.log('achou o lote');
                        _loteNumero = leilao.lotes[i].numero;
                        _continuaLotes = false;
                        for (var j = 0; j < leilao.lotes[i].propostas.length; j++) {
                            // if (_continuaProp) {
                            if (leilao.lotes[i].propostas[j]._id == _idProposta) {
                                _continuaProp = false;
                                console.log('achou o proposta');

                                leilao.lotes[i].propostas[j].aceita = true;
                                leilao.lotes[i].propostas[j].recusada = false;
                                leilao.lotes[i].propostas[j].respondida = true;
                                leilao.lotes[i].propostas[j].contraPropostaValor = _contraPropostaValor;
                                leilao.lotes[i].propostas[j].contraProposta = true;
                                _proposta = leilao.lotes[i].propostas[j];

                                leilao.lotes[i].vendido = true;
                                leilao.lotes[i].propostaAceita = _proposta;
                                leilao.lotes[i].modoVenda = 'proposta';

                            } else {
                                //marcar outras como recusadas
                                if (leilao.lotes[i].propostas[j].recusada == false && leilao.lotes[i].propostas[j].respondida == false) {
                                    leilao.lotes[i].propostas[j].aceita = false;
                                    leilao.lotes[i].propostas[j].recusada = true;
                                    leilao.lotes[i].propostas[j].respondida = true;

                                    _propNegadas.push(leilao.lotes[i].propostas[j]);
                                }
                            }
                            // }
                        }
                    }
                }
            }

            //  console.log(updated);
            leilao.markModified('lotes');


            leilao.save(function(err) {
                console.log(err);
                if (err) { return handleError(res, err); }

                Mail.findOne({ name: 'lote_leilao_vencedor_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    var _html = resultMail.html.toString().replace("[USER]", _proposta.comprador.simpleName);
                    _html = _html.replace("[PROPOSTA]", _proposta.valor);
                    _html = _html.replace("[LOTE]", _loteNumero);
                    _html = _html.replace("[LEILAO]", leilao.description);
                    form = {
                        from: resultMail.from,
                        to: _proposta.comprador.email,
                        subject: resultMail.subject,
                        html: _html
                    };

                    MailCtrl.internalSendMail(form);
                });



                Mail.findOne({ name: 'lote_leilao_recusada_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    for (var i = 0; i < _propNegadas.length; i++) {
                        var _html = resultMail.html.toString().replace("[USER]", _propNegadas[i].comprador.simpleName);
                        _html = _html.replace("[PROPOSTA]", _propNegadas[i].valor);
                        _html = _html.replace("[LOTE]", _loteNumero);
                        _html = _html.replace("[LEILAO]", leilao.description);
                        var form2 = {
                            from: resultMail.from,
                            to: _propNegadas[i].comprador.email,
                            subject: resultMail.subject,
                            html: _html
                        };

                        MailCtrl.internalSendMail(form2);
                    }
                });


                return res.json({ ok: 1 });


            });
        });





};

exports.condicionalAceitar = function(req, res) {
    var loteId = req.body.loteId;
    Leilao.update(
        { 'lotes._id': loteId },
        {
            "$set": {
                //'lotes.$.condicional': false,
                "lotes.$.encerrado": true, "lotes.$.vendido": true, "lotes.$.condicional": false,
                "lotes.$.lanceAtual.vencedor": true, "lotes.$.condicionalResposta": true
            }
        },
        function(err, result) {
            console.log(result);
            if (err) { return handleError(res, err); }
            return res.json(200, { ok: 1 });
        }
    );
};

exports.condicionalNegar = function(req, res) {
    var loteId = req.body.loteId;
    Leilao.update(
        { 'lotes._id': loteId },
        {
            "$set": {
                //'lotes.$.condicional': false,
                "lotes.$.encerrado": true, "lotes.$.vendido": false, "lotes.$.condicional": false,
                "lotes.$.lanceAtual.vencedor": false, "lotes.$.condicionalResposta": true
            }
        },
        function(err, result) {
            console.log(result);
            if (err) { return handleError(res, err); }
            return res.json(200, { ok: 1 });
        }
    );
};

exports.condicionalContraProposta = function(req, res) {
    var loteId = req.body.loteId;
    var contraProposta = req.body.contraProposta;
    contraProposta._id = mongoose.Types.ObjectId();
    Leilao.update(
        { 'lotes._id': loteId },
        {
            "$set": {
                //"lotes.$.condicional": false,
                "lotes.$.encerrado": true, "lotes.$.vendido": true, "lotes.$.condicional": false,
                "lotes.$.lanceAtual.vencedor": false, "lotes.$.modoVenda": 'proposta',
                "lotes.$.propostaAceita": contraProposta, "lotes.$.condicionalResposta": true
            },
            "$push": {
                "lotes.$.propostas": contraProposta
            }
        },
        function(err, result) {
            if (err) { return handleError(res, err); }
            return res.json(200, { ok: 1 });
        }
    );
};

exports.verificaGerarBaixa = function(req, res) {
    console.log('verificaGerarBaixa');
    console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };

    var query = null;

    query = {
        'lotes.deleted': false,
        'lotes.active': true,
        $or: [{ 'lotes.vendido': true, 'lotes.pagamentoConfirmado': false },
        { 'lotes.condicional': true, 'lotes.condicionalResposta': false },
        { 'lotes.propostas.respondida': false }
        ]
    };


    //console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
            "_id": mongoose.Types.ObjectId(req.body.leilaoId)
        }
    })
        .unwind("lotes")
        .match(query)
        .project({
            "_id": 0,
            "lotes": {
                lote: 1, valorMinimoVenda: 1, vendido: 1, endTime: 1, numero: 1, lanceAtual: 1, active: 1,
                _id: 1, comissao: 1, visitas: 1, lanceInicial: 1, condicional: 1, pagamentoGerado: 1,
                pagamentoConfirmado: 1, notaGerada: 1, propostas: 1, propostaAceita: 1, modoVenda: 1, condicionalResposta: 1
            }
        })
        ;

    var options = { page: page, limit: paging.limit }

    Leilao.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
        if (err) {
            console.err(err);
            return handleError(res, err);
        }
        else {
            Lote.populate(results, { path: "lotes.lote", select: "description comitente image tags cidade estado" }, function(err, data) {
                User.populate(data, { path: "lotes.lanceAtual.comprador", select: "login" }, function(err, dataP) {
                    Cidade.populate(dataP, { path: "lotes.lote.cidade", select: "nome_cidade" }, function(err, dataC) {
                        Estado.populate(dataC, { path: "lotes.lote.estado", select: "nome_estado" }, function(err, dataE) {
                            User.populate(dataE, { path: "lotes.propostaAceita.comprador", select: "login" }, function(err, dataF) {



                                // console.log('populate');
                                var obj = {
                                    total: count,
                                    data: dataF
                                };
                                return res.json(200, obj);
                            });
                        });
                    });
                });
            });
        }
    });

};

exports.gerarBaixa = function(req, res) {
    var leilaoId = req.body.leilaoId;
    Leilao.update(
        { _id: leilaoId },
        {
            "$set": {
                status: 4
            }
        },
        function(err, result) {
            console.log(result);
            if (err) { return handleError(res, err); }
            return res.json(200, { ok: 1 });
        }
    );
};


function handleError(res, err) {
    return res.send(500, err);
}