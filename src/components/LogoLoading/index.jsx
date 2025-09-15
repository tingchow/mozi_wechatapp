import { View, Image } from '@tarojs/components';
import './index.less';

// 基于品牌图片的 Loading 组件
// 使用示例：
// <LogoLoading visible fullscreen image={url} text='加载中...' />
export const LogoLoading = ({
  visible = true,
  fullscreen = false,
  mask = true,
  text = '',
  image = '',
  size = 60,
}) => {
  if (!visible) return null;

  return (
    <View className={`logo-loading-overlay ${fullscreen ? 'fullscreen' : ''} ${mask ? 'mask' : ''}`}>
      <View className='logo-loading-content'>
        <Image className='logo-loading-img' style={{ width: `${size}px`, height: `${size}px` }} mode='aspectFit' src={image} />
        {Boolean(text) && <View className='logo-loading-text'>{text}</View>}
      </View>
    </View>
  );
};


