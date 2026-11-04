// initLayerMap.js
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

export function initLayerSwitcherMap(options = {}) {
  const {
    mapContainerId = 'map',
    controlPanelId = 'map-control',
    centerCoordinates = [10.780074, 106.6876522],
    zoom = 8,
    markerInfo = {
      coords: [10.780074, 106.6876522],
      popupText: 'Sở Khoa học và Công nghệ - 273 Điện Biên Phủ'
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

  // Biến lưu trữ layer highlight hiện tại
  let highlightLayer = null;
  // const apiDomain = 'http://localhost:4174'; // Domain của SvelteKit server

  // initLayerMap.js
  // Đổi thành dynamic theo domain thực tế khi chạy trên trình duyệt
  // const apiDomain = typeof window !== 'undefined' ? window.location.origin : '';
  const apiDomain = 'https://assigment4-bai6-icon.netlify.app/';

  // 2. Dựng khung HTML cho Menu điều khiển & Nút Định vị
  const controlParent = document.getElementById(controlPanelId);
  if (controlParent) {
    controlParent.innerHTML = `
      <div class="font-bold mb-1.5 text-gray-500">Bản đồ nền</div>
      <div id="basemap-container" class="flex flex-col gap-1"></div>

      <div class="border-t border-gray-400 pt-1.5 mt-2">
        <div class="font-bold mb-1 text-gray-500">Lớp phủ</div>
        <div id="overlay-container" class="flex flex-col gap-1"></div>
      </div>

      <div class="border-t border-gray-400 pt-2 mt-3">
        <div class="font-bold mb-1 text-gray-500">Công cụ</div>
        <button id="locate-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer">
          📍 Định vị vị trí của tôi
        </button>
      </div>
    `;
  }

  const basemapContainer = document.getElementById('basemap-container');
  const overlayContainer = document.getElementById('overlay-container');

  // 3. Render Lớp Nền (Base Layers)
  if (basemapContainer) {
    basemapContainer.innerHTML = '';
    baseLayerData.forEach((item) => {
      const div = document.createElement('div');
      const isActive = item.defaultOn;

      div.className = `flex items-center gap-2 p-1 cursor-pointer rounded hover:bg-gray-50 transition-all 
        ${isActive ? 'bg-blue-50/50 border-2 border-blue-500' : 'border-2 border-transparent'}`;

      const imageSrc = item.iconUrl || item.thumbnailUrl || '';

      div.innerHTML = `
        <img src="${imageSrc}" class="w-10 h-10 rounded border border-gray-200 object-cover flex-shrink-0" />
        <span class="font-medium text-gray-700 text-xs">${item.name}</span>
      `;

      basemapContainer.appendChild(div);

      if (isActive) {
        currentLayer = item.layer;
        currentLayer.addTo(map);
        currentLayer.bringToBack();
      }

      div.addEventListener('click', () => {
        baseLayerData.forEach(b => {
          if (map.hasLayer(b.layer)) map.removeLayer(b.layer);
        });

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
  const overlayLayersMap = new Map();

  if (overlayContainer) {
    overlayContainer.innerHTML = '';

    myOverLay.forEach((item, index) => {
      const wmsLayer = L.tileLayer.wms(item.url, {
        layers: item.id.trim(),
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'Mekong Open Development',
      });

      if (item.defaultOn) {
        wmsLayer.addTo(map);
      }

      overlayLayersMap.set(item.id.trim(), {
        layer: wmsLayer,
        id: item.id.trim(),
        name: item.name,
        url: item.url,
        active: item.defaultOn
      });

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
        const overlayData = overlayLayersMap.get(item.id.trim());
        if (e.target.checked) {
          map.addLayer(wmsLayer);
          if (overlayData) overlayData.active = true;
        } else {
          map.removeLayer(wmsLayer);
          if (overlayData) overlayData.active = false;
        }
      });
    });
  }

  // 5. Hiển thị tọa độ con chuột theo thời gian thực
  const mapContainer = document.getElementById(mapContainerId) || map.getContainer();
  let coordsDiv = document.getElementById('map-mouse-coords');

  if (!coordsDiv && mapContainer) {
    if (window.getComputedStyle(mapContainer).position === 'static') {
      mapContainer.style.position = 'relative';
    }

    coordsDiv = document.createElement('div');
    coordsDiv.id = 'map-mouse-coords';
    mapContainer.appendChild(coordsDiv);
  }

  if (coordsDiv) {
    coordsDiv.className = 'map-mouse-coords';
    coordsDiv.textContent = 'Lat: --.----- | Long: --.-----';
  }

  map.on('mousemove', (e) => {
    if (coordsDiv) {
      const lat = e.latlng.lat.toFixed(5);
      const lng = e.latlng.lng.toFixed(5);
      coordsDiv.textContent = `Lat: ${lat} | Long: ${lng}`;
    }
  });

  const infoPanel = document.createElement('section');
  infoPanel.className = 'map-feature-info';
  infoPanel.hidden = true;
  infoPanel.setAttribute('aria-label', 'Thông tin đối tượng');
  infoPanel.innerHTML = `
    <div class="map-feature-info__header">
      <strong>Thông tin đối tượng</strong>
      <button class="map-feature-info__close" type="button" aria-label="Đóng thông tin">&times;</button>
    </div>
    <div class="map-feature-info__content"></div>
  `;
  mapContainer.appendChild(infoPanel);
  L.DomEvent.disableClickPropagation(infoPanel);
  L.DomEvent.disableScrollPropagation(infoPanel);

  const infoContent = infoPanel.querySelector('.map-feature-info__content');
  infoPanel.querySelector('.map-feature-info__close').addEventListener('click', () => {
    infoPanel.hidden = true;
  });

  // 6. Định vị vị trí người dùng (Geolocation)
  const locateBtn = document.getElementById('locate-btn');
  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
        return;
      }
      locateBtn.textContent = '⏳ Đang xác định vị trí...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          locateBtn.textContent = '📍 Định vị vị trí của tôi';
          map.setView([lat, lng], 16);
          L.marker([lat, lng]).addTo(map).bindPopup('<b>📍 Vị trí hiện tại của bạn</b>').openPopup();
        },
        () => {
          locateBtn.textContent = '📍 Định vị vị trí của tôi';
          alert('Không thể lấy được vị trí. Vui lòng cấp quyền truy cập vị trí.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // 7. GetFeatureInfo kết hợp Highlight đối tượng bằng GeoJSON khi Click
  map.on('click', async (e) => {
    const activeOverlays = Array.from(overlayLayersMap.values()).filter(item => map.hasLayer(item.layer));
    if (activeOverlays.length === 0) return;

    if (highlightLayer) {
      map.removeLayer(highlightLayer);
      highlightLayer = null;
    }

    const point = map.latLngToContainerPoint(e.latlng, map.getZoom());
    const size = map.getSize();
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;

    let panelContent = '';
    let hasContent = false;
    let firstGeometry = null;

    for (const item of activeOverlays) {
      const wmsGetFeatureInfoUrl = `${item.url}?` + new URLSearchParams({
        service: 'WMS',
        version: '1.1.0',
        request: 'GetFeatureInfo',
        layers: item.id,
        query_layers: item.id,
        styles: '',
        bbox: bbox,
        width: size.x,
        height: size.y,
        x: Math.round(point.x),
        y: Math.round(point.y),
        info_format: 'application/json'
      });

      const proxyUrl = `${apiDomain}/api/proxy?url=` + encodeURIComponent(wmsGetFeatureInfoUrl);

      try {
        const response = await fetch(proxyUrl);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            hasContent = true;
            if (!firstGeometry && data.features[0].geometry) {
              firstGeometry = data.features[0];
            }

            panelContent += `<section class="map-feature-info__layer"><strong>${escapeHtml(item.name)}</strong>`;

            const props = data.features[0].properties;
            if (props && Object.keys(props).length > 0) {
              let propsHtml = '<table><tbody>';
              for (const [key, val] of Object.entries(props)) {
                if (val !== null && val !== undefined && val !== '') {
                  propsHtml += `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(val)}</td></tr>`;
                }
              }
              propsHtml += '</tbody></table>';
              panelContent += propsHtml;
            } else {
              panelContent += '<p class="map-feature-info__empty">Không có thuộc tính chi tiết cho đối tượng này.</p>';
            }
            panelContent += '</section>';
          }
        }
      } catch (err) {
        console.warn(`Lỗi khi lấy GetFeatureInfo cho lớp ${item.name}:`, err);
      }
    }

    if (firstGeometry) {
      highlightLayer = L.geoJSON(firstGeometry, {
        style: {
          color: '#ef4444',
          weight: 4,
          opacity: 0.9,
          fillColor: '#fde047',
          fillOpacity: 0.4
        },
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#ef4444',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          });
        }
      }).addTo(map);
    }

    if (hasContent) {
      infoContent.innerHTML = panelContent;
      infoPanel.hidden = false;
    }
  });

  return map;
}