import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import request from '../../utils/request'
import './index.less'

export default function PointsHistoryPage() {
  const [historyList, setHistoryList] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // CDN 图片资源
  const CDN_BASE = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point'
  const imgCoinIcon = `${CDN_BASE}/coin_icon@2x.png`

  // 模拟数据（实际应该从接口获取）
  const mockHistory = [
    {
      id: 1,
      type: 'task',
      typeName: '任务奖励',
      title: '完成视频学习',
      points: 50,
      status: 'add',
      createTime: '2025-10-14 10:30:25'
    },
    {
      id: 2,
      type: 'task',
      typeName: '任务奖励',
      title: '设置报警功能',
      points: 100,
      status: 'add',
      createTime: '2025-10-14 09:15:10'
    },
    {
      id: 3,
      type: 'daily',
      typeName: '每日任务',
      title: '每日点赞',
      points: 4,
      status: 'add',
      createTime: '2025-10-14 08:20:00'
    },
    {
      id: 4,
      type: 'daily',
      typeName: '每日任务',
      title: '发帖',
      points: 10,
      status: 'add',
      createTime: '2025-10-13 20:45:30'
    },
    {
      id: 5,
      type: 'invite',
      typeName: '邀请奖励',
      title: '邀请好友成功',
      points: 500,
      status: 'add',
      createTime: '2025-10-13 16:30:00'
    },
    {
      id: 6,
      type: 'daily',
      typeName: '每日任务',
      title: '收到赞',
      points: 4,
      status: 'add',
      createTime: '2025-10-13 14:25:15'
    },
    {
      id: 7,
      type: 'task',
      typeName: '任务奖励',
      title: '加入社群',
      points: 50,
      status: 'add',
      createTime: '2025-10-12 11:10:20'
    },
    {
      id: 8,
      type: 'task',
      typeName: '任务奖励',
      title: '首次注册账号',
      points: 50,
      status: 'add',
      createTime: '2025-10-12 10:00:00'
    }
  ]

  useLoad(() => {
    console.log('积分历史页面加载')
    loadHistoryData()
  })

  // 加载历史数据
  const loadHistoryData = async () => {
    try {
      setLoading(true)
      
      // TODO: 调用真实接口
      // const { data } = await request({
      //   url: '/api/points/history',
      //   method: 'GET',
      //   data: {
      //     page: page,
      //     pageSize: 20
      //   }
      // })
      
      // 模拟数据 - 显示所有类型
      setTimeout(() => {
        setHistoryList(mockHistory)
        setLoading(false)
      }, 500)
      
    } catch (error) {
      console.error('加载积分历史失败:', error)
      setLoading(false)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  }


  // 格式化时间
  const formatTime = (timeStr) => {
    const now = new Date()
    const time = new Date(timeStr)
    const diff = now - time
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return timeStr.split(' ')[0]
  }

  // 获取类型图标
  const getTypeIcon = (type) => {
    const icons = {
      task: `${CDN_BASE}/set_alert@2x.png`,
      daily: `${CDN_BASE}/glove_praise@2x.png`,
      invite: `${CDN_BASE}/invite@2x.png`
    }
    return icons[type] || icons.task
  }

  return (
    <View className='points-history-container'>
      {/* 历史记录列表 */}
      <ScrollView 
        className='history-scroll'
        scrollY
        enableBackToTop
      >
        {historyList.length === 0 && !loading && (
          <View className='empty-state'>
            <Text className='empty-text'>暂无积分记录</Text>
          </View>
        )}

        {historyList.map(item => (
          <View key={item.id} className='history-item'>
            <View className='item-icon'>
              <Image src={getTypeIcon(item.type)} className='icon-img' mode='aspectFit' />
            </View>
            
            <View className='item-content'>
              <View className='item-header'>
                <Text className='item-title'>{item.title}</Text>
                <View className='item-points'>
                  <Text className={`points-text ${item.status === 'add' ? 'add' : 'sub'}`}>
                    {item.status === 'add' ? '+' : '-'}{item.points}
                  </Text>
                  <Image src={imgCoinIcon} className='coin-icon' mode='aspectFit' />
                </View>
              </View>
              
              <View className='item-footer'>
                <Text className='item-type'>{item.typeName}</Text>
                <Text className='item-time'>{formatTime(item.createTime)}</Text>
              </View>
            </View>
          </View>
        ))}

        {loading && (
          <View className='loading-more'>
            <Text>加载中...</Text>
          </View>
        )}

        {!loading && historyList.length > 0 && !hasMore && (
          <View className='no-more'>
            <Text>没有更多了</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

