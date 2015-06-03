var express = require('express');
var http = require('http'); 
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000);


// Handle socket traffic
io.on('connection', function (socket) {
    // Log a client connection
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
    })
});