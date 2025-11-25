// 通用兜底提示语
export const COMMON_MSG = '网络繁忙，请稍后再试';

export const INTERFACE_URL = 'https://moziinnovations.com';

// WebSocket 服务器地址
export const WS_URL = 'wss://moziinnovations.com/ws';

// 接口内容
export const Interface = {
  // 首页
  // 热门币种
  hot_coin: '/showhot/coinprice',
  // 热门版块
  hot_industry: '/showhot/sections',
  // 热门合约
  hot_contract: '/showhot/contractprice',
  

  // 发现
  // 行情
  find_coin: '/discovery/coin',
  // 热门交易所
  hot_exchange: '/discovery/exchangerank',
  // 涨幅
  price_change: '/discovery/pricechangerank',
  // 波幅榜
  price_wave: '/discovery/pricewaverank',
  // 成交额榜
  coin_trade: '/discovery/traderank',
  // 跌幅榜
  PRICE_DOWNCHANGE: '/discovery/pricechangerankasc',
  // 飙升榜
  PRICE_UPTRADE: '/discovery/trademoverank',
  // 新币榜
  NEW_COIN: '/discovery/newsymbolrank',
  // 自选
  COIN_SELF: '/selfselect/all',


  // 详情页
  // 币种信息
  coin_info: '/detail/header',
  // 币种走势
  coin_line: '/detail/kline',
  // 市场
  COIN_MARKET: '/detail/exchangeprice',
  // AI建议
  AI_COIN: '/detail/kline/ai',

  // 搜索页
  // 币种是否有效
  IS_COIN: '/search/iscoin',
  // 币种
  COIN_INFO: '/search/lastpricechange',
  // 模块
  COIN_AREA: '/search/coinsection',
  // 可交易平台
  COIN_PLATFORM: '/search/symbolfees',
  // 交易对
  COIN_SPOT: '/search/symbolprice',

  // 我的
  // 登录
  MOZI_LOGIN: '/user/login',
  // 用户信息保存
  MOZI_USER: '/user/info',
  // 评分
  MOZI_COMMENT: '/feedback/add',
  // 分享上报
  SHARE_REPORT: '/share/report',
  
  // 积分系统
  // 首次登录积分奖励
  POINTS_FIRST_LOGIN: '/points/tasks/first-login',
  // 早鸟活动积分奖励
  POINTS_EARLY_BIRD: '/points/tasks/early-bird',
  // 设置报警积分奖励
  POINTS_SET_WARN: '/points/tasks/set-warn',

  // 添加自选
  ADD_OWN: '/selfselect/add',
  // 删除自选
  CANCEL_OWN: '/selfselect/cancel',

  // 多空比（当前）
  PCR_CUR: '/derivatives/longshort',
  // 多空比（历史）
  PCR_HIS: '/derivatives/histratio',
  // 持仓量（当前）
  PS_CUR: '/derivatives/holdusd',
  // 持仓量（历史）
  PS_HIS: '/derivatives/histUsd',
  // 成交额（当前）
  TRA_CUR: '/derivatives/tradingval',
  // 成交额（历史）
  TRA_HIS: '/derivatives/historytradingval',
  // 资金费率（当前）
  FR_CUR: '/derivatives/foundrate',
  // 资金费率（历史）
  FR_HIS: '/derivatives/historyfoundrate',

  // 全部币
  ALL_COIN: '/derivatives/allcoin',
  // 全部交易所
  ALL_CEX: '/derivatives/allcex',

  // 添加告警
  ADD_WARN: '/alarm/add',
  // 我的告警
  MY_WARN: '/alarm/info',
  // 打开告警
  OPEN_WARN: '/alarm/on',
  // 关闭告警
  CLOSE_WARN: '/alarm/off',
  // 删除币种的所有告警
  DELETE_COIN_WARN: '/alarm/delete/coin',

  // 社区
  // 获取帖子列表
  POSTS_API: '/posts',
  // 获取帖子详情
  POST_DETAIL_API: '/posts/{id}',
  // 获取评论列表
  COMMENTS_API: '/comments/post/{postId}',
  // 获取热榜话题
  HOT_TOPICS_API: '/topic/hot',
  // 话题搜索
  TOPIC_SEARCH: '/topic/search',
  // 发帖
  POST_NEW: '/posts/new',
  // 点踩
  POSTS_UNLIKE: '/posts/unlike',
  // 点赞
  POSTS_LIKE: '/posts/like',
  // 创建评论
  COMMENTS_NEW: '/comments/new',
  // 更新帖子
  POSTS_UPDATE: '/posts/update',
  // 删除帖子
  POSTS_DELETE: '/posts/delete',
  // 创建话题
  CREATE_TOPIC: '/topic/new',
  // 话题相关帖子
  TOPIC_POSTS: '/posts/topic',
  // 创建投票
  CREATE_VOTE: '/api/vote/create',
  // 上传文件
  UPLOAD_FILE: '/easy/uploadFile',
  // 获取我的评论
  GET_MY_COMMENTS: '/easy/getMyComments',
  // 获取我的点赞
  GET_MY_LIKES: '/easy/getMyLikes',
  // 获取我的消息通知
  GET_MY_NOTICES: '/easy/getMyMsgAndNotices',
  // 获取未读通知数量
  GET_UNREAD_COUNT: '/easy/getUnreadCount',
  // 标记通知为已读
  MARK_NOTICES_READ: '/easy/markNoticesRead',
  // 获取我的交互数据（新币上线等）
  GET_MY_INTERFACE: '/easy/getMyInterface',

  // 是否展示全部内容
  SHOW_ALL: '/switch/status',

  // 涨跌分布（市场数据）
  // 获取涨跌分布数据
  MARKET_DISTRIBUTION: '/easy/getGainAndLossDisDa',
  // 获取恐慌贪婪指数
  FEAR_GREED_INDEX: '/easy/getFearGreedIndex',
  // 获取市场聚合数据（BTC市场占有率等）
  AGGREGATION_DETAIL: '/easy/getAggregationDetail',
  
  // 投资回报率
  RETURN_INVESTMENT: '/easy/getReturnInvestment',
};

// 邮箱
export const EMAIL = 'contact@moziinnovations.com';

// 私钥
export const COINKEY = {
  BTC: 'bc1p3pdyjgxcyhw7x24dr4fe8ral5p8w02tjfetfjc4h08v02lrrl5mqhv2val',
  ETH: '0xbD2858bC9F46fad5892174893c99924A6eF169C3',
  TRON: 'TXBGXsZN8GBjY6v1mtJN8gDqD2BxUxk2Xw',
};

// 轮循时间间隔(6分钟)
// export const LOOPTIME = 6*60*1000;
export const LOOPTIME = 5000;