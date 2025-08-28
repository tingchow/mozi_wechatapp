import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { homeApi, discoveryApi, detailApi } from '@/api'
import { LOOPTIME } from '@/utils/constants'

export const useMarketStore = defineStore('market', () => {
  // State (响应式数据)
  const hotCoins = ref([])
  const hotIndustries = ref([])
  const hotContracts = ref([])
  const discoveryData = ref({
    coinList: [],
    hotExchange: [],
    priceChange: [],
    priceWave: [],
    coinTrade: [],
    priceDownChange: [],
    priceUpTrade: [],
    newCoin: [],
  })
  const coinDetails = ref({})
  const searchResults = ref({
    coins: [],
    keywords: [],
    history: []
  })
  const lastUpdateTime = ref({
    hotCoins: 0,
    hotIndustries: 0,
    hotContracts: 0,
    discoveryData: 0,
  })
  const refreshTimer = ref(null)
  const loading = ref({
    hotCoins: false,
    hotIndustries: false,
    hotContracts: false,
    discoveryData: false,
  })
  const pagination = ref({
    hotCoins: { page: 1, limit: 20, hasMore: true },
    discoveryData: { page: 1, limit: 20, hasMore: true },
  })
  const filters = ref({
    sortBy: 'price_change', // price_change | market_cap | volume | price
    sortOrder: 'desc', // asc | desc
    category: 'all', // all | defi | nft | gamefi 等
    priceRange: { min: 0, max: 0 },
    marketCapRange: { min: 0, max: 0 }
  })

  // Getters (计算属性)
  const topGainers = computed(() => {
    return hotCoins.value
      .filter(coin => coin.price_change_24h > 0)
      .sort((a, b) => b.price_change_24h - a.price_change_24h)
      .slice(0, 10)
  })
  
  const topLosers = computed(() => {
    return hotCoins.value
      .filter(coin => coin.price_change_24h < 0)
      .sort((a, b) => a.price_change_24h - b.price_change_24h)
      .slice(0, 10)
  })
  
  const topVolume = computed(() => {
    return hotCoins.value
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 10)
  })
  
  const topMarketCap = computed(() => {
    return hotCoins.value
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 10)
  })
  
  const filteredCoins = computed(() => {
    let result = [...hotCoins.value]
    
    // 分类筛选
    if (filters.value.category !== 'all') {
      result = result.filter(coin => coin.category === filters.value.category)
    }
    
    // 价格范围筛选
    if (filters.value.priceRange.min > 0) {
      result = result.filter(coin => coin.current_price >= filters.value.priceRange.min)
    }
    if (filters.value.priceRange.max > 0) {
      result = result.filter(coin => coin.current_price <= filters.value.priceRange.max)
    }
    
    // 市值范围筛选
    if (filters.value.marketCapRange.min > 0) {
      result = result.filter(coin => coin.market_cap >= filters.value.marketCapRange.min)
    }
    if (filters.value.marketCapRange.max > 0) {
      result = result.filter(coin => coin.market_cap <= filters.value.marketCapRange.max)
    }
    
    // 排序
    const sortField = filters.value.sortBy
    const sortOrder = filters.value.sortOrder
    
    result.sort((a, b) => {
      const aValue = a[sortField] || 0
      const bValue = b[sortField] || 0
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
    
    return result
  })
  
  const searchHistoryDisplayList = computed(() => {
    return searchResults.value.history.slice(0, 10)
  })

  // Actions (方法)
  const fetchHotCoins = async (forceRefresh = false) => {
    try {
      const now = Date.now()
      const cacheExpiry = 5 * 60 * 1000 // 5分钟缓存
      
      if (!forceRefresh && 
          hotCoins.value.length > 0 && 
          (now - lastUpdateTime.value.hotCoins) < cacheExpiry) {
        return { success: true, data: hotCoins.value, fromCache: true }
      }

      loading.value.hotCoins = true
      
      // 这里暂时使用模拟数据，避免接口调用错误
      const mockData = [
        { symbol: 'BTC', name: 'Bitcoin', current_price: 65432.18, price_change_24h: 5.68, volume_24h: 28900000000, market_cap: 1280000000000 },
        { symbol: 'ETH', name: 'Ethereum', current_price: 3234.56, price_change_24h: -2.34, volume_24h: 15600000000, market_cap: 390000000000 },
        { symbol: 'BNB', name: 'BNB', current_price: 432.18, price_change_24h: 3.45, volume_24h: 2100000000, market_cap: 66000000000 },
        { symbol: 'ADA', name: 'Cardano', current_price: 1.23, price_change_24h: -1.23, volume_24h: 1200000000, market_cap: 42000000000 },
        { symbol: 'SOL', name: 'Solana', current_price: 178.45, price_change_24h: 7.89, volume_24h: 3400000000, market_cap: 78000000000 }
      ]
      
      hotCoins.value = mockData
      lastUpdateTime.value.hotCoins = now
      
      console.log('获取热门币种成功 (模拟数据):', mockData.length, '条')
      return { success: true, data: mockData }
      
    } catch (error) {
      console.error('获取热门币种失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.hotCoins = false
    }
  }

  const fetchHotIndustries = async () => {
    try {
      loading.value.hotIndustries = true
      
      // 模拟数据
      const mockData = [
        { name: 'DeFi', count: 156, change_24h: 3.2 },
        { name: 'NFT', count: 89, change_24h: -1.5 },
        { name: 'GameFi', count: 67, change_24h: 5.8 },
        { name: 'Layer 1', count: 45, change_24h: 2.1 },
        { name: 'Metaverse', count: 34, change_24h: -0.9 }
      ]
      
      hotIndustries.value = mockData
      lastUpdateTime.value.hotIndustries = Date.now()
      
      return { success: true, data: mockData }
    } catch (error) {
      console.error('获取热门版块失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.hotIndustries = false
    }
  }

  const fetchHotContracts = async () => {
    try {
      loading.value.hotContracts = true
      
      // 模拟数据
      const mockData = [
        { symbol: 'BTCUSDT', price: 65432.18, change_24h: 5.68, funding_rate: 0.01 },
        { symbol: 'ETHUSDT', price: 3234.56, change_24h: -2.34, funding_rate: -0.005 },
        { symbol: 'BNBUSDT', price: 432.18, change_24h: 3.45, funding_rate: 0.02 }
      ]
      
      hotContracts.value = mockData
      lastUpdateTime.value.hotContracts = Date.now()
      
      return { success: true, data: mockData }
    } catch (error) {
      console.error('获取热门合约失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.hotContracts = false
    }
  }

  const fetchDiscoveryData = async () => {
    try {
      loading.value.discoveryData = true
      
      // 模拟发现页数据
      const mockData = {
        coinList: hotCoins.value,
        hotExchange: [
          { name: 'Binance', volume_24h: 15600000000, pairs: 1200 },
          { name: 'Coinbase', volume_24h: 8900000000, pairs: 450 },
          { name: 'OKX', volume_24h: 7200000000, pairs: 800 }
        ],
        priceChange: topGainers.value,
        priceWave: hotCoins.value.slice(0, 10),
        coinTrade: topVolume.value,
        priceDownChange: topLosers.value,
        priceUpTrade: topVolume.value.slice(0, 5),
        newCoin: hotCoins.value.slice(-5)
      }
      
      discoveryData.value = mockData
      lastUpdateTime.value.discoveryData = Date.now()
      
      return { success: true, data: mockData }
    } catch (error) {
      console.error('获取发现页数据失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.discoveryData = false
    }
  }

  const searchCoins = async (keyword) => {
    try {
      if (!keyword.trim()) {
        return { success: true, data: [] }
      }
      
      // 添加到搜索历史
      if (!searchResults.value.history.includes(keyword)) {
        searchResults.value.history.unshift(keyword)
        // 只保留最近20条搜索历史
        if (searchResults.value.history.length > 20) {
          searchResults.value.history = searchResults.value.history.slice(0, 20)
        }
      }
      
      // 模拟搜索结果
      const results = hotCoins.value.filter(coin => 
        coin.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
        coin.name.toLowerCase().includes(keyword.toLowerCase())
      )
      
      searchResults.value.coins = results
      
      return { success: true, data: results }
    } catch (error) {
      console.error('搜索币种失败:', error)
      return { success: false, message: error.message }
    }
  }

  const clearSearchHistory = () => {
    searchResults.value.history = []
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      sortBy: 'price_change',
      sortOrder: 'desc',
      category: 'all',
      priceRange: { min: 0, max: 0 },
      marketCapRange: { min: 0, max: 0 }
    }
  }

  const startAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
    }
    
    refreshTimer.value = setInterval(() => {
      // 只刷新当前页面需要的数据
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = currentPage?.route
      
      if (currentRoute?.includes('index')) {
        fetchHotCoins(true)
        fetchHotIndustries()
      } else if (currentRoute?.includes('find')) {
        fetchDiscoveryData()
      }
    }, LOOPTIME)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  // 返回所有响应式数据和方法
  return {
    // State
    hotCoins,
    hotIndustries,
    hotContracts,
    discoveryData,
    coinDetails,
    searchResults,
    lastUpdateTime,
    refreshTimer,
    loading,
    pagination,
    filters,
    
    // Getters
    topGainers,
    topLosers,
    topVolume,
    topMarketCap,
    filteredCoins,
    searchHistoryDisplayList,
    
    // Actions
    fetchHotCoins,
    fetchHotIndustries,
    fetchHotContracts,
    fetchDiscoveryData,
    searchCoins,
    clearSearchHistory,
    setFilters,
    resetFilters,
    startAutoRefresh,
    stopAutoRefresh
  }
}, {
  // 持久化配置
  persist: {
    key: 'market-store',
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
    paths: ['hotCoins', 'hotIndustries', 'searchResults', 'filters']
  }
})
