var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const ngrok = require('ngrok');

(async function() {
  const url = await ngrok.connect(port);
  console.log(`Forwarding localhost:${port} on ${url}`)
})();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// msg: {
//   hashTag: String,
//   from: String,
//   message: String
// }
io.on('connection', function(socket){
  socket.on('message', function(msg){
    io.emit(msg.hashTag, msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
