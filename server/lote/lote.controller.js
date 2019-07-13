'use strict';

var _ = require('lodash');
var Lote = require('./lote.model');
var Util = require('../utils/util');
var mongoose = require('mongoose');
var Categorie = require('../categorie/categorie.model');
var Estado = require('../estado/estado.model');
var Cidade = require('../cidade/cidade.model');
var Leilao = require('../leilao/leilao.model');
var Image = require('../image/image.model');
var XLSX = require('xlsx');

// Get list of roles
exports.index = function (req, res) {
    Lote.find({ deleted: false }, function (err, lotes) {
        if (err) { return handleError(res, err); }
        return res.json(200, lotes);
    });
};

exports.getActive = function (req, res) {
    //console.log('getActive');
    Lote.find({ active: true, deleted: false }, function (err, lotes) {
        console.log(err);
        if (err) { return handleError(res, err); }
        return res.json(200, lotes);
    });
};

exports.groupByCategoria = function (req, res) {
    //console.log('groupByCategoria');
    // //console.log(req.params);
    Lote.aggregate(
        { $match: { leilao: mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: "$categoria", count: { $sum: 1 } } },
        { $project: { categoria: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }

            // //console.log(lotes);
            // return res.json(200, lotes);
            Categorie.populate(lotes, { path: "categoria" }, function (err, data) {
                //console.log('populate');
                // //console.log(data);
                return res.json(200, data);
            });
        });
};

exports.groupByCategoriaGeral = function (req, res) {

    //console.log('groupByCategoriaGeral');
    //console.log(req.params);

    Lote.aggregate(
        { $match: { active: true, deleted: false } },
        { $group: { _id: "$categoria", count: { $sum: 1 } } },
        { $project: { categoria: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }

            //console.log(lotes);
            // return res.json(200, lotes);
            Categorie.populate(lotes, { path: "categoria", select: 'name -_id' }, function (err, data) {
                //console.log('populate');
                //console.log(data);
                return res.json(200, data);
            });
        });
};



exports.groupBySubCategoria = function (req, res) {
    //console.log('groupByCategoria');
    ////console.log(req.params);
    ////console.log(req.body);
    Lote.aggregate(
        {
            $match: {
                leilao: mongoose.Types.ObjectId(req.params.id),
                categoria: mongoose.Types.ObjectId(req.body.cat)
            }

        },
        { $group: { _id: "$subCategoria", count: { $sum: 1 } } },
        { $project: { subCategoria: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }

            //console.log(lotes);
            // return res.json(200, lotes);
            Categorie.populate(lotes, { path: "subCategoria" }, function (err, data) {
                //console.log('populate');
                //  //console.log(data);
                return res.json(200, data);
            });
        });
};

exports.getMenuByCategoria = function (req, res) {
    //console.log('getMenuByCategoria');
    ////console.log(req.params);
    ////console.log(req.body);
    var _queryLote = {
        'lotes.vendido': false, 'lotes.deleted': false, 'lotes.active': true
    };

    var _ids = [];

    Leilao.aggregate()
        .unwind("lotes")
        .match(_queryLote)
        .project({
            "lotes": { lote: 1 }
        }).exec(function (err, result) {
            for (var i = 0; i < result.length; i++) {
                _ids.push(mongoose.Types.ObjectId(result[i].lotes.lote));
            }
            Lote.aggregate(
                {
                    $match: {
                        _id: { $in: _ids },
                        categoria: mongoose.Types.ObjectId(req.body.cat)
                    }

                },
                { $group: { _id: "$subCategoria", count: { $sum: 1 } } },
                { $project: { subCategoria: '$_id', count: 1 } }
                , function (err, lotes) {
                    if (err) { return handleError(res, err); }

                    //console.log(lotes);
                    // return res.json(200, lotes);
                    Categorie.populate(lotes, { path: "subCategoria", select: "name " }, function (err, data) {
                        //console.log('populate');
                        //  //console.log(data);
                        return res.json(200, data);
                    });
                });
        });


};


exports.groupByEstadoGeral = function (req, res) {

    //console.log('groupByEstadoGeral');

    Lote.aggregate(
        { $match: { active: true, deleted: false } },
        { $group: { _id: "$estado", count: { $sum: 1 } } },
        { $project: { estado: '$_id', count: 1 } },
        function (err, lotes) {

            if (err) { return handleError(res, err); }

            Estado.populate(lotes, { path: "estado" }, function (err, data) {

                //console.log(' olha o resultado dos estados: ', data);


                return res.json(200, data);
            });

        });
};


exports.groupByEstado = function (req, res) {
    //console.log('groupByEstado');
    // //console.log(req.params);
    Lote.aggregate(
        { $match: { leilao: mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: "$estado", count: { $sum: 1 } } },
        { $project: { estado: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }

            ////console.log(lotes);
            // return res.json(200, lotes);
            Estado.populate(lotes, { path: "estado" }, function (err, data) {
                //  //console.log('populate');
                // //console.log(data);
                return res.json(200, data);
            });
        });
};

exports.groupByCidade = function (req, res) {
    //console.log('groupByCidade');
    ////console.log(req.params);
    ////console.log(req.body);
    Lote.aggregate(
        {
            $match: {
                leilao: mongoose.Types.ObjectId(req.params.id),
                estado: mongoose.Types.ObjectId(req.body.estado)
            }

        },
        { $group: { _id: "$cidade", count: { $sum: 1 } } },
        { $project: { cidade: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }

            ////console.log(lotes);
            // return res.json(200, lotes);
            Cidade.populate(lotes, { path: "cidade" }, function (err, data) {
                // //console.log('populate');
                ////console.log(data);
                return res.json(200, data);
            });
        });
};

// Get a single role
exports.show = function (req, res) {

    Lote.findById(req.params.id)
        .populate('estado')
        .populate('cidade')
        .populate('categoria', 'name')
        .populate('subCategoria', 'name')
        .populate('comitente')
        .exec(function (err, lote) {
            if (err) { return handleError(res, err); }
            if (!lote) { return res.send(404); }
            return res.json(lote);
        });
};

// Creates a new role in the DB.
exports.create = function (req, res) {
    ////console.log(req.body);
    Lote.create(req.body, function (err, lote) {
        if (err) { return handleError(res, err); }
        return res.json(201, lote);
    });
};

// Updates an existing role in the DB.
exports.update = function (req, res) {
    // //console.log('to no update lote');

    ////console.log(req.body);
    if (req.body._id) { delete req.body._id; }
    Lote.findById(req.params.id, function (err, lote) {
        if (err) { return handleError(res, err); }
        if (!lote) { return res.send(404); }
        lote.images = req.body.images;
        var updated = _.merge(lote, req.body);

        //  //console.log(updated);
        updated.markModified('tags');


        updated.save(function (err) {
            console.log(err);
            if (err) { return handleError(res, err); }
            return res.json(200, lote);
        });
    });
};

exports.setAvaiable = function (req, res) {
    //console.log('to no update lote');

    Lote.findById(req.body._id, function (err, lote) {
        if (err) { return handleError(res, err); }
        if (!lote) { return res.send(404); }
        lote.disponivel = req.body.disponivel;

        lote.save(function (err) {
            console.log(err);
            if (err) { return handleError(res, err); }
            return res.json(200);
        });
    });
};


// Deletes a role from the DB.
// exports.destroy = function (req, res) {
//   Lote.findById(req.params.id, function (err, lote) {
//     if (err) { return handleError(res, err); }
//     if (!lote) { return res.send(404); }
//     lote.remove(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };
exports.destroy = function (req, res) {
    Lote.findById(req.params.id, function (err, lote) {
        if (err) { return handleError(res, err); }
        if (!lote) { return res.send(404); }
        lote.deleted = true;
        lote.active = false;
        lote.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};


exports.search = function (req, res) {

    //console.log(req.body);

    var user = req.user,
        page = req.body.page || 0,
        query = {},
        fields = {},
        paging = {
            skip: page * 10,
            limit: 10
        };


    query.deleted = false;

    if (req.body.description)
        query.description = new RegExp(req.body.description, 'i');

    if (req.body.comitente !== undefined)
        query.comitente = req.body.comitente;

    if (req.body.active !== undefined)
        query.active = req.body.active;

    if (req.body.disponivel !== undefined)
        query.disponivel = req.body.disponivel;

    if (req.body.vendido !== undefined)
        query.vendido = req.body.vendido;

    if (req.body.categoria !== undefined)
        query.categoria = req.body.categoria;

    if (req.body.subCategoria !== undefined)
        query.subCategoria = req.body.subCategoria;


    //console.log(query);

    Lote
        .find(query, fields, paging)
        .populate('comitente', 'simpleName')
        .populate('leilao', 'leilaoId description')
        .sort({
            createdAt: -1
        })
        .exec(function (err, lote) {
            if (err) {
                return handleError(res, err);
            }
            Lote.count(query, function (err, total) {
                var obj = {
                    total: total,
                    data: lote
                };
                return res.json(200, obj);
            })
        });
};


exports.disponiveis = function (req, res) {

    ////console.log(req.body);

    var user = req.user,
        page = req.body.page || 0,
        query = {},
        fields = { image: 1, description: 1, categoria: 1, subCategoria: 1, comitente: 1, createdAt: 1 },
        paging = {
            skip: page * 10,
            limit: 10
        };


    if (req.body.description)
        query.description = new RegExp(req.body.description, 'i');

    if (req.body.comitentes !== undefined)
        query.comitente = { "$in": req.body.comitentes };

    if (req.body.preRelacionados !== undefined)
        query._id = { "$nin": req.body.preRelacionados };


    if (req.body.categoria)
        query.categoria = req.body.categoria;

    if (req.body.subCategoria)
        query.subCategoria = req.body.subCategoria;


    query.active = true;
    query.disponivel = true;
    query.vendido = false;

    //console.log(query);

    Lote
        .find(query, fields, paging)
        .populate('comitente', 'simpleName')
        .populate('categoria', 'name')
        .populate('subCategoria', 'name')
        .sort({
            createdAt: -1
        })
        .exec(function (err, lote) {
            if (err) {
                return handleError(res, err);
            }
            Lote.count(query, function (err, total) {
                var obj = {
                    total: total,
                    data: lote
                };
                return res.json(200, obj);
            })
        });
};

exports.getRelated = function (req, res) {
    var _categoria = req.body.categoria;
    var _subCategoria = req.body.subCategoria;
    //console.log(req.body);
    //console.log('getRelated');
    Lote.find({
        active: true,
        deleted: false,
        categoria: _categoria,
        subCategoria: _subCategoria

    }, function (err, lote) {
        console.log(err);
        if (err) { return handleError(res, err); }
        return res.json(200, lote);
    });
};


exports.groupVendasByCategoria = function (req, res) {
    //console.log('groupVendasByCategoria');
    Lote.aggregate(
        { $match: { vendaDireta: mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: "$categoria", count: { $sum: 1 } } },
        { $project: { categoria: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }
            Categorie.populate(lotes, { path: "categoria" }, function (err, data) {
                return res.json(200, data);
            });
        });
};

exports.groupVendasBySubCategoria = function (req, res) {
    //console.log('groupVendasBySubCategoria');
    ////console.log(req.params);
    ////console.log(req.body);
    Lote.aggregate(
        {
            $match: {
                vendaDireta: mongoose.Types.ObjectId(req.params.id),
                categoria: mongoose.Types.ObjectId(req.body.cat)
            }

        },
        { $group: { _id: "$subCategoria", count: { $sum: 1 } } },
        { $project: { subCategoria: '$_id', count: 1 } }
        , function (err, lotes) {
            if (err) { return handleError(res, err); }

            //console.log(lotes);
            // return res.json(200, lotes);
            Categorie.populate(lotes, { path: "subCategoria" }, function (err, data) {
                //console.log('populate');
                //  //console.log(data);
                return res.json(200, data);
            });
        });
};

exports.importExcel = function (req, res) {
    var _lotes = req.body.lotes;

    // Replace categoriaId with object id
    /*for (var i = 0; i < _lotes.length; i++) {
        Categorie.findOne({ categoriaId: _lotes[i].subCategoria }, function (err, categorieObj) {
            _lotes[i].subCategoria = categorieObj.subCategoria;
        });
    }*/

    // Create itens
    Lote.create(_lotes, function (err, lote) {
        console.log(err);
        if (err) { return handleError(res, err); }
        return res.json(201, lote);
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


exports.arrumandoLotes = function () {
    //console.log('to no update lote');

    Lote.find({LEILAO_ID:{$exists:true}}, function (err, lotes) {
        if (err) { return handleError(res, err); }
        if (!lotes) { return res.send(404); }
        //console.log(lotes[0]);
        console.log(lotes.length);
        for(var i=0; i < lotes.length; i++){
            //console.log(lotes[i].LEILAO_ID);
            Leilao.findOne({oldId: lotes[i].LEILAO_ID},function(err, leilaoObj){
                if(leilaoObj){
                    console.log("leilaoObj",leilaoObj._id);
                         Lote.findByIdAndUpdate(lotes[this.index]._id, {leilao : leilaoObj._id}, function(err,data){
                   // console.log(err);

                  //  console.log("salvou?",data);
                });
                }
                
                // Lote.findByIdAndUpdate(lotes[this.index]._id, {leilao : leilaoObj._id}, function(err,data){
                //     console.log(err);

                //     console.log("salvou?",data);
                // });
            }.bind({index:i}));
        }

        return true;
   
    });
};

function handleError(res, err) {
    return res.send(500, err);
}