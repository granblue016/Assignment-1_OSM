// src/main.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

let activeMapInstance = null;

// 🔥 Trỏ thẳng về cổng 4174 nơi SvelteKit server đang chạy API
const apiDomain = 'http://localhost:4174'; 

// 1. Tải danh sách tất cả các bản đồ từ SvelteKit Server
async function loadAvailableMaps(currentKey) {
  try {
    const res = await fetch(`${apiDomain}/api/configs`);
    const data = await res.json();
    
    const selector = document.getElementById('map-selector');
    if (!selector) return;

    if (data.success && data.configs && data.configs.length > 0) {
      selector.innerHTML = data.configs.map(m => `
        <option value="${m.key}" ${m.key === currentKey ? 'selected' : ''}>${m.title || m.key}</option>
      `).join('');

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

// 2. Tải cấu hình chi tiết của 1 bản đồ cụ thể
async function loadMapConfig(mapKey) {
  try {
    console.log(`Đang tải cấu hình bản đồ: ${mapKey}`);

    const response = await fetch(`${apiDomain}/api/config/${mapKey}?t=` + Date.now());
    if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

    const config = await response.json();

    let firstActiveIndex = config.baseLayers.findIndex(
      item => item.active === true || item.active === 'true' || item.active === 1
    );
    if (firstActiveIndex === -1) firstActiveIndex = 0;

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
          thumbUrl = apiDomain + thumbUrl;
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
        iconUrl: item.iconUrl && item.iconUrl.startsWith('/') ? apiDomain + item.iconUrl : item.iconUrl
      }))
    });

    await loadAvailableMaps(mapKey);

  } catch (error) {
    console.error("Lỗi tải chi tiết bản đồ:", error);
    alert(`Không thể tải bản đồ "${mapKey}".`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialMapKey = urlParams.get('map') || 'hcm-map';

  loadMapConfig(initialMapKey);
});