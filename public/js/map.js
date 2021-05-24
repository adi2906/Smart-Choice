const latitude = document.querySelector("#latitude").textContent;
const longitude = document.querySelector("#longitude").textContent;
console.log(latitude, longitude)


var mymap = L.map('mapid').setView([latitude, longitude], 14);

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const tiles = L.tileLayer(tileUrl, {attribution});
tiles.addTo(mymap);



let titlu = document.querySelector(".card-title").textContent
var marker = L.marker([latitude, longitude]).addTo(mymap);
marker.bindPopup(`<b>${titlu}</b>`).openPopup();







// L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{10}/{10}/{10}?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/streets-v11',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken: 'your.mapbox.access.token'
// }).addTo(mymap);