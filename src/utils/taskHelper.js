/**
 * 任务完成工具函数
 * 用于在用户完成相应操作后自动上报任务完成
 */

import { request } from './request'
import { Interface } from './constants'

/**
 * 自动上报任务完成（与原项目对齐）
 * @param {string} taskCode - 任务代码
 * @param {object} options - 可选配置
 * @param {boolean} options.silent - 是否静默上报（默认true，失败不提示）
 * @param {function} options.onSuccess - 成功回调
 * @param {function} options.onError - 失败回调
 */
export const reportTaskComplete = async (taskCode, options = {}) => {
  const { silent = true, onSuccess, onError } = options
  
  try {
    console.log(`🔍 [任务上报] 开始上报任务: ${taskCode}`)
    
    const res = await request({
      url: Interface.TASK_COMPLETE,
      method: 'POST',
      data: { taskCode }
    })
    
    console.log(`✅ [任务上报] ${taskCode} 上报成功`, res)
    
    if (onSuccess) {
      onSuccess(res)
    }
    
    return res
  } catch (error) {
    console.error(`❌ [任务上报] ${taskCode} 上报失败:`, error)
    
    if (onError) {
      onError(error)
    }
    
    // 静默模式下不抛出错误
    if (!silent) {
      throw error
    }
    
    return null
  }
}

/**
 * 任务代码常量
 */
export const TASK_CODES = {
  DAILY_LOGIN: 'DAILY_LOGIN',      // 每日登录
  DAILY_LIKE: 'DAILY_LIKE',        // 每日点赞
  POST: 'POST',                    // 发帖
  REPLY: 'REPLY',                  // 回复
  REGISTER: 'REGISTER',            // 首次登录
  WECHAT: 'WECHAT',                // 关注公众号
  COMMUNITY: 'COMMUNITY',          // 加入社群
  EARLY_BIRD: 'EARLY_BIRD',        // 早鸟活动
  ALARM: 'ALARM',                  // 设置报警
  VIDEO: 'VIDEO',                  // 视频学习
}

/**
 * 每日登录任务上报
 */
export const reportDailyLogin = () => {
  return reportTaskComplete(TASK_CODES.DAILY_LOGIN)
}

/**
 * 每日点赞任务上报
 */
export const reportDailyLike = () => {
  return reportTaskComplete(TASK_CODES.DAILY_LIKE)
}

/**
 * 发帖任务上报
 */
export const reportPost = () => {
  return reportTaskComplete(TASK_CODES.POST)
}

/**
 * 回复任务上报
 */
export const reportReply = () => {
  return reportTaskComplete(TASK_CODES.REPLY)
}

/**
 * 设置报警任务上报
 */
export const reportAlarm = () => {
  return reportTaskComplete(TASK_CODES.ALARM)
}

/**
 * 视频学习任务上报
 */
export const reportVideo = () => {
  return reportTaskComplete(TASK_CODES.VIDEO)
}
