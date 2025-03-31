import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "dist",  // 빌드 결과를 dist/ 폴더에 저장
    rollupOptions: {
      input: 'index.html',  //
    }
  }
});
