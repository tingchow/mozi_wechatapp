import { View, Text, Input } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Interface } from '../../utils/constants'
import { request } from '../../utils/request'
import { Layout } from '../../components/Layout'
import { SearchInput } from '../../components/SearchInput'
import { GardenLoading } from '../../components/Loading'
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

  return (
    <Layout>
      <View className='topicSearch'>
        <SearchInput
          value={searchValue}
          reloadFun={searchTopics}
          placeholder='搜索话题'
        />
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
                <View className='topicTitle'>{topic.name}</View>
                <View className='topicDesc'>{topic.description}</View>
                <View className='topicMeta'>
                  <Text className='topicTime'>{topic.createdAt.replace('T', '    ')}</Text>
                </View>
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
    </Layout>
  )
}