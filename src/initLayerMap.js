import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';

// Fix icon marker mặc định Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function initLayerSwitcherMap(options = {}) {
  const {
    mapContainerId = 'map',
    controlPanelId = 'map-control', // Thẻ cha duy nhất trong HTML để chứa toàn bộ Menu
    centerCoordinates = [10.780074, 106.6876522],
    zoom = 8,
    markerInfo = {
      coords: [10.780074, 106.6876522],
      popupText: 'Trung tâm Khoa học và Công nghệ - 273 Điện Biên Phủ'
    },
    baseLayerData = [],
    myOverLay = []
  } = options;

  // 1. Khởi tạo bản đồ Leaflet
  const defaultBaseItem = baseLayerData.find(item => item.defaultOn) || baseLayerData[0];
  let currentLayer = defaultBaseItem ? defaultBaseItem.layer : null;

  const map = L.map(mapContainerId, {
    center: centerCoordinates,
    zoom: zoom,
    layers: currentLayer ? [currentLayer] : []
  });

  if (markerInfo) {
    L.marker(markerInfo.coords).bindPopup(markerInfo.popupText).addTo(map);
  }

  // 2. TỰ ĐỘNG DỰNG KHUNG HTML CHO MENU ĐIỀU KHIỂN
  const controlParent = document.getElementById(controlPanelId);
  if (controlParent) {
    // Tự sinh cấu trúc HTML bên trong thẻ cha
    controlParent.innerHTML = `
      <div class="font-bold mb-1.5 text-gray-500">Bản đồ nền</div>
      <div id="basemap-container" class="flex flex-col gap-1"></div>

      <div class="border-t border-gray-400 pt-1.5 mt-2">
        <div class="font-bold mb-1 text-gray-500">Lớp phủ</div>
        <div id="overlay-container" class="flex flex-col gap-1"></div>
      </div>
    `;
  } else {
    console.warn(`Không tìm thấy thẻ #${controlPanelId}, sẽ tìm thẻ #basemap-container và #overlay-container có sẵn.`);
  }

  const basemapContainer = document.getElementById('basemap-container');
  const overlayContainer = document.getElementById('overlay-container');

  // 3. Render Lớp Nền (Base Layers)
  if (basemapContainer) {
    baseLayerData.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 transition-all 
        ${item.defaultOn ? 'bg-blue-50/50 border-2 border-blue-500' : 'border-2 border-transparent'}`;
      
      div.innerHTML = `
        <img src="${item.iconUrl}" class="w-10 h-10 rounded border border-gray-200 object-cover flex-shrink-0" />
        <span class="font-medium text-gray-700 text-xs">${item.name}</span>
      `;

      basemapContainer.appendChild(div);

      div.addEventListener('click', () => {
        if (map.hasLayer(currentLayer)) {
          map.removeLayer(currentLayer);
        }
        currentLayer = item.layer;
        currentLayer.addTo(map);
        currentLayer.bringToBack();

        basemapContainer.querySelectorAll('div').forEach(el => {
          el.className = "flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 border-2 border-transparent transition-all";
        });
        div.className = "flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 border-2 border-blue-500 bg-blue-50/50 transition-all";
      });
    });
  }

  // 4. Render Lớp Phủ (Overlays)
  if (overlayContainer) {
    myOverLay.forEach((item, index) => {
      const wmsLayer = L.tileLayer.wms(item.url, {
        layers: item.id.trim(), // Xóa khoảng trắng thừa trong id
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'Mekong Open Development',
      });

      if (item.defaultOn) {
        wmsLayer.addTo(map);
      }

      const div = document.createElement('div');
      div.className = "flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer";
      div.innerHTML = `
        <input type="checkbox" id="overlay-${index}" ${item.defaultOn ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer flex-shrink-0">
        <img src="${item.iconUrl}" class="w-6 h-6 rounded object-cover flex-shrink-0" />
        <span class="font-medium text-gray-700 select-none text-xs">${item.name.trim()}</span>
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
  }

  return map;
}