import { View, Text, Input, Image } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Interface } from '../../../utils/constants'
import { request } from '../../../utils/request'
import { SearchInput } from '../../../components/SearchInput'
import { GardenLoading } from '../../../components/Loading'
import IconFont from '../../../components/iconfont'
const hotIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/hot.png'
const leftArrowIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/left-arrow.png'
import './index.less'

export default function TopicSearch() {
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState([])
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  // 搜索话题
  const searchTopics = async (value) => {
    setSearchValue(value)
    setLoading(true)
    try {
      const response = await request({
        url: Interface.TOPIC_SEARCH,
        data: {
          keyword: value,
          page: 1,
          size
        }
      })
      
      if (response?.data) {
        const { data, total: totalCount } = response.data
        setTopics(data)
        setTotal(totalCount)
        setPage(2)
        setHasMore(data.length < totalCount)
      }
    } catch (error) {
      console.error('搜索话题失败:', error)
      Taro.showToast({
        title: '搜索失败',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载更多
  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const response = await request({
        url: Interface.TOPIC_SEARCH,
        data: {
          keyword: searchValue,
          page,
          size
        }
      })
      
      if (response?.data) {
        const { data } = response.data
        setTopics(prev => [...prev, ...data])
        setPage(prev => prev + 1)
        setHasMore(topics.length + data.length < total)
      }
    } catch (error) {
      console.error('加载更多话题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 跳转到话题详情
  const goToTopicDetail = (topicId) => {
    Taro.navigateTo({
      url: `/pages/topicinfo/index?id=${topicId}`
    })
  }

  // 返回上一页
  const goBack = () => {
    Taro.navigateBack()
  }

  // 高亮显示搜索关键词
  const highlightKeyword = (text, keyword) => {
    if (!keyword || !text) return text
    
    const regex = new RegExp(`(${keyword})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return (
          <Text key={index} style={{ color: '#47C89D' }}>
            {part}
          </Text>
        )
      }
      return part
    })
  }

  return (
    <View className='topicSearchPage'>
      {/* 自定义导航栏 */}
      <View className='custom-navbar'>
        {/* 顶部导航区域 */}
        <View className='navbar-top'>
          <View className='navbar-left' onClick={goBack}>
            <Image src={leftArrowIcon} className='left-arrow-icon' mode='aspectFit' />
          </View>
          <View className='navbar-title'>话题搜索</View>
          <View className='navbar-right'>
            <IconFont name='more' size={40} color='#fff' />
          </View>
        </View>
        
        {/* 搜索框 */}
        <View className='navbar-search'>
          <SearchInput
            value={searchValue}
            reloadFun={searchTopics}
            placeholder='搜索话题'
          />
        </View>
        
        {/* 搜索框下方的盒子 */}
        <View className='search-bottom-box'></View>
      </View>

      <View className='topicSearch'>
        {loading && topics.length === 0 ? (
          <View className='loading-box'>
            <GardenLoading />
          </View>
        ) : (
          <View className='topicList'>
            {topics.map(topic => (
              <View
                key={topic.id}
                className='topicItem'
                onClick={() => goToTopicDetail(topic.id)}
              >
                <View className='topicContent'>
                  <View className='topicTitle'>{highlightKeyword(topic.name, searchValue)}</View>
                  <View className='topicDesc'>{highlightKeyword(topic.description, searchValue)}</View>
                  <View className='topicMeta'>
                    <Text className='topicTime'>{topic.createdAt.replace('T', '    ')}</Text>
                  </View>
                </View>
                {topic.hot && (
                  <View className='topicHot'>
                    <Image src={hotIcon} className='hotIcon' mode='aspectFit' />
                  </View>
                )}
              </View>
            ))}
            {loading && (
              <View className='loadingMore'>
                <GardenLoading />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}