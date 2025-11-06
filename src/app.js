
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
    if (showAll == true) {
      Taro.showTabBar();
    } else {
      Taro.hideTabBar();
    }
    console.log('App launched.')
    console.log('🚀 全局 WebSocket 连接将在应用启动时建立')
  })

  // 使用 WebSocketProvider 包裹整个应用
  // children 是将要会渲染的页面
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  )
}

export default App
