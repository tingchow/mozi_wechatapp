import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import './index.less'

/**
 * AI 机器人浮动按钮组件
 * @param {string} message - 显示的消息文本
 * @param {string} targetPath - 点击后跳转的路径
 * @param {number} startDelay - 动画开始延迟（毫秒）
 * @param {number} showDuration - 消息显示时长（毫秒）
 * @param {boolean} autoPlay - 是否自动播放动画
 */
export default function FloatingRobot({
  message = '有问题？问我吧！',
  targetPath = '/packages/robot/index',
  startDelay = 500,
  showDuration = 5000,
  autoPlay = true
}) {
  // 动画状态：hidden -> rolling-in -> showing -> rolling-out -> resting
  const [animState, setAnimState] = useState(autoPlay ? 'hidden' : 'resting')
  const [showBubble, setShowBubble] = useState(false)
  const [containerWidth, setContainerWidth] = useState(100) // rpx
  const animationRef = useRef(null)

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

    // 4. 滚出完成，进入静止状态（延迟 1.5s = 1.1s 动画 + 0.4s 过渡）
    timers.push(setTimeout(() => {
      setAnimState('resting')
    }, startDelay + 1800 + showDuration + 1500))

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [autoPlay, startDelay, showDuration])

  // 点击处理
  const handleClick = () => {
    Taro.navigateTo({
      url: targetPath
    })
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
