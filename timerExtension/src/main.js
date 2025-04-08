import { createApp } from 'vue'
import App from './popup.vue'
import './style.css'

if (import.meta.env.MODE === 'development') {
  import('./mocks/mockChrome.js');
}

createApp(App).mount('#app')
