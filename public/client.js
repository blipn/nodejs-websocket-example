let hashTag = 'all'
      $(() => {
        var socket = io()

        function updateList(newList){
          const list = document.getElementById('hashtags');
          list.innerHTML = ''
          for (let [key, item] of Object.entries(newList)) {
            let option = document.createElement('option');
            option.value = item;   
            list.appendChild(option);
          }
        }

        function show(data) {
          $('#messages').append($('<li>').text(data))
        }

        function newRoom(data) {
          $('#messages').html("");
          data.forEach(element => {
            show(element.message)
          });
        }

        function listen(hashTag) {
          socket.on('getMessages', (messages) => {
            console.log(messages)
            newRoom(messages)
            socket.off('getMessages')
          })
          socket.emit('getMessages', hashTag)
          socket.on(hashTag, (msg) => {
            show(msg.message)
            window.scrollTo(0, document.body.scrollHeight)
          })
          show(`Connected on #${hashTag}`)
        }

        socket.on('connection', ()=>{
          listen(hashTag)
        })

        socket.on('hashtags', (newList)=>{
          console.log(newList)
          updateList(newList)
        })

        $('#msgForm').submit(() => {
          from = 'me'
          message = $('#m').val()
          socket.emit('message', { hashTag, from, message })
          $('#m').val('')
          return false
        });

        $('#tagForm').submit(() =>{
          socket.off(hashTag)
          hashTag = $('#hashTag').val()
          listen(hashTag)
          return false
        })

      })
    