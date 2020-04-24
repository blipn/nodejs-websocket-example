let hashTag = localStorage.getItem('hashTag') || 'Tristan'

const myId = localStorage.getItem('myId') || randomId()
localStorage.setItem('myId', myId);

$('#pseudo').val(localStorage.getItem('pseudo') || 'Unknown')
$('#hashTag').val(hashTag)

/**
 * Notifications
 */

try {
  Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
  });

  function displayNotification(title, text) {
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(function(reg) {
        reg.showNotification(title, {
          tag: 'TheOnlyNotification',
          body: text,
          icon: 'images/icons/logo-192-192.png',
          vibrate: [200, 50, 200, 50],
          data: {
            url: '/'
          }
        })
      })
    }
  }
} catch (error) {
  console.log('No browser support for notifications')
}

function randomId() {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

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

  function show(from, message, id, latitude, longitude, type='text') {
    // $('#messages').append($('<li>').text(`${from} : ${message}`))
    const messages = document.querySelector("#messages")
    const popover = document.createElement("div")
    popover.setAttribute('class', id===myId ? 'popover right' : 'popover left')
    const title = document.createElement("h3")
    title.setAttribute('class', 'popover-title')
    title.appendChild(document.createTextNode(from))
    const content = document.createElement("div")
    content.setAttribute('class', 'popover-content')
    if(type==='img') {
      const img = document.createElement("img")
      img.setAttribute("src", message);
      content.appendChild(img)
    } else {
      content.appendChild(document.createTextNode(message))
    }
    popover.appendChild(title)
    popover.appendChild(content)
    messages.appendChild(popover)

    try {
      if(latitude && longitude) {
        L.marker([latitude, longitude]).addTo(map).bindPopup(from)
      }
    } catch (error) {
      // console.log(error)
    }


  }

  function newRoom(data) {
    $('#messages').html('')
    data.forEach((element) => {
      show(element.from, element.message, element.id, element.latitude, element.longitude, element.type)
    })
  }

  function listen(hashTag, from) {
    socket.on('getMessages', (messages) => {
      newRoom(messages)
      socket.off('getMessages')
    })
    socket.emit('getMessages', { hashTag, from })
    socket.on(hashTag, (msg) => {
      if(msg.id!==myId){
        try {
          displayNotification(`New message from ${msg.from}`, msg.message)
        } catch (error) {
          //
        }}
      show(msg.from, msg.message, msg.id, msg.latitude, msg.longitude, msg.type)
      window.scrollTo(0, document.body.scrollHeight)
    })
    show('*', `Connected on #${hashTag} as ${from}`, '*')
  }

  socket.on('connection', () => {
    listen(hashTag)
  })

  socket.on('hashtags', (newList) => {
    updateList(newList)
  })

  // send message

  function submitMsgForm(e, photo=false) {
    let message
    let type = null
    if(photo) {
      message = photo
      type = 'img'
    } else {
      message = $('#msg').val()
      $('#msg').val('')
    }

    let latitude = null
    let longitude = null

    try {
      latitude = latLong.latitude
      longitude = latLong.longitude
    } catch (error) {
      console.log('You need to activate your geolocation')
    }

    socket.emit('message', { hashTag, from, message, id:myId, latitude, longitude, type })

    return false
  }
  $('#msgForm').submit(submitMsgForm)


  /**
   * Photos system
   */

  const photoInput = document.getElementById('myPhotoInput');

  function sendPic() {
      const file = photoInput.files[0];
      submitMsgForm(null ,file)
      // Send file here either by adding it to a `FormData` object
      // and sending that via XHR, or by simply passing the file into
      // the `send` method of an XHR instance.
  }
  photoInput.addEventListener('change', sendPic, false);


  // follow a hashtag

  function submitTagForm() {
    socket.off(hashTag)
    hashTag = $('#hashTag').val()
    localStorage.setItem('hashTag', hashTag);
    from = $('#pseudo').val()
    localStorage.setItem('pseudo', from);
    listen(hashTag, from)

    return false
  }
  $('#tagForm').submit(submitTagForm)
  submitTagForm()
})
