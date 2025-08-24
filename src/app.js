
import Taro, { useLaunch } from '@tarojs/taro'
import { request } from './utils/request';
import { Interface } from './utils/constants';
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
  })

  // children 是将要会渲染的页面
  return children
}

export default App
