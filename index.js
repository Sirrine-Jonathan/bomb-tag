let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const port = 8888;

app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
   socket.on('disconnect', () => {
      console.log("user diconnected");
   });
   socket.on('new user', (username) => {
      console.log(username + "logged on");
      socket.broadcast.emit('new connection', username);
   })
});

http.listen(port, () => {
   console.log('listening on :' + port);
});