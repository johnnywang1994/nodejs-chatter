jw().onload(function(){
  var socket = io();
  var msg_form = jw('#msg-form')[0];
  var msg_content;
  // msg_form submit
  msg_form.onsubmit = function(e){
    e.preventDefault();
    // emit msg
    if (!jw('#image')[0].files[0]) {
      msg_content = jw('#msg').val();
      var data = {
        msg: msg_content,
        name: nickname
      };
      socket.emit('send msg', data);
      jw('#msg')[0].value = '';
    }
    // emit image
    var setItem = function(image){
      var file = image.files[0];
      var file_size = Math.floor(file.size / 1000);
      var file_size_limit = 2 * 1024;
      var file_type = file.type;
      var limit_types = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'];
    
      if (limit_types.indexOf(file_type) < 0) {
        alert('請上傳圖片格式為 jpg, png, bmp 之檔案');
        image.value = '';
      } else if (file_size > file_size_limit) {
        alert('上傳檔案的大小限制為 2 MB');
        image.value = '';
      } else {
        // 檔案推送
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
          socket.emit('send image', e.target.result);
          image.value = '';
        };
      }
    };

    setItem(jw('#image')[0]);
  };

  // receive msg
  socket.on('send msg', function(data){
    var html = '<div class="msg-line px-3 py-2">' + data.name + ': ' + data.msg + '</div>';
    jw('#msg-board').append(html);
  });
  // receive image
  socket.on('send image', function(base64){
    var html = `
      <div class="msg-line px-3 py-2">
        <img src="${base64}" style="max-width: 500px;">
      </div>
    `;
    jw('#msg-board').append(html);
  });
  // receive nickname
  socket.on('send nickname', function(name){
    var html = '<div class="msg-line px-3 py-2 red">*****'+ name +' 已進入聊天室*****</div>';
    jw('#msg-board').append(html);
  });
  
  // popup window
  var nick_form = jw('#nick-form')[0];
  var nickname;
  var popup = new Popup(jw('#popup')[0], {
    'display': 'inline-flex',
    'justify-content': 'center',
    'align-items': 'center',
    'width': '350px',
    'height': '200px',
    'border-radius': '15px'
  });
  popup.open('custom');

  // nick_form submit
  nick_form.onsubmit = function(e){
    e.preventDefault();
    nickname = jw('#nickname').val();
    if (nickname === '') {
      alert('請輸入您的暱稱，感謝您!');
    } else {
      socket.emit('send nickname', nickname);
      popup.close();
    }
  }
});
