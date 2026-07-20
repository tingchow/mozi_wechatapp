import { View, Text, Image } from '@tarojs/components'
import './index.less'

const WECHAT_ACCOUNT_QRCODE =
  'https://image-1317406749.cos.ap-shanghai.myqcloud.com/wechat_account.jpg'

export default function WechatQrcodePage() {
  return (
    <View className='wechat-qrcode-page'>
      <View className='wechat-qrcode-banner'>
        <Text className='wechat-qrcode-title'>关注公众号接收告警</Text>
        <Text className='wechat-qrcode-subtitle'>开启微信通知，及时获取价格预警</Text>
      </View>

      <View className='wechat-qrcode-card'>
        <View className='wechat-qrcode-hint'>
          <Text className='wechat-qrcode-hint-text'>长按识别二维码添加</Text>
        </View>

        <View className='wechat-qrcode-image-wrap'>
          <Image
            className='wechat-qrcode-image'
            mode='aspectFit'
            lazyLoad
            showMenuByLongpress
            src={WECHAT_ACCOUNT_QRCODE}
          />
        </View>

        <Text className='wechat-qrcode-tip'>关注后即可通过微信接收告警通知</Text>
      </View>
    </View>
  )
}
