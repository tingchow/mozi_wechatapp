import { View, Text, Input, Button, Image, ScrollView, Canvas } from '@tarojs/components'
import Taro, { useLoad, getCurrentInstance, useRouter, useUnload, useShareAppMessage, useDidShow, useDidHide } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface, LOOPTIME } from '../../utils/constants';
import { PageLogin } from '../../components/PageLogin';
import { Card, List, Grid, CapsuleTabs, Tabs, TabBar } from 'antd-mobile';
import IconFont from '../../components/iconfont';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { Layout } from '../../components/Layout';
import { handleOptions } from '../../components/MoziChart/options';
import { HighlightArea } from '../../components/HighlightArea';
import { AddCollect } from '../../components/AddCollect';
import { jump2List, jump2DataPage, jump2NoTab } from '../../utils/core';
import './index.less';
import * as echarts from '../../components/MoziChart/ec-canvas/echarts';
// import * as towxml from '../../components/towxml/towxml';
// 延迟加载 towxml，避免在非 AI 页面时增加主包体积
let parseTowxml = null;
import isEmpty from 'lodash/isEmpty';
import { useMoziWebSocket } from '../../utils/useMoziWebSocket';
import { CHANNEL_TYPES } from '../../utils/websocketProtocol';
const communityIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community-no-actived.png';
const shareIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/share.png';
const upIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/up.png';
const downIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/down.png';

// Switch chart-type icons to CDN URLs
const klineActived = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/graph/kline-actived.png';
const klineNoActived = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/graph/kline-no-actived.png';
const lineActived = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/graph/line-actived.png';
const lineNoActived = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/graph/line-no-actived.png';
// import '~taro-parse/dist/style/main.scss'
// import TaroParser from 'taro-parse'

// const aiData = {
//   hour: null,
//   day: null,
//   week: null,
//   month: null,
// };


export default function Detail() {

  const [activeKey, setActiveKey] = useState('hour');
  const [pageActiveKey, setPageActiveKey] = useState('chart');
  const [chartType, setChartType] = useState('line'); // kline | line
  const chartTypeRef = useRef('line');

  const [coinInfo, setCoinInfo] = useState(null);
  const [ needLogin, setLogin ] = useState(false);
  // const [coinLine, setCoinLine] = useState([]);
  // const [infoShowLeft, setInfoShowLeft] = useState([]);
  // const [infoShowRight, setInfoShowRight] = useState([]);
  // const [infoShowLeft, setInfoShowLeft] = useState([]);
  // const [infoShowLeft, setInfoShowLeft] = useState([]);

  const [coinInfoLeft, setCoinInfoLeft] = useState([]);
  const [coinInfoRight, setCoinInfoRight] = useState([]);
  const [coinMarket, setCoinMarket] = useState({
    length: 0,
    data: null
  });
  const [ai, setAi] = useState({
    loading: true,
    error: false,
    data: null
  });

  const aiData = useRef({
    hour: null,
    day: null,
    week: null,
    month: null,
  });

  const chartData = useRef({
    hour: null,
    day: null,
    week: null,
    month: null,
    active: 'hour',
  });

  const needLoop = useRef(true);
  const useWebSocketData = useRef(true); // 标记是否使用 WebSocket 数据
  const wsUnsubscribeRefs = useRef([]); // 存储取消订阅函数

  // 初始化 WebSocket
  const { isConnected, isAuthenticated, subscribe } = useMoziWebSocket({
    autoConnect: true,
    onConnected: () => {
      console.log('[Detail] WebSocket 已连接，等待认证...');
      // 不在这里订阅，等待 isAuthenticated 变为 true 后由 useEffect 触发
    },
    onDisconnected: () => {
      console.log('[Detail] WebSocket 已断开，切换到 HTTP 数据源');
      useWebSocketData.current = false;
      // 清理订阅
      cleanupWebSocketSubscriptions();
      // 启动 HTTP 轮询
      if (needLoop.current) {
        headRequest();
        kLineRequest();
        marketRequest();
      }
    },
    onError: (error) => {
      console.error('[Detail] WebSocket 错误:', error);
      useWebSocketData.current = false;
    }
  });


  // 控制展开收起
  const [infoShow, setInfoShow] = useState(false);

  // 投资回报率数据
  const [roiData, setRoiData] = useState({
    priceChange1Day: '--',
    priceChange7Day: '--',
    priceChange1Month: '--',
    priceChange1Year: '--'
  });

  const chartRef = useRef(null)

  const initChart = (canvas, width, height, dpr) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);


    chartRef.current = chart;

    return chart;
  }

  const ec = {
    onInit: initChart
  }
  
  const symbol = useRouter().params.symbol;

  // 监听 WebSocket 认证状态，认证成功后自动订阅
  useEffect(() => {
    if (isAuthenticated && needLoop.current && symbol) {
      console.log('[Detail] WebSocket 已认证，自动订阅币种数据:', symbol);
      useWebSocketData.current = true;
      subscribeWebSocketData();
    }
  }, [isAuthenticated, symbol]);

  useDidShow(() => {
    needLoop.current = true;
    
    // 如果 WebSocket 已连接且认证，使用 WebSocket
    if (isConnected && isAuthenticated) {
      console.log('[Detail] 页面显示 - 使用 WebSocket 数据源');
      subscribeWebSocketData();
    } else {
      // 否则使用 HTTP
      console.log('[Detail] 页面显示 - 使用 HTTP 数据源（WebSocket 连接中...）');
      headRequest();
      kLineRequest();
      marketRequest();
    }
    
    getROIData(symbol);
    // 初次进入按默认类型渲染一次，避免先闪K再变线
    setTimeout(() => {
      renderCurrentChart();
    }, 0);
  });

  useDidHide(() => {
    needLoop.current = false;
    // 清理 WebSocket 订阅
    cleanupWebSocketSubscriptions();
  });

  /**
   * 订阅 WebSocket 数据
   */
  const subscribeWebSocketData = () => {
    if (!subscribe || !symbol) {
      console.warn('[Detail] 无法订阅，subscribe 或 symbol 不存在');
      return;
    }
    
    console.log('[Detail] ========== 开始订阅 WebSocket 数据 ==========');
    console.log('[Detail] 币种:', symbol);
    console.log('[Detail] 认证状态:', isAuthenticated);
    console.log('[Detail] 连接状态:', isConnected);
    
    // 清理旧的订阅
    if (wsUnsubscribeRefs.current.length > 0) {
      console.log('[Detail] 清理旧订阅...');
      cleanupWebSocketSubscriptions();
    }
    
    // 订阅 ticker 数据（实时价格）
    // 格式：{"type":"ticker","symbols":["ALCX"],"params":{"interval":5000}}
    console.log('[Detail] 订阅 ticker 频道...');
    const unsubTicker = subscribe(
      {
        type: CHANNEL_TYPES.TICKER,
        symbols: [symbol],  // 使用 symbols 数组
        params: {
          interval: 5000    // 5秒推送间隔
        }
      },
      (data) => {
        console.log('[Detail] ✅ 收到 ticker 数据:', data);
        handleTickerData(data);
      }
    );
    wsUnsubscribeRefs.current.push(unsubTicker);
    console.log('[Detail] ✅ ticker 频道订阅成功');
    
    // 订阅 kline 数据（K线）
    // 格式：{"type":"kline","symbols":["ALCX"],"params":{"period":"1h","limit":100}}
    const periods = ['1h', '1d', '1w', '1M']; // 对应 hour, day, week, month
    console.log('[Detail] 订阅 kline 频道...');
    periods.forEach((period) => {
      console.log(`[Detail] 订阅 kline (${period})...`);
      const unsubKline = subscribe(
        {
          type: CHANNEL_TYPES.KLINE,
          symbols: [symbol],  // 使用 symbols 数组
          params: { 
            period: period,
            limit: 100        // 获取100条K线数据
          }
        },
        (data) => {
          console.log(`[Detail] ✅ 收到 kline 数据 (${period}):`, data);
          handleKlineData(data, period);
        }
      );
      wsUnsubscribeRefs.current.push(unsubKline);
      console.log(`[Detail] ✅ kline (${period}) 频道订阅成功`);
    });
    
    console.log('[Detail] ========== 所有频道订阅完成 ==========');
    console.log('[Detail] 总共订阅了', wsUnsubscribeRefs.current.length, '个频道 (1个ticker + 4个kline)');
  };
  
  /**
   * 清理 WebSocket 订阅
   */
  const cleanupWebSocketSubscriptions = () => {
    wsUnsubscribeRefs.current.forEach(unsub => {
      if (typeof unsub === 'function') {
        unsub();
      }
    });
    wsUnsubscribeRefs.current = [];
  };
  
  /**
   * 处理 ticker 数据（来自 WebSocket）
   */
  const handleTickerData = (data) => {
    if (!data.data) return;
    
    const tickerData = data.data;
    
    // 更新币种信息
    const coin_info_data = {
      symbol: tickerData.symbol,
      name: tickerData.name || tickerData.symbol,
      url: tickerData.url || coinInfo?.url,
      currentPrice: tickerData.currentPrice || tickerData.last,
      priceChange_24h: tickerData.priceChange_24h,
      priceChangePercentage_24h: tickerData.priceChangePercentage_24h,
      marketCapRank: tickerData.marketCapRank || coinInfo?.marketCapRank,
      marketCap: tickerData.marketCap || coinInfo?.marketCap,
      high_24h: tickerData.high_24h,
      low_24h: tickerData.low_24h,
      fullyDilutedValuation: tickerData.fullyDilutedValuation || coinInfo?.fullyDilutedValuation,
      marketCapChange_24h: tickerData.marketCapChange_24h || coinInfo?.marketCapChange_24h,
      marketCapChangePercentage_24h: tickerData.marketCapChangePercentage_24h || coinInfo?.marketCapChangePercentage_24h,
      athDate: tickerData.athDate || coinInfo?.athDate,
      atlDate: tickerData.atlDate || coinInfo?.atlDate,
      totalVolume: tickerData.totalVolume || tickerData.volume_24h,
      totalSupply: tickerData.totalSupply || coinInfo?.totalSupply,
      circulatingSupply: tickerData.circulatingSupply || coinInfo?.circulatingSupply,
      ath: tickerData.ath || coinInfo?.ath,
      athChangePercentage: tickerData.athChangePercentage || coinInfo?.athChangePercentage,
      atl: tickerData.atl || coinInfo?.atl,
      atlChangePercentage: tickerData.atlChangePercentage || coinInfo?.atlChangePercentage,
      isSelfSelected: tickerData.isSelfSelected ?? coinInfo?.isSelfSelected
    };
    
    const headerInfoLeft = [{
      name: '24H最高价',
      value: coin_info_data.high_24h
    },{
      name: '24H最低价',
      value: coin_info_data.low_24h
    },{
      name: '稀释市值',
      value: coin_info_data.fullyDilutedValuation
    },{
      name: '24H市值变化',
      value: coin_info_data.marketCapChange_24h
    },{
      name: '24H市值变化百分比',
      value: coin_info_data.marketCapChangePercentage_24h
    },{
      name: '历史最高价时间',
      value: coin_info_data.athDate
    },{
      name: '历史最低价时间',
      value: coin_info_data.atlDate
    }];

    const headerInfoRight = [{
      name: '24H成交额',
      value: coin_info_data.totalVolume
    },{
      name: '总供应量',
      value: coin_info_data.totalSupply
    },{
      name: '流通供应量',
      value: coin_info_data.circulatingSupply
    },{
      name: '历史最高价',
      value: coin_info_data.ath
    },{
      name: '历史最高价百分比',
      value: coin_info_data.athChangePercentage
    },{
      name: '历史最低价',
      value: coin_info_data.atl
    },{
      name: '历史最低价百分比',
      value: coin_info_data.atlChangePercentage
    }];
    
    setCoinInfoLeft(headerInfoLeft);
    setCoinInfoRight(headerInfoRight);
    setCoinInfo(coin_info_data);
  };
  
  /**
   * 处理 kline 数据（来自 WebSocket）
   */
  const handleKlineData = (data, period) => {
    if (!data.data) return;
    
    const klineData = data.data;
    const periodMap = {
      '1h': 'hour',
      '1d': 'day',
      '1w': 'week',
      '1M': 'month'
    };
    
    const key = periodMap[period];
    if (!key) return;
    
    chartData.current[key] = {
      data: klineData,
      type: 'kline'
    };
    
    // 如果是当前激活的周期，立即渲染
    if (chartData.current.active === key) {
      renderCurrentChart();
    }
  };

  // 头部（HTTP 回退）
  const headRequest = async () => {
    // 如果正在使用 WebSocket，跳过 HTTP 请求
    if (useWebSocketData.current) {
      return;
    }
    
    // 头部信息
    const coin_info = await cardRequest(Interface.coin_info, {
      symbol
    });

    const coin_info_data = coin_info.data;
    if (isEmpty(coin_info_data)) {
      return;
    }

    // 动态设置标题
    Taro.setNavigationBarTitle({
      title: coin_info_data?.name || ''
    });

    const headerInfoLeft = [{
      name: '24H最高价',
      value: coin_info_data.high_24h
    },{
      name: '24H最低价',
      value: coin_info_data.low_24h
    },{
      name: '稀释市值',
      value: coin_info_data.fullyDilutedValuation
    },{
      name: '24H市值变化',
      value: coin_info_data.marketCapChange_24h
    },{
      name: '24H市值变化百分比',
      value: coin_info_data.marketCapChangePercentage_24h
    },{
      name: '历史最高价时间',
      value: coin_info_data.athDate
    },{
      name: '历史最低价时间',
      value: coin_info_data.atlDate
    }];

    const headerInfoRight = [{
      name: '24H成交额',
      value: coin_info_data.totalVolume
    },{
      name: '总供应量',
      value: coin_info_data.totalSupply
    },{
      name: '流通供应量',
      value: coin_info_data.circulatingSupply
    },{
      name: '历史最高价',
      value: coin_info_data.ath
    },{
      name: '历史最高价百分比',
      value: coin_info_data.athChangePercentage
    },{
      name: '历史最低价',
      value: coin_info_data.atl
    },{
      name: '历史最低价百分比',
      value: coin_info_data.atlChangePercentage
    }];

    setCoinInfoLeft(headerInfoLeft);
    setCoinInfoRight(headerInfoRight);

    setCoinInfo(coin_info.data);

    setTimeout(() => {
      if (needLoop.current && !useWebSocketData.current) headRequest();
    }, LOOPTIME);
  };
  // K线（HTTP 回退）
  const kLineRequest = async () => {
    // 如果正在使用 WebSocket，跳过 HTTP 请求
    if (useWebSocketData.current) {
      return;
    }
    
    // k线图
    const coin_line1 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 1
    });
    // setCoinLine(coin_line1.data);
    chartData.current.hour = {
      data: coin_line1?.data,
      type: 'kline'
    };
    if (chartData.current.active === 'hour') {
      renderCurrentChart();
    }

    const coin_line2 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 2
    });
    chartData.current.day = {
      data: coin_line2?.data,
      type: 'kline'
    };
    if (chartData.current.active === 'day') {
      renderCurrentChart();
    }
    const coin_line3 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 3
    });
    chartData.current.week = {
      data: coin_line3?.data,
      type: 'kline'
    };
    if (chartData.current.active === 'week') {
      renderCurrentChart();
    }
    const coin_line4 = await cardRequest(Interface.coin_line, {
      symbol,
      type: 4
    });
    chartData.current.month = {
      data: coin_line4?.data,
      type: 'kline'
    };
    if (chartData.current.active === 'month') {
      renderCurrentChart();
    }

    setTimeout(() => {
      if (needLoop.current && !useWebSocketData.current) kLineRequest();
    }, LOOPTIME);
  };

  // 市场（HTTP 回退）
  const marketRequest = async () => {
    // 如果正在使用 WebSocket，跳过 HTTP 请求
    if (useWebSocketData.current) {
      return;
    }
    
    const marketRes = await request({
      url: Interface.COIN_MARKET,
      data: {
        symbol
      }
    });

    if (!isEmpty(marketRes?.data)) {
      const tempData = marketRes?.data.map((item) => {
        return {
          title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.exchanges}</View>,
          last: item.last,
          price24h: <HighlightArea value={item.price24h} />,
          vol: item.vol,
          usd: item.usd
        }
      });

      setCoinMarket({
        length: tempData.length,
        data: tempData
      });
    }

    setTimeout(() => {
      if (needLoop.current && !useWebSocketData.current) marketRequest();
    }, LOOPTIME);
  };
  useLoad(async () => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });
    // TODO-暂时下掉
    // getAiData({});
  });

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  useUnload(() => {
    chartRef.current.dispose();
  });

  // 保证路由切换或隐藏显示过程中，不丢失当前类型
  useEffect(() => {
    chartTypeRef.current = chartType;
  }, [chartType]);

  const cardRequest = async (url, data) => {
    const res = await request({
      url,
      data,
    });
    // setHotIndustry(res.data);
    // console.log('响应信息', res);
    return res;
  };

  // 获取投资回报率数据
  const getROIData = async (symbol) => {
    try {
      const res = await request({
        url: Interface.RETURN_INVESTMENT,
        data: { symbol }
      });
      if (res && res.data && res.data.length > 0) {
        const data = res.data[0]; // 取数组第一个元素
        setRoiData({
          priceChange1Day: data.priceChange1Day || '--',
          priceChange7Day: data.priceChange7Day || '--',
          priceChange1Month: data.priceChange1Month || '--',
          priceChange1Year: data.priceChange1Year || '--'
        });
      }
    } catch (error) {
      console.error('获取投资回报率失败:', error);
    }
  };

  const changeShow = () => {
    setInfoShow(!infoShow);
  };

  const activeClick = async (value) => {
    if ( value ===  activeKey) return;
    chartData.current.active = value;
    setActiveKey(value);
    renderCurrentChart();
    // TODO-暂时下掉
    getAiData({activeKey: value});
  };

  const buildLineDataset = (klineData) => {
    // 期望结构：{ categoryData: [], lineData: [] }
    if (!klineData) return { categoryData: [], lineData: [] };
    // 若已是折线结构则直接返回
    if (Array.isArray(klineData.lineData)) return klineData;
    const categoryData = klineData.categoryData || [];
    const values = klineData.values || [];
    const lineData = values.map((v) => Array.isArray(v) ? v[1] : v?.Close ?? v?.close ?? 0);
    return { categoryData, lineData };
  };

  const renderCurrentChart = ({ dataset, forceType } = {}) => {
    const key = chartData.current.active || activeKey;
    const data = dataset || chartData.current[key]?.data;
    const type = forceType || chartTypeRef.current;
    if (!data || !chartRef.current) return;
    if (type === 'line') {
      const lineDs = buildLineDataset(data);
      chartRef.current.setOption(handleOptions(lineDs, 'line'));
    } else {
      chartRef.current.setOption(handleOptions(data, 'kline'));
    }
  };

  const handleChartTypeToggle = (type) => {
    if (type === chartType) return;
    setChartType(type);
    chartTypeRef.current = type;
    renderCurrentChart({ forceType: type });
  };

  const pageActiveClick = (value) => {
    setPageActiveKey(value);
    // if (value === 'ai') {
      
    //   return;
    // }
    
    let scrollClass = '';
    if (value === 'chart') {
      scrollClass = '.f2Box';
    } else if (value === 'roi') {
      scrollClass = '.roiBox';
    } else if (value === 'market') {
      scrollClass = '.marketBox';
    }
    Taro.pageScrollTo({
      selector: scrollClass
    });
  };

  const getAiData = async ({activeKey = 'hour'}) => {
    // if (isAccount === true) {
    //   setUserStatus(null);
    // } else {
    //   if (userStatus === 'needAccount') return;
    // }
    
    const typeObj = {
      hour: 1,
      day: 2,
      week: 3,
      month: 4
    };
    if (aiData.current[activeKey] !== null) {
      setAi({
        ...ai,
        loading: false,
        data: aiData.current[activeKey]
      });
      console.log('切换数据');
      return;
    } else {
      setAi({
        ...ai,
        loading: true,
      });
    }

    const aiRes = await cardRequest(Interface.AI_COIN, {
      symbol,
      type: typeObj[activeKey]
    });
    if (isEmpty(aiRes?.data)) {
      setAi({
        ...ai,
        loading: false,
        error: true,
      });
      return;
    }
    if (aiRes?.data?.isLogin === false) {
      setLogin(true);
      setAi({
        ...ai,
        loading: false,
      });
      return;
    }
    if (!parseTowxml) {
      const mod = await import('../../towxml');
      parseTowxml = mod.default || mod;
    }
    let mdRes = parseTowxml(aiRes?.data,'markdown',{});
    aiData.current[activeKey] = mdRes;
    
    setAi({
      loading: false,
      data: mdRes
    });
  };

  const jump2Land = () => {
    // 将当前图表类型一并传递给横屏页面
    jump2DataPage('landscapechart', 'chartData', { ...chartData.current, forceType: chartTypeRef.current });
  };

  const jump2Community = () => {
    // 跳转社区tab
    if (coinInfo && coinInfo.symbol) {
      Taro.setStorageSync('communityCoinSymbol', coinInfo.symbol);
    }
    Taro.switchTab({
      url: '/pages/community/index'
    });
    return;
    // Taro.switchTab({
    //   url: `/pages/community/index?symbol=${coinInfo?.symbol}`,
    // });
  };

  return (
    <View className='indexBox'>
      {/* 头部详情 */}
      <View className='box'>
        {
          coinInfo && (
            <View className='header'>
              <View className='headerBox'>
                <div className='left'>
                  <View className='coinInfo'>
                    <View className='top-row'>
                      <Image className='coinIcon' src={coinInfo.url} mode='aspectFit' />
                      <View className='coin-symbol'>{coinInfo.symbol}</View>
                    </View>
                    <View className={`coin-price ${coinInfo.priceChange_24h.includes('-') ? 'price-down' : 'price-up'}`}>{coinInfo.currentPrice}</View>
                  </View>
                  {coinInfo.priceChange_24h.includes('-') ? (
                    <div className='caretBox'>
                      <IconFont name='caret-down' size={50} color='#FA5F5F' />
                      <View className='downPercent precentBox'>
                        <View className='priceItem'>{coinInfo.priceChange_24h}</View>
                        <View>({coinInfo.priceChangePercentage_24h})</View>
                        </View>
                    </div>
                    ): (
                      <div className='caretBox'>
                        <IconFont name='caret-up' size={50} color='#11B787' />
                        <View className='upPercent precentBox'>
                          <View className='priceItem'>{coinInfo.priceChange_24h}</View>
                          <View>({coinInfo.priceChangePercentage_24h})</View>
                        </View>
                      </div>
                    )
                  }
                </div>
                <div className='right'>
                  <View className='marketRank'>
                    {`No.${coinInfo.marketCapRank}`}
                  </View>
                  <View className='marketItem '>{`流通市值 ${coinInfo.marketCap}`}</View>
                  {/* <View className='marketItem'>{`稀释市值 ${coinInfo.fullyDilutedValuation}`}</View> */}
                </div>
              </View>
              {
                coinInfoLeft.length !== 0 && coinInfoRight.length !== 0 && (
                <View className='headerInfo'>
                  <View className='left'>
                    {
                      coinInfoLeft.slice(0,2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                  {/* <View className='center'></View> */}
                  <View className='right'>
                    {
                      coinInfoRight.slice(0,2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                </View>
                )
              }
              {
                infoShow && coinInfoLeft.length !== 0 && coinInfoRight.length !== 0 && (
                <View className='headerInfo'>
                  <View className='left'>
                    {
                      coinInfoLeft.slice(2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                  {/* <View className='center'></View> */}
                  <View className='right'>
                    {
                      coinInfoRight.slice(2).map((leftInfo) => {
                        return (
                          <View className='headerInfoItem'>
                            <View className='name'>{leftInfo.name}</View>
                            <View>{leftInfo.value}</View>
                          </View>
                        )
                      })
                    }
                  </View>
                </View>
                )
              }
              <View className='coin-info-caret' onClick={changeShow}>
                <Image className='arrow-icon' src={infoShow? upIcon : downIcon} mode='aspectFit' />
              </View>
            </View>
          )
        }
        
      </View>
      
      {/* tab选择 */}
      <TabBar className='tabContainer' activeKey={pageActiveKey} onChange={pageActiveClick}>
        <TabBar.Item key='chart' title='图表' />
        <TabBar.Item key='market' title='市场' />
        <TabBar.Item key='roi' title='投资回报率' />
      </TabBar>


      {/* 折线图区域 */}
      <div className='box chart-box'>
        <div className='f2Box'>
          <View className='chart-type-tabs'>
            <View className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => handleChartTypeToggle('line')}>
              <Image src={chartType === 'line' ? lineActived : lineNoActived} className='chart-type-icon' />
            </View>
            <View className={`chart-type-btn ${chartType === 'kline' ? 'active' : ''}`} onClick={() => handleChartTypeToggle('kline')}>
              <Image src={chartType === 'kline' ? klineActived : klineNoActived} className='chart-type-icon' />
            </View>
          </View>
          <TabBar className='chartTab' activeKey={activeKey} onChange={activeClick}>
            <TabBar.Item key='hour' title='1H' />
            <TabBar.Item key='day' title='1日' />
            <TabBar.Item key='week' title='1周' />
            <TabBar.Item key='month' title='1月' />
          </TabBar>
          <View className='chartBox detail-kline-large'>
            <View className='chart-arrawsalt detail-landscape-btn' onClick={jump2Land}>
              <IconFont name='arrawsalt' size={30} color='#fff' />
            </View>
            <ec-canvas canvas-id="mychart-kline" ec={ec}></ec-canvas>
          </View>
          
        </div>
      </div>
      {/* TODO-暂时下掉 */}
      {/* AI解析 */}
      {/* <View className='ai-box'>
        <MoziCard
          title='AI解读'
          // sumNum={coinMarket.length}
          // type='more'
          // callback={jump2List}
        >
        <Layout isLoading={ai.loading} isError={ai.error}  needLogin={needLogin} loginCallback={() => getAiData({activeKey})}>
          <ScrollView
            className='scroll-markdown'
            scrollY
          >
            {
              // @ts-ignore
              <towxml nodes={ai.data} />
            }
          </ScrollView>
        </Layout>
        </MoziCard>
      </View> */}
      


      {/* 市场行情 */}
      <View className='marketBox'>
        <Layout isLoading={coinMarket.length === 0}>
          <MoziCard
            title='市场'
            sumNum={coinMarket.length}
            // type='more'
            callback={jump2List}
          >
            <MoziGrid
              length={5}
              colName={['交易所', '最新价', '24H涨幅', '24H成交量', '24小时成交额']}
              gridContent={coinMarket.data}
              gridTitleBgColor="transparent"
              // callback={(gridCon) => {jump2Detail(gridCon.key)}}
            >

            </MoziGrid>
          </MoziCard>
        </Layout>
      </View>

      {/* 投资回报率 */}
      <View className='roiBox'>
        <MoziCard title='投资回报率'>
          <View className='roi-grid'>
            <View className={`roi-card ${roiData.priceChange1Day !== '--' && parseFloat(roiData.priceChange1Day) < 0 ? 'negative' : 'positive'}`}>
              <Text className='roi-value'>{roiData.priceChange1Day}</Text>
              <Text className='roi-label'>日回报率</Text>
            </View>
            <View className={`roi-card ${roiData.priceChange7Day !== '--' && parseFloat(roiData.priceChange7Day) < 0 ? 'negative' : 'positive'}`}>
              <Text className='roi-value'>{roiData.priceChange7Day}</Text>
              <Text className='roi-label'>周回报率</Text>
            </View>
            <View className={`roi-card ${roiData.priceChange1Month !== '--' && parseFloat(roiData.priceChange1Month) < 0 ? 'negative' : 'positive'}`}>
              <Text className='roi-value'>{roiData.priceChange1Month}</Text>
              <Text className='roi-label'>月回报率</Text>
            </View>
            <View className={`roi-card ${roiData.priceChange1Year !== '--' && parseFloat(roiData.priceChange1Year) < 0 ? 'negative' : 'positive'}`}>
              <Text className='roi-value'>{roiData.priceChange1Year}</Text>
              <Text className='roi-label'>年回报率</Text>
            </View>
          </View>
        </MoziCard>
      </View>
      {/* <div className='marketBox'>
        <MoziCard
          title='市场'
          sumNum={4}
          type='more'
          callback={jump2List}
        >
          <MoziGrid
            length={5}
            colName={['交易所', '最新价', '24H涨幅', '24H成交量', '24小时成交额']}
            gridContent={marketData}
            // callback={(gridCon) => {jump2Detail(gridCon.key)}}
          >

          </MoziGrid>
        </MoziCard>
      </div> */}
      {/* 评论 */}
      {/* {coinInfo?.symbol && ( */}
        <View className='footer-list'>
          <View className='footer-item'>
            <AddCollect isOwn={coinInfo?.isSelfSelected || false} symbol={symbol} />
            <View>加自选</View>
          </View>
          <View className='footer-item' onClick={() => {jump2NoTab('addwarn', {symbol})}}>
            <IconFont name='bell-fill' size={40} color='#C7C9CD' />
            <View>告警</View>
          </View>
          <Button className='footer-item' openType='share'>
            <Image className='footer-icon' src={shareIcon} mode='aspectFit' />
            <View>分享</View>
          </Button>
          <View className='footer-item' onClick={jump2Community}>
            <Image className='footer-icon' src={communityIcon} mode='aspectFit' />
            <View>社区</View>
          </View>
        </View>
      {/* )} */}
      {/* <Canvas canvasId="screenshotCanvas"/> */}
      {/* <PageLogin show={popVis} hideCb={() => {setPopVis(false)}} /> */}
      {/* 悬浮机器人按钮 */}
      <View className='float-robot-btn' onClick={() => jump2NoTab('robot')}>
        <Image className='robot-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/AI_Bot.png'} mode='aspectFit' />
      </View>
    </View>
  )
}




