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

const centerCoordinates = [10.780074, 106.6876522];



var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Khai báo lớp bản đồ nền vệ tinh (Satellite)
var satelliteBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-eGP, and the GIS User Community'
});

var map = L.map('map', {
    center: centerCoordinates,
    zoom: 13,
    layers: [osm, satelliteBasemap]
});



var baseMaps = {
    "OpenStreetMap": osm,
    "Satellite": satelliteBasemap
};

var marker = L.marker(centerCoordinates).addTo(map)
  .bindPopup('273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh')
  .openPopup();

var myOverLay = [
  { 
    url: 'http://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms',
    id: '	khituong_thuyvan_2024:diemquantrackhituong', 
    name: 'DiemQuanTracKhiTuong', 
    defaultOn: true },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms',
    id: '	khituong_thuyvan_2024:diemquantracthuyvan', 
    name: 'DiemQuanTracThuyVan', 
    defaultOn: false },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: '	dulieunen:caylaunam', 
    name: 'Cây lâu năm', 
    defaultOn: false },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:bematcongtrinh', 
    name: 'Bề mặt công trình', 
    defaultOn: false },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:bematkhudancu', 
    name: 'Bề mặt khu dân cư', 
    defaultOn: false }
]


var overlayMaps = {};

// const wmsUrl = 'http://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms';

myOverLay.forEach(item => {
    // Tạo WMS layer
    var wmsLayer = L.tileLayer.wms(item.url, {
        layers: item.id,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'Sở TN&MT TP.HCM'
    });

    // Nếu cấu hình defaultOn là true thì add thẳng lên bản đồ
    if (item.defaultOn) {
        wmsLayer.addTo(map);
    }

    // Đưa vào object overlayMaps (Key là tên hiển thị, Value là layer object)
    overlayMaps[item.name] = wmsLayer;
});

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

