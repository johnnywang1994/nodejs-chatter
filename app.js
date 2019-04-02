var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('port', process.env.PORT || 8080);
app.use(express.static('./'));

app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname, './index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('send msg', function(msg){
    console.log('User message: '+msg);
    io.emit('send msg', msg);
  });
  socket.on('send image', function(image){
    console.log('User image base61: '+image);
    io.emit('send image', image);
  })
  socket.on('send nickname', function(name){
    console.log('User '+name+' Logined');
    io.emit('send nickname', name);
  })
});

http.listen(app.get('port'), function(){
  console.log('Express Server listening on port: '+app.get('port'));
});