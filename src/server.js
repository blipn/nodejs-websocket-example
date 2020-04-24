const sharp = require('sharp');
const path = require('path');
const uuidv4 = require('uuid/v4');
/* eslint-disable global-require */
module.exports = (http, uploadDir) => {
  const SocketAntiSpam = require('socket-anti-spam');
  const io = require('socket.io')(http);
  const hashtags = {};

  const socketAntiSpam = new SocketAntiSpam({
    banTime: 10, // Ban time in minutes
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
        type: msg.type,
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

      if (data.type === 'img') {
        const name = uuidv4();
        sharp(data.message)
          .resize(250)
          .webp()
          .toFile(path.join(uploadDir, `${name}.webp`), (err, info) => {
            if (err) { console.error(err); } else {
              console.log(info);
              data.message = `/images/upload/${name}.webp`;
              // Envoi du message
              io.emit(msg.hashTag, data);
            }
          });
      } else {
        // Envoi du message
        io.emit(msg.hashTag, data);
      }

      // Stockage du message
      hashtags[msg.hashTag].push(data);
      // console.log(hashtags)

    });
  });
};
