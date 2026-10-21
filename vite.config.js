import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  base: '/Assignment-1_OSM/',
  server: {
    port: 5173,      
    strictPort: true 
  },
  preview: {          // <--- Thêm khối này để cố định port cho lệnh preview
    port: 5173,       // Hoặc đổi thành port khác nếu 4173 bị chiếm
    strictPort: true
  }
});