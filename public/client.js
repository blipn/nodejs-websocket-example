let hashTag = 'all'
      $(() => {
        const socket = io()
        let from = 'me'

        function updateList(newList){
          const list = document.getElementById('hashtags');
          list.innerHTML = ''
          for (let [key, item] of Object.entries(newList)) {
            let option = document.createElement('option');
            option.value = item;   
            list.appendChild(option);
          }
        }

        function show(from, message) {
          $('#messages').append($('<li>').text(`${from} : ${message}`))
        }

        function newRoom(data) {
          $('#messages').html("");
          data.forEach(element => {
            show('*', element.message)
          });
        }

        function listen(hashTag, from) {
          socket.on('getMessages', (messages) => {
            console.log(messages)
            newRoom(messages)
            socket.off('getMessages')
          })
          socket.emit('getMessages', { hashTag, from })
          socket.on(hashTag, (msg) => {
            show(msg.from, msg.message)
            window.scrollTo(0, document.body.scrollHeight)
          })
          show('*', `Connected on #${hashTag} as ${from}`)
        }

        socket.on('connection', ()=>{
          listen(hashTag)
        })

        socket.on('hashtags', (newList)=>{
          console.log(newList)
          updateList(newList)
        })

        $('#msgForm').submit(() => {
          message = $('#m').val()
          socket.emit('message', { hashTag, from, message })
          $('#m').val('')
          return false
        });

        $('#tagForm').submit(() =>{
          socket.off(hashTag)
          hashTag = $('#hashTag').val()
          from = $('#pseudo').val()
          listen(hashTag, from)
          return false
        })

      })
    