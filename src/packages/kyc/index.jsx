import { View, Text, Image, Input, Button, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import './index.less'

export default function KycPage() {
  const [formData, setFormData] = useState({
    realName: '',
    idNumber: '',
    country: '',
    phone: '',
    email: ''
  })
  const [idCardFront, setIdCardFront] = useState('')
  const [idCardBack, setIdCardBack] = useState('')
  const [countries] = useState(['中国', '美国', '日本', '韩国', '新加坡', '其他'])
  const [countryIndex, setCountryIndex] = useState(0)

  useLoad(() => {
    console.log('KYC认证页面加载')
  })

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleCountryChange = (e) => {
    const index = e.detail.value
    setCountryIndex(index)
    setFormData({
      ...formData,
      country: countries[index]
    })
  }

  const chooseImage = (type) => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        if (type === 'front') {
          setIdCardFront(tempFilePath)
        } else {
          setIdCardBack(tempFilePath)
        }
      }
    })
  }

  const handleSubmit = () => {
    // 验证表单
    if (!formData.realName) {
      Taro.showToast({ title: '请输入真实姓名', icon: 'none' })
      return
    }
    if (!formData.idNumber) {
      Taro.showToast({ title: '请输入证件号码', icon: 'none' })
      return
    }
    if (!formData.country) {
      Taro.showToast({ title: '请选择国家/地区', icon: 'none' })
      return
    }
    if (!formData.phone) {
      Taro.showToast({ title: '请输入手机号码', icon: 'none' })
      return
    }
    if (!formData.email) {
      Taro.showToast({ title: '请输入邮箱地址', icon: 'none' })
      return
    }
    if (!idCardFront || !idCardBack) {
      Taro.showToast({ title: '请上传证件照片', icon: 'none' })
      return
    }

    // 提交认证
    Taro.showLoading({ title: '提交中...' })
    
    // 模拟API调用
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showModal({
        title: '提交成功',
        content: '您的认证申请已提交，我们将在1-3个工作日内完成审核。',
        showCancel: false,
        success: () => {
          Taro.navigateBack()
        }
      })
    }, 2000)
  }

  return (
    <View className='kyc-container'>
      <View className='kyc-header'>
        <Text className='kyc-title'>实名认证</Text>
        <Text className='kyc-subtitle'>完成认证后可享受更多权益</Text>
      </View>

      <View className='kyc-benefits'>
        <View className='benefit-item'>
          <View className='benefit-icon'>✓</View>
          <Text className='benefit-text'>提升账户安全性</Text>
        </View>
        <View className='benefit-item'>
          <View className='benefit-icon'>✓</View>
          <Text className='benefit-text'>解锁高级功能</Text>
        </View>
        <View className='benefit-item'>
          <View className='benefit-icon'>✓</View>
          <Text className='benefit-text'>获得额外积分奖励</Text>
        </View>
      </View>

      <View className='form-section'>
        <Text className='section-title'>基本信息</Text>
        
        <View className='form-item'>
          <Text className='form-label'>真实姓名</Text>
          <Input
            className='form-input'
            placeholder='请输入您的真实姓名'
            value={formData.realName}
            onInput={(e) => handleInputChange('realName', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>证件号码</Text>
          <Input
            className='form-input'
            placeholder='请输入身份证/护照号码'
            value={formData.idNumber}
            onInput={(e) => handleInputChange('idNumber', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>国家/地区</Text>
          <Picker
            mode='selector'
            range={countries}
            value={countryIndex}
            onChange={handleCountryChange}
          >
            <View className='form-picker'>
              <Text className={formData.country ? 'picker-value' : 'picker-placeholder'}>
                {formData.country || '请选择国家/地区'}
              </Text>
              <Text className='picker-arrow'>›</Text>
            </View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='form-label'>手机号码</Text>
          <Input
            className='form-input'
            type='number'
            placeholder='请输入手机号码'
            value={formData.phone}
            onInput={(e) => handleInputChange('phone', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>邮箱地址</Text>
          <Input
            className='form-input'
            type='text'
            placeholder='请输入邮箱地址'
            value={formData.email}
            onInput={(e) => handleInputChange('email', e.detail.value)}
          />
        </View>
      </View>

      <View className='upload-section'>
        <Text className='section-title'>证件照片</Text>
        <Text className='section-desc'>请上传清晰的证件照片，确保信息完整可见</Text>

        <View className='upload-grid'>
          <View className='upload-item' onClick={() => chooseImage('front')}>
            {idCardFront ? (
              <Image src={idCardFront} className='upload-preview' mode='aspectFill' />
            ) : (
              <View className='upload-placeholder'>
                <Text className='upload-icon'>+</Text>
                <Text className='upload-text'>上传证件正面</Text>
              </View>
            )}
          </View>

          <View className='upload-item' onClick={() => chooseImage('back')}>
            {idCardBack ? (
              <Image src={idCardBack} className='upload-preview' mode='aspectFill' />
            ) : (
              <View className='upload-placeholder'>
                <Text className='upload-icon'>+</Text>
                <Text className='upload-text'>上传证件反面</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className='tips-section'>
        <Text className='tips-title'>温馨提示</Text>
        <Text className='tips-text'>• 请确保上传的证件照片清晰完整</Text>
        <Text className='tips-text'>• 您的个人信息将被严格保密</Text>
        <Text className='tips-text'>• 审核通过后将获得 +200 积分奖励</Text>
      </View>

      <View className='submit-section'>
        <Button className='submit-btn' onClick={handleSubmit}>
          提交认证
        </Button>
      </View>
    </View>
  )
}

