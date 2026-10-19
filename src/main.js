import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

// Sửa lỗi mất hình marker trên Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const centerCoordinates = [10.780074, 106.6876522];

// 1. Khai báo các lớp bản đồ nền
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var satelliteBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri'
});

// 2. Khởi tạo bản đồ với lớp mặc định là osm
var map = L.map('map', {
  center: centerCoordinates,
  zoom: 13,
  layers: [osm]
});

// Khai báo biến lưu layer hiện tại (QUAN TRỌNG: để không bị lỗi undefined)
let currentLayer = osm;

// Thêm Marker mặc định
var marker = L.marker(centerCoordinates)
  .bindPopup('273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh')
  .addTo(map);

// 3. Mảng dữ liệu lớp phủ (Overlays)
var myOverLay = [
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms',
    id: 'khituong_thuyvan_2024:diemquantrackhituong',
    name: 'DiemQuanTracKhiTuong',
    defaultOn: true,
    iconUrl: './public/1.jpg'
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms',
    id: 'khituong_thuyvan_2024:diemquantracthuyvan',
    name: 'DiemQuanTracThuyVan',
    defaultOn: false,
    iconUrl: './public/2.png'
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:caylaunam',
    name: 'Cây lâu năm',
    defaultOn: false,
    iconUrl: './public/3.jpg'
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:bematcongtrinh',
    name: 'Bề mặt công trình',
    defaultOn: false,
    iconUrl: './public/4.png'
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:bematkhudancu',
    name: 'Bề mặt khu dân cư',
    defaultOn: false,
    iconUrl: './public/5.png'
  },
  /// --- Các lớp của locahost
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:cafe_q3_points',
  //   name: '☕ Quán Cà Phê (Điểm)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:bookstore_q3_points',
  //   name: '📚 Nhà Sách (Điểm)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:bookstore_q3_polygon',
  //   name: '🏢 Nhà Sách (Vùng)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:park_points',
  //   name: '🌳 Công Viên (Điểm)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:park_polygon',
  //   name: '🏞️ Công Viên (Vùng)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:hospital_points',
  //   name: '🏥 Cơ Sở Y Tế (Điểm)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:hospital_polygon',
  //   name: '🏥 Bệnh Viện (Vùng)',
  //   defaultOn: false
  // },
  // {
  //   url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
  //   id: 'tphcm_layer:bus_points',
  //   name: '🚌 Trạm Xe Buýt (Điểm)',
  //   defaultOn: false
  // },
  {
    url: 'http://localhost:8080/geoserver/tphcm_layer/wms',
    id: 'tphcm_layer:bus_polygon',
    name: '🚏 Bến Xe Buýt (Vùng)',
    defaultOn: false
  }
];

// 4. Render danh sách lớp phủ tự động ra HTML
const overlayContainer = document.getElementById('overlay-container');
myOverLay.forEach((item, index) => {
  const wmsLayer = L.tileLayer.wms(item.url, {
    layers: item.id,
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: 'Sở TN&MT TP.HCM'
  });

  if (item.defaultOn) {
    wmsLayer.addTo(map);
  }

  const div = document.createElement('div');
  div.className = "flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer";
  div.innerHTML = `
    <input type="checkbox" id="overlay-${index}" ${item.defaultOn ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer">
    <img src="${item.iconUrl}" class="w-6 h-6 rounded object-cover" />
    <span class="font-medium text-gray-700 select-none">${item.name}</span>
  `;

  overlayContainer.appendChild(div);

  const checkbox = div.querySelector(`#overlay-${index}`);
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      map.addLayer(wmsLayer);
    } else {
      map.removeLayer(wmsLayer);
    }
  });
});

// 5. Xử lý sự kiện chuyển đổi bản đồ nền (Đặt ở ngoài vòng lặp)
const cardOsm = document.getElementById('card-osm');
const cardSatellite = document.getElementById('card-satellite');
const imgOsm = document.getElementById('img-osm');
const imgSatellite = document.getElementById('img-satellite');

cardOsm.addEventListener('click', () => {
  map.removeLayer(currentLayer);
  currentLayer = osm;
  currentLayer.addTo(map);

  imgOsm.className = 'w-7 h-7 rounded border-2 border-blue-500 object-cover';
  imgSatellite.className = 'w-7 h-7 rounded border-2 border-transparent object-cover';
});

cardSatellite.addEventListener('click', () => {
  map.removeLayer(currentLayer);
  currentLayer = satelliteBasemap;
  currentLayer.addTo(map);

  imgSatellite.className = 'w-7 h-7 rounded border-2 border-green-500 object-cover';
  imgOsm.className = 'w-7 h-7 rounded border-2 border-transparent object-cover';
});