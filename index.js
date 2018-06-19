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
let usersOnline = [];

app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
   socket.emit('update users', usersOnline);
   socket.on('disconnecting', () => {
      let id = -1;
      for (let i = 0; i < usersOnline.length; i++){
         if (usersOnline[i].id == socket.id){
            id = i;
            break;
         }
      };
      if (id > 0){
         console.log(usersOnline[id].name + " left");
         usersOnline.splice(id, 1);
      } else {
         console.log("unknown error");
      }
   });

   socket.on('disconnect', () => {
      socket.broadcast.emit('update users', usersOnline);
   });

   socket.on('new user', (user) => {
      console.log(user.name + " logged on");
      usersOnline.push(user);
      console.log("New User Added, Showing List: ");
      for (let i = 0; i < usersOnline.length; i++){
         console.log(user.id + ", " + user.name);
      }
      console.log("");
      io.emit('update users', usersOnline);
   })
});

http.listen(port, () => {
   console.log('listening on :' + port);
});