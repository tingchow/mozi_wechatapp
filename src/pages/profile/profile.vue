<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore, useFavoritesStore, useAppStore } from '@/store'
import CalendarCard from '@/components/CalendarCard/index.vue'

const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const appStore = useAppStore()

// 响应式数据
const popVisible = ref(false)
const popType = ref('')
const reportScore = ref(null)
const scoreDisable = ref(true)
const scoreInput = ref('')

// 计算属性
const userInfo = computed(() => userStore.userInfo || {})
const isLoggedIn = computed(() => userStore.isLoggedIn)
const favoritesCount = computed(() => favoritesStore.favorites.length)
const alarmsCount = ref(0) // 暂时固定值，实际可以从store获取
const userStats = computed(() => userStore.userStats || {})
const appVersion = computed(() => appStore.appConfig.version)

// 模拟用户数据
const mockUserData = {
  points: 2000,
  yesterdayPoints: 100,
  rank: 23
}

// 邮箱和钱包地址（从原项目常量）
const EMAIL = 'contact@moziinnovations.com'
const COINKEY = {
  BTC: 'bc1p3pdyjgxcyhw7x24dr4fe8ral5p8w02tjfetfjc4h08v02lrrl5mqhv2val',
  ETH: '0xbD2858bC9F46fad5892174893c99924A6eF169C3',
  TRON: 'TXBGXsZN8GBjY6v1mtJN8gDqD2BxUxk2Xw'
}

// 处理登录
const handleLogin = () => {
  uni.showModal({
    title: '登录提示',
    content: '登录功能暂时禁用，请稍后再试',
    showCancel: false
  })
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

// 显示弹窗
const showPopup = (type) => {
  popType.value = type
  popVisible.value = true
}

// 关闭弹窗
const closePopup = () => {
  popVisible.value = false
  popType.value = ''
  reportScore.value = null
  scoreDisable.value = true
  scoreInput.value = ''
}

// 评分选择
const selectScore = (score) => {
  reportScore.value = score
  scoreDisable.value = false
}

// 提交评分
const submitScore = async () => {
  uni.showLoading({
    title: '提交中...',
    mask: true
  })
  
  // 模拟提交
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '反馈成功',
      icon: 'success'
    })
    closePopup()
  }, 1000)
}

// 复制文本
const copyText = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      })
    }
  })
}

// 跳转到自选页面
const goToFavorites = () => {
  if (!isLoggedIn.value) {
    handleLogin()
    return
  }
  uni.switchTab({
    url: '/pages/market/market'
  })
}

// 跳转到告警页面
const goToAlarms = () => {
  if (!isLoggedIn.value) {
    handleLogin()
    return
  }
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 关注公众号
const followWechat = () => {
  showPopup('attend')
}

// 关于我们
const aboutUs = () => {
  uni.navigateTo({
    url: '/pages/about/about'
  })
}

// 联系我们
const contactUs = () => {
  showPopup('contact')
}

// 捐赠支持
const donateSupport = () => {
  showPopup('reward')
}

// 产品反馈
const productFeedback = () => {
  showPopup('score')
}

// 分享应用
const shareApp = () => {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: 'https://moziinnovations.com',
    title: 'Mozi 行情助手',
    summary: '让财富触手可及',
    imageUrl: 'https://moziinnovations.com/logo.png'
  })
}

// 日历组件事件处理
const handleDateChange = (date) => {
  console.log('选中日期:', date)
}

const handleToggleChange = (checked) => {
  console.log('交易所公告开关状态:', checked)
}

// 页面加载时初始化
onMounted(() => {
  // 可以在这里获取用户统计数据
})
</script>

<template>
  <view class="me">
    <!-- 头部用户信息 -->
    <view class="header">
      <view v-if="isLoggedIn" class="header-user" @click="handleLogin">
        <image 
          class="header-avatar" 
          mode="aspectFill" 
          :src="userInfo.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'" 
        />
        <text>{{ userInfo.nickName || '微信用户' }}</text>
      </view>
      <button v-else class="login-box" @click="handleLogin">
        <view class="header-user">
          <image 
            class="header-avatar" 
            mode="aspectFill" 
            :src="userInfo.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'" 
          />
          <text>{{ userInfo.nickName || '请登录' }}</text>
        </view>
      </button>
      
      <!-- 功能按钮区域 -->
      <view class="action-buttons">
        <view class="action-button" @click="goToFavorites">
          <view class="action-icon">
            <image class="action-icon-img" src="/static/images/profile/alert.png" />
          </view>
          <text class="action-text">我的自选</text>
        </view>
        <view class="action-button" @click="goToAlarms">
          <view class="action-icon">
            <image class="action-icon-img" src="/static/images/profile/like.png" />
          </view>
          <text class="action-text">我的报警</text>
        </view>
        <view class="action-button" @click="followWechat">
          <view class="action-icon">
            <image class="action-icon-img" src="/static/images/profile/wechat.png" />
          </view>
          <text class="action-text">关注公众号</text>
        </view>
      </view>
    </view>

    <!-- 第二排功能按钮 -->
    <view class="secondary-actions">
      <view class="action-row">
        <view class="action-button" @click="productFeedback">
          <view class="action-icon secondary">
            <image class="action-icon-img secondary" src="/static/images/profile/comment.png" />
          </view>
          <text class="action-text secondary">我的评论</text>
        </view>
        <view class="action-button" @click="productFeedback">
          <view class="action-icon secondary">
            <image class="action-icon-img secondary" src="/static/images/profile/notification.png" />
            <view class="badge">3</view>
          </view>
          <text class="action-text secondary">消息通知</text>
        </view>
        <view class="action-button" @click="productFeedback">
          <view class="action-icon secondary">
            <image class="action-icon-img secondary" src="/static/images/profile/upvote.png" />
          </view>
          <text class="action-text secondary">我的点赞</text>
        </view>
      </view>
    </view>

    <!-- 左右分布的功能按钮 -->
    <view class="horizontal-buttons">
      <view class="horizontal-btn left" @click="productFeedback">
        <view class="btn-icon">
          <image class="btn-icon-img" src="/static/images/profile/feedback.png" />
        </view>
        <view class="btn-bottom">
          <view class="btn-content">
            <text class="btn-text">产品功能反馈</text>
            <text class="btn-subtext">留言你想要的功能</text>
          </view>
          <view class="btn-arrow">
            <text class="arrow-icon">></text>
          </view>
        </view>
      </view>
      <button class="horizontal-btn right" open-type="share" @click="shareApp">
        <view class="btn-icon">
          <image class="btn-icon-img" src="/static/images/profile/share.png" />
        </view>
        <view class="btn-bottom">
          <view class="btn-content">
            <text class="btn-text">推荐朋友</text>
            <text class="btn-subtext">分享你的喜爱</text>
          </view>
          <view class="btn-arrow">
            <text class="arrow-icon">></text>
          </view>
        </view>
      </button>
    </view>

    <!-- 我的积分 -->
    <view class="points-section">
      <view class="points-info">
        <text class="points-title">我的积分</text>
        <view class="points-value-row">
          <text class="points-value">{{ mockUserData.points }}</text>
          <text class="points-daily">昨日积分：+{{ mockUserData.yesterdayPoints }}</text>
        </view>
        <text class="points-rank">
          当前排名：总榜第 <text style="color: #000; font-weight: bold">{{ mockUserData.rank }}</text> 名
        </text>
      </view>
      <view class="points-action" @click="productFeedback">
        <text class="points-button">积分榜单</text>
        <text class="arrow-icon">></text>
      </view>
      <image class="points-coin" src="/static/images/background/integral-coin.png" />
    </view>

    <!-- 日历组件 -->
    <view class="calendar-section">
      <CalendarCard
        :on-date-change="handleDateChange"
        :on-toggle-change="handleToggleChange"
        :default-toggle="true"
      />
    </view>

    <!-- 底部菜单 -->
    <view class="footer">
      <view class="footer-list">
        <view class="footer-item" @click="productFeedback">
          <view class="icon">
            <image src="/static/images/profile/skin.png" style="width: 44px; height: 44px" mode="aspectFit" />
          </view>
          <view class="text">皮肤中心</view>
          <view class="extra">></view>
        </view>
        <view class="footer-item" @click="contactUs">
          <view class="icon">
            <image src="/static/images/profile/contact.png" style="width: 44px; height: 44px" mode="aspectFit" />
          </view>
          <view class="text">联系我们</view>
          <view class="extra">></view>
        </view>
        <view class="footer-item" @click="productFeedback">
          <view class="icon">
            <image src="/static/images/profile/social.png" style="width: 44px; height: 44px" mode="aspectFit" />
          </view>
          <view class="text">到社交媒体找我们</view>
          <view class="extra">></view>
        </view>
        <view class="footer-item" @click="aboutUs">
          <view class="icon">
            <image src="/static/images/profile/about.png" style="width: 44px; height: 44px" mode="aspectFit" />
          </view>
          <view class="text">关于</view>
          <view class="extra">></view>
        </view>
        <view class="footer-item" @click="donateSupport">
          <view class="icon">
            <image src="/static/images/profile/donate.png" style="width: 44px; height: 44px" mode="aspectFit" />
          </view>
          <view class="text">捐赠</view>
          <view class="extra">></view>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <button v-if="isLoggedIn" class="logout-btn" @click="handleLogout">退出登录</button>

    <!-- 弹窗容器 -->
    <view v-if="popVisible" class="popup-mask" @click="closePopup">
      <view class="popup-container" @click.stop>
        <!-- 关于弹窗 -->
        <view v-if="popType === 'about'" class="pop-content">
          <view class="about-item">
            Mozi 是一家专业的加密数据分析智能平台，致力于为全球用户提供精准，实时的加密货币市场数据和分析服务，简化交易，降低交易的门槛，帮助用户在加密货币市场中做出明智的投资决策，降低风险，获得更高的收益。
          </view>
          <view class="about-item sec-desc">
            作为一家专业的加密数据分析平台，为解决用户去哪里买，买什么，怎么买的痛点，Mozi通过整合多种数据，提供详尽的搜索和丰富的各类排行榜让用户探索，包括但不限于交易所排行榜，热门币种排行榜，价格涨跌幅榜，目前覆盖主流交易所的数据。
          </view>
          <view class="about-item sec-con">
            <text>Mozi使命：</text>让财富触手可及 
          </view>
          <view class="about-item">
            <text>Mozi愿景：</text>让交易更简单，更智能，更安全
          </view>
          <view class="about-item">
            <text>Mozi价值观：</text>兼爱 务实 专注 创新 自由
          </view>
        </view>

        <!-- 评分弹窗 -->
        <view v-if="popType === 'score'" class="pop-content">
          <text>根据您的使用经历，请问您有多大可能向您的朋友推荐Mozi行情助手</text>
          <view class="score-desc">
            <text>极不愿意</text>
            <text>非常愿意</text>
          </view>
          <view class="score-list">
            <view 
              v-for="item in [1,2,3,4,5,6,7,8,9,10]" 
              :key="item"
              :class="`score-item ${item === reportScore ? 'score-active' : ''}`" 
              @click="selectScore(item)"
            >
              {{ item }}
            </view>
          </view>
          <view class="score-con">
            <view>
              <text>更多反馈</text>
              <text class="score-con-desc">（选填）</text>
            </view>
            <textarea 
              class="score-text" 
              placeholder="感谢反馈，期待您更多的建议" 
              maxlength="200" 
              v-model="scoreInput"
            />
          </view>
          <button 
            :class="`score-btn ${scoreDisable ? 'score-btn-disable' : ''}`" 
            @click="submitScore" 
            :disabled="scoreDisable"
          >
            提交
          </button>
        </view>

        <!-- 联系我们弹窗 -->
        <view v-if="popType === 'contact'" class="pop-content contact-container">
          <text class="contact-title">欢迎联系我们</text>
          <view class="contact-email">
            <text>{{ EMAIL }}</text>
            <view class="contact-copy" @click="copyText(EMAIL)">
              <text>📋</text>
            </view>
          </view>
        </view>

        <!-- 关注公众号弹窗 -->
        <view v-if="popType === 'attend'" class="pop-content">
          <text class="contact-title">欢迎关注我们的公众号</text>
          <image
            class="attend-pic"
            mode="aspectFit"
            show-menu-by-longpress
            src="https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_account.jpg"
          />
        </view>

        <!-- 捐赠弹窗 -->
        <view v-if="popType === 'reward'" class="pop-content scroll-container">
          <text class="contact-title">如果觉着好用，欢迎打赏支持</text>
          <scroll-view scroll-x enable-passive scroll-with-animation style="white-space: nowrap">
            <view class="reward-box">
              <image
                class="attend-pic"
                mode="aspectFit"
                show-menu-by-longpress
                src="https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_pay.jpg"
              />
            </view>
            <view class="reward-box">
              <image
                class="attend-pic"
                mode="aspectFit"
                show-menu-by-longpress
                src="https://image-1317406749.cos.ap-shanghai.myqcloud.com/BTC-simple.jpg"
              />
              <view class="contact-email">
                <text class="coin-key">{{ COINKEY.BTC }}</text>
                <view class="contact-copy" @click="copyText(COINKEY.BTC)">
                  <text>📋</text>
                </view>
              </view>
            </view>
            <view class="reward-box">
              <image
                class="attend-pic"
                mode="aspectFit"
                show-menu-by-longpress
                src="https://image-1317406749.cos.ap-shanghai.myqcloud.com/ETH-simple.jpg"
              />
              <view class="contact-email">
                <text>{{ COINKEY.ETH }}</text>
                <view class="contact-copy" @click="copyText(COINKEY.ETH)">
                  <text>📋</text>
                </view>
              </view>
            </view>
            <view class="reward-box">
              <image
                class="attend-pic"
                mode="aspectFit"
                show-menu-by-longpress
                src="https://image-1317406749.cos.ap-shanghai.myqcloud.com/Tron-simple.jpg"
              />
              <view class="contact-email">
                <text>{{ COINKEY.TRON }}</text>
                <view class="contact-copy" @click="copyText(COINKEY.TRON)">
                  <text>📋</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.me {
  background: #EEF0F3 url('/static/images/background/me-bg.png') no-repeat top center;
  background-size: 100% 460px;
  min-height: 100vh;
  padding: 0 24px;

  .header {
    background: transparent;
    margin-bottom: 20px;
    padding: 80px 0 20px;

    .login-box {
      background-color: transparent;
      border: none;
      width: 100%;
      text-align: left;
      padding: 0;

      &::after {
        border: none;
      }
    }

    .header-user {
      display: flex;
      padding: 10px 14px;
      align-items: center;
      margin-bottom: 50px;
      color: #333;

      .header-avatar {
        width: 90px;
        height: 90px;
        border: 1px solid transparent;
        border-radius: 50%;
        margin-right: 40px;
      }
    }

    // 功能按钮区域
    .action-buttons {
      background: #fff;
      border-radius: 16px;
      margin: 40px 0 0;
      padding: 30px 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: space-around;

      .action-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        .action-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: all 0.3s ease;

          &:active {
            transform: scale(0.95);
          }

          .action-icon-img {
            width: 56px;
            height: 56px;
            object-fit: contain;
          }
        }

        .action-text {
          color: #333;
          font-size: 24px;
          font-weight: 500;
        }
      }
    }
  }

  // 第二排功能按钮
  .secondary-actions {
    background: #fff;
    margin: 20px 0;
    border-radius: 16px;
    padding: 30px 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .action-row {
      display: flex;
      justify-content: space-around;

      .action-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        .action-icon {
          &.secondary {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            position: relative;

            .action-icon-img {
              &.secondary {
                width: 44px;
                height: 44px;
                object-fit: contain;
              }
            }
            transition: all 0.3s ease;

            &:active {
              transform: scale(0.95);
            }

            .badge {
              position: absolute;
              top: -5px;
              right: -5px;
              background: #ff4757;
              color: #fff;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              font-size: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
            }
          }
        }

        .action-text {
          &.secondary {
            color: #333;
            font-size: 24px;
            font-weight: 400;
          }
        }
      }
    }
  }

  // 积分模块
  .points-section {
    background: url('/static/images/background/integral.png') no-repeat center center;
    background-size: 100% 100%;
    margin: 20px 0;
    border-radius: 16px;
    padding: 30px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 180px;
    max-height: 210px;
    position: relative;

    .points-info {
      flex: 1;
      padding-left: 26px;

      .points-title {
        color: #333;
        font-size: 28px;
        font-weight: 500;
        margin-bottom: 10px;
        display: block;
      }

      .points-value-row {
        display: flex;
        align-items: baseline;
        margin-bottom: 10px;
      }

      .points-value {
        color: #52c41a;
        font-size: 50px;
        font-weight: bold;
        margin-bottom: 10px;
        display: block;
      }

      .points-daily {
        color: #707070;
        font-size: 22px;
        margin-left: 20px;
        display: block;
      }

      .points-rank {
        color: #707070;
        font-size: 22px;
        margin-bottom: 5px;
        display: block;
      }
    }

    .points-action {
      position: absolute;
      top: 20px;
      right: 30px;
      display: flex;
      align-items: center;
      
      .points-button {
        color: #fff;
        border-radius: 20px;
        padding: 12px 10px 12px 24px;
        font-size: 24px;
        cursor: pointer;
        font-family: PingFang SC;
        font-weight: 500;
        line-height: 36px;
      }

      .arrow-icon {
        color: #fff;
        font-size: 24px;
        margin-left: 8px;
      }
    }

    .points-coin {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 80px;
      height: 110px;
    }
  }

  // 左右分布的按钮
  .horizontal-buttons {
    margin: 20px 0;
    display: flex;
    gap: 12px;

    .horizontal-btn {
      flex: 1;
      background: #fff;
      border-radius: 20px;
      padding: 20px 16px;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      position: relative;
      cursor: pointer;
      border: none;
      text-align: left;
      border: 1px solid #f0f0f0;

      &::after {
        border: none;
      }

      .btn-icon {
        width: 48px;
        height: 48px;
        background: #f8f9fa;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        align-self: flex-start;
        margin-left: 26px;

        .btn-icon-img {
          width: 44px;
          height: 44px;
        }
      }

      .btn-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .btn-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 0;
        padding-left: 26px;
      }

      .btn-text {
        color: #333;
        font-size: 28px;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 4px;
        text-align: left;
      }

      .btn-subtext {
        color: #999;
        font-size: 22px;
        line-height: 1.3;
        text-align: left;
      }

      .btn-arrow {
        flex-shrink: 0;
        margin-left: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;

        .arrow-icon {
          color: #ccc;
          font-size: 28px;
        }
      }

      &:active {
        background: #f8f8f8;
        transform: scale(0.98);
      }
    }
  }

  .footer {
    margin: 20px 0;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .footer-list {
      background-color: transparent;

      .footer-item {
        border-bottom: none;
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 60px;
        align-items: center;
        background-color: transparent;
        padding: 0 24px;
        text-align: left;
        cursor: pointer;

        .icon {
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .text {
          flex: 1;
          margin-left: 20px;
          font-size: 28px;
          color: #333;
          font-weight: 500;
        }

        .extra {
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A5A9AF;
          font-size: 28px;
        }

        &:active {
          background: #f8f8f8;
        }
      }
    }
  }

  .logout-btn {
    margin: 32px 0 20px 0;
    background: #dc3545;
    border-radius: 20px;
    height: 90px;
    color: #fff;
    font-size: 32px;
    font-weight: 500;
    border: none;
    box-shadow: 0 2px 12px rgba(220, 53, 69, 0.3);
    width: 100%;

    &::after {
      border: none;
    }

    &:active {
      background: #c82333;
      transform: scale(0.98);
    }
  }

  // 弹窗样式
  .popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .popup-container {
    background: white;
    border-radius: 20px 20px 0 0;
    max-height: 80vh;
    width: 100%;
    overflow-y: auto;
  }

  .pop-content {
    padding: 20px;
    box-sizing: border-box;

    .about-item {
      margin-bottom: 10px;
      font-size: 26rpx;

      text {
        font-weight: bold;
      }
    }
    
    .sec-desc {
      margin-top: 20px;
    }

    .sec-con {
      margin-top: 20px;
    }

    .score-desc {
      display: flex;
      justify-content: space-between;
      font-size: 22rpx;
      margin-top: 10rpx;
      color: #898989;
    }
    
    .score-list {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-top: 20px;

      .score-item {
        background-color: #efefef;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border-radius: 10px;
        color: #000;
        cursor: pointer;

        &.score-active {
          background-color: #45e87f;
          color: #fff;
        }
      }
    }

    .score-con {
      margin-top: 20px;

      .score-con-desc {
        color: #898989;
        font-size: 24px;
      }

      .score-text {
        box-sizing: border-box;
        width: 100%;
        height: 200px;
        border: 1px solid #efefef;
        margin-top: 10px;
        padding: 10px;
        border-radius: 8px;
      }
    }

    .score-btn {
      background-color: #02c076;
      color: #fff;
      margin-top: 20px;
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 10px;
      font-size: 16px;

      &.score-btn-disable {
        background-color: #f8f8f8;
        color: #00000040;
      }
    }

    .contact-title {
      margin-bottom: 16px;
      display: block;
      font-size: 18px;
      font-weight: bold;
    }

    .contact-email {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;

      .contact-copy {
        margin-left: 20px;
        padding: 8px;
        background: #007aff;
        border-radius: 8px;
        color: white;
        cursor: pointer;
      }
    }

    .attend-pic {
      width: 100%;
      border-radius: 10px;
    }

    .scroll-container {
      .reward-box {
        font-size: 20px;
        display: inline-block;
        width: 80%;
        margin-right: 20px;
      }

      .coin-key {
        word-wrap: break-word;
        word-break: break-all;
        white-space: normal;
        font-size: 12px;
      }
    }
  }

  .contact-container {
    padding: 30px 20px;
  }
}

// 日历组件样式
.calendar-section {
  margin-bottom: 20px;
}
</style>
