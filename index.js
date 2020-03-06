var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const ngrok = require('ngrok');

const hashtags = ['all'];

(async function() {
  const url = await ngrok.connect(port);
  console.log(`Forwarding http://localhost:${port}/ on ${url}`)
})();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// msg: {
//   hashTag: String,
//   from: String,
//   message: String
// }
io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log(msg)
    // Envoi du message
    io.emit(msg.hashTag, msg);
    
    if(hashtags.includes(msg.hashTag)) {
      // Hashtag deja existant
    } else {
      // Ajout du hashtag
      hashtags.push(msg.hashTag)
    }
  });
});

setInterval(()=>{
  io.emit('hashtags', hashtags); 
  console.log(hashtags)
},5000)

http.listen(port, function(){
  console.log('listening on *:' + port);
});
