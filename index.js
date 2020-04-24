const path = require('path');
const express = require('express');
const qrcode = require('qrcode-terminal');
const sslRedirect = require('heroku-ssl-redirect');

const port = process.env.PORT || 3000;
const app = express();

const http = require('http').Server(app);

const htmlPath = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'public/images/upload');

if (process.env.NODE_ENV !== 'development') {
  app.use(sslRedirect());
} else {
  (async function () {
    // eslint-disable-next-line global-require
    const ngrok = require('ngrok');
    const url = await ngrok.connect(port);
    console.log(`Forwarding http://localhost:${port}/ on ${url}`);
    qrcode.generate(url, { small: true }, (qr) => {
      console.log(qr);
    });
  }());
}

app.use('/', express.static(htmlPath));

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

require('./src/server.js')(http, uploadDir);
