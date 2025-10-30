import { View } from '@tarojs/components';
import './index.less';

/**
 * AI 思考动画组件
 * 显示三个跳动的圆点
 */
const ThinkingAnimation = () => {
  return (
    <View className='thinking-animation'>
      <View className='dot dot1' />
      <View className='dot dot2' />
      <View className='dot dot3' />
    </View>
  );
};

export default ThinkingAnimation;

