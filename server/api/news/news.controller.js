'use strict';

var _ = require('lodash');
var News = require('./news.model');
var SockCtrl = require('../../socketCtrl');
var mongoose = require('mongoose');

// Get list of logs
exports.index = function(req, res) {
    News.find(function(err, logs) {
        if (err) { return handleError(res, err); }
        return res.json(200, logs);
    });
};

// Get a single service
exports.show = function(req, res) {
    News.findById(req.params.id, function(err, news) {
        if (err) { return handleError(res, err); }
        if (!news) { return res.send(404); }
        return res.json(news);
    });
};


// Creates a new news in the DB.
exports.create = function(req, res) {
    News.create(req.body, function(err, news) {
        if (err) {
            return handleError(res, err);
        }
        SockCtrl.emit(news);
        return res.json(201, news);
    });
};

// Updates an existing news in the DB.
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    News.findById(req.params.id, function(err, news) {
        if (err) { return handleError(res, err); }
        if (!news) { return res.send(404); }
        var updated = _.merge(news, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.json(200, news);
        });
    });
};


exports.signNewsLetter = function(req, res) {
    News.find({ name: 'NEWSLETTER DO SITE', "emails.email": req.body.email, "emails.name": req.body.name }, function(err, result) {
        if (result.length == 0) {
            News.update({ name: 'NEWSLETTER DO SITE' },
                { $push: { emails: { email: req.body.email, name: req.body.name } } }
                , function(err, news) {
                    if (err) { return handleError(res, err); }
                    return res.json(200, news);
                });
        } else {
            return res.send(200);
        }
    });

};

exports.addNewsLetterMail = function(req, res) {
    News.find({ _id: req.body.newsId, "emails.email": req.body.email }, function(err, result) {
        if (result.length == 0) {
            News.update({ _id: req.body.newsId },
                { $push: { emails: { email: req.body.email } } }
                , function(err, news) {
                    if (err) { return handleError(res, err); }
                    return res.json(200, news);
                });
        } else {
            return res.send(200);
        }
    });

};

exports.editNewsLetterMail = function(req, res) {
    console.log('editNewsLetterMail');
    console.log(req.body);

    News.update({ _id: req.body.newsId, "emails._id": req.body.emailId },
        { $set: { "emails.$.email": req.body.email } }
        , function(err, news) {
            if (err) { return handleError(res, err); }
            return res.json(200, news);
        });



};

exports.deleteNewsLetterMail = function(req, res) {
    console.log('deleteNewsLetterMail');
    console.log(req.body);

    News.update({ _id: req.body.newsId },
        { $pull: { "emails": { _id: req.body.emailId } } }
        , function(err, news) {
            console.log(err);
            if (err) { return handleError(res, err); }
            return res.json(200, news);
        });



};


exports.getNewsMails = function(req, res) {
    console.log('getNewsMails');
    console.log(req.body);

    var page = req.body.page || 0;
    var _limit = req.body.limit || 10

    var paging = {
        skip: page * _limit,
        limit: _limit
    };

    var query = {};


    var aggregate = News.aggregate({
        "$match": {
            _id: mongoose.Types.ObjectId(req.body.newsId)
        }
    })
        .unwind("emails")
        .sort("mails.email")
        .project({
            "_id": 0,
            "emails.email": 1,
            "emails._id": 1
        })
        ;

    var options = { page: page, limit: paging.limit }

    News.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
        if (err) {
            console.err(err);
            return handleError(res, err);
        }
        else {

            var obj = {
                total: count,
                data: results
            };
            return res.json(200, obj);

        }
    });
};


// Deletes a news from the DB.
exports.destroy = function(req, res) {
    News.findById(req.params.id, function(err, news) {
        if (err) { return handleError(res, err); }
        if (!news) { return res.send(404); }
        news.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};


exports.search = function(req, res) {

    console.log(req.body);

    var user = req.user,
        page = req.body.page || 0,
        query = {},
        fields = { cod: 1, name: 1, emails: 1, editable: 1 },
        paging = {
            skip: page * 10,
            limit: 10
        };


    if (req.body.name)
        query.name = new RegExp(req.body.name, 'i');

    if (req.body.cod)
        query.cod = req.body.cod;

    if (req.body.email)
        query["emails.email"] = new RegExp(req.body.email, 'i');

    console.log(query);

    News
        .find(query, fields, paging)
        .sort({
            createdAt: -1
        })
        .exec(function(err, news) {
            if (err) {
                return handleError(res, err);
            }
            News.count(query, function(err, total) {
                var _news = [];
                for (var i = 0; i < news.length; i++) {
                    _news.push({ new: news[i], countMails: (news[i].emails ? news[i].emails.length : 0) });
                }
                var obj = {
                    total: total,
                    data: _news
                };
                return res.json(200, obj);
            })
        });
};


exports.importExcel = function(req, res) {

    console.log(req.body);

    var news = req.body.news;

    News.update({ _id: news._id }, { $push: { emails: { $each: news.emails } } }, function(err, result) {
        console.log(err);
        console.log(result);
        if (err) { return handleError(res, err); }
        return res.send(200);
    });
};

exports.exportExcel = function(req, res) {
    var xl = require('excel4node');

    // Create a new instance of a Workbook class 
    var wb = new xl.Workbook();

    var _id = req.params.id;

    // Add Worksheets to the workbook 
    var ws = wb.addWorksheet('GERAL');


    News.findById(_id)
        .exec(function(err, news) {
           // console.log(news);
            if (err) { return handleError(res, err); }

            for (var j = 0; j < news.emails.length; j++) {
                var i = j+1;
                console.log(news.emails[j]);

                // console.log(_lote.lanceAtual);
                ws.cell(i, 1).string(news.emails[j].email);
            }
            wb.write('newsLetter_' + news.name + '.xlsx', res);
        });



};

function handleError(res, err) {
    return res.send(500, err);
}