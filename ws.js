const WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510})

const hashTags = []

wss.on('connection',(ws) => {

  const hashTag = ''
  ws.send('connected, please pick a hashtag');

  // data: {
  //   from: String
  //   message: String
  //   hashTag: String
  //   timeStamp: Date
  // }
  ws.on('data', (d) => {
    console.log(d)
    hashTag = d.hashTag
    data = {
      from: d.from, 
      message: d.message,
      timeStamp: new Date()
    }
    
    try {
      hashTags[hashTag].push(data)
    } catch (error) {
      hashTags[hashTag] = [data];
      console.log(`new room ${hashTag} created`)
    } finally {
      ws.send(hashTags[hashTag])
    }
  })

  setInterval(
    () => ws.send(`${new Date()}`),
    1000
  )
})
