import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { request } from '../../utils/request'
import { Interface } from '../../utils/constants'
import { Layout } from '../../components/Layout'
import IconFont from '../../components/iconfont'
import './index.less'

export default function MyComments() {
  const [loading, setLoading] = useState(true)
  const [commentList, setCommentList] = useState([])
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
      loadComments(true)
    }
  })

  // 加载评论列表
  const loadComments = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1)
        setLoading(true)
      }

      const currentPage = refresh ? 1 : page
      
      const res = await request({
        url: Interface.GET_MY_COMMENTS,
        data: {
          page: currentPage,
          size: 20
        }
      })

      console.log('我的评论数据:', res)

      if (res?.data) {
        const newComments = res.data
        if (refresh) {
          setCommentList(newComments)
        } else {
          setCommentList([...commentList, ...newComments])
        }
        
        // 判断是否还有更多数据
        setHasMore(newComments.length >= 20)
        setPage(currentPage + 1)
      }
    } catch (error) {
      console.error('加载评论失败:', error)
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
      loadComments()
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
      <View className='mycomments-page'>
        <View className='empty-container'>
          <IconFont name='file' size={120} color='#ccc' />
          <Text className='empty-text'>请先登录查看评论</Text>
          <View className='empty-btn' onClick={() => Taro.switchTab({ url: '/pages/me/index' })}>
            去登录
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='mycomments-page'>
      <Layout isLoading={loading && page === 1}>
        {commentList.length === 0 && !loading ? (
          <View className='empty-container'>
            <IconFont name='file' size={120} color='#ccc' />
            <Text className='empty-text'>暂无评论</Text>
          </View>
        ) : (
          <ScrollView
            scrollY
            className='comment-scroll'
            onScrollToLower={loadMore}
            lowerThreshold={100}
          >
            {commentList.map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                className='comment-item'
                onClick={() => goToPostDetail(item.id)}
              >
                {/* 帖子标题 */}
                {item.title && (
                  <View className='post-title'>{item.title}</View>
                )}
                
                {/* 帖子内容 */}
                {item.content && (
                  <View className='post-content'>{item.content}</View>
                )}

                {/* 评论区域 */}
                <View className='comment-area'>
                  <View className='comment-label'>
                    <IconFont name='comment' size={24} color='#999' />
                    <Text className='label-text'>我的评论</Text>
                  </View>
                  <View className='my-comment-content'>{item.comments}</View>
                </View>

                {/* 底部信息 */}
                <View className='comment-footer'>
                  <Text className='comment-time'>{formatTime(item.createdAt)}</Text>
                  {item.userName && (
                    <Text className='post-author'>回复 @{item.userName}</Text>
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
            
            {!hasMore && commentList.length > 0 && (
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

