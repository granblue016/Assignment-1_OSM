// src/main.js
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './style.css';
import { initLayerSwitcherMap } from './initLayerMap.js';

async function loadMapConfig() {
  try {
    // 🔥 Lấy mapKey động từ URL Query (Ví dụ: ?map=hanoi-map). Nếu không có thì mặc định là 'hcm-map'
    const urlParams = new URLSearchParams(window.location.search);
    const mapKey = urlParams.get('map') || 'hcm-map';

    console.log(`Đang tải cấu hình cho bản đồ: ${mapKey}`);

    // Gọi API lấy cấu hình từ Netlify Backend theo mapKey động
    const response = await fetch(`https://assignment3-thumbnails.netlify.app/api/config/${mapKey}?t=` + Date.now());
    
    if (!response.ok) {
      throw new Error(`Không tìm thấy cấu hình cho mapKey: "${mapKey}" (HTTP status: ${response.status})`);
    }

    const config = await response.json();

    let firstActiveIndex = config.baseLayers.findIndex(
      item => item.active === true || item.active === 'true' || item.active === 1
    );
    if (firstActiveIndex === -1) firstActiveIndex = 0;

    const netlifyDomain = 'https://assignment3-thumbnails.netlify.app';

    initLayerSwitcherMap({
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
    console.error("Lỗi tải cấu hình động từ API:", error);
    alert("Không thể tải bản đồ. Vui lòng kiểm tra lại khóa (mapKey) trên URL!");
  }
}

loadMapConfig();