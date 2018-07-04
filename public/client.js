let usersOnline = {};
let numOfUsers = 0;
let userName = null; // get from some sort of storage eventually

window.onload = function(){  
  let socket = io();


  /*
    add username to players
  */
  let uInput = document.querySelector("#usernameInput");
  uInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter"){
      let username = uInput.value;
      userName = username;
      // validate unique name constraint
      let unique = true;
      for (let user in usersOnline){
        if (usersOnline[user].name === username){
          unique = false;
          break;
        }
      }
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
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      let user = {
        'id': socket.id,
        'name': username,
        'it': false,
        'color': getRandomColor()
      };

      // empty head
      let head = document.getElementById('header');
      let errorMsg = document.querySelector('#usernameError');
      //head.removeChild(uInput);
      //head.removeChild(errorMsg);
      uInput.style.display = "none";
      errorMsg.style.display = "none";

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
    if (e.key === "Enter"){
      socket.emit('sendchat', chatInput.value);
      chatInput.innerHTML = '';
      chatInput.value = '';
    }
  });

  /*
    update chat
  */
  socket.on('updatechat', (username, color, msg) => {
    let newChat = document.createElement('span');
    newChat.innerHTML = "<b style='color:" + color + "'>" + username + ":</b> " + msg + '<br />';
    let chat = document.querySelector('#chat');
    chat.appendChild(newChat);
  });



  /*
    user has joined or left
  */
  socket.on('updateusers', (users) => {
    usersOnline = users;
    updateUsers();
  });

  /*
    client disconnected
  */
  socket.on('disconnected', () => {
      // reapply inputs
      uInput.style.display = "block";
      errorMsg.style.display = "block";

      //remove uDisplay
      let head = document.getElementById('header');
      let uDisplay = document.querySelector('#uDisplay');
      head.removeChild(uDisplay);
  });

  /*
    client has been tagged
  */
  socket.on('tagged', () => {
      console.log("You are it!");
      let uDisplay = document.querySelector("#uDisplay");
      uDisplay.innerHTML = userName + "<span style='color:red'> [!]</span>";
  });

  /*
    updates the UI
  */
  function updateUsers(){
    let uo = document.querySelector('#usersOnline');
    uo.innerHTML = '';
    for (user in usersOnline){
      let li = document.createElement('li');
      li.style.borderRight = "50px solid " + usersOnline[user].color;
      li.innerHTML = usersOnline[user].name;
      if (usersOnline[user].it)
          li.innerHTML += "<span style='color:red'> [!]</span>";
      uo.appendChild(li);
    }
  }
};