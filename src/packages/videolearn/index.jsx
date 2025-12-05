import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import CustomVideo from '../../components/CustomVideo'
import './index.less'

export default function VideoLearnPage() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [completedVideos, setCompletedVideos] = useState({})
  const COIN_ICON = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/coin_icon@2x.png'
  
  // 视频列表数据 - 聚焦于 MOZI 平台功能
  const videos = [
    {
      id: 1,
      title: 'MOZI 平台使用教程',
      description: '了解如何使用 MOZI 平台的基本功能',
      url: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/video/Record_2025-10-14-09-14-37_e39d2c7de19156b0683cd93e8735f348.mp4',
      // poster: '',  // 不设置封面图，使用视频首帧
      duration: '00:58',
      points: 10
    },
    {
      id: 2,
      title: '如何设置价格告警',
      description: '学习如何设置和管理币种价格告警功能',
      url: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/video/Record_2025-10-14-09-14-37_e39d2c7de19156b0683cd93e8735f348.mp4',
      // poster: '',
      duration: '00:58',
      points: 15
    },
    {
      id: 3,
      title: '积分系统玩法介绍',
      description: '了解如何通过完成任务、互动获得积分奖励',
      url: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/video/Record_2025-10-14-09-14-37_e39d2c7de19156b0683cd93e8735f348.mp4',
      // poster: '',
      duration: '00:58',
      points: 20
    }
  ]

  useLoad(() => {
    console.log('视频学习页面加载')
    // 保存视频总数供任务页验证使用
    try {
      Taro.setStorageSync('videoLearnTotal', videos.length)
    } catch (e) {}
    // 从本地存储加载已完成的视频记录
    try {
      const saved = Taro.getStorageSync('completedVideos')
      if (saved) {
        setCompletedVideos(JSON.parse(saved))
      }
    } catch (e) {
      console.error('加载视频完成记录失败:', e)
    }
  })

  const handleVideoEnd = () => {
    const videoId = videos[currentVideo].id
    
    // 标记当前视频为已完成
    const newCompleted = { ...completedVideos, [videoId]: true }
    setCompletedVideos(newCompleted)
    
    // 保存到本地存储
    try {
      Taro.setStorageSync('completedVideos', JSON.stringify(newCompleted))
      Taro.setStorageSync('videoLearnTotal', videos.length)
    } catch (e) {
      console.error('保存视频完成记录失败:', e)
    }
    
    // 检查是否所有视频都已完成
    const allCompleted = Object.keys(newCompleted).length === videos.length
    
    if (allCompleted) {
      // 所有视频已看完，自动调用视频学习任务完成接口（与原项目对齐）
      const { reportVideo } = require('../../utils/taskHelper')
      reportVideo()
      
      Taro.showToast({
        title: '恭喜！已完成所有视频学习',
        icon: 'success',
        duration: 2000
      })
    } else {
      Taro.showToast({
        title: `恭喜获得 ${videos[currentVideo].points} 积分！`,
        icon: 'success',
        duration: 2000
      })
    }
  }

  // 视频错误回调
  const handleVideoError = (e) => {
    console.error('视频播放错误:', e)
    Taro.showToast({
      title: '视频加载失败',
      icon: 'none',
      duration: 2000
    })
  }

  return (
    <View className='videolearn-container'>
      <View className='video-section'>
        <CustomVideo
          key={`kv-${videos[currentVideo].id}`}
          videoId={`video-${videos[currentVideo].id}`}
          src={videos[currentVideo].url}
          isCompleted={completedVideos[videos[currentVideo].id] || false}
          onComplete={handleVideoEnd}
          onError={handleVideoError}
        />
        
        <View className='video-info'>
          <Text className='video-title'>{videos[currentVideo].title}</Text>
          <Text className='video-desc'>{videos[currentVideo].description}</Text>
          <View className='video-meta'>
            <Text className='video-duration'>时长: {videos[currentVideo].duration}</Text>
            <View className='video-points'>
              <Text>完成可获得</Text>
              <Text className='points-num'>+{videos[currentVideo].points}</Text>
              <Image className='coin-inline-icon' src={COIN_ICON} mode='widthFix' />
            </View>
          </View>
        </View>
      </View>

      <View className='video-list-section'>
        <Text className='section-title'>学习列表</Text>
        <View className='video-list'>
          {videos.map((video, index) => (
            <View
              key={video.id}
              className={`video-item ${currentVideo === index ? 'active' : ''} ${completedVideos[video.id] ? 'completed' : ''}`}
              onClick={() => setCurrentVideo(index)}
            >
              <View className='video-item-number'>{index + 1}</View>
              <View className='video-item-info'>
                <Text className='video-item-title'>{video.title}</Text>
                <Text className='video-item-duration'>
                  {video.duration}
                  {completedVideos[video.id] && ' ✓'}
                </Text>
              </View>
              <View className='video-item-points'>
                <Text>+{video.points}</Text>
                <Image className='coin-inline-icon' src={COIN_ICON} mode='widthFix' />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

