const path = require('path');
const express = require('express');
const qrcode = require('qrcode-terminal');
const ngrok = require('ngrok');
const sslRedirect = require('heroku-ssl-redirect');

const port = process.env.PORT || 3000;
const app = express();

if (process.env.NODE_ENV !== 'development') {
  app.use(sslRedirect());
}

const http = require('http').Server(app);

const htmlPath = path.join(__dirname, 'public');

app.use('/', express.static(htmlPath));

(async function () {
  const url = await ngrok.connect(port);
  console.log(`Forwarding http://localhost:${port}/ on ${url}`);
  qrcode.generate(url, { small: true }, (qr) => {
    console.log(qr);
  });
}());

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

require('./src/server.js')(http);
