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

// Define a variable that will become the "room name"
var share = '';

// Generate a string of letters and numbers and set it as the new room name
app.get('/', function(req, res) {
    share = rooms.generateRoom(6);
    res.render('index', {lesson: share});
});

// If the user clicked "start lesson," they'll reach a new URL with the room name as the path
app.get('/:lesson([A-Za-z0-9]{6})', function(req, res) {
    share = req.params.lesson;
    res.render('lesson', {shareURL: req.protocol + '://' + req.get('host') + '/' + share, share: share});
});

server.listen(3000);

// Get rid of the verbose socket.io logging
io.set("log level", 1);

// Keep a running list of all connected clients
var allClients = [];

// Define a variable for the teacher
var teacher = '';

// Handle socket traffic
io.on('connection', function (socket) {

    // Log a client connection
    console.log("A client has connected");

    // Add new connected client to the array of all currently connected clients
    allClients.push(socket.id);

    // If the new client is the first to connect, set them as the teacher
    teacher = allClients[0];

    // If someone leaves, remove them from the array of clients
    socket.on('disconnect', function() {
      console.log('A client has disconnected');

      var i = allClients.indexOf(socket.id);
      allClients.splice(i, 1);
      console.log(allClients);
    });

    console.log(allClients);

    // Set the nickname property for a given client
        socket.on('nick', function(nick) {
            socket.set('nickname', nick);
        });

        // Relay chat data to all clients
        socket.on('chat', function(data) {
            socket.get('nickname', function(err, nick) {

                var payload = {
                    message: data.message,
                    nick: nick || 'Anonymous'
                };

                io.sockets.emit('chat', payload);
            });
        });

        // Display red flags to all clients
        socket.on('flagged', function(){
            io.sockets.emit('flagged');
        });

        // Display the poll to all clients
        socket.on('poll', function(){
            io.sockets.emit('poll');
        });

        // Display votes
        socket.on('votezero', function(){
            io.sockets.emit('votezero');
        });

        socket.on('voteone', function(){
            io.sockets.emit('voteone');
        });

        socket.on('votetwo', function(){
            io.sockets.emit('votetwo');
        });

        socket.on('votethree', function(){
            io.sockets.emit('votethree');
        });

        socket.on('votefour', function(){
            io.sockets.emit('votefour');
        });

        socket.on('votefive', function(){
            io.sockets.emit('votefive');
        });

});