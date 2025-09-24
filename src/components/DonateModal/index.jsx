import { View, Image, Text } from '@tarojs/components';
import './index.less';

export const DonateModal = ({ visible = false, onClose, image, text = '如果觉得好用，欢迎打赏支持' }) => {
  if (!visible) return null;
  const handleMask = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };
  return (
    <View className='donate-mask' onClick={handleMask}>
      <View className='donate-card'>
        <Image className='donate-qrcode' mode='aspectFit' src={image} showMenuByLongpress />
        <Text className='donate-text'>{text}</Text>
      </View>
    </View>
  );
};


