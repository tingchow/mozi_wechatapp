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
import { useWebSocket } from '../../context/WebSocketContext';
import { CHANNEL_TYPES } from '../../utils/websocketProtocol';
import { SkeletonPage } from '../../components/Skeleton';
import { detailPageSkeletonConfig } from '../../components/Skeleton/configs';
import { GardenLoading } from '../../components/Loading';
import FloatingRobot from '../../components/FloatingRobot';
import OneClickAlarmModal from '../../components/OneClickAlarmModal';
import ExchangePickerModal from '../../components/ExchangePickerModal';
import { fetchUserAlertConfig } from '../../api/user';
const communityIcon = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/icons/new_detail/community.svg';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 是否首次加载
  const [klineLoading, setKlineLoading] = useState(false); // K线数据加载状态

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
  
  // WebSocket连接状态管理（与原H5项目保持一致）
  const wsConnectionStatusRef = useRef('connecting'); // connecting | connected | failed
  const wsConnectionTimeoutRef = useRef(null); // WebSocket连接超时定时器
  const useHttpFallbackRef = useRef(false); // 是否使用HTTP降级
  const pollingTimerRef = useRef(null); // HTTP轮询定时器
  const wsUnsubscribeRefs = useRef({ kline: null });

  const [oneClickAlarmOpen, setOneClickAlarmOpen] = useState(false);
  const [oneClickAlarmMode, setOneClickAlarmMode] = useState('oneClick');
  const [exchangePickerOpen, setExchangePickerOpen] = useState(false);

  // 启动HTTP降级模式
  const startHttpFallback = () => {
    console.log('[Detail] ========== 启动HTTP降级模式 ==========');
    useHttpFallbackRef.current = true;
    wsConnectionStatusRef.current = 'failed';
    
    // 立即获取一次数据
    headRequest();
    kLineRequest();
    marketRequest();
    
    // 设置轮询
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }
    pollingTimerRef.current = setInterval(() => {
      if (needLoop.current && useHttpFallbackRef.current) {
        console.log('[Detail] HTTP轮询中...');
        headRequest();
        kLineRequest();
        marketRequest();
      }
    }, LOOPTIME);
  };
  
  // 停止HTTP降级模式
  const stopHttpFallback = () => {
    console.log('[Detail] ========== 停止HTTP降级模式 ==========');
    useHttpFallbackRef.current = false;
    
    // 清除轮询定时器
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  };

  // 使用全局 WebSocket 连接（在 app.js 中已初始化）
  const { isConnected, isAuthenticated, subscribe } = useWebSocket();
  
  // 监听 WebSocket 连接状态变化
  useEffect(() => {
    if (!isConnected && wsConnectionStatusRef.current === 'connected') {
      // WebSocket 从已连接变为断开
      wsConnectionStatusRef.current = 'failed';
      
      // 清理订阅
      cleanupWebSocketSubscriptions();
      
      // 启动 HTTP 降级
      startHttpFallback();
    }
  }, [isConnected]);
  
  // 组件卸载时清理订阅
  useEffect(() => {
    return () => {
      cleanupWebSocketSubscriptions();
    };
  }, []);


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
    // 只有在页面活跃、认证成功、且还没有连接成功时才处理
    if (isAuthenticated && needLoop.current && symbol && wsConnectionStatusRef.current !== 'connected') {
      wsConnectionStatusRef.current = 'connected'; // 标记连接成功
      
      // 清除WebSocket连接超时定时器
      if (wsConnectionTimeoutRef.current) {
        clearTimeout(wsConnectionTimeoutRef.current);
        wsConnectionTimeoutRef.current = null;
      }
      
      // 停止HTTP降级模式（如果已启动）
      stopHttpFallback();
      
      // 订阅 WebSocket 数据
      subscribeWebSocketData();
    }
  }, [isAuthenticated, symbol]);

  const loadUserAlertConfig = async () => {
    try {
      const userId = Taro.getStorageSync('userId');
      if (!userId) {
        Taro.removeStorageSync('alertConfig');
        return;
      }
      const config = await fetchUserAlertConfig();
      if (config) {
        Taro.setStorageSync('alertConfig', JSON.stringify(config));
      } else {
        Taro.removeStorageSync('alertConfig');
      }
    } catch (error) {
      console.error('获取告警配置失败:', error);
    }
  };

  useDidShow(() => {
    needLoop.current = true;
    
    // 重置首次加载状态（重新进入时显示骨架屏）
    setIsInitialLoad(true);
    setKlineLoading(true);
    
    // 检查 WebSocket 连接状态
    if (isConnected && isAuthenticated) {
      // WebSocket 已就绪，立即订阅
      wsConnectionStatusRef.current = 'connected';
      subscribeWebSocketData();
    } else {
      // WebSocket 未就绪，设置超时机制
      wsConnectionTimeoutRef.current = setTimeout(() => {
        if (wsConnectionStatusRef.current !== 'connected') {
          startHttpFallback();
        }
      }, 10000); // 10秒
    }
    
    getROIData(symbol);
    loadUserAlertConfig();
    // 初次进入按默认类型渲染一次，避免先闪K再变线
    setTimeout(() => {
      renderCurrentChart();
    }, 0);
  });

  useDidHide(() => {
    needLoop.current = false;
    
    // 清理 WebSocket 订阅（取消订阅，但不断开连接）
    cleanupWebSocketSubscriptions();
    
    // 清除HTTP轮询定时器
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    // 清除WebSocket连接超时定时器
    if (wsConnectionTimeoutRef.current) {
      clearTimeout(wsConnectionTimeoutRef.current);
      wsConnectionTimeoutRef.current = null;
    }
    
    // 重置连接状态（下次进入时重新检查）
    wsConnectionStatusRef.current = 'connecting';
  });

  /**
   * 订阅 WebSocket 数据
   * 只订阅当前周期的 kline（包含头部信息、图表数据、市场数据）
   */
  const subscribeWebSocketData = () => {
    if (!subscribe || !symbol) {
      return;
    }
    
    // 清理旧的订阅
    if (wsUnsubscribeRefs.current.kline) {
      wsUnsubscribeRefs.current.kline();
      wsUnsubscribeRefs.current.kline = null;
    }
    
    // 订阅当前周期的 kline 数据
    // kline 事件包含：headerData（头部信息）、klineData（图表数据）、exchangesPriceData（市场数据）
    subscribeCurrentPeriodKline();
  };

  /**
   * 订阅当前周期的 Kline 数据
   */
  const subscribeCurrentPeriodKline = () => {
    if (!subscribe || !symbol) return;
    
    // 周期映射：hour -> 1h, day -> 1d, week -> 1w, month -> 1M
    const periodMap = {
      hour: '1h',
      day: '1d',
      week: '1w',
      month: '1M'
    };
    
    const currentPeriod = chartData.current.active || 'hour';
    const period = periodMap[currentPeriod];
    
    // 清理旧的 kline 订阅
    if (wsUnsubscribeRefs.current.kline) {
      wsUnsubscribeRefs.current.kline();
    }
    
    // 订阅新周期
    const unsubKline = subscribe(
      {
        type: CHANNEL_TYPES.KLINE,
        symbols: [symbol],
        params: { 
          period: period,
          limit: 100
        }
      },
      (data) => {
        // 传递 period（'1h', '1d' 等）而不是 currentPeriod（'hour', 'day' 等）
        handleKlineData(data, period);
      }
    );
    wsUnsubscribeRefs.current.kline = unsubKline;
  };
  
  /**
   * 清理 WebSocket 订阅
   * 注意：只取消订阅，不断开 WebSocket 连接（连接由全局 Context 管理）
   */
  const cleanupWebSocketSubscriptions = () => {
    if (wsUnsubscribeRefs.current.kline) {
      try {
        wsUnsubscribeRefs.current.kline();
        wsUnsubscribeRefs.current.kline = null;
      } catch (error) {
        // 忽略取消订阅时的错误
      }
    }
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
   * @param {Object} data - WebSocket 返回的完整数据对象
   * @param {string} period - 周期（'1h', '1d', '1w', '1M'）
   */
  const handleKlineData = (data, period) => {
    if (!data || !data.data) {
      console.warn('[Detail] handleKlineData: 数据为空', data);
      return;
    }
    
    console.log('[Detail] ========== 处理 kline 事件数据 ==========');
    console.log('[Detail] 周期:', period);
    
    const wsData = data.data;
    
    // 1. 处理头部信息数据（headerData）
    if (wsData.headerData) {
      console.log('[Detail] 更新头部信息');
      handleKlineHeaderData(wsData.headerData);
    }
    
    // 2. 处理 K线图表数据（klineData）
    if (wsData.klineData) {
      console.log('[Detail] 更新图表数据');
      handleKlineChartData(wsData.klineData, period);
    }
    
    // 3. 处理市场行情数据（exchangesPriceData）
    if (wsData.exchangesPriceData) {
      console.log('[Detail] 更新市场行情数据');
      handleKlineMarketData(wsData.exchangesPriceData);
    }
    
    console.log('[Detail] ========== kline 事件数据处理完成 ==========');
  };

  /**
   * 处理 kline 事件的头部数据
   */
  const handleKlineHeaderData = (headerData) => {
    // 构建头部信息数据结构
    // 确保所有字段都是字符串类型，便于渲染
    const coin_info_data = {
      symbol: String(headerData.symbol || ''),
      name: String(headerData.name || ''),
      url: String(headerData.url || ''),
      currentPrice: String(headerData.currentPrice || '0'),
      priceChange_24h: String(headerData.priceChange_24h || '0'),
      priceChangePercentage_24h: String(headerData.priceChangePercentage_24h || '0%'),
      marketCapRank: headerData.marketCapRank,
      marketCap: String(headerData.marketCap || '0'),
      high_24h: String(headerData.high_24h || '0'),
      low_24h: String(headerData.low_24h || '0'),
      fullyDilutedValuation: String(headerData.fullyDilutedValuation || '0'),
      marketCapChange_24h: String(headerData.marketCapChange_24h || '0'),
      marketCapChangePercentage_24h: String(headerData.marketCapChangePercentage_24h || '0%'),
      athDate: String(headerData.athDate || ''),
      atlDate: String(headerData.atlDate || ''),
      totalVolume: String(headerData.totalVolume || headerData.volume || '0'),
      totalSupply: String(headerData.totalSupply || '0'),
      circulatingSupply: String(headerData.circulatingSupply || '0'),
      ath: String(headerData.ath || '0'),
      athChangePercentage: String(headerData.athChangePercentage || '0%'),
      atl: String(headerData.atl || '0'),
      atlChangePercentage: String(headerData.atlChangePercentage || '0%'),
      isSelfSelected: headerData.isSelfSelected ?? coinInfo?.isSelfSelected
    };
    
    // 构建左侧信息
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
    
    // 构建右侧信息
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
    
    // 更新状态
    setCoinInfoLeft(headerInfoLeft);
    setCoinInfoRight(headerInfoRight);
    setCoinInfo(coin_info_data);
    
    console.log('[Detail] 头部信息已更新:', {
      symbol: coin_info_data.symbol,
      currentPrice: coin_info_data.currentPrice,
      priceChangePercentage_24h: coin_info_data.priceChangePercentage_24h
    });
  };

  /**
   * 处理 kline 事件的图表数据
   */
  const handleKlineChartData = (klineData, period) => {
    // 收到数据后，关闭 loading 状态
    setKlineLoading(false);
    // 首次加载完成
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    // klineData 包含：
    // - hisKlineData: 历史K线数据数组（从新到旧）
    // - realKlineData: 实时K线数据（当前正在形成的K线）
    
    let chartDataArray = [];
    
    // 使用历史K线数据
    // 注意：hisKlineData 是从新到旧排序的，需要反转为从旧到新
    if (klineData.hisKlineData && Array.isArray(klineData.hisKlineData)) {
      chartDataArray = [...klineData.hisKlineData].reverse();
      console.log('[Detail] 历史K线数据已反转（从旧到新）:', {
        原始第一条: klineData.hisKlineData[0]?.dt,
        反转后第一条: chartDataArray[0]?.dt,
        原始最后一条: klineData.hisKlineData[klineData.hisKlineData.length - 1]?.dt,
        反转后最后一条: chartDataArray[chartDataArray.length - 1]?.dt
      });
    }
    
    // 如果有实时K线数据，添加到数组末尾
    if (klineData.realKlineData) {
      // 将实时数据格式转换为与历史数据一致
      const timestamp = klineData.realKlineData.timestamp;
      let dtValue;
      
      // 验证并转换时间戳
      if (timestamp) {
        const date = new Date(timestamp);
        // 检查日期是否有效
        if (!isNaN(date.getTime())) {
          dtValue = date.toISOString();
        } else {
          console.warn('[Detail] 实时数据时间戳无效:', timestamp);
          dtValue = new Date().toISOString(); // 使用当前时间作为后备
        }
      } else {
        dtValue = new Date().toISOString(); // 使用当前时间作为后备
      }
      
      const realData = {
        dt: dtValue,
        open: klineData.realKlineData.open,
        close: klineData.realKlineData.close,
        high: klineData.realKlineData.high,
        low: klineData.realKlineData.low,
        volume: klineData.realKlineData.volume
      };
      chartDataArray.push(realData);
    }
    
    // 转换为图表格式
    const categoryData = [];
    const values = [];
    
    chartDataArray.forEach((item) => {
      categoryData.push(item.dt || item.time || item.timestamp);
      values.push([
        parseFloat(item.open || item.Open || 0),
        parseFloat(item.close || item.Close || 0),
        parseFloat(item.low || item.Low || 0),
        parseFloat(item.high || item.High || 0)
      ]);
    });
    
    const formattedData = {
      categoryData,
      values
    };
    
    console.log('[Detail] 转换图表数据:', {
      历史数据: klineData.hisKlineData?.length || 0,
      实时数据: klineData.realKlineData ? 1 : 0,
      总数据量: chartDataArray.length,
      period: period
    });
    
    // 周期映射：'1h' -> 'hour', '1d' -> 'day' 等
    const periodMap = {
      '1h': 'hour',
      '1d': 'day',
      '1w': 'week',
      '1M': 'month'
    };
    
    const key = periodMap[period];
    if (!key) {
      console.warn('[Detail] handleKlineChartData: 未知周期', period);
      return;
    }
    
    // 保存到 chartData
    chartData.current[key] = {
      data: formattedData,
      type: 'kline'
    };
    
    console.log(`[Detail] 已更新 ${key} 周期的图表数据`);
    
    // 如果是当前激活的周期，立即渲染
    if (chartData.current.active === key) {
      console.log('[Detail] 是当前激活周期，准备渲染图表');
      // 使用 setTimeout 确保图表引用已经初始化
      // 如果图表还没准备好，会在短暂延迟后重试
      const tryRender = (retries = 3) => {
        if (chartRef.current) {
          console.log('[Detail] 图表引用已就绪，立即渲染');
          renderCurrentChart();
        } else if (retries > 0) {
          console.log(`[Detail] 图表引用未就绪，等待后重试 (剩余重试次数: ${retries})`);
          setTimeout(() => tryRender(retries - 1), 100);
        } else {
          console.warn('[Detail] 图表引用始终未就绪，渲染失败');
        }
      };
      tryRender();
    }
  };

  /**
   * 处理 kline 事件的市场数据
   */
  const handleKlineMarketData = (exchangesPriceData) => {
    // exchangesPriceData 是各交易所的价格数据数组
    if (!Array.isArray(exchangesPriceData)) {
      console.warn('[Detail] exchangesPriceData 不是数组');
      return;
    }
    
    // 转换数据格式，与 HTTP 返回的格式保持一致
    const tempData = exchangesPriceData.map((item) => {
      return {
        title: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.exchanges}</View>,
        last: item.last,
        price24h: <HighlightArea value={item.price24h} />,
        vol: item.vol,
        usd: item.usd
      }
    });
    
    // 更新市场行情数据
    setCoinMarket({
      length: tempData.length,
      data: tempData
    });
    
    console.log('[Detail] 市场行情已更新:', {
      交易所数量: tempData.length,
      数据: tempData
    });
  };

  // 头部（HTTP 回退）
  const headRequest = async () => {
    // 只有在允许使用HTTP降级时才执行
    if (!useHttpFallbackRef.current) {
      console.log('[Detail] WebSocket正在使用中，不执行HTTP请求 - headRequest');
      return;
    }
    
    console.log('[Detail] 使用HTTP降级模式获取头部数据');
    
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
    
    // HTTP轮询由 startHttpFallback 统一管理，无需在此处单独设置
  };
  // K线（HTTP 回退）
  const kLineRequest = async () => {
    // 只有在允许使用HTTP降级时才执行
    if (!useHttpFallbackRef.current) {
      console.log('[Detail] WebSocket正在使用中，不执行HTTP请求 - kLineRequest');
      return;
    }
    
    console.log('[Detail] 使用HTTP降级模式获取K线数据');
    
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
      setKlineLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
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
      setKlineLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
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
      setKlineLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
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
      setKlineLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
    
    // HTTP轮询由 startHttpFallback 统一管理，无需在此处单独设置
  };

  // 市场（HTTP 回退）
  const marketRequest = async () => {
    // 只有在允许使用HTTP降级时才执行
    if (!useHttpFallbackRef.current) {
      console.log('[Detail] WebSocket正在使用中，不执行HTTP请求 - marketRequest');
      return;
    }
    
    console.log('[Detail] 使用HTTP降级模式获取市场数据');
    
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
    
    // HTTP轮询由 startHttpFallback 统一管理，无需在此处单独设置
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
    console.log('[Detail] ========== 页面卸载 (useUnload) ==========');
    
    // 清理 WebSocket 订阅
    cleanupWebSocketSubscriptions();
    
    // 清除HTTP轮询定时器
    if (pollingTimerRef.current) {
      console.log('[Detail] 停止 HTTP 轮询');
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    // 清除WebSocket连接超时定时器
    if (wsConnectionTimeoutRef.current) {
      console.log('[Detail] 清除 WebSocket 连接超时定时器');
      clearTimeout(wsConnectionTimeoutRef.current);
      wsConnectionTimeoutRef.current = null;
    }
    
    // 销毁图表
    if (chartRef.current) {
      try {
        chartRef.current.dispose();
      } catch (error) {
        console.warn('[Detail] 图表销毁失败:', error);
      }
    }
    
    console.log('[Detail] ========== 页面卸载完成 ==========');
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
    
    // 设置 loading 状态
    setKlineLoading(true);
    
    chartData.current.active = value;
    setActiveKey(value);
    
    // 如果当前周期已有数据，立即渲染并关闭 loading
    if (chartData.current[value]?.data) {
      renderCurrentChart();
      setKlineLoading(false);
    }
    
    // 如果 WebSocket 已连接，切换周期时重新订阅 kline
    if (wsConnectionStatusRef.current === 'connected' && isConnected && isAuthenticated) {
      console.log('[Detail] 切换周期，重新订阅 kline:', value);
      subscribeCurrentPeriodKline();
    } else {
      // 如果 WebSocket 未连接，使用 HTTP 获取数据
      console.log('[Detail] WebSocket 未连接，使用 HTTP 获取数据');
      kLineRequest();
    }
    
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
    jump2DataPage('landscapechart', 'chartData', { ...chartData.current, forceType: chartTypeRef.current });
  };

  const jump2Alert = () => {
    setOneClickAlarmMode('config');
    setOneClickAlarmOpen(true);
  };

  const overlayOpen = oneClickAlarmOpen || exchangePickerOpen;

  const handleGoTrade = () => {
    setExchangePickerOpen(true);
  };

  const handleSelectExchange = (exchangeId) => {
    const map = {
      binance: 'https://www.bsmkweb.cc/register?ref=195208591',
      okx: 'https://www.growthhivex.com/join/12214659',
      bitget: 'https://partner.bitget.com/bg/7RMWVR',
      gate: 'https://www.gate.io/signup/AgBGFwxa',
    };
    const url = map[exchangeId];
    setExchangePickerOpen(false);
    if (!url) return;
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none', duration: 2500 });
      },
    });
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

  // 显示骨架屏（首次加载且数据未就绪时）
  // 只有首次加载且数据未就绪时才显示骨架屏，切换周期时不显示
  // TODO: 暂时禁用骨架屏
  // const currentPeriodData = chartData.current[chartData.current.active];
  // const isDataReady = coinInfo && currentPeriodData?.data;
  // 
  // if (isInitialLoad && !isDataReady) {
  //   return <SkeletonPage config={detailPageSkeletonConfig} />;
  // }

  return (
    <>
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
          <View className='chartBox detail-kline-large' style={{ position: 'relative' }} hidden={overlayOpen}>
            <View className='chart-arrawsalt detail-landscape-btn' onClick={jump2Land}>
              <IconFont name='arrawsalt' size={30} color='#fff' />
            </View>
            {/* K线数据加载中显示 loading */}
            {klineLoading && (
              <View className='chart-loading-wrapper'>
                <GardenLoading />
              </View>
            )}
            <ec-canvas 
              canvas-id="mychart-kline" 
              ec={ec} 
              style={{opacity: klineLoading ? 0.3 : 1}}
            ></ec-canvas>
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
      <FloatingRobot 
        message={`想听听我对${symbol}的看法吗？`}
        targetPath="/packages/robot/index"
        startDelay={500}
        showDuration={5000}
        autoPlay={true}
        showOnSelector=".marketBox"
      />
    </View>
    {!overlayOpen ? (
    <View className='footer-list'>
      <View className='footer-left'>
        <View className='footer-item'>
          <View className='footer-icon-slot'>
            <AddCollect
              variant='footer'
              isOwn={coinInfo?.isSelfSelected || false}
              symbol={symbol}
            />
          </View>
          <View className='footer-text'>加自选</View>
        </View>
        <View className='footer-item' onClick={jump2Community}>
          <View className='footer-icon-slot'>
            <Image className='footer-icon' src={communityIcon} mode='aspectFit' />
          </View>
          <View className='footer-text'>社区</View>
        </View>
      </View>
      <View className='footer-right'>
        <View className='alarm-pill'>
          <View className='alarm-config' onClick={jump2Alert}>配置告警</View>
          <View
            className='alarm-start'
            onClick={() => {
              setOneClickAlarmMode('oneClick');
              setOneClickAlarmOpen(true);
            }}
          >
            立即开启
          </View>
        </View>
        <View className='trade-btn-mobile' onClick={handleGoTrade}>去交易</View>
      </View>
    </View>
    ) : null}
      <OneClickAlarmModal
        open={oneClickAlarmOpen}
        mode={oneClickAlarmMode}
        symbol={symbol}
        onClose={() => setOneClickAlarmOpen(false)}
        onConfirm={() => setOneClickAlarmOpen(false)}
        onSkip={() => setOneClickAlarmOpen(false)}
      />
      <ExchangePickerModal
        open={exchangePickerOpen}
        symbol={symbol}
        onClose={() => setExchangePickerOpen(false)}
        onSelect={handleSelectExchange}
      />
    </>
  )
}




