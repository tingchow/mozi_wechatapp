/**
 * 全局 WebSocket Context
 * 在应用启动时建立 WebSocket 连接，各页面通过 Context 共享连接
 */

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { MoziWebSocket } from '../utils/moziWebSocket';
import { WS_URL } from '../utils/constants';
import { WS_EVENTS } from '../utils/websocketProtocol';

// 创建 Context
const WebSocketContext = createContext(null);

/**
 * WebSocket Provider 组件
 * 在应用根组件中使用，提供全局 WebSocket 连接
 */
export function WebSocketProvider({ children }) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const subscriptionsRef = useRef(new Map()); // 存储订阅信息
  const eventListenersRef = useRef(new Map()); // 存储事件监听器

  // 初始化 WebSocket 连接
  useEffect(() => {
    console.log('[WebSocketContext] 初始化全局 WebSocket 连接');
    
    // 创建 WebSocket 实例
    wsRef.current = new MoziWebSocket(WS_URL, {
      debug: true,
      autoHandshake: true,
      heartbeatInterval: 30000,
      maxReconnectAttempts: -1, // 无限重连
    });

    // 监听连接打开事件
    wsRef.current.on('open', () => {
      console.log('[WebSocketContext] WebSocket 已连接');
      setIsConnected(true);
    });

    // 监听认证成功事件
    wsRef.current.on('authenticated', () => {
      console.log('[WebSocketContext] WebSocket 认证成功');
      setIsAuthenticated(true);
      
      // 重新订阅之前的频道
      resubscribeAll();
    });

    // 监听连接关闭事件
    wsRef.current.on('close', () => {
      console.log('[WebSocketContext] WebSocket 已断开');
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    // 监听错误事件
    wsRef.current.on('ws_error', (error) => {
      console.error('[WebSocketContext] WebSocket 错误:', error);
    });

    // 监听订阅响应事件，保存 channelId
    wsRef.current.on(WS_EVENTS.SUBSCRIBE_RESPONSE, (response) => {
      console.log('[WebSocketContext] 📨 收到订阅响应:', response);
      if (response.data?.channels && Array.isArray(response.data.channels)) {
        response.data.channels.forEach((channelInfo) => {
          // 服务器返回的 channelInfo 包含: { channelId, type, symbols, params? }
          console.log('[WebSocketContext] 处理频道信息:', channelInfo);
          
          // 遍历所有订阅，找到匹配的
          let found = false;
          subscriptionsRef.current.forEach((subscription, key) => {
            const channel = subscription.channel;
            
            // 匹配条件：type 和 symbols 必须相同
            const typeMatch = channel.type === channelInfo.type;
            const symbolsMatch = JSON.stringify(channel.symbols) === JSON.stringify(channelInfo.symbols);
            
            if (typeMatch && symbolsMatch) {
              // 如果服务器返回了 params，也要检查 params 是否匹配
              let paramsMatch = true;
              if (channelInfo.params && channel.params) {
                paramsMatch = JSON.stringify(channel.params) === JSON.stringify(channelInfo.params);
              }
              
              if (paramsMatch) {
                subscription.channelId = channelInfo.channelId;
                console.log('[WebSocketContext] ✅ 保存 channelId:', channelInfo.channelId, '对应订阅 key:', key);
                found = true;
              }
            }
          });
          
          if (!found) {
            console.warn('[WebSocketContext] ⚠️ 未找到对应的订阅，频道信息:', channelInfo);
          }
        });
      }
    });

    // 连接 WebSocket
    wsRef.current.connect();

    // 清理函数（应用卸载时）
    return () => {
      console.log('[WebSocketContext] 清理 WebSocket 连接');
      if (wsRef.current) {
        // 清理所有订阅
        subscriptionsRef.current.clear();
        eventListenersRef.current.clear();
        
        // 断开连接
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, []);

  /**
   * 重新订阅所有频道（用于重连后恢复订阅）
   */
  const resubscribeAll = () => {
    if (!wsRef.current || !isAuthenticated) return;

    const channels = Array.from(subscriptionsRef.current.values()).map(sub => sub.channel);
    if (channels.length === 0) return;

    console.log('[WebSocketContext] 重新订阅频道:', channels);
    
    // 重新注册事件监听器
    eventListenersRef.current.forEach((callbacks, eventType) => {
      callbacks.forEach(callback => {
        wsRef.current.on(eventType, callback);
      });
    });
  };

  /**
   * 订阅频道
   * @param {Object} channel 频道配置
   * @param {Function} callback 接收数据的回调函数
   * @returns {Function} 取消订阅的函数
   */
  const subscribe = (channel, callback) => {
    if (!wsRef.current) {
      console.warn('[WebSocketContext] WebSocket 未初始化');
      return () => {};
    }

    const channelKey = JSON.stringify(channel);
    const eventType = channel.type;
    
    console.log('[WebSocketContext] 🟢 订阅频道:', channelKey);
    
    // 创建包装后的回调函数（用于匹配频道）
    const wrappedCallback = (data) => {
      const matched = matchChannel(data, channel);
      if (matched) {
        callback(data);
      }
    };
    
    // 保存订阅信息（channelId 将在收到订阅响应时保存）
    subscriptionsRef.current.set(channelKey, { 
      channel, 
      callback: wrappedCallback,
      originalCallback: callback,
      channelId: null  // 初始为 null，等待服务器响应
    });

    // 保存事件监听器
    if (!eventListenersRef.current.has(eventType)) {
      eventListenersRef.current.set(eventType, new Set());
    }
    eventListenersRef.current.get(eventType).add(wrappedCallback);

    // 注册事件监听
    wsRef.current.on(eventType, wrappedCallback);

    // 如果已认证，立即发送订阅消息
    if (isAuthenticated) {
      const timestamp = Date.now();
      const message = {
        event: WS_EVENTS.SUBSCRIBE,
        data: {
          channels: [channel]
        },
        timestamp: timestamp,
        requestId: `req-subscribe-${timestamp}`
      };
      console.log('[WebSocketContext] 📤 发送订阅消息:', message);
      wsRef.current.send(message);
    }

    // 返回取消订阅函数
    return () => {
      unsubscribe(channelKey, eventType, wrappedCallback);
    };
  };

  /**
   * 取消订阅
   * @param {string} channelKey 频道键
   * @param {string} eventType 事件类型
   * @param {Function} wrappedCallback 包装后的回调函数
   */
  const unsubscribe = (channelKey, eventType, wrappedCallback) => {
    if (!wsRef.current) {
      console.warn('[WebSocketContext] WebSocket 未初始化，无法取消订阅');
      return;
    }

    console.log('[WebSocketContext] 🔴 开始取消订阅:', channelKey);

    const subscription = subscriptionsRef.current.get(channelKey);
    if (!subscription) {
      console.log('[WebSocketContext] ⚠️ 订阅不存在，可能已经取消');
      return;
    }

    console.log('[WebSocketContext] 订阅信息:', {
      channel: subscription.channel,
      channelId: subscription.channelId
    });

    // 发送取消订阅消息到服务器（如果有 channelId）
    if (subscription.channelId && isAuthenticated) {
      const timestamp = Date.now();
      const message = {
        event: WS_EVENTS.UNSUBSCRIBE,
        data: {
          channelIds: [subscription.channelId]
        },
        timestamp: timestamp,
        requestId: `req-unsubscribe-${timestamp}`
      };
      console.log('[WebSocketContext] 📤 发送取消订阅消息到服务器:', message);
      wsRef.current.send(message);
    } else {
      if (!subscription.channelId) {
        console.warn('[WebSocketContext] ⚠️ channelId 不存在，无法发送取消订阅消息');
      }
      if (!isAuthenticated) {
        console.warn('[WebSocketContext] ⚠️ 未认证，无法发送取消订阅消息');
      }
    }

    // 从订阅列表中移除
    subscriptionsRef.current.delete(channelKey);
    console.log('[WebSocketContext] ✅ 已从订阅列表中移除');

    // 移除事件监听器
    if (eventListenersRef.current.has(eventType)) {
      eventListenersRef.current.get(eventType).delete(wrappedCallback);
      if (eventListenersRef.current.get(eventType).size === 0) {
        eventListenersRef.current.delete(eventType);
        console.log('[WebSocketContext] ✅ 事件类型已完全移除:', eventType);
      } else {
        console.log('[WebSocketContext] 事件类型仍有其他监听器:', eventType);
      }
    }
    
    // 从 WebSocket 中移除监听
    if (wsRef.current) {
      wsRef.current.off(eventType, wrappedCallback);
      console.log('[WebSocketContext] ✅ 已移除 WebSocket 事件监听');
    }
    
    console.log('[WebSocketContext] ✅ 取消订阅完成');
  };

  /**
   * 发送消息
   * @param {Object} message 消息对象
   */
  const sendMessage = (message) => {
    if (!wsRef.current) {
      console.warn('[WebSocketContext] WebSocket 未初始化');
      return false;
    }
    return wsRef.current.send(message);
  };

  // Context 值
  const contextValue = {
    ws: wsRef.current,
    isConnected,
    isAuthenticated,
    subscribe,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * 使用 WebSocket Context 的 Hook
 * @returns {Object} WebSocket 上下文
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

/**
 * 检查数据是否匹配订阅频道
 * @param {Object} data 接收到的数据
 * @param {Object} channel 订阅的频道配置
 * @returns {boolean} 是否匹配
 */
function matchChannel(data, channel) {
  // 检查频道类型
  if (data.event !== channel.type) {
    return false;
  }

  // 检查 symbol 或 symbols
  const dataSymbol = data.data?.symbol || data.data?.headerData?.symbol;
  
  if (channel.symbol && dataSymbol !== channel.symbol) {
    return false;
  }
  
  if (channel.symbols && channel.symbols.length > 0) {
    if (!dataSymbol || !channel.symbols.includes(dataSymbol)) {
      return false;
    }
  }

  // 检查其他参数（如 period）
  if (channel.params && channel.params.period) {
    const dataPeriod = data.data?.period || 
                       data.data?.params?.period || 
                       data.data?.klineData?.realKlineData?.period;
    
    if (dataPeriod && dataPeriod !== channel.params.period) {
      return false;
    }
  }

  return true;
}

export default WebSocketContext;

