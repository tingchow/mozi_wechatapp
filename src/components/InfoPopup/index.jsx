import { View, Text } from '@tarojs/components';
import './index.less';

/**
 * 信息弹窗组件
 * 用于显示带格式的提示信息
 */
export default function InfoPopup({ visible, title, items, onClose }) {
  if (!visible) return null;

  return (
    <View className='info-popup-overlay' onClick={onClose}>
      <View className='info-popup-container' onClick={(e) => e.stopPropagation()}>
        <View className='info-popup-content'>
          <View className='info-popup-title'>{title}</View>
          <View className='info-popup-list'>
            {items.map((item, index) => (
              <View key={index} className='info-popup-item'>
                <Text className='info-popup-label'>{item.label}</Text>
                <Text className='info-popup-text'>{item.text}</Text>
              </View>
            ))}
          </View>
          <View className='info-popup-button' onClick={onClose}>
            我知道了
          </View>
        </View>
      </View>
    </View>
  );
}

