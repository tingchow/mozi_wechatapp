import { View, Image, Button, ScrollView } from '@tarojs/components';
import { useState, useRef, useCallback, useEffect } from 'react';
import Taro, { useDidShow, useDidHide, useLoad, useShareAppMessage } from '@tarojs/taro';
import { Grid } from 'antd-mobile';
import { Layout } from '../../components/Layout';
import { TabBar } from 'antd-mobile';
import { MoziGrid } from '../../components/MoziGrid';
import { MoziCard } from '../../components/MoziCard';
import { RankGrid } from './components/RankGrid';
import { ComplexList } from '../../components/ListCom/ComplexList';
import { HighlightArea } from '../../components/HighlightArea';
import './index.less';
import { jump2List, jump2NoTab } from '../../utils/core';
import { Interface, LOOPTIME } from '../../utils/constants';
import { request } from '../../utils/request';
import { AddCollect } from '../../components/AddCollect';
import { AddMonitor } from '../../components/AddMonitor';
// 懒加载 MarketOverview，避免首包引入体积大的模块
let LazyMarketOverview = null;
import isEmpty from 'lodash/isEmpty';


const MarketTitle = ({url, symbol, totalVolume}) => {
  return (
    <View className='rankTitle'>
      <Image className='rankImg' mode='aspectFit' src={url} />
      <View>
        <View className='rankCoin'>{symbol}</View>
        <View className='rankCoinDesc'>{totalVolume}</View>
      </View>
    </View>
  );
};

const MarketDesc = ({currentPrice, priceChange24h}) => {
  return (
    <View className='rankDesc'>
      <View className='rankPrice'>{currentPrice}</View>
      <View className={`rankPriceChange ${String(priceChange24h).includes('-')? 'rankRed': 'rankGreen'}`}>{priceChange24h}</View>
    </View>
  );
};

export default function Find() {

  const needLoop = useRef(true);

  const [pageActiveKey, setPageActiveKey] = useState('market');
  const [marketLoading, setMarketLoading] = useState(true);
  const [ needLogin, setLogin ] = useState(false);

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  useDidShow(() => {
    const app = Taro.getApp();
    if (app.findType) {
      setPageActiveKey(app.findType);
      delete app.findType;
    }
    needLoop.current = true;
  });

  useDidHide(() => {
    needLoop.current = false;
  });

  const pageActiveClick = useCallback((key) => {
    setPageActiveKey(key);
  });

  // 自选处理
  const [ my_own, setOwn ] = useState([]);
  const [ ownLoading, setOwnLoading] = useState(true);
  const [isOwnError, setOwnError] = useState(false);

  const selectRequest = async () => {
    const coinSelectRes = await request({
      url: Interface.COIN_SELF
    });

    if (coinSelectRes?.data?.isLogin === false) {
      setLogin(true);
      setOwnLoading(false);
      return;
    }

    if (isEmpty(coinSelectRes?.data)) {
      setOwnError(true);
      return;
    }
    if (coinSelectRes?.data.length === 0) {
      setOwnLoading(false);
      setOwn([]);
      return;
    }

    // if (!self_select.data.isLogin) {
    //   setLogin(true);
    // }

    const temp_self_select = coinSelectRes.data.map((item) => {
      return {
        symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
        last: item.last,
        price24h: <HighlightArea value={item.price24h}></HighlightArea>,
        own: <AddCollect symbol={item.symbol} isOwn={true} />,
        monitor: <AddMonitor symbol={item.symbol} />,
        key: item.symbol
      };
    });
    setOwn(temp_self_select);
    setOwnLoading(false);
    // setLogin(false);

    setTimeout(() => {
      if (needLoop.current) selectRequest();
    }, LOOPTIME);
  };
  useDidShow(async () => {
    selectRequest();
  });

  // 行情处理
  const [marketData, setMarketData] = useState([]);
  const [isMarketError, setMarketError] = useState(false);
  const [isFinish, setFinish] = useState(false);


  const marketPageNo = useRef(1);
  const marketPageSize = useRef(20);
  const marketPageFinish = useRef(false);

  useDidShow(async () => {
    // const coinData = await cardRequest(Interface.find_coin, {
    //   pageNo: marketPageNo.current,
    //   pageSize: marketPageSize.current
    // });

    const coinData = await request({
      url: Interface.find_coin,
      data: {
        pageNo: marketPageNo.current,
        pageSize: marketPageSize.current
      }
    });
    if (isEmpty(coinData?.data?.list)) {
      setMarketError(true);
      return;
    }
    // if (coinData.data.list.length === 0) {
    //   setMarketError(true);
    //   return;
    // }
    const tempFindCoin = coinData.data.list.map((item) => {
      return {
        coin: <MarketTitle url={item.url} symbol={item.symbol} totalVolume={item.totalVolume} />,
        desc: <MarketDesc currentPrice={item.currentPrice} priceChange24h={item.priceChange24h} />,
        priceChangePercentage24h: <HighlightArea value={item.priceChangePercentage24h}></HighlightArea>,
        key: item.symbol
      };
    });
    setMarketData(tempFindCoin);
    setMarketLoading(false);
  }, []);

  const loadMore = async (e) => {
    if (marketPageFinish.current) return;

    const coinData = await request({
      url: Interface.find_coin,
      data: {
        pageNo: ++marketPageNo.current,
        pageSize: marketPageSize.current
      }
    });

    if (marketPageNo.current * marketPageSize.current >= coinData.data.pageCount) {
      marketPageFinish = true;
      setFinish(true);
    }
    const tempFindCoin = coinData.data.list.map((item) => {
      return {
        coin: <MarketTitle url={item.url} symbol={item.symbol} totalVolume={item.totalVolume} />,
        desc: <MarketDesc currentPrice={item.currentPrice} priceChange24h={item.priceChange24h} />,
        priceChangePercentage24h: <HighlightArea value={item.priceChangePercentage24h}></HighlightArea>,
        key: item.symbol
      };
    });
    setMarketData([...marketData, ...tempFindCoin]);
    
  };

  const addOwn = () => {
    jump2NoTab('search');
  };

  // 排行处理
  // 交易所排行
  const [exchangeData, setExchangeData] = useState({
    exchangeSelect: [],
    exchangeArr: []
  });
  const [isExchangeError, setExchangeError] = useState(false);
  const [isExchangeLoading, setExchangeLoading] = useState(true);
  const exchangeArr = useRef([]);

  // 过滤交易所名称中的.com，避免文字过长溢出
  const sanitizeExchangeName = (name) => {
    if (!name) return '';
    try {
      return String(name).replace(/\.com/ig, '');
    } catch (e) {
      return name;
    }
  };

  // 热门交易所
  const exchangeRequest = async () => {
    const exchangeSpot = await request({
      url: Interface.hot_exchange,
      data: {
        type: 'SPOT'
      }
    });
    const exchangeFutures = await request({
      url: Interface.hot_exchange,
      data: {
        type: 'Futures'
      }
    });
    // console.log('coinData', coinData?.data);
    if (isEmpty(exchangeSpot.data) && isEmpty(exchangeFutures.data)) {
      setExchangeError(true);
      return;
    }
    let tempExchangeSpot = null;
    let tempExchangeFutures = null;
    if (!isEmpty(exchangeSpot.data)) {
      tempExchangeSpot = exchangeSpot.data.slice(0, 3).map((item) => {
        const showName = sanitizeExchangeName(item.exchange);
        return {
          exchange: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{showName}</View>,
          usd: item.usd,
          markets: item.markets,
          coins: item.coins,
          img: item.url // 添加img字段用于排名显示
        };
      });
    }
    if (!isEmpty(exchangeFutures.data)) {
      tempExchangeFutures = exchangeFutures.data.slice(0, 3).map((item) => {
        const showName = sanitizeExchangeName(item.exchange);
        return {
          exchange: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{showName}</View>,
          usd: item.usd,
          markets: item.markets,
          coins: item.coins,
          img: item.url // 添加img字段用于排名显示
        }
      });
    }

    const exchangeSelect = [];
    // const exchangeArr = [];
    if (tempExchangeSpot) {
      exchangeArr.current.push(tempExchangeSpot);
      exchangeSelect.push('现货');
    }
    if (tempExchangeFutures) {
      exchangeArr.current.push(tempExchangeFutures);
      exchangeSelect.push('衍生品');
    }
    setExchangeData({
      exchangeArr: exchangeArr.current[0],
      exchangeSelect,
    });
    setExchangeLoading(false);

    setTimeout(() => {
      if (needLoop.current) exchangeRequest();
    }, LOOPTIME);
  };
  
  useLoad(async () => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });
    if (!LazyMarketOverview) {
      const mod = await import('../../components/MarketOverview');
      LazyMarketOverview = mod.MarketOverview || mod.default;
    }
  });

  useDidShow(() => {
    exchangeRequest();
  });

  const exchangePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    // 添加防护性检查，确保数组和索引都存在
    if (exchangeArr.current && exchangeArr.current[idx]) {
      setExchangeData({
        ...exchangeData,
        exchangeArr: exchangeArr.current[idx],
      });
    }
  };

  // 涨幅排行
  const dimArr = ['1_day', '1_week', '1_month', '1_year'];
  const dimRequestData = () => {
    return dimArr.map((item) => {
      return {
        dim: item
      }
    });
  };
  const pickArr = ['1天', '1周', '1月', '1年']
  // 涨幅详情
  const [priceData, setPriceData] = useState({
    priceSelect: [],
    priceArr: []
  });
  const [isPriceError, setPriceError] = useState(false);
  const [isPriceLoading, setPriceLoading] = useState(true);
  const priceArr = useRef([]);

  
  const priceSelect = [];

  // 涨幅
  const upPriceRequest = async () => {
    priceArr.current = []; // 清空数组
    const tempPriceSelect = [];
    
    for (let i = 0; i < dimArr.length; i++) {
      const price = await request({
        url: Interface.price_change,
        data: {
          dim: dimArr[i]
        }
      });

      let tempPrice = null;
      
      if (!isEmpty(price.data)) {
        tempPrice = price.data.slice(0, 3).map((item) => {
          return {
            symbol: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            priceRange: item.priceRange,
            img: item.url,
            key: item.symbol
          };
        });
      }
      if (tempPrice) {
        priceArr.current.push(tempPrice);
        tempPriceSelect.push(pickArr[i]);
      }
      
    }
    if (priceArr.current.length === 0) {
      setPriceError(true);
      return;
    }
    setPriceData({
      priceArr: priceArr.current[0],
      priceSelect: tempPriceSelect,
    });
    setPriceLoading(false);
    setTimeout(() => {
      if (needLoop.current) upPriceRequest();
    }, LOOPTIME);
  };
  useDidShow(() => {
    upPriceRequest();
  });

  const pricePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    // 添加防护性检查，确保数组和索引都存在
    if (priceArr.current && priceArr.current[idx]) {
      setPriceData({
        ...priceData,
        priceArr: priceArr.current[idx],
      });
    }
  };

  // 跌幅排行
  const downDimArr = ['1_day', '3_day', '5_day', '7_day', '15_day', '1_month', '3_month', '6_month', '1_year'];
  const downDimRequestData = () => {
    return downDimArr.map((item) => {
      return {
        dim: item
      }
    });
  };
  const downPickArr = ['1天', '3天', '5天', '7天', '15天', '1月', '3个月', '6个月', '1年']
  // 涨幅详情
  const [downData, setDownData] = useState({
    downSelect: [],
    downArr: []
  });
  const [isDownError, setDownError] = useState(false);
  const [isDownLoading, setDownLoading] = useState(true);
  const downArr = useRef([]);

  
  const downSelect = [];
  // 跌幅
  const downPriceRequest = async () => {
    downArr.current = []; // 清空数组
    const tempDownSelect = [];
    
    for (let i = 0; i < dimArr.length; i++) {
      const price = await request({
        url: Interface.PRICE_DOWNCHANGE,
        data: {
          dim: dimArr[i]
        }
      });

      let tempPrice = null;
      
      if (!isEmpty(price.data)) {
        tempPrice = price.data.slice(0, 3).map((item) => {
          return {
            symbol: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            priceRange: item.priceRange,
            img: item.url,
            key: item.symbol
          };
        });
      }
      if (tempPrice) {
        downArr.current.push(tempPrice);
        tempDownSelect.push(pickArr[i]);
      }
      
    }
    if (downArr.current.length === 0) {
      setDownError(true);
      return;
    }
    setDownData({
      downArr: downArr.current[0],
      downSelect: tempDownSelect,
    });
    setDownLoading(false);

    setTimeout(() => {
      if (needLoop.current) downPriceRequest();
    }, LOOPTIME);
  };
  useDidShow(() => {
    downPriceRequest();
  });

  const downPickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    // console.log('priceArr', priceArr);
    // 添加防护性检查，确保数组和索引都存在
    if (downArr.current && downArr.current[idx]) {
      setDownData({
        ...downData,
        downArr: downArr.current[idx],
      });
    }
  };

  // 波幅详情
  const [waveData, setWaveData] = useState({
    waveSelect: [],
    waveArr: []
  });
  const [isWaveError, setWaveError] = useState(false);
  const [isWaveLoading, setWaveLoading] = useState(true);
  const waveArr = useRef([]);

  
  const waveSelect = [];

  // 波幅
  const waveRequest = async () => {
    waveArr.current = []; // 清空数组
    const tempWaveSelect = [];
    
    for (let i = 0; i < dimArr.length; i++) {
      const wave = await request({
        url: Interface.price_wave,
        data: {
          dim: dimArr[i]
        }
      });

      let tempWave = null;
      
      if (!isEmpty(wave.data)) {
        tempWave = wave.data.slice(0, 3).map((item) => {
          return {
            symbol: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            priceRange: item.priceRange,
            img: item.url,
            key: item.symbol
          };
        });
      }
      if (tempWave) {
        waveArr.current.push(tempWave);
        tempWaveSelect.push(pickArr[i]);
      }
      
    }
    if (waveArr.current.length === 0) {
      setWaveError(true);
      return;
    }
    setWaveData({
      waveArr: waveArr.current[0],
      waveSelect: tempWaveSelect,
    });
    setWaveLoading(false);
    setTimeout(() => {
      if (needLoop.current) waveRequest();
    }, LOOPTIME);
  };
  useDidShow(() => {
    waveRequest();
  });

  const wavePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    // 添加防护性检查，确保数组和索引都存在
    if (waveArr.current && waveArr.current[idx]) {
      setWaveData({
        ...waveData,
        waveArr: waveArr.current[idx],
      });
    }
  };

  // 交易额榜
  const intervalsArr = ['today', '7_day', '15_day', '1_month'];
  const tradeRequestData = () => {
    return intervalsArr.map((item) => {
      return {
        intervals: item
      }
    });
  }
  const tradePickArr = ['今日', '7天', '15天', '1月'];
  const [tradeData, setTradeData] = useState({
    tradeSelect: [],
    tradeArr: []
  });
  const [isTradeError, setTradeError] = useState(false);
  const [isTradeLoading, setTradeLoading] = useState(true);
  const tradeArr = useRef([]);

  
  const tradeSelect = [];

  // 交易额
  const tradeRequest = async () => {
    tradeArr.current = []; // 清空数组
    const tempTradeSelect = [];
    
    for (let i = 0; i < intervalsArr.length; i++) {
      const trade = await request({
        url: Interface.coin_trade,
        data: {
          intervals: intervalsArr[i]
        }
      });

      let tempTrade = null;
      
      if (!isEmpty(trade.data)) {
        tempTrade = trade.data.slice(0, 3).map((item) => {
          return {
            symbol: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            usd: item.usd,
            img: item.url,
            key: item.symbol
          };
        });
      }
      if (tempTrade) {
        tradeArr.current.push(tempTrade);
        tempTradeSelect.push(tradePickArr[i]);
      }
      
    }
    if (tradeArr.current.length === 0) {
      setTradeError(true);
      return;
    }
    setTradeData({
      tradeArr: tradeArr.current[0],
      tradeSelect: tempTradeSelect,
    });
    setTradeLoading(false);
    setTimeout(() => {
      if (needLoop.current) tradeRequest();
    }, LOOPTIME);
  };
  useDidShow(() => {
    tradeRequest();
  });

  const tradePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    // 添加防护性检查，确保数组和索引都存在
    if (tradeArr.current && tradeArr.current[idx]) {
      setTradeData({
        ...tradeData,
        tradeArr: tradeArr.current[idx],
      });
    }
  };

  // 新币榜
  // const tradePickArr = ['今日', '3天', '7天', '15天', '1个月'];
  const [xinbiData, setXinbiData] = useState({
    xinbiSelect: [],
    xinbiArr: []
  });
  const [isXinbiError, setXinbiError] = useState(false);
  const [isXinbiLoading, setXinbiLoading] = useState(true);
  const xinbiArr = useRef([]);

  
  const xinbiSelect = [];
  const newCoinRequest = async () => {
    const xinbi = await request({
      url: Interface.NEW_COIN,
      data: {}
    });

    let tempXinbi = null;
    
    if (!isEmpty(xinbi.data)) {
      tempXinbi = xinbi.data.slice(0, 3).map((item) => {
        return {
          symbol: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
          volume_24h: item.volume_24h,
          img: item.url,
          key: item.symbol
        };
      });
    }
    if (tempXinbi) {
      xinbiArr.current = tempXinbi;
    }
    if (xinbiArr.current.length === 0) {
      setXinbiError(true);
      return;
    }
    setXinbiData({
      xinbiArr: xinbiArr.current,
    });
    setXinbiLoading(false);
    setTimeout(() => {
      if (needLoop.current) newCoinRequest();
    }, LOOPTIME);
  };
  useDidShow(() => {
    newCoinRequest();
  });

  // const tradePickChange = (idx) => {
  //   // console.log('pick', e);
  //   // setExchangeIndex(idx);
  //   console.log('tradeArr', tradeArr);
  //   setTradeData({
  //     ...tradeData,
  //     tradeArr: tradeArr.current[idx],
  //   });
  // };

  // 飙升榜详情
  const [upTradeData, setUpTradeData] = useState({
    upTradeSelect: [],
    upTradeArr: []
  });
  const [isUpTradeError, setUpTradeError] = useState(false);
  const [isUpTradeLoading, setUpTradeLoading] = useState(true);
  const upTradeArr = useRef([]);
  const upTradeSelect = [];

  // 飙升请求
  const upTradeRequest = async () => {
    upTradeArr.current = []; // 清空数组
    const tempUpTradeSelect = [];
    for (let i = 0; i < dimArr.length; i++) {
      const wave = await request({
        url: Interface.PRICE_UPTRADE,
        data: {
          intervals: intervalsArr[i]
        }
      });

      let tempWave = null;
      
      if (!isEmpty(wave.data)) {
        tempWave = wave.data.slice(0, 3).map((item) => {
          return {
            symbol: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            priceRange: item.movers,
            img: item.url,
            key: item.symbol
          };
        });
      }
      if (tempWave) {
        upTradeArr.current.push(tempWave);
        tempUpTradeSelect.push(tradePickArr[i]);
      }
      
    }
    if (upTradeArr.current.length === 0) {
      setUpTradeError(true);
      return;
    }
    setUpTradeData({
      upTradeArr: upTradeArr.current[0],
      upTradeSelect: tempUpTradeSelect,
    });
    setUpTradeLoading(false);
    setTimeout(() => {
      if (needLoop.current) upTradeRequest();
    }, LOOPTIME);
  };
  useDidShow(() => {
    upTradeRequest();
  });

  const upTradePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    // console.log('waveArr', waveArr);
    // 添加防护性检查，确保数组和索引都存在
    if (upTradeArr.current && upTradeArr.current[idx]) {
      setUpTradeData({
        ...upTradeData,
        upTradeArr: upTradeArr.current[idx],
      });
    }
  };


  return (
    <View className='findPage'>
      <TabBar className='tabContainer' activeKey={pageActiveKey} onChange={pageActiveClick}>
        <TabBar.Item key='own' title='自选' />
        <TabBar.Item key='market' title='行情' />
        <TabBar.Item key='rank' title='排行榜' />
      </TabBar>
      {
        pageActiveKey === 'own' && (
          <View className='ownBox'>
            <Layout isLoading={ownLoading} isError={isOwnError} needLogin={needLogin} loginCallback={selectRequest}>
              {
                my_own.length === 0 ? (
                  <Button className='addOwnBtn' onClick={addOwn}>添加自选</Button>
                ): (
                  <>
                    <Grid className='gridTitle' columns={5}>
                      {
                        ['币种', '最新价', '24小时涨幅', '是否自选', '加监控'].map((colNameItem, colNameIndex) => {
                          return <Grid.Item key={colNameIndex} className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
                        })
                      }
                    </Grid>
                    <ComplexList
                      gridTitle={['币种', '最新价', '24小时涨幅', '是否自选', '加自选']}
                      defaultpageSize={20}
                      enableLoadMore={false}
                      data={my_own}
                      isFinish={true}
                      hideTitle={true}
                    />
                  </>
                )
              }
              
            </Layout>
          </View>
        )
      }
      {
        pageActiveKey === 'market' && (
        <>
          {/* 市场概况横向滑动卡片 - 懒加载 */}
          {LazyMarketOverview && <LazyMarketOverview />}
          
          <View className='marketBox'>   
            <Layout isLoading={marketLoading} isError={isMarketError}>
            <Grid className='gridTitle' columns={3}>
              {
                ['币种/市值', '最新价格/24H价格变化', '24H价格变化'].map((colNameItem, colNameIndex) => {
                  return <Grid.Item key={colNameIndex} className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
                })
              }
            </Grid>
            <ComplexList
              gridTitle={['币种/市值', '最新价格/24H价格变化', '24H价格变化']}
              defaultpageSize={20}
              enableLoadMore={true}
              data={marketData}
              loadMore={loadMore}
              isFinish={isFinish}
              hideTitle={true}
            />

          </Layout>
          </View>
        </>
        )
      }
      {
        pageActiveKey === 'rank' && (
        <View
          className='rank'
        >
          {/* 交易所排行榜 */}
          <Layout isLoading={isExchangeLoading} isError={isExchangeError}>
            <MoziCard
              title={<View className='rank-title title-with-range-bg'><View>交易所排行榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              type='tabs'
              selectArr={exchangeData.exchangeSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.hot_exchange,
                  requestData: [{
                    type: 'SPOT'
                  }, {
                    type: 'Futures'
                  }],
                  gridTitle: ['交易所', '24H交易量', '市场', '货币'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'exchange']
                  }, {
                    type: 'Text',
                    data: 'usd'
                  }, {
                    type: 'Text',
                    data: 'markets'
                  }, {
                    type: 'Text',
                    data: 'coins'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '交易所排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: exchangeData.exchangeSelect
                });
              }}
              pickChange={exchangePickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.hot_exchange,
                  requestData: [{
                    type: 'SPOT'
                  }, {
                    type: 'Futures'
                  }],
                  gridTitle: ['交易所', '24H交易量', '市场', '货币'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'exchange']
                  }, {
                    type: 'Text',
                    data: 'usd'
                  }, {
                    type: 'Text',
                    data: 'markets'
                  }, {
                    type: 'Text',
                    data: 'coins'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '交易所排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: exchangeData.exchangeSelect
                });
              }}>
                <MoziGrid
                  length={4}
                  colName={['交易所', '24H交易量', '市场', '货币']}
                  gridTitleBgColor='transparent'
                  showRanking={true}
                  className='exchange-ranking-grid'
                  // hideTitle={false}
                  gridContent={exchangeData.exchangeArr}
                >
                </MoziGrid>
              </View>
              
            </MoziCard>
          </Layout>

          {/* 涨幅榜 */}
          <Layout isLoading={isPriceLoading} isError={isPriceError}>
            <MoziCard
              title={<View className='rank-title title-with-range-bg'><View>涨幅榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              type='tabs'
              selectArr={priceData.priceSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.price_change,
                  requestData: dimRequestData(),
                  gridTitle: ['币种', '最新价','涨幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'priceRange'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '涨幅排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: priceData.priceSelect
                });
              }}
              pickChange={pricePickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.price_change,
                  requestData: dimRequestData(),
                  gridTitle: ['币种', '最新价','涨幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'priceRange'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '涨幅排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: priceData.priceSelect
                });
              }}>
                <RankGrid
                  length={2}
                  colName={['币种', '涨幅']}
                  gridContent={priceData.priceArr}
                />
              </View>
              
            </MoziCard>
          </Layout>

          {/* 跌幅榜 */}
          <Layout isLoading={isDownLoading} isError={isDownError}>
            <MoziCard
              title={<View className='rank-title title-with-range-bg'><View>跌幅榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              type='tabs'
              selectArr={downData.downSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.PRICE_DOWNCHANGE,
                  requestData: dimRequestData(),
                  gridTitle: ['币种', '最新价', '跌幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'priceRange'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '跌幅排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: downData.downSelect
                });
              }}
              pickChange={downPickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.PRICE_DOWNCHANGE,
                  requestData: dimRequestData(),
                  gridTitle: ['币种', '最新价', '跌幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'priceRange'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '跌幅排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: downData.downSelect
                });
              }}>
                <RankGrid
                  length={2}
                  colName={['币种', '跌幅']}
                  gridContent={downData.downArr}
                />
              </View>
              
            </MoziCard>
          </Layout>

          {/* 波幅榜 */}
          <Layout isLoading={isWaveLoading} isError={isWaveError}>
            <MoziCard
              title={<View className='rank-title title-with-range-bg'><View>波幅榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              type='tabs'
              selectArr={waveData.waveSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.price_wave,
                  requestData: dimRequestData(),
                  gridTitle: ['币种', '最新价', '波幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'priceRange'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '波幅排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: waveData.waveSelect
                });
              }}
              pickChange={wavePickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.price_wave,
                  requestData: dimRequestData(),
                  gridTitle: ['币种', '最新价', '波幅', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'priceRange'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '波幅排行榜',
                  rankName: 'Top100',
                  rankDesc: '实时更新',
                  selectArr: waveData.waveSelect
                });
              }}>
                <RankGrid
                  length={2}
                  colName={['币种', '波幅']}
                  gridContent={waveData.waveArr}
                />
              </View>
            </MoziCard>
          </Layout>

          {/* 成交额榜 */}
          <Layout isLoading={isTradeLoading} isError={isTradeError}>
            <MoziCard
              title={<View className='rank-title title-with-range-bg'><View>成交额榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              type='tabs'
              customStyle={{ '--tabs-width': '320px' }}
              className='trade-rank-card'
              selectArr={tradeData.tradeSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.coin_trade,
                  requestData: tradeRequestData(),
                  gridTitle: ['币种', '成交额', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'usd'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  },{
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '成交额排行榜',
                  rankName: 'Top100',
                  rankDesc: '每天更新',
                  selectArr: tradeData.tradeSelect
                });
              }}
              pickChange={tradePickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.coin_trade,
                  requestData: tradeRequestData(),
                  gridTitle: ['币种', '成交额', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'usd'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  },{
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '成交额排行榜',
                  rankName: 'Top100',
                  rankDesc: '每天更新',
                  selectArr: tradeData.tradeSelect
                });
              }}>
                <RankGrid
                  length={2}
                  colName={['币种', '成交额']}
                  gridContent={tradeData.tradeArr}
                />
              </View>
            </MoziCard>
          </Layout>

          {/* 新币榜 */}
          <Layout isLoading={isXinbiLoading} isError={isXinbiError}>
            <MoziCard
              title={<View className='rank-title'><View>新币榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              // type='select'
              // selectArr={xinbiData.xinbiSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.NEW_COIN,
                  requestData: {},
                  gridTitle: ['币种', '最新价', '幅度', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'volume_24h'
                  }, {
                    type: 'HighlightArea',
                    data: 'price_24h'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '新币排行榜',
                  rankName: 'Top100',
                  rankDesc: '每天更新',
                  showHeader: true,
                  // selectArr: xinbiData.tradeSelect
                });
              }}
              // pickChange={tradePickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.NEW_COIN,
                  requestData: {},
                  gridTitle: ['币种', '最新价', '幅度', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'volume_24h'
                  }, {
                    type: 'HighlightArea',
                    data: 'price_24h'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '新币排行榜',
                  rankName: 'Top100',
                  rankDesc: '每天更新',
                  showHeader: true,
                  // selectArr: tradeData.tradeSelect
                });
              }}>
                <RankGrid
                  length={2}
                  colName={['币种', '最新价']}
                  gridContent={xinbiData.xinbiArr}
                />
              </View>
            </MoziCard>
          </Layout>

          {/* 飙升榜 */}
          <Layout isLoading={isUpTradeLoading} isError={isUpTradeError}>
            <MoziCard
              title={<View className='rank-title title-with-range-bg'><View>飙升榜</View><Image className='rank-arrow' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/find/range-arrow.png'} /></View>}
              type='tabs'
              selectArr={upTradeData.upTradeSelect}
              callback={() => {
                jump2List({
                  interFace: Interface.PRICE_UPTRADE,
                  requestData: tradeRequestData(),
                  gridTitle: ['币种', '最新价', '增长值', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'movers'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '飙升榜排行榜',
                  rankName: 'Top100',
                  rankDesc: '每天更新',
                  selectArr: upTradeData.upTradeSelect
                });
              }}
              pickChange={upTradePickChange}
            >
              <View onClick={() => {
                jump2List({
                  interFace: Interface.PRICE_UPTRADE,
                  requestData: tradeRequestData(),
                  gridTitle: ['币种', '最新价', '增长值', '加自选', '加监控'],
                  gridCon: [{
                    type: 'Img+Text',
                    data: ['url', 'symbol']
                  }, {
                    type: 'Text',
                    data: 'last'
                  }, {
                    type: 'HighlightArea',
                    data: 'movers'
                  }, {
                    type: 'AddCollect',
                    data: ['favorite', 'symbol']
                  }, {
                    type: 'AddMonitor',
                    data: 'symbol'
                  },{
                    type: 'key',
                    data: 'symbol'
                  }, {
                    type: 'img',
                    data: 'url'
                  }],
                  rankTitle: '飙升榜排行榜',
                  rankName: 'Top100',
                  rankDesc: '每天更新',
                  selectArr: upTradeData.upTradeSelect
                });
              }}>
                <RankGrid
                  length={2}
                  colName={['币种', '成交额']}
                  gridContent={upTradeData.upTradeArr}
                />
              </View>
            </MoziCard>
          </Layout>
        </View>
        )
      }
    </View>
  )
}
