'use strict';

var express = require('express');
var controller = require('./staff.controller');


var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(),  controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

router.put('/updateAppointment/:id', auth.isAuthenticated(), controller.updateAppointment);
router.post('/addAppointment', auth.isAuthenticated(), controller.addAppointment);


module.exports = router;



// 'use strict';

// var express = require('express');
// var controller = require('./service.controller');

// var router = express.Router();

// router.get('/', controller.index);
// router.get('/:id', controller.show);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

// module.exports = router;