/* eslint-disable global-require */
module.exports = (http) => {
  const SocketAntiSpam = require('socket-anti-spam');
  const io = require('socket.io')(http);
  const hashtags = {};

  const socketAntiSpam = new SocketAntiSpam({
    banTime: 30, // Ban time in minutes
    kickThreshold: 3, // User gets kicked after this many spam score
    kickTimesBeforeBan: 2, // User gets banned after this many kicks
    banning: true, // Uses temp IP banning after kickTimesBeforeBan
    io, // Bind the socket.io variable
    // redis: client, // Redis client if you are sharing multiple servers
  });

  socketAntiSpam.event.on('ban', (data) => {
    console.log('IP banned :', data.ip);
  });

  io.on('connection', (socket) => {
    let from = '?';

    function addHashtag(msg) {
      hashtags[msg.hashTag] = [];
      io.emit('hashtags', Object.keys(hashtags));
      console.log(`${msg.hashTag} added in hashtags : ${JSON.stringify(hashtags)}`);
    }

    io.emit('hashtags', Object.keys(hashtags));

    socket.on('getMessages', (data) => {
      from = data.from;
      if (hashtags[data.hashTag]) {
        socket.emit('getMessages', hashtags[data.hashTag]);
      }
    });

    socket.on('message', (msg) => {
      const data = {
        hashTag: msg.hashTag,
        ip: socket.request.connection.remoteAddress,
        id: msg.id,
        latitude: msg.latitude,
        longitude: msg.longitude,
        from,
        message: msg.message,
        timeStamp: new Date(),
      };
      console.log(msg);

      if (hashtags[msg.hashTag]) {
        // Hashtag deja existant
      } else {
        // Ajout du hashtag
        addHashtag(msg);
      }
      // Stockage du message
      hashtags[msg.hashTag].push(data);
      // console.log(hashtags)

      // Envoi du message
      io.emit(msg.hashTag, data);
    });
  });
};
