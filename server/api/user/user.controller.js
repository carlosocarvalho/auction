'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var Util = require('../utils/util');
var jwt = require('jsonwebtoken');

var Email = require('../utils/email');
var Mail = require('../mail/mail.model');
var News = require('../news/news.model');
var MailCtrl = require('../mail/mail.controller');
var KeyStore = require('../utils/keyStore');
var dateFormat = require('dateformat');

var validationError = function (res, err) {
  return res.json(422, err);
};


var RoleTypes = {
  admin: 'admin',
  staff: 'staff',
  acessor: 'acessor',
  ower: 'ower'
};


exports.exportToExcel = function (req, res) {
  // Getting filter param
  var user = req.user,
    page = req.body.page || 0,
    query = { $or: [{ tipoAcesso: 1 }, { role: 'user' }] },
    fields = {},
    paging = {};

  query.deleted = false;
  var emptyWord = 'empty';

  if (req.params.simpleName !== emptyWord)
    query.simpleName = new RegExp(req.params.simpleName, "i");

  if (req.params.login !== emptyWord)
    query.login = new RegExp(req.params.login, "i");

  if (req.params.tipoPessoa !== emptyWord)
    query.tipoPessoa = req.params.tipoPessoa;

  if (req.params.doc1 !== emptyWord)
    query.doc1 = req.params.doc1;

  if (req.params.active !== undefined)
    query.active = Boolean(req.params.active);

    /*
  if (req.params.startDate !== emptyWord) {
    query.createdAt = {
      $gte: req.params.startDate
    };
  }

  if (req.params.endDate !== emptyWord) {
    query.createdAt = {
      $lte: req.params.endDate
    };
  }

  */

  if (req.params.categorieId !== emptyWord) {
    //console.log(req.params.categorieId);
    query.interestCategories = {
      $in: [req.params.categorieId]
    };
  }

  // Importing excel for node
  var xl = require('excel4node');

  // Create a new instance of a Workbook class 
  var wb = new xl.Workbook();

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

  User
    .find(query, fields, paging)
    .sort({
      createdAt: -1
    })
    .exec(function (err, users) {
      if (err) { return handleError(res, err); }

      console.log(users);

      // Workbook TITLE
      ws.cell(1, 1, 1, 20, true).string('Relatório Detalhado de Usuários').style(sTitle);
      ws.row(1).setHeight(30);

      // Workbook TABLE HEADER
      ws.cell(3, 1).string('NOME');
      ws.cell(3, 2).string('SOBRENOME');
      ws.cell(3, 3).string('RAZAO SOCIAL');
      ws.cell(3, 4).string('NOME FANTASIA');
      ws.cell(3, 5).string('E-MAIL');
      ws.cell(3, 6).string('TELEFONE');
      ws.cell(3, 7).string('CELULAR');
      ws.cell(3, 8).string('NOME DA MÃE');
      ws.cell(3, 9).string('LOGIN');
      ws.cell(3, 10).string('ANIVERSÁRIO');
      ws.cell(3, 11).string('CPF/CNPJ');
      ws.cell(3, 12).string('RG/IE');
      ws.cell(3, 13).string('CEP');
      ws.cell(3, 14).string('ENDEREÇO');
      ws.cell(3, 15).string('NÚMERO');
      ws.cell(3, 16).string('COMPLEMENTO');
      ws.cell(3, 17).string('BAIRRO');
      ws.cell(3, 18).string('DELETADO');
      ws.cell(3, 19).string('ATIVO');
      ws.cell(3, 20).string('DATA DE CRIAÇÃO');
      ws.cell(3, 1, 3, 20).style(sSubTitle);

      // Workbook TABLE DATA
      console.log("TAMANHO: ", users.length);
      for (var j = 0; j < users.length; j++) {
        var i = j + 4; // Whats is that? =0

        //console.log('Estamos no loop: ', j, users[j]);
        // Get current user instance
        var _user = users[j];
        console.log("Printando USER: ", _user);

        // Write columns data
        ws.cell(i, 1).string(_user.name != undefined ? _user.name.toString() : '');
        ws.cell(i, 2).string(_user.lastName != undefined ? _user.lastName.toString() : '');
        ws.cell(i, 3).string(_user.razaoSocial != undefined ? _user.razaoSocial.toString() : '');
        ws.cell(i, 4).string(_user.nomeFantasia != undefined ? _user.nomeFantasia.toString() : '');
        ws.cell(i, 5).string(_user.email != undefined ? _user.email.toString() : '');
        ws.cell(i, 6).string(_user.phone != undefined ? _user.phone.toString() : '');
        ws.cell(i, 7).string(_user.celPhone != undefined ? _user.celPhone.toString() : '');
        ws.cell(i, 8).string(_user.motherName != undefined ? _user.motherName.toString() : '');
        ws.cell(i, 9).string(_user.login != undefined ? _user.login.toString() : '');
        ws.cell(i, 10).date(_user.birthday != undefined ? _user.birthday : 0);
        ws.cell(i, 11).string(_user.doc1 != undefined ? _user.doc1.toString() : '');
        ws.cell(i, 12).string(_user.doc2 != undefined ? _user.doc2.toString() : '');
        ws.cell(i, 13).string(_user.postalCode != undefined ? _user.postalCode.toString() : '');
        ws.cell(i, 14).string(_user.addressStreet != undefined ? _user.addressStreet.toString() : '');
        ws.cell(i, 15).number(_user.addressNumber != undefined ? Number(_user.addressNumber) : 0);
        ws.cell(i, 16).string(_user.addressComplement != undefined ? _user.addressComplement.toString() : '');
        ws.cell(i, 17).string(_user.addressRegion != undefined ? _user.addressRegion.toString() : '');
        ws.cell(i, 18).bool(_user.deleted != undefined ? _user.deleted : false);
        ws.cell(i, 19).bool(_user.active != undefined ? _user.active : false);
        ws.cell(i, 20).date(_user.createdAt != undefined ? _user.createdAt : 0);
      }

      // Write footer (counter)
      /*var _footerLine = 4 + leilao.lotes.length;
      ws.cell(_footerLine, 1).number(leilao.lotes.length);
      ws.cell(_footerLine, 4).number(_sumLanceInicial).style(sNumber);
      ws.cell(_footerLine, 5).number(_sumLanceVMV).style(sNumber);
      ws.cell(_footerLine, 7).number(_sumLanceGanhador).style(sNumber);
      ws.cell(_footerLine, 8).number(_sumComissao).style(sNumber);
      ws.cell(_footerLine, 12).number(_sumLances);
      ws.cell(_footerLine, 1, _footerLine, 13).style(sSubTitle);*/

      // Send excel workbook to DOWNLOAD
      wb.write('relatorio_usuarios_' + dateFormat(new Date(), "yyyymmdd_hhMMss") + '.xlsx', res);

      // wb.writeToBuffer().then(res, function (buffer) {
      //     if (err) return res.send(500, err);
      //     res.send(buffer);
      //     //res.json(200, buffer);
      // });
    });
};

exports.importExcel = function (req, res) {

  console.log(req.body);

  var _users = req.body.users;

  // Adjusting fields  
  for (var i = 0; i < _users.length; i++) {
    _users[i].tipoAcesso = 1;
    _users[i].tipoPessoa = 2;

    if (_users[i].gender === 'F')
      _users[i].gender = 'fem'
    else if (_users[i].gender === 'M')
      _users[i].gender = 'masc'
    

    if (_users[i].civil === 'solteiro')
      _users[i].civil = 'single'
    else if (_users[i].civil === 'casado')
      _users[i].civil = 'married'
    else if (_users[i].civil === 'divorciado')
      _users[i].civil = 'divorced'
    else if (_users[i].civil === 'viuva')
      _users[i].civil = 'widow'

    _users[i].simpleName = Util.removeAccents(_users[i].name + ' ' + _users[i].lastName);
  }


  User.create(_users, function (err, usuarios) {
    console.log(err);
    if (err) { return handleError(res, err); }

    //enviar emails
    // enviar email
    Mail.findOne({ name: 'novo_usuario_admin' }, function (err, result) {
      if (err) {
        callback(err);
        return;
      }

      for (var i = 0; i < _users.length; i++) {
        var _id = usuarios[i]._id;

        News.update({ name: 'CLIENTES PELO SITE' }, { $push: { emails: { email: usuarios[i].email } } });

        var _link = config.BASE_URL + '/#/activate/' + _id;
        //  console.log(_link);

        var _html = result.html.toString().replace("[USER]", usuarios[i].name);
        _html = _html.toString().replace("[LINK_ATIVATION]", _link);
        _html = _html.toString().replace("[TEMP_PASSWORD]", _users[i].password);


        var form = {
          from: result.from,
          to: usuarios[i].email,
          subject: result.subject,
          html: _html
        };

        MailCtrl.internalSendMail(form, function (err, body) {
          if (err) {
            return;
          }
        });
      }
    });
    return res.send(200);



    //return res.send(200);
  });





};


exports.index = function (req, res) {

  console.log('----- user controller ------')

  var user = req.user;

  console.log('usuario que esta logado', user);
  console.log('perfil do usuario que esta logado', user.role);

  var filter = {};

  if (user.role == RoleTypes.staff)
    filter.role = { '$in': [RoleTypes.ower] };
  else if (user.role == RoleTypes.ower) {
    filter.role = { '$in': [RoleTypes.ower, RoleTypes.acessor] };
    filter.company = req.user.company;
  }
  else {
    filter.role = { '$ne': 'admin' };
  }

  filter.deleted = false;

  console.log('filter that is been useed to show all users');

  User
    .find(filter, '-salt -hashedPassword')
    .populate('company', 'name')
    .exec(function (err, users) {
      console.log(err);
      console.log(users);
      if (err) return res.send(500, err);
      res.json(200, users);
    });

};

/**
 * Get list of users
 * restriction: 'logged users'
 */
exports.list = function (req, res) {

  var fields = {

  };

  User.find({ role: "user" }, fields, function (err, users) {
    if (err) return res.send(500, err);
    res.json(200, users);
  });
};

exports.search = function (req, res) {
  console.log('calling search look');

  var user = req.user,
    page = req.body.page || 0,
    query = {},
    fields = {},
    paging = {
      skip: page * 5,
      limit: 5
    };

  query.deleted = false;

  if (req.body.simpleName)
    query.simpleName = new RegExp(req.body.simpleName, "i");

  if (req.body.login)
    query.login = new RegExp(req.body.login, "i");

  if (req.body.tipoPessoa)
    query.tipoPessoa = req.body.tipoPessoa;

  if (req.body.doc1)
    query.doc1 = req.body.doc1;

  if (req.body.active !== undefined)
    query.active = req.body.active;

/*
  if (req.body.startDate) {
    query.createdAt = {
      $gte: req.body.startDate
    };
  }

  if (req.body.endDate) {
    query.createdAt = {
      $lte: req.body.endDate
    };
  }
*/
  if (req.body.categorieId) {
    console.log(req.body.categorieId);
    query.interestCategories = {
      $in: [req.body.categorieId]
    };
  }

  console.log(query);


  /*
      if (req.body.role)
          query.role = req.body.role;
      else
          query.role = {$in:['staff','owner']};
  
          */

  console.log(query);

  User
    .find(query, fields, paging)
    .populate('company', 'name')
    .sort({
      createdAt: -1
    })
    .exec(function (err, users) {

      if (err) {
        return handleError(res, err);
      }
      User.count(query, function (err, total) {

        var obj = {
          total: total,
          data: users
        };
        return res.json(200, obj);

      })

    });
};


/**
 * Creates a new user
 */
exports.create = function (req, res, next) {

  var newUser = req.body;
  newUser = new User(req.body);

  if (newUser.tipoPessoa === 2)
    newUser.simpleName = Util.removeAccents(req.body.name + ' ' + req.body.lastName);
  else if (newUser.tipoPessoa === 1)
    newUser.simpleName = Util.removeAccents(req.body.nomeFantasia);
  newUser.role = 'user';
  newUser.active = false;

  //enviar email de confirmacao

  newUser.provider = 'local';

  console.log(newUser);

  newUser.save(function (err, user) {
    console.log(err);
    if (err) return validationError(res, err);
    News.update({ name: 'CLIENTES PELO SITE' }, { $push: { emails: { email: user.email } } });
    var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
    res.json({ token: token, _id: user._id });

  });
};


/**
 * Creates a new staff
 */
exports.createStaff = function (req, res, next) {

  var newUser = new User(req.body);

  newUser.simpleName = Util.removeAccents(req.body.name + ' ' + req.body.lastName);

  newUser.provider = 'local';
  newUser.role = 'staff';
  newUser.save(function (err, user) {

    if (err) return validationError(res, err);
    var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
    res.json({ token: token });

  });

};

exports.getActive = function (req, res) {
  console.log('getActive');
  User.find({ active: true, deleted: false, showPublic: true }, function (err, user) {
    console.log(err);
    if (err) { return handleError(res, err); }
    return res.json(200, user);
  });
};

/**
 * Get a single user
 */

/**
 * Deletes a user
 * restriction: 'admin'
 */
// exports.destroy = function (req, res) {
//     User.findByIdAndRemove(req.params.id, function (err, user) {
//         if (err) return res.send(500, err);
//         return res.send(204);
//     });
// };
exports.destroy = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) { return handleError(res, err); }
    if (!user) { return res.send(404); }
    user.deleted = true;
    user.active = false;
    user.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.showUser = function (req, res, next) {
  var userId = req.params.id;
  console.log('export.show');

  User.findById(userId)
    .populate('comitente', 'simpleName')
    .exec(function (err, user) {
      if (err) return next(err);
      if (!user) return res.send(401);
      res.json(user);
    });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};


// Updates an existing broadcast in the DB.
exports.update = function (req, res) {

  var id = req.body._id;
  if (req.body._id) { delete req.body._id; }
  User.findById(id, function (err, _user) {

    if (err) return validationError(res, err);
    if (!_user) { return res.send(404); }

    console.log(updated);

    if (req.body.tipoPessoa === 2)
      req.body.simpleName = Util.removeAccents(req.body.name + ' ' + req.body.lastName);
    else if (req.body.tipoPessoa === 1)
      req.body.simpleName = Util.removeAccents(req.body.nomeFantasia);

    var updated = _.merge(_user, req.body);

    updated.save(function (err) {
      console.log(err);
      if (err) return validationError(res, err);
      return res.json(200, _user);
    });
  });
};

/*

// Updates an existing role in the DB.
exports.update = function (req, res) {
  console.log('to no update');
  if (req.body._id) { delete req.body._id; }
  User.findById(req.params.id, function (err, user) {
    if (err) { return handleError(res, err); }
    if (!user) { return res.send(404); }
    var updated = _.merge(user, req.body);


    if (updated.tipoPessoa == '2') {
      updated.simpleName = Util.removeAccents(updated.name + ' ' + updated.lastName);
    } else {
      updated.simpleName = Util.removeAccents(updated.nomeFantasia);
    }


    updated.save(function (err) {
      console.log(err);
      if (err) { return handleError(res, err); }
      return res.json(200, user);
    });
  });
};
*/

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  console.log('aqui');
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

exports.getById = function (req, res, next) {
  console.log('getById');
  console.log(req.query.id);
  var userId = req.query.id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  }).populate('addressCity')
    .populate('addressState')
    .populate('comitente', 'simpleName');
};

exports.getByMail = function (req, res, next) {
  console.log('getByMail');
  console.log(req.query.mail);
  var mail = req.query.mail;
  User.findOne({
    email: mail,
    deleted: false
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    console.log(err);
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

exports.getByLogin = function (req, res, next) {
  console.log('getByLogin');
  console.log(req.query.login);
  var _login = req.query.login;
  User.findOne({
    login: _login
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

exports.getByDoc1 = function (req, res, next) {
  console.log('getByDoc1');
  console.log(req.query.doc1);
  var _doc1 = req.query.doc1;
  User.findOne({
    doc1: _doc1
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};
exports.getByDoc2 = function (req, res, next) {
  console.log('getByDoc2');
  console.log(req.query.doc2);
  var _doc2 = req.query.doc2;
  User.findOne({
    doc2: _doc2
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};


/**
 * Verify if email exist
 */
exports.verifyMail = function (req, res, next) {
  console.log('verify email');

  var mail = req.body.email;

  User.findOne({ email: mail }, {}, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);
    console.log(user);

    var token = KeyStore.newKey();

    user.codigo = token;
    user.save(function (err) {
      console.log(err);
      if (err) return validationError(res, err);
      
      // enviar email
      Mail.findOne({ name: 'usuario_esqueceu_senha' }, function (err, result) {
        if (err) {
          callback(err);
          return res.send(404);
        }

        var _html = result.html.toString().replace("[USER]", user.name);
        _html = _html.toString().replace("[TOKEN]", token);

        var form = {
          from: result.from,
          to: user.email,
          subject: result.subject,
          html: _html
        };

        MailCtrl.internalSendMail(form, function (err, body) {
          if (err) {
            callback(err);
            return res.send(500);
          } else {
            return res.send(200);
          }
        });
      });
    });
  });
};

/**
 * Salvar nova Senha
 */
exports.saveNewPassword = function (req, res, next) {
  var _mail = req.body.email;
  var _codigo = req.body.codigo;
  var _senha = req.body.password;
  console.log(_mail);
  console.log(_codigo);
  //console.log(req.body);

  User.findOne({ email: _mail, codigo: _codigo }, {}, function (err, user) {
    if (err) return next(err);
    if (!user) return res.json(401, { 'msg': 'C�digo inv�lido.' });

    user.password = _senha;
    user.save(function (err) {
      console.log(err);
      if (err) return validationError(res, err);
      res.send(200);
    });

    //User.findById(user._id, function (err, user) {
    //    user.password = _senha;
    //        user.save(function (err) {
    //            if (err) return validationError(res, err);
    //            res.send(200);
    //        });
    //});


    //  return res.json({ 'msg': 'ok' });
  });
};


/**
 * Salvar nova Senha
 */
exports.saveNewPasswordWithoutCode = function (req, res, next) {

  var id = req.body.id;

  var oldPass = String(req.body.senhaAtual);
  var newPass = String(req.body.novaSenha);


  User.findById(id, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403, { 'msg': 'Senha Incorreta' });
    }
  });
};

/**
 * Reiniciar a senha
 */
exports.saveResetedPassword = function (req, res, next) {
  var _id = req.body.userId;
  var _senha = req.body.newPassword;
  /*console.log("---> saveResetedPassword");
  console.log(_id);
  console.log(_senha);*/

  User.findById(_id, function (err, user) {
    //console.log("---> saveResetedPassword: FIND ONE", user);
    if (err) return next(err);
    if (!user) return res.json(401, { 'msg': 'Código inválido.' });

    user.password = _senha;
    user.save(function (err) {
      console.log(err);
      if (err) return validationError(res, err);
      res.send(200);
    });
  });
};


exports.activate = function (req, res) {

  var id = req.params.id;
  User.findById(id, function (err, _user) {

    if (err) return validationError(res, err);
    if (!_user) { return res.send(404); }

    _user.active = true;

    _user.save(function (err) {
      console.log(err);
      if (err) return validationError(res, err);
      return res.json(200);
    });
  });
};


exports.autoPublic = function (req, res) {

  console.log('--- autoPublic ---');
  console.log(' params: ', req.body);

  var query = {
    $or: [{ simpleName: new RegExp(req.body.text, 'i') }, { login: new RegExp(req.body.text, 'i') }],
    role: 'user',
    funcionario: false
  },
    fields = {
      simpleName: 1,
      login: 1
    };

  User.find(query, fields, function (err, users) {
    if (err) { return handleError(res, err); }
    console.log(users);
    return res.json(200, users);
  });
};


/**
 * Salvar nova Senha
 */
exports.saveNewPasswordWithoutCode = function (req, res, next) {

  var id = req.body.id;

  var oldPass = String(req.body.senhaAtual);
  var newPass = String(req.body.novaSenha);


  User.findById(id, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403, { 'msg': 'Senha Incorreta' });
    }
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};

var generateRandomPass = function () {
  var RandPassword = Math.floor((Math.random() * 1000) + 1);
  return RandPassword.toString();
}

exports.resetEveryonePassword = function (req, res) {
  // Logging task's start
  console.log("Resetando a senha de todo mundo...");

  // Setup query variables
  var query = {},
  fields = {};

  // Locating users...
  User
    .find(query, fields)
    .sort({
      createdAt: -1
    })
    .exec(function (err, users) {
      // Checking query error and logging
      if (err) {
        return handleError(res, err);
      }

      // Reseting password in result query
      for (var i = 0; i < users.length; i++) {
        // Changing password
        users[i].password = generateRandomPass();
        console.log("Nova senha gerada: " + users[i].password);

        // Saving changes
        users[i].save(function (err) {
          // If something gets wrong ...
          if (err) {
            console.log("Falhou em resetar a senha: " + err);

          // But if everything work ...
          } else {
            console.log("Senha resetada! Enviando e-mail...");
          }
        });
      }
    });

  // Logging task's end
  console.log("Terminado de resetar a senha de todo mundo!");
}