/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function (app) {

  // Insert routes below
  app.use('/api/categories', require('./api/categorie'));
  app.use('/api/roles', require('./api/role'));
  app.use('/api/images', require('./api/image'));
  app.use('/api/staffs', require('./api/staff'));
  app.use('/api/users', require('./api/user'));
  app.use('/auth', require('./auth'));
  app.use('/api/cep', require('./api/cep'));
  app.use('/api/mail', require('./api/mail'));
  app.use('/api/estados', require('./api/estado'));
  app.use('/api/cidades', require('./api/cidade'));
  app.use('/api/imprensas', require('./api/imprensa'));
  app.use('/api/banners', require('./api/banner'));
  app.use('/api/condicoes', require('./api/condicaoVenda'));
  app.use('/api/taxas', require('./api/taxa'));
  app.use('/api/comitentes', require('./api/comitente'));
  app.use('/api/lotes', require('./api/lote'));
  app.use('/api/leiloes', require('./api/leilao'));
  app.use('/api/boletos', require('./api/boleto'));
  app.use('/api/pages', require('./api/page'));
  app.use('/api/mail', require('./api/mail'));
  app.use('/api/vendasdiretas', require('./api/vendaDireta'));
  app.use('/api/relatorio', require('./api/relatorio'));
  app.use('/api/prestacao', require('./api/prestacao'));
  app.use('/api/news', require('./api/news'));
  app.use('/api/dashboard', require('./api/dashboard'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
