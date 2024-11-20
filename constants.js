export const INTERFACE_URL = 'https://moziinnovations.com';

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
  // 评分
  MOZI_COMMENT: '/feedback/add',

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
};