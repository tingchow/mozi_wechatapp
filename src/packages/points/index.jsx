import { View, Text, Button, Image, PageContainer } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad, useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { request } from '../../utils/request'
import { Interface, INTERFACE_URL } from '../../utils/constants'
import './index.less'

function PointsPage() {
  const [activeTab, setActiveTab] = useState('myPoints')
  const [tasksList, setTasksList] = useState([])
  const [verifyingTaskId, setVerifyingTaskId] = useState(null) // 正在验证的任务ID
  const [popVisible, setPopVisible] = useState(false)
  const [popType, setPopType] = useState('')
  // 添加积分数据状态
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    season: 'S5赛季',
    seasonStart: '2025-09-25',
    seasonEnd: '2025-10-25',
    inviteLink: '',
    inviteCode: '',
    totalInvites: 0,
    earnedPoints: 0,
    activeInvites: 0,
    pendingRewards: 0
  })
  
  // 获取当前用户ID（用于任务状态与用户绑定）
  const getUserId = () => {
    const userInfo = Taro.getStorageSync('userInfo')
    return userInfo?.userId || 'default'
  }
  
  // 获取用户专属的任务存储key
  const getTasksStorageKey = () => {
    const userId = getUserId()
    return `pointsTasks_${userId}`
  }
  
  // 检查是否在2026年之前（早鸟活动有效期）
  const isBeforeYear2025 = () => {
    const now = new Date()
    const year2025 = new Date('2026-01-01 00:00:00')
    return now < year2025
  }
  
  // CDN 图片资源
  const CDN_BASE = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point'
  const imgMozLogo = `${CDN_BASE}/moz_logo@2x.png`
  const imgCoinIcon = `${CDN_BASE}/coin_icon@2x.png`
  const imgClockIcon = `${CDN_BASE}/clock.svg`
  const imgEmoji1 = `${CDN_BASE}/Emoji_1@2x.png`
  const imgEmoji2 = `${CDN_BASE}/Emoji_2@2x.png`
  const imgEmoji3 = `${CDN_BASE}/Emoji_3@2x.png`
  const imgInvite = `${CDN_BASE}/invite@2x.png`
  const imgCopy = `${CDN_BASE}/copy@2x.png`
  const imgInfo = `${CDN_BASE}/info@2x.png`
  const imgPointAlert = `${CDN_BASE}/point_alert@2x.png`
  const imgCertification = `${CDN_BASE}/Certification@2x.png`
  
  // 获取积分数据的函数
  const fetchPointsData = async () => {
    console.log('🔍 [积分接口] 开始获取积分数据...')
    console.log('🔍 [积分接口] 接口地址:', Interface.TASK_POINTS)
    
    const res = await request({
      url: Interface.TASK_POINTS,
      method: 'GET'
    })
    
    console.log('🔍 [积分接口] 接口返回:', res)
    
    if (res?.code === 0 && res?.data) {
      const data = res.data
      console.log('🔍 [积分接口] 返回的完整数据:', JSON.stringify(data, null, 2))
      console.log('🔍 [积分接口] inviteCode:', data.inviteCode)
      console.log('🔍 [积分接口] invitationCode:', data.invitationCode)
      
      const newPointsData = {
        totalPoints: data.totalPoints ?? 0,
        inviteLink: data.inviteLink ?? '',
        inviteCode: data.inviteCode || data.invitationCode || '',
        totalInvites: data.totalInvites ?? 0,
        earnedPoints: data.earnedPoints ?? 0,
        seasonStart: data.seasonStart ?? '2025-09-25',
        seasonEnd: data.seasonEnd ?? '2025-10-25'
      }
      
      console.log('🔍 [积分接口] 处理后的邀请码:', newPointsData.inviteCode)
      
      setPointsData(prev => ({
        ...prev,
        ...newPointsData
      }))
      
      // 保存到本地存储，供分享功能使用
      Taro.setStorageSync('pointsData', newPointsData)
      
      console.log('✅ 积分数据更新成功，totalPoints:', data.totalPoints, 'inviteCode:', newPointsData.inviteCode)
    } else {
      console.log('⚠️ 接口返回非成功状态:', res)
    }
  }
  
  // 从本地存储加载用户数据（含邀请码）
  const loadUserDataFromStorage = () => {
    try {
      const { getUserData, getInviteCode } = require('../../utils/userHelper')
      
      // 获取用户数据
      const userData = getUserData()
      const inviteCode = getInviteCode()
      
      console.log('🔍 [积分页面] 从本地存储加载用户数据')
      console.log('🔍 [积分页面] 用户数据:', userData)
      console.log('🔍 [积分页面] 邀请码:', inviteCode)
      
      if (inviteCode) {
        setPointsData(prev => ({
          ...prev,
          inviteCode
        }))
        console.log('✅ [积分页面] 邀请码已加载:', inviteCode)
      } else {
        console.log('⚠️ [积分页面] 本地存储中没有邀请码')
      }
    } catch (error) {
      console.error('❌ [积分页面] 加载用户数据失败:', error)
    }
  }
  
  // 获取邀请列表数据
  const fetchInvitationList = async () => {
    try {
      const res = await request({
        url: Interface.TASK_INVITATION_LIST,
        method: 'GET'
      })
      
      console.log('🔍 [邀请列表] 接口返回:', res)
      console.log('🔍 [邀请列表] 返回的完整数据:', JSON.stringify(res?.data, null, 2))
      
      if (res?.code === 0 && res?.data) {
        const data = res.data
        const invitations = data.invitations || data || []
        const inviteCode = data.invitationCode || data.inviteCode || ''
        
        console.log('🔍 [邀请列表] 提取的邀请码:', inviteCode)
        console.log('🔍 [邀请列表] 总邀请数:', data.totalInvites)
        
        setPointsData(prev => {
          const updated = {
            ...prev,
            inviteCode: inviteCode || prev.inviteCode,
            inviteLink: data.inviteLink || prev.inviteLink,
            totalInvites: data.totalInvites ?? invitations.length ?? prev.totalInvites,
            earnedPoints: data.totalInvitePoints ?? prev.earnedPoints
          }
          // 更新本地存储
          Taro.setStorageSync('pointsData', updated)
          console.log('✅ [邀请列表] 数据已更新，邀请码:', updated.inviteCode, '邀请积分:', updated.earnedPoints)
          return updated
        })
      }
    } catch (error) {
      console.error('获取邀请列表失败:', error)
    }
  }

  // 任务和每日任务图标
  const iconContactPerson = `${CDN_BASE}/contact_person@2x.png`
  const iconLike = `${CDN_BASE}/like@2x.png`
  const iconSocialGroup = `${CDN_BASE}/social_group@2x.png`
  const iconTwitter = `${CDN_BASE}/twitter@2x.png`
  const iconSetAlert = `${CDN_BASE}/set_alert@2x.png`
  const iconVideo = `${CDN_BASE}/video@2x.png`
  const iconGlovePraise = `${CDN_BASE}/glove_praise@2x.png`
  const iconPaperAirplane = `${CDN_BASE}/paper_airplane@2x.png`
  const iconNoGlovePraise = `${CDN_BASE}/%20no_glove_praise@2x.png`
  const iconNotification1 = `${CDN_BASE}/notification_1@2x.png`
  const iconNotification2 = `${CDN_BASE}/notification_2@2x.png`

  const initialTasks = [
    { id: 1, icon: iconContactPerson, title: '首次登录账号', points: 50, status: 'pending', btnText: '去登录', needsAction: true },
    { id: 2, icon: iconLike, title: '关注我们的公众号', points: 50, status: 'pending', btnText: '去关注', needsAction: true },
    { id: 3, icon: iconSocialGroup, title: '加入我们的社群', points: 50, status: 'pending', btnText: '去加入', needsAction: true },
    { id: 4, icon: iconTwitter, title: '早鸟活动', points: 200, status: 'pending', btnText: '去参加', needsAction: true },
    { id: 5, icon: iconSetAlert, title: '设置报警功能', points: 100, status: 'pending', btnText: '去设置', needsAction: true },
    { id: 6, icon: iconVideo, title: '完成视频学习', points: 50, status: 'pending', btnText: '去学习', needsAction: true }
  ]

  // 每日任务初始数据（降级方案）
  const initialDailyTasks = [
    { id: 1, icon: iconGlovePraise, title: '每日点赞', rewardLabel: '每个赞', reward: 4, current: 3, total: 47 },
    { id: 2, icon: iconPaperAirplane, title: '发帖', rewardLabel: '每条帖子', reward: 10, current: 10, total: 47 },
    { id: 3, icon: iconNoGlovePraise, title: '收到赞', rewardLabel: '每次被赞', reward: 4, current: 7, total: 47 },
    { id: 4, icon: iconNotification1, title: '回复', rewardLabel: '回复一次', reward: 4, current: 9, total: 10 },
    { id: 5, icon: iconNotification2, title: '帖子收到回复', rewardLabel: '收到回复', reward: 4, current: 10, total: 10, completed: false }
  ]
  
  // 每日任务 state
  const [dailyInvestments, setDailyInvestments] = useState(initialDailyTasks)

  // 任务图标映射（与原项目对齐）
  const taskIconMap = {
    'REGISTER': iconContactPerson,
    'WECHAT': iconLike,
    'COMMUNITY': iconSocialGroup,
    'EARLY_BIRD': iconTwitter,
    'ALARM': iconSetAlert,
    'VIDEO': iconVideo,
  }
  
  // 任务标题映射（taskCode -> 中文标题）
  const taskTitleMap = {
    'REGISTER': '首次登录账号',
    'WECHAT': '关注我们的公众号',
    'COMMUNITY': '加入我们的社群',
    'EARLY_BIRD': '早鸟活动',
    'ALARM': '设置报警功能',
    'VIDEO': '完成视频学习',
  }
  
  // 任务按钮文本映射
  const taskBtnTextMap = {
    'REGISTER': '去登录',
    'WECHAT': '去关注',
    'COMMUNITY': '去加入',
    'EARLY_BIRD': '去参加',
    'ALARM': '去设置',
    'VIDEO': '去学习',
  }
  
  // 每日任务图标映射（与原项目对齐）
  const dailyTaskIconMap = {
    'DAILY_LIKE': iconGlovePraise,
    'POST': iconPaperAirplane,
    'RECEIVE_LIKE': iconNoGlovePraise,
    'REPLY': iconNotification1,
    'POST_RECEIVE_REPLY': iconNotification2,
    'DAILY_LOGIN': iconContactPerson,
  }
  
  // 从后端获取任务列表（与原项目对齐）
  const fetchTasksList = async () => {
    try {
      console.log('🔍 [任务列表] 开始获取任务列表...')
      
      const res = await request({
        url: Interface.TASK_LIST,
        method: 'GET'
      })
      
      console.log('🔍 [任务列表] 接口返回:', res)
      
      if (res?.code === 0 && res?.data) {
        const activityTasks = res.data.activityTaskList || []
        
        console.log('🔍 [任务列表] 活动任务列表:', activityTasks)
        
        // 过滤掉微信端不需要的任务
        const filteredTasks = activityTasks.filter(task => {
          // 过滤邀请用户任务
          if (task.taskCode === 'INVITE_USER') return false
          
          // 过滤关注Twitter任务（taskCode 是 TWITTER）
          if (task.taskCode === 'TWITTER') return false
          if (task.taskCode === 'FOLLOW_TWITTER') return false
          
          return true
        })
        
        console.log('🔍 [任务列表] 过滤后的任务列表:', filteredTasks)
        
        if (filteredTasks.length > 0) {
          // 映射为前端需要的格式
          const mappedTasks = filteredTasks
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((task, index) => ({
              id: task.id || index + 1,
              taskCode: task.taskCode,
              icon: taskIconMap[task.taskCode] || iconSetAlert,
              title: taskTitleMap[task.taskCode] || task.taskName,
              points: task.rewardPoints || 0,
              status: task.isCompleted ? 'completed' : 'pending',
              btnText: task.isCompleted ? '已完成' : taskBtnTextMap[task.taskCode] || '去完成',
              needsAction: !task.isCompleted
            }))
          
          console.log('✅ [任务列表] 映射后的任务列表:', mappedTasks)
          
          setTasksList(mappedTasks)
          
          // 保存到本地存储（按用户ID）
          const tasksKey = getTasksStorageKey()
          Taro.setStorageSync(tasksKey, mappedTasks)
        } else {
          console.log('⚠️ [任务列表] 没有可用的任务，使用默认任务列表')
          setTasksList(initialTasks)
        }
        
        // 处理每日任务 dailyTaskList（与原项目对齐）
        const dailyTasks = res.data.dailyTaskList || []
        console.log('🔍 [每日任务] 每日任务列表:', dailyTasks)
        
        if (dailyTasks.length > 0) {
          const mappedDailyTasks = dailyTasks
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((task, index) => ({
              id: task.taskCode || index + 1,
              icon: dailyTaskIconMap[task.taskCode] || iconGlovePraise,
              title: task.taskName,
              rewardLabel: task.taskDesc,
              reward: task.rewardPoints || 0,
              current: task.currentProgress || 0,
              total: task.targetProgress || 1,
              completed: task.isCompleted || false,
            }))
          
          console.log('✅ [每日任务] 映射后的每日任务列表:', mappedDailyTasks)
          setDailyInvestments(mappedDailyTasks)
        } else {
          console.log('⚠️ [每日任务] 没有每日任务数据，使用默认数据')
        }
      } else {
        console.log('⚠️ [任务列表] 接口返回非成功状态，使用默认任务列表')
        setTasksList(initialTasks)
      }
    } catch (error) {
      console.error('❌ [任务列表] 获取任务列表失败:', error)
      // 失败时使用默认任务列表
      setTasksList(initialTasks)
    }
  }
  
  // 检查已完成的任务（页面加载时）
  const checkCompletedTasks = async () => {
    try {
      // 检查首次登录任务 - 如果已登录且任务未完成，将按钮改为"验证"状态
      const token = Taro.getStorageSync('token')
      
      if (token) {
        // 用户已登录，检查任务是否已完成
        const tasksKey = getTasksStorageKey()
        const savedTasks = Taro.getStorageSync(tasksKey) || []
        const firstLoginTask = savedTasks.find(task => task.title === '首次登录账号')
        const earlyBirdTask = savedTasks.find(task => task.title === '早鸟活动')
        
        // 如果首次登录任务未完成，将按钮改为"验证"
        if (!firstLoginTask || firstLoginTask.status !== 'completed') {
          setTasksList(prevTasks => {
            const updatedTasks = prevTasks.map(task => 
              task.title === '首次登录账号' 
                ? { ...task, status: 'pending', btnText: '验证', needsAction: false }
                : task
            )
            // 保存到本地存储（按用户ID）
            Taro.setStorageSync(tasksKey, updatedTasks)
            return updatedTasks
          })
          console.log('🔔 用户已登录，可点击验证按钮完成任务')
        }
        
        // 检查早鸟活动任务 - 在2026年之前，用户登录了就可以领取
        if (isBeforeYear2025() && (!earlyBirdTask || earlyBirdTask.status !== 'completed')) {
          setTasksList(prevTasks => {
            const updatedTasks = prevTasks.map(task => 
              task.title === '早鸟活动' 
                ? { ...task, status: 'pending', btnText: '验证', needsAction: false }
                : task
            )
            // 保存到本地存储（按用户ID）
            Taro.setStorageSync(tasksKey, updatedTasks)
            return updatedTasks
          })
          console.log('🎉 早鸟活动进行中，可点击验证按钮完成任务')
        } else if (!isBeforeYear2025() && (!earlyBirdTask || earlyBirdTask.status !== 'completed')) {
          // 如果已过期，标记为不可用
          setTasksList(prevTasks => {
            const updatedTasks = prevTasks.map(task => 
              task.title === '早鸟活动' 
                ? { ...task, status: 'expired', btnText: '已过期', needsAction: false }
                : task
            )
            return updatedTasks
          })
          console.log('⏰ 早鸟活动已过期')
        }
      }
      
      // 如果未登录但在活动期内，早鸟活动按钮仍显示"去参加"
      if (!token && isBeforeYear2025()) {
        const tasksKey = getTasksStorageKey()
        const savedTasks = Taro.getStorageSync(tasksKey) || []
        const earlyBirdTask = savedTasks.find(task => task.title === '早鸟活动')
        
        if (!earlyBirdTask || earlyBirdTask.status !== 'completed') {
          console.log('🎯 早鸟活动进行中，请先登录')
        }
      }
      
      // 检查报警任务 - 如果已登录且任务未完成，将按钮改为"验证"状态
      if (token) {
        const tasksKey = getTasksStorageKey()
        const savedTasks = Taro.getStorageSync(tasksKey) || []
        const setWarnTask = savedTasks.find(task => task.title === '设置报警功能')
        
        // 如果任务未完成，将按钮改为"验证"
        if (!setWarnTask || setWarnTask.status !== 'completed') {
          setTasksList(prevTasks => {
            const updatedTasks = prevTasks.map(task => 
              task.title === '设置报警功能' 
                ? { ...task, status: 'pending', btnText: '验证', needsAction: false }
                : task
            )
            // 保存到本地存储（按用户ID）
            Taro.setStorageSync(tasksKey, updatedTasks)
            return updatedTasks
          })
          console.log('🔔 用户已登录，可点击验证按钮完成设置报警任务')
        }
      }
      
      // 早鸟活动自动完成逻辑：2026年1月24日前登录的用户自动完成（与原项目对齐）
      if (token) {
        const now = new Date()
        const deadline = new Date('2026-01-24T23:59:59')
        
        // 如果用户已登录且在截止日期前
        if (now <= deadline) {
          console.log('🔍 [早鸟活动] 用户已登录且在截止日期前，自动完成任务')
          
          // 检查任务是否已完成
          const tasksKey = getTasksStorageKey()
          const savedTasks = Taro.getStorageSync(tasksKey) || []
          const earlyBirdTask = savedTasks.find(task => task.title === '早鸟活动' || task.taskCode === 'EARLY_BIRD')
          
          // 如果任务未完成，自动调用完成接口
          if (!earlyBirdTask || earlyBirdTask.status !== 'completed') {
            try {
              const { reportTaskComplete } = require('../../utils/taskHelper')
              const res = await reportTaskComplete('EARLY_BIRD', { silent: false })
              
              console.log('🔍 [早鸟活动] 自动完成结果:', res)
              
              if (res?.code === 0 && res?.data?.success) {
                console.log('✅ [早鸟活动] 自动完成成功')
                // 刷新任务列表和积分
                fetchTasksList()
                fetchPointsData()
              }
            } catch (error) {
              console.error('❌ [早鸟活动] 自动完成失败:', error)
            }
          } else {
            console.log('ℹ️ [早鸟活动] 任务已完成，无需重复上报')
          }
        } else {
          console.log('⏰ [早鸟活动] 活动已过期')
        }
      }
      
      // TODO: 可以在这里检查其他已完成的任务
      // 比如检查是否已关注公众号等
    } catch (error) {
      console.error('检查任务状态失败:', error)
    }
  }

  useLoad(() => {
    console.log('========================================')
    console.log('🎯 [积分页面] 页面加载开始')
    console.log('========================================')
    
    // 检查是否携带邀请码
    checkInviteCode()
    
    // 获取积分数据
    console.log('🎯 [积分页面] 准备调用 fetchPointsData()')
    fetchPointsData()
    console.log('🎯 [积分页面] fetchPointsData() 已调用')
    
    // 从本地存储加载用户数据（包括邀请码）
    loadUserDataFromStorage()
    
    // 获取邀请列表
    fetchInvitationList()
    
    // 从后端获取任务列表（与原项目对齐）
    fetchTasksList()
    
    // 从本地存储恢复任务状态（按用户ID）- 作为降级方案
    const tasksKey = getTasksStorageKey()
    const savedTasks = Taro.getStorageSync(tasksKey)
    const userId = getUserId()
    
    if (savedTasks && savedTasks.length > 0) {
      console.log(`📦 用户[${userId}]从本地存储恢复任务状态`, savedTasks)
      setTasksList(savedTasks)
    } else {
      console.log(`🆕 用户[${userId}]使用初始任务列表`)
      setTasksList(initialTasks)
    }
    
    // 检查已完成的任务
    checkCompletedTasks()
  })
  
  // 检查邀请码
  const checkInviteCode = () => {
    try {
      // 获取页面参数 - 多种方式尝试
      const instance = Taro.getCurrentInstance()
      const router = instance.router
      let inviteCode = router?.params?.inviteCode
      
      // 如果从 router.params 获取不到，尝试从 URL 解析
      if (!inviteCode) {
        const url = router?.path || ''
        const match = url.match(/inviteCode=([^&]+)/)
        if (match) {
          inviteCode = match[1]
        }
      }
      
      // 如果还是获取不到，检查本地存储
      if (!inviteCode) {
        inviteCode = Taro.getStorageSync('pendingInviteCode')
      }
      
      console.log('🔍 [积分页面-邀请码] 完整路由信息:', router)
      console.log('🔍 [积分页面-邀请码] 页面参数:', router?.params)
      console.log('🔍 [积分页面-邀请码] 邀请码:', inviteCode)
      
      if (inviteCode) {
        console.log('✅ [积分页面-邀请码] 检测到邀请码:', inviteCode)
        
        // 保存邀请码到本地存储
        Taro.setStorageSync('pendingInviteCode', inviteCode)
        
        // 检查用户是否已登录
        const token = Taro.getStorageSync('token')
        
        if (!token) {
          console.log('⚠️ [积分页面-邀请码] 用户未登录，弹出登录提示')
          
          // 延迟一下，等待页面渲染完成
          setTimeout(() => {
            // 直接显示登录弹窗
            setPopType('login')
            setPopVisible(true)
          }, 500)
        } else {
          console.log('✅ [积分页面-邀请码] 用户已登录，可以绑定邀请关系')
          // TODO: 调用后端接口绑定邀请关系
          bindInviteCode(inviteCode)
        }
      } else {
        console.log('ℹ️ [积分页面-邀请码] 未检测到邀请码')
      }
    } catch (error) {
      console.error('❌ [积分页面-邀请码] 检查邀请码失败:', error)
    }
  }
  
  // 绑定邀请码
  const bindInviteCode = async (inviteCode) => {
    try {
      console.log('🔗 [积分页面-邀请码] 开始绑定邀请关系:', inviteCode)
      
      // TODO: 调用后端接口绑定邀请关系
      // const res = await request({
      //   url: Interface.BIND_INVITE_CODE,
      //   method: 'POST',
      //   data: { inviteCode }
      // })
      
      // if (res?.code === 0) {
      //   console.log('✅ [积分页面-邀请码] 邀请关系绑定成功')
      //   Taro.removeStorageSync('pendingInviteCode')
      //   Taro.showToast({
      //     title: '邀请绑定成功，已获得积分',
      //     icon: 'success'
      //   })
      // }
      
      // 暂时只清除待处理的邀请码
      Taro.removeStorageSync('pendingInviteCode')
      console.log('✅ [积分页面-邀请码] 邀请码已保存，等待后端接口对接')
      
      Taro.showToast({
        title: '邀请绑定成功',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('❌ [积分页面-邀请码] 绑定邀请关系失败:', error)
    }
  }
  
  // 手机号登录
  const phoneLogin = (e) => {
    const phoneCode = e.detail.code || ''
    Taro.login({
      complete: async (res) => {
        if (res.code) {
          Taro.showLoading({ mask: true })
          const openIdCode = res.code
          console.log('openIdCode', openIdCode)
          
          // 获取待处理的邀请码
          const pendingInviteCode = Taro.getStorageSync('pendingInviteCode')
          
          const loginData = {
            chanel: 1,
            type: 'login',
            phoneCode,
            loginCode: openIdCode
          }
          
          // 如果有邀请码，添加到登录参数中
          if (pendingInviteCode) {
            loginData.invitedCode = pendingInviteCode
            console.log('🎫 [登录] 携带邀请码:', pendingInviteCode)
          }
          
          const tokenInfo = await request({
            url: Interface.MOZI_LOGIN,
            data: loginData,
            method: 'POST'
          })
          
          console.log('tokenInfo', tokenInfo)
          Taro.hideLoading()
          
          if (tokenInfo?.data?.token) {
            Taro.setStorageSync('token', tokenInfo?.data?.token)
            console.log('用户信息本地缓存成功')
            
            const userInfo = tokenInfo?.data?.userInfo
            const userId = tokenInfo?.data?.userId
            
            if (userId) {
              Taro.setStorageSync('userId', userId)
            }
            
            if (userInfo?.avatar && userInfo?.nickName) {
              Taro.setStorageSync('userInfo', {
                avatar: userInfo?.avatar,
                nickName: userInfo?.nickName,
                userId: userId
              })
            }
            
            // 关闭登录弹窗
            setPopVisible(false)
            
            // 获取并保存用户详细数据（包括邀请码）
            const { fetchAndSaveUserData } = require('../../utils/userHelper')
            await fetchAndSaveUserData()
            
            // 检查是否有待处理的邀请码
            const pendingInviteCode = Taro.getStorageSync('pendingInviteCode')
            if (pendingInviteCode) {
              console.log('🔗 [登录成功] 检测到待处理的邀请码:', pendingInviteCode)
              bindInviteCode(pendingInviteCode)
            }
            
            // 登录成功后，自动调用每日登录任务完成接口（与原项目对齐）
            const { reportDailyLogin } = require('../../utils/taskHelper')
            reportDailyLogin()
            
            Taro.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
            
            // 刷新积分数据
            fetchPointsData()
          } else {
            console.log('登录失败')
            Taro.showToast({
              title: '登录失败',
              icon: 'error',
              duration: 2000
            })
          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  }
  
  // 重置任务状态（开发调试用）
  const resetTasksStatus = () => {
    const tasksKey = getTasksStorageKey()
    const userId = getUserId()
    Taro.removeStorageSync(tasksKey)
    setTasksList(initialTasks)
    console.log(`🔄 用户[${userId}]的任务状态已重置`)
  }

  // 重置首次登录状态（开发调试用）
  const resetFirstLoginStatus = () => {
    const tasksKey = getTasksStorageKey()
    const userId = getUserId()
    const hasLoggedInBeforeKey = `hasLoggedInBefore_${userId}`
    
    Taro.removeStorageSync(hasLoggedInBeforeKey)
    Taro.removeStorageSync('isFirstLogin')
    Taro.removeStorageSync(tasksKey)
    setTasksList(initialTasks)
    console.log(`🔄 用户[${userId}]的首次登录状态已重置，请重新登录以测试首次登录功能`)
    Taro.showToast({
      title: '首次登录状态已重置',
      icon: 'success',
      duration: 2000
    })
  }

  // 页面显示时重新检查任务状态（从任务页面返回时会触发）
  useDidShow(() => {
    checkCompletedTasks()
  })

  const goBack = () => {
    Taro.navigateBack()
  }

  // 任务类型到 taskCode 的映射（与原项目对齐）
  const taskCodeMap = {
    '首次登录账号': 'REGISTER',
    '关注我们的公众号': 'WECHAT',
    '加入我们的社群': 'COMMUNITY',
    '早鸟活动': 'EARLY_BIRD',
    '设置报警功能': 'ALARM',
    '完成视频学习': 'VIDEO'
  }
  
  // 验证任务完成 - 调用统一的后端接口
  const verifyTask = async (task) => {
    try {
      setVerifyingTaskId(task.id)
      
      const taskCode = taskCodeMap[task.title]
      
      if (!taskCode) {
        console.error('❌ 未找到任务对应的 taskCode:', task.title)
        Taro.showToast({
          title: '任务配置错误',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      console.log('🔍 [任务验证] 开始验证任务:', task.title)
      console.log('🔍 [任务验证] taskCode:', taskCode)
      
      // 调用统一的任务完成接口（与原项目对齐）
      const res = await request({
        url: Interface.TASK_COMPLETE,
        method: 'POST',
        data: {
          taskCode: taskCode
        }
      })
      
      console.log('🔍 [任务验证] 接口返回:', res)
      
      if (res?.code === 0 && res?.data?.success) {
        // 验证成功，更新为已完成
        const updatedTasks = tasksList.map(t => 
          t.id === task.id 
            ? { ...t, status: 'completed', btnText: '已完成', needsAction: false }
            : t
        )
        setTasksList(updatedTasks)
        
        // 保存到本地存储（按用户ID）
        const tasksKey = getTasksStorageKey()
        Taro.setStorageSync(tasksKey, updatedTasks)
        
        // 显示成功提示，使用接口返回的消息或默认消息
        const successMsg = res?.data?.message || `+${task.points}积分`
        Taro.showToast({
          title: successMsg,
          icon: 'success',
          duration: 2000
        })
        
        // 刷新积分数据
        fetchPointsData()
      } else {
        // 验证失败，恢复为去完成状态
        const originalBtnText = getOriginalBtnText(task.title)
        const updatedTasks = tasksList.map(t => 
          t.id === task.id 
            ? { ...t, status: 'pending', btnText: originalBtnText, needsAction: true }
            : t
        )
        setTasksList(updatedTasks)
        
        // 保存到本地存储（按用户ID）
        const tasksKey = getTasksStorageKey()
        Taro.setStorageSync(tasksKey, updatedTasks)
        
        const errorMsg = res?.message || res?.msg || '任务尚未完成，请先完成任务'
        Taro.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('❌ [任务验证] 验证任务失败:', error)
      
      // 验证出错时也恢复成原来的状态
      const originalBtnText = getOriginalBtnText(task.title)
      const updatedTasks = tasksList.map(t => 
        t.id === task.id 
          ? { ...t, status: 'pending', btnText: originalBtnText, needsAction: true }
          : t
      )
      setTasksList(updatedTasks)
      
      // 保存到本地存储（按用户ID）
      const tasksKey = getTasksStorageKey()
      Taro.setStorageSync(tasksKey, updatedTasks)
      
      Taro.showToast({
        title: '验证失败，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setVerifyingTaskId(null)
    }
  }
  
  // 获取任务的原始按钮文本
  const getOriginalBtnText = (title) => {
    const btnTextMap = {
      '首次登录账号': '去登录',
      '关注我们的公众号': '去关注',
      '加入我们的社群': '去加入',
      '早鸟活动': '去参加',
      '设置报警功能': '去设置',
      '完成视频学习': '去学习'
    }
    return btnTextMap[title] || '去完成'
  }

  const handleTaskClick = (task) => {
    // 如果任务已完成，不处理
    if (task.status === 'completed') {
      Taro.showToast({
        title: '任务已完成',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 如果正在验证中，不处理
    if (verifyingTaskId === task.id) {
      return
    }

    // 如果需要先去完成任务（needsAction为true）
    if (task.needsAction) {
      // 立即标记为待验证状态
      const updatedTasks = tasksList.map(t => 
        t.id === task.id 
          ? { ...t, btnText: '验证', needsAction: false }
          : t
      )
      setTasksList(updatedTasks)
      
      // 保存到本地存储（按用户ID），防止页面刷新后丢失状态
      const tasksKey = getTasksStorageKey()
      Taro.setStorageSync(tasksKey, updatedTasks)
      
      console.log('✅ 任务状态已更新为"验证":', task.title)
      
      // 跳转到对应页面
      if (task.title === '首次登录账号') {
        Taro.switchTab({
          url: '/pages/me/index'
        })
        return
      }

      if (task.title === '早鸟活动') {
        // 早鸟活动不需要跳转，检查是否登录
        const token = Taro.getStorageSync('token')
        if (!token) {
          Taro.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          })
          // 跳转到登录页面
          Taro.switchTab({
            url: '/pages/me/index'
          })
          return
        }
        
        // 已登录，检查活动是否过期
        if (!isBeforeYear2025()) {
          Taro.showToast({
            title: '活动已过期',
            icon: 'none',
            duration: 2000
          })
          return
        }
        
        // 已登录且活动进行中，按钮已经变为"验证"，不需要额外操作
        return
      }

      if (task.title === '完成视频学习') {
        Taro.navigateTo({
          url: '/packages/videolearn/index'
        })
        return
      }

      if (task.title === '关注我们的公众号') {
        // 直接弹出与“我的页面”相同的关注公众号二维码弹窗
        setPopType('attend')
        setPopVisible(true)
        return
      }

      if (task.title === '加入我们的社群') {
        // 弹出社群图片弹窗
        setPopType('community')
        setPopVisible(true)
        return
      }

      if (task.title === '设置报警功能') {
        Taro.navigateTo({
          url: '/packages/addwarn/index?symbol=BTC'
        })
        return
      }

      Taro.showToast({
        title: `${task.title}功能开发中`,
        icon: 'none',
        duration: 2000
      })
    } else {
      // 如果是验证状态（needsAction为false），点击进行验证
      verifyTask(task)
    }
  }

  const copyToClipboard = (text, label) => {
    if (!text) {
      Taro.showToast({
        title: '暂无数据',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
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
  
  // 微信分享邀请（准备分享数据）
  const handleWechatShare = () => {
    console.log('🔍 [分享] 准备分享，邀请码:', pointsData.inviteCode)
    
    // 保存邀请码到本地存储，供分享回调使用
    Taro.setStorageSync('pointsData', pointsData)
  }
  
  // 配置分享功能 - 使用 useShareAppMessage
  Taro.useShareAppMessage(() => {
    const userInfo = Taro.getStorageSync('userInfo') || {}
    const nickName = userInfo.nickName || '好友'
    
    // 从本地存储的 userData 中获取邀请码
    const userData = Taro.getStorageSync('userData') || {}
    let inviteCode = userData.inviteCode || userData.invitationCode
    
    // 如果 userData 中没有，尝试从 pointsData 获取
    if (!inviteCode) {
      const savedPointsData = Taro.getStorageSync('pointsData') || {}
      inviteCode = savedPointsData.inviteCode || pointsData.inviteCode
    }
    
    console.log('🔍 [分享回调] userData:', userData)
    console.log('🔍 [分享回调] userData中的邀请码:', userData.inviteCode || userData.invitationCode)
    console.log('🔍 [分享回调] state中的邀请码:', pointsData.inviteCode)
    console.log('🔍 [分享回调] 最终使用的邀请码:', inviteCode)
    
    // 如果没有邀请码，返回默认分享配置（不带邀请码参数）
    if (!inviteCode) {
      console.log('⚠️ [分享] 没有邀请码，使用默认分享配置')
      return {
        title: `${nickName}邀请你加入MOZI`,
        path: `/packages/points/index`
      }
    }
    
    const shareConfig = {
      title: `${nickName}邀请你加入`,
      path: `/packages/points/index?inviteCode=${inviteCode}`,
      // imageUrl: 使用微信默认分享图片
    }
    
    console.log('========================================')
    console.log('🎁 [分享] 分享给好友')
    console.log('📝 标题:', shareConfig.title)
    console.log('🔗 路径:', shareConfig.path)
    console.log('�️  封面:' , shareConfig.imageUrl)
    console.log('👤 分享人:', nickName)
    console.log('🎫 邀请码:', inviteCode)
    console.log('⚠️  注意：开发版不显示自定义标题，正式版才会显示')
    console.log('========================================')
    
    return shareConfig
  })
  
  // 生成微信小程序邀请链接（用于复制）
  const getWechatInviteLink = () => {
    if (!pointsData.inviteCode) return ''
    // 微信小程序的邀请链接格式（可以根据实际情况调整）
    return `邀请您加入MOZI，使用邀请码：${pointsData.inviteCode}`
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
        {/* 暂时隐藏"我的邀请"Tab */}
        {/* <View 
          className={`tab-item ${activeTab === 'myInvites' ? 'tab-active' : ''}`}
          onClick={() => handleTabChange('myInvites')}
        >
          <Text className='tab-text'>我的邀请</Text>
        </View> */}
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
            <View className='history-btn' onClick={() => Taro.navigateTo({ url: '/packages/pointshistory/index' })}>
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

          {/* 微信分享按钮 */}
          <View className='invite-input-box'>
            <Text className='invite-input-label'>分享给好友</Text>
            <Button 
              className='invite-share-btn' 
              openType='share'
              onClick={handleWechatShare}
            >
              <Text className='invite-share-text'>分享赢积分</Text>
            </Button>
          </View>

          {/* 邀请码 - 微信小程序隐藏 */}
          {/* <View className='invite-input-box'>
            <Text className='invite-input-label'>邀请码</Text>
            <View className='invite-input-content'>
              <Text className='invite-input-text'>{pointsData.inviteCode || '暂无邀请码'}</Text>
              <View className='copy-icon-btn' onClick={() => copyToClipboard(pointsData.inviteCode, '邀请码')}>
                <Image src={imgCopy} className='copy-icon' mode='aspectFit' />
              </View>
            </View>
          </View> */}

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
            {/* 隐藏申请ETH */}
            {/* <View className='stat-card'>
              <Text className='stat-value'>{pointsData.activeInvites}</Text>
              <Text className='stat-label'>申请ETH</Text>
            </View> */}
            {/* 隐藏OwO之后可领取 */}
            {/* <View className='stat-card'>
              <View className='stat-value'>
                {pointsData.pendingRewards === 0 ? (
                  <Image src={imgInfo} className='info-icon' mode='aspectFit' />
                ) : (
                  <Text>{pointsData.pendingRewards}</Text>
                )}
              </View>
              <Text className='stat-label'>OwO 之后可领取</Text>
            </View> */}
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
            {tasksList.map(task => {
              // 判断按钮状态
              const isVerifying = verifyingTaskId === task.id
              const isCompleted = task.status === 'completed'
              const isWaitingVerify = !task.needsAction && task.status === 'pending' // 待验证状态
              
              // 按钮文本
              let btnText = task.btnText
              if (isVerifying) btnText = '验证中'
              
              // 按钮样式
              let btnClass = 'task-btn'
              if (isCompleted) btnClass += ' completed-btn'
              else if (isVerifying) btnClass += ' verifying-btn'
              else if (isWaitingVerify) btnClass += ' verify-btn'
              
              return (
                <View key={task.id} className={`task-item ${isCompleted ? 'completed' : ''}`}>
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
                    className={btnClass}
                    onClick={() => handleTaskClick(task)}
                  >
                    <Text className='task-btn-text'>{btnText}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

      {/* 关注公众号弹窗 */}
      <PageContainer
        show={popVisible}
        onAfterLeave={() => setPopVisible(false)}
        closeOnSlideDown
        round
        forceRender
        position='bottom'
      >
        {
          popType === 'attend' && (
            <View className='popContainer'>
              <Text className='contactTitle'>欢迎关注我们的公众号</Text>
              <View className='qr-wrap'>
                <Image
                  className='attendPic'
                  mode='widthFix'
                  lazyLoad
                  showMenuByLongpress
                  src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_account.jpg'
                />
              </View>
            </View>
          )
        }
        {
          popType === 'community' && (
            <View className='popContainer'>
              <Text className='contactTitle'>欢迎加入我们的社群</Text>
              <View className='qr-wrap'>
                <Image
                  className='attendPic'
                  mode='widthFix'
                  lazyLoad
                  showMenuByLongpress
                  src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/community.jpg'
                />
              </View>
            </View>
          )
        }
        {
          popType === 'login' && (
            <View className='loginPopContainer'>
              <Text className='loginTitle'>邀请登录</Text>
              <Text className='loginDesc'>您收到了好友的邀请，请先登录以完成邀请绑定并获得积分奖励</Text>
              <Button 
                className='loginButton' 
                openType='getPhoneNumber' 
                onGetPhoneNumber={phoneLogin}
              >
                <Text className='loginButtonText'>微信手机号登录</Text>
              </Button>
            </View>
          )
        }
      </PageContainer>

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
                    <Text>{item.rewardLabel?.replace(/\+?\d+/g, '').trim()}</Text>
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

export default PointsPage
