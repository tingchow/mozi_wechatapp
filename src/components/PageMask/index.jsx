import { View } from '@tarojs/components';
import './index.less';

/**
 * 页面遮罩层组件
 * @param {boolean} visible - 是否显示遮罩层
 * @param {string} message - 遮罩层显示的消息（可选）
 */
export default function PageMask({ visible = false, message = '' }) {
  if (!visible) return null;

  return (
    <View className='page-mask' catchMove>
      {message && (
        <View className='page-mask-message'>
          {message}
        </View>
      )}
    </View>
  );
}
