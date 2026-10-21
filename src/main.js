import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';


async function loadMapConfig() {
  try {
    // 1. Trỏ chính xác port 5173 (port mà Admin SvelteKit đang chạy) + timestamp chống cache
    const response = await fetch('https://assignment-2-map-configuration-page.netlify.app/api/config?t=' + Date.now());
      
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const config = await response.json();

    // 2. Gọi hàm khởi tạo bản đồ
    initLayerSwitcherMap({
      mapContainerId: 'map',
      basemapContainerId: 'basemap-container',
      overlayContainerId: 'overlay-container',
      centerCoordinates: config.center,
      zoom: config.zoom,
      baseLayerData: config.baseLayers.map((item, index) => ({
        ...item,
        layer: L.tileLayer(item.layerUrl, { maxZoom: 19 }),
        defaultOn: item.active === true || item.active === 'true' || index === 0,
        iconUrl: item.iconUrl || item.thumbnailUrl
      })),
      myOverLay: config.overlays.map(item => ({
        url: item.wmsUrl,
        id: item.layers,
        name: item.name,
        // Ép kiểu boolean chính xác tuyệt đối
        defaultOn: item.active === true || item.active === 'true',
        iconUrl: item.iconUrl
      }))
    });
  } catch (error) {
    console.error("Lỗi tải cấu hình từ API Bài 4:", error);
  }
}

loadMapConfig();