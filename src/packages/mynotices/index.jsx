import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { request } from '../../utils/request'
import { Interface } from '../../utils/constants'
import { Layout } from '../../components/Layout'
import IconFont from '../../components/iconfont'
import './index.less'

export default function MyNotices() {
  const [loading, setLoading] = useState(true)
  const [noticeList, setNoticeList] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLogin, setIsLogin] = useState(false)

  useLoad(() => {
    // 检查登录状态
    const token = Taro.getStorageSync('token')
    if (!token) {
      setIsLogin(false)
      setLoading(false)
      return
    }
    setIsLogin(true)
  })

  useDidShow(() => {
    // 每次显示时刷新数据
    const token = Taro.getStorageSync('token')
    if (token) {
      setIsLogin(true)
      loadNotices(true)
      // 标记通知为已读
      markNoticesAsRead()
    }
  })

  // 标记通知为已读
  const markNoticesAsRead = async () => {
    try {
      await request({
        url: Interface.MARK_NOTICES_READ,
        method: 'POST'
      })
      console.log('已标记通知为已读')
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 加载通知列表
  const loadNotices = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1)
        setLoading(true)
      }

      const currentPage = refresh ? 1 : page
      
      const res = await request({
        url: Interface.GET_MY_NOTICES,
        data: {
          page: currentPage,
          size: 20
        }
      })

      console.log('我的通知数据:', res)

      if (res?.data) {
        const newNotices = res.data
        if (refresh) {
          setNoticeList(newNotices)
        } else {
          setNoticeList([...noticeList, ...newNotices])
        }
        
        // 判断是否还有更多数据
        setHasMore(newNotices.length >= 20)
        setPage(currentPage + 1)
      }
    } catch (error) {
      console.error('加载通知失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotices()
    }
  }

  // 跳转到帖子详情
  const goToPostDetail = (postId) => {
    Taro.navigateTo({
      url: `/packages/community/commentinfo/index?id=${postId}`
    })
  }

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  // 未登录提示
  if (!isLogin) {
    return (
      <View className='mynotices-page'>
        <View className='empty-container'>
          <IconFont name='notification' size={120} color='#ccc' />
          <Text className='empty-text'>请先登录查看通知</Text>
          <View className='empty-btn' onClick={() => Taro.switchTab({ url: '/pages/me/index' })}>
            去登录
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='mynotices-page'>
      <Layout isLoading={loading && page === 1}>
        {noticeList.length === 0 && !loading ? (
          <View className='empty-container'>
            <IconFont name='notification' size={120} color='#ccc' />
            <Text className='empty-text'>暂无消息通知</Text>
          </View>
        ) : (
          <ScrollView
            scrollY
            className='notice-scroll'
            onScrollToLower={loadMore}
            lowerThreshold={100}
          >
            {noticeList.map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                className='notice-item'
                onClick={() => goToPostDetail(item.id)}
              >
                {/* 用户信息 */}
                <View className='user-info'>
                  <Image 
                    className='avatar' 
                    src={item.avatar || 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png'} 
                    mode='aspectFill' 
                  />
                  <View className='user-detail'>
                    <View className='username-row'>
                      <Text className='username'>{item.userName || '匿名用户'}</Text>
                      <Text className='action-text'>评论了你</Text>
                    </View>
                    <Text className='notice-time'>{formatTime(item.createdAt)}</Text>
                  </View>
                </View>

                {/* 评论内容 */}
                <View className='comment-content'>
                  <IconFont name='comment' size={28} color='#11B787' />
                  <Text className='comment-text'>{item.comments}</Text>
                </View>

                {/* 帖子信息 */}
                <View className='post-info'>
                  {item.title && (
                    <View className='post-title'>{item.title}</View>
                  )}
                  {item.content && (
                    <View className='post-content'>{item.content}</View>
                  )}
                </View>
              </View>
            ))}

            {/* 加载更多提示 */}
            {loading && page > 1 && (
              <View className='loading-more'>
                <Text>加载中...</Text>
              </View>
            )}
            
            {!hasMore && noticeList.length > 0 && (
              <View className='no-more'>
                <Text>没有更多了</Text>
              </View>
            )}
          </ScrollView>
        )}
      </Layout>
    </View>
  )
}

