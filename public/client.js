let usersOnline = {};
let userName = null; // get from some sort of storage eventually
const itSymbol = "  [!]";
const itHTML = "<span style='color:red'>" + itSymbol + "</span>";
window.onload = function(){  
  let socket = io();

  //get login status
    FB.getLoginStatus((res) => {
        console.log(res);
    })


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

      let canvas = document.querySelector('#playarea');
      let user = new User(socket.id, username, canvas);
      socket.userinfo = user;

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

      // put color chooser in head
      let chooseColor = document.createElement('input');
      chooseColor.id = "chooseColor";
      chooseColor.type = "color";
      chooseColor.value = user.color;
      chooseColor.style.marginLeft = "15px";
      chooseColor.style.border = "none";
      chooseColor.style.cursor = "pointer";

      // event listener for color chooser
      chooseColor.addEventListener("input", () => {
         let color = chooseColor.value;
         if(validateColor(color)) {
             uDisplay.style.color = color;
             usersOnline[socket.userinfo.name].color = color;
             let data = {
                 'name': socket.userinfo.name,
                 'color': color
             };
             socket.emit('userchanged', data);
         } else {
             chooseColor.value = user.color;
         }
      });

      function validateColor(color){
          // checks:
          // color doesn't match play area background
          // color doesn't match other player color
          return true;
      }

      head.appendChild(uDisplay);
      head.appendChild(chooseColor);

      // update other users
      socket.emit('new user', user);

      // send player movement to server

      setInterval(function() {
          let data = {
              'movement': movement,
              'limits': {
                  'right': canvas.width,
                  'bottom': canvas.height
              }
          };
          socket.emit('movement', data);
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
    let newChat = document.createElement('div');
    newChat.dataset.toggle = "tooltip";
    newChat.dataset.placement = "right";
    newChat.title = new Date().toLocaleString();
    let content = "<b style='color:" + color + "'>" + username + ":</b> " + msg + '<br />';
    newChat.innerHTML = content;
    let chat = document.querySelector('#chat');
    chat.appendChild(newChat);
  });



  /*
    user has joined or left
  */
  socket.on('updateusers', (users) => {
      usersOnline = users;
      let uo = document.querySelector('#usersOnline');
      uo.innerHTML = '';
      for (user in users){
          let li = document.createElement('li');
          li.style.borderRight = "50px solid " + users[user].color;
          li.innerHTML = users[user].name;
          if (users[user].it)
              li.innerHTML += itHTML;
          if (users[user].name == userName){
              let it = users[user].it;
              let uDisplay = document.querySelector("#uDisplay");
              uDisplay.innerHTML = userName + ((it) ? itHTML:"");
              let chooseColor = document.querySelector("#chooseColor");
              chooseColor.value = users[user].color;
              uDisplay.style.color = users[user].color;
          }
          uo.appendChild(li);
      }
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

    let btn = document.querySelector("#closeSidebar");
    btn.addEventListener("click", () => {
        let sidebar = document.querySelector("#sidebar");
        if (sidebar.style.display == "none")
            sidebar.style.display = "block";
        else
            sidebar.style.display = "none";
    });

  /*
    SEND THE USERS MOVEMENT TO THE SERVER
    user controls the player with arrow keys
  */
  let movement = {   up: false,  down: false,
                   left: false, right: false   };
    document.addEventListener('keydown', (e) => {
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
        if (e.key === "ArrowRight" || e.key === "d")
            movement.right = false;
        else if (e.key === "ArrowLeft" || e.key === "a")
            movement.left = false;
        else if (e.key === "ArrowUp" || e.key === "w")
            movement.up = false;
        else if (e.key === "ArrowDown" || e.key === "s")
            movement.down = false;
    });


    /*

        game mechanics
        -draw functions
        -socket state handling
     */
    let canvas = document.querySelector("#playarea");
    let ctx = canvas.getContext('2d');

    function draw(user) {
        console.log(user);
        ctx.beginPath();
        ctx.arc(user.pos.x, user.pos.y, user.size, 0, Math.PI * 2);
        ctx.fillStyle = user.color;
        ctx.fill();
        ctx.closePath();
    }

    socket.on('state', (users) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let u in users){
            draw(users[u]);
        }
    })

};



