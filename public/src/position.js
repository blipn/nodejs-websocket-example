let latLong = null

var map = L.map('map', {
      center: [5, 5],
      zoom: 5
});

function showPosition(position) {
  latLong = position.coords

  if(!latLong.latitude || !latLong.longitude) {
    document.getElementById("underMap").style.display = 'block';
  } else {
    document.getElementById("underMap").style.display = 'none';
  }

  map.setView([position.coords.latitude, position.coords.longitude], 13);

  L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 18,
  }).addTo(map);

  L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)

  setInterval(()=>{
    map.invalidateSize()
  }, 1000)

}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition);
} else {
  document.getElementById("underMap").style.display = 'block';
}

