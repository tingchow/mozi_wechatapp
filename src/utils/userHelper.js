import Taro from '@tarojs/taro'
import { request } from './request'
import { Interface } from './constants'

const OPENID_STORAGE_KEYS = ['openid', 'openId']

/**
 * 从登录/用户接口返回里解析 openId（兼容多种字段）
 */
export const pickOpenIdFromPayload = (data) => {
  if (!data || typeof data !== 'object') return null
  const candidates = [
    data.openId,
    data.openid,
    data.wxOpenId,
    data.wechatOpenId,
    data.userInfo?.openId,
    data.userInfo?.openid,
  ]
  for (const value of candidates) {
    if (value != null && String(value).trim()) {
      return String(value).trim()
    }
  }
  return null
}

/**
 * 保存登录返回的 openId（同时写 openid / openId，兼容历史缓存）
 */
export const saveOpenIdFromLogin = (loginData) => {
  const openId = pickOpenIdFromPayload(loginData)
  if (!openId) return null
  try {
    OPENID_STORAGE_KEYS.forEach((key) => {
      Taro.setStorageSync(key, openId)
    })
  } catch (error) {
    console.error('❌ [用户数据] 保存 openId 失败:', error)
  }
  return openId
}

/**
 * 读取本地已保存的 openId（兼容 openid / openId）
 */
export const getSavedOpenId = () => {
  try {
    for (const key of OPENID_STORAGE_KEYS) {
      const openId = Taro.getStorageSync(key)
      if (openId != null && String(openId).trim()) {
        return String(openId).trim()
      }
    }
    const userData = Taro.getStorageSync('userData')
    const fromUserData = pickOpenIdFromPayload(userData)
    if (fromUserData) return fromUserData
    return null
  } catch (error) {
    console.error('❌ [用户数据] 读取 openId 失败:', error)
    return null
  }
}

/**
 * 获取并保存用户详细数据（包括邀请码）
 * 在用户登录成功后调用
 */
export const fetchAndSaveUserData = async () => {
  try {
    console.log('🔍 [用户数据] 开始获取用户详细数据...')
    
    const res = await request({
      url: Interface.USER_DATA_INFO,
      method: 'GET'
    })
    
    console.log('🔍 [用户数据] 接口返回:', res)
    
    if (res?.code === 0 && res?.data) {
      const data = res.data
      
      // 提取邀请码（兼容多种字段名）
      const inviteCode = data.inviteCode || data.invitationCode || ''
      
      // 提取用户信息
      const userData = {
        inviteCode,
        avatar: data.avatar || null,
        nickname: data.nickName || data.nickname || null,
        userId: data.userId || data.id || null,
        // 可以添加其他需要的字段
      }

      const openId = pickOpenIdFromPayload(data) || getSavedOpenId()
      if (openId) {
        userData.openId = openId
        OPENID_STORAGE_KEYS.forEach((key) => {
          Taro.setStorageSync(key, openId)
        })
      }
      
      console.log('✅ [用户数据] 提取的数据:', userData)
      
      // 保存到本地存储
      Taro.setStorageSync('userData', userData)
      
      // 同时保存邀请码到 pointsData（兼容旧代码）
      const pointsData = Taro.getStorageSync('pointsData') || {}
      Taro.setStorageSync('pointsData', {
        ...pointsData,
        inviteCode
      })
      
      console.log('✅ [用户数据] 数据已保存到本地存储')
      
      return userData
    } else {
      console.log('⚠️ [用户数据] 接口返回非成功状态:', res)
      return null
    }
  } catch (error) {
    console.error('❌ [用户数据] 获取用户数据失败:', error)
    return null
  }
}

/**
 * 从本地存储获取用户数据
 */
export const getUserData = () => {
  try {
    const userData = Taro.getStorageSync('userData')
    return userData || null
  } catch (error) {
    console.error('❌ [用户数据] 读取本地存储失败:', error)
    return null
  }
}

/**
 * 获取邀请码（优先从本地存储读取）
 */
export const getInviteCode = () => {
  try {
    // 优先从 userData 读取
    const userData = Taro.getStorageSync('userData')
    if (userData?.inviteCode) {
      return userData.inviteCode
    }
    
    // 兼容旧数据：从 pointsData 读取
    const pointsData = Taro.getStorageSync('pointsData')
    if (pointsData?.inviteCode) {
      return pointsData.inviteCode
    }
    
    return null
  } catch (error) {
    console.error('❌ [用户数据] 读取邀请码失败:', error)
    return null
  }
}

/**
 * 清除用户数据（退出登录时调用）
 */
export const clearUserData = () => {
  try {
    Taro.removeStorageSync('userData')
    OPENID_STORAGE_KEYS.forEach((key) => {
      Taro.removeStorageSync(key)
    })
    console.log('✅ [用户数据] 用户数据已清除')
  } catch (error) {
    console.error('❌ [用户数据] 清除用户数据失败:', error)
  }
}
