<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMarketStore } from '@/store'

const marketStore = useMarketStore()

// 响应式数据
const hotCoins = computed(() => marketStore.hotCoins)
const loading = computed(() => marketStore.loading.hotCoins)
const lastUpdateTime = computed(() => marketStore.lastUpdateTime.hotCoins)

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 刷新数据
const refreshData = async () => {
  await marketStore.fetchHotCoins(true)
  uni.showToast({
    title: '刷新完成',
    icon: 'success',
    duration: 1500
  })
}

// 页面加载时获取数据
onMounted(() => {
  marketStore.fetchHotCoins()
})
</script>

<template>
  <view class="market-page">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-title">行情</view>
      <view class="header-subtitle">实时数字货币行情</view>
    </view>

    <!-- 热门币种列表 -->
    <view class="coin-list">
      <view class="list-header">
        <text class="section-title">热门币种</text>
        <text class="refresh-time" v-if="lastUpdateTime">
          更新时间: {{ formatTime(lastUpdateTime) }}
        </text>
      </view>

      <!-- 币种列表 -->
      <view class="coin-item" v-for="coin in hotCoins" :key="coin.symbol">
        <view class="coin-info">
          <view class="coin-name">
            <text class="symbol">{{ coin.symbol }}</text>
            <text class="name">{{ coin.name }}</text>
          </view>
          <view class="coin-price">
            <text class="price">${{ formatPrice(coin.price) }}</text>
            <text 
              class="change" 
              :class="coin.price_change_24h >= 0 ? 'positive' : 'negative'"
            >
              {{ coin.price_change_24h >= 0 ? '+' : '' }}{{ coin.price_change_24h }}%
            </text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && hotCoins.length === 0">
        <text class="empty-text">暂无数据</text>
        <text class="empty-desc">接口暂时禁用，请稍后再试</text>
      </view>

      <!-- 加载状态 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>

    <!-- 刷新按钮 -->
    <view class="refresh-btn" @click="refreshData">
      <text>刷新数据</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.market-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20upx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40upx 30upx;
  border-radius: 20upx;
  margin-bottom: 30upx;
  color: white;

  .header-title {
    font-size: 48upx;
    font-weight: bold;
    margin-bottom: 10upx;
  }

  .header-subtitle {
    font-size: 28upx;
    opacity: 0.9;
  }
}

.coin-list {
  background: white;
  border-radius: 20upx;
  padding: 30upx;
  margin-bottom: 30upx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30upx;
  padding-bottom: 20upx;
  border-bottom: 2upx solid #f0f0f0;

  .section-title {
    font-size: 36upx;
    font-weight: bold;
    color: #333;
  }

  .refresh-time {
    font-size: 24upx;
    color: #999;
  }
}

.coin-item {
  padding: 30upx 0;
  border-bottom: 2upx solid #f8f9fa;

  &:last-child {
    border-bottom: none;
  }
}

.coin-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coin-name {
  .symbol {
    font-size: 32upx;
    font-weight: bold;
    color: #333;
    margin-right: 20upx;
  }

  .name {
    font-size: 28upx;
    color: #666;
  }
}

.coin-price {
  text-align: right;

  .price {
    display: block;
    font-size: 32upx;
    font-weight: bold;
    color: #333;
    margin-bottom: 5upx;
  }

  .change {
    font-size: 28upx;
    font-weight: 500;

    &.positive {
      color: #52c41a;
    }

    &.negative {
      color: #ff4d4f;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80upx 0;

  .empty-text {
    display: block;
    font-size: 32upx;
    color: #999;
    margin-bottom: 20upx;
  }

  .empty-desc {
    font-size: 28upx;
    color: #ccc;
  }
}

.loading {
  text-align: center;
  padding: 40upx 0;
  color: #999;
}

.refresh-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
  text-align: center;
  padding: 30upx;
  border-radius: 15upx;
  font-size: 32upx;
  font-weight: bold;
}
</style>
