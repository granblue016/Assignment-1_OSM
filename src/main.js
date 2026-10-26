import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

async function loadMapConfig() {
  try {
    const response = await fetch('https://assignment-2-map-configuration-page.netlify.app/api/config?t=' + Date.now());
    // const response = await fetch('http://localhost:4173/api/config?t=' + Date.now());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const config = await response.json();

    // Đảm bảo chỉ có DUY NHẤT 1 baseLayer được active (phòng hờ dữ liệu cũ chưa kịp chuẩn hóa)
    let firstActiveIndex = config.baseLayers.findIndex(item => item.active === true || item.active === 'true');
    if (firstActiveIndex === -1) firstActiveIndex = 0; // Nếu không có cái nào active, lấy cái đầu tiên

    initLayerSwitcherMap({
      mapContainerId: 'map',
      basemapContainerId: 'basemap-container',
      overlayContainerId: 'overlay-container',
      centerCoordinates: config.center,
      zoom: config.zoom,
      baseLayerData: config.baseLayers.map((item, index) => ({
        ...item,
        layer: L.tileLayer(item.layerUrl, { maxZoom: 19 }),
        // Chỉ cho phép đúng 1 layer duy nhất được bật mặc định
        defaultOn: index === firstActiveIndex,
        iconUrl: item.iconUrl || item.thumbnailUrl
      })),
      myOverLay: config.overlays.map(item => ({
        url: item.wmsUrl,
        id: item.layers,
        name: item.name,
        defaultOn: item.active === true || item.active === 'true',
        iconUrl: item.iconUrl
      }))
    });
  } catch (error) {
    console.error("Lỗi tải cấu hình từ API Bài 4:", error);
  }
}

loadMapConfig();