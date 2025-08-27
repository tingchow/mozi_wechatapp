import { defineStore } from 'pinia'
import { systemApi } from '@/api'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 系统信息
    systemInfo: {},
    
    // 网络状态
    networkStatus: 'unknown', // wifi | 2g | 3g | 4g | 5g | unknown | none
    
    // 应用状态
    appStatus: 'active', // active | background
    
    // 全局loading状态
    globalLoading: false,
    
    // 全局loading文本
    loadingText: '加载中...',
    
    // 应用配置
    appConfig: {
      version: '1.0.0',
      updateTime: '',
      apiVersion: 'v1',
      showAll: true, // 是否展示全部内容
    },
    
    // 页面栈信息
    pageStack: [],
    
    // 全局数据（用于页面间传递复杂数据）
    globalData: {},
    
    // 错误日志
    errorLogs: [],
    
    // 性能监控数据
    performanceData: {
      pageLoadTimes: {},
      apiResponseTimes: {},
    }
  }),

  getters: {
    // 获取当前平台
    platform: (state) => {
      return state.systemInfo.platform || 'unknown'
    },
    
    // 获取设备信息
    deviceInfo: (state) => {
      const { brand, model, system, version } = state.systemInfo
      return { brand, model, system, version }
    },
    
    // 获取屏幕信息
    screenInfo: (state) => {
      const { windowWidth, windowHeight, screenWidth, screenHeight, statusBarHeight } = state.systemInfo
      return { windowWidth, windowHeight, screenWidth, screenHeight, statusBarHeight }
    },
    
    // 是否为小屏设备
    isSmallScreen: (state) => {
      return state.systemInfo.windowWidth < 375
    },
    
    // 是否为安全区域设备（有刘海屏等）
    hasSafeArea: (state) => {
      return state.systemInfo.safeAreaInsets ? true : false
    },
    
    // 获取当前页面路径
    currentPagePath: (state) => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      return currentPage ? currentPage.route : ''
    }
  },

  actions: {
    // 初始化系统信息
    async initSystemInfo() {
      try {
        const systemInfo = uni.getSystemInfoSync()
        this.systemInfo = systemInfo
        
        // 监听网络状态变化
        uni.onNetworkStatusChange((res) => {
          this.networkStatus = res.networkType
        })
        
        // 获取网络状态
        uni.getNetworkType({
          success: (res) => {
            this.networkStatus = res.networkType
          }
        })
        
        console.log('系统信息初始化完成:', systemInfo)
      } catch (error) {
        console.error('获取系统信息失败:', error)
      }
    },

    // 设置全局loading
    setGlobalLoading(loading, text = '加载中...') {
      this.globalLoading = loading
      this.loadingText = text
      
      if (loading) {
        uni.showLoading({
          title: text,
          mask: true
        })
      } else {
        uni.hideLoading()
      }
    },

    // 更新应用配置
    async updateAppConfig() {
      try {
        // 暂时跳过接口调用，避免域名白名单错误
        // const result = await systemApi.getShowAll()
        // if (result.success) {
        //   this.appConfig = { ...this.appConfig, ...result.data }
        // }
        
        console.log('应用配置接口暂时禁用，避免域名白名单错误')
      } catch (error) {
        console.error('更新应用配置失败:', error)
      }
    },

    // 设置全局数据
    setGlobalData(key, value) {
      this.globalData[key] = value
    },

    // 获取全局数据
    getGlobalData(key) {
      return this.globalData[key]
    },

    // 清除全局数据
    clearGlobalData(key) {
      if (key) {
        delete this.globalData[key]
      } else {
        this.globalData = {}
      }
    },

    // 记录错误日志
    logError(error, context = '') {
      const errorLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        error: error.toString(),
        stack: error.stack || '',
        context,
        userAgent: this.systemInfo.system || '',
        url: this.currentPagePath
      }
      
      this.errorLogs.unshift(errorLog)
      
      // 只保留最近100条错误日志
      if (this.errorLogs.length > 100) {
        this.errorLogs = this.errorLogs.slice(0, 100)
      }
      
      console.error('记录错误日志:', errorLog)
    },

    // 记录页面加载时间
    recordPageLoadTime(pagePath, loadTime) {
      this.performanceData.pageLoadTimes[pagePath] = loadTime
    },

    // 记录API响应时间
    recordApiResponseTime(apiPath, responseTime) {
      if (!this.performanceData.apiResponseTimes[apiPath]) {
        this.performanceData.apiResponseTimes[apiPath] = []
      }
      
      this.performanceData.apiResponseTimes[apiPath].push({
        time: responseTime,
        timestamp: Date.now()
      })
      
      // 只保留最近50次记录
      if (this.performanceData.apiResponseTimes[apiPath].length > 50) {
        this.performanceData.apiResponseTimes[apiPath] = this.performanceData.apiResponseTimes[apiPath].slice(-50)
      }
    },

    // 获取性能统计
    getPerformanceStats() {
      const pageStats = Object.entries(this.performanceData.pageLoadTimes).map(([page, time]) => ({
        page,
        avgTime: time
      }))
      
      const apiStats = Object.entries(this.performanceData.apiResponseTimes).map(([api, times]) => {
        const avgTime = times.reduce((sum, item) => sum + item.time, 0) / times.length
        return { api, avgTime, count: times.length }
      })
      
      return { pageStats, apiStats }
    },

    // 清理性能数据
    clearPerformanceData() {
      this.performanceData = {
        pageLoadTimes: {},
        apiResponseTimes: {},
      }
    },

    // 应用进入后台
    onAppHide() {
      this.appStatus = 'background'
      console.log('应用进入后台')
    },

    // 应用回到前台
    onAppShow() {
      this.appStatus = 'active'
      console.log('应用回到前台')
    }
  },

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
