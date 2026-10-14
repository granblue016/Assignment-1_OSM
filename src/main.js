import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

// --- THÊM ĐOẠN NÀY ĐỂ SỬA LỖI MẤT HÌNH MARKER TRÊN NETLIFY ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// -----------------------------------------------------------------

const centerCoordinates = [10.7922, 106.7085];

var map = L.map('map').setView(centerCoordinates, 16);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker = L.marker(centerCoordinates).addTo(map)
  .bindPopup('273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh')
  .openPopup();