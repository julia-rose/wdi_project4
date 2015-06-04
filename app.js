var express = require('express');
var http = require('http'); 
var app = express();
var server = http.createServer(app);
var hbs = require('hbs');
var io = require('socket.io').listen(server);
var rooms = require('./rooms');

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static('public'));

var share = '';

app.get('/', function(req, res) {
    share = rooms.generateRoom(6);
    res.render('index');
});

app.get('/:lesson([A-Za-z0-9]{6})', function(req, res) {
    share = req.params.lesson;
    res.render('lesson', {shareURL: req.protocol + '://' + req.get('host') + '/' + share, share: share});
});

server.listen(3000);

// Object to hold all lessons; key is the room id
var lessons = {};

// Handle socket traffic
io.on('connection', function (socket) {
    // Log a client connection
    socket.on('join', function (data) {
        if (data.room in lessons) {
            if(typeof lessons[data.room].person2 != "undefined") {
                socket.emit('leave');
                return
            }
            socket.join(data.room);
            socket.set('room', data.room);
            socket.set('sid', -1);
        } else {
            socket.join(data.room);
            socket.set('room', data.room);
            socket.set('sid', 1);
            lessons[data.room] = {
                person1: socket
            };
            socket.emit('assign', {pid: 1});
        }

    });
    console.log("A client has connected");

    // Set the nickname property for a given client
    socket.on('nick', function(nick) {
        socket.set('nickname', nick);
    });

    // Relay chat data to all clients
    socket.on('chat', function(data) {
        socket.get('nickname', function(err, nick) {
            var nickname = err ? 'Anonymous' : nick;

            var payload = {
                message: data.message,
                nick: nickname
            };

            socket.emit('chat', payload);
            socket.broadcast.emit('chat', payload);
        });
    });

    // Display red flags to all clients
    socket.on('flagged', function(){
        socket.emit('flagged');
        socket.broadcast.emit('flagged');
    });

    // Display the poll to all clients
    socket.on('poll', function(){
        socket.emit('poll');
        socket.broadcast.emit('poll');
    });

    // Display votes
    socket.on('votezero', function(){
        socket.emit('votezero');
        socket.broadcast.emit('votezero');
    });

    socket.on('voteone', function(){
        socket.emit('voteone');
        socket.broadcast.emit('voteone');
    });

    socket.on('votetwo', function(){
        socket.emit('votetwo');
        socket.broadcast.emit('votetwo');
    });

    socket.on('votethree', function(){
        socket.emit('votethree');
        socket.broadcast.emit('votethree');
    });

    socket.on('votefour', function(){
        socket.emit('votefour');
        socket.broadcast.emit('votefour');
    });

    socket.on('votefive', function(){
        socket.emit('votefive');
        socket.broadcast.emit('votefive');
    });
});