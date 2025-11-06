/**
 * Mozi WebSocket Hook for Taro 微信小程序
 * 提供 WebSocket 连接管理和数据订阅功能
 * 支持自动重连、心跳检测、频道订阅管理
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { MoziWebSocket } from './moziWebSocket';
import { WS_URL } from './constants';
import { createSubscribeMessage, createUnsubscribeMessage, WS_EVENTS } from './websocketProtocol';

/**
 * 使用 Mozi WebSocket Hook
 * @param {Object} options 配置选项
 * @param {boolean} options.autoConnect 是否自动连接，默认 true
 * @param {Function} options.onConnected WebSocket 连接成功回调
 * @param {Function} options.onDisconnected WebSocket 断开连接回调
 * @param {Function} options.onError WebSocket 错误回调
 * @returns {Object} WebSocket 实例和状态
 */
export function useMoziWebSocket(options = {}) {
  const {
    autoConnect = true,
    onConnected,
    onDisconnected,
    onError
  } = options;

  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const subscriptionsRef = useRef(new Map()); // 存储订阅信息

  // 初始化 WebSocket
  useEffect(() => {
    if (!autoConnect) return;

    // 创建 WebSocket 实例
    wsRef.current = new MoziWebSocket(WS_URL, {
      debug: true,
      autoHandshake: true,
      heartbeatInterval: 30000,
      maxReconnectAttempts: -1, // 无限重连
    });

    // 监听连接打开事件
    wsRef.current.on('open', () => {
      console.log('[useMoziWebSocket] WebSocket 已连接');
      setIsConnected(true);
      onConnected?.();
    });

    // 监听认证成功事件
    wsRef.current.on('authenticated', () => {
      console.log('[useMoziWebSocket] WebSocket 认证成功');
      setIsAuthenticated(true);
      
      // 重新订阅之前的频道
      resubscribeAll();
    });

    // 监听连接关闭事件
    wsRef.current.on('close', () => {
      console.log('[useMoziWebSocket] WebSocket 已断开');
      setIsConnected(false);
      setIsAuthenticated(false);
      onDisconnected?.();
    });

    // 监听错误事件
    wsRef.current.on('ws_error', (error) => {
      console.error('[useMoziWebSocket] WebSocket 错误:', error);
      onError?.(error);
    });

    // 连接 WebSocket
    wsRef.current.connect();

    // 清理函数
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      subscriptionsRef.current.clear();
    };
  }, [autoConnect]);

  /**
   * 重新订阅所有频道（用于重连后恢复订阅）
   */
  const resubscribeAll = useCallback(() => {
    if (!wsRef.current || !isAuthenticated) return;

    const channels = Array.from(subscriptionsRef.current.keys());
    if (channels.length === 0) return;

    console.log('[useMoziWebSocket] 重新订阅频道:', channels);
    const message = createSubscribeMessage(channels);
    wsRef.current.send(message);
  }, [isAuthenticated]);

  /**
   * 订阅频道
   * @param {Object} channel 频道配置
   * @param {Function} callback 接收数据的回调函数
   * @returns {Function} 取消订阅的函数
   */
  const subscribe = useCallback((channel, callback) => {
    if (!wsRef.current) {
      console.warn('[useMoziWebSocket] WebSocket 未初始化');
      return () => {};
    }

    const channelKey = JSON.stringify(channel);
    
    // 注册回调
    subscriptionsRef.current.set(channelKey, { channel, callback });

    // 监听对应的数据事件
    const eventType = channel.type;
    wsRef.current.on(eventType, (data) => {
      // 检查数据是否匹配当前订阅
      if (matchChannel(data, channel)) {
        callback(data);
      }
    });

    // 如果已认证，立即发送订阅消息
    if (isAuthenticated) {
      const message = createSubscribeMessage([channel]);
      wsRef.current.send(message);
    }

    // 返回取消订阅函数
    return () => {
      unsubscribe(channelKey);
    };
  }, [isAuthenticated]);

  /**
   * 取消订阅
   * @param {string} channelKey 频道键
   */
  const unsubscribe = useCallback((channelKey) => {
    if (!wsRef.current) return;

    const subscription = subscriptionsRef.current.get(channelKey);
    if (!subscription) return;

    // 从订阅列表中移除
    subscriptionsRef.current.delete(channelKey);

    // 发送取消订阅消息（如果有 channelId）
    if (subscription.channelId && isAuthenticated) {
      const message = createUnsubscribeMessage([subscription.channelId]);
      wsRef.current.send(message);
    }
  }, [isAuthenticated]);

  /**
   * 监听订阅响应，保存 channelId
   */
  useEffect(() => {
    if (!wsRef.current) return;

    const handleSubscribeResponse = (data) => {
      if (data.event === WS_EVENTS.SUBSCRIBE_RESPONSE && data.data?.channels) {
        data.data.channels.forEach(ch => {
          const channelKey = JSON.stringify({
            type: ch.type,
            symbol: ch.symbol,
            params: ch.params
          });
          
          const subscription = subscriptionsRef.current.get(channelKey);
          if (subscription) {
            subscription.channelId = ch.channelId;
          }
        });
      }
    };

    wsRef.current.on(WS_EVENTS.SUBSCRIBE_RESPONSE, handleSubscribeResponse);

    return () => {
      if (wsRef.current) {
        wsRef.current.off(WS_EVENTS.SUBSCRIBE_RESPONSE, handleSubscribeResponse);
      }
    };
  }, []);

  /**
   * 发送消息
   * @param {Object} message 消息对象
   */
  const sendMessage = useCallback((message) => {
    if (!wsRef.current) {
      console.warn('[useMoziWebSocket] WebSocket 未初始化');
      return false;
    }
    return wsRef.current.send(message);
  }, []);

  /**
   * 手动连接
   */
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.connect();
    }
  }, []);

  /**
   * 手动断开
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  }, []);

  return {
    ws: wsRef.current,
    isConnected,
    isAuthenticated,
    subscribe,
    unsubscribe,
    sendMessage,
    connect,
    disconnect
  };
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

  // 检查 symbol 或 symbols（如果有）
  // 支持两种格式：
  // 1. symbol: "ALCX" (旧格式，单个币种)
  // 2. symbols: ["ALCX"] (新格式，多个币种)
  const dataSymbol = data.data?.symbol;
  
  if (channel.symbol && dataSymbol !== channel.symbol) {
    return false;
  }
  
  if (channel.symbols && channel.symbols.length > 0) {
    // 检查返回的数据币种是否在订阅的 symbols 列表中
    if (!dataSymbol || !channel.symbols.includes(dataSymbol)) {
      return false;
    }
  }

  // 检查其他参数（如果需要）
  // 注意：不要比较所有参数，因为订阅时的参数可能和返回数据的参数不完全一致
  // 例如：订阅时有 limit 参数，但返回数据时可能没有
  if (channel.params && channel.params.period) {
    // 对于 kline 类型，需要匹配 period 参数
    const dataPeriod = data.data?.period || data.data?.params?.period;
    if (dataPeriod && dataPeriod !== channel.params.period) {
      return false;
    }
  }

  return true;
}

export default useMoziWebSocket;

