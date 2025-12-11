import { View, Image } from '@tarojs/components'
import Taro, { usePageScroll } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import './index.less'

/**
 * AI 机器人浮动按钮组件
 * @param {string} message - 显示的消息文本
 * @param {string} targetPath - 点击后跳转的路径
 * @param {number} startDelay - 动画开始延迟（毫秒）
 * @param {number} showDuration - 消息显示时长（毫秒）
 * @param {boolean} autoPlay - 是否自动播放动画
 * @param {string} showOnSelector - 只在滚动到指定选择器区域时显示（如 '.marketBox'）
 */
export default function FloatingRobot({
  message = '有问题？问我吧！',
  targetPath = '/packages/robot/index',
  startDelay = 500,
  showDuration = 5000,
  autoPlay = true,
  showOnSelector = null
}) {
  // 动画状态：hidden -> rolling-in -> showing -> rolling-out -> resting
  const [animState, setAnimState] = useState(autoPlay ? 'hidden' : 'resting')
  const [showBubble, setShowBubble] = useState(false)
  const [containerWidth, setContainerWidth] = useState(100) // rpx
  const animationRef = useRef(null)
  const [isInTargetArea, setIsInTargetArea] = useState(false) // 是否在目标区域内
  const scrollCheckTimer = useRef(null)

  // 检测目标区域是否在可视区域内
  const checkScrollPosition = () => {
    if (!showOnSelector) {
      setIsInTargetArea(true)
      return
    }

    Taro.createSelectorQuery()
      .select(showOnSelector)
      .boundingClientRect((rect) => {
        if (rect) {
          // 获取窗口高度
          const systemInfo = Taro.getSystemInfoSync()
          const windowHeight = systemInfo.windowHeight
          
          // 判断目标区域是否在可视区域内
          // 当目标区域的顶部进入屏幕底部时显示
          const isVisible = rect.top < windowHeight && rect.bottom > 0
          setIsInTargetArea(isVisible)
        }
      })
      .exec()
  }

  // 初始化检查
  useEffect(() => {
    if (!showOnSelector) {
      setIsInTargetArea(true)
      return
    }
    
    // 延迟检查，确保 DOM 已渲染
    setTimeout(() => {
      checkScrollPosition()
    }, 300)
  }, [showOnSelector])

  // 使用 usePageScroll 监听页面滚动
  usePageScroll(() => {
    if (!showOnSelector) return
    
    // 使用节流，避免频繁检查
    if (scrollCheckTimer.current) {
      clearTimeout(scrollCheckTimer.current)
    }
    scrollCheckTimer.current = setTimeout(() => {
      checkScrollPosition()
    }, 100)
  })

  // 计算容器宽度
  useEffect(() => {
    if (animState === 'rolling-in' || animState === 'showing') {
      // 估算文字宽度（每个字符约 24rpx）
      const textWidth = message.length * 24 + 40 // 加上 padding
      const iconWidth = 100
      setContainerWidth(iconWidth + textWidth)
    } else {
      setContainerWidth(100)
    }
  }, [animState, message])

  // 自动播放动画序列
  useEffect(() => {
    if (!autoPlay) return
    // 如果设置了区域限制且不在目标区域内，不播放动画
    if (showOnSelector && !isInTargetArea) return

    const timers = []

    // 1. 延迟后开始滚入
    timers.push(setTimeout(() => {
      setAnimState('rolling-in')
      setShowBubble(true)
    }, startDelay))

    // 2. 滚入完成，进入展示状态
    timers.push(setTimeout(() => {
      setAnimState('showing')
    }, startDelay + 1800))

    // 3. 展示结束，开始滚出
    timers.push(setTimeout(() => {
      setShowBubble(false)
      setAnimState('rolling-out')
    }, startDelay + 1800 + showDuration))

    // 4. 滚出完成，进入隐藏状态（延迟 1.5s = 1.1s 动画 + 0.4s 过渡）
    timers.push(setTimeout(() => {
      setAnimState('hidden-right')
    }, startDelay + 1800 + showDuration + 1500))

    // 5. 从隐藏状态过渡回静止状态
    timers.push(setTimeout(() => {
      setAnimState('resting')
    }, startDelay + 1800 + showDuration + 1550))

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [autoPlay, startDelay, showDuration, isInTargetArea])

  // 点击处理
  const handleClick = () => {
    Taro.navigateTo({
      url: targetPath
    })
  }

  // 如果设置了区域限制且不在目标区域内，不渲染组件
  if (showOnSelector && !isInTargetArea) {
    return null
  }

  return (
    <View 
      className={`floating-robot ${animState}`}
      onClick={handleClick}
    >
      {/* 椭圆容器 */}
      <View 
        className={`robot-container ${animState}`}
        style={{ width: `${containerWidth}rpx` }}
      >
        {/* 背景层 */}
        <View className={`robot-bg ${animState}`} />

        {/* 机器人图标容器 */}
        <View className='robot-icon-wrapper'>
          {/* 光晕效果 */}
          <View className={`robot-glow ${animState}`} />
          
          {/* 机器人图标 */}
          <Image 
            className={`robot-icon ${animState}`}
            src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/AI_Bot.png'
            mode='aspectFit'
          />
        </View>

        {/* 消息文字 */}
        {showBubble && (
          <View className={`robot-message ${animState}`}>
            {message}
          </View>
        )}
      </View>
    </View>
  )
}
