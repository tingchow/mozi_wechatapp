import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './store'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用Pinia
  app.use(pinia)
  
  // 使用uView Plus
  app.use(uviewPlus)
  
  return {
    app,
    Pinia: pinia
  }
}