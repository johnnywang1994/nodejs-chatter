const app = new Vue({
  el: '#app',
  data() {
    return {
      socket: io(),
      roomid: null,
      username: null,
      userList: [],
      userNumber: 0,
      message: '',
      boardContent: '',
      popup: new Popup(`
        <div class="popup-username">
          請輸入暱稱：<input type="text" id="username" />
          <button id="send-username">確認暱稱</button>
        </div>
      `, {
        success(){
          const popup = this;
          const sendUsernameBtn = this.node.getElementsByTagName('button')[0];

          sendUsernameBtn.onclick = function() {
            const username = popup.node.getElementsByTagName('input')[0].value;

            if (username !== '') {
              app.socket.emit('send username', username);
            } else {
              alert('請輸入暱稱');
            }
          }
        }
      }),

    }
  },
  methods: {
    enterRoom() {
      const vm = this;

      // RoomId
      vm.socket.on('send roomid', roomid => {
        vm.roomid = roomid;
      })

      // Username
      vm.socket.on('send username', username => {
        vm.boardContent += `<div class="user-enter-msg">***** ${username} 已進入聊天室 *****</div>`;
      })

      // Check Username
      vm.socket.on('check username', res => {
        if (!res.status) {
          alert('用戶名已被使用，請使用其他用戶名。');
        } else {
          vm.username = res.username;
          vm.popup.close();
        }
      })

      // Update RoomInfo
      vm.socket.on('update roomInfo', infos => {
        vm.userList = infos.userList;
        vm.userNumber = infos.userNumber;
      })

      // Message
      vm.socket.on('send msg', data => {
        const isMe = (data.name === vm.username);

        if (isMe) {
          vm.boardContent += `<div class="message me">${data.msg}</div>`;
        } else {
          vm.boardContent += `<div class="message">${data.name}: ${data.msg}</div>`;
        }
      })

      // Disconnect BroadCast
      vm.socket.on('disconnect', username => {
        if (username !== '') {
          vm.boardContent += `<div class="user-enter-msg">***** ${username} 已離開聊天室 *****</div>`;
        }
      })

      vm.popup.open();
    },
    sendMessage() {
      const vm = this;
      const data = {
        name: vm.username,
        msg: vm.message
      };

      if (vm.message !== '') {
        vm.socket.emit('send msg', data);
        vm.message = '';
      }
    }
  },
  mounted() {
    this.enterRoom();
  }
});