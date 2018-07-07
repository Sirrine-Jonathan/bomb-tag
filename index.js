const express = require('express');
const app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const User = require('./User.js');
const port = (process.env.PORT) ? process.env.PORT:8888;
let users = {};
let numOfUsers = 0;
let someoneIt = false;
let personIt = null;
const SERVER_COLOR = "#FFFFFF";

app.use(express.static('public'));
io.on('connection', (socket) => {
   io.emit('updateusers', users);

   socket.on('new user', (user) => {
      let newUser = new User(user.id, user.name, user.canvas, user.color);
      socket.emit('updatechat', 'SERVER', SERVER_COLOR, 'you have connected');
      socket.broadcast.emit('updatechat', 'SERVER', SERVER_COLOR, newUser.name + ' has connected');

      numOfUsers++;
      if (numOfUsers === 2 && someoneIt === false){
        playerTagged(newUser);
      }

      socket.userinfo = newUser;
      users[socket.userinfo.name] = socket.userinfo;

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
                         playerTagged(users[user]);
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

            if (vert && horz) {
                player.toggleTag();
                playerTagged(users[u]);
                break;
            }
        }
   }

   function playerTagged(pTag){
       pTag.pos = { 'x': pTag.startPos.x, 'y': pTag.startPos.y };
       pTag.toggleTag();
       io.sockets.emit('updateusers', users);
       personIt = pTag.name;
       someoneIt = true;
       let itSocket = io.sockets.connected[pTag.id];
       itSocket.emit('updatechat', 'SERVER', SERVER_COLOR, 'you are it!');
       itSocket.broadcast.emit('updatechat', 'SERVER', SERVER_COLOR, pTag.name + ' is it!');
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