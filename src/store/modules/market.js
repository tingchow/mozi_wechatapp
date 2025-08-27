import { defineStore } from 'pinia'
import { homeApi, discoveryApi, detailApi } from '@/api'
import { LOOPTIME } from '@/utils/constants'

export const useMarketStore = defineStore('market', {
  state: () => ({
    // 热门币种
    hotCoins: [],
    
    // 热门版块
    hotIndustries: [],
    
    // 热门合约
    hotContracts: [],
    
    // 发现页数据
    discoveryData: {
      coinList: [],
      hotExchange: [],
      priceChange: [],
      priceWave: [],
      coinTrade: [],
      priceDownChange: [],
      priceUpTrade: [],
      newCoin: [],
    },
    
    // 币种详情数据
    coinDetails: {},
    
    // 搜索结果
    searchResults: {
      coins: [],
      keywords: [],
      history: []
    },
    
    // 数据更新时间戳
    lastUpdateTime: {
      hotCoins: 0,
      hotIndustries: 0,
      hotContracts: 0,
      discoveryData: 0,
    },
    
    // 自动刷新定时器
    refreshTimer: null,
    
    // 是否正在加载
    loading: {
      hotCoins: false,
      hotIndustries: false,
      hotContracts: false,
      discoveryData: false,
    },
    
    // 分页信息
    pagination: {
      hotCoins: { page: 1, limit: 20, hasMore: true },
      discoveryData: { page: 1, limit: 20, hasMore: true },
    },
    
    // 排序和筛选条件
    filters: {
      sortBy: 'price_change', // price_change | market_cap | volume | price
      sortOrder: 'desc', // asc | desc
      category: 'all', // all | defi | nft | gamefi 等
      priceRange: { min: 0, max: 0 },
      marketCapRange: { min: 0, max: 0 }
    }
  }),

  getters: {
    // 获取涨幅前10的币种
    topGainers: (state) => {
      return state.hotCoins
        .filter(coin => coin.price_change_24h > 0)
        .sort((a, b) => b.price_change_24h - a.price_change_24h)
        .slice(0, 10)
    },
    
    // 获取跌幅前10的币种
    topLosers: (state) => {
      return state.hotCoins
        .filter(coin => coin.price_change_24h < 0)
        .sort((a, b) => a.price_change_24h - b.price_change_24h)
        .slice(0, 10)
    },
    
    // 获取成交量前10的币种
    topVolume: (state) => {
      return state.hotCoins
        .sort((a, b) => b.volume_24h - a.volume_24h)
        .slice(0, 10)
    },
    
    // 获取市值前10的币种
    topMarketCap: (state) => {
      return state.hotCoins
        .sort((a, b) => b.market_cap - a.market_cap)
        .slice(0, 10)
    },
    
    // 检查数据是否需要刷新（超过5分钟）
    needRefresh: (state) => {
      const now = Date.now()
      const refreshInterval = 5 * 60 * 1000 // 5分钟
      
      return {
        hotCoins: now - state.lastUpdateTime.hotCoins > refreshInterval,
        hotIndustries: now - state.lastUpdateTime.hotIndustries > refreshInterval,
        hotContracts: now - state.lastUpdateTime.hotContracts > refreshInterval,
        discoveryData: now - state.lastUpdateTime.discoveryData > refreshInterval,
      }
    }
  },

  actions: {
    // 获取热门币种
    async fetchHotCoins(refresh = false) {
      if (this.loading.hotCoins) return
      
      try {
        this.loading.hotCoins = true
        
        const params = {
          page: refresh ? 1 : this.pagination.hotCoins.page,
          limit: this.pagination.hotCoins.limit
        }
        
        const result = await homeApi.getHotCoin(params)
        
        if (result.success && result.data) {
          if (refresh || params.page === 1) {
            this.hotCoins = result.data
          } else {
            this.hotCoins = [...this.hotCoins, ...result.data]
          }
          
          // 更新分页信息
          this.pagination.hotCoins.hasMore = result.data.length === params.limit
          if (!refresh) {
            this.pagination.hotCoins.page += 1
          }
          
          // 更新时间戳
          this.lastUpdateTime.hotCoins = Date.now()
        }
        
        return { success: true, data: result.data }
      } catch (error) {
        console.error('获取热门币种失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading.hotCoins = false
      }
    },

    // 获取热门版块
    async fetchHotIndustries() {
      if (this.loading.hotIndustries) return
      
      try {
        this.loading.hotIndustries = true
        
        const result = await homeApi.getHotIndustry()
        
        if (result.success && result.data) {
          this.hotIndustries = result.data
          this.lastUpdateTime.hotIndustries = Date.now()
        }
        
        return { success: true, data: result.data }
      } catch (error) {
        console.error('获取热门版块失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading.hotIndustries = false
      }
    },

    // 获取热门合约
    async fetchHotContracts() {
      if (this.loading.hotContracts) return
      
      try {
        this.loading.hotContracts = true
        
        const result = await homeApi.getHotContract()
        
        if (result.success && result.data) {
          this.hotContracts = result.data
          this.lastUpdateTime.hotContracts = Date.now()
        }
        
        return { success: true, data: result.data }
      } catch (error) {
        console.error('获取热门合约失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading.hotContracts = false
      }
    },

    // 获取发现页数据
    async fetchDiscoveryData(type = 'all') {
      if (this.loading.discoveryData) return
      
      try {
        this.loading.discoveryData = true
        
        const promises = []
        
        if (type === 'all' || type === 'coinList') {
          promises.push(discoveryApi.getCoinList().then(res => ({ type: 'coinList', data: res })))
        }
        if (type === 'all' || type === 'hotExchange') {
          promises.push(discoveryApi.getHotExchange().then(res => ({ type: 'hotExchange', data: res })))
        }
        if (type === 'all' || type === 'priceChange') {
          promises.push(discoveryApi.getPriceChange().then(res => ({ type: 'priceChange', data: res })))
        }
        
        const results = await Promise.allSettled(promises)
        
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.data.success) {
            this.discoveryData[result.value.type] = result.value.data.data || []
          }
        })
        
        this.lastUpdateTime.discoveryData = Date.now()
        
        return { success: true }
      } catch (error) {
        console.error('获取发现页数据失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading.discoveryData = false
      }
    },

    // 获取币种详情
    async fetchCoinDetail(symbol) {
      try {
        const result = await detailApi.getCoinInfo({ symbol })
        
        if (result.success && result.data) {
          this.coinDetails[symbol] = result.data
        }
        
        return { success: true, data: result.data }
      } catch (error) {
        console.error('获取币种详情失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 搜索币种
    async searchCoins(keyword) {
      try {
        // 添加到搜索历史
        if (keyword && !this.searchResults.history.includes(keyword)) {
          this.searchResults.history.unshift(keyword)
          // 只保留最近20条搜索历史
          if (this.searchResults.history.length > 20) {
            this.searchResults.history = this.searchResults.history.slice(0, 20)
          }
        }
        
        // 这里可以调用搜索API
        // const result = await searchApi.searchCoins({ keyword })
        
        return { success: true, data: [] }
      } catch (error) {
        console.error('搜索币种失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 清除搜索历史
    clearSearchHistory() {
      this.searchResults.history = []
    },

    // 设置筛选条件
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    // 重置筛选条件
    resetFilters() {
      this.filters = {
        sortBy: 'price_change',
        sortOrder: 'desc',
        category: 'all',
        priceRange: { min: 0, max: 0 },
        marketCapRange: { min: 0, max: 0 }
      }
    },

    // 开始自动刷新
    startAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
      }
      
      this.refreshTimer = setInterval(() => {
        // 只刷新当前页面需要的数据
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const currentRoute = currentPage?.route
        
        if (currentRoute?.includes('index')) {
          this.fetchHotCoins(true)
          this.fetchHotIndustries()
        } else if (currentRoute?.includes('find')) {
          this.fetchDiscoveryData()
        }
      }, LOOPTIME)
    },

    // 停止自动刷新
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },

    // 刷新所有数据
    async refreshAllData() {
      const promises = [
        this.fetchHotCoins(true),
        this.fetchHotIndustries(),
        this.fetchHotContracts(),
        this.fetchDiscoveryData()
      ]
      
      try {
        await Promise.all(promises)
        return { success: true }
      } catch (error) {
        console.error('刷新数据失败:', error)
        return { success: false, message: error.message }
      }
    }
  },

  // 不持久化市场数据，每次启动重新获取
  persist: false
})
