'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var User = require('../../api/user/user.model');

var router = express.Router();

var validationError = function (res, err) {
    return res.json(422, err);
};

router.post('/', function(req, res, next) {

	console.log('dentro do auth');
	console.log(req.body);


  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

    	console.log('dentro do auth 2');
      	
    var token = auth.signToken(user._id, user.role);
    console.log(token);
    res.json({token: token});
  })(req, res, next)
});


router.post('/joinFb', function(req, res, next) {

  console.log(req.body);

  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    console.log(error);
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

    console.log('cheguei aqui, esta ok');
    var querySelect = { email : req.body.email };
    var queryUpdate = { $set : { fbid : req.body.fbId } };

    User.update(querySelect, queryUpdate, function(err, resp){ 

      console.log('fiz o update ?' + (!err) + ' atualizei ', resp );

    });

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)

});


module.exports = router;