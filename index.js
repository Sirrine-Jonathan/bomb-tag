/*
   Users online array needs to be in this file
   push the arreay to index.html when a user connects
   validate the unique constraint of username in index.html
   update user online list in index.html when a new user enters.
*/

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const port = (process.env.PORT) ? process.env.PORT:8888;
let users = {};

app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
   io.emit('updateusers', users);


   socket.on('new user', (user) => {
      socket.userinfo = user;
      users[socket.userinfo.username] = socket.userinfo;
      socket.emit('updatechat', 'SERVER', 'you have connected');
      socket.broadcast.emit('updatechat', 'SERVER', user.username + ' has connected');
      io.sockets.emit('updateusers', users); 
   })

   socket.on('disconnect', () => {
      delete users[socket.userinfo.username];
      io.sockets.emit('updateusers', users);
      socket.broadcast.emit('updatechat', 'SERVER', socket.userinfo.username + ' has disconnected');
   });
});

http.listen(port, () => {
   console.log('listening on :' + port);
});