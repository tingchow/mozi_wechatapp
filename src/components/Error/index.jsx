import { View, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { COMMON_MSG } from '../../utils/constants';
import IconFont from '../iconfont';
import './index.less';

export const Error = (props) => {
  
  // const reload = () => {
  //   Taro.startPullDownRefresh({
  //     complete: (res) => {
  //       console.log('res', res);
  //       Taro.stopPullDownRefresh();
  //     }
  //   });
  // };

  // if (props.isRefresh) {
  //   return (
  //     <View className='errorBox'>
  //       <IconFont name='info-circle-fill' color='#ff3333' size={200} />
  //       <View className='errorText'>{COMMON_MSG}</View>
  //       <Button className='errorBtn' onClick={reload}>刷新</Button>
  //     </View>
  //   )
  // }

  return (
    <View className='errorBox'>
      <IconFont name='info-circle-fill' color='#ff3333' size={200} />
      <View className='errorText'>{COMMON_MSG}</View>
      {/* <Button className='errorBtn' onClick={reload}>刷新</Button> */}
    </View>
  )
	
};