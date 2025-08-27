<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAppStore, useUserStore, useMarketStore } from '@/store'

// 初始化store
const appStore = useAppStore()
const userStore = useUserStore()
const marketStore = useMarketStore()

onLaunch(() => {
  console.log('App Launch')
  
  // 初始化应用
  initApp()
})

onShow(() => {
  console.log('App Show')
  appStore.onAppShow()
  
  // 开始自动刷新市场数据
  marketStore.startAutoRefresh()
})

onHide(() => {
  console.log('App Hide')
  appStore.onAppHide()
  
  // 停止自动刷新
  marketStore.stopAutoRefresh()
})

// 初始化应用
const initApp = async () => {
  try {
    // 初始化系统信息
    await appStore.initSystemInfo()
    
    // 初始化用户数据
    await userStore.initUserData()
    
    // 更新应用配置
    await appStore.updateAppConfig()
    
    console.log('应用初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
    appStore.logError(error, 'App初始化')
  }
}
</script>

<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import "uview-plus/index.scss";
/*每个页面公共css */
page {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
}

/* 通用按钮样式 */
.btn {
  padding: 20upx 40upx;
  margin: 20upx;
  border-radius: 10upx;
  text-align: center;
  font-size: 28upx;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

/* 通用文本样式 */
.text-center {
  text-align: center;
}

/* 通用间距 */
.mt-10 {
  margin-top: 20upx;
}

.mb-10 {
  margin-bottom: 20upx;
}

.p-20 {
  padding: 20upx;
}
</style>