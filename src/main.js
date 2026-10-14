import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

const map = L.map('map').setView([10.7800793, 106.6850773], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const marker = L.marker([10.7800793, 106.6850773]).addTo(map);
marker.bindPopup("<b>273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh</b>").openPopup();