/**
 * Mozi WebSocket 管理类
 * 完整实现 Mozi 加密货币行情 WebSocket 协议
 * 使用微信小程序原生 wx.connectSocket API
 */

import {
  WS_EVENTS,
  createHandshakeMessage,
  createPingMessage,
  parseMessage,
  PLATFORMS,
  CLOSE_CODES
} from './websocketProtocol';

export class MoziWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.socketTask = null;
    this.isManualClose = false;
    this.reconnectAttempt = 0;
    this.reconnectIntervals = [1000, 2000, 5000, 10000, 30000]; // 指数退避策略
    this.heartbeatTimer = null;
    this.heartbeatTimeout = null;
    this.missedPongCount = 0;
    this.sessionId = null;
    this.subscribedChannels = new Map(); // 存储已订阅的频道
    this.isConnected = false;
    
    // 配置选项
    this.options = {
      platform: PLATFORMS.WECHAT_MINIAPP,
      version: '1.0.0',
      autoHandshake: true,          // 自动握手
      heartbeatInterval: 30000,     // 30秒心跳间隔
      heartbeatTimeout: 90000,      // 90秒超时（3次未响应）
      maxReconnectAttempts: -1,     // -1 表示无限重连
      debug: true,                  // 调试模式
      ...options
    };
    
    // 事件回调
    this.eventHandlers = new Map();
    
    // 内置事件处理
    this.on(WS_EVENTS.WELCOME, this._handleWelcome.bind(this));
    this.on(WS_EVENTS.PONG, this._handlePong.bind(this));
    this.on(WS_EVENTS.ERROR, this._handleError.bind(this));
  }
  
  /**
   * 连接 WebSocket
   */
  async connect() {
    if (this.socketTask && this.isConnected) {
      this._log('WebSocket 已连接');
      return;
    }
    
    this.isManualClose = false;
    this._log(`正在连接: ${this.url}`);
    
    try {
      // 获取 token
      let token = '';
      try {
        token = await this._getToken();
        this._log('已获取 token');
      } catch (err) {
        this._log('获取 token 失败，使用空 token 连接');
      }
      
      // 使用微信小程序原生 WebSocket API
      // 通过 protocols 子协议传递 token
      const socketOptions = {
        url: this.url,
        tcpNoDelay: true,
        perMessageDeflate: true,
        timeout: 10000
      };
      
      // 如果有 token，通过 Sec-WebSocket-Protocol 子协议传递
      if (token) {
        socketOptions.protocols = [token];
        this._log('已设置 Sec-WebSocket-Protocol:', token.substring(0, 10) + '...');
      }
      
      this.socketTask = wx.connectSocket(socketOptions);
      
      // 检查返回值
      if (!this.socketTask) {
        this._error('connectSocket 返回值为空');
        this._scheduleReconnect();
        return;
      }
      
      this._log('✅ SocketTask 已创建');
      
      // 立即设置事件监听
      this._setupEventListeners();
    } catch (error) {
      this._error('连接创建失败:', error);
      this._scheduleReconnect();
    }
  }
  
  /**
   * 获取 token（从本地存储）
   */
  _getToken() {
    return new Promise((resolve, reject) => {
      try {
        wx.getStorage({
          key: 'token',
          success: (res) => {
            if (res && res.data) {
              resolve(res.data);
            } else {
              reject('token 为空');
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 断开连接
   */
  disconnect() {
    this.isManualClose = true;
    this._clearTimers();
    
    if (this.socketTask) {
      this.socketTask.close({
        code: CLOSE_CODES.NORMAL,
        reason: '正常关闭'
      });
      this.socketTask = null;
    }
    
    this.isConnected = false;
    this._log('已断开连接');
  }
  
  /**
   * 发送消息
   */
  send(data) {
    if (!this.socketTask || !this.isConnected) {
      this._error('WebSocket 未连接，无法发送消息');
      return false;
    }
    
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    this.socketTask.send({
      data: message,
      success: () => {
        this._log('发送消息:', data);
      },
      fail: (err) => {
        this._error('发送消息失败:', err);
      }
    });
    
    return true;
  }
  
  /**
   * 注册事件监听器
   */
  on(event, callback) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(callback);
  }
  
  /**
   * 移除事件监听器
   */
  off(event, callback) {
    if (!this.eventHandlers.has(event)) return;
    
    if (callback) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    if (!this.eventHandlers.has(event)) return;
    
    this.eventHandlers.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this._error(`事件处理错误 [${event}]:`, error);
      }
    });
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 设置事件监听
   */
  _setupEventListeners() {
    if (!this.socketTask) {
      this._error('SocketTask 不存在，无法设置事件监听');
      return;
    }
    
    try {
      // 连接打开
      this.socketTask.onOpen((res) => {
        this._handleOpen(res);
      });
      
      // 接收消息
      this.socketTask.onMessage((res) => {
        this._handleMessage(res);
      });
      
      // 连接错误
      this.socketTask.onError((err) => {
        this._handleWsError(err);
      });
      
      // 连接关闭
      this.socketTask.onClose((res) => {
        this._handleClose(res);
      });
      
      this._log('✅ WebSocket 事件监听已设置');
    } catch (error) {
      this._error('设置事件监听失败:', error);
      this._scheduleReconnect();
    }
  }
  
  /**
   * 处理连接打开
   */
  _handleOpen(event) {
    this._log('✅ WebSocket 连接成功');
    this.isConnected = true;
    this.reconnectAttempt = 0;
    this.emit('open', event);
    
    // 自动发送握手消息
    if (this.options.autoHandshake) {
      setTimeout(() => {
        this._sendHandshake();
      }, 100);
    }
  }
  
  /**
   * 处理接收消息
   */
  _handleMessage(event) {
    const data = parseMessage(event.data);
    if (!data) {
      this._error('消息解析失败:', event.data);
      return;
    }
    
    this._log('📨 收到消息:', data);
    
    // 触发对应事件
    if (data.event) {
      this.emit(data.event, data);
    }
    
    // 触发通用消息事件
    this.emit('message', data);
  }
  
  /**
   * 处理 WebSocket 错误
   */
  _handleWsError(event) {
    this._error('⚠️ WebSocket 错误:', event);
    this.emit('ws_error', event);
  }
  
  /**
   * 处理连接关闭
   */
  _handleClose(event) {
    this._log(`❌ WebSocket 连接关闭 (code: ${event.code}, reason: ${event.reason})`);
    
    this.isConnected = false;
    this._clearTimers();
    this.sessionId = null;
    this.emit('close', event);
    
    // 根据关闭码决定是否重连
    const shouldReconnect = this._shouldReconnect(event.code);
    
    if (!this.isManualClose && shouldReconnect) {
      this._scheduleReconnect();
    }
  }
  
  /**
   * 发送握手消息
   */
  _sendHandshake() {
    const handshake = createHandshakeMessage(
      this.options.platform,
      this.options.version
    );
    
    this.send(handshake);
    this._log('🤝 发送握手消息');
  }
  
  /**
   * 处理握手响应
   */
  _handleWelcome(data) {
    this._log('🤝 握手成功:', data);
    
    if (data.data && data.data.sessionId) {
      this.sessionId = data.data.sessionId;
    }
    
    // 启动心跳
    this._startHeartbeat();
    
    // 触发认证成功事件
    this.emit('authenticated', data);
  }
  
  /**
   * 启动心跳
   */
  _startHeartbeat() {
    this._clearTimers();
    
    // 定时发送 ping
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        const ping = createPingMessage();
        this.send(ping);
        this._log('💓 发送心跳');
        
        // 设置超时检测
        this.heartbeatTimeout = setTimeout(() => {
          this.missedPongCount++;
          this._log(`⚠️ 心跳超时 (${this.missedPongCount}/3)`);
          
          if (this.missedPongCount >= 3) {
            this._error('💔 连续3次心跳超时，主动断开连接');
            if (this.socketTask) {
              this.socketTask.close({
                code: CLOSE_CODES.HEARTBEAT_TIMEOUT,
                reason: '心跳超时'
              });
            }
          }
        }, this.options.heartbeatTimeout / 3);
      }
    }, this.options.heartbeatInterval);
  }
  
  /**
   * 处理心跳响应
   */
  _handlePong(data) {
    this._log('💓 收到心跳响应');
    
    // 清除超时检测
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    this.missedPongCount = 0;
  }
  
  /**
   * 处理错误消息
   */
  _handleError(data) {
    this._error('服务器错误:', data);
    this.emit('server_error', data);
  }
  
  /**
   * 清除定时器
   */
  _clearTimers() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }
  
  /**
   * 判断是否应该重连
   */
  _shouldReconnect(closeCode) {
    const noReconnectCodes = [
      CLOSE_CODES.NORMAL,
      CLOSE_CODES.PROTOCOL_ERROR,
      CLOSE_CODES.UNSUPPORTED_DATA,
      CLOSE_CODES.POLICY_VIOLATION
    ];
    
    return !noReconnectCodes.includes(closeCode);
  }
  
  /**
   * 安排重连
   */
  _scheduleReconnect() {
    if (this.options.maxReconnectAttempts !== -1 && 
        this.reconnectAttempt >= this.options.maxReconnectAttempts) {
      this._error('已达到最大重连次数');
      this.emit('reconnect_failed');
      return;
    }
    
    // 使用指数退避策略
    const intervalIndex = Math.min(
      this.reconnectAttempt,
      this.reconnectIntervals.length - 1
    );
    const interval = this.reconnectIntervals[intervalIndex];
    
    this._log(`🔄 ${interval}ms 后尝试重连 (第 ${this.reconnectAttempt + 1} 次)`);
    
    setTimeout(async () => {
      this.reconnectAttempt++;
      await this.connect();
    }, interval);
  }
  
  /**
   * 日志输出
   */
  _log(...args) {
    if (this.options.debug) {
      console.log('[MoziWebSocket]', ...args);
    }
  }
  
  /**
   * 错误输出
   */
  _error(...args) {
    console.error('[MoziWebSocket]', ...args);
  }
}

export default MoziWebSocket;

