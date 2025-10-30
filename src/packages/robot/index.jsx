import { View, Text, Button, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, useDidShow, useUnload } from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import ThinkingAnimation from '../../components/ThinkingAnimation'
import { MoziWebSocket } from '../../utils/moziWebSocket'
import { WS_URL } from '../../utils/constants'
import { 
  WS_EVENTS, 
  PLATFORMS, 
  createAIChatMessage,
  createAIChatStopMessage,
  createAIChatRegenerateMessage,
  createAIChatHistoryMessage,
  getErrorDescription
} from '../../utils/websocketProtocol'
import './index.less'

export default function Robot() {

  const BOT_AVATAR = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/AI_Bot.png'

  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([
    { 
      id: 'welcome-1', 
      role: 'assistant', 
      content: '你好，我是你的AI助手！我可以帮你分析币种行情、解答投资问题。有什么可以帮你？', 
      time: Date.now() 
    }
  ])
  const [isConnecting, setIsConnecting] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  const scrollRef = useRef(null)
  const wsRef = useRef(null)
  const conversationIdRef = useRef(null)
  const currentMessageIdRef = useRef(null)
  const currentRequestIdRef = useRef(null)
  const hasLoadedHistoryRef = useRef(false)

  // 初始化 WebSocket
  useLoad(() => {
    Taro.setNavigationBarTitle({ title: 'AI 助手' })
    
    console.log('🤖 初始化 AI 对话 WebSocket')
    
    // 尝试从存储读取上次的 conversationId
    try {
      const savedConversationId = Taro.getStorageSync('ai_conversation_id')
      if (savedConversationId) {
        conversationIdRef.current = savedConversationId
        console.log('📌 从本地读取会话 ID:', savedConversationId)
      }
    } catch (e) {
      console.error('读取会话ID失败:', e)
    }
    
    const ws = new MoziWebSocket(WS_URL, {
      platform: PLATFORMS.WECHAT_MINIAPP,
      version: '1.0.0',
      autoHandshake: true,
      debug: true,
    })

    wsRef.current = ws

    // 监听认证成功
    ws.on('authenticated', (data) => {
      console.log('✅ AI 对话 WebSocket 认证成功')
      setIsConnecting(false)
      
      // 认证成功后，立即请求历史记录
      if (!hasLoadedHistoryRef.current && ws.isConnected) {
        const conversationId = conversationIdRef.current
        console.log(`📜 请求历史对话记录... (会话ID: ${conversationId || '无'})`)
        setIsLoadingHistory(true)
        try {
          const historyMessage = createAIChatHistoryMessage(conversationId, 50)
          ws.send(historyMessage)
          hasLoadedHistoryRef.current = true
        } catch (error) {
          console.error('❌ 请求历史记录失败:', error)
          setIsLoadingHistory(false)
        }
      }
    })

    // 监听 AI 开始回复
    ws.on(WS_EVENTS.AI_CHAT_START, (data) => {
      console.log('🤖 AI 开始回复:', data)
      const { conversationId, messageId } = data.data || {}
      
      if (conversationId) {
        conversationIdRef.current = conversationId
        // 保存到存储
        try {
          Taro.setStorageSync('ai_conversation_id', conversationId)
        } catch (e) {
          console.error('保存会话ID失败:', e)
        }
      }
      if (messageId) {
        currentMessageIdRef.current = messageId
      }
      
      setIsStreaming(true)
      
      // 更新 loading 消息的 ID
      setMessages(prev => prev.map(msg => {
        if (msg.requestId === data.requestId && msg.loading) {
          return { ...msg, messageId: messageId }
        }
        return msg
      }))
    })

    // 监听 AI 流式响应
    ws.on(WS_EVENTS.AI_CHAT_STREAM, (data) => {
      console.log('📝 AI 流式响应:', data)
      const { content, delta, isComplete, conversationId, messageId } = data.data || {}
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1]
        
        // 如果最后一条是 AI 的流式消息，更新它
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.loading) {
          return prev.map((msg, idx) => 
            idx === prev.length - 1 
              ? { 
                  ...msg, 
                  content: content || msg.content,
                  loading: !isComplete,
                  messageId: messageId || msg.messageId,
                  conversationId: conversationId || msg.conversationId
                }
              : msg
          )
        }
        
        // 否则添加新的流式消息
        return [...prev, {
          id: `ai-${Date.now()}`,
          messageId: messageId,
          conversationId: conversationId,
          role: 'assistant',
          content: content || '',
          time: Date.now(),
          loading: !isComplete
        }]
      })
    })

    // 监听 AI 回复完成
    ws.on(WS_EVENTS.AI_CHAT_COMPLETE, (data) => {
      console.log('✅ AI 回复完成:', data)
      const { fullContent, tokens, suggestedQuestions: suggested, conversationId, messageId } = data.data || {}
      
      setIsStreaming(false)
      currentMessageIdRef.current = null
      
      // 更新消息状态
      setMessages(prev => prev.map(msg => {
        if (msg.messageId === messageId || msg.loading) {
          return {
            ...msg,
            content: fullContent || msg.content,
            loading: false,
            tokens: tokens,
            messageId: messageId,
            conversationId: conversationId
          }
        }
        return msg
      }))
      
      // 更新建议问题
      if (suggested && suggested.length > 0) {
        setSuggestedQuestions(suggested)
      }
    })

    // 监听 AI 对话错误
    ws.on(WS_EVENTS.AI_CHAT_ERROR, (data) => {
      console.error('❌ AI 对话错误:', data)
      const errorCode = data.code
      const errorMsg = data.message || getErrorDescription(errorCode) || '抱歉，出现了一些问题，请稍后再试'
      
      setIsStreaming(false)
      currentMessageIdRef.current = null
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg && lastMsg.loading) {
          return prev.map((msg, idx) => 
            idx === prev.length - 1 
              ? { ...msg, content: errorMsg, loading: false, error: true, errorCode: errorCode }
              : msg
          )
        }
        return [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorMsg,
          time: Date.now(),
          error: true,
          errorCode: errorCode
        }]
      })
    })

    // 监听历史记录响应
    ws.on(WS_EVENTS.AI_CHAT_HISTORY_RESPONSE, (data) => {
      console.log('📜 收到历史记录:', data)
      setIsLoadingHistory(false)
      
      const { messages: historyMessages, conversationId } = data.data || {}
      
      if (historyMessages && historyMessages.length > 0) {
        console.log(`✅ 加载了 ${historyMessages.length} 条历史消息`)
        
        // 如果有历史记录，保存 conversationId
        if (conversationId) {
          conversationIdRef.current = conversationId
          try {
            Taro.setStorageSync('ai_conversation_id', conversationId)
          } catch (e) {
            console.error('保存会话ID失败:', e)
          }
          console.log('📌 设置并保存会话 ID:', conversationId)
        }
        
        // 格式化历史消息
        const formattedMessages = historyMessages.map(msg => ({
          id: msg.messageId || `history-${msg.timestamp}`,
          messageId: msg.messageId,
          role: msg.role === 'system' ? 'assistant' : msg.role,
          content: msg.content,
          time: msg.timestamp || Date.now(),
        }))
        
        // 如果有历史记录，替换掉默认的欢迎消息
        setMessages(formattedMessages)
      } else {
        console.log('📭 没有历史记录，显示默认欢迎消息')
      }
    })

    // 连接 WebSocket
    ws.connect()
  })

  useShareAppMessage(() => {
    return { title: 'AI 助手' }
  })

  // 卸载时断开 WebSocket
  useUnload(() => {
    console.log('🔴 AI 对话页面卸载，断开 WebSocket')
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }
  })

  // 自动滚动到底部
  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current && scrollRef.current.scrollTo) {
        try {
          scrollRef.current.scrollTo({ scrollTop: 999999, duration: 200 })
        } catch (e) {}
      }
    }, 100)
  }, [messages])

  // 发送消息
  const handleSend = (text = null) => {
    const message = text || inputValue.trim()
    if (!message || isConnecting || isStreaming) return

    // 添加用户消息
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      time: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setSuggestedQuestions([]) // 清除建议问题

    // 生成请求 ID
    const requestId = `req-ai-${Date.now()}`
    currentRequestIdRef.current = requestId

    // 添加 AI 加载消息
    setMessages(prev => [...prev, {
      id: `ai-loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      time: Date.now(),
      loading: true,
      requestId: requestId
    }])

    // 通过 WebSocket 发送 AI 对话请求
    if (wsRef.current && wsRef.current.isConnected) {
      try {
        const chatMessage = createAIChatMessage(
          message,
          conversationIdRef.current,
          null,
          requestId
        )
        wsRef.current.send(chatMessage)
        console.log('📤 发送 AI 对话请求:', chatMessage)
      } catch (error) {
        console.error('发送消息失败:', error)
        setMessages(prev => prev.map(msg => 
          msg.requestId === requestId 
            ? { ...msg, content: '发送失败，请重试', loading: false, error: true }
            : msg
        ))
      }
    } else {
      setMessages(prev => prev.map(msg => 
        msg.requestId === requestId 
          ? { ...msg, content: 'WebSocket 未连接，请返回重试', loading: false, error: true }
          : msg
      ))
    }
  }

  // 停止生成
  const handleStop = () => {
    if (!isStreaming || !currentMessageIdRef.current) return
    
    if (wsRef.current && wsRef.current.isConnected) {
      try {
        const stopMessage = createAIChatStopMessage(
          conversationIdRef.current,
          currentMessageIdRef.current
        )
        wsRef.current.send(stopMessage)
        console.log('🛑 停止生成:', stopMessage)
        setIsStreaming(false)
      } catch (error) {
        console.error('停止生成失败:', error)
      }
    }
  }

  // 重新生成
  const handleRegenerate = (messageId) => {
    if (!messageId || isStreaming) return
    
    if (wsRef.current && wsRef.current.isConnected) {
      try {
        const regenerateMessage = createAIChatRegenerateMessage(
          conversationIdRef.current,
          messageId
        )
        wsRef.current.send(regenerateMessage)
        console.log('🔄 重新生成:', regenerateMessage)
        
        // 添加加载消息
        setMessages(prev => [...prev, {
          id: `ai-regenerate-${Date.now()}`,
          role: 'assistant',
          content: '',
          time: Date.now(),
          loading: true
        }])
      } catch (error) {
        console.error('重新生成失败:', error)
      }
    }
  }

  // 点击建议问题
  const handleSuggestedQuestion = (question) => {
    handleSend(question)
  }

  // 格式化时间
  const formatTime = (ts) => {
    const d = new Date(ts)
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <View className='robot-page'>
      <View className='chat-header'>
        <Text className='chat-title'>AI 助手</Text>
        <Text className='chat-subtitle'>
          智能答疑 · 快速响应
          {isConnecting && ' (连接中...)'}
          {conversationIdRef.current && ` | 会话ID: ${conversationIdRef.current.slice(-8)}`}
        </Text>
      </View>

      <ScrollView
        className='chat-scroll'
        scrollY
        ref={scrollRef}
        showScrollbar={false}
        scrollIntoView={`msg-${messages.length - 1}`}
      >
        {/* 加载历史记录提示 */}
        {isLoadingHistory && (
          <View className='loading-history'>
            <Text className='loading-text'>正在加载历史对话...</Text>
          </View>
        )}
        
        <View className='messages'>
          {messages.map((msg, idx) => (
            <View key={msg.id} id={`msg-${idx}`} className={`msg-row ${msg.role === 'user' ? 'right' : 'left'}`}>
              {msg.role === 'assistant' && (
                <View className='avatar-col'>
                  <Image className='avatar' src={BOT_AVATAR} mode='aspectFit' />
                  <Text className='time-under'>{formatTime(msg.time)}</Text>
                </View>
              )}

              <View className='msg-content'>
                <View className={`bubble ${msg.role} ${msg.error ? 'error' : ''}`}>
                  <View className='text'>
                    {msg.loading && !msg.content ? (
                      <ThinkingAnimation />
                    ) : (
                      <Text>{msg.content || ''}</Text>
                    )}
                    {msg.loading && msg.content && <Text className='loading-dots'>...</Text>}
                  </View>
                  
                  {/* Token 消耗信息 */}
                  {msg.tokens && (
                    <View className='token-info'>
                      <Text>消耗 {msg.tokens} tokens</Text>
                    </View>
                  )}
                </View>
                
                {/* AI 消息操作按钮 */}
                {msg.role === 'assistant' && !msg.loading && msg.messageId && (
                  <View className='msg-actions'>
                    <Button 
                      className='action-btn'
                      onClick={() => handleRegenerate(msg.messageId)}
                      disabled={isStreaming}
                      hoverClass='action-btn-hover'
                    >
                      <View className='action-btn-content'>
                        <Text className='reload-icon'>↻</Text>
                        <Text>重新生成</Text>
                      </View>
                    </Button>
                  </View>
                )}
              </View>

              {msg.role === 'user' && (
                <View className='avatar-col'>
                  <View className='avatar user-avatar'>
                    <Text>我</Text>
                  </View>
                  <Text className='time-under'>{formatTime(msg.time)}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 建议问题 */}
      {suggestedQuestions.length > 0 && !isStreaming && (
        <View className='suggested-questions'>
          <Text className='suggested-title'>你可能还想问：</Text>
          {suggestedQuestions.map((q, idx) => (
            <Button
              key={idx}
              className='suggested-btn'
              onClick={() => handleSuggestedQuestion(q)}
            >
              {q}
            </Button>
          ))}
        </View>
      )}

      <View className='chat-input-bar'>
        <View className='input-box'>
          <Input
            className='input'
            value={inputValue}
            placeholder='输入你的问题...'
            confirmType='send'
            onConfirm={() => !isStreaming && handleSend()}
            onInput={(e) => setInputValue(e.detail.value)}
            disabled={isConnecting || isStreaming}
          />
        </View>
        {isStreaming ? (
          <Button 
            className='stop-btn' 
            onClick={handleStop}
          >
            停止
          </Button>
        ) : (
          <Button 
            className='send-btn' 
            onClick={() => handleSend()}
            disabled={isConnecting || !inputValue.trim()}
          >
            发送
          </Button>
        )}
      </View>
      <View className='safe-bottom' />
    </View>
  )
}
