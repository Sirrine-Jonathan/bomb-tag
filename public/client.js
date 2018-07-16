let usersOnline = {};
let userName = null; // get from some sort of storage eventually
const itSymbol = "  [!]";
const itHTML = "<span style='color:red'>" + itSymbol + "</span>";
window.onload = function(){  
  let socket = io();


  /*
    User Enters Game
    by pressing facebook login button
  */
  socket.on('loggedOnViaFacebook', (data) => {
      console.log(data);
      let username = data.displayName;
      let photoURL = data.photos[0];

      // validate unique name constraint
      let validUsername = validateUsername(username);
      if (!validUsername) {
          let errorMsg = document.querySelector('#usernameError');
          errorMsg.innerHTML = "user already signed in";
          return;
      } else {
          let errorMsg = document.querySelector('#usernameError');
          errorMsg.innerHTML = '';
      }

      let canvas = document.querySelector('#playarea');
      let user = new User(socket.id, username, canvas);
      user.photoURL = photoURL;
      socket.userinfo = user;
      updateHeadAfterLogin(user);

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

  });


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
        let validUsername = validateUsername(username);
        if (!validUsername) {
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

      updateHeadAfterLogin(user);

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


    function updateHeadAfterLogin(user) {
        let head = document.querySelector('#header');
        let toEnter = head.querySelector('#toLogInGroup');
        let toLeave = head.querySelector('#toLogOutGroup');
        let errorMsg = head.querySelector('#usernameError');
        toEnter.style.display = 'none';
        toLeave.style.display = 'block';
        errorMsg.style.display = "none";

        // update toLeave group
        let uDisplay = toLeave.querySelector('#uDisplay');
        uDisplay.innerHTML = user.name;

        // put color chooser in head
        let chooseColor = toLeave.querySelector('#chooseColor');
        chooseColor.value = user.color;

        // event listener for color chooser
        chooseColor.addEventListener("input", () => {
            let color = chooseColor.value;
            if (validateColor(color)) {
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
    }

    function updateHeadAfterLogout(){
        // revert head to logged out state
    }

    function validateColor(color){
        // checks:
        // color doesn't match play area background
        // color doesn't match other player color
        return true;
    }

    function validateUsername(username) {
        let unique = true;
        for (let user in usersOnline) {
            if (usersOnline[user].name === username) {
                unique = false;
                break;
            }
        }
        return unique;
    }

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


  function addUserToScoreBoard(user, board){
      let li = document.createElement('li');
      li.style.borderRight = "50px solid " + user.color;
      li.innerHTML = user.name + " " + buildTime(user.time);
      if (user.it)
          li.innerHTML += itHTML;
      if (user.name == userName){
          let it = user.it;
          let uDisplay = document.querySelector("#uDisplay");
          uDisplay.innerHTML = userName + ((it) ? itHTML:"");
          let chooseColor = document.querySelector("#chooseColor");
          chooseColor.value = user.color;
      }
      board.appendChild(li);
  }

  function buildTime(num){
      let min = Math.floor(num / 60);
      let sec = Math.floor(num - (min * 60));
      sec = (sec < 10) ? "0"+sec:sec;
      return min + ":" + sec;
  }

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
        ctx.beginPath();
        ctx.arc(user.pos.x, user.pos.y, user.size, 0, Math.PI * 2);
        ctx.fillStyle = user.color;
        ctx.fill();
        ctx.closePath();
    }

    socket.on('state', (users) => {

        // get user array ready
        usersOnline = users;
        let sortedUsers = sortObj(users, "time");

        // begin drawing by clearing canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let uo = document.querySelector('#usersOnline');
        uo.innerHTML = '';

        // loops through users to draw them
        for (let i = sortedUsers.length - 1; i >= 0; i--){
            draw(sortedUsers[i]);
            addUserToScoreBoard(sortedUsers[i], uo);
        };
    });

    function sortObj(data, attr){
        let resultArray = [];
        for (u in data){
            insert(data[u]);
        }
        function insert(u){
            if (resultArray.length <= 0){
                resultArray.push(u);
                return;
            }
            let inserted = false;
            for (let i = 0; i < resultArray.length; i++){
                if (u.time < resultArray[i].time && !inserted){
                    resultArray.splice(i, 0, u);
                    inserted = true;
                }
            }
            if (!inserted){
                resultArray.push(u);
            }
        }
        return resultArray;
    }

};



