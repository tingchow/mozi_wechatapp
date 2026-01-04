
import Taro, { useLaunch } from '@tarojs/taro'
import { request } from './utils/request';
import { Interface } from './utils/constants';
import { WebSocketProvider } from './context/WebSocketContext';
import './app.less'

function App({ children }) {

  const isShowAll = async () => {
    const res = await request({
      url: Interface.SHOW_ALL,
    });
    return res?.data;
  };

  useLaunch(async () => {
    const showAll = await isShowAll();
    console.log('showAll', showAll);
    
    // 保存状态到本地存储
    Taro.setStorageSync('showAllStatus', showAll);
    
    if (showAll == true) {
      Taro.showTabBar();
    } else {
      Taro.hideTabBar();
      // 如果返回 false，延迟跳转到宠物猫页面
      setTimeout(() => {
        Taro.reLaunch({
          url: '/packages/petcat/index'
        });
      }, 100);
    }
    console.log('App launched.')
    console.log('🚀 全局 WebSocket 连接将在应用启动时建立')
    
    // 处理邀请码逻辑
    handleInviteCode()
  })
  
  // 处理邀请码
  const handleInviteCode = () => {
    try {
      // 获取启动参数
      const launchOptions = Taro.getLaunchOptionsSync()
      console.log('🔍 [邀请码] 启动参数:', launchOptions)
      
      // 从 query 中获取邀请码
      const inviteCode = launchOptions?.query?.inviteCode
      
      if (inviteCode) {
        console.log('✅ [邀请码] 检测到邀请码:', inviteCode)
        
        // 保存邀请码到本地存储
        Taro.setStorageSync('pendingInviteCode', inviteCode)
        
        // 检查用户是否已登录
        const token = Taro.getStorageSync('token')
        
        if (!token) {
          console.log('⚠️ [邀请码] 用户未登录，需要先登录')
          
          // 延迟一下，等待页面加载完成
          setTimeout(() => {
            Taro.showModal({
              title: '邀请提示',
              content: '您收到了好友的邀请，请先登录以完成邀请绑定',
              confirmText: '去登录',
              cancelText: '稍后',
              success: (res) => {
                if (res.confirm) {
                  // 跳转到登录页面（我的页面）
                  Taro.switchTab({
                    url: '/pages/me/index'
                  })
                }
              }
            })
          }, 1000)
        } else {
          console.log('✅ [邀请码] 用户已登录，可以绑定邀请关系')
          // TODO: 调用后端接口绑定邀请关系
          bindInviteCode(inviteCode)
        }
      } else {
        console.log('ℹ️ [邀请码] 未检测到邀请码')
      }
    } catch (error) {
      console.error('❌ [邀请码] 处理邀请码失败:', error)
    }
  }
  
  // 绑定邀请码
  const bindInviteCode = async (inviteCode) => {
    try {
      console.log('🔗 [邀请码] 开始绑定邀请关系:', inviteCode)
      
      // TODO: 调用后端接口绑定邀请关系
      // const res = await request({
      //   url: Interface.BIND_INVITE_CODE,
      //   method: 'POST',
      //   data: { inviteCode }
      // })
      
      // if (res?.code === 0) {
      //   console.log('✅ [邀请码] 邀请关系绑定成功')
      //   Taro.removeStorageSync('pendingInviteCode')
      //   Taro.showToast({
      //     title: '邀请绑定成功',
      //     icon: 'success'
      //   })
      // }
      
      // 暂时只清除待处理的邀请码
      Taro.removeStorageSync('pendingInviteCode')
      console.log('✅ [邀请码] 邀请码已保存，等待后端接口对接')
    } catch (error) {
      console.error('❌ [邀请码] 绑定邀请关系失败:', error)
    }
  }

  // 使用 WebSocketProvider 包裹整个应用
  // children 是将要会渲染的页面
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  )
}

export default App
