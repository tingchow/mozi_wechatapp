import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favoriteApi, discoveryApi } from '@/api'

export const useFavoritesStore = defineStore('favorites', () => {
  // State (响应式数据)
  const favoriteCoins = ref([])
  const favoritePrices = ref({})
  const loading = ref({
    favorites: false,
    prices: false,
    add: false,
    remove: false
  })
  const sortBy = ref('added_time') // added_time | name | price | change
  const sortOrder = ref('desc') // asc | desc
  const priceAlerts = ref([])
  const lastUpdateTime = ref(0)
  const syncStatus = ref('idle') // idle | syncing | success | failed
  const localChanges = ref([])

  // Getters (计算属性)
  const sortedFavoriteCoins = computed(() => {
    const coins = [...favoriteCoins.value]
    
    return coins.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'name':
          aValue = a.symbol || a.name
          bValue = b.symbol || b.name
          break
        case 'price':
          aValue = favoritePrices.value[a.symbol]?.current_price || 0
          bValue = favoritePrices.value[b.symbol]?.current_price || 0
          break
        case 'change':
          aValue = favoritePrices.value[a.symbol]?.price_change_24h || 0
          bValue = favoritePrices.value[b.symbol]?.price_change_24h || 0
          break
        case 'added_time':
        default:
          aValue = a.added_time || 0
          bValue = b.added_time || 0
          break
      }
      
      if (typeof aValue === 'string') {
        if (sortOrder.value === 'asc') {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      } else {
        if (sortOrder.value === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      }
    })
  })

  const favoriteCoinsWithPrices = computed(() => {
    return sortedFavoriteCoins.value.map(coin => ({
      ...coin,
      priceData: favoritePrices.value[coin.symbol] || {}
    }))
  })

  const favoriteSymbols = computed(() => {
    return favoriteCoins.value.map(coin => coin.symbol)
  })

  const favoritesCount = computed(() => {
    return favoriteCoins.value.length
  })

  const gainersCount = computed(() => {
    return favoriteCoinsWithPrices.value.filter(coin => 
      (coin.priceData.price_change_24h || 0) > 0
    ).length
  })

  const losersCount = computed(() => {
    return favoriteCoinsWithPrices.value.filter(coin => 
      (coin.priceData.price_change_24h || 0) < 0
    ).length
  })

  const totalValue = computed(() => {
    return favoriteCoinsWithPrices.value.reduce((total, coin) => {
      const price = coin.priceData.current_price || 0
      const holdings = coin.holdings || 0
      return total + (price * holdings)
    }, 0)
  })

  const totalChange24h = computed(() => {
    let totalCurrentValue = 0
    let totalPreviousValue = 0
    
    favoriteCoinsWithPrices.value.forEach(coin => {
      const currentPrice = coin.priceData.current_price || 0
      const change24h = coin.priceData.price_change_24h || 0
      const previousPrice = currentPrice - change24h
      const holdings = coin.holdings || 0
      
      totalCurrentValue += currentPrice * holdings
      totalPreviousValue += previousPrice * holdings
    })
    
    return totalCurrentValue - totalPreviousValue
  })

  const alerts = computed(() => {
    return priceAlerts.value.filter(alert => alert.enabled)
  })

  // Actions (方法)
  const fetchFavorites = async () => {
    try {
      loading.value.favorites = true
      
      // 模拟自选币种数据
      const mockData = [
        { 
          symbol: 'BTC', 
          name: 'Bitcoin', 
          added_time: Date.now() - 86400000,
          holdings: 0.5
        },
        { 
          symbol: 'ETH', 
          name: 'Ethereum', 
          added_time: Date.now() - 172800000,
          holdings: 2.0
        },
        { 
          symbol: 'BNB', 
          name: 'BNB', 
          added_time: Date.now() - 259200000,
          holdings: 10.0
        }
      ]
      
      favoriteCoins.value = mockData
      lastUpdateTime.value = Date.now()
      
      console.log('获取自选币种成功 (模拟数据):', mockData.length, '条')
      return { success: true, data: mockData }
      
    } catch (error) {
      console.error('获取自选币种失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.favorites = false
    }
  }

  const fetchFavoritePrices = async () => {
    try {
      if (favoriteCoins.value.length === 0) {
        return { success: true, data: {} }
      }
      
      loading.value.prices = true
      
      // 模拟价格数据
      const mockPrices = {
        'BTC': { current_price: 65432.18, price_change_24h: 5.68, volume_24h: 28900000000 },
        'ETH': { current_price: 3234.56, price_change_24h: -2.34, volume_24h: 15600000000 },
        'BNB': { current_price: 432.18, price_change_24h: 3.45, volume_24h: 2100000000 }
      }
      
      favoritePrices.value = mockPrices
      
      return { success: true, data: mockPrices }
      
    } catch (error) {
      console.error('获取自选币种价格失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.prices = false
    }
  }

  const addToFavorites = async (coinData) => {
    try {
      loading.value.add = true
      
      // 检查是否已存在
      const exists = favoriteCoins.value.some(coin => coin.symbol === coinData.symbol)
      if (exists) {
        return { success: false, message: '该币种已在自选列表中' }
      }
      
      const newCoin = {
        ...coinData,
        added_time: Date.now(),
        holdings: 0
      }
      
      favoriteCoins.value.unshift(newCoin)
      
      // 记录本地修改（用于后续同步）
      localChanges.value.push({
        type: 'add',
        symbol: coinData.symbol,
        timestamp: Date.now()
      })
      
      console.log('添加自选成功:', coinData.symbol)
      return { success: true, data: newCoin }
      
    } catch (error) {
      console.error('添加自选失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.add = false
    }
  }

  const removeFromFavorites = async (symbol) => {
    try {
      loading.value.remove = true
      
      const index = favoriteCoins.value.findIndex(coin => coin.symbol === symbol)
      if (index === -1) {
        return { success: false, message: '该币种不在自选列表中' }
      }
      
      favoriteCoins.value.splice(index, 1)
      
      // 移除价格数据
      if (favoritePrices.value[symbol]) {
        delete favoritePrices.value[symbol]
      }
      
      // 记录本地修改
      localChanges.value.push({
        type: 'remove',
        symbol: symbol,
        timestamp: Date.now()
      })
      
      console.log('移除自选成功:', symbol)
      return { success: true }
      
    } catch (error) {
      console.error('移除自选失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value.remove = false
    }
  }

  const toggleFavorite = async (coinData) => {
    const exists = favoriteCoins.value.some(coin => coin.symbol === coinData.symbol)
    
    if (exists) {
      return await removeFromFavorites(coinData.symbol)
    } else {
      return await addToFavorites(coinData)
    }
  }

  const isFavorite = (symbol) => {
    return favoriteCoins.value.some(coin => coin.symbol === symbol)
  }

  const updateHoldings = (symbol, holdings) => {
    const coin = favoriteCoins.value.find(coin => coin.symbol === symbol)
    if (coin) {
      coin.holdings = holdings
      
      // 记录本地修改
      localChanges.value.push({
        type: 'update_holdings',
        symbol: symbol,
        holdings: holdings,
        timestamp: Date.now()
      })
    }
  }

  const setSortBy = (field, order = null) => {
    sortBy.value = field
    if (order) {
      sortOrder.value = order
    } else {
      // 如果是同一个字段，切换排序方向
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      }
    }
  }

  const addPriceAlert = (alertData) => {
    const newAlert = {
      id: Date.now(),
      symbol: alertData.symbol,
      type: alertData.type, // 'above' | 'below'
      targetPrice: alertData.targetPrice,
      enabled: true,
      created_time: Date.now()
    }
    
    priceAlerts.value.push(newAlert)
    return newAlert
  }

  const removePriceAlert = (alertId) => {
    const index = priceAlerts.value.findIndex(alert => alert.id === alertId)
    if (index !== -1) {
      priceAlerts.value.splice(index, 1)
    }
  }

  const togglePriceAlert = (alertId) => {
    const alert = priceAlerts.value.find(alert => alert.id === alertId)
    if (alert) {
      alert.enabled = !alert.enabled
    }
  }

  const clearAllFavorites = () => {
    favoriteCoins.value = []
    favoritePrices.value = {}
    priceAlerts.value = []
    localChanges.value = []
  }

  const syncWithServer = async () => {
    try {
      syncStatus.value = 'syncing'
      
      // 这里应该调用API同步本地修改到服务器
      // 暂时模拟同步成功
      
      localChanges.value = []
      syncStatus.value = 'success'
      
      return { success: true }
    } catch (error) {
      console.error('同步失败:', error)
      syncStatus.value = 'failed'
      return { success: false, message: error.message }
    }
  }

  // 返回所有响应式数据和方法
  return {
    // State
    favoriteCoins,
    favoritePrices,
    loading,
    sortBy,
    sortOrder,
    priceAlerts,
    lastUpdateTime,
    syncStatus,
    localChanges,
    
    // Getters
    sortedFavoriteCoins,
    favoriteCoinsWithPrices,
    favoriteSymbols,
    favoritesCount,
    gainersCount,
    losersCount,
    totalValue,
    totalChange24h,
    alerts,
    
    // Actions
    fetchFavorites,
    fetchFavoritePrices,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    updateHoldings,
    setSortBy,
    addPriceAlert,
    removePriceAlert,
    togglePriceAlert,
    clearAllFavorites,
    syncWithServer
  }
}, {
  // 持久化配置
  persist: {
    key: 'favorites-store',
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
    paths: ['favoriteCoins', 'sortBy', 'sortOrder', 'priceAlerts', 'localChanges']
  }
})
