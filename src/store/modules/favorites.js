import { defineStore } from 'pinia'
import { favoriteApi, discoveryApi } from '@/api'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    // 自选币种列表
    favoriteCoins: [],
    
    // 自选币种的实时价格数据
    favoritePrices: {},
    
    // 加载状态
    loading: {
      favorites: false,
      prices: false,
      add: false,
      remove: false
    },
    
    // 排序方式
    sortBy: 'added_time', // added_time | name | price | change
    sortOrder: 'desc', // asc | desc
    
    // 价格提醒设置
    priceAlerts: [],
    
    // 最后更新时间
    lastUpdateTime: 0,
    
    // 同步状态（与服务器同步）
    syncStatus: 'idle', // idle | syncing | success | failed
    
    // 本地修改记录（用于离线时记录操作）
    localChanges: []
  }),

  getters: {
    // 获取排序后的自选币种
    sortedFavoriteCoins: (state) => {
      const coins = [...state.favoriteCoins]
      
      return coins.sort((a, b) => {
        let aValue, bValue
        
        switch (state.sortBy) {
          case 'name':
            aValue = a.symbol || a.name
            bValue = b.symbol || b.name
            break
          case 'price':
            aValue = state.favoritePrices[a.symbol]?.price || 0
            bValue = state.favoritePrices[b.symbol]?.price || 0
            break
          case 'change':
            aValue = state.favoritePrices[a.symbol]?.price_change_24h || 0
            bValue = state.favoritePrices[b.symbol]?.price_change_24h || 0
            break
          case 'added_time':
          default:
            aValue = a.addedTime || 0
            bValue = b.addedTime || 0
            break
        }
        
        if (state.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    },
    
    // 获取收藏币种数量
    favoriteCount: (state) => state.favoriteCoins.length,
    
    // 检查币种是否已收藏
    isFavorite: (state) => (symbol) => {
      return state.favoriteCoins.some(coin => coin.symbol === symbol)
    },
    
    // 获取涨幅最大的收藏币种
    topGainer: (state) => {
      const coins = state.favoriteCoins
        .map(coin => ({
          ...coin,
          ...state.favoritePrices[coin.symbol]
        }))
        .filter(coin => coin.price_change_24h > 0)
        .sort((a, b) => b.price_change_24h - a.price_change_24h)
      
      return coins[0] || null
    },
    
    // 获取跌幅最大的收藏币种
    topLoser: (state) => {
      const coins = state.favoriteCoins
        .map(coin => ({
          ...coin,
          ...state.favoritePrices[coin.symbol]
        }))
        .filter(coin => coin.price_change_24h < 0)
        .sort((a, b) => a.price_change_24h - b.price_change_24h)
      
      return coins[0] || null
    },
    
    // 获取总市值
    totalMarketValue: (state) => {
      return state.favoriteCoins.reduce((total, coin) => {
        const price = state.favoritePrices[coin.symbol]
        return total + ((price?.market_cap || 0) * (coin.amount || 0))
      }, 0)
    },
    
    // 获取需要价格提醒的币种
    alertCoins: (state) => {
      return state.priceAlerts.filter(alert => alert.enabled)
    }
  },

  actions: {
    // 获取自选币种列表
    async fetchFavorites() {
      if (this.loading.favorites) return
      
      try {
        this.loading.favorites = true
        
        const result = await discoveryApi.getSelfCoin()
        
        if (result.success && result.data) {
          this.favoriteCoins = result.data.map(coin => ({
            ...coin,
            addedTime: coin.addedTime || Date.now()
          }))
          
          // 获取价格数据
          await this.fetchFavoritePrices()
        }
        
        return { success: true, data: result.data }
      } catch (error) {
        console.error('获取自选币种失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading.favorites = false
      }
    },

    // 获取自选币种价格数据
    async fetchFavoritePrices() {
      if (this.loading.prices || this.favoriteCoins.length === 0) return
      
      try {
        this.loading.prices = true
        
        // 批量获取价格数据
        const symbols = this.favoriteCoins.map(coin => coin.symbol).join(',')
        
        // 这里可以调用批量获取价格的API
        // const result = await priceApi.getBatchPrices({ symbols })
        
        // 模拟数据更新
        this.favoriteCoins.forEach(coin => {
          this.favoritePrices[coin.symbol] = {
            price: Math.random() * 1000,
            price_change_24h: (Math.random() - 0.5) * 20,
            volume_24h: Math.random() * 1000000,
            market_cap: Math.random() * 10000000000,
            last_updated: Date.now()
          }
        })
        
        this.lastUpdateTime = Date.now()
        
        return { success: true }
      } catch (error) {
        console.error('获取价格数据失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading.prices = false
      }
    },

    // 添加到自选
    async addToFavorites(coinData) {
      if (this.loading.add) return
      
      try {
        this.loading.add = true
        
        // 检查是否已存在
        if (this.isFavorite(coinData.symbol)) {
          throw new Error('该币种已在自选列表中')
        }
        
        const result = await favoriteApi.addFavorite({
          symbol: coinData.symbol,
          name: coinData.name
        })
        
        if (result.success) {
          // 添加到本地列表
          const newCoin = {
            ...coinData,
            addedTime: Date.now()
          }
          
          this.favoriteCoins.push(newCoin)
          
          // 获取价格数据
          await this.fetchFavoritePrices()
          
          return { success: true, message: '添加成功' }
        } else {
          throw new Error(result.message || '添加失败')
        }
      } catch (error) {
        console.error('添加自选失败:', error)
        
        // 记录本地修改（用于离线同步）
        this.localChanges.push({
          type: 'add',
          data: coinData,
          timestamp: Date.now()
        })
        
        return { success: false, message: error.message }
      } finally {
        this.loading.add = false
      }
    },

    // 从自选中移除
    async removeFromFavorites(symbol) {
      if (this.loading.remove) return
      
      try {
        this.loading.remove = true
        
        const result = await favoriteApi.removeFavorite({ symbol })
        
        if (result.success) {
          // 从本地列表移除
          this.favoriteCoins = this.favoriteCoins.filter(coin => coin.symbol !== symbol)
          
          // 删除价格数据
          delete this.favoritePrices[symbol]
          
          // 删除相关价格提醒
          this.priceAlerts = this.priceAlerts.filter(alert => alert.symbol !== symbol)
          
          return { success: true, message: '移除成功' }
        } else {
          throw new Error(result.message || '移除失败')
        }
      } catch (error) {
        console.error('移除自选失败:', error)
        
        // 记录本地修改
        this.localChanges.push({
          type: 'remove',
          data: { symbol },
          timestamp: Date.now()
        })
        
        return { success: false, message: error.message }
      } finally {
        this.loading.remove = false
      }
    },

    // 切换收藏状态
    async toggleFavorite(coinData) {
      if (this.isFavorite(coinData.symbol)) {
        return await this.removeFromFavorites(coinData.symbol)
      } else {
        return await this.addToFavorites(coinData)
      }
    },

    // 设置排序方式
    setSorting(sortBy, sortOrder = 'desc') {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },

    // 添加价格提醒
    addPriceAlert(alertData) {
      const alert = {
        id: Date.now(),
        symbol: alertData.symbol,
        name: alertData.name,
        targetPrice: alertData.targetPrice,
        condition: alertData.condition, // above | below
        enabled: true,
        createdTime: Date.now()
      }
      
      this.priceAlerts.push(alert)
      
      return { success: true, data: alert }
    },

    // 移除价格提醒
    removePriceAlert(alertId) {
      this.priceAlerts = this.priceAlerts.filter(alert => alert.id !== alertId)
    },

    // 切换价格提醒状态
    togglePriceAlert(alertId) {
      const alert = this.priceAlerts.find(alert => alert.id === alertId)
      if (alert) {
        alert.enabled = !alert.enabled
      }
    },

    // 检查价格提醒
    checkPriceAlerts() {
      const triggeredAlerts = []
      
      this.priceAlerts.forEach(alert => {
        if (!alert.enabled) return
        
        const currentPrice = this.favoritePrices[alert.symbol]?.price
        if (!currentPrice) return
        
        const shouldTrigger = alert.condition === 'above' 
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice
        
        if (shouldTrigger) {
          triggeredAlerts.push(alert)
          
          // 发送通知
          uni.showToast({
            title: `${alert.name} 价格${alert.condition === 'above' ? '突破' : '跌破'} ${alert.targetPrice}`,
            icon: 'none',
            duration: 3000
          })
          
          // 禁用此提醒（避免重复提醒）
          alert.enabled = false
        }
      })
      
      return triggeredAlerts
    },

    // 同步到服务器
    async syncToServer() {
      if (this.localChanges.length === 0) return
      
      try {
        this.syncStatus = 'syncing'
        
        // 处理本地修改
        for (const change of this.localChanges) {
          if (change.type === 'add') {
            await favoriteApi.addFavorite(change.data)
          } else if (change.type === 'remove') {
            await favoriteApi.removeFavorite(change.data)
          }
        }
        
        // 清除本地修改记录
        this.localChanges = []
        this.syncStatus = 'success'
        
        return { success: true }
      } catch (error) {
        console.error('同步失败:', error)
        this.syncStatus = 'failed'
        return { success: false, message: error.message }
      }
    },

    // 清空自选列表
    clearAllFavorites() {
      this.favoriteCoins = []
      this.favoritePrices = {}
      this.priceAlerts = []
      this.localChanges = []
    }
  },

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
