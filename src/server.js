/* eslint-disable global-require */
module.exports = (http) => {
  const io = require('socket.io')(http);
  const hashtags = {};

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
