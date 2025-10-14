import { View, Text, Image, Video } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef, useEffect } from 'react'
import './index.less'
// 使用 CDN 播放/暂停图标
const PLAY_ICON = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/play.svg'
const PAUSE_ICON = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/point/pause.svg'

/**
 * 自定义视频组件
 * 防作弊机制：不可拖动进度条，必须完整观看
 * 
 * @param {string} videoId - 视频ID（必须唯一）
 * @param {string} src - 视频地址
 * @param {boolean} isCompleted - 是否已完成
 * @param {function} onComplete - 完成回调
 * @param {function} onError - 错误回调
 */
export default function CustomVideo({ 
  videoId = 'custom-video',
  src, 
  isCompleted = false,
  onComplete,
  onError 
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [maxPlayedTime, setMaxPlayedTime] = useState(0)
  const videoContextRef = useRef(null)

  // 初始化视频上下文，并在切换时停止旧实例
  useEffect(() => {
    if (videoContextRef.current) {
      try {
        videoContextRef.current.pause()
        videoContextRef.current.stop && videoContextRef.current.stop()
      } catch (e) {}
    }
    videoContextRef.current = Taro.createVideoContext(videoId)
  }, [videoId])

  // 视频源变化时重置状态
  useEffect(() => {
    setCurrentTime(0)
    setMaxPlayedTime(0)
    setIsPlaying(false)
    setDuration(0)
  }, [src])

  // 播放/暂停
  const handlePlayPause = () => {
    if (!videoContextRef.current) return
    
    if (isPlaying) {
      videoContextRef.current.pause()
    } else {
      videoContextRef.current.play()
    }
  }

  // 全屏
  const handleFullscreen = () => {
    if (!videoContextRef.current) return
    videoContextRef.current.requestFullScreen()
  }

  // 监听播放
  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  // 监听时间更新
  const handleTimeUpdate = (e) => {
    const current = e.detail.currentTime
    setCurrentTime(current)
    
    // 记录最大播放位置（用于防止跳过）
    if (current > maxPlayedTime) {
      setMaxPlayedTime(current)
    }
  }

  // 监听元数据加载
  const handleLoadedMetadata = (e) => {
    setDuration(e.detail.duration)
  }

  // 监听拖动（防止作弊）
  const handleSeeking = (e) => {
    // 已完成的视频允许拖动
    if (isCompleted) return

    const seekTime = e.detail.currentTime
    
    // 如果试图跳过未观看的部分，强制跳回
    if (seekTime > maxPlayedTime + 1) {
      if (videoContextRef.current) {
        setTimeout(() => {
          videoContextRef.current.seek(maxPlayedTime)
        }, 100)
      }
      
      Taro.showToast({
        title: '请完整观看视频',
        icon: 'none',
        duration: 1500
      })
    }
  }

  // 播放结束
  const handleEnded = () => {
    setIsPlaying(false)
    
    // 触发完成回调
    if (!isCompleted && onComplete) {
      onComplete()
    }
  }

  // 错误处理
  const handleError = (e) => {
    console.error('视频播放错误:', e)
    if (onError) {
      onError(e)
    }
  }

  // 格式化时间
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className='custom-video-wrapper'>
      <Video
        id={videoId}
        className='custom-video-player'
        src={src}
        controls={isCompleted}
        autoplay={false}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeking={handleSeeking}
        onEnded={handleEnded}
        onError={handleError}
        showCenterPlayBtn={isCompleted}
        showPlayBtn={isCompleted}
        showFullscreenBtn={isCompleted}
        showProgress={isCompleted}
        enableProgressGesture={isCompleted}
        enablePlayGesture={false}
        objectFit='contain'
      />
      
      {/* 自定义控制栏 - 仅未完成时显示 */}
      {!isCompleted && (
        <View className='custom-video-controls'>
          <View className='control-row'>
            {/* 播放/暂停按钮 - 左侧 */}
            <View className='control-btn' onClick={handlePlayPause}>
              <Image className='btn-icon' src={isPlaying ? PAUSE_ICON : PLAY_ICON} mode='aspectFit' />
            </View>
            
            {/* 中间空白占位 */}
            <View className='progress-section'>
              <View className='progress-placeholder' />
            </View>
            
            {/* 全屏按钮 - 右侧 */}
            <View className='control-btn' onClick={handleFullscreen}>
              <Text className='btn-icon'>⛶</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

