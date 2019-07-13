/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var cors = require('cors');


// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express();

app.use(cors());

// Wesley Inacio - 02/05/2017
// Error: 413 (Payload Too Large) - CSV com muitas informações
// http://stackoverflow.com/questions/19917401/error-request-entity-too-large
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
var sockCtrl = require('./socketCtrl');
// var socketio = require('socket.io')(server, {
//   serveClient: (config.env === 'production') ? false : true,
//   path: '/socket.io-client'
// });
// require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});


// io.sockets.on('connection', function (socket) {
// 	socket.on('feedback', function (data, fn) {
// 		console.log(data);
// 		io.sockets.emit('feedback', { type: data.type, to: data.to });
// 		fn();//call the client back to clear out the field
// 	});

// });
// io.on('connection', sockCtrl.respond );

var chat = io
  .on('connection', function (socket) {
    sockCtrl.respond(chat, socket);
  });
io.on('disconnect', function (socket) {
  sockCtrl.disconnect(socket);
});


console.log('schedule');


var Leilao = require('./api/leilao/leilao.controller');

// NUNCA COMENTE ESTAS LINHAS, PLEEEEEASE!
// NUNCA COMENTE ESTAS LINHAS, PLEEEEEASE!
// NUNCA COMENTE ESTAS LINHAS, PLEEEEEASE!
var cron = require('node-schedule');
var rule = new cron.RecurrenceRule();
rule.second = 30;
cron.scheduleJob(rule, function () {

  // estou comentando pois o job esta encerrando tudo de maneira descordenada.

  console.log(new Date(), 'INICIO - OPERACAO - Finalizar Lotes');
  Leilao.finalizarLotes(
    function () {
      Leilao.finalizarLeiloes();
      // Leilao.gerarPagamentos();
    }
  );
  console.log(new Date(), 'FIM - OPERACAO - Finalizar Lotes');
});

var Lote = require('./api/lote/lote.controller');
//Lote.arrumandoLotes();
//Lote.arrumandoLotesLances();

//var User = require('./api/user/user.controller');
//User.resetEveryonePassword();

// Expose app
exports = module.exports = app;
