import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { request } from '../../utils/request'
import { Interface } from '../../utils/constants'
import { Layout } from '../../components/Layout'
import IconFont from '../../components/iconfont'
import './index.less'

const likeActiveIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/like-active.png'
const commentIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/messages-comment.png'

export default function MyLikes() {
  const [loading, setLoading] = useState(true)
  const [likeList, setLikeList] = useState([])
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
      loadLikes(true)
    }
  })

  // 加载点赞列表
  const loadLikes = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1)
        setLoading(true)
      }

      const currentPage = refresh ? 1 : page
      
      const res = await request({
        url: Interface.GET_MY_LIKES,
        data: {
          page: currentPage,
          size: 20
        }
      })

      console.log('我的点赞数据:', res)

      if (res?.data) {
        const newLikes = res.data
        if (refresh) {
          setLikeList(newLikes)
        } else {
          setLikeList([...likeList, ...newLikes])
        }
        
        // 判断是否还有更多数据
        setHasMore(newLikes.length >= 20)
        setPage(currentPage + 1)
      }
    } catch (error) {
      console.error('加载点赞失败:', error)
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
      loadLikes()
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
      <View className='mylikes-page'>
        <View className='empty-container'>
          <IconFont name='like' size={120} color='#ccc' />
          <Text className='empty-text'>请先登录查看点赞</Text>
          <View className='empty-btn' onClick={() => Taro.switchTab({ url: '/pages/me/index' })}>
            去登录
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='mylikes-page'>
      <Layout isLoading={loading && page === 1}>
        {likeList.length === 0 && !loading ? (
          <View className='empty-container'>
            <IconFont name='like' size={120} color='#ccc' />
            <Text className='empty-text'>暂无点赞</Text>
          </View>
        ) : (
          <ScrollView
            scrollY
            className='like-scroll'
            onScrollToLower={loadMore}
            lowerThreshold={100}
          >
            {likeList.map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                className='like-item'
                onClick={() => goToPostDetail(item.id)}
              >
                {/* 用户信息 */}
                <View className='user-info'>
                  <Image className='avatar' src={item.avatar || 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/avatar.png'} mode='aspectFill' />
                  <View className='user-detail'>
                    <Text className='username'>{item.userName || '匿名用户'}</Text>
                    <Text className='post-time'>{formatTime(item.createdAt)}</Text>
                  </View>
                </View>

                {/* 帖子标题 */}
                {item.title && (
                  <View className='post-title'>{item.title}</View>
                )}
                
                {/* 帖子内容 */}
                {item.content && (
                  <View className='post-content'>{item.content}</View>
                )}

                {/* 底部信息 */}
                <View className='post-footer'>
                  <View className='stats'>
                    <View className='stat-item liked'>
                      <Image className='like-icon' src={likeActiveIcon} mode='aspectFit' />
                      <Text className='count like-count'>{item.likeCount || 0}</Text>
                    </View>
                    <View className='stat-item'>
                      <Image className='comment-icon' src={commentIcon} mode='aspectFit' />
                      <Text className='count'>{item.commentCount || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* 加载更多提示 */}
            {loading && page > 1 && (
              <View className='loading-more'>
                <Text>加载中...</Text>
              </View>
            )}
            
            {!hasMore && likeList.length > 0 && (
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

