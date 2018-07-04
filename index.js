const express = require('express');
const app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const port = (process.env.PORT) ? process.env.PORT:8888;
let users = {};
let numOfUsers = 0;
let someoneIt = false;
const SERVER_COLOR = "#FFFFFF";

app.use(express.static('public'));
io.on('connection', (socket) => {
   io.emit('updateusers', users);

   socket.on('new user', (user) => {
      numOfUsers++;
      console.log("numOfUsers: " + numOfUsers);
      if (numOfUsers === 2 && someoneIt === false){
         user.it = true;
         io.to(user.id).emit('tagged');
         someoneIt = true;
      }
      socket.userinfo = user;
      users[socket.userinfo.name] = socket.userinfo;
      socket.emit('updatechat', 'SERVER', SERVER_COLOR, 'you have connected');
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
             console.log("numOfUsers: " + numOfUsers);
             someoneIt = false;
             if (numOfUsers > 1) {
                 // make someone else be it.
                 for (let i = 0; i < 10; i++){
                     console.log("test rand: " + Math.floor(Math.random() * numOfUsers));
                 }
                 let randomNum = Math.floor(Math.random() * numOfUsers);
                 console.log("random Number: " + randomNum);
                 let i = 0;
                 for (user in users) {
                     if (i == randomNum) {
                         users[user].it = true;
                         io.to(users[user].id).emit('tagged');
                         console.log(users[user].name + " is it: " + users[user].it);
                         someoneIt = true;
                     }
                     i++;
                 }
             }
         } else {
             delete users[socket.userinfo.name];
             numOfUsers--;
             console.log("numOfUsers: " + numOfUsers);
         }

         // update clients
         io.sockets.emit('updateusers', users);
         socket.emit('disconnected');
         socket.emit('updatechat', 'SERVER', SERVER_COLOR, "You have disconnected");
         socket.broadcast.emit('updatechat', 'SERVER', SERVER_COLOR, socket.userinfo.name + ' has disconnected');
      }
   });


   socket.on('movement', (data) => {
       let player = (socket.userinfo) ? users[socket.userinfo.name]:false || {};
       if (data.left)
           player.pos.x -= player.speed;
       if (data.up)
           player.pos.y -= player.speed;
       if (data.right)
           player.pos.x += player.speed;
       if (data.down)
           player.pos.y += player.speed;
   });

   setInterval(() => {
       io.sockets.emit('state', users);
   }, 1000 / 60);
});



http.listen(port, () => {
   console.log('listening on :' + port);
});