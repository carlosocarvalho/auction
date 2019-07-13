'use strict';

var _ = require('lodash');
var Leilao = require('./leilao.model');
var Comitente = require('../comitente/comitente.model');
var Lote = require('../lote/lote.model');
var Cidade = require('../cidade/cidade.model');
var Estado = require('../estado/estado.model');
var User = require('../user/user.model');
var Util = require('../utils/util');
var async = require('async');
var SockCtrl = require('../../socketCtrl');
var mongoose = require('mongoose');
var moment = require('moment');
var Mail = require('../mail/mail.model');
var MailCtrl = require('../mail/mail.controller');
var BoletoCtrl = require('../boleto/boleto.controller');

// Get list of roles
exports.index = function (req, res) {
  Leilao.find({
    deleted: false
  }, function (err, leilaos) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, leilaos);
  });
};

exports.getActive = function (req, res) {
  //console.log('getActive');
  Leilao.find({
    active: true,
    deleted: false
  }, function (err, leilaos) {
    console.log(err);
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, leilaos);
  });
};

// Get a single role
exports.show = function (req, res) {

  Leilao.findOne({
      _id: req.params.id
    }, {
      leilaoId: 1,
      description: 1,
      condicaoVenda: 1,
      status: 1,
      active: 1,
      endDateTime: 1,
      tipo: 1,
      comitentes: 1,
      retirada: 1,
      visitacao: 1,
      info_extra: 1

      // Wesley Inacio - 01/05/2017
      , lotes: 1
      , image: 1

    })
    .populate('condicaoVenda')
    .populate('comitentes', 'simpleName')
    .populate('lotes.lote', 'description comitente')
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }

      return res.json(leilao);
    });
};

// Get a single role
exports.getLotesRelacionados = function (req, res) {
  //console.log('getLotesRelacionados');
  //console.log(req.body);

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10

  var paging = {
    skip: page * _limit,
    limit: _limit
  };


  var _queryLote = {
    leilao: req.body.leilaoId
  };
  if (req.body.description)
    _queryLote.description = new RegExp(req.body.description, 'i');

  var _ids = [];


  console.log('=================================');
  console.log('a query para pegar o leilao é ' , _queryLote);
  console.log('=================================');

  Lote.find(_queryLote, {
    _id: 1
  }, {
    sort: {
      encerrado: 1
    }
  }, function (err, result) {
    ////console.log(result);
    for (var i = 0; i < result.length; i++) {
      _ids.push(mongoose.Types.ObjectId(result[i]._id));
    }

    //  //console.log(_ids);
    var query = null;

    query = {
      'lotes.deleted': false,
      "lotes.lote": {
        $in: _ids
      }
    };

    if (req.body.numero)
      query['lotes.numero'] = req.body.numero;

    if (req.body.vendido !== undefined)
      query['lotes.vendido'] = req.body.vendido;

    if (req.body.active !== undefined)
      query['lotes.active'] = req.body.active;

    ////console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
          "_id": mongoose.Types.ObjectId(req.body.leilaoId)
        }
      })
      .unwind("lotes")
      .sort("lotes.numero")
      .match(query)
      .project({
        "_id": 0,
        "lotes": {
          lote: 1,
          valorMinimoVenda: 1,
          vendido: 1,
          endTime: 1,
          numero: 1,
          lanceAtual: 1,
          active: 1,
          lances: 1,
          _id: 1,
          comissao: 1,
          lanceInicial: 1,
          incremento: 1
        }
      });

    var options = {
      page: page,
      limit: paging.limit
    }

    Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      } else {
        Lote.populate(results, {
          path: "lotes.lote",
          select: "description comitente image tags"
        }, function (err, data) {
          Comitente.populate(data, {
            path: "lotes.lote.comitente",
            select: "simpleName"
          }, function (err, dataP) {
            //console.log('populate');
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

exports.getLotesRelacionadosPublico = function (req, res) {
  console.log('getLotesRelacionadosPublico', req.body);
  ////console.log(req.body);


  console.log('=================================');
  console.log('publico ');
  console.log('=================================');  

  var page = req.body.page || 0;
  var _limit = req.body.limit || 8

  var paging = {
    skip: page * _limit,
    limit: _limit
  };


  var _queryLote = {
    $or: [{
      leilao: req.body.leilaoId
    }, {
      leilaoHistory: mongoose.Types.ObjectId(req.body.leilaoId)
    }]
  };
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

  if (req.body.loteId !== undefined)
    _queryLote._id = {
      $ne: req.body.loteId
    };

  console.log("_queryLote", _queryLote);
  
  var _ids = [];
  Lote.find(_queryLote, {
    _id: 1
  }, function (err, result) {
    if (err) {
      console.log(err);
      return handleError(res, err);
    }
    console.log(result);
    for (var i = 0; i < result.length; i++) {
      _ids.push(mongoose.Types.ObjectId(result[i]._id));
    }

    //  //console.log(_ids);
    var query = null;

    query = {
      'lotes.deleted': false,
      "lotes.lote": {
        $in: _ids
      }
    };

    if (req.body.tipo == 1 && req.body.search)
      query['lotes.numero'] = new RegExp(req.body.search, 'i');

    if (req.body.vendido !== undefined)
      query['lotes.vendido'] = req.body.vendido;



    if (req.body.active !== undefined)
      query['lotes.active'] = req.body.active;

    //////console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
          "_id": mongoose.Types.ObjectId(req.body.leilaoId)
        }
      })
      .unwind("lotes")
      .sort("lotes.numero")
      .match(query)
      .project({
        "_id": 0,
        status: 1,
        "lotes": {
          lote: 1,
          valorMinimoVenda: 1,
          vendido: 1,
          endTime: 1,
          numero: 1,
          lanceAtual: 1,
          active: 1,
          lances: 1,
          _id: 1,
          comissao: 1,
          visitas: 1,
          encerrado: 1,
          condicional: 1,
          movido: 1,
          lanceInicial: 1,
          incremento: 1
        }
      });

    var options = {
      page: page,
      limit: paging.limit
    }

    Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      } else {
        Lote.populate(results, {
          path: "lotes.lote",
          select: "description comitente image tags cidade estado"
        }, function (err, data) {
          Comitente.populate(data, {
            path: "lotes.lote.comitente",
            select: "simpleName image"
          }, function (err, dataP) {
            Cidade.populate(dataP, {
              path: "lotes.lote.cidade",
              select: "nome_cidade"
            }, function (err, dataC) {
              Estado.populate(dataC, {
                path: "lotes.lote.estado",
                select: "nome_estado"
              }, function (err, dataE) {

                var _lotes = [];
                for (var i = 0; i < dataE.length; i++) {
                  var _item = dataE[i];

                  var _compradores = [];
                  var _lances = [];
                  // //console.log('---> LANCES',_item.lotes.lances);
                  if (_item.lotes.lances) {
                    var _lances = _item.lotes.lances;

                  }
                  ////console.log("lances length", _lances);
                  for (var j = 0; j < _lances.length; j++) {
                    var _lance = _lances[j];
                    // //console.log(_lance);
                    // //console.log(_compradores);
                    // //console.log(_compradores.indexOf(_lance.comprador));

                    var _existe = false;
                    for (var y = 0; y < _compradores.length; y++) {
                      // //console.log(_compradores[y], _lance.comprador)
                      if (_compradores[y].toString() === _lance.comprador.toString()) {
                        // //console.log('igual');
                        _existe = true;
                      }
                    }

                    if (_existe == false) {
                      _compradores.push(_lance.comprador);
                    }
                  }

                  var _lancesCount = _lances.length;
                  _item.lotes.lances = [];
                  var _lote = {
                    lances: _lancesCount,
                    item: _item.lotes,
                    compradores: _compradores.length
                  };

                  _lotes.push(_lote);
                }

                // //console.log('populate');
                var obj = {
                  total: count,
                  data: _lotes
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

exports.getLotesRelacionadosPainel = function (req, res) {
  //console.log('getLotesRelacionadosPainel');
  // //console.log(req.body);

  var page = req.body.page || 0;
  var _limit = req.body.limit || 18

  var paging = {
    skip: page * _limit,
    limit: _limit
  };


  var _queryLote = {
    leilao: req.body.leilaoId
  };

  if (req.body.tipo == 2 && req.body.search)
    _queryLote.description = new RegExp(req.body.search, 'i');

  var _ids = [];
  Lote.find(_queryLote, {
    _id: 1
  }, function (err, result) {
    ////console.log(result);
    for (var i = 0; i < result.length; i++) {
      _ids.push(mongoose.Types.ObjectId(result[i]._id));
    }

    //  //console.log(_ids);
    var query = null;

    query = {
      'lotes.deleted': false,
      "lotes.lote": {
        $in: _ids
      }
    };

    if (req.body.tipo == 1 && req.body.search)
      query['lotes.numero'] = new RegExp(req.body.search, 'i');

    if (req.body.active !== undefined)
      query['lotes.active'] = req.body.active;

    //////console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
          "_id": mongoose.Types.ObjectId(req.body.leilaoId)
        }
      })
      .unwind("lotes")
      .sort("lotes.encerrado lotes.numero")
      .match(query)
      .project({
        "_id": 0,
        "lotes": {
          lote: 1,
          valorMinimoVenda: 1,
          vendido: 1,
          endTime: 1,
          numero: 1,
          lanceAtual: 1,
          active: 1,
          lances: 1,
          _id: 1,
          comissao: 1,
          lanceInicial: 1,
          incremento: 1,
          movido: 1,
          condicional: 1,
          encerrado: 1
        }
      });

    var options = {
      page: page,
      limit: paging.limit
    }

    Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      } else {
        Lote.populate(results, {
          path: "lotes.lote",
          select: "description comitente image tags cidade estado "
        }, function (err, data) {
          Comitente.populate(data, {
            path: "lotes.lote.comitente",
            select: "simpleName image"
          }, function (err, dataP) {
            Cidade.populate(dataP, {
              path: "lotes.lote.cidade",
              select: "nome_cidade"
            }, function (err, dataC) {
              Estado.populate(dataC, {
                path: "lotes.lote.estado",
                select: "nome_estado"
              }, function (err, dataE) {
                User.populate(dataE, {
                  path: "lotes.lanceAtual.comprador",
                  select: "login"
                }, function (err, dataU) {
                  ////console.log('populate');
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

// exports.detail = function (req, res) {
//   //console.log('detail');
//   Leilao.findById(req.params.id)
//     .populate('condicaoVenda')
//     .populate('comitentes', 'simpleName image')
//     .populate('lotes.lote', 'id description comitente visitas compradores lances image tags')
//     .deepPopulate('lotes.lote.comitente lotes.lote.estado lotes.lote.cidade lotes.lote.categoria', {
//       populate: {
//         'lotes.lote.comitente': { select: 'simpleName image' },
//         'lotes.lote.estado': { select: 'nome_estado' },
//         'lotes.lote.cidade': { select: 'nome_cidade' },
//         'lotes.lote.categoria': { select: 'name' }
//       }
//     })
//     .exec(function (err, leilao) {
//       if (err) { return handleError(res, err); }
//       if (!leilao) { return res.send(404); }


//       return res.json(leilao);
//     });
// };

exports.detail = function (req, res) {
  //console.log('detail');
  Leilao.findById(req.params.id, {
      leilaoId: 1,
      description: 1,
      status: 1,
      tipo: 1,
      numero: 1,
      comitentes: 1,
      condicaoVenda: 1,
      endDateTime: 1,
      retirada: 1,
      visitacao: 1,
      info_extra: 1
      
      // Wesley Inacio - 19/05/2017
      , image: 1      
    })
    .populate('condicaoVenda')
    .populate('comitentes', 'simpleName image')
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }


      return res.json(leilao);
    });
};

exports.getLoteDetail = function (req, res) {
  //console.log('getLoteDetail', req.params.id);
 /*
  Leilao.findOneAndUpdate({ 'lotes._id': req.params.id },
    { $inc: { 'lotes.$.visitas': 1 } },
    {
      new: false, fields: {
        'lotes.$': 1, description: 1, usuariosHabilitados: 1,
        comitentes: 1, tipo: 1, numero: 1, createdAt: 1,
      })
      */
      
    Leilao.findOneAndUpdate({
      'lotes._id': req.params.id
    }, {
      $inc: {
        'lotes.$.visitas': 1
      }
    }, {
      new: false,
      fields: {
        'lotes.$': 1,
        description: 1,
        usuariosHabilitados: 1,
        comitentes: 1,
        tipo: 1,
        createdAt: 1,
        condicaoVenda: 1,
        status: 1,
        info_extra: 1,
        visitacao: 1,
        retirada: 1,
        leilaoId: 1

        // Wesley Inacio - 19/05/2017
        , image: 1

      }
    },
    function (err, leilao) {
      console.log(err);
      //console.log(obj);
      if (err) {
        return handleError(res, err);
      }
      console.log('deu certo ');
      ////console.log("----> LEILAO", leilao);
      if (!leilao) {
        return res.send(404);
      }

      Lote.populate(leilao, {
        path: "lotes.lote",
        select: "id description comitente  image images tags categoria subCategoria visitacao retirada"
      }, function (err, dataL) {
        // //console.log(dataL);
        Leilao.deepPopulate(dataL, 'lotes.lote.comitente lotes.lote.estado lotes.lote.cidade lotes.lote.categoria lotes.lote.subCategoria  lotes.lanceAtual.comprador lotes.lances.comprador.addressState lotes.lances.comprador.addressCity condicaoVenda', {
          populate: {
            'lotes.lote.comitente': {
              select: 'simpleName image'
            },
            'lotes.lote.estado': {
              select: 'nome_estado'
            },
            'lotes.lote.cidade': {
              select: 'nome_cidade'
            },
            'lotes.lote.categoria': {
              select: 'name fatherId'
            },
            'lotes.lote.subCategoria': {
              select: 'name '
            },
            // 'lotes.lances.comprador': { select: 'login addressState addressCity' },
            'lotes.lanceAtual.comprador': {
              select: 'login'
            },
            'lotes.lances.comprador.addressState': {
              select: 'nome_estado'
            },
            'lotes.lances.comprador.addressCity': {
              select: 'nome_cidade'
            },
            'condicaoVenda': {
              select: 'description'
            }
          }
        }, function (err, dataFull) {


          //dataFull.lotes[0].lances = [];
          var _lances = [];
          if (dataFull.lotes[0].lances !== undefined) {
            _lances = dataFull.lotes[0].lances;
          }
          dataFull.lotes[0].lances = [];
          ////console.log("-----> LANCES", _lances);

          //   //console.log("-----> LANCES",_lances);

          var _compradores = [];

          for (var j = 0; j < _lances.length; j++) {
            var _lance = _lances[j];
            if (_compradores.indexOf(_lance.comprador) == -1) {
              _compradores.push(_lance.comprador);
            }
          }

          var obj = {
            lances: _lances.length,
            compradores: _compradores.length,
            data: dataFull
          };



          console.log('aqui?');
          return res.json(200, obj);
        });
      });



    });
  // .populate('lotes.lote', 'id description comitente  image images tags categoria')
  // .deepPopulate('lotes.lote.comitente lotes.lote.estado lotes.lote.cidade lotes.lote.categoria lotes.lote.categoria.fatherId  lotes.lanceAtual.comprador lotes.lances.comprador.addressState lotes.lances.comprador.addressCity', {
  //   populate: {
  //     'lotes.lote.comitente': { select: 'simpleName image' },
  //     'lotes.lote.estado': { select: 'nome_estado' },
  //     'lotes.lote.cidade': { select: 'nome_cidade' },
  //     'lotes.lote.categoria': { select: 'name fatherId' },
  //     'lotes.lote.categoria.fatherId': { select: 'name ' },
  //     // 'lotes.lances.comprador': { select: 'login addressState addressCity' },
  //     'lotes.lanceAtual.comprador': { select: 'login' },
  //     'lotes.lances.comprador.addressState': { select: 'nome_estado' },
  //     'lotes.lances.comprador.addressCity': { select: 'nome_cidade' }
  //   }
  // }
  //);
};

exports.getPainel = function (req, res) {

  var page = req.body.page || 0

  var paging = {
    skip: page * 10,
    limit: 10
  };

  Leilao.findOne({
      _id: req.params.id
    }, {
      leilaoId: 1,
      description: 1,
      condicaoVenda: 1,
      usuariosHabilitados: 1,
      tipo: 1,
      status: 1,
      comitentes: 1

      // Wesley Inacio - 19/05/2017
      , image: 1
      
    })
    .populate('comitentes', 'simpleName')
    // .populate('lotes.lote', 'description comitente')
    // .deepPopulate('lotes.lote.comitente lotes.lanceAtual.comprador', {
    //   populate: {
    //     'lotes.lote.comitente': { select: 'simpleName image' },
    //     'lotes.lanceAtual.comprador': { select: 'login' }
    //   }
    // })
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }

      //leilao.lotes = leilao.lotes.slice(paging.skip, paging.skip + paging.limit);

      return res.json(leilao);
    });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
  //console.log(req.body);
  Leilao.create(req.body, function (err, leilao) {
    console.log(err);
    if (err) {
      return handleError(res, err);
    }
    for (var i = 0; i < leilao.lotes.length; i++) {
      Lote.findById(lotes[i].lote, function (err, lote) {
        if (lote.disponivel == true) {
          //emitir socket
          //console.log('novo_lote_indisponivel');
          SockCtrl.emit('novo_lote_indisponivel', {
            comitente: lote.comitente
          });
        }
        lote.disponivel = false;
        lote.leilao = req.params.id;
        lote.save();
      });
    }

    return res.json(201, leilao);
  });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {

  console.log('===============================');
  console.log('===============================');

  console.log('update');

  console.log('===============================');
  console.log('===============================');


  req.body.lotes = [];

  var lotesToDelete = [],
    dateBefore = null,
    dateAfter = null,
    timeToAdd = 0;

  if (req.body._id) {
    delete req.body._id;
  }
  Leilao.findById(req.params.id)
    // .populate('lotes.lote', 'description comitente')
    // .deepPopulate('lotes.lote.comitente', 'simpleName')
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }

      dateBefore = new moment(leilao.endDateTime);
      dateAfter = new moment(req.body.endDateTime);

      console.log("data antiga: " + dateBefore);
      console.log("data nova: " + dateAfter);


      var updated = _.merge(leilao, req.body);


      if (dateBefore != dateAfter) {

        console.log('é diferente ');


        updated.lotes = updated.lotes
          .sort(function (a, b) {
            return parseFloat(a.numero) - parseFloat(b.numero)
          });


        for (var i = 0; i < updated.lotes.length; i++) {

          updated.lotes[i].endTime = dateAfter
            //.add(timeToAdd, 'm')
            .toDate();

          updated.lotes[i].endTime = new moment(updated.lotes[i].endTime).add(timeToAdd, 'm').toDate();

          timeToAdd += 3;

          console.log(updated.lotes[i].numero);

        };

        //updated.markModified('lotes');

        // updated.lotes.forEach(function (item) {

        //   item.endDateTime

        // });

      }

      // planilha#codigo 28: Possibilitar a exclusão de um comitente após ser adicionado referente a uma lista - Wesley Inacio - 28/04/2017
      updated.markModified('comitentes');

      updated.save(function (err) {

        ////console.log(lotes);
        // for (var i = 0; i < lotes.length; i++) {
        //   if (lotes[i].deleted == true) {
        //     Lote.findById(lotes[i].lote, function (err, lote) {
        //       if (lote.disponivel == false) {
        //         //emitir socket
        //         //console.log('novo_lote_disponivel');
        //         SockCtrl.emit('novo_lote_disponivel', { comitente: lote.comitente });
        //       }
        //       lote.disponivel = true;
        //       lote.leilao = undefined;
        //       lote.save();
        //     });
        //   } else {
        //     Lote.findById(lotes[i].lote, function (err, lote) {
        //       if (lote.disponivel == true) {
        //         //emitir socket
        //         //console.log('novo_lote_indisponivel');
        //         SockCtrl.emit('novo_lote_indisponivel', { comitente: lote.comitente });
        //       }
        //       lote.disponivel = false;
        //       lote.leilao = req.params.id;
        //       lote.save();
        //     });
        //   }

        // }
        //setting disponivel = false


        console.log(err);
        if (err) {
          return handleError(res, err);
        }
        return res.json(200, leilao);
      });
    });
};

// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Leilao.findById(req.params.id, function (err, leilao) {
//     if (err) { return handleError(res, err); }
//     if (!leilao) { return res.send(404); }
//     leilao.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
  Leilao.findById(req.params.id, function (err, leilao) {
    if (err) {
      return handleError(res, err);
    }
    if (!leilao) {
      return res.send(404);
    }
    leilao.deleted = true;
    leilao.active = false;
    leilao.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};


exports.search = function (req, res) {

  //console.log(req.body);

  var user = req.user,
    page = req.body.page || 0,
    query = {
      status: {
        $nin: [3, 4]
      }
    },
    fields = {},
    paging = {
      skip: page * 10,
      limit: 10,

      sort: {
        leilaoId: -1
      }
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

  //////console.log(query);

  Leilao
    .find(query, fields, paging)
    .populate('comitentes', 'simpleName')
    .sort({
      status: -1,
      endDateTime: 1
    })
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      Leilao.count(query, function (err, total) {
        var obj = {
          total: total,
          data: leilao
        };
        return res.json(200, obj);
      })
    });
};


exports.addLote = function (req, res) {
  //console.log('addLote');
  var _lote = req.body.lote;

  Leilao.findOneAndUpdate({
      _id: req.body.leilaoId
    }, {
      $push: {
        lotes: _lote
      }
    },
    function (err, leilao) {
      console.log(err);

      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }


      Lote.findOneAndUpdate({
          _id: _lote.lote
        }, {
          $set: {
            disponivel: false,
            leilao: req.body.leilaoId
          },
          $push: {
            leilaoHistory: req.body.leilaoId
          }
        },
        function (err2, lote) {

          if (err2) {
            return handleError(res, err2);
          }
          if (!lote) {
            return res.send(404);
          }

          //console.log('lote inserido ');
          //console.log('novo_lote_indisponivel');
          SockCtrl.emit('novo_lote_indisponivel', {
            comitente: _lote.comitente
          });
          return res.send(200);

        });

    });
};

exports.updateLote = function (req, res) {

  var _lote = req.body.lote;

  Leilao.findOneAndUpdate({
      'lotes._id': req.body.leilaoLoteId
    }, {
      $set: {
        'lotes.$.endTime': _lote.endTime,
        'lotes.$.numero': _lote.numero,
        'lotes.$.valorMinimoVenda': _lote.valorMinimoVenda,
        'lotes.$.lanceInicial': _lote.lanceInicial,
        'lotes.$.incremento': _lote.incremento,
        'lotes.$.comissao': _lote.comissao,
        'lotes.$.active': _lote.active,
        'lotes.$.deleted': _lote.deleted
      }
    },
    function (err, leilao) {
      //console.log('deu certo ');
      SockCtrl.emit('lote_editado', {
        leilao: leilao._id,
        leilaoLoteId: req.body.leilaoLoteId,
        lote: _lote
      });

      ////console.log(leilao);
      console.log(err);

      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }

      if (_lote.deleted) {
        Lote.findOneAndUpdate({
            _id: _lote.lote
          }, {
            $set: {
              disponivel: true,
              leilao: undefined
            }
          },
          function (err2, lote) {

            if (err2) {
              return handleError(res, err2);
            }
            if (!lote) {
              return res.send(404);
            }

            //console.log('lote removido ');
            //console.log('novo_lote_disponivel');
            SockCtrl.emit('novo_lote_disponivel', {
              comitente: _lote.comitente
            });
            return res.send(200);

          });

      } else {
        return res.send(200);
      }

    });
};


exports.getProx = function (req, res) {
  var page = req.body.page || 0;
  var _limit = req.body.limit || 18

  var paging = {
    skip: page * _limit,
    limit: _limit
  };
  console.log('page', page);
  console.log('paging', paging);

  //buscar leiloes que nao estejam encerrados (STATUS - 3)

  var user = req.user,
    page = req.body.page || 0,
    query = {
      status: {
        $nin: [3, 4]
      },
      active: true
    },
    fields = {
      description: 1,
      status: 1,
      tipo: 1,
      comitentes: 1,
      leilaoId: 1,
      endDateTime: 1

      // Wesley Inacio - 19/05/2017
      , image: 1

    };


  query.deleted = false;

  if (req.body.description)
    query.description = new RegExp(req.body.description, 'i');


  query.active = true;


  //Apenas Lotes em Loteamento e Abertos para lances
  query.status = {
    "$in": [1, 2]
  };

  console.log(query);

  Leilao
    .find(query, fields, paging)
    .populate('comitentes', 'simpleName image')
    .sort({
      status: -1,
      endDateTime: 1,
      leilaoId: 1
    })
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      Leilao.count(query, function (err, total) {
        var obj = {
          total: total,
          data: leilao
        };
        return res.json(200, obj);
      })
    });
};

exports.posLeilao = function (req, res) {
  var page = req.body.page || 0;
  var _limit = req.body.limit || 18

  var paging = {
    skip: page * _limit,
    limit: _limit
  };
  //console.log('posLeilao');

  //buscar leiloes que nao estejam abertos (STATUS - 1 e 2)

  var user = req.user,
    query = {
      status: 3,
      active: true,
      deleted: false
    },
    fields = {
      description: 1,
      status: 1,
      tipo: 1,
      comitentes: 1,
      leilaoId: 1,
      endDateTime: 1

      // Wesley Inacio - 19/05/2017
      , image: 1
    };

  ;

  if (req.body.description)
    query.description = new RegExp(req.body.description, 'i');



  Leilao
    .find(query, fields, paging)
    .populate('comitentes', 'simpleName image')
    .sort({
      endDateTime: -1
    })
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      Leilao.count(query, function (err, total) {
        var obj = {
          total: total,
          data: leilao
        };
        return res.json(200, obj);
      })
    });
};


exports.getEncerrados = function (req, res) {

  //console.log('getEncerrados');

  //buscar leiloes que nao estejam abertos (STATUS - 1 e 2)

  var user = req.user,
    page = req.body.page || 0,
    query = {
      status: 4,
      active: true
    },
    fields = {
      description: 1,
      status: 1,
      tipo: 1,
      comitentes: 1,
      leilaoId: 1,
      endDateTime: 1

      // Wesley Inacio - 19/05/2017
      , image: 1
    },
    paging = {
      skip: page * 28,
      limit: 28
    };

  query.deleted = false;

  if (req.body.description)
    query.description = new RegExp(req.body.description, 'i');


  query.active = true;



  //////console.log(query);

  Leilao
    .find(query, fields, paging)
    .populate('comitentes', 'simpleName image')
    .sort({
      endDateTime: -1
    })
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      Leilao.count(query, function (err, total) {
        var obj = {
          total: total,
          data: leilao
        };
        return res.json(200, obj);
      })
    });
};


exports.habilitar = function (req, res) {
  //console.log('to no habilitar');
  //console.log();
  var lotes = req.body.lotes;
  req.body.lotes = [];

  var _user = req.user._id;

  Leilao.findById(req.params.id)
    .exec(function (err, leilao) {
      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }

      leilao.usuariosHabilitados.push(_user);

      leilao.save(function (err) {
        console.log(err);
        if (err) {
          return handleError(res, err);
        }
        return res.json(200, leilao);
      });
    });
};

exports.lance = function (req, res) {
  //console.log('lance');

  var _user = req.user._id;


  var _user = req.user._id;
  var _lance = req.body.lance;
  var _endTime = req.body.endTime;
  //console.log(_endTime);

  Leilao.findOneAndUpdate({
      'lotes._id': req.body.leilaoLoteId
    }, {
      $push: {
        'lotes.$.lances': _lance
      },
      $set: {
        'lotes.$.lanceAtual': _lance,
        'lotes.$.endTime': _endTime
      }
    },
    // {
    //   new : true,
    //   fields:{'lotes.$': 1}
    // },
    function (err, leilao) {
      //console.log('deu certo ');

      ////console.log(leilao);
      console.log(err);

      if (err) {
        return handleError(res, err);
      }
      if (!leilao) {
        return res.send(404);
      }


      _lance.comprador = {
        _id: _lance.comprador,
        login: req.user.login
      };

      //console.log('novo_lance');
      SockCtrl.emit('novo_lance', {
        leilao: leilao._id,
        leilaoLoteId: req.body.leilaoLoteId,
        lance: _lance,
        endTime: _endTime
      });
      return res.json(200, leilao);

    });
};


// Get a single role
exports.getHabilitados = function (req, res) {
  //console.log('getHabilitados');
  //console.log(req.body);

  var _userId = undefined;

  if (req.body.userId == undefined) {

    _userId = req.user.id;
    console.log(_userId);
  } else {
    _userId = req.body.userId;
    console.log(_userId);
  };

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10
  //var userId = req.user._id;

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var query = {};

  // Defining filter
  if (req.body.description)
    query.description = new RegExp(req.body.description, 'i');
  if (req.body.startDate || req.body.endDate)
    query.createdAt = {};
  if (req.body.startDate)
    query.createdAt.$gte = new Date(req.body.startDate);
  if (req.body.endDate)
    query.createdAt.$lte = new Date(req.body.endDate);

  var aggregate = Leilao.aggregate({
      "$match": {
        "usuariosHabilitados": mongoose.Types.ObjectId(_userId)
      }
    })
    .unwind("usuariosHabilitados")
    .match(query)
    .project({
      "_id": 0,
      "createdAt": 1,
      "description": 1
    });

  var options = {
    page: page,
    limit: paging.limit
  }

  Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
    if (err) {
      console.err(err);
      return handleError(res, err);
    } else {
      var obj = {
        total: count,
        data: results
      };
      return res.json(200, obj);
    }
  });
};

// Get a single role
exports.getLances = function (req, res) {
  //console.log('getLances');
  //console.log(req.body);

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var query = {};



  //////console.log(query);

  var aggregate = Leilao.aggregate({
      "$match": {
        "lotes._id": mongoose.Types.ObjectId(req.body.leilaoLoteId)
      }
    })
    .unwind("lotes")
    .unwind("lotes.lances")
    .match({
      "lotes._id": mongoose.Types.ObjectId(req.body.leilaoLoteId)
    })
    .sort("-lotes.lances.createdAt")
    .project({
      "_id": 0,
      "lotes.lances": 1
    });

  var options = {
    page: page,
    limit: paging.limit
  }

  Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
    if (err) {
      console.err(err);
      return handleError(res, err);
    } else {
      User.populate(results, {
        path: "lotes.lances.comprador",
        select: "login addressCity addressState"
      }, function (err, data) {
        Cidade.populate(data, {
          path: "lotes.lances.comprador.addressCity",
          select: "nome_cidade"
        }, function (err, dataC) {
          Estado.populate(data, {
            path: "lotes.lances.comprador.addressState",
            select: "nome_estado"
          }, function (err, dataE) {
            //     //console.log('populate');
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



exports.getLancesByUser = function (req, res) {
  //console.log('getLances');
  //console.log(req.body);
  console.log("Id de chegada no banco", req.body.userId);

  var _userId = undefined;

  if (req.body.userId == undefined) {

    _userId = req.user.id;
    console.log(_userId);
  } else {
    _userId = req.body.userId;
    console.log(_userId);
  };

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var query = {};
  var _queryLote = {
    active: true,
    deleted: false
  };

  var matchQuery = {
    "lotes.lances.comprador": mongoose.Types.ObjectId(_userId)
  };

  // Defining filter
  if (req.body.descricao)
    _queryLote.description = new RegExp(req.body.descricao, 'i');

  if ((req.body.startDate) && (!req.body.endDate))
    query.createdAt = {
      $gte: new Date(req.body.startDate)
    };
  else if ((!req.body.startDate) && (req.body.endDate))
    query.createdAt = {
      $lte: new Date(req.body.endDate)
    };
  else if ((req.body.startDate) && (req.body.endDate))
    query.createdAt = {
      $gte: new Date(req.body.startDate),
      $lte: new Date(req.body.endDate)
    };

  // Searching lote description
  Lote.find(_queryLote, {
    _id: 1
  }, function (err, result) {
    var _LoteIds = [];
    ////console.log(result);
    for (var i = 0; i < result.length; i++) {
      _LoteIds.push(mongoose.Types.ObjectId(result[i]._id));
    }

    //  //console.log(_ids);
    //console.log(_LoteIds);

    /*query = {
        'lotes.encerrado': false, 'lotes.deleted': false,
        "lotes.lote": { $in: _LoteIds }
    };*/

    // Creating a match query
    if (_LoteIds.length > 0)
      matchQuery["lotes.lote"] = {
        $in: _LoteIds
      };
    if (query.createdAt)
      matchQuery["lotes.lances.createdAt"] = query.createdAt;

    //////console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {
          "lotes.lances.comprador": mongoose.Types.ObjectId(req.user._id)
        }
      })
      .unwind("lotes")
      .unwind("lotes.lances")
      .match(matchQuery)
      //.match({ "lotes.lances.comprador": mongoose.Types.ObjectId(req.user._id) })
      .sort("-lotes.lances.createdAt")
      .project({
        "_id": 0,
        "lotes.lances": 1,
        "lotes.lote": 1,
        "lotes.numero": 1,
        "lotes.incremento": 1,
        "lotes.comissao": 1,
        "description": 1,
        "lotes.vendido": 1
      });

    var options = {
      page: page,
      limit: paging.limit
    }

    Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      } else {
        Lote.populate(results, {
          path: "lotes.lote",
          select: "description"
        }, function (err, data) {
          if (err) {
            console.err(err);
            return handleError(res, err);
          }
          //     Cidade.populate(data, { path: "lotes.lances.comprador.addressCity", select: "nome_cidade" }, function(err, dataC) {
          //         Estado.populate(data, { path: "lotes.lances.comprador.addressState", select: "nome_estado" }, function(err, dataE) {
          //             //     //console.log('populate');
          var obj = {
            total: count,
            data: data
          };
          return res.json(200, obj);
          //         });
          //     });
        });


      }
    });
  });
};

exports.getPropostasByUser = function (req, res) {
  //console.log('getLances');
  //console.log(req.body);


  var _userId = undefined;

  if (req.body.userId == undefined) {

    _userId = req.user.id;
    console.log(_userId);
  } else {
    _userId = req.body.userId;
    console.log(_userId);
  };

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var query = {};
  var _queryLote = {
    active: true,
    deleted: false
  };

  var _queryComitente = {
    active: true,
    deleted: false
  }

  var matchQuery = {
    "lotes.propostas.comprador": mongoose.Types.ObjectId(_userId)
  };

  // Defining filter
  if (req.body.lote)
    _queryLote.description = new RegExp(req.body.lote, 'i');

  if (req.body.comitente)
    _queryComitente.description = new RegExp(req.body.comitente, 'i');

  if (req.body.startDate || req.body.endDate)
    query.createdAt = {};

  if (req.body.startDate)
    query.createdAt.$gte = new Date(req.body.startDate);
  if (req.body.endDate)
    query.createdAt.$lte = new Date(req.body.endDate);

  Comitente.find(_queryComitente, {
    _id: 1
  }, function (err, result) {
    // Searching ID from description
    var _ComitenteIds = [];
    for (var i = 0; i < result.length; i++) {
      _ComitenteIds.push(mongoose.Types.ObjectId(result[i]._id));
    }

    // Searching lote
    // Searching lote description
    Lote.find(_queryLote, {
      _id: 1
    }, function (err, result) {
      var _LoteIds = [];
      ////console.log(result);
      for (var i = 0; i < result.length; i++) {
        _LoteIds.push(mongoose.Types.ObjectId(result[i]._id));
      }

      //  //console.log(_ids);
      //console.log(_LoteIds);

      /*query = {
          'lotes.encerrado': false, 'lotes.deleted': false,
          "lotes.lote": { $in: _LoteIds }
      };*/

      // Creating a match query
      if (_LoteIds.length > 0)
        matchQuery["lotes.lote"] = {
          $in: _LoteIds
        };
      if (query.createdAt)
        matchQuery["lotes.propostas.createdAt"] = query.createdAt;

      if (req.body.propostaMax || req.body.propostaMin)
        matchQuery["lotes.propostas.valor"] = {};
      if (req.body.propostaMin)
        matchQuery["lotes.propostas.valor"].$gte = req.body.propostaMin;
      if (req.body.propostaMax)
        matchQuery["lotes.propostas.valor"].$lte = req.body.propostaMax;

      // ////console.log(query);

      var aggregate = Leilao.aggregate({
          "$match": {
            "lotes.propostas.comprador": mongoose.Types.ObjectId(req.user._id)
          }
        })
        .unwind("lotes")
        .unwind("lotes.propostas")
        .match(matchQuery)
        //.match({ "lotes.lances.comprador": mongoose.Types.ObjectId(req.user._id) })
        .sort("-lotes.propostas.createdAt")
        .project({
          "_id": 0,
          "lotes.lote": 1,
          "lotes.propostas.createdAt": 1,
          "lotes.propostas.valor": 1,
          "lotes.propostas.contraPropostaValor": 1,
          "lotes.propostas.aceita": 1,
          "lotes.propostas.recusada": 1,
          "lotes.propostas.respondida": 1
        });

      var options = {
        page: page,
        limit: paging.limit
      }

      Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
        if (err) {
          console.error(err);
          return handleError(res, err);
        } else {
          Lote.populate(results, {
            path: "lotes.lote",
            select: "description comitente"
          }, function (err, dataL) {
            Comitente.populate(dataL, {
              path: "lotes.lote.comitente",
              select: "nomeFantasia"
            }, function (err, dataC) {
              if (err) {
                console.err(err);
                return handleError(res, err);
              } else {
                var obj = {
                  total: count,
                  data: dataC
                };
                return res.json(200, obj);
              }
            });
          });
        };
      });
    });
  });
}

exports.getLancesArrematadosByUser = function (req, res) {
  //console.log('getLancesArrematadosByUser');
  //console.log(req.body);

  var _userId = undefined;

  if (req.body.userId == undefined) {

    _userId = req.user.id;
    console.log(_userId);
  } else {
    _userId = req.body.userId;
    console.log(_userId);
  };

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var query = {
    "lotes.lanceAtual.comprador": mongoose.Types.ObjectId(_userId),
    "lotes.vendido": true
  };

  // Defining filters
  if (req.body.description)
    query.description = new RegExp(req.body.description, 'i');
  if (req.body.startDate || req.body.endDate)
    query["lotes.lanceAtual.createdAt"] = {};
  if (req.body.startDate)
    query["lotes.lanceAtual.createdAt"].$gte = new Date(req.body.startDate);
  if (req.body.endDate)
    query["lotes.lanceAtual.createdAt"].$lte = new Date(req.body.endDate);

  //////console.log(query);

  var aggregate = Leilao.aggregate({
      "$match": {
        "lotes.lanceAtual.comprador": mongoose.Types.ObjectId(req.user._id)
      }
    })
    .unwind("lotes")
    .unwind("lotes.lanceAtual")
    .match(query
      /*{
          "lotes.lanceAtual.comprador": mongoose.Types.ObjectId(req.user._id),
          "lotes.vendido": true
      }*/
    )
    .sort("-lotes.lanceAtual.createdAt")
    .project({
      "_id": 0,
      "lotes.lanceAtual": 1,
      "lotes.lote": 1,
      "description": 1,
      "lotes.numero": 1,
      "lotes.comissao": 1
    });

  var options = {
    page: page,
    limit: paging.limit
  }

  Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
    if (err) {
      console.error(err);
      return handleError(res, err);
    } else {
      Lote.populate(results, {
        path: "lotes.lote",
        select: "description"
      }, function (err, data) {
        //     Cidade.populate(data, { path: "lotes.lances.comprador.addressCity", select: "nome_cidade" }, function(err, dataC) {
        //         Estado.populate(data, { path: "lotes.lances.comprador.addressState", select: "nome_estado" }, function(err, dataE) {
        //             //     //console.log('populate');
        var obj = {
          total: count,
          data: data
        };
        return res.json(200, obj);
        //         });
        //     });
      });


    }
  });
};

function buildFilter(obj, query) {

  //console.log('olha a query aqui ==>>> ', obj);

  if (obj.name)
    query.name = new RegExp(obj.name, 'i');


  if (obj.active)
    query.active = obj.active;

  return query;

}



exports.getFinalizarLotes = function (req, res) {
  exports.finalizarLotes(function (err) {
    if (err) {
      console.err(err);
      return handleError(res, err);
    } else {
      return res.send(200, 'OK');
    }
  });
};

exports.finalizarLotes = function (callback) {
  //console.log('finalizarLotes');

  var query = {
    'lotes.endTime': {
      $lte: new Date()
    },
    'lotes.encerrado': false,
    status: 2
  };



  Leilao.aggregate()
    .unwind("lotes")
    .match(query)
    .project({
      "_id": 1,
      "leilaoId": 1,
      "lotes": {
        lote: 1,
        valorMinimoVenda: 1,
        vendido: 1,
        endTime: 1,
        numero: 1,
        lanceAtual: 1,
        active: 1,
        _id: 1,
        encerrado: 1
      }
    }).exec(function (err, data) {
      console.log(err);
      User.populate(data, {
        path: "lotes.lanceAtual.comprador",
        select: "simpleName email"
      }, function (err, dataU) {
        //console.log('populate');

        ////console.log(dataU);

        for (var i = 0; i < dataU.length; i++) {

          var _item = dataU[i];
          //console.log(_item.lotes._id);
          //2 - marcar vendido 
          var _vendido = false;
          var _vendidoCondicional = false;
          var _pagamentoGerado = false;

          if (_item.lotes.lanceAtual == undefined) {
            _vendido = false;
            _vendidoCondicional = false;

          } else {

            /* Retirada condição desnecessária --Gustavo Garcia 09/27

              } else if (_item.lotes.lanceAtual && _item.lotes.lanceAtual.valor >= _item.lotes.valorMinimoVenda) {
            */



            //Aqui/ mesmo que o lace seja superior ao valor mínimo
            //não pode ser considerado vendido será então, condicional 

            /*Original
            _vendido = true;
            _vendidoCondicional = false;
            */

            //Condicional
            _vendido = false;
            _vendidoCondicional = true;

            //Não será vendido, pois será condicional
            /*
            Lote.findByIdAndUpdate(_item.lotes.lote, {
               //Original
                $set: {
                  disponivel: false,
                  vendido: true
                }
              },
              function (errLote, lote) {
                if (errLote) {
                  //console.log(errLote);
                  return handleError(res, errLote);
                }
              });
            */
            
            // enviar email
            /*
            Mail.findOne({
              name: 'lote_vencedor_usuario'
            }, function (err, result) {
              if (err) {
                callback(err);
                return;
              }

              var _html = result.html.toString().replace("[USER]", _item.lotes.lanceAtual.comprador.simpleName);
              _html = _html.replace("[LANCE]", _item.lotes.lanceAtual.valor);
              _html = _html.replace("[N_LOTE]", _item.lotes.numero);
              _html = _html.replace("[N_LEILAO]", _item.leilaoId);
              var form = {
                from: result.from,
                to: _item.lotes.lanceAtual.comprador.email,
                subject: result.subject,
                html: _html
              };

              MailCtrl.internalSendMail(form, function (err, body) {
                if (err) {
                  callback(err);
                  return;
                }
              });
            });
            */
            //Gerar Boleto
             /*
             var _boletoHtml = BoletoCtrl.generateHtml(_item.lotes, _item.leilaoId);

             if(_boletoHtml.erro == true){
                 _pagamentoGerado = false;
             }else{
                  _pagamentoGerado = true;
             }

             $log("_pagamentoGerado");
             */
          } 
          /* retirada condição --Gustavo Garcia 15/05
          else {
            _vendido = false;
            _vendidoCondicional = true;
          }
          */
          //3 - enviar e-mail pro vencedor
          Leilao.findOneAndUpdate({
              'lotes._id': _item.lotes._id
            }, {
              "$set": {
                "lotes.$.encerrado": true,
                "lotes.$.vendido": _vendido,
                "lotes.$.lanceAtual.vencedor": _vendido,
                "lotes.$.condicional": _vendidoCondicional
              }
            },
            function (err, result) {
              // console.log(err);
              ////console.log(result);
              //console.log('lote_finalizado');
              SockCtrl.emit('lote_finalizado', {
                leilao: _item._id,
                leilaoLoteId: _item.lotes._id
              });
            }
          );
        }

        if (callback) callback(err);
      });

    });






};




exports.finalizarLeiloes = function (callback) {
  //console.log('finalizarLeiloes');

  var query = {
    'lotes.encerrado': true,
    status: 2
  };

  Leilao.aggregate()
    .unwind("lotes")
    .match(query)
    .project({
      "_id": 1
    })
    .group({
      "_id": "$_id",
      "count": {
        $sum: 1
      }
    }).exec(function (err, data) {

      console.log(data);

      console.log('olha os leiloes para encerramento ');
      console.log(data);

      for (var i = 0; i < data.length; i++) {
        var _leilao = data[i];
        var _queryComp = {
          _id: mongoose.Types.ObjectId(_leilao._id)
        };
        Leilao.aggregate()
          .unwind("lotes")
          .match(_queryComp)
          .project({
            "_id": 1
          })
          .group({
            "_id": "$_id",
            "count": {
              $sum: 1
            }
          }).exec(function (err, dataComparacao) {

            //todos os lotes estao finalizados
            if (_leilao.count == dataComparacao[0].count) {
              //console.log('finalizar');
              Leilao.findByIdAndUpdate(_leilao._id, {
                $set: {
                  status: 3
                }
              }, function (err, result) {
                console.log(err);
                // //console.log(result);
              });
            }

            if (callback) callback(err);
          });
      }

      if (callback) callback(err);

    });
};


exports.gerarPagamentos = function (callback) {
  //console.log('gerarPagamentos');

  var query = {
    'lotes.encerrado': true,
    'lotes.vendido': true,
    'lotes.pagamentoGerado': false
  };

  Leilao.aggregate()
    .unwind("lotes")
    .match(query)
    .project({
      "_id": 1,
      "leilaoId": 1,
      "lotes": {
        lote: 1,
        numero: 1,
        lanceAtual: 1,
        active: 1,
        _id: 1,
        comissao: 1,
        modoVenda: 1,
        propostaAceita: 1
      }
    }).exec(function (err, data) {
      console.log(err);
      User.populate(data, {
        path: "lotes.lanceAtual.comprador",
        select: "simpleName email"
      }, function (err, dataU) {
        User.populate(data, {
          path: "lotes.propostaAceita.comprador",
          select: "simpleName email"
        }, function (err, dataU2) {
          //console.log('populate');

          ////console.log(dataU);

          for (var i = 0; i < dataU2.length; i++) {

            var _item = dataU2[i];
            //console.log(_item.lotes._id);

            var _valor = 0;
            var _comprador = "";
            if (_item.lotes.modoVenda == 'proposta') {
              if (_item.lotes.propostaAceita.contraProposta) {
                _valor = _item.lotes.propostaAceita.contraPropostaValor;
              } else {
                _valor = _item.lotes.propostaAceita.valor;
              }

              _comprador = _item.lotes.propostaAceita.comprador.simpleName;


            } else {
              _valor = _item.lotes.lanceAtual.valor;
              _comprador = _item.lotes.lanceAtual.comprador.simpleName;
            }


            //Gerar Boleto
            var _boletoHtml = BoletoCtrl.generateHtml(_item.lotes, _item.leilaoId, _valor, _comprador, function (err, retorno) {
              //console.log('GERAR PAGAMENTOS - RETORNOU');
              if (err) {
                //console.log("GERAR PAGAMENTOS - ERRO!!!!!")
                return;
              }

              // Pegando linha digitável
              var linhaSearch = '<td class="w500 Ar Ab ld" id="linha-digitavel-2">';

              var startLinha = -1;
              var endLinha = -1;
              startLinha = retorno.indexOf(linhaSearch);
              if (startLinha >= 0)
                endLinha = retorno.indexOf('</td>', startLinha);
              var _linhaDigitavel = retorno.slice(startLinha + linhaSearch.length, endLinha);

              var linhaDigitavel = '';
              for (var i = 0; i < _linhaDigitavel.length; i++) {
                if ((_linhaDigitavel.charAt(i) != '.') && (_linhaDigitavel.charAt(i) != ' '))
                  linhaDigitavel = linhaDigitavel + _linhaDigitavel.charAt(i);
              }

              // Creating barcode
              /*var canvas = new Canvas();
              JsBarcode(canvas, linhaDigitavel, { format: "EAN13" });
              var base64Img = canvas.toDataURL('image/png');*/

              /*var barc = new Barc();
              var buf = barc.code2of5(linhaDigitavel, 825, 75);
              var base64Img = buf.toString('base64');

              // Remove old barcode div area
              var startPos = -1;
              var endPos = -1;
              startPos = retorno.indexOf('<div class="barcode">');
              if (startPos >= 0)
                endPos = retorno.indexOf('</div>', startPos);
              var newRetorno = retorno.slice(0, startPos) + '<img src="data:image/png;base64,' + base64Img + '">' + retorno.slice(endPos + 6, retorno.length - endPos - 6);*/

              // Add new barcode div area

              // Update database
              Leilao.findOneAndUpdate({
                  'lotes._id': _item.lotes._id
                }, {
                  "$set": {
                    "lotes.$.boletoHtml": newRetorno,
                    "lotes.$.pagamentoGerado": true
                  }
                },
                function (err, result) {
                  // console.log(err);
                  ////console.log(result);
                  //console.log('lote_pagamentoGerado');
                  SockCtrl.emit('lote_pagamentoGerado', {
                    leilao: _item._id,
                    leilaoLoteId: _item.lotes._id
                  });
                }
              );
            });

          }

          if (callback) callback(err);
        });
      });

    });






};


exports.getItensRelacionados = function (req, res) {
  //console.log('getItensRelacionados');
  //console.log(req.body);

  var page = req.body.page || 0;
  var _limit = req.body.limit || 8

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var _loteId = req.body.loteId;
  var _queryLote = {};
  if (req.body.categoria)
    _queryLote.categoria = req.body.categoria;

  if (req.body.subCategoria)
    _queryLote.subCategoria = req.body.subCategoria;

  _queryLote._id = {
    $ne: _loteId
  };




  var _ids = [];
  Lote.find(_queryLote, {
    _id: 1
  }, function (err, result) {
    ////console.log(result);
    for (var i = 0; i < result.length; i++) {
      _ids.push(mongoose.Types.ObjectId(result[i]._id));
    }

    //  //console.log(_ids);
    var query = null;
    //console.log(_loteId);

    query = {
      'lotes.encerrado': false,
      'lotes.deleted': false,
      "lotes.lote": {
        $in: _ids
      }
    };


    //////console.log(query);

    var aggregate = Leilao.aggregate()
      .unwind("lotes")
      .match(query)
      .project({
        "_id": 0,
        leilaoId: 1,
        "lotes": {
          lote: 1,
          valorMinimoVenda: 1,
          vendido: 1,
          endTime: 1,
          numero: 1,
          lanceAtual: 1,
          active: 1,
          lances: 1,
          _id: 1,
          comissao: 1,
          encerrado: 1,
          lanceInicial: 1,
          incremento: 1
        }
      });

    var options = {
      page: page,
      limit: paging.limit
    }

    Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      } else {
        Lote.populate(results, {
          path: "lotes.lote",
          select: "description comitente image tags"
        }, function (err, data) {
          Comitente.populate(data, {
            path: "lotes.lote.comitente",
            select: "simpleName image"
          }, function (err, dataP) {
            //console.log('populate');
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


exports.getEndTime = function (req, res) {
  //console.log('getEndTime');
  //console.log(req.body);


  var query = null;

  query = {
    'lotes.deleted': false
  };

  //////console.log(query);

  Leilao.aggregate({
      "$match": {
        "_id": mongoose.Types.ObjectId(req.body.leilaoId)
      }
    })
    .unwind("lotes")
    .match(query)
    .project({
      "_id": 0,
      "lotes": {
        endTime: 1
      }
    })
    .sort("-lotes.endTime")
    .limit(1)
    .exec(function (err, result) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      }
      return res.json(200, result);
    });
};


exports.getLoteNumber = function (req, res) {
  //console.log('getEndTime');
  //console.log(req.body);


  var query = null;

  query = {
    'lotes.deleted': false
  };

  //////console.log(query);

  Leilao.aggregate({
      "$match": {
        "_id": mongoose.Types.ObjectId(req.body.leilaoId)
      }
    })
    .unwind("lotes")
    .match(query)
    .project({
      "_id": 0,
      "lotes": {
        numero: 1
      }
    })
    .sort("-lotes.numero")
    .limit(1)
    .exec(function (err, result) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      }
      return res.json(200, result);
    });
};


exports.getLeiloesByLote = function (req, res) {

  //console.log('getLeiloesByLote');
  //console.log(req.body);

  var page = req.body.page || 0;
  var _limit = req.body.limit || 10

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  //  //console.log(_ids);
  var query = null;

  query = {
    deleted: false,
    'lotes.deleted': false
  };
  query["lotes.lote"] = mongoose.Types.ObjectId(req.body.loteId);


  //////console.log(query);

  var aggregate = Leilao.aggregate({
      "$match": {
        "lotes.lote": mongoose.Types.ObjectId(req.body.loteId)
      }
    })
    .unwind("lotes")
    .match(query)
    .project({
      "_id": 1,
      leilaoId: 1,
      description: 1,
      "lotes": {
        lote: 1,
        valorMinimoVenda: 1,
        vendido: 1,
        endTime: 1,
        numero: 1,
        lanceAtual: 1,
        active: 1,
        _id: 1,
        comissao: 1,
        incremento: 1,
        condicional: 1,
        lances: 1
      }
    });

  var options = {
    page: page,
    limit: paging.limit
  }

  Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
    if (err) {
      console.err(err);
      return handleError(res, err);
    } else {
      Lote.populate(results, {
        path: "lotes.lote",
        select: "description comitente image tags"
      }, function (err, data) {
        Comitente.populate(data, {
          path: "lotes.lote.comitente",
          select: "simpleName"
        }, function (err, dataP) {
          //console.log('populate');


          var _lotes = [];
          for (var i = 0; i < dataP.length; i++) {
            var _item = dataP[i];

            var _compradores = [];
            var _lances = [];
            // //console.log('---> LANCES',_item.lotes.lances);
            if (_item.lotes.lances) {
              var _lances = _item.lotes.lances;

            }
            ////console.log("lances length", _lances);
            for (var j = 0; j < _lances.length; j++) {
              var _lance = _lances[j];

              var _existe = false;
              for (var y = 0; y < _compradores.length; y++) {
                ////console.log(_compradores[y], _lance.comprador)
                if (_compradores[y].toString() === _lance.comprador.toString()) {
                  // //console.log('igual');
                  _existe = true;
                }
              }

              if (_existe == false) {
                _compradores.push(_lance.comprador);
              }
            }

            var _lancesCount = _lances.length;
            _item.lotes.lances = [];
            var _lote = {
              _id: _item._id,
              lances: _lancesCount,
              item: _item.lotes,
              compradores: _compradores.length,
              leilaoId: _item.leilaoId,
              description: _item.description
            };

            _lotes.push(_lote);
          }

          // //console.log('populate');
          var obj = {
            total: count,
            data: _lotes
          };
          return res.json(200, obj);
        });
      });
    }
  });





};

exports.addProposta = function (req, res) {
  //console.log('addProposta');
  ////console.log(req.user);

  var _user = req.user._id;
  var _proposta = req.body.proposta;
  _proposta.comprador = _user;

  Leilao.findOneAndUpdate({
      _id: req.body.leilaoId,
      'lotes._id': req.body.leilaoLoteId
    }, {
      $push: {
        'lotes.$.propostas': _proposta
      }
    },
    function (err, leilao) {
      //console.log('deu certo ');
      Mail.findOne({
        name: 'lote_proposta_enviada_usuario'
      }, function (err, resultMail) {
        if (err) {
          return handleError(res, err);
        }


        var _html = resultMail.html.toString().replace("[USER]", req.user.simpleName);
        _html = _html.replace("[PROPOSTA]", _proposta.valor);
        _html = _html.replace("[LOTE]", leilao.lotes[0].numero);
        _html = _html.replace("[LEILAO]", leilao.description);
        var form = {
          from: resultMail.from,
          to: req.user.email,
          subject: resultMail.subject,
          html: _html
        };

        MailCtrl.internalSendMail(form, function (err, body) {
          if (err) {
            return handleError(res, err);
          }

          Mail.findOne({
            name: 'lote_proposta_enviada_admin'
          }, function (err, resultMail2) {
            if (err) {
              return handleError(res, err);
            }

            var _html2 = resultMail2.html.toString().replace("[USER]", req.user.simpleName);
            _html2 = _html2.replace("[PROPOSTA]", _proposta.valor);
            _html2 = _html2.replace("[LOTE]", leilao.lotes[0].numero);
            _html2 = _html2.replace("[LEILAO]", leilao.description);
            var form2 = {
              from: resultMail2.from,
              to: resultMail2.to,
              subject: resultMail2.subject,
              html: _html2
            };

            MailCtrl.internalSendMail(form2, function (err, body) {
              if (err) {
                return handleError(res, err);
              }

              return res.json(200, body);
            });
          });
        });
      });



    });
};


exports.getBuscaLotesHome = function (req, res) {
  //console.log('getBuscaLotesHome');
  ////console.log(req.body);

  var page = req.body.page || 0;
  var _limit = req.body.limit || 12

  var paging = {
    skip: page * _limit,
    limit: _limit
  };

  var _queryLote = {};

  if (req.body.tipo == 2 && req.body.search)
    _queryLote.description = new RegExp(req.body.search, 'i');

  if (req.body.tipo == 1 && req.body.search)
    query['lotes.numero'] = new RegExp(req.body.search, 'i');

  if (req.body.categoria)
    _queryLote.categoria = req.body.categoria;

  /* é necessário verificar o tipo do leilão */

  if (req.body.tipoLeilao)
    _queryLote.tipoLeilao = req.body.tipoLeilao;

  if (req.body.subcategoria)
    _queryLote.subCategoria = req.body.subcategoria;

  if (req.body.estado !== undefined)
    _queryLote.estado = req.body.estado;

  if (req.body.cidade !== undefined)
    _queryLote.cidade = req.body.cidade;

  //console.log(_queryLote);
  var _ids = [];
  Lote.find(_queryLote, {
    _id: 1
  }, function (err, result) {
    if (err) {
      console.log(err);
      return handleError(res, err);
    }
    ////console.log(result);
    for (var i = 0; i < result.length; i++) {
      _ids.push(mongoose.Types.ObjectId(result[i]._id));
    }

    //  //console.log(_ids);
    var query = null;

    query = {
      'lotes.deleted': false,
      'lotes.lote': {
        $in: _ids
      },
      'lotes.vendido': false,
      'lotes.active': true,
      'tipo' : 1 || 2 || 4, //Tipo do leilao
      'status':  2 || 3 || 4//Status do leilao
    };


    ////console.log(query);

    var aggregate = Leilao.aggregate({
        "$match": {}
      })
      .unwind("lotes")
      .match(query)
      .project({
        "_id": 1,
        status: 1,
        "lotes": {
          lote: 1,
          valorMinimoVenda: 1,
          vendido: 1,
          endTime: 1,
          numero: 1,
          lanceAtual: 1,
          active: 1,
          lances: 1,
          _id: 1,
          comissao: 1,
          visitas: 1,
          encerrado: 1,
          condicional: 1,
          movido: 1
        }
      });

    var options = {
      page: page,
      limit: paging.limit
    }

    Leilao.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      } else {
        Lote.populate(results, {
          path: "lotes.lote",
          select: "description comitente image tags cidade estado"
        }, function (err, data) {
          Comitente.populate(data, {
            path: "lotes.lote.comitente",
            select: "simpleName image"
          }, function (err, dataP) {
            Cidade.populate(dataP, {
              path: "lotes.lote.cidade",
              select: "nome_cidade"
            }, function (err, dataC) {
              Estado.populate(dataC, {
                path: "lotes.lote.estado",
                select: "nome_estado"
              }, function (err, dataE) {

                var _lotes = [];
                for (var i = 0; i < dataE.length; i++) {
                  var _item = dataE[i];

                  var _compradores = [];
                  var _lances = [];
                  // //console.log('---> LANCES',_item.lotes.lances);
                  if (_item.lotes.lances) {
                    var _lances = _item.lotes.lances;

                  }
                  ////console.log("lances length", _lances);
                  for (var j = 0; j < _lances.length; j++) {
                    var _lance = _lances[j];
                    // //console.log(_lance);
                    // //console.log(_compradores);
                    // //console.log(_compradores.indexOf(_lance.comprador));

                    var _existe = false;
                    for (var y = 0; y < _compradores.length; y++) {
                      ////console.log(_compradores[y], _lance.comprador)
                      if (_compradores[y].toString() === _lance.comprador.toString()) {
                        // //console.log('igual');
                        _existe = true;
                      }
                    }

                    if (_existe == false) {
                      _compradores.push(_lance.comprador);
                    }
                  }

                  var _lancesCount = _lances.length;
                  _item.lotes.lances = [];
                  var _lote = {
                    lances: _lancesCount,
                    item: _item.lotes,
                    compradores: _compradores.length
                  };

                  _lotes.push(_lote);
                }

                // //console.log('populate');
                var obj = {
                  total: count,
                  data: _lotes
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

exports.importExcel = function (req, res) {

  //console.log(req.body);

  var _id = req.body.leilaoId;
  var _lotesLeilao = req.body.lotes;
  var _lotes = [];

  for (var i = 0; i < _lotesLeilao.length; i++) {
    _lotes.push(_lotesLeilao[i].lote);
  }


  Lote.create(_lotes, function (err, lote) {
    console.log(err);
    if (err) {
      return handleError(res, err);
    }

    for (var i = 0; i < _lotesLeilao.length; i++) {
      _lotesLeilao[i].lote = lote[i]._id;
    }

    //console.log(lote);

    Leilao.update({
      _id: _id
    }, {
      $push: {
        lotes: {
          $each: _lotesLeilao
        }
      }
    }, function (err, result) {
      console.log(err);
      //console.log(result);
      if (err) {
        return handleError(res, err);
      }
      return res.send(200);
    });

    //return res.send(200);
  });





};


exports.getPrevNextLote = function (req, res) {
  //console.log('getPrevNextLote');
  console.log(req.body);

  var _queryLote = {
    _id: req.body.leilaoId
  };
  var _idLote = req.body.loteId;

  var aggregate = Leilao.aggregate({
      "$match": {
        "_id": mongoose.Types.ObjectId(req.body.leilaoId),
        "lotes.deleted": false,
        "lotes.active": true
      }
    })
    .unwind("lotes")
    .sort("lotes.numero")
    .project({
      "_id": 0,
      "lotes": {
        _id: 1
      }
    })
    .exec(function (err, data) {
      if (err) {
        console.err(err);
        return handleError(res, err);
      }
      console.log(data);
      var continua = true;
      var _indexAtual = -1;
      for (var i = 0; i < data.length; i++) {
        if (continua = true && _idLote == data[i].lotes._id) {
          _indexAtual = i;
          continua = false;
        }
      }

      var _indexPrev = _indexAtual - 1 < 0 ? -1 : data[_indexAtual - 1].lotes._id;
      var _indexNext = _indexAtual + 1 == data.length ? -1 : data[_indexAtual + 1].lotes._id;


      var obj = {
        atual: _indexAtual,
        prev: _indexPrev,
        next: _indexNext
      };

      return res.json(200, obj);

    });
};







function handleError(res, err) {
  return res.send(500, err);
}
