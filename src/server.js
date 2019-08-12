const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');


// 設置 port 及靜態資源
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.resolve(__dirname, './views')));


// 路由配置
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './views/index.html'));
});

app.get(/(room)+/, (req, res) => {
  res.sendFile(path.resolve(__dirname, './views/room.html'));
})


// 連線配置
io.on('connection', socket => {
  const url = socket.request.headers.referer
  const split_arr = url.split('/');
  const roomid = split_arr[split_arr.length-1];
  let user = '';
  console.log('A user has connected to: ' + roomid);

  // 進入房間
  socket.join(roomid);
  socket.emit('send roomid', roomid); // emit an event to the socket

  // Username
  socket.on('send username', username => {
    console.log(`User ${username} enter room: ${roomid}`);
    io.to(roomid).emit('send username', username);
    user = username;
  })

  // Message
  socket.on('send msg', data => {
    console.log(`User: ${data.name}, message: ${data.msg}`);
    io.to(roomid).emit('send msg', data);
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User ${user} disconnected`);
    io.to(roomid).emit('disconnect', user);
  });
})






server.listen(app.get('port'), () => {
  console.log('Socket server listening on port: '+app.get('port'));
});