<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMarketStore } from '@/store'

const marketStore = useMarketStore()

// 响应式数据
const searchKeyword = ref('')
const activeCategory = ref('hot')

// 分类数据
const categories = [
  { key: 'hot', label: '热门' },
  { key: 'gainers', label: '涨幅榜' },
  { key: 'losers', label: '跌幅榜' },
  { key: 'volume', label: '成交量' }
]

// 计算属性
const hotIndustries = computed(() => marketStore.hotIndustries)
const topGainers = computed(() => marketStore.topGainers)
const topLosers = computed(() => marketStore.topLosers)
const topVolume = computed(() => marketStore.topVolume)

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

// 格式化成交量
const formatVolume = (volume) => {
  if (!volume) return '0'
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B'
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M'
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K'
  }
  return volume.toFixed(2)
}

// 切换分类
const switchCategory = (category) => {
  activeCategory.value = category
}

// 搜索
const onSearch = (e) => {
  const keyword = e.detail.value
  // 这里可以实现搜索逻辑
  console.log('搜索关键词:', keyword)
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    marketStore.fetchHotCoins(true),
    marketStore.fetchHotIndustries(),
    marketStore.fetchDiscoveryData()
  ])
  
  uni.showToast({
    title: '刷新完成',
    icon: 'success',
    duration: 1500
  })
}

// 页面加载时获取数据
onMounted(() => {
  marketStore.fetchHotCoins()
  marketStore.fetchHotIndustries()
  marketStore.fetchDiscoveryData()
})
</script>

<template>
  <view class="discovery-page">
    <!-- 头部搜索栏 -->
    <view class="search-header">
      <view class="search-box">
        <input 
          v-model="searchKeyword" 
          placeholder="搜索币种、交易所..." 
          class="search-input"
          @input="onSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
    </view>

    <!-- 分类导航 -->
    <view class="category-nav">
      <view 
        class="category-item"
        :class="{ active: activeCategory === category.key }"
        v-for="category in categories"
        :key="category.key"
        @click="switchCategory(category.key)"
      >
        {{ category.label }}
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 热门版块 -->
      <view class="section" v-if="activeCategory === 'hot'">
        <view class="section-title">热门版块</view>
        <view class="industry-grid">
          <view 
            class="industry-item" 
            v-for="industry in hotIndustries" 
            :key="industry.name"
          >
            <text class="industry-name">{{ industry.name }}</text>
            <text class="industry-change" :class="industry.change >= 0 ? 'positive' : 'negative'">
              {{ industry.change >= 0 ? '+' : '' }}{{ industry.change }}%
            </text>
          </view>
        </view>
        
        <view class="empty-state" v-if="hotIndustries.length === 0">
          <text class="empty-text">暂无热门版块数据</text>
        </view>
      </view>

      <!-- 涨幅榜 -->
      <view class="section" v-if="activeCategory === 'gainers'">
        <view class="section-title">涨幅榜</view>
        <view class="rank-list">
          <view class="rank-item" v-for="(coin, index) in topGainers" :key="coin.symbol">
            <view class="rank-number">{{ index + 1 }}</view>
            <view class="coin-info">
              <text class="symbol">{{ coin.symbol }}</text>
              <text class="name">{{ coin.name }}</text>
            </view>
            <view class="price-info">
              <text class="price">${{ formatPrice(coin.price) }}</text>
              <text class="change positive">+{{ coin.price_change_24h }}%</text>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="topGainers.length === 0">
          <text class="empty-text">暂无涨幅数据</text>
        </view>
      </view>

      <!-- 跌幅榜 -->
      <view class="section" v-if="activeCategory === 'losers'">
        <view class="section-title">跌幅榜</view>
        <view class="rank-list">
          <view class="rank-item" v-for="(coin, index) in topLosers" :key="coin.symbol">
            <view class="rank-number">{{ index + 1 }}</view>
            <view class="coin-info">
              <text class="symbol">{{ coin.symbol }}</text>
              <text class="name">{{ coin.name }}</text>
            </view>
            <view class="price-info">
              <text class="price">${{ formatPrice(coin.price) }}</text>
              <text class="change negative">{{ coin.price_change_24h }}%</text>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="topLosers.length === 0">
          <text class="empty-text">暂无跌幅数据</text>
        </view>
      </view>

      <!-- 成交量榜 -->
      <view class="section" v-if="activeCategory === 'volume'">
        <view class="section-title">成交量榜</view>
        <view class="rank-list">
          <view class="rank-item" v-for="(coin, index) in topVolume" :key="coin.symbol">
            <view class="rank-number">{{ index + 1 }}</view>
            <view class="coin-info">
              <text class="symbol">{{ coin.symbol }}</text>
              <text class="name">{{ coin.name }}</text>
            </view>
            <view class="volume-info">
              <text class="volume">${{ formatVolume(coin.volume_24h) }}</text>
              <text class="volume-label">24h成交量</text>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="topVolume.length === 0">
          <text class="empty-text">暂无成交量数据</text>
        </view>
      </view>
    </view>

    <!-- 刷新按钮 -->
    <view class="refresh-btn" @click="refreshData">
      <text>刷新数据</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.discovery-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.search-header {
  background: white;
  padding: 30upx;
  border-bottom: 2upx solid #f0f0f0;
}

.search-box {
  position: relative;
  background: #f8f9fa;
  border-radius: 50upx;
  padding: 0 30upx;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 80upx;
  font-size: 30upx;
  border: none;
  background: transparent;
}

.search-icon {
  font-size: 32upx;
  color: #999;
}

.category-nav {
  display: flex;
  background: white;
  padding: 0 30upx;
  border-bottom: 2upx solid #f0f0f0;
}

.category-item {
  flex: 1;
  text-align: center;
  padding: 30upx 0;
  font-size: 30upx;
  color: #666;
  position: relative;

  &.active {
    color: #667eea;
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60upx;
      height: 6upx;
      background: #667eea;
      border-radius: 3upx;
    }
  }
}

.content {
  padding: 30upx;
}

.section {
  background: white;
  border-radius: 20upx;
  padding: 30upx;
  margin-bottom: 30upx;
}

.section-title {
  font-size: 36upx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30upx;
  padding-bottom: 20upx;
  border-bottom: 2upx solid #f0f0f0;
}

.industry-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20upx;
}

.industry-item {
  background: #f8f9fa;
  padding: 30upx;
  border-radius: 15upx;
  text-align: center;

  .industry-name {
    display: block;
    font-size: 28upx;
    color: #333;
    margin-bottom: 10upx;
  }

  .industry-change {
    font-size: 24upx;
    font-weight: bold;

    &.positive {
      color: #52c41a;
    }

    &.negative {
      color: #ff4d4f;
    }
  }
}

.rank-list {
  .rank-item {
    display: flex;
    align-items: center;
    padding: 30upx 0;
    border-bottom: 2upx solid #f8f9fa;

    &:last-child {
      border-bottom: none;
    }
  }
}

.rank-number {
  width: 60upx;
  height: 60upx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24upx;
  font-weight: bold;
  color: #666;
  margin-right: 30upx;
}

.coin-info {
  flex: 1;

  .symbol {
    display: block;
    font-size: 32upx;
    font-weight: bold;
    color: #333;
  }

  .name {
    font-size: 24upx;
    color: #999;
  }
}

.price-info, .volume-info {
  text-align: right;

  .price, .volume {
    display: block;
    font-size: 30upx;
    font-weight: bold;
    color: #333;
    margin-bottom: 5upx;
  }

  .change {
    font-size: 26upx;
    font-weight: bold;

    &.positive {
      color: #52c41a;
    }

    &.negative {
      color: #ff4d4f;
    }
  }

  .volume-label {
    font-size: 24upx;
    color: #999;
  }
}

.empty-state {
  text-align: center;
  padding: 80upx 0;

  .empty-text {
    font-size: 30upx;
    color: #999;
  }
}

.refresh-btn {
  margin: 30upx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 30upx;
  border-radius: 15upx;
  font-size: 32upx;
  font-weight: bold;
}
</style>
