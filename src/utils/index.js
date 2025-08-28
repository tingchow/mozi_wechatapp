// 工具函数库

// 导出请求相关工具
export { default as request, get, post, put, del, getToken, setToken, clearToken } from './request'
export { Interface, INTERFACE_URL, COMMON_MSG, EMAIL, COINKEY } from './constants'
export { jump2Me } from './core'

/**
 * 格式化日期
 * @param {Date|string|number} date 日期
 * @param {string} format 格式 YYYY-MM-DD HH:mm:ss
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间间隔
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成唯一ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 判断是否为空
 * @param {any} value 要判断的值
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 格式化文件大小
 * @param {number} size 文件大小（字节）
 */
export const formatFileSize = (size) => {
  if (size === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 数组去重
 * @param {Array} arr 要去重的数组
 * @param {string} key 对象数组的去重键名
 */
export const unique = (arr, key) => {
  if (!Array.isArray(arr)) return []
  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const val = item[key]
      if (seen.has(val)) {
        return false
      }
      seen.add(val)
      return true
    })
  }
  return [...new Set(arr)]
}

/**
 * 随机数生成
 * @param {number} min 最小值
 * @param {number} max 最大值
 */
export const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param {number} num 数字
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return num
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化价格
 * @param {number} price 价格
 * @param {number} decimals 小数位数
 */
export const formatPrice = (price, decimals = 2) => {
  if (typeof price !== 'number') return '0.00'
  return price.toFixed(decimals)
}

/**
 * 格式化百分比
 * @param {number} value 数值
 * @param {number} decimals 小数位数
 */
export const formatPercent = (value, decimals = 2) => {
  if (typeof value !== 'number') return '0.00%'
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @param {string} url URL字符串
 */
export const getUrlParam = (name, url = window.location.href) => {
  const regex = new RegExp('[?&]' + name + '=([^&#]*)', 'i')
  const match = regex.exec(url)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * 存储数据到本地
 * @param {string} key 键名
 * @param {any} value 值
 */
export const setStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key,
      data: value,
      success: () => resolve(true),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 从本地获取数据
 * @param {string} key 键名
 */
export const getStorage = (key) => {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 删除本地存储数据
 * @param {string} key 键名
 */
export const removeStorage = (key) => {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key,
      success: () => resolve(true),
      fail: (err) => reject(err)
    })
  })
}
