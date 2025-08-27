import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建pinia实例
const pinia = createPinia()

// 持久化插件配置
pinia.use(
  createPersistedState({
    storage: {
      getItem: (key) => {
        return new Promise((resolve) => {
          uni.getStorage({
            key,
            success: (res) => resolve(res.data),
            fail: () => resolve(null)
          })
        })
      },
      setItem: (key, value) => {
        return new Promise((resolve) => {
          uni.setStorage({
            key,
            data: value,
            success: () => resolve(true),
            fail: () => resolve(false)
          })
        })
      },
      removeItem: (key) => {
        return new Promise((resolve) => {
          uni.removeStorage({
            key,
            success: () => resolve(true),
            fail: () => resolve(false)
          })
        })
      }
    }
  })
)

export default pinia

// 导出所有store
export * from './modules/user'
export * from './modules/app'
export * from './modules/market'
export * from './modules/favorites'
