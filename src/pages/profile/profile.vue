<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore, useFavoritesStore, useAppStore } from '@/store'

const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const appStore = useAppStore()

// 计算属性
const userInfo = computed(() => userStore.userInfo)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const favoritesCount = computed(() => favoritesStore.favorites.length)
const alarmsCount = ref(0) // 暂时固定值，实际可以从store获取
const userStats = computed(() => userStore.userStats || {})
const appVersion = computed(() => appStore.appConfig.version)

// 处理登录
const handleLogin = () => {
  uni.showModal({
    title: '登录提示',
    content: '登录功能暂时禁用，请稍后再试',
    showCancel: false
  })
  
  // 实际登录逻辑
  // uni.navigateTo({
  //   url: '/pages/login/login'
  // })
}

// 处理退出登录
const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

// 跳转到我的自选
const goToFavorites = () => {
  if (!isLoggedIn.value) {
    handleLogin()
    return
  }
  
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
  
  // uni.navigateTo({
  //   url: '/pages/favorites/favorites'
  // })
}

// 跳转到价格提醒
const goToAlarms = () => {
  if (!isLoggedIn.value) {
    handleLogin()
    return
  }
  
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
  
  // uni.navigateTo({
  //   url: '/pages/alarms/alarms'
  // })
}

// 跳转到浏览历史
const goToHistory = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
  
  // uni.navigateTo({
  //   url: '/pages/history/history'
  // })
}

// 跳转到设置
const goToSettings = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
  
  // uni.navigateTo({
  //   url: '/pages/settings/settings'
  // })
}

// 跳转到意见反馈
const goToFeedback = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
  
  // uni.navigateTo({
  //   url: '/pages/feedback/feedback'
  // })
}

// 跳转到关于我们
const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/about'
  })
}

// 页面加载时初始化
onMounted(() => {
  // 可以在这里获取用户统计数据
})
</script>

<template>
  <view class="profile-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-avatar">
        <image 
          :src="userInfo.avatar || '/static/images/default-avatar.png'" 
          class="avatar-img"
          mode="aspectFill"
        />
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo.nickname || '未登录' }}</text>
        <text class="user-desc">{{ userInfo.email || '点击登录获取更多功能' }}</text>
      </view>
      <view class="login-btn" @click="handleLogin" v-if="!isLoggedIn">
        <text>登录</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-title">我的功能</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToFavorites">
          <view class="menu-icon">⭐</view>
          <text class="menu-text">我的自选</text>
          <text class="menu-count" v-if="favoritesCount > 0">({{ favoritesCount }})</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToAlarms">
          <view class="menu-icon">🔔</view>
          <text class="menu-text">价格提醒</text>
          <text class="menu-count" v-if="alarmsCount > 0">({{ alarmsCount }})</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToHistory">
          <view class="menu-icon">📊</view>
          <text class="menu-text">浏览历史</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 设置菜单 -->
    <view class="menu-section">
      <view class="menu-title">设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToSettings">
          <view class="menu-icon">⚙️</view>
          <text class="menu-text">应用设置</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToFeedback">
          <view class="menu-icon">💬</view>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">></text>
        </view>
        
        <view class="menu-item" @click="goToAbout">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section" v-if="isLoggedIn">
      <view class="stats-title">我的数据</view>
      <view class="stats-grid">
        <view class="stats-item">
          <text class="stats-number">{{ userStats.totalViews || 0 }}</text>
          <text class="stats-label">浏览次数</text>
        </view>
        <view class="stats-item">
          <text class="stats-number">{{ userStats.totalFavorites || 0 }}</text>
          <text class="stats-label">自选币种</text>
        </view>
        <view class="stats-item">
          <text class="stats-number">{{ userStats.totalAlarms || 0 }}</text>
          <text class="stats-label">价格提醒</text>
        </view>
        <view class="stats-item">
          <text class="stats-number">{{ userStats.daysActive || 0 }}</text>
          <text class="stats-label">活跃天数</text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section" v-if="isLoggedIn">
      <view class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">Mozi UniApp v{{ appVersion }}</text>
      <text class="copyright">© 2024 Mozi Innovations</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60upx 30upx 40upx;
  display: flex;
  align-items: center;
  color: white;
}

.user-avatar {
  width: 120upx;
  height: 120upx;
  border-radius: 60upx;
  overflow: hidden;
  margin-right: 30upx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 60upx;
}

.user-info {
  flex: 1;

  .username {
    display: block;
    font-size: 36upx;
    font-weight: bold;
    margin-bottom: 10upx;
  }

  .user-desc {
    font-size: 26upx;
    opacity: 0.9;
  }
}

.login-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 20upx 40upx;
  border-radius: 50upx;
  border: 2upx solid rgba(255, 255, 255, 0.3);
}

.menu-section {
  margin: 30upx;
  background: white;
  border-radius: 20upx;
  padding: 30upx;
}

.menu-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30upx;
  padding-bottom: 20upx;
  border-bottom: 2upx solid #f0f0f0;
}

.menu-list {
  .menu-item {
    display: flex;
    align-items: center;
    padding: 30upx 0;
    border-bottom: 2upx solid #f8f9fa;

    &:last-child {
      border-bottom: none;
    }
  }
}

.menu-icon {
  width: 60upx;
  height: 60upx;
  background: #f0f0f0;
  border-radius: 15upx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30upx;
  margin-right: 30upx;
}

.menu-text {
  flex: 1;
  font-size: 30upx;
  color: #333;
}

.menu-count {
  font-size: 26upx;
  color: #667eea;
  margin-right: 20upx;
}

.menu-arrow {
  font-size: 30upx;
  color: #ccc;
}

.stats-section {
  margin: 30upx;
  background: white;
  border-radius: 20upx;
  padding: 30upx;
}

.stats-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30upx;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30upx;
}

.stats-item {
  text-align: center;
  padding: 30upx;
  background: #f8f9fa;
  border-radius: 15upx;

  .stats-number {
    display: block;
    font-size: 48upx;
    font-weight: bold;
    color: #667eea;
    margin-bottom: 10upx;
  }

  .stats-label {
    font-size: 26upx;
    color: #666;
  }
}

.logout-section {
  margin: 30upx;
}

.logout-btn {
  background: #ff4d4f;
  color: white;
  text-align: center;
  padding: 30upx;
  border-radius: 15upx;
  font-size: 32upx;
  font-weight: bold;
}

.version-info {
  text-align: center;
  padding: 40upx;
  color: #999;

  .version-text {
    display: block;
    font-size: 26upx;
    margin-bottom: 10upx;
  }

  .copyright {
    font-size: 24upx;
  }
}
</style>
