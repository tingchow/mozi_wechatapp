import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.less'

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState('myPoints')
  
  const pointsData = {
    totalPoints: 45123,
    season: 'S5赛季',
    seasonStart: '2025-09-25',
    seasonEnd: '2025-10-25',
    inviteLink: 'y79lll/e]suow\'eloos\'s//:sd14',
    inviteCode: '30L234',
    totalInvites: 50,
    earnedPoints: 21323,
    activeInvites: 50,
    pendingRewards: 0
  }

  const tasks = [
    { id: 1, icon: '/point/contact_person@2x.png', title: '首次注册账号', points: 50, status: 'pending', btnText: '去注册' },
    { id: 2, icon: '/point/like@2x.png', title: '关注我们的公众号', points: 50, status: 'completed', btnText: '已关注' },
    { id: 3, icon: '/point/social_group@2x.png', title: '加入我们的社群', points: 50, status: 'pending', btnText: '去加入' },
    { id: 4, icon: '/point/twitter@2x.png', title: '早鸟活动', points: 200, status: 'pending', btnText: '去参加' },
    { id: 5, icon: '/point/set_alert@2x.png', title: '设置报警功能', points: 100, status: 'completed', btnText: '已设置' },
    { id: 6, icon: '/point/video@2x.png', title: '完成视频学习', points: 50, status: 'pending', btnText: '去学习' }
  ]

  const dailyInvestments = [
    { id: 1, icon: '/point/glove_praise@2x.png', title: '每日点赞', rewardLabel: '每个赞', reward: 4, current: 3, total: 47 },
    { id: 2, icon: '/point/paper_airplane@2x.png', title: '发帖', rewardLabel: '每条帖子', reward: 10, current: 10, total: 47 },
    { id: 3, icon: '/point/no_glove_praise@2x.png', title: '收到赞', rewardLabel: '每次被赞', reward: 4, current: 7, total: 47 },
    { id: 4, icon: '/point/notification_1@2x.png', title: '回复', rewardLabel: '回复一次', reward: 4, current: 9, total: 10 },
    { id: 5, icon: '/point/notification_2@2x.png', title: '帖子收到回复', rewardLabel: '收到回复', reward: 4, current: 10, total: 10, completed: true }
  ]

  useLoad(() => {
    console.log('积分页面加载')
  })

  const goBack = () => {
    Taro.navigateBack()
  }

  const handleTaskClick = (task) => {
    if (task.status === 'completed') {
      Taro.showToast({
        title: '任务已完成',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (task.btnText === '去注册' || task.title === '首次注册账号') {
      Taro.navigateTo({
        url: '/pages/user/index'
      })
      return
    }

    if (task.icon && task.icon.includes('twitter')) {
      Taro.showToast({
        title: '即将打开推特',
        icon: 'none',
        duration: 2000
      })
      return
    }

    Taro.showToast({
      title: `${task.btnText}功能开发中`,
      icon: 'none',
      duration: 2000
    })
  }

  const copyToClipboard = (text, label) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: `${label}已复制`,
          icon: 'success',
          duration: 2000
        })
      },
      fail: () => {
        Taro.showToast({
          title: '复制失败',
          icon: 'error',
          duration: 2000
        })
      }
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  return (
    <View className='points-detail-container'>
      {/* 顶部导航 */}
      <View className='top-nav'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <View className='nav-title'>积分中心</View>
      </View>

      {/* 顶部Tab */}
      <View className='tabs-container'>
        <View 
          className={`tab-item ${activeTab === 'myPoints' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('myPoints')}
        >
          <Text className='tab-text'>我的积分</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'myInvites' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('myInvites')}
        >
          <Text className='tab-text'>我的邀请</Text>
        </View>
      </View>

      <View className='top-section'>
        {/* 积分卡片 */}
        <View className='points-card'>
          <View className='season-background-card'>
            <View className='card-header'>
              <Image src='../../assets/image/point/moz_logo@2x.png' className='logo' mode='aspectFit' />
            </View>
            <View className='season-info'>
              <Text className='season-title'>{pointsData.season}</Text>
              <View className='season-duration'>
                <Text className='clock-icon'>🕐</Text>
                <Text>{pointsData.seasonStart} 至 {pointsData.seasonEnd}</Text>
              </View>
            </View>
          </View>
          <View className='points-display'>
            <Image src='../../assets/image/point/coin_icon@2x.png' className='coin-icon' mode='aspectFit' />
            <Text className='points-value'>{pointsData.totalPoints}</Text>
            <View className='history-btn' onClick={() => Taro.showToast({ title: '历史记录开发中', icon: 'none' })}>
              <Text className='history-icon'>🕐</Text>
              <Text className='history-text'>历史记录</Text>
            </View>
          </View>
          {/* 角色图片暂时隐藏 */}
          {/* <Image 
            src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/image/points-character.png'
            className='character-img'
            mode='aspectFit'
          /> */}
        </View>

        {/* MOZI横幅 */}
        <View className='mozi-banner' />
      </View>

      <View className='bottom-section'>
        {/* 邀请推荐区域 */}
        <View className='invite-section'>
          {/* 标题区域 */}
          <View className='invite-header'>
            <Image src='../../assets/image/point/Emoji_1@2x.png' className='emoji-icon' mode='aspectFit' />
            <Text className='invite-title'>邀请推荐</Text>
          </View>

          {/* 邀请有奖卡片 */}
          <View className='reward-card'>
            <Image src='../../assets/image/point/invite@2x.png' className='reward-icon' mode='aspectFit' />
            <View className='reward-info'>
              <Text className='reward-title'>邀请有奖</Text>
              <View className='reward-desc'>
                <Text>每邀请1人 </Text>
                <Text className='bonus-points'>
                  +500
                  <Image src='../../assets/image/point/coin_icon@2x.png' className='bonus-coin-icon' mode='aspectFit' />
                </Text>
              </View>
            </View>
          </View>

          {/* 邀请链接 */}
          <View className='invite-input-box'>
            <Text className='invite-input-label'>邀请链接</Text>
            <View className='invite-input-content'>
              <Text className='invite-input-text'>{pointsData.inviteLink}</Text>
              <View className='copy-icon-btn' onClick={() => copyToClipboard(pointsData.inviteLink, '邀请链接')}>
                <Image src='../../assets/image/point/copy@2x.png' className='copy-icon' mode='aspectFit' />
              </View>
            </View>
          </View>

          {/* 邀请码 */}
          <View className='invite-input-box'>
            <Text className='invite-input-label'>邀请码</Text>
            <View className='invite-input-content'>
              <Text className='invite-input-text'>{pointsData.inviteCode}</Text>
              <View className='copy-icon-btn' onClick={() => copyToClipboard(pointsData.inviteCode, '邀请码')}>
                <Image src='../../assets/image/point/copy@2x.png' className='copy-icon' mode='aspectFit' />
              </View>
            </View>
          </View>

          {/* 统计数据网格 */}
          <View className='stats-grid'>
            <View className='stat-card'>
              <Text className='stat-value'>{pointsData.totalInvites}</Text>
              <Text className='stat-label'>累计邀请</Text>
            </View>
            <View className='stat-card'>
              <Text className='stat-value'>{pointsData.earnedPoints}</Text>
              <Text className='stat-label'>已赚积分</Text>
            </View>
            <View className='stat-card'>
              <Text className='stat-value'>{pointsData.activeInvites}</Text>
              <Text className='stat-label'>活跃邀请</Text>
            </View>
            <View className='stat-card'>
              <View className='stat-value'>
                {pointsData.pendingRewards === 0 ? (
                  <Image src='../../assets/image/point/info@2x.png' className='info-icon' mode='aspectFit' />
                ) : (
                  <Text>{pointsData.pendingRewards}</Text>
                )}
              </View>
              <Text className='stat-label'>待领取奖励</Text>
            </View>
          </View>

          {/* 说明文字 */}
          <View className='invite-notes'>
            <Text className='note-text'>1. 邀请好友注册并完成首次登录即可获得积分</Text>
            <Text className='note-text'>2. 被邀请人需在7天内完成首次登录</Text>
            <Text className='note-text'>3. 每个账号仅可被邀请一次</Text>
          </View>
        </View>

        {/* 疯狂爱好者积分奖励 */}
        <View className='tasks-section'>
          <View className='tasks-section-header'>
            <Image src='../../assets/image/point/Emoji_2@2x.png' className='header-icon-img' mode='aspectFit' />
            <Text className='tasks-title'>疯狂爱好者积分奖励</Text>
          </View>
          
          <View className='tasks-list'>
            {tasks.map(task => (
              <View key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                <View className='task-icon-wrapper'>
                  <Image src={`../../assets/image${task.icon}`} className='task-icon-img' mode='aspectFit' />
                </View>
                <View className='task-info'>
                  <Text className='task-title'>{task.title}</Text>
                  <View className='task-points'>
                    <Text className='task-points-text'>+{task.points}</Text>
                    <Image src='../../assets/image/point/coin_icon@2x.png' className='task-coin-icon' mode='aspectFit' />
                  </View>
                </View>
                <View 
                  className={`task-btn ${task.status === 'completed' ? 'completed-btn' : ''}`}
                  onClick={() => handleTaskClick(task)}
                >
                  <Text className='task-btn-text'>{task.btnText}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 获得更多积分横幅 */}
        <View className='earn-more-banner' />

        {/* 每日投资排行 */}
        <View className='daily-investment-section'>
          <View className='section-header'>
            <Image src='../../assets/image/point/Emoji_3@2x.png' className='header-icon-img' mode='aspectFit' />
            <Text className='section-title'>每日奖励任务</Text>
          </View>

          <View className='investment-list'>
            {dailyInvestments.map(item => (
              <View key={item.id} className='investment-item'>
                <View className='investment-icon'>
                  <Image src={`../../assets/image${item.icon}`} className='investment-icon-img' mode='aspectFit' />
                </View>
                <View className='investment-info'>
                  <Text className='investment-title'>{item.title}</Text>
                  <View className='investment-subtitle'>
                    <Text>{item.rewardLabel}</Text>
                    <Text className='reward-value'>+{item.reward}</Text>
                    <Image src='../../assets/image/point/coin_icon@2x.png' className='investment-coin-icon' mode='aspectFit' />
                  </View>
                  <View className='progress-row'>
                    <View className='progress-bar'>
                      <View 
                        className='progress-fill' 
                        style={`width: ${item.total > 0 ? (item.current / item.total * 100) : 100}%`}
                      />
                      <View
                        className='progress-handle'
                        style={`left: ${item.total > 0 ? (item.current / item.total * 100) : 100}%`}
                      >
                        <Text className='progress-handle-text'>{item.current}</Text>
                      </View>
                    </View>
                    <View className='investment-progress'>
                      {item.completed ? (
                        <Text className='completed-label'>已完成</Text>
                      ) : (
                        <Text>{item.current}/{item.total}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 底部按钮 */}
        <View className='bottom-buttons'>
          <View className='bottom-btn' onClick={() => Taro.showToast({ title: '加入报警功能开发中', icon: 'none' })}>
            <View className='bottom-btn-content'>
              <Text className='bottom-btn-title'>加入报警</Text>
              <Text className='bottom-btn-subtitle'>Add an alarm</Text>
            </View>
            <Image src='../../assets/image/point/point_alert@2x.png' className='bottom-icon' mode='aspectFit' />
          </View>

          <View className='bottom-btn' onClick={() => Taro.showToast({ title: '认证功能开发中', icon: 'none' })}>
            <View className='bottom-btn-content'>
              <Text className='bottom-btn-title'>认证</Text>
              <Text className='bottom-btn-subtitle'>certification</Text>
            </View>
            <Image src='../../assets/image/point/Certification@2x.png' className='bottom-icon' mode='aspectFit' />
          </View>
        </View>
      </View>
    </View>
  )
}


