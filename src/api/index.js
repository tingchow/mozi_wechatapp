// API 接口封装
import { get, post, put, del } from '@/utils/request'
import { Interface } from '@/utils/constants'

// 首页相关接口
export const homeApi = {
  // 热门币种
  getHotCoin: (params) => get(Interface.hot_coin, params),
  
  // 热门版块
  getHotIndustry: (params) => get(Interface.hot_industry, params),
  
  // 热门合约
  getHotContract: (params) => get(Interface.hot_contract, params),
}

// 发现页相关接口
export const discoveryApi = {
  // 行情
  getCoinList: (params) => get(Interface.find_coin, params),
  
  // 热门交易所
  getHotExchange: (params) => get(Interface.hot_exchange, params),
  
  // 涨幅榜
  getPriceChange: (params) => get(Interface.price_change, params),
  
  // 波幅榜
  getPriceWave: (params) => get(Interface.price_wave, params),
  
  // 成交额榜
  getCoinTrade: (params) => get(Interface.coin_trade, params),
  
  // 跌幅榜
  getPriceDownChange: (params) => get(Interface.PRICE_DOWNCHANGE, params),
  
  // 飙升榜
  getPriceUpTrade: (params) => get(Interface.PRICE_UPTRADE, params),
  
  // 新币榜
  getNewCoin: (params) => get(Interface.NEW_COIN, params),
  
  // 自选
  getSelfCoin: (params) => get(Interface.COIN_SELF, params),
}

// 详情页相关接口
export const detailApi = {
  // 币种信息
  getCoinInfo: (params) => get(Interface.coin_info, params),
  
  // 币种走势
  getCoinLine: (params) => get(Interface.coin_line, params),
  
  // 市场信息
  getCoinMarket: (params) => get(Interface.COIN_MARKET, params),
  
  // AI建议
  getAiCoin: (params) => get(Interface.AI_COIN, params),
}

// 搜索相关接口
export const searchApi = {
  // 币种是否有效
  checkCoin: (params) => get(Interface.IS_COIN, params),
  
  // 币种信息
  getCoinInfo: (params) => get(Interface.COIN_INFO, params),
  
  // 模块信息
  getCoinArea: (params) => get(Interface.COIN_AREA, params),
  
  // 可交易平台
  getCoinPlatform: (params) => get(Interface.COIN_PLATFORM, params),
  
  // 交易对
  getCoinSpot: (params) => get(Interface.COIN_SPOT, params),
}

// 用户相关接口
export const userApi = {
  // 登录
  login: (data) => post(Interface.MOZI_LOGIN, data),
  
  // 获取用户信息
  getUserInfo: (params) => get(Interface.MOZI_USER, params),
  
  // 保存用户信息
  saveUserInfo: (data) => post(Interface.MOZI_USER, data),
  
  // 评分反馈
  submitComment: (data) => post(Interface.MOZI_COMMENT, data),
}

// 自选相关接口
export const favoriteApi = {
  // 添加自选
  addFavorite: (data) => post(Interface.ADD_OWN, data),
  
  // 删除自选
  removeFavorite: (data) => post(Interface.CANCEL_OWN, data),
}

// 衍生品相关接口
export const derivativesApi = {
  // 多空比（当前）
  getPcrCur: (params) => get(Interface.PCR_CUR, params),
  
  // 多空比（历史）
  getPcrHis: (params) => get(Interface.PCR_HIS, params),
  
  // 持仓量（当前）
  getPsCur: (params) => get(Interface.PS_CUR, params),
  
  // 持仓量（历史）
  getPsHis: (params) => get(Interface.PS_HIS, params),
  
  // 成交额（当前）
  getTraCur: (params) => get(Interface.TRA_CUR, params),
  
  // 成交额（历史）
  getTraHis: (params) => get(Interface.TRA_HIS, params),
  
  // 资金费率（当前）
  getFrCur: (params) => get(Interface.FR_CUR, params),
  
  // 资金费率（历史）
  getFrHis: (params) => get(Interface.FR_HIS, params),
  
  // 全部币种
  getAllCoin: (params) => get(Interface.ALL_COIN, params),
  
  // 全部交易所
  getAllCex: (params) => get(Interface.ALL_CEX, params),
}

// 告警相关接口
export const alarmApi = {
  // 添加告警
  addAlarm: (data) => post(Interface.ADD_WARN, data),
  
  // 获取我的告警
  getMyAlarm: (params) => get(Interface.MY_WARN, params),
  
  // 打开告警
  openAlarm: (data) => post(Interface.OPEN_WARN, data),
  
  // 关闭告警
  closeAlarm: (data) => post(Interface.CLOSE_WARN, data),
}

// 社区相关接口
export const communityApi = {
  // 获取帖子列表
  getPosts: (params) => get(Interface.POSTS_API, params),
  
  // 获取帖子详情
  getPostDetail: (id) => get(Interface.POST_DETAIL_API.replace('{id}', id)),
  
  // 获取评论列表
  getComments: (postId, params) => get(Interface.COMMENTS_API.replace('{postId}', postId), params),
  
  // 获取热榜话题
  getHotTopics: (params) => get(Interface.HOT_TOPICS_API, params),
  
  // 话题搜索
  searchTopic: (params) => get(Interface.TOPIC_SEARCH, params),
  
  // 发帖
  createPost: (data) => post(Interface.POST_NEW, data),
  
  // 点赞
  likePost: (data) => post(Interface.POSTS_LIKE, data),
  
  // 点踩
  unlikePost: (data) => post(Interface.POSTS_UNLIKE, data),
  
  // 创建评论
  createComment: (data) => post(Interface.COMMENTS_NEW, data),
  
  // 更新帖子
  updatePost: (data) => put(Interface.POSTS_UPDATE, data),
  
  // 删除帖子
  deletePost: (data) => del(Interface.POSTS_DELETE, data),
  
  // 创建话题
  createTopic: (data) => post(Interface.CREATE_TOPIC, data),
  
  // 获取话题相关帖子
  getTopicPosts: (params) => get(Interface.TOPIC_POSTS, params),
  
  // 创建投票
  createVote: (data) => post(Interface.CREATE_VOTE, data),
}

// 系统配置相关接口
export const systemApi = {
  // 获取显示状态
  getShowAll: (params) => get(Interface.SHOW_ALL, params),
}

// 导出所有API
export default {
  homeApi,
  discoveryApi,
  detailApi,
  searchApi,
  userApi,
  favoriteApi,
  derivativesApi,
  alarmApi,
  communityApi,
  systemApi,
}
