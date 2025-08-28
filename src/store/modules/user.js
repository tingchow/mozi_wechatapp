import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api'
import { setToken, clearToken } from '@/utils/request'
import { Interface } from '@/utils/constants'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  // State (响应式数据)
  const userInfo = ref(null)
  const isLogin = ref(false)
  const token = ref('')
  const preferences = ref({
    theme: 'light', // light | dark
    language: 'zh-CN',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30秒
  })

  // Getters (计算属性)
  const nickname = computed(() => userInfo.value?.nickname || '游客')
  const avatar = computed(() => userInfo.value?.avatar || '/static/images/default-avatar.png')
  const isVip = computed(() => userInfo.value?.isVip || false)
  const userLevel = computed(() => userInfo.value?.level || 0)

  // Actions (方法)
  // 微信小程序登录
  const wxLogin = async ({ code, phoneCode, userInfo: userInfoParam = null }) => {
    try {
      console.log('开始微信登录，参数:', { code, phoneCode, userInfo: userInfoParam })
      console.log('Interface对象:', Interface)
      console.log('MOZI_LOGIN:', Interface.MOZI_LOGIN)
      
      // 调用后端登录接口
      const result = await request({
        url: Interface.MOZI_LOGIN,
        method: 'POST',
        data: {
          loginCode: code,
          phoneCode: phoneCode || '', // 手机号授权码
          userInfo: userInfoParam ? {
            nickName: userInfoParam.nickName,
            avatar: userInfoParam.avatarUrl,
            gender: userInfoParam.gender,
            country: userInfoParam.country,
            province: userInfoParam.province,
            city: userInfoParam.city
          } : null
        }
      })
      
      console.log('登录接口返回:', result)
      
      if (result?.data?.token) {
        // 保存token
        token.value = result.data.token
        isLogin.value = true
        
        // 保存用户信息
        const userData = result.data.userInfo || {
          nickName: userInfoParam?.nickName || '微信用户',
          avatar: userInfoParam?.avatarUrl || '/static/images/profile/avatar.png',
          userId: result.data.userId
        }
        
        userInfo.value = userData
        
        // 保存到本地存储
        await setToken(token.value)
        uni.setStorageSync('userInfo', userData)
        
        // 设置社区刷新标记
        uni.setStorageSync('needRefreshCommunity', true)
        
        return { 
          success: true, 
          data: result.data,
          isNewUser: result.data.type === 'register'
        }
      } else {
        throw new Error(result?.errorMsg || result?.message || '登录失败')
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 通用登录
  const login = async (loginData) => {
    try {
      const result = await userApi.login(loginData)
      
      if (result.success) {
        userInfo.value = result.data.userInfo
        token.value = result.data.token
        isLogin.value = true
        
        // 保存token到本地
        await setToken(token.value)
        
        return { success: true, data: result.data }
      } else {
        throw new Error(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: error.message }
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      // 清除本地数据
      userInfo.value = null
      token.value = ''
      isLogin.value = false
      
      // 清除本地token
      await clearToken()
      
      // 可以调用后端登出接口
      // await userApi.logout()
      
      return { success: true }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, message: error.message }
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      if (!isLogin.value) {
        throw new Error('用户未登录')
      }
      
      const result = await userApi.getUserInfo()
      
      if (result.success) {
        userInfo.value = result.data
        return { success: true, data: result.data }
      } else {
        throw new Error(result.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return { success: false, message: error.message }
    }
  }

  // 更新用户信息
  const updateUserInfo = async (updateData) => {
    try {
      const result = await userApi.saveUserInfo(updateData)
      
      if (result.success) {
        // 更新本地用户信息
        userInfo.value = { ...userInfo.value, ...updateData }
        return { success: true, data: result.data }
      } else {
        throw new Error(result.message || '更新用户信息失败')
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { success: false, message: error.message }
    }
  }

  // 更新用户偏好设置
  const updatePreferences = (newPreferences) => {
    preferences.value = { ...preferences.value, ...newPreferences }
  }

  // 设置主题
  const setTheme = (theme) => {
    preferences.value.theme = theme
  }

  // 设置语言
  const setLanguage = (language) => {
    preferences.value.language = language
  }

  // 检查登录状态
  const checkLoginStatus = () => {
    return isLogin.value && token.value && userInfo.value
  }

  // 初始化用户数据（应用启动时调用）
  const initUserData = async () => {
    try {
      // 如果有token但没有用户信息，尝试获取用户信息
      if (token.value && !userInfo.value) {
        await getUserInfo()
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
      // 如果获取用户信息失败，清除登录状态
      await logout()
    }
  }

  // 返回所有响应式数据和方法
  return {
    // State
    userInfo,
    isLogin,
    token,
    preferences,
    
    // Getters
    nickname,
    avatar,
    isVip,
    userLevel,
    
    // Actions
    wxLogin,
    login,
    logout,
    getUserInfo,
    updateUserInfo,
    updatePreferences,
    setTheme,
    setLanguage,
    checkLoginStatus,
    initUserData
  }
}, {
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
