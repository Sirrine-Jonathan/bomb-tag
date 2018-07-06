const express = require('express');
const app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const port = (process.env.PORT) ? process.env.PORT:8888;
let users = {};
let numOfUsers = 0;
let someoneIt = false;
let personIt = null;
let cornerCount = 0;
const SERVER_COLOR = "#FFFFFF";

app.use(express.static('public'));
io.on('connection', (socket) => {
   io.emit('updateusers', users);

   socket.on('new user', (user) => {
      numOfUsers++;
      if (numOfUsers === 2 && someoneIt === false){
         user.it = true;
         io.to(user.id).emit('tagged');
         personIt = user.name;
         someoneIt = true;
      }
      user.pos = initPos(user.canvas);
      user.startPos = user.pos;
      socket.userinfo = user;
      users[socket.userinfo.name] = socket.userinfo;
      socket.emit('updatechat', 'SERVER', SERVER_COLOR, 'you have connected');
      socket.emit("updatechat", "SERVER", SERVER_COLOR, '...use awsd to move')
      socket.broadcast.emit('updatechat', 'SERVER', SERVER_COLOR, socket.userinfo.name + ' has connected');
      io.sockets.emit('updateusers', users); 
   });

   socket.on('sendchat', (msg) => {
      let name = (socket.userinfo) ? socket.userinfo.name:"anon";
      let color = (socket.userinfo) ? socket.userinfo.color:"#FFFFFF";
      io.sockets.emit('updatechat', name, color, msg);
   });

   socket.on('disconnect', () => {

      // only account for sockets that have joined
      if (socket.userinfo){

         // handle changing who is it
         if (users[socket.userinfo.name] && users[socket.userinfo.name].it) {
             delete users[socket.userinfo.name];
             numOfUsers--;
             someoneIt = false;
             if (numOfUsers > 1) {
                 let randomNum = Math.floor(Math.random() * numOfUsers);
                 let i = 0;
                 for (user in users) {
                     if (i === randomNum) {
                         users[user].it = true;
                         io.to(users[user].id).emit('tagged');
                         personIt = users[user].name;
                         someoneIt = true;
                     }
                     i++;
                 }
             }
         } else {
             delete users[socket.userinfo.name];
             numOfUsers--;
         }

         // update clients
         io.sockets.emit('updateusers', users);
         socket.emit('disconnected');
         socket.emit('updatechat', 'SERVER', SERVER_COLOR, "You have disconnected");
         socket.broadcast.emit('updatechat', 'SERVER', SERVER_COLOR, socket.userinfo.name + ' has disconnected');
      }
   });

   socket.on('userchanged', (data) => {
       users[data.name].color = data.color;
       io.sockets.emit('updateusers', users);
   });


   socket.on('movement', (data) => {
       let movement = data.movement;
       let limits = data.limits;
       let player = (socket.userinfo) ? users[socket.userinfo.name]:{};
       if (player !== {} && player.pos && !isNaN(player.pos.x) && !isNaN(player.pos.y)) {
           if (movement.left && player.pos.x > player.size) {
               player.pos.x -= player.speed;
           }
           if (movement.up && player.pos.y > player.size) {
               player.pos.y -= player.speed;
           }
           if (movement.right && player.pos.x < (limits.right - player.size)) {
               player.pos.x += player.speed;
           }
           if (movement.down && player.pos.y < (limits.bottom - player.size)) {
               player.pos.y += player.speed;
           }
       }
   });

   function checkCollision(player){
       let collidingWith = [];
        for (u in users){
            if (player === users[u])
                continue;
            // aliases
            let px = player.pos.x;
            let py = player.pos.y;
            let pb = player.size;
            let ux = users[u].pos.x;
            let uy = users[u].pos.y;
            let ub = users[u].size;
            let buff = pb + ub;

            // check vertical alignment
            let vert = Math.abs(py - uy) < buff;
            let horz = Math.abs(px - ux) < buff;
            if (vert && horz)
                collidingWith.push(users[u]);
        }
        if (collidingWith.length > 0){
            let tagString = player.name + " tagging: ";
            collidingWith.forEach((chump) => {
                tagString += " " + chump.name + " ";
                chump.pos = chump.startPos;
            })
            console.log(tagString);
        }
        return collidingWith;
   }

    function initPos(canvas) {
        let corner = cornerCount % 4;
        cornerCount++;
        console.log("Corner: " + corner);
        let pos = {};
        switch(corner) {
            case 0:
                pos = {
                    'x': 0,
                    'y': 0
                };
                break;
            case 1:
                pos = {
                    'x': canvas.width,
                    'y': 0
                };
                break;

            case 2:
                pos = {
                    'x': canvas.width,
                    'y': canvas.height
                };
                break;

            case 3:
                pos = {
                    'x': 0,
                    'y': canvas.height
                };
                break;
            default:
                pos = {
                    'x': canvas.width / 2,
                    'y': canvas.height / 2
                };
        }
        return pos;
    }

   setInterval(() => {
       io.sockets.emit('state', users);
       if (someoneIt)
           checkCollision(users[personIt]);
   }, 1000 / 60);
});



http.listen(port, () => {
   console.log('listening on :' + port);
});