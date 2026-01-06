
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
    // 立即隐藏 TabBar（在接口调用前）
    try {
      Taro.hideTabBar({ animation: false });
    } catch (e) {
      // 忽略错误
    }
    
    // 标记接口正在加载，禁用 tabBar 切换
    Taro.setStorageSync('isShowAllLoading', true);
    
    try {
      const showAll = await isShowAll();
      
      // 保存状态到本地存储
      Taro.setStorageSync('showAllStatus', showAll);
      
      if (showAll === true) {
        Taro.showTabBar({ animation: true });
      } else {
        // 保持隐藏状态
        Taro.hideTabBar({ animation: false });
      }
    } catch (error) {
      // 失败时默认显示 tabBar（容错处理）
      Taro.setStorageSync('showAllStatus', true);
      Taro.showTabBar({ animation: true });
    } finally {
      // 标记接口加载完成，允许 tabBar 切换
      Taro.setStorageSync('isShowAllLoading', false);
    }
    
    // 处理邀请码逻辑
    handleInviteCode()
  })
  
  // 处理邀请码
  const handleInviteCode = () => {
    try {
      // 获取启动参数
      const launchOptions = Taro.getLaunchOptionsSync()
      
      // 从 query 中获取邀请码
      const inviteCode = launchOptions?.query?.inviteCode
      
      if (inviteCode) {
        // 保存邀请码到本地存储
        Taro.setStorageSync('pendingInviteCode', inviteCode)
        
        // 检查用户是否已登录
        const token = Taro.getStorageSync('token')
        
        if (!token) {
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
          // TODO: 调用后端接口绑定邀请关系
          bindInviteCode(inviteCode)
        }
      }
    } catch (error) {
      // 忽略错误
    }
  }
  
  // 绑定邀请码
  const bindInviteCode = async (inviteCode) => {
    try {
      // TODO: 调用后端接口绑定邀请关系
      // const res = await request({
      //   url: Interface.BIND_INVITE_CODE,
      //   method: 'POST',
      //   data: { inviteCode }
      // })
      
      // if (res?.code === 0) {
      //   Taro.removeStorageSync('pendingInviteCode')
      //   Taro.showToast({
      //     title: '邀请绑定成功',
      //     icon: 'success'
      //   })
      // }
      
      // 暂时只清除待处理的邀请码
      Taro.removeStorageSync('pendingInviteCode')
    } catch (error) {
      // 忽略错误
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
