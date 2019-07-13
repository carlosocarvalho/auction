'use strict';

var _sock;
var _endpoint;
var _countUsers = 0;
var _ips = [];
exports.respond = function (endpoint, socket_io) {
    //console.log('passando');
    // console.log('a user connected');
    var address = socket_io.handshake.address;
    console.log('New connection from ' + address);
    // if (_ips.indexOf(address) == -1) {
    //     _ips.push(address);
    // }

    _sock = socket_io;
    _endpoint = endpoint;
    _countUsers++;
    // this function now expects an endpoint as argument

    // now we can do whatever we want:
    socket_io.on('news', function (newsreel) {

        // as is proper, protocol logic like
        // this belongs in a controller:

        socket.broadcast.emit(newsreel);
    });

    socket_io.on('disconnect', function (socket) {
        console.log('disconnect');
         _countUsers--;
    })

    socket_io.on('log', function (data, fn) {
        console.log('vai emititr feedback');
        console.log(data);
        socket_io.emit('log', data);
        console.log('comcerteza');
        fn();//call the client back to clear out the field
    });
};

exports.emit = function (channel, data) {
    console.log(channel);

    //_sock.broadcast.emit(channel, data);
    if (_endpoint) {
        _endpoint.emit(channel, data);
        console.log('emit?');

    }
};


exports.getCount = function () {
    console.log('passando');
    console.log(_countUsers);
    return _countUsers;

};