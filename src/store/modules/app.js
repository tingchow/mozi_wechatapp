import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { systemApi } from '@/api'

export const useAppStore = defineStore('app', () => {
  // State (响应式数据)
  const systemInfo = ref({})
  const networkStatus = ref('unknown') // wifi | 2g | 3g | 4g | 5g | unknown | none
  const appStatus = ref('active') // active | background
  const globalLoading = ref(false)
  const loadingText = ref('加载中...')
  const appConfig = ref({
    version: '1.0.0',
    updateTime: '',
    apiVersion: 'v1',
    showAll: true, // 是否展示全部内容
  })
  const pageStack = ref([])
  const globalData = ref({})
  const errorLogs = ref([])
  const performanceData = ref({
    pageLoadTimes: {},
    apiResponseTimes: {},
  })

  // Getters (计算属性)
  const platform = computed(() => {
    return systemInfo.value.platform || 'unknown'
  })
  
  const deviceInfo = computed(() => {
    const { brand, model, system, version } = systemInfo.value
    return { brand, model, system, version }
  })
  
  const screenInfo = computed(() => {
    const { windowWidth, windowHeight, screenWidth, screenHeight, statusBarHeight } = systemInfo.value
    return { windowWidth, windowHeight, screenWidth, screenHeight, statusBarHeight }
  })
  
  const isSmallScreen = computed(() => {
    return systemInfo.value.windowWidth < 375
  })
  
  const hasSafeArea = computed(() => {
    return systemInfo.value.safeAreaInsets ? true : false
  })
  
  const currentPagePath = computed(() => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return currentPage ? currentPage.route : ''
  })

  // Actions (方法)
  // 初始化系统信息
  const initSystemInfo = async () => {
    try {
      const sysInfo = uni.getSystemInfoSync()
      systemInfo.value = sysInfo
      
      // 监听网络状态变化
      uni.onNetworkStatusChange((res) => {
        networkStatus.value = res.networkType
      })
      
      // 获取网络状态
      uni.getNetworkType({
        success: (res) => {
          networkStatus.value = res.networkType
        }
      })
      
      console.log('系统信息初始化完成:', sysInfo)
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  }

  // 设置全局loading
  const setGlobalLoading = (loading, text = '加载中...') => {
    globalLoading.value = loading
    loadingText.value = text
    
    if (loading) {
      uni.showLoading({
        title: text,
        mask: true
      })
    } else {
      uni.hideLoading()
    }
  }

  // 更新应用配置
  const updateAppConfig = async () => {
    try {
      // 暂时跳过接口调用，避免域名白名单错误
      // const result = await systemApi.getShowAll()
      // if (result.success) {
      //   appConfig.value = { ...appConfig.value, ...result.data }
      // }
      
      console.log('应用配置接口暂时禁用，避免域名白名单错误')
    } catch (error) {
      console.error('更新应用配置失败:', error)
    }
  }

  // 设置全局数据
  const setGlobalData = (key, value) => {
    globalData.value[key] = value
  }

  // 获取全局数据
  const getGlobalData = (key) => {
    return globalData.value[key]
  }

  // 清除全局数据
  const clearGlobalData = (key) => {
    if (key) {
      delete globalData.value[key]
    } else {
      globalData.value = {}
    }
  }

  // 记录错误日志
  const logError = (error, context = '') => {
    const errorLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      error: error.toString(),
      stack: error.stack || '',
      context,
      userAgent: systemInfo.value.system || '',
      url: currentPagePath.value
    }
    
    errorLogs.value.unshift(errorLog)
    
    // 只保留最近100条错误日志
    if (errorLogs.value.length > 100) {
      errorLogs.value = errorLogs.value.slice(0, 100)
    }
    
    console.error('记录错误日志:', errorLog)
  }

  // 记录页面加载时间
  const recordPageLoadTime = (pagePath, loadTime) => {
    performanceData.value.pageLoadTimes[pagePath] = loadTime
  }

  // 记录API响应时间
  const recordApiResponseTime = (apiPath, responseTime) => {
    if (!performanceData.value.apiResponseTimes[apiPath]) {
      performanceData.value.apiResponseTimes[apiPath] = []
    }
    
    performanceData.value.apiResponseTimes[apiPath].push({
      time: responseTime,
      timestamp: Date.now()
    })
    
    // 只保留最近50次记录
    if (performanceData.value.apiResponseTimes[apiPath].length > 50) {
      performanceData.value.apiResponseTimes[apiPath] = performanceData.value.apiResponseTimes[apiPath].slice(-50)
    }
  }

  // 获取性能统计
  const getPerformanceStats = () => {
    const pageStats = Object.entries(performanceData.value.pageLoadTimes).map(([page, time]) => ({
      page,
      avgTime: time
    }))
    
    const apiStats = Object.entries(performanceData.value.apiResponseTimes).map(([api, times]) => {
      const avgTime = times.reduce((sum, item) => sum + item.time, 0) / times.length
      return { api, avgTime, count: times.length }
    })
    
    return { pageStats, apiStats }
  }

  // 清理性能数据
  const clearPerformanceData = () => {
    performanceData.value = {
      pageLoadTimes: {},
      apiResponseTimes: {},
    }
  }

  // 应用进入后台
  const onAppHide = () => {
    appStatus.value = 'background'
    console.log('应用进入后台')
  }

  // 应用回到前台
  const onAppShow = () => {
    appStatus.value = 'active'
    console.log('应用回到前台')
  }

  // 返回所有响应式数据和方法
  return {
    // State
    systemInfo,
    networkStatus,
    appStatus,
    globalLoading,
    loadingText,
    appConfig,
    pageStack,
    globalData,
    errorLogs,
    performanceData,
    
    // Getters
    platform,
    deviceInfo,
    screenInfo,
    isSmallScreen,
    hasSafeArea,
    currentPagePath,
    
    // Actions
    initSystemInfo,
    setGlobalLoading,
    updateAppConfig,
    setGlobalData,
    getGlobalData,
    clearGlobalData,
    logError,
    recordPageLoadTime,
    recordApiResponseTime,
    getPerformanceStats,
    clearPerformanceData,
    onAppHide,
    onAppShow
  }
}, {
  // 持久化配置
  persist: {
    key: 'app-store',
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
    paths: ['appConfig', 'errorLogs']
  }
})
