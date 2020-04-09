let hashTag = 'Tristan'
$('#pseudo').val('Unknown')
$('#hashTag').val(hashTag)

function randomId() {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

const myId = randomId();

$(() => {
  const socket = io()
  let from = 'me'

  function updateList(newList) {
    const list = document.getElementById('hashtags')
    const hashtagsList = document.getElementById('hashtagsList')
    list.innerHTML = ''
    hashtagsList.innerHTML = ''
    for (const [key, item] of Object.entries(newList)) {
      const option = document.createElement('option')
      const li = document.createElement('li')
      option.value = item
      const a = document.createElement("a")
      a.innerHTML = `#${item}`
      a.onclick = ()=>{
        $('#hashTag').val(item)
        a.style.filter = "brightness(0.5)"
        submitTagForm()
      }
      list.appendChild(option)
      hashtagsList.appendChild(li).appendChild(a)
    }
  }

  function show(from, message, id) {
    // $('#messages').append($('<li>').text(`${from} : ${message}`))
    const messages = document.querySelector("#messages")
    const popover = document.createElement("div")
    popover.setAttribute('class', id===myId ? 'popover right' : 'popover left')
    const title = document.createElement("h3")
    title.setAttribute('class', 'popover-title')
    title.appendChild(document.createTextNode(from))
    const content = document.createElement("div")
    content.setAttribute('class', 'popover-content')
    content.appendChild(document.createTextNode(message))
    popover.appendChild(title)
    popover.appendChild(content)
    messages.appendChild(popover)
  }

  function newRoom(data) {
    $('#messages').html('')
    data.forEach((element) => {
      show(element.from, element.message, element.id)
    })
  }

  function listen(hashTag, from) {
    socket.on('getMessages', (messages) => {
      console.log(messages)
      newRoom(messages)
      socket.off('getMessages')
    })
    socket.emit('getMessages', { hashTag, from })
    socket.on(hashTag, (msg) => {
      show(msg.from, msg.message, msg.id)
      window.scrollTo(0, document.body.scrollHeight)
    })
    show('*', `Connected on #${hashTag} as ${from}`, '*')
  }

  socket.on('connection', () => {
    listen(hashTag)
  })

  socket.on('hashtags', (newList) => {
    console.log(newList)
    updateList(newList)
  })

  function submitMsgForm() {
    message = $('#msg').val()
    socket.emit('message', { hashTag, from, message, id:myId })
    $('#msg').val('')

    return false
  }
  $('#msgForm').submit(submitMsgForm)

  function submitTagForm() {
    socket.off(hashTag)
    hashTag = $('#hashTag').val()
    from = $('#pseudo').val()
    listen(hashTag, from)

    return false
  }
  $('#tagForm').submit(submitTagForm)
  submitTagForm()
})
