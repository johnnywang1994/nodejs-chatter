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
})

app.get(/(room)+/, (req, res) => {
  res.sendFile(path.resolve(__dirname, './views/room.html'));
})


// 共用資源
let Rooms = {}; // 房間群



// 連線配置
io.on('connection', socket => {
  const url = socket.request.headers.referer;
  const split_arr = url.split('/');
  const roomid = split_arr[split_arr.length-1];
  let user = ''; // 用戶名
  // let userid = ''; // 用戶ID
  console.log('A user has connected to: ' + roomid);


  // Username
  socket.on('send username', username => {
    let data = {
      status: null,
      username
    };

    // 判斷是否新增房間或加入現有房間
    if (!Object.keys(Rooms).includes(roomid)) {
      Rooms[roomid] = [];
    }

    // Check Username 判斷使用者名稱是否已被使用
    if (Rooms[roomid].includes(username)) {
      data.status = false;
      socket.emit('check username', data);
    } else {
      data.status = true;
      socket.emit('check username', data);

      console.log(`User ${username} enter room: ${roomid}`);
      user = username;

      // 加入房間
      socket.join(roomid);
      Rooms[roomid].push(user);

      socket.emit('send roomid', roomid); // emit an event to the socket
      io.to(roomid).emit('send username', username); // 廣播加入
      io.to(roomid).emit('update roomInfo', {
        userList: Rooms[roomid],
        userNumber: Rooms[roomid].length
      }); // 更新聊天室資訊
    }
  })

  // Message
  socket.on('send msg', data => {
    console.log(`User: ${data.name}, message: ${data.msg}`);
    io.to(roomid).emit('send msg', data);
  })

  // File
  socket.on('send file', data => {
    console.log(`User: ${data.name}, file: ${data.fileName}`);
    io.to(roomid).emit('send file', data);
  })

  // Disconnect
  socket.on('disconnect', () => {
    if (user !== '') {
      console.log(`User ${user} disconnected`);
      socket.leave(roomid);
      io.to(roomid).emit('disconnect', user); // 廣播離開

      // 刪除聊天室使用者，若聊天室內已沒人，則刪除該聊天室
      // 若還有人，則更新聊天室資訊
      remove(Rooms[roomid], user);
      if (Rooms[roomid].length === 0) {
        delete Rooms[roomid];
      } else {
        io.to(roomid).emit('update roomInfo', {
          userList: Rooms[roomid],
          userNumber: Rooms[roomid].length
        }); // 更新聊天室資訊
      }
    }
  });
})





server.listen(app.get('port'), () => {
  console.log('Socket server listening on port: '+app.get('port'));
});


function remove(arr, item) {
  if (arr.length) {
    let index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}