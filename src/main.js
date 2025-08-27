import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './store'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用Pinia
  app.use(pinia)
  
  return {
    app,
    Pinia: pinia
  }
}