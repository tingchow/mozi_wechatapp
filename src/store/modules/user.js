import { defineStore } from 'pinia'
import { userApi } from '@/api'
import { setToken, clearToken } from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: null,
    // 登录状态
    isLogin: false,
    // token
    token: '',
    // 用户偏好设置
    preferences: {
      theme: 'light', // light | dark
      language: 'zh-CN',
      notifications: true,
      autoRefresh: true,
      refreshInterval: 30000, // 30秒
    }
  }),

  getters: {
    // 获取用户昵称
    nickname: (state) => state.userInfo?.nickname || '游客',
    
    // 获取用户头像
    avatar: (state) => state.userInfo?.avatar || '/static/images/default-avatar.png',
    
    // 是否为VIP用户
    isVip: (state) => state.userInfo?.isVip || false,
    
    // 获取用户等级
    userLevel: (state) => state.userInfo?.level || 0,
  },

  actions: {
    // 登录
    async login(loginData) {
      try {
        const result = await userApi.login(loginData)
        
        if (result.success) {
          this.userInfo = result.data.userInfo
          this.token = result.data.token
          this.isLogin = true
          
          // 保存token到本地
          await setToken(this.token)
          
          return { success: true, data: result.data }
        } else {
          throw new Error(result.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 退出登录
    async logout() {
      try {
        // 清除本地数据
        this.userInfo = null
        this.token = ''
        this.isLogin = false
        
        // 清除本地token
        await clearToken()
        
        // 可以调用后端登出接口
        // await userApi.logout()
        
        return { success: true }
      } catch (error) {
        console.error('退出登录失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        if (!this.isLogin) {
          throw new Error('用户未登录')
        }
        
        const result = await userApi.getUserInfo()
        
        if (result.success) {
          this.userInfo = result.data
          return { success: true, data: result.data }
        } else {
          throw new Error(result.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 更新用户信息
    async updateUserInfo(updateData) {
      try {
        const result = await userApi.saveUserInfo(updateData)
        
        if (result.success) {
          // 更新本地用户信息
          this.userInfo = { ...this.userInfo, ...updateData }
          return { success: true, data: result.data }
        } else {
          throw new Error(result.message || '更新用户信息失败')
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 更新用户偏好设置
    updatePreferences(newPreferences) {
      this.preferences = { ...this.preferences, ...newPreferences }
    },

    // 设置主题
    setTheme(theme) {
      this.preferences.theme = theme
    },

    // 设置语言
    setLanguage(language) {
      this.preferences.language = language
    },

    // 检查登录状态
    checkLoginStatus() {
      return this.isLogin && this.token && this.userInfo
    },

    // 初始化用户数据（应用启动时调用）
    async initUserData() {
      try {
        // 如果有token但没有用户信息，尝试获取用户信息
        if (this.token && !this.userInfo) {
          await this.getUserInfo()
        }
      } catch (error) {
        console.error('初始化用户数据失败:', error)
        // 如果获取用户信息失败，清除登录状态
        await this.logout()
      }
    }
  },

  // 持久化配置
  persist: {
    key: 'user-store',
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
      }
    },
    paths: ['userInfo', 'isLogin', 'token', 'preferences']
  }
})
