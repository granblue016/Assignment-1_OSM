// src/main.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

let activeMapInstance = null;

// Cấu hình domain của SvelteKit server (cổng 4174)
const apiDomain = 'https://assigment4-bai6-icon.netlify.app/'; 
// const apiDomain = 'http://localhost:4174'; 
// src/main.js
// Thay vì dùng cố định http://localhost:4174, hãy dùng window.location.origin để tự động bắt đúng domain khi deploy
// const apiDomain = typeof window !== 'undefined' ? window.location.origin : '';

// Tải cấu hình chi tiết của bản đồ cố định 'hcm-map' và render Leaflet
async function loadMapConfig() {
  const mapKey = 'hcm-map'; // Cố định key theo yêu cầu của mentor
  try {
    console.log(`Đang tải cấu hình bản đồ: ${mapKey}`);

    const response = await fetch(`${apiDomain}/api/config/${mapKey}?t=` + Date.now());
    if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

    const config = await response.json();

    // 1. Hiển thị Tên bản đồ lên giao diện (tìm thẻ có id="map-title")
    const titleElement = document.getElementById('map-title');
    if (titleElement) {
      titleElement.textContent = config.title || 'Bản đồ Thành phố Hồ Chí Minh';
    }

    // 2. Hiển thị Logo bản đồ lên giao diện (tìm thẻ có id="map-logo")
    const logoElement = document.getElementById('map-logo');
    if (logoElement && config.logoUrl) {
      logoElement.src = config.logoUrl.startsWith('/') ? apiDomain + config.logoUrl : config.logoUrl;
      logoElement.style.display = 'block';
    }

    let firstActiveIndex = config.baseLayers.findIndex(
      item => item.active === true || item.active === 'true' || item.active === 1
    );
    if (firstActiveIndex === -1) firstActiveIndex = 0;

    // Dọn dẹp bản đồ cũ trước khi render bản đồ mới để tránh lỗi container
    if (activeMapInstance) {
      activeMapInstance.remove();
      activeMapInstance = null;
    }

    // 3. Khởi tạo bản đồ với các lớp nền và thumbnail từ hệ thống quản lý
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
          iconUrl: thumbUrl // Thumbnail lấy từ MinIO qua API quản lý
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

  } catch (error) {
    console.error("Lỗi tải chi tiết bản đồ:", error);
    alert(`Không thể tải bản đồ "${mapKey}".`);
  }
}

// 🚀 Khởi chạy hệ thống ngay khi trang sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  loadMapConfig();
});