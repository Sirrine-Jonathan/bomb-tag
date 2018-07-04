let usersOnline = {};
let userName = null; // get from some sort of storage eventually
const itSymbol = "  [IT]";
const itHTML = "<span style='color:red'>" + itSymbol + "</span>";
window.onload = function(){  
  let socket = io();


  /*
    User Enters Game
    by choosing a username
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
      } else {
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

      function User(id, username){
          this.id = id;
          this.name = username;
          this.it = false;
          this.color = getRandomColor();
          this.pos = {
              'x': 0,
              'y': 0
          }
          this.speed = 2;
      }

      let user = new User(socket.id, username);
      document.querySelector("#playarea").style.borderColor = user.color;

      // empty head
      let head = document.getElementById('header');
      let errorMsg = document.querySelector('#usernameError');
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

      // send player movement to server
      setInterval(function() {
          socket.emit('movement', movement);
      }, 1000 / 60);
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
                li.innerHTML += itHTML;
            uo.appendChild(li);
        }
    }

  /*
    client has been tagged
  */
  socket.on('tagged', () => {
      console.log("You are it!");
      let uDisplay = document.querySelector("#uDisplay");
      uDisplay.innerHTML = userName + itHTML;
  });

  /*
    SEND THE USERS MOVEMENT TO THE SERVER
    user controls the player with arrow keys
  */
  let movement = {   up: false,  down: false,
                   left: false, right: false   };
    document.addEventListener('keydown', (e) => {
      console.log(e.key);
      if (e.key === "ArrowRight" || e.key === "d")
          movement.right = true;
      else if (e.key === "ArrowLeft" || e.key === "a")
          movement.left = true;
      else if (e.key === "ArrowUp" || e.key === "w")
          movement.up = true;
      else if (e.key === "ArrowDown" || e.key === "s")
          movement.down = true;
    });
    document.addEventListener('keyup', (e) => {
        console.log(e.key);
        if (e.key === "ArrowRight" || e.key === "d")
            movement.right = false;
        else if (e.key === "ArrowLeft" || e.key === "a")
            movement.left = false;
        else if (e.key === "ArrowUp" || e.key === "w")
            movement.up = false;
        else if (e.key === "ArrowDown" || e.key === "s")
            movement.down = false;
    });

    let canvas = document.querySelector("#playarea");
    let ctx = canvas.getContext('2d');
    socket.on('state', (users) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let u in users){
            let user = users[u];
            ctx.beginPath();
            ctx.arc(user.pos.x, user.pos.y, 5, 0, Math.PI*2);
            ctx.strokeStyle = user.color;
            ctx.stroke();
            ctx.closePath();
        }
    })

};



