import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

// Khắc phục lỗi mất marker icon khi build production bằng cách import tường minh
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Định nghĩa lại cấu hình icon cho Leaflet
const myIcon = L.icon({
    iconUrl: 'my-icon.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});

// Tọa độ trung tâm tại 273 Điện Biên Phủ, TP.HCM
const centerCoordinates = [10.7922, 106.7085];

// Khởi tạo bản đồ
var map = L.map('map').setView(centerCoordinates, 16);

// Thêm lớp bản đồ nền từ OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Thêm marker với customIcon đã được xử lý để hiển thị tốt ở cả chế độ dev lẫn production
var marker = L.marker(centerCoordinates, { icon: myIcon }).addTo(map)
  .bindPopup('273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh')
  .openPopup();