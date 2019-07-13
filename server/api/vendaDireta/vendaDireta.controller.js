'use strict';

var _ = require('lodash');
var VendaDireta = require('./vendaDireta.model');
var Comitente = require('../comitente/comitente.model');
var Lote = require('../lote/lote.model');
var Cidade = require('../cidade/cidade.model');
var Estado = require('../estado/estado.model');
var User = require('../user/user.model');
var Util = require('../utils/util');
var async = require('async');
var SockCtrl = require('../../socketCtrl');
var mongoose = require('mongoose');

var Mail = require('../mail/mail.model');
var MailCtrl = require('../mail/mail.controller');

// Get list of roles
exports.index = function(req, res) {
    VendaDireta.find({ deleted: false }, function(err, vendaDiretas) {
        if (err) { return handleError(res, err); }
        return res.json(200, vendaDiretas);
    });
};

exports.getActive = function(req, res) {
    console.log('getActive');
    VendaDireta.find({ active: true, deleted: false }, function(err, vendaDiretas) {
        console.log(err);
        if (err) { return handleError(res, err); }
        return res.json(200, vendaDiretas);
    });
};

// Get a single role
exports.show = function(req, res) {

    VendaDireta.findOne({ _id: req.params.id },
        {
            vendaDiretaId: 1, description: 1, condicaoVenda: 1, status: 1, active: 1,
            endDateTime: 1, tipo: 1, comitente: 1, retirada: 1,
            visitacao: 1, info_extra: 1
        })
        .populate('condicaoVenda')
        .populate('comitente', 'simpleName')
        .populate('lotes.lote', 'description comitente')
        .exec(function(err, vendaDireta) {
            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }

            return res.json(vendaDireta);
        });
};

exports.search = function(req, res) {

    console.log(req.body);

    var user = req.user,
        page = req.body.page || 0,
        query = { status: { $ne: 3 } },
        fields = {},
        paging = {
            skip: page * 10,
            limit: 10
        };

    query.deleted = false;

    if (req.body.vendaDiretaId)
        query.vendaDiretaId = req.body.vendaDiretaId;

    if (req.body.description)
        query.description = new RegExp(req.body.description, 'i');

    if (req.body.comitente !== undefined)
        query.comitente = req.body.comitente;

    if (req.body.active !== undefined)
        query.active = req.body.active;

    if (req.body.status !== undefined)
        query.status = req.body.status;

    console.log(query);

    VendaDireta
        .find(query, fields, paging)
        .populate('comitente', 'simpleName')
        .sort({
            vendaDiretaId: 1
        })
        .exec(function(err, vendaDireta) {
            if (err) {
                return handleError(res, err);
            }
            VendaDireta.count(query, function(err, total) {
                var obj = {
                    total: total,
                    data: vendaDireta
                };
                return res.json(200, obj);
            })
        });
};

exports.addLote = function(req, res) {
    console.log('addLote');
    var _lote = req.body.lote;

    VendaDireta.findOneAndUpdate({ _id: req.body.vendaDiretaId },
        {
            $push: { lotes: _lote }
        },
        function(err, vendaDireta) {
            console.log(err);

            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }


            Lote.findOneAndUpdate({ _id: _lote.lote },
                {
                    $set: { disponivel: false, vendaDireta: req.body.vendaDiretaId }
                },
                function(err2, lote) {

                    if (err2) { return handleError(res, err2); }
                    if (!lote) { return res.send(404); }

                    console.log('lote inserido ');
                    console.log('novo_lote_indisponivel');
                    SockCtrl.emit('novo_lote_indisponivel', { comitente: _lote.comitente });
                    return res.send(200);

                });

        });
};

exports.updateLote = function(req, res) {
    console.log('updateLote', req.body.lote);

    var _lote = req.body.lote;

    VendaDireta.findOneAndUpdate({ 'lotes._id': req.body.vendaDiretaLoteId },
        {
            $set: { 'lotes.$': _lote }
        },
        function(err, vendaDireta) {


            //console.log(vendaDireta);
            console.log(err);

            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }

            if (_lote.deleted) {
                Lote.findOneAndUpdate({ _id: _lote.lote },
                    {
                        $set: { disponivel: true, vendaDireta: undefined }
                    },
                    function(err2, lote) {

                        if (err2) { return handleError(res, err2); }
                        if (!lote) { return res.send(404); }

                        console.log('lote removido ');
                        console.log('novo_lote_disponivel');
                        SockCtrl.emit('novo_lote_disponivel', { comitente: _lote.comitente });
                        return res.send(200);

                    });

            } else {
                return res.send(200);
            }

        });
};



// Get a single role
exports.getLotesRelacionados = function(req, res) {
    console.log('getLotesRelacionados');
    console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };


    var _queryLote = { vendaDireta: req.body.vendaDiretaId };
    if (req.body.description)
        _queryLote.description = new RegExp(req.body.description, 'i');

    var _ids = [];
    Lote.find(_queryLote, { _id: 1 }, function(err, result) {
        //console.log(result);
        for (var i = 0; i < result.length; i++) {
            _ids.push(mongoose.Types.ObjectId(result[i]._id));
        }

        //  console.log(_ids);
        var query = null;

        query = { 'lotes.deleted': false, "lotes.lote": { $in: _ids } };

        if (req.body.numero)
            query['lotes.numero'] = req.body.numero;

        if (req.body.vendido !== undefined)
            query['lotes.vendido'] = req.body.vendido;

        if (req.body.active !== undefined)
            query['lotes.active'] = req.body.active;

        console.log(query);

        var aggregate = VendaDireta.aggregate({
            "$match": {
                "_id": mongoose.Types.ObjectId(req.body.vendaDiretaId)
            }
        })
            .unwind("lotes")
            .match(query)
            .project({
                "_id": 0,
                "lotes": { lote: 1, valorMinimoVenda: 1, vendido: 1, numero: 1, active: 1, _id: 1, comissao: 1, deleted: 1, propostas:1 }
            })
            ;

        var options = { page: page, limit: paging.limit }

        VendaDireta.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
            if (err) {
                console.err(err);
                return handleError(res, err);
            }
            else {
                Lote.populate(results, { path: "lotes.lote", select: "description comitente image tags" }, function(err, data) {
                    Comitente.populate(data, { path: "lotes.lote.comitente", select: "simpleName" }, function(err, dataP) {
                        console.log('populate', dataP);
                        var obj = {
                            total: count,
                            data: dataP
                        };
                        return res.json(200, obj);
                    });
                });
            }
        });

    });


};



exports.getLotesRelacionadosPublico = function(req, res) {
    console.log('getLotesRelacionadosPublico');
    //console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };


    var _queryLote = { vendaDireta: req.body.vendaDiretaId };
    if (req.body.tipo == 2 && req.body.search)
        _queryLote.description = new RegExp(req.body.search, 'i');

    if (req.body.categoria)
        _queryLote.categoria = req.body.categoria;

    if (req.body.subcategoria)
        _queryLote.subCategoria = req.body.subcategoria;

    if (req.body.estado !== undefined)
        _queryLote.estado = req.body.estado;

    if (req.body.cidade !== undefined)
        _queryLote.cidade = req.body.cidade;

    var _ids = [];
    Lote.find(_queryLote, { _id: 1 }, function(err, result) {
        //console.log(result);
        for (var i = 0; i < result.length; i++) {
            _ids.push(mongoose.Types.ObjectId(result[i]._id));
        }

        //  console.log(_ids);
        var query = null;

        query = { 'lotes.deleted': false, "lotes.lote": { $in: _ids } };

        if (req.body.tipo == 1 && req.body.search)
            query['lotes.numero'] = new RegExp(req.body.search, 'i');

        if (req.body.vendido !== undefined)
            query['lotes.vendido'] = req.body.vendido;



        if (req.body.active !== undefined)
            query['lotes.active'] = req.body.active;

        //console.log(query);

        var aggregate = VendaDireta.aggregate({
            "$match": {
                "_id": mongoose.Types.ObjectId(req.body.vendaDiretaId)
            }
        })
            .unwind("lotes")
            .match(query)
            .project({
                "_id": 0,
                "lotes": {
                    lote: 1, valorMinimoVenda: 1, vendido: 1, endTime: 1, numero: 1, active: 1,
                    propostas: 1, _id: 1, comissao: 1, visitas: 1, encerrado: 1
                }
            })
            ;

        var options = { page: page, limit: paging.limit }

        VendaDireta.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
            if (err) {
                console.err(err);
                return handleError(res, err);
            }
            else {
                Lote.populate(results, { path: "lotes.lote", select: "description comitente image tags cidade estado" }, function(err, data) {
                    Comitente.populate(data, { path: "lotes.lote.comitente", select: "simpleName" }, function(err, dataP) {
                        Cidade.populate(dataP, { path: "lotes.lote.cidade", select: "nome_cidade" }, function(err, dataC) {
                            Estado.populate(dataC, { path: "lotes.lote.estado", select: "nome_estado" }, function(err, dataE) {

                                // console.log('populate');
                                var obj = {
                                    total: count,
                                    data: dataE
                                };
                                return res.json(200, obj);
                            });
                        });
                    });
                });
            }
        });

    });


};

exports.getLotesRelacionadosPainel = function(req, res) {
    console.log('getLotesRelacionadosPainel');
    // console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };


    var _queryLote = { vendaDireta: req.body.vendaDiretaId };

    if (req.body.tipo == 2 && req.body.search)
        _queryLote.description = new RegExp(req.body.search, 'i');

    var _ids = [];
    Lote.find(_queryLote, { _id: 1 }, function(err, result) {
        //console.log(result);
        for (var i = 0; i < result.length; i++) {
            _ids.push(mongoose.Types.ObjectId(result[i]._id));
        }

        //  console.log(_ids);
        var query = null;

        query = { 'lotes.deleted': false, "lotes.lote": { $in: _ids } };

        if (req.body.tipo == 1 && req.body.search)
            query['lotes.numero'] = new RegExp(req.body.search, 'i');



        if (req.body.active !== undefined)
            query['lotes.active'] = req.body.active;

        //console.log(query);

        var aggregate = VendaDireta.aggregate({
            "$match": {
                "_id": mongoose.Types.ObjectId(req.body.vendaDiretaId)
            }
        })
            .unwind("lotes")
            .match(query)
            .project({
                "_id": 0,
                "lotes": {
                    lote: 1, valorMinimoVenda: 1, vendido: 1, numero: 1,
                    active: 1, _id: 1, comissao: 1
                }
            })
            ;

        var options = { page: page, limit: paging.limit }

        VendaDireta.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
            if (err) {
                console.err(err);
                return handleError(res, err);
            }
            else {
                Lote.populate(results, { path: "lotes.lote", select: "description comitente image tags cidade estado " }, function(err, data) {
                    Comitente.populate(data, { path: "lotes.lote.comitente", select: "simpleName image" }, function(err, dataP) {
                        Cidade.populate(dataP, { path: "lotes.lote.cidade", select: "nome_cidade" }, function(err, dataC) {
                            Estado.populate(dataC, { path: "lotes.lote.estado", select: "nome_estado" }, function(err, dataE) {
                                User.populate(dataE, { path: "lotes.lanceAtual.comprador", select: "login" }, function(err, dataU) {
                                    //console.log('populate');
                                    var obj = {
                                        total: count,
                                        data: dataU
                                    };
                                    return res.json(200, obj);
                                });
                            });
                        });
                    });
                });
            }
        });

    });


};


exports.detail = function(req, res) {
    console.log('detail');
    VendaDireta.findById(req.params.id,
        {
            description: 1,
            status: 1,
            tipo: 1,
            comitente: 1,
            condicaoVenda: 1,
            endDateTime: 1,
            retirada: 1,
            visitacao: 1,
            info_extra: 1,
            usuariosHabilitados: 1,

            // Wesley Inacio - 10/05/2017
            lotes: 1

        })
        .populate('comitente', 'simpleName image')
        .exec(function(err, vendaDireta) {
            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }


            return res.json(vendaDireta);
        });
};




// Creates a new role in the DB.
exports.create = function(req, res) {
    console.log(req.body);
    VendaDireta.create(req.body, function(err, vendaDireta) {
        for (var i = 0; i < vendaDireta.lotes.length; i++) {
            Lote.findById(lotes[i].lote, function(err, lote) {
                if (lote.disponivel == true) {
                    //emitir socket
                    console.log('novo_lote_indisponivel');
                    SockCtrl.emit('novo_lote_indisponivel', { comitente: lote.comitente });
                }
                lote.disponivel = false;
                lote.vendaDireta = req.params.id;
                lote.save();
            });
        }
        if (err) { return handleError(res, err); }
        return res.json(201, vendaDireta);
    });
};

// Updates an existing role in the DB.
exports.update = function(req, res) {
    console.log('to no update');
    console.log();
    //var lotes = req.body.lotes;
    req.body.lotes = [];

    var lotesToDelete = [];
    if (req.body._id) { delete req.body._id; }
    VendaDireta.findById(req.params.id)
        .exec(function(err, vendaDireta) {
            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }



            var updated = _.merge(vendaDireta, req.body);

            //updated.lotes = lotes;

            updated.save(function(err) {
                //setting disponivel = false


                console.log(err);
                if (err) { return handleError(res, err); }
                return res.json(200, vendaDireta);
            });
        });
};


exports.destroy = function(req, res) {
    VendaDireta.findById(req.params.id, function(err, vendaDireta) {
        if (err) { return handleError(res, err); }
        if (!vendaDireta) { return res.send(404); }
        vendaDireta.deleted = true;
        vendaDireta.active = false;
        vendaDireta.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};


exports.getProx = function(req, res) {

    console.log(req.body);

    //buscar leiloes que nao estejam encerrados (STATUS - 3)

    var user = req.user,
        page = req.body.page || 0,
        query = { status: { $ne: 3 }, active: true },
        fields = { description: 1, status: 1, tipo: 1, comitente: 1, vendaDiretaId: 1, startDateTime: 1 },
        paging = {
            skip: page * 28,
            limit: 28
        };

    query.deleted = false;

    if (req.body.description)
        query.description = new RegExp(req.body.description, 'i');


    query.active = true;

    //Apenas Lotes que nao sejam venda direta
    query.tipo = { "$nin": [2] };

    //Apenas Lotes em Loteamento e Abertos para lances
    query.status = { "$in": [1, 2] };

    console.log(query);

    VendaDireta
        .find(query, fields, paging)
        .populate('comitente', 'simpleName image')
        .sort({
            status: -1, endDateTime: 1, vendaDireteId: 1
        })
        .exec(function(err, vendaDireta) {
            if (err) {
                return handleError(res, err);
            }
            VendaDireta.count(query, function(err, total) {
                var obj = {
                    total: total,
                    data: vendaDireta
                };
                return res.json(200, obj);
            })
        });
};

exports.getEncerrados = function(req, res) {

    console.log('getEncerrados');

    //buscar leiloes que nao estejam abertos (STATUS - 1 e 2)

    var user = req.user,
        page = req.body.page || 0,
        query = { status: { $nin: [1, 2] }, active: true },
        fields = { description: 1, status: 1, tipo: 1, comitentes: 1, vendaDiretaId: 1, endDateTime: 1 },
        paging = {
            skip: page * 28,
            limit: 28
        };

    query.deleted = false;

    if (req.body.description)
        query.description = new RegExp(req.body.description, 'i');


    query.active = true;

    //Apenas Lotes que nao sejam venda direta
    query.tipo = { "$nin": [2] };


    console.log(query);

    VendaDireta
        .find(query, fields, paging)
        .populate('comitentes', 'simpleName image')
        .sort({
            vendaDiretaId: 1
        })
        .exec(function(err, vendaDireta) {
            if (err) {
                return handleError(res, err);
            }
            VendaDireta.count(query, function(err, total) {
                var obj = {
                    total: total,
                    data: vendaDireta
                };
                return res.json(200, obj);
            })
        });
};


exports.habilitar = function(req, res) {
    console.log('to no habilitar');
    console.log();
    var lotes = req.body.lotes;
    req.body.lotes = [];

    var _user = req.user._id;

    VendaDireta.findById(req.params.id)
        .exec(function(err, vendaDireta) {
            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }

            vendaDireta.usuariosHabilitados.push(_user);

            vendaDireta.save(function(err) {
                console.log(err);
                if (err) { return handleError(res, err); }
                return res.json(200, vendaDireta);
            });
        });
};

exports.addProposta = function(req, res) {
    console.log('addProposta');
    //console.log(req.user);

    var _user = req.user._id;
    var _proposta = req.body.proposta;
    _proposta.comprador = _user;

    VendaDireta.findOneAndUpdate({ _id: req.body.vendaId, 'lotes._id': req.body.vendaDiretaLoteId },
        {
            $push: { 'lotes.$.propostas': _proposta }
        },
        function(err, vendaDireta) {
            console.log('deu certo ');

            console.log(vendaDireta);
            console.log(err);

            if (err) { return handleError(res, err); }
            if (!vendaDireta) { return res.send(404); }


            return res.json(200, vendaDireta);

        });
};


// Get a single role
exports.getHabilitados = function(req, res) {
    console.log('getHabilitados');
    console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };


    var _queryUser = {};
    if (req.body.simpleName)
        _queryUser.simpleName = new RegExp(req.body.simpleName, 'i');

    var _ids = [];
    User.find(_queryUser, { _id: 1 }, function(err, result) {
        //console.log(result);
        for (var i = 0; i < result.length; i++) {
            _ids.push(mongoose.Types.ObjectId(result[i]._id));
        }

        var query = {};




        var aggregate = VendaDireta.aggregate({
            "$match": {
                _id: mongoose.Types.ObjectId(req.body.vendaDiretaId)
            }
        })
            .unwind("usuariosHabilitados")
            .match({ "usuariosHabilitados": { $in: _ids } })
            .project({
                "_id": 0,
                "usuariosHabilitados": 1
            })
            ;

        var options = { page: page, limit: paging.limit }

        VendaDireta.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
            if (err) {
                console.err(err);
                return handleError(res, err);
            }
            else {
                User.populate(results, { path: "usuariosHabilitados", select: "login addressCity addressState simpleName" }, function(err, data) {
                    Cidade.populate(data, { path: "usuariosHabilitados.addressCity", select: "nome_cidade" }, function(err, dataC) {
                        Estado.populate(data, { path: "usuariosHabilitados.addressState", select: "nome_estado" }, function(err, dataE) {
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
    });
};

// Get a single role
exports.getPropostas = function(req, res) {
    console.log('getPropostas');
    console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };

    var query = {};



    console.log(query);

    var aggregate = VendaDireta.aggregate({
        "$match": {
            "lotes._id": mongoose.Types.ObjectId(req.body.vendaLoteId)
        }
    })
        .unwind("lotes")
        .unwind("lotes.propostas")
        .match({ "lotes._id": mongoose.Types.ObjectId(req.body.vendaLoteId) })
        .sort("-lotes.propostas.createdAt")
        .project({
            "_id": 0,
            "lotes.propostas": 1
        })
        ;

    var options = { page: page, limit: paging.limit }

    VendaDireta.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
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

exports.aceitarProposta = function(req, res) {
    console.log('aceitarProposta');
    console.log(req.body);

    var _idLote = req.body.loteId;
    var _idProposta = req.body.propostaId;

    Venda.findOne({ "lotes._id": _idLote, "lotes.propostas._id": _idProposta })
        .deepPopulate("lotes.propostas.comprador", "simpleName email")
        .exec(function(err, venda) {
            if (err) { return handleError(res, err); }
            if (!venda) { return res.send(404); }
            var form = {};

            var _proposta = {};
            var _loteNumero = "";

            var _continuaLotes = true;
            var _continuaProp = true;

            var _propNegadas = [];
            for (var i = 0; i < venda.lotes.length; i++) {
                if (_continuaLotes) {
                    console.log(venda.lotes[i]._id, _idLote);
                    if (venda.lotes[i]._id == _idLote) {
                        console.log('achou o lote');
                        _loteNumero = venda.lotes[i].numero;
                        _continuaLotes = false;
                        for (var j = 0; j < venda.lotes[i].propostas.length; j++) {
                            // if (_continuaProp) {
                            if (venda.lotes[i].propostas[j]._id == _idProposta) {
                                _continuaProp = false;
                                console.log('achou o proposta');

                                venda.lotes[i].propostas[j].aceita = true;
                                venda.lotes[i].propostas[j].recusada = false;
                                venda.lotes[i].propostas[j].respondida = true;
                                _proposta = venda.lotes[i].propostas[j];

                                venda.lotes[i].vendido = true;
                                venda.lotes[i].propostaAceita = _proposta;

                            } else {
                                //marcar outras como recusadas
                                if (venda.lotes[i].propostas[j].recusada == false && venda.lotes[i].propostas[j].respondida == false) {
                                    venda.lotes[i].propostas[j].aceita = false;
                                    venda.lotes[i].propostas[j].recusada = true;
                                    venda.lotes[i].propostas[j].respondida = true;

                                    _propNegadas.push(venda.lotes[i].propostas[j]);
                                }
                            }
                            // }
                        }
                    }
                }
            }

            //  console.log(updated);
            venda.markModified('lotes');


            venda.save(function(err) {
                console.log(err);
                if (err) { return handleError(res, err); }

                Mail.findOne({ name: 'lote_vendadireta_vencedor_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    var _html = resultMail.html.toString().replace("[USER]", data.lotes[0].propostas[0].comprador.simpleName);
                    _html = _html.replace("[PROPOSTA]", data.lotes[0].propostas[0].valor);
                    _html = _html.replace("[LOTE]", result.lotes[0].numero);
                    _html = _html.replace("[VENDA]", result.description);
                    var form = {
                        from: resultMail.from,
                        to: data.lotes[0].propostas[0].comprador.email,
                        subject: resultMail.subject,
                        html: _html
                    };

                    MailCtrl.internalSendMail(form);
                });



                Mail.findOne({ name: 'lote_venda_recusada_usuario' }, function(err, resultMail) {
                    if (err) {
                        return handleError(res, err);
                    }
                    for (var i = 0; i < _propNegadas.length; i++) {
                        var _html = resultMail.html.toString().replace("[USER]", _propNegadas[i].comprador.simpleName);
                        _html = _html.replace("[PROPOSTA]", _propNegadas[i].valor);
                        _html = _html.replace("[LOTE]", _loteNumero);
                        _html = _html.replace("[VENDA]", venda.description);
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

// exports.aceitarProposta = function(req, res) {
//     console.log('aceitarProposta');
//     console.log(req.body);

//     var _idLote = req.body.loteId;
//     var _idProposta = req.body.propostaId;

//     VendaDireta.findOneAndUpdate(
//         { 'lotes.propostas._id': _idProposta },
//         { "$set": { "lotes.0.encerrado": true, "lotes.0.vendido": true, "lotes.0.propostas.$.vencedor": true } }, function(err, result) {
//             console.log(err);
//             console.log(result);
//             console.log('lote_finalizado');

//             //return res.json(200, result);
//             User.populate(result, { path: "lotes.propostas.comprador", select: "simpleName email" }, function(err, data) {
//                 Mail.findOne({ name: 'lote_vendadireta_vencedor_usuario' }, function(err, resultMail) {
//                     if (err) {
//                         return handleError(res, err);
//                     }

//                     //console.log(data.lotes[0].propostas[0].comprador.email);

//                     var _html = resultMail.html.toString().replace("[USER]", data.lotes[0].propostas[0].comprador.simpleName);
//                     _html = _html.replace("[PROPOSTA]", data.lotes[0].propostas[0].valor);
//                     _html = _html.replace("[LOTE]", result.lotes[0].numero);
//                     _html = _html.replace("[VENDA]", result.description);
//                     var form = {
//                         from: resultMail.from,
//                         to: data.lotes[0].propostas[0].comprador.email,
//                         subject: resultMail.subject,
//                         html: _html
//                     };

//                     MailCtrl.internalSendMail(form, function(err, body) {
//                         if (err) {
//                             return handleError(res, err);
//                         }

//                         return res.json(200, body);
//                     });
//                 });
//             });



//         }
//     );



// };

function buildFilter(obj, query) {

    console.log('olha a query aqui ==>>> ', obj);

    if (obj.name)
        query.name = new RegExp(obj.name, 'i');


    if (obj.active)
        query.active = obj.active;

    return query;

}






function handleError(res, err) {
    return res.send(500, err);
}