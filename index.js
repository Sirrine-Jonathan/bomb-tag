const express = require('express');
const app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const port = (process.env.PORT) ? process.env.PORT:8888;
let users = {};
const SERVER_COLOR = "#FFFFFF";

app.use(express.static('public'));
io.on('connection', (socket) => {
   io.emit('updateusers', users);

   socket.on('new user', (user) => {
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
      if (socket.userinfo){
         delete users[socket.userinfo.name];
         io.sockets.emit('updateusers', users);
         socket.broadcast.emit('updatechat', 'SERVER', SERVER_COLOR, socket.userinfo.name + ' has disconnected');
      }
   });
});

http.listen(port, () => {
   console.log('listening on :' + port);
});