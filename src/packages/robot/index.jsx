import { View, Text, Button, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, useDidShow } from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'
import './index.less'

export default function Robot() {

  const BOT_AVATAR = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/AI_Bot.png'

  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([
    { id: 'hello-1', role: 'assistant', content: '你好，我是你的AI助手，有什么可以帮你？', time: Date.now() }
  ])
  const scrollRef = useRef(null)

  useLoad(() => {
    Taro.setNavigationBarTitle({ title: 'AI 对话' })
  })

  useShareAppMessage(() => {
    return { title: 'AI 对话助手' }
  })

  useEffect(() => {
    // 滚动到底部
    setTimeout(() => {
      if (scrollRef.current && scrollRef.current.scrollTo) {
        try {
          scrollRef.current.scrollTo({ scrollTop: 999999, duration: 200 })
        } catch (e) {}
      }
    }, 0)
  }, [messages])

  const handleSend = async () => {
    const text = String(inputValue || '').trim()
    if (!text) return

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      time: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    // 占位的AI回复（后续可接真实API）
    const loadingId = `a-${Date.now()}-loading`
    setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '正在思考中…', time: Date.now(), loading: true }])

    // 模拟请求
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `你说的是：“${text}”`, loading: false } : m))
    }, 600)
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <View className='robot-page'>
      <View className='chat-header'>
        <Text className='chat-title'>AI 助手</Text>
        <Text className='chat-subtitle'>智能答疑 · 快速响应</Text>
      </View>

      <ScrollView
        className='chat-scroll'
        scrollY
        ref={scrollRef}
        showScrollbar={false}
      >
        <View className='messages'>
          {messages.map(msg => (
            <View key={msg.id} className={`msg-row ${msg.role === 'user' ? 'right' : 'left'}`}>
              {msg.role === 'assistant' && (
                <View className='avatar-col'>
                  <Image className='avatar' src={BOT_AVATAR} mode='aspectFit' />
                  <Text className='time-under'>{formatTime(msg.time)}</Text>
                </View>
              )}

              <View className={`bubble ${msg.role}`}>
                <Text className='text'>{msg.content}</Text>
              </View>

              {msg.role === 'user' && (
                <View className='avatar-col'>
                  <View className='avatar user-avatar'>我</View>
                  <Text className='time-under'>{formatTime(msg.time)}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className='chat-input-bar'>
        <View className='input-box'>
          <Input
            className='input'
            value={inputValue}
            placeholder='输入你的问题...'
            confirmType='send'
            onConfirm={handleSend}
            onInput={(e) => setInputValue(e.detail.value)}
          />
        </View>
        <Button className='send-btn' onClick={handleSend}>发送</Button>
      </View>
      <View className='safe-bottom' />
    </View>
  )
}


