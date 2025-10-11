import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import request from '../../utils/request'
import Interface from '../../utils/constants'
import './index.less'

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState('myPoints')
  const [tasksList, setTasksList] = useState([])
  
  // 导入图片资源
  const imgMozLogo = require('../../assets/image/point/moz_logo@2x.png')
  const imgCoinIcon = require('../../assets/image/point/coin_icon@2x.png')
  const imgClockIcon = require('../../assets/image/point/clock.svg')
  const imgEmoji1 = require('../../assets/image/point/Emoji_1@2x.png')
  const imgEmoji2 = require('../../assets/image/point/Emoji_2@2x.png')
  const imgEmoji3 = require('../../assets/image/point/Emoji_3@2x.png')
  const imgInvite = require('../../assets/image/point/invite@2x.png')
  const imgCopy = require('../../assets/image/point/copy@2x.png')
  const imgInfo = require('../../assets/image/point/info@2x.png')
  const imgPointAlert = require('../../assets/image/point/point_alert@2x.png')
  const imgCertification = require('../../assets/image/point/Certification@2x.png')
  
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

  // 导入图片资源
  const iconContactPerson = require('../../assets/image/point/contact_person@2x.png')
  const iconLike = require('../../assets/image/point/like@2x.png')
  const iconSocialGroup = require('../../assets/image/point/social_group@2x.png')
  const iconTwitter = require('../../assets/image/point/twitter@2x.png')
  const iconSetAlert = require('../../assets/image/point/set_alert@2x.png')
  const iconVideo = require('../../assets/image/point/video@2x.png')
  const iconGlovePraise = require('../../assets/image/point/glove_praise@2x.png')
  const iconPaperAirplane = require('../../assets/image/point/paper_airplane@2x.png')
  const iconNoGlovePraise = require('../../assets/image/point/no_glove_praise@2x.png')
  const iconNotification1 = require('../../assets/image/point/notification_1@2x.png')
  const iconNotification2 = require('../../assets/image/point/notification_2@2x.png')

  const initialTasks = [
    { id: 1, icon: iconContactPerson, title: '首次注册账号', points: 50, status: 'pending', btnText: '去注册' },
    { id: 2, icon: iconLike, title: '关注我们的公众号', points: 50, status: 'pending', btnText: '去关注' },
    { id: 3, icon: iconSocialGroup, title: '加入我们的社群', points: 50, status: 'pending', btnText: '去加入' },
    { id: 4, icon: iconTwitter, title: '早鸟活动', points: 200, status: 'pending', btnText: '去参加' },
    { id: 5, icon: iconSetAlert, title: '设置报警功能', points: 100, status: 'pending', btnText: '去设置' },
    { id: 6, icon: iconVideo, title: '完成视频学习', points: 50, status: 'pending', btnText: '去学习' }
  ]

  const dailyInvestments = [
    { id: 1, icon: iconGlovePraise, title: '每日点赞', rewardLabel: '每个赞', reward: 4, current: 3, total: 47 },
    { id: 2, icon: iconPaperAirplane, title: '发帖', rewardLabel: '每条帖子', reward: 10, current: 10, total: 47 },
    { id: 3, icon: iconNoGlovePraise, title: '收到赞', rewardLabel: '每次被赞', reward: 4, current: 7, total: 47 },
    { id: 4, icon: iconNotification1, title: '回复', rewardLabel: '回复一次', reward: 4, current: 9, total: 10 },
    { id: 5, icon: iconNotification2, title: '帖子收到回复', rewardLabel: '收到回复', reward: 4, current: 10, total: 10, completed: false }
  ]

  // 检查报警状态
  const checkAlarmStatus = async () => {
    try {
      const { data } = await request({
        url: Interface.MY_WARN,
      })

      // 如果用户已设置报警（返回的data不为空且不是登录失败）
      if (data && Object.keys(data).length > 0 && data.isLogin !== false) {
        setTasksList(prevTasks => 
          prevTasks.map(task => 
            task.title === '设置报警功能' 
              ? { ...task, status: 'completed', btnText: '已设置' }
              : task
          )
        )
      }
    } catch (error) {
      console.error('检查报警状态失败:', error)
    }
  }

  useLoad(() => {
    console.log('积分页面加载')
    // 初始化任务列表
    setTasksList(initialTasks)
    // 检查报警状态
    checkAlarmStatus()
  })

  // 页面显示时重新检查报警状态（从报警页面返回时会触发）
  useDidShow(() => {
    checkAlarmStatus()
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

    if (task.title === '早鸟活动') {
      Taro.showToast({
        title: '即将打开推特',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (task.title === '完成视频学习') {
      Taro.navigateTo({
        url: '/packages/videolearn/index'
      })
      return
    }

    if (task.title === '设置报警功能') {
      Taro.navigateTo({
        url: '/packages/addwarn/index?symbol=BTC'
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
      {/* 顶部导航 - 微信小程序不需要，使用原生导航栏 */}
      {/* <View className='top-nav'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <View className='nav-title'>积分中心</View>
      </View> */}

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
              <Image src={imgMozLogo} className='logo' mode='aspectFit' />
            </View>
            <View className='season-info'>
              <Text className='season-title'>{pointsData.season}</Text>
              <View className='season-duration'>
                <Image src={imgClockIcon} className='clock-icon' mode='aspectFit' />
                <Text className='season-duration-text'>{pointsData.seasonStart} 至 {pointsData.seasonEnd}</Text>
              </View>
            </View>
          </View>
          <View className='points-display'>
            <Image src={imgCoinIcon} className='coin-icon' mode='aspectFit' />
            <Text className='points-value'>{pointsData.totalPoints}</Text>
            <View className='history-btn' onClick={() => Taro.showToast({ title: '历史记录开发中', icon: 'none' })}>
              <Image src={imgClockIcon} className='history-icon' mode='aspectFit' />
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
            <Image src={imgEmoji1} className='emoji-icon' mode='aspectFit' />
            <Text className='invite-title'>每次推荐均可获得积分奖励！</Text>
          </View>

          {/* 邀请有奖卡片 */}
          <View className='reward-card'>
            <Image src={imgInvite} className='reward-icon' mode='aspectFit' />
            <View className='reward-info'>
              <Text className='reward-title'>邀请有奖</Text>
              <View className='reward-desc'>
                <Text>每邀请一人 </Text>
                <View className='bonus-points'>
                  <Text>+500</Text>
                  <Image src={imgCoinIcon} className='bonus-coin-icon' mode='aspectFit' />
                </View>
              </View>
            </View>
          </View>

          {/* 邀请链接 */}
          <View className='invite-input-box'>
            <Text className='invite-input-label'>邀请链接</Text>
            <View className='invite-input-content'>
              <Text className='invite-input-text'>{pointsData.inviteLink}</Text>
              <View className='copy-icon-btn' onClick={() => copyToClipboard(pointsData.inviteLink, '邀请链接')}>
                <Image src={imgCopy} className='copy-icon' mode='aspectFit' />
              </View>
            </View>
          </View>

          {/* 邀请码 */}
          <View className='invite-input-box'>
            <Text className='invite-input-label'>邀请码</Text>
            <View className='invite-input-content'>
              <Text className='invite-input-text'>{pointsData.inviteCode}</Text>
              <View className='copy-icon-btn' onClick={() => copyToClipboard(pointsData.inviteCode, '邀请码')}>
                <Image src={imgCopy} className='copy-icon' mode='aspectFit' />
              </View>
            </View>
          </View>

          {/* 统计数据网格 */}
          <View className='stats-grid'>
            <View className='stat-card'>
              <Text className='stat-value'>{pointsData.totalInvites}</Text>
              <Text className='stat-label'>总邀请数</Text>
            </View>
            <View className='stat-card'>
              <Text className='stat-value'>{pointsData.earnedPoints}</Text>
              <Text className='stat-label'>积分</Text>
            </View>
            <View className='stat-card'>
              <Text className='stat-value'>{pointsData.activeInvites}</Text>
              <Text className='stat-label'>申请ETH</Text>
            </View>
            <View className='stat-card'>
              <View className='stat-value'>
                {pointsData.pendingRewards === 0 ? (
                  <Image src={imgInfo} className='info-icon' mode='aspectFit' />
                ) : (
                  <Text>{pointsData.pendingRewards}</Text>
                )}
              </View>
              <Text className='stat-label'>OwO 之后可领取</Text>
            </View>
          </View>

          {/* 说明文字 */}
          <View className='invite-notes'>
            <Text className='note-text'>1. 每天前20个推荐均可获得积分。</Text>
            <Text className='note-text'>2. 如果您的推荐人购买会员资格，您将获得积分和20%的费用回扣。</Text>
            <Text className='note-text'>3. 推荐有效的前提是被邀请用户必须输入邀请码</Text>
          </View>
        </View>

        {/* 疯狂爱好者积分奖励 */}
        <View className='tasks-section'>
          <View className='tasks-section-header'>
            <Image src={imgEmoji2} className='header-icon-img' mode='aspectFit' />
            <Text className='tasks-title'>做任务得积分奖励</Text>
          </View>
          
          <View className='tasks-list'>
            {tasksList.map(task => (
              <View key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                <View className='task-icon-wrapper'>
                  <Image src={task.icon} className='task-icon-img' mode='aspectFit' />
                </View>
                <View className='task-info'>
                  <Text className='task-title'>{task.title}</Text>
                  <View className='task-points'>
                    <Text className='task-points-text'>+{task.points}</Text>
                    <Image src={imgCoinIcon} className='task-coin-icon' mode='aspectFit' />
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
            <Image src={imgEmoji3} className='header-icon-img' mode='aspectFit' />
            <Text className='section-title'>每日奖励任务</Text>
          </View>

          <View className='investment-list'>
            {dailyInvestments.map(item => (
              <View key={item.id} className='investment-item'>
                <View className='investment-icon'>
                  <Image src={item.icon} className='investment-icon-img' mode='aspectFit' />
                </View>
                <View className='investment-info'>
                  <Text className='investment-title'>{item.title}</Text>
                  <View className='investment-subtitle'>
                    <Text>{item.rewardLabel}</Text>
                    <Text className='reward-value'>+{item.reward}</Text>
                    <Image src={imgCoinIcon} className='investment-coin-icon' mode='aspectFit' />
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
          <View className='bottom-btn' onClick={() => Taro.navigateTo({ url: '/packages/addwarn/index?symbol=BTC' })}>
            <View className='bottom-btn-content'>
              <Text className='bottom-btn-title'>加入报警</Text>
              <Text className='bottom-btn-subtitle'>Add an alarm</Text>
            </View>
            <Image src={imgPointAlert} className='bottom-icon' mode='aspectFit' />
          </View>

          <View className='bottom-btn' onClick={() => Taro.navigateTo({ url: '/packages/kyc/index' })}>
            <View className='bottom-btn-content'>
              <Text className='bottom-btn-title'>认证</Text>
              <Text className='bottom-btn-subtitle'>certification</Text>
            </View>
            <Image src={imgCertification} className='bottom-icon' mode='aspectFit' />
          </View>
        </View>
      </View>
    </View>
  )
}
