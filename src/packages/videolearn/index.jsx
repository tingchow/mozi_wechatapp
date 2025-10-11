import { View, Text, Video } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.less'

export default function VideoLearnPage() {
  const [currentVideo, setCurrentVideo] = useState(0)
  
  // 视频列表数据
  const videos = [
    {
      id: 1,
      title: 'MOZI 平台使用教程',
      description: '了解如何使用 MOZI 平台的基本功能',
      url: 'https://example.com/video1.mp4',
      poster: 'https://example.com/poster1.jpg',
      duration: '5:30',
      points: 10
    },
    {
      id: 2,
      title: '加密货币交易基础',
      description: '学习加密货币交易的基本知识',
      url: 'https://example.com/video2.mp4',
      poster: 'https://example.com/poster2.jpg',
      duration: '8:20',
      points: 15
    },
    {
      id: 3,
      title: '技术分析入门',
      description: '掌握基本的技术分析方法',
      url: 'https://example.com/video3.mp4',
      poster: 'https://example.com/poster3.jpg',
      duration: '10:15',
      points: 20
    }
  ]

  useLoad(() => {
    console.log('视频学习页面加载')
  })

  const handleVideoEnd = () => {
    Taro.showToast({
      title: `恭喜获得 ${videos[currentVideo].points} 积分！`,
      icon: 'success',
      duration: 2000
    })
  }

  const handleVideoError = (e) => {
    console.error('视频播放错误:', e)
    Taro.showToast({
      title: '视频加载失败',
      icon: 'error',
      duration: 2000
    })
  }

  return (
    <View className='videolearn-container'>
      <View className='video-section'>
        <Video
          className='video-player'
          src={videos[currentVideo].url}
          poster={videos[currentVideo].poster}
          controls={true}
          autoplay={false}
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          showCenterPlayBtn={true}
          showPlayBtn={true}
          showFullscreenBtn={true}
          enableProgressGesture={true}
        />
        
        <View className='video-info'>
          <Text className='video-title'>{videos[currentVideo].title}</Text>
          <Text className='video-desc'>{videos[currentVideo].description}</Text>
          <View className='video-meta'>
            <Text className='video-duration'>时长: {videos[currentVideo].duration}</Text>
            <Text className='video-points'>完成可获得 +{videos[currentVideo].points} 积分</Text>
          </View>
        </View>
      </View>

      <View className='video-list-section'>
        <Text className='section-title'>学习列表</Text>
        <View className='video-list'>
          {videos.map((video, index) => (
            <View
              key={video.id}
              className={`video-item ${currentVideo === index ? 'active' : ''}`}
              onClick={() => setCurrentVideo(index)}
            >
              <View className='video-item-number'>{index + 1}</View>
              <View className='video-item-info'>
                <Text className='video-item-title'>{video.title}</Text>
                <Text className='video-item-duration'>{video.duration}</Text>
              </View>
              <View className='video-item-points'>+{video.points}</View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

