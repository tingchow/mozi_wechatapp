import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLoad } from '@tarojs/taro'
import './index.less'

export default function PointsPage() {
  useLoad(() => {
    // 页面初始化逻辑（预留）
  })

  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='points-container'>
      <View className='points-header'>
        <Text className='points-title'>我的积分</Text>
      </View>
      <View className='points-content'>
        <Text className='points-desc'>功能建设中，敬请期待</Text>
      </View>
      {/* <View className='points-footer'>
        <Button className='back-btn' onClick={goBack}>返回</Button>
      </View> */}
    </View>
  )
}


