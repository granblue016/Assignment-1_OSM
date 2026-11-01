// src/main.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

async function loadMapConfig() {
  try {
    const mapKey = 'hcm-map';
    // Gọi API lấy cấu hình từ Netlify Backend kèm query chống cache
    const response = await fetch(`https://assignment3-thumbnails.netlify.app/api/config/${mapKey}?t=` + Date.now());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const config = await response.json();

    let firstActiveIndex = config.baseLayers.findIndex(
      item => item.active === true || item.active === 'true' || item.active === 1
    );
    if (firstActiveIndex === -1) firstActiveIndex = 0;

    // 🔥 Domain gốc của Netlify chứa API và kho lưu trữ Thumbnail
    const netlifyDomain = 'https://assignment3-thumbnails.netlify.app';

    initLayerSwitcherMap({
      mapContainerId: 'map',
      basemapContainerId: 'basemap-container',
      overlayContainerId: 'overlay-container',
      centerCoordinates: config.center,
      zoom: config.zoom,
      baseLayerData: config.baseLayers.map((item, index) => {
        let thumbUrl = item.thumbnailUrl || item.iconUrl || '';
        
        // Nếu là đường dẫn tương đối (bắt đầu bằng dấu /), tự động ghép domain Netlify vào phía trước
        if (thumbUrl.startsWith('/')) {
          thumbUrl = netlifyDomain + thumbUrl;
        }

        return {
          ...item,
          layer: L.tileLayer(item.layerUrl, { maxZoom: 19 }),
          defaultOn: index === firstActiveIndex,
          iconUrl: thumbUrl // Truyền link ảnh tuyệt đối chuẩn xác
        };
      }),
      myOverLay: config.overlays.map(item => ({
        url: item.wmsUrl,
        id: item.layers,
        name: item.name,
        defaultOn: item.active === true || item.active === 'true' || item.active === 1,
        // Xử lý tương tự cho icon của lớp phủ nếu là đường dẫn tương đối
        iconUrl: item.iconUrl && item.iconUrl.startsWith('/') ? netlifyDomain + item.iconUrl : item.iconUrl
      }))
    });
  } catch (error) {
    console.error("Lỗi tải cấu hình động từ API:", error);
  }
}

loadMapConfig();