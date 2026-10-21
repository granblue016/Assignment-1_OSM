import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

// // // Sửa lỗi mất hình marker trên Leaflet
// // delete L.Icon.Default.prototype._getIconUrl;
// // L.Icon.Default.mergeOptions({
// //   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
// //   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
// //   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// // });

// // const centerCoordinates = [10.780074, 106.6876522];


// // const baseLayerData = [
// //   {
// //     name: 'OpenStreetMap',
// //     layer: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
// //   maxZoom: 19,
// //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// // }),
// //     iconUrl: 'https://tile.openstreetmap.org/12/3262/1925.png',
// //     defaultOn: true
// //   },
// //   {
// //     name: 'Vệ tinh',
// //     layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
// //       maxZoom: 19,
// //       attribution: 'Tiles &copy; Esri'
// //     }),
// //     iconUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/1925/3262.png',
// //     defaultOn: false
// //   }
// // ];
// // const basemapContainer = document.getElementById('basemap-container');



// // let currentLayer = baseLayerData.find(item => item.defaultOn).layer;

// // var map = L.map('map', {
// //   center: centerCoordinates,
// //   zoom: 8,
// //   layers: currentLayer
// // });

// // // Thêm Marker mặc định
// // var marker = L.marker(centerCoordinates)
// //   .bindPopup('273 Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh')
// //   .addTo(map);

// // // 3. Mảng dữ liệu lớp phủ (Overlays)
// // var myOverLay = [
// //   {
// //     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
// //     id: '	ODVietnam:Khu bao ton',
// //     name: '	Khu bảo tồn quốc gia Việt Nam',
// //     defaultOn: true,
// //     iconUrl: './1.jpg'
// //   },
// //   {
// //     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
// //     id: '	ODVietnam:Flood_frequency-contour',
// //     name: '	Tuần suât lũ lụt',
// //     defaultOn: false,
// //     iconUrl: './2.jpg'
// //   },
// //   {
// //     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
// //     id: 'ODVietnam:10453931-345b-40fb-adc0-35eca5831381',
// //     name: 'Covid-19',
// //     defaultOn: false,
// //     iconUrl: './3.png'
// //   },
// //   {
// //     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
// //     id: 'ODVietnam:World Heritage Site of Vietnam (V.vietnamese)',
// //     name: 'Danh sách di sản thế giới tại Việt Nam',
// //     defaultOn: false,
// //     iconUrl: './4.webp'
// //   },
// //   {
// //     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
// //     id: 'ODVietnam:World_bank_aid_vn',
// //     name: '	Các dự án hộ trợ của ngân hàng thế giới tại Việt Nam',
// //     defaultOn: false,
// //     iconUrl: './5.png'
// //   },
// // ];

// // baseLayerData.forEach((item, index) => {
// //   const div = document.createElement('div');
// //   div.className = `flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 
// //     ${item.defaultOn ? 'bg-blue-50/50 border-2 border-blue-500' : 'border-2 border-transparent'}`;
// //   div.innerHTML = `<img id="img-${index}" src="${item.iconUrl}"
// //         class="w-10 h-10 rounded border-2 border-transparent object-cover" />
// //       <span class="font-medium text-gray-700">${item.name}</span>`

// //   basemapContainer.appendChild(div);

// //   div.addEventListener('click', () => {
// //     map.removeLayer(currentLayer);
// //     currentLayer = item.layer;
// //     currentLayer.addTo(map);

// //     currentLayer.bringToBack();


// //     document.querySelectorAll('#basemap-container > div').forEach(el => {
// //       el.className = "flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 border-2 border-transparent";
// //     });
// //     div.className = "flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 border-2 border-blue-500 bg-blue-50/50";
// //   });
// // });


// // // 4. Render danh sách lớp phủ tự động ra HTML
// // const overlayContainer = document.getElementById('overlay-container');
// // myOverLay.forEach((item, index) => {
// //   const wmsLayer = L.tileLayer.wms(item.url, {
// //     layers: item.id,
// //     format: 'image/png',
// //     transparent: true,
// //     version: '1.1.0',
// //     attribution: 'Mekong Open Development',
// //   });

// //   if (item.defaultOn) {
// //     wmsLayer.addTo(map);
// //   }

// //   const div = document.createElement('div');
// //   div.className = "flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer";
// //   div.innerHTML = `
// //     <input type="checkbox" id="overlay-${index}" ${item.defaultOn ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer">
// //     <img src="${item.iconUrl}" class="w-6 h-6 rounded object-cover" />
// //     <span class="font-medium text-gray-700 select-none">${item.name}</span>
// //   `;

// //   overlayContainer.appendChild(div);

// //   const checkbox = div.querySelector(`#overlay-${index}`);
// //   checkbox.addEventListener('change', (e) => {
// //     if (e.target.checked) {
// //       map.addLayer(wmsLayer);
// //     } else {
// //       map.removeLayer(wmsLayer);
// //     }
// //   });
// // });

// import L from 'leaflet';
// import { initLayerSwitcherMap } from './initLayerMap.js';

// // Khởi tạo và truyền tham số cấu hình vào
// initLayerSwitcherMap({
//   mapContainerId: 'map',
//   basemapContainerId: 'basemap-container',
//   overlayContainerId: 'overlay-container',
//   centerCoordinates: [10.780074, 106.6876522],
//   zoom: 8,
//   markerInfo: {
//     coords: [10.780074, 106.6876522],
//     popupText: 'Trung tâm Khoa học và Công nghệ - 273 Điện Biên Phủ'
//   },
//   baseLayerData: [
//     {
//       name: 'OpenStreetMap',
//       layer: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }),
//       iconUrl: 'https://tile.openstreetmap.org/12/3262/1925.png',
//       defaultOn: true
//     },
//     {
//       name: 'Vệ tinh',
//       layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
//       iconUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/1925/3262.png',
//       defaultOn: false
//     }
//   ],
//   myOverLay: [
//     {
//     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
//     id: '	ODVietnam:Khu bao ton',
//     name: '	Khu bảo tồn quốc gia Việt Nam',
//     defaultOn: true,
//     iconUrl: './1.jpg'
//   },
//   {
//     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
//     id: '	ODVietnam:Flood_frequency-contour',
//     name: '	Tuần suât lũ lụt',
//     defaultOn: false,
//     iconUrl: './2.jpg'
//   },
//   {
//     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
//     id: 'ODVietnam:10453931-345b-40fb-adc0-35eca5831381',
//     name: 'Covid-19',
//     defaultOn: false,
//     iconUrl: './3.png'
//   },
//   {
//     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
//     id: 'ODVietnam:World Heritage Site of Vietnam (V.vietnamese)',
//     name: 'Danh sách di sản thế giới tại Việt Nam',
//     defaultOn: false,
//     iconUrl: './4.webp'
//   },
//   {
//     url: 'https://geoserver.opendevelopmentmekong.net/geoserver/ODVietnam/wms',
//     id: 'ODVietnam:World_bank_aid_vn',
//     name: '	Các dự án hộ trợ của ngân hàng thế giới tại Việt Nam',
//     defaultOn: false,
//     iconUrl: './5.png'
//   },
//   ]
// });


async function loadMapConfig() {
  try {
    // Trỏ thẳng về domain/port của SvelteKit (Bài 4)
    const response = await fetch('http://localhost:5175/api/config');
      
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const config = await response.json();

    initLayerSwitcherMap({
      mapContainerId: 'map',
      basemapContainerId: 'basemap-container',
      overlayContainerId: 'overlay-container',
      centerCoordinates: config.center,
      zoom: config.zoom,
      baseLayerData: config.baseLayers.map((item, index) => ({
        ...item,
        layer: L.tileLayer(item.layerUrl, { maxZoom: 19 }),
        defaultOn: item.active ?? (index === 0), // Nếu có active thì dùng, ko thì lấy phần tử đầu tiên làm mặc định
        iconUrl: item.iconUrl || item.thumbnailUrl // Hỗ trợ cả 2 tên trường từ backend
      })),
      myOverLay: config.overlays.map(item => ({
        url: item.wmsUrl,
        id: item.layers,
        name: item.name,
        defaultOn: item.active,
        iconUrl: item.iconUrl
      }))
    });
  } catch (error) {
    console.error("Lỗi tải cấu hình từ API Bài 4:", error);
  }
}

loadMapConfig();