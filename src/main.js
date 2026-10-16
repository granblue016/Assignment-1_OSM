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



var myOverLay = [
  {
    url: 'http://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms',
    id: '	khituong_thuyvan_2024:diemquantrackhituong',
    name: 'DiemQuanTracKhiTuong',
    defaultOn: false
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/khituong_thuyvan_2024/wms',
    id: '	khituong_thuyvan_2024:diemquantracthuyvan',
    name: 'DiemQuanTracThuyVan',
    defaultOn: false
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: '	dulieunen:caylaunam',
    name: 'Cây lâu năm',
    defaultOn: false
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:bematcongtrinh',
    name: 'Bề mặt công trình',
    defaultOn: false
  },
  {
    url: 'https://geodata-stnmt.tphcm.gov.vn/geoserver/dulieunen/wms',
    id: 'dulieunen:bematkhudancu',
    name: 'Bề mặt khu dân cư',
    defaultOn: false
  },
  {
    url: 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/wms',
    id: 'tphcm_layer:☕ Quán Cà Phê (Vùng)',
    name: '☕ Quán Cà Phê (Vùng)',
    defaultOn: false
  }
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

var marker = L.marker(centerCoordinates)
  .bindPopup('273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh')
layerControl.addOverlay(marker, 'Marker');
// marker.addTo(map);

// Sửa 'my_workspace' thành 'tphcm_layer' (hoặc đúng workspace thực tế trên GeoServer của bạn)
var wfsUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:cafe_q3_points&outputFormat=application/json';

fetch(wfsUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS từ GeoServer');
    return response.json();
  })
  .then(data => {
    var cafePointsLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {

        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: '#D35400',
          color: '#FFFFFF',
          weight: 2,
          fillOpacity: 0.9
        });

      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Quán cà phê';
        var address = feature.properties['addr:street'] ? `, ${feature.properties['addr:street']}` : '';
        layer.bindPopup(`<b>☕ ${name}</b>${address}`);
      }
    });

    // cafePointsLayer.addTo(map);
    layerControl.addOverlay(cafePointsLayer, '☕ Quán Cà Phê (Điểm)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS:', error);
  });

// ==========================================
// 1. FETCH LỚP NHÀ SÁCH DẠNG ĐIỂM (Points)
// ==========================================
var bookstorePointsUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:bookstore_q3_points&outputFormat=application/json';

fetch(bookstorePointsUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS nhà sách (Điểm)');
    return response.json();
  })
  .then(data => {
    var bookstorePointsLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: '#2980B9', // Màu xanh dương cho nhà sách
          color: '#FFFFFF',     // Viền trắng
          weight: 2,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Nhà sách';
        var address = feature.properties['addr:street'] ? `, ${feature.properties['addr:street']}` : '';
        layer.bindPopup(`<b>📚 ${name}</b>${address}`);
      }
    });

    // bookstorePointsLayer.addTo(map);
    layerControl.addOverlay(bookstorePointsLayer, '📚 Nhà Sách (Điểm)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS nhà sách điểm:', error);
  });


// ==========================================
// 2. FETCH LỚP NHÀ SÁCH DẠNG VÙNG (Polygon)
// ==========================================
var bookstorePolygonUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:bookstore_q3_polygon&outputFormat=application/json';

fetch(bookstorePolygonUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS nhà sách (Vùng)');
    return response.json();
  })
  .then(data => {
    var bookstorePolygonLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          color: '#2980B9',     // Màu viền của vùng
          weight: 2,
          fillColor: '#3498DB', // Màu nền bên trong vùng
          fillOpacity: 0.4      // Độ trong suốt để không che mất bản đồ nền
        };
      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Khu vực / Tòa nhà nhà sách';
        layer.bindPopup(`<b>🏢 ${name} (Vùng)</b>`);
      }
    });

    // bookstorePolygonLayer.addTo(map);
    layerControl.addOverlay(bookstorePolygonLayer, '🏢 Nhà Sách (Vùng)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS nhà sách vùng:', error);
  });

// ==========================================
// 1. FETCH LỚP CÔNG VIÊN DẠNG ĐIỂM (Points)
// ==========================================
var parkPointsUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:park_points&outputFormat=application/json';

fetch(parkPointsUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS công viên (Điểm)');
    return response.json();
  })
  .then(data => {
    var parkPointsLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: '#27AE60', // Màu xanh lá cho công viên
          color: '#FFFFFF',     // Viền trắng
          weight: 2,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Công viên';
        var address = feature.properties['addr:street'] ? `, ${feature.properties['addr:street']}` : '';
        layer.bindPopup(`<b>🌳 ${name}</b>${address}`);
      }
    });

    // parkPointsLayer.addTo(map);
    layerControl.addOverlay(parkPointsLayer, '🌳 Công Viên (Điểm)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS công viên điểm:', error);
  });


// ==========================================
// 2. FETCH LỚP CÔNG VIÊN DẠNG VÙNG (Polygon)
// ==========================================
var parkPolygonUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:park_polygon&outputFormat=application/json';

fetch(parkPolygonUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS công viên (Vùng)');
    return response.json();
  })
  .then(data => {
    var parkPolygonLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          color: '#27AE60',     // Màu viền xanh lá
          weight: 2,
          fillColor: '#2ECC71', // Màu nền bên trong
          fillOpacity: 0.4      // Độ trong suốt vừa phải
        };
      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Khu vực công viên';
        layer.bindPopup(`<b>🏞️ ${name} (Vùng)</b>`);
      }
    });

    // parkPolygonLayer.addTo(map);
    layerControl.addOverlay(parkPolygonLayer, '🏞️ Công Viên (Vùng)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS công viên vùng:', error);
  });

// ==========================================
// 1. FETCH LỚP Y TẾ DẠNG ĐIỂM (Points)
// ==========================================
var hospitalPointsUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:hospital_points&outputFormat=application/json';

fetch(hospitalPointsUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS y tế (Điểm)');
    return response.json();
  })
  .then(data => {
    var hospitalPointsLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: '#E74C3C', // Màu đỏ đặc trưng ngành Y tế
          color: '#FFFFFF',     // Viền trắng
          weight: 2,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Cơ sở y tế / Nhà thuốc';
        var type = feature.properties.amenity === 'pharmacy' ? '💊 Nhà thuốc' : '🏥 Cơ sở y tế';
        var address = feature.properties['addr:street'] ? `, ${feature.properties['addr:street']}` : '';
        layer.bindPopup(`<b>${type}: ${name}</b>${address}`);
      }
    });

    // hospitalPointsLayer.addTo(map);
    layerControl.addOverlay(hospitalPointsLayer, '🏥 Cơ Sở Y Tế (Điểm)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS y tế điểm:', error);
  });


// ==========================================
// 2. FETCH LỚP Y TẾ DẠNG VÙNG (Polygon - Bệnh viện lớn)
// ==========================================
var hospitalPolygonUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:hospital_polygon&outputFormat=application/json';

fetch(hospitalPolygonUrl)
  .then(response => {
    if (!response.ok) throw new Error('Không thể tải dữ liệu WFS y tế (Vùng)');
    return response.json();
  })
  .then(data => {
    var hospitalPolygonLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          color: '#C0392B',     // Viền đỏ đậm
          weight: 2,
          fillColor: '#E74C3C', // Nền đỏ nhạt
          fillOpacity: 0.4
        };
      },
      onEachFeature: function (feature, layer) {
        var name = feature.properties.name || 'Khu vực Bệnh viện';
        layer.bindPopup(`<b>🏥 ${name} (Khuôn viên)</b>`);
      }
    });

    // hospitalPolygonLayer.addTo(map);
    layerControl.addOverlay(hospitalPolygonLayer, '🏥 Bệnh Viện (Vùng)');
  })
  .catch(error => {
    console.error('Lỗi khi tải WFS y tế vùng:', error);
  });


// ==========================================
// 1. FETCH LỚP TRẠM XE BUÝT DẠNG ĐIỂM (Points) - Mặc định tắt
// ==========================================
var busPointsUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:bus_points&outputFormat=application/json';

fetch(busPointsUrl)
    .then(response => {
        if (!response.ok) throw new Error('Không thể tải dữ liệu WFS trạm xe buýt (Điểm)');
        return response.json();
    })
    .then(data => {
        var busPointsLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 7,
                    fillColor: '#E67E22', // Tông màu cam đặc trưng giao thông/xe buýt
                    color: '#FFFFFF',     // Viền trắng sắc nét
                    weight: 2,
                    fillOpacity: 0.9
                });
            },
            onEachFeature: function (feature, layer) {
                var name = feature.properties.name || 'Trạm xe buýt';
                var address = feature.properties['addr:street'] ? `, ${feature.properties['addr:street']}` : '';
                layer.bindPopup(`<b>🚌 ${name}</b>${address}`);
            }
        });

        // Chỉ đưa vào Layer Control, không gọi .addTo(map) để mặc định không hiện lên bản đồ
        layerControl.addOverlay(busPointsLayer, '🚌 Trạm Xe Buýt (Điểm)');
    })
    .catch(error => {
        console.error('Lỗi khi tải WFS trạm xe buýt điểm:', error);
    });


// ==========================================
// 2. FETCH LỚP BẾN XE BUÝT DẠNG VÙNG (Polygon) - Mặc định tắt
// ==========================================
var busPolygonUrl = 'https://eleven-ears-act.loca.lt/geoserver/tphcm_layer/ows?service=WFS&version=1.0.0&request=GetFeature&typename=tphcm_layer:bus_polygon&outputFormat=application/json';

fetch(busPolygonUrl)
    .then(response => {
        if (!response.ok) throw new Error('Không thể tải dữ liệu WFS bến xe buýt (Vùng)');
        return response.json();
    })
    .then(data => {
        var busPolygonLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: '#D35400',     // Viền cam đậm
                    weight: 2,
                    fillColor: '#E67E22', // Nền cam sáng
                    fillOpacity: 0.4      // Độ trong suốt vừa phải
                };
            },
            onEachFeature: function (feature, layer) {
                var name = feature.properties.name || 'Khu vực bến xe buýt';
                layer.bindPopup(`<b>🚏 ${name} (Khu vực)</b>`);
            }
        });

        // Chỉ đưa vào Layer Control, không gọi .addTo(map) để mặc định không hiện lên bản đồ
        layerControl.addOverlay(busPolygonLayer, '🚏 Bến Xe Buýt (Vùng)');
    })
    .catch(error => {
        console.error('Lỗi khi tải WFS bến xe buýt vùng:', error);
    });