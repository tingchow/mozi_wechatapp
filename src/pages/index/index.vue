<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMarketStore, useUserStore, useAppStore } from '@/store'
import { showLoading, hideLoading, showToast as coreShowToast } from '@/utils/core'

// 使用store
const marketStore = useMarketStore()
const userStore = useUserStore()
const appStore = useAppStore()

const title = ref('Mozi UniApp')
const apiResult = ref('')

// 计算属性
const hotCoins = computed(() => marketStore.hotCoins.slice(0, 5))
const isLogin = computed(() => userStore.isLogin)
const userNickname = computed(() => userStore.nickname)

const navigateToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/about'
  })
}

const navigateToUIDemo = () => {
  uni.navigateTo({
    url: '/pages/components-demo/simple'
  })
}



const showToast = () => {
  uni.showToast({
    title: `欢迎使用 Mozi UniApp，${userNickname.value}！`,
    icon: 'success',
    duration: 2000
  })
}

// 测试热门币种API（使用Pinia store）
const testHotCoinApi = async () => {
  try {
    appStore.setGlobalLoading(true, '获取热门币种...')
    apiResult.value = '正在请求...'

    const result = await marketStore.fetchHotCoins(true)

    if (result.success) {
      const count = marketStore.hotCoins.length
      apiResult.value = `成功获取 ${count} 条热门币种数据`
      coreShowToast('API调用成功', 'success')
    } else {
      apiResult.value = `请求失败: ${result.message}`
      coreShowToast('API调用失败', 'none')
    }
  } catch (error) {
    console.error('API调用失败:', error)
    apiResult.value = `请求失败: ${error.message || '网络错误'}`
    coreShowToast('API调用失败', 'none')

    // 记录错误日志
    appStore.logError(error, '测试热门币种API')
  } finally {
    appStore.setGlobalLoading(false)
  }
}

// 模拟登录测试
const testLogin = async () => {
  try {
    appStore.setGlobalLoading(true, '登录中...')

    // 模拟登录数据
    const loginData = {
      username: 'test@mozi.com',
      password: '123456'
    }

    const result = await userStore.login(loginData)

    if (result.success) {
      coreShowToast(`登录成功，欢迎 ${userStore.nickname}`, 'success')
    } else {
      coreShowToast(`登录失败: ${result.message}`, 'none')
    }
  } catch (error) {
    console.error('登录失败:', error)
    coreShowToast('登录失败', 'none')
  } finally {
    appStore.setGlobalLoading(false)
  }
}

onMounted(() => {
  console.log('Index page loaded')
  console.log('Store已初始化，可以测试功能')
  console.log('系统信息:', appStore.systemInfo)
  console.log('用户状态:', isLogin.value ? '已登录' : '未登录')
})
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="title">欢迎使用 Mozi UniApp</text>
      <text class="subtitle">跨平台应用开发框架</text>
    </view>
    
    <view class="content">
      <view class="card">
        <text class="card-title">功能特性</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="feature-text">📱 一套代码，多端运行</text>
          </view>
          <view class="feature-item">
            <text class="feature-text">⚡ 高性能渲染</text>
          </view>
          <view class="feature-item">
            <text class="feature-text">🎨 丰富的UI组件</text>
          </view>
        </view>
      </view>
      
      <!-- API测试区域 -->
      <view class="card">
        <text class="card-title">API测试</text>
        <view class="api-test">
          <button class="btn btn-test" @click="testHotCoinApi">测试热门币种API</button>
          <button class="btn btn-login" @click="testLogin">{{ isLogin ? '已登录' : '模拟登录' }}</button>
          <view v-if="apiResult" class="api-result">
            <text class="result-title">API响应结果:</text>
            <text class="result-content">{{ apiResult }}</text>
          </view>
          <view v-if="isLogin" class="user-info">
            <text class="user-welcome">欢迎，{{ userNickname }}！</text>
            <text class="user-detail">您已成功登录系统</text>
          </view>
        </view>
      </view>

      
      <view class="actions">
        <button class="btn btn-primary" @click="navigateToAbout">了解更多</button>
        <button class="btn btn-secondary" @click="showToast">显示提示</button>
        <button class="btn btn-ui-demo" @click="navigateToUIDemo">简单演示</button>

      </view>
    </view>
  </view>
</template>

<style scoped>
.container {
  padding: 40upx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 60upx;
}

.title {
  font-size: 48upx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20upx;
}

.subtitle {
  font-size: 28upx;
  color: #666;
  display: block;
}

.content {
  max-width: 600upx;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 20upx;
  padding: 40upx;
  margin-bottom: 40upx;
  box-shadow: 0 4upx 20upx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30upx;
  display: block;
}

.feature-item {
  margin-bottom: 20upx;
}

.feature-text {
  font-size: 28upx;
  color: #555;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20upx;
}

.btn {
  width: 100%;
  padding: 25upx;
  border-radius: 15upx;
  font-size: 32upx;
  border: none;
  color: white;
}

.btn:active {
  opacity: 0.8;
}

.btn-test {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  margin-bottom: 20upx;
}

.btn-login {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  margin-bottom: 20upx;
}

.api-test {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.api-result {
  background: #f8f9fa;
  border-radius: 10upx;
  padding: 20upx;
  margin-top: 20upx;
  width: 100%;
  border-left: 4upx solid #007aff;
}

.result-title {
  font-size: 24upx;
  color: #666;
  display: block;
  margin-bottom: 10upx;
  font-weight: bold;
}

.result-content {
  font-size: 26upx;
  color: #333;
  line-height: 1.5;
  display: block;
}

.user-info {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 10upx;
  padding: 20upx;
  margin-top: 20upx;
  width: 100%;
  border-left: 4upx solid #2196f3;
}

.user-welcome {
  font-size: 28upx;
  color: #1976d2;
  display: block;
  margin-bottom: 8upx;
  font-weight: bold;
}

.user-detail {
  font-size: 24upx;
  color: #666;
  display: block;
}

.btn-ui-demo {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
  font-weight: bold;
}


</style>