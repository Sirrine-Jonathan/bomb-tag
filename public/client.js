var usersOnline = {};
var clientID = '';
window.onload = function(){  
  var socket = io();


  /*
    add username to players
  */
  let uInput = document.querySelector("#usernameInput");
  uInput.addEventListener('keypress', (e) => {
    if (e.charCode == 13){
      let username = uInput.value;

      // validate unique name constraint
      
      let unique = true;
      for (let user in usersOnline){
        if (usersOnline[user].name == username){
          unique = false;
          break;
        }
      };
      if (!unique){
        let errorMsg = document.querySelector('#usernameError');
        errorMsg.innerHTML = "username taken";
        return;
      }
      else {
        let errorMsg = document.querySelector('#usernameError');
        errorMsg.innerHTML = '';
      }
      
      function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      let user = {
        'id': socket.id,
        'name': username,
        'it': false,
        'color': getRandomColor()
      }

      // empty head
      let head = document.getElementById('header');
      let errorMsg = document.querySelector('#usernameError');
      head.removeChild(uInput);
      head.removeChild(errorMsg);

      // put user display in head
      let uDisplay = document.createElement('span');
      uDisplay.id = "uDisplay";
      uDisplay.style.color = user.color;
      uDisplay.innerHTML = user.name;
      head.appendChild(uDisplay);

      // update other users
      socket.emit('new user', user);
    }
  });

  /*
    send chat
  */
  let chatInput = document.querySelector('#chatInput');
  chatInput.addEventListener('keypress', (e) => {
    if (e.charCode == 13){
      socket.emit('sendchat', chatInput.value);
      chatInput.innerHTML = '';
      chatInput.value = '';
    }
  })

  /*
    update chat
  */
  socket.on('updatechat', (username, color, msg) => {
    let newChat = document.createElement('span');
    newChat.innerHTML = "<b style='color:" + color + "'>" + username + ":</b> " + msg + '<br />';
    console.log(newChat.innerHTML);
    let chat = document.querySelector('#chat');
    chat.appendChild(newChat);
  });



  /*
    user has joined or left
  */
  socket.on('updateusers', (users) => {
    usersOnline = users;
    console.log(usersOnline);
    updateUsers();
  });


  /*
    updates the UI
  */
  function updateUsers(){
    let uo = document.querySelector('#usersOnline');
    uo.innerHTML = '';
    for (user in usersOnline){
      let li = document.createElement('li');
      li.innerHTML = usersOnline[user].name + ((usersOnline[user].it) ? "<span style='color: red'> <!></span>":"");
      uo.appendChild(li);
    };
  }
}