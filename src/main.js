// src/main.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

let activeMapInstance = null;
const netlifyDomain = 'https://assignment3-thumbnails.netlify.app';

// 1. Tải danh sách tất cả các bản đồ từ Backend Netlify để đưa vào Dropdown
async function loadAvailableMaps(currentKey) {
  try {
    const res = await fetch(`${netlifyDomain}/api/configs`);
    const data = await res.json();
    
    const selector = document.getElementById('map-selector');
    if (!selector) return;

    // Khớp với mảng 'configs' trả về từ file +server.js của bạn
    if (data.success && data.configs && data.configs.length > 0) {
      selector.innerHTML = data.configs.map(m => `
        <option value="${m.key}" ${m.key === currentKey ? 'selected' : ''}>${m.title || m.key}</option>
      `).join('');

      // Lắng nghe sự kiện khi người dùng chọn map khác trên dropdown
      selector.onchange = (e) => {
        const selectedKey = e.target.value;
        const newUrl = `${window.location.pathname}?map=${selectedKey}`;
        window.history.pushState({ map: selectedKey }, '', newUrl);
        loadMapConfig(selectedKey);
      };
    } else {
      selector.innerHTML = `<option value="${currentKey}">Mặc định (${currentKey})</option>`;
    }
  } catch (error) {
    console.error("Không thể tải danh sách map từ server:", error);
  }
}

// 2. Tải cấu hình chi tiết của 1 bản đồ cụ thể và render Leaflet
async function loadMapConfig(mapKey) {
  try {
    console.log(`Đang tải cấu hình bản đồ: ${mapKey}`);

    const response = await fetch(`${netlifyDomain}/api/config/${mapKey}?t=` + Date.now());
    if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

    const config = await response.json();

    let firstActiveIndex = config.baseLayers.findIndex(
      item => item.active === true || item.active === 'true' || item.active === 1
    );
    if (firstActiveIndex === -1) firstActiveIndex = 0;

    // Dọn dẹp bản đồ cũ trước khi render bản đồ mới để tránh lỗi trùng lặp container
    if (activeMapInstance) {
      activeMapInstance.remove();
      activeMapInstance = null;
    }

    activeMapInstance = initLayerSwitcherMap({
      mapContainerId: 'map',
      basemapContainerId: 'basemap-container',
      overlayContainerId: 'overlay-container',
      centerCoordinates: config.center,
      zoom: config.zoom,
      baseLayerData: config.baseLayers.map((item, index) => {
        let thumbUrl = item.thumbnailUrl || item.iconUrl || '';
        if (thumbUrl.startsWith('/')) {
          thumbUrl = netlifyDomain + thumbUrl;
        }

        return {
          ...item,
          layer: L.tileLayer(item.layerUrl, { maxZoom: 19 }),
          defaultOn: index === firstActiveIndex,
          iconUrl: thumbUrl
        };
      }),
      myOverLay: config.overlays.map(item => ({
        url: item.wmsUrl,
        id: item.layers,
        name: item.name,
        defaultOn: item.active === true || item.active === 'true' || item.active === 1,
        iconUrl: item.iconUrl && item.iconUrl.startsWith('/') ? netlifyDomain + item.iconUrl : item.iconUrl
      }))
    });

  } catch (error) {
    console.error("Lỗi tải chi tiết bản đồ:", error);
    alert(`Không thể tải bản đồ "${mapKey}".`);
  }
}

// 🚀 Khởi chạy hệ thống khi trang sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialMapKey = urlParams.get('map') || 'hcm-map';

  loadAvailableMaps(initialMapKey);
  loadMapConfig(initialMapKey);
});