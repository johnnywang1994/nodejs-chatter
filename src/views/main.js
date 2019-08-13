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
          <input type="text" id="username" placeholder="請輸入暱稱" />
          <button id="send-username">確認暱稱</button>
        </div>
      `, {
        success(){
          const popup = this;
          const sendUsernameBtn = this.node.getElementsByTagName('button')[0];

          sendUsernameBtn.onclick = function() {
            const username = popup.node.getElementsByTagName('input')[0].value;

            if (username !== '') {
              app.socket.emit('send username', app.escapeHTML(username));
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

        vm.fixedBottom(document.getElementsByClassName('chat-board__view')[0]);
      })

      // File
      vm.socket.on('send file', data => {
        const isMe = (data.name === vm.username);

        if (isMe) {
          vm.boardContent += `<div class="message me"><img src="${data.file}" /><div><a href="${data.file}" download="${data.fileName}">下載</a></div></div>`;
        } else {
          vm.boardContent += `<div class="message">${data.name}: <img src="${data.file}" /></div>`;
        }

        vm.fixedBottom(document.getElementsByClassName('chat-board__view')[0]);
      })

      // Disconnect BroadCast
      vm.socket.on('disconnect', username => {
        if (username !== '') {
          vm.boardContent += `<div class="user-enter-msg">***** ${username} 已離開聊天室 *****</div>`;
        }
      })

      vm.popup.open();
    },
    // 傳送
    send() {
      const vm = this;

      vm.sendMessage();
      vm.sendFile();
    },
    // 傳送訊息
    sendMessage() {
      const vm = this;
      const data = {
        name: vm.username,
        msg: vm.escapeHTML(vm.message)
      };

      if (vm.message !== '') {
        vm.socket.emit('send msg', data);
        vm.message = '';
      }
    },
    // 傳送檔案
    sendFile() {
      const vm = this;
      let uploadInput = document.getElementById('upload-file');
      let file = uploadInput.files[0];

      if (file) {
        // 圖片
        if (vm.isImage(file)) {
          vm.sendImage(file);
        }
        // 檔案...
      }
    },
    sendImage(file) {
      const vm = this;
      let data, url;

      const reader = new FileReader();
      reader.onload = function(e) {
        url = e.target.result;
        data = {
          name: vm.username,
          file: url,
          fileName: file.name,
          fileType: file.type
        };

        vm.socket.emit('send file', data);
        vm.clearFileInput();
      }
      reader.readAsDataURL(file);
    },
    // 判斷是否為圖片
    isImage(file) {
      const imageList = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/heic', 'image/heif'];
      return imageList.includes(file.type);
    },
    // 清空上傳檔案
    clearFileInput() {
      let uploadInput = document.getElementById('upload-file');
      uploadInput.value = '';
      uploadInput.type = '';
      uploadInput.type = 'file';
    },
    // 固定對話框保持在最下面
    fixedBottom(o) {
      setTimeout(()=> {
        o.scrollTop = o.scrollHeight;
      }, 0);
    },
    // 處理輸入 html 內容
    escapeHTML(v) {
      v = String(v);
      let div = document.createElement('div');
      div.innerText = v;
      return div.innerHTML;
    }
  },
  mounted() {
    this.enterRoom();
  }
});