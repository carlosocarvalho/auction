/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Staff = require('./staff.model');

exports.register = function(socket) {
  Staff.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Staff.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('staff:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('staff:remove', doc);
}