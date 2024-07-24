import { View, Image, Button } from '@tarojs/components';
import { useState, useRef, useCallback, useEffect } from 'react';
import Taro, { useDidShow, useLoad } from '@tarojs/taro';
import { Layout } from '../../components/Layout';
import { Login } from '../../components/Login';
import { TabBar } from 'antd-mobile';
import { MoziGrid } from '../../components/MoziGrid';
import { MoziCard } from '../../components/MoziCard';
import { RankGrid } from './components/RankGrid';
import { ComplexList } from '../../components/ListCom/ComplexList';
import { HighlightArea } from '../../components/HighlightArea';
import './index.less';
import { jump2List, jump2NoTab } from '../../utils/core';
import { Interface } from '../../utils/constants';
import { request } from '../../utils/request';
import { AddCollect } from '../../components/AddCollect';
import { isEmpty } from 'lodash';


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

  const [pageActiveKey, setPageActiveKey] = useState('market');
  const [marketLoading, setMarketLoading] = useState(true);
  const [ needLogin, setLogin ] = useState(false);
  // const [market]


  useDidShow(() => {
    const app = Taro.getApp();
    console.log('app', app);
    if (app.findType) {
      setPageActiveKey(app.findType);
      delete app.findType;
    }
    
  });

  const pageActiveClick = useCallback((key) => {
    console.log(key);
    setPageActiveKey(key);
  });

  // 自选处理
  const [ my_own, setOwn ] = useState([]);
  const [ ownLoading, setOwnLoading] = useState(true);
  const [isOwnError, setOwnError] = useState(false);
  useDidShow(async () => {
    // const self_select = await cardRequest(Interface.self_select);

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

    // if (!self_select.data.isLogin) {
    //   setLogin(true);
    // }

    console.log('self_select', coinSelectRes);
    const temp_self_select = coinSelectRes.data.map((item) => {
      return {
        symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
        last: item.last,
        price24h: <HighlightArea value={item.price24h}></HighlightArea>,
        own: <AddCollect symbol={item.symbol} isOwn={true} />,
        key: item.symbol
      };
    });
    setOwn(temp_self_select);
    setOwnLoading(false);
    // setLogin(false);
  });

  const uploadOwn = async () => {
    const coinSelectRes = await request({
      url: Interface.COIN_SELF
    });

    if (isEmpty(coinSelectRes?.data)) {
      setOwnError(true);
      return;
    }

    // if (!coinSelectRes.data.isLogin) {
    //   setLogin(true);
    // }

    console.log('self_select', coinSelectRes);
    const temp_self_select = coinSelectRes.data.map((item) => {
      return {
        symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
        last: item.last,
        price24h: <HighlightArea value={item.price24h}></HighlightArea>,
        own: <AddCollect symbol={item.symbol} isOwn={true} />,
        key: item.symbol
      };
    });
    setOwn(temp_self_select);
    setOwnLoading(false);
  };


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
    console.log('coinData', coinData?.data);
    if (isEmpty(coinData?.data?.list)) {
      console.log('ceshi');
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
    console.log('pageNo', marketPageNo)

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
  
  useLoad(async () => {
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
    console.log('exchageData', exchangeSpot.data)
    if (!isEmpty(exchangeSpot.data)) {
      tempExchangeSpot = exchangeSpot.data.slice(0, 3).map((item) => {
        return {
          exchange: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.exchange}</View>,
          usd: item.usd,
          markets: item.markets,
          coins: item.coins
        };
      });
    }
    if (!isEmpty(exchangeFutures.data)) {
      tempExchangeFutures = exchangeFutures.data.slice(0, 3).map((item) => {
        return {
          exchange: <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={item.url} />{item.exchange}</View>,
          usd: item.usd,
          markets: item.markets,
          coins: item.coins
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
  });

  const exchangePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    setExchangeData({
      ...exchangeData,
      exchangeArr: exchangeArr.current[idx],
    });
  };

  // 涨跌幅排行
  const dimArr = ['1_day', '3_day', '5_day', '7_day', '15_day', '1_month', '3_month', '6_month', '1_year'];
  const pickArr = ['1天', '3天', '5天', '7天', '15天', '1个月', '3个月', '6个月', '1年']
  // 涨幅详情
  const [priceData, setPriceData] = useState({
    priceSelect: [],
    priceArr: []
  });
  const [isPriceError, setPriceError] = useState(false);
  const [isPriceLoading, setPriceLoading] = useState(true);
  const priceArr = useRef([]);

  
  const priceSelect = [];
  useLoad(async () => {
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
        priceSelect.push(pickArr[i]);
      }
      
    }
    if (priceArr.current.length === 0) {
      setPriceError(true);
      return;
    }
    setPriceData({
      priceArr: priceArr.current[0],
      priceSelect,
    });
    setPriceLoading(false);
  });

  const pricePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    console.log('priceArr', priceArr);
    setPriceData({
      ...priceData,
      priceArr: priceArr.current[idx],
    });
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
  useLoad(async () => {
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
        waveSelect.push(pickArr[i]);
      }
      
    }
    if (waveArr.current.length === 0) {
      setWaveError(true);
      return;
    }
    setWaveData({
      waveArr: waveArr.current[0],
      waveSelect,
    });
    setWaveLoading(false);
  });

  const wavePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    console.log('waveArr', waveArr);
    setWaveData({
      ...waveData,
      waveArr: waveArr.current[idx],
    });
  };

  // 交易额榜
  const intervalsArr = ['today', '3_day', '7_day', '15_day', '1_month'];
  const tradePickArr = ['今日', '3天', '7天', '15天', '1个月'];
  const [tradeData, setTradeData] = useState({
    tradeSelect: [],
    tradeArr: []
  });
  const [isTradeError, setTradeError] = useState(false);
  const [isTradeLoading, setTradeLoading] = useState(true);
  const tradeArr = useRef([]);

  
  const tradeSelect = [];
  useLoad(async () => {
    for (let i = 0; i < dimArr.length; i++) {
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
        tradeSelect.push(tradePickArr[i]);
      }
      
    }
    if (tradeArr.current.length === 0) {
      setTradeError(true);
      return;
    }
    setTradeData({
      tradeArr: tradeArr.current[0],
      tradeSelect,
    });
    setTradeLoading(false);
  });

  const tradePickChange = (idx) => {
    // console.log('pick', e);
    // setExchangeIndex(idx);
    console.log('tradeArr', tradeArr);
    setTradeData({
      ...tradeData,
      tradeArr: tradeArr.current[idx],
    });
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
            <Layout isLoading={ownLoading} isError={isOwnError} needLogin={needLogin} loginCallback={uploadOwn}>
              {
                my_own.length === 0 ? (
                  <Button className='addOwnBtn' onClick={addOwn}>添加自选</Button>
                ): (
                  <ComplexList
                    gridTitle={['币种', '最新价', '24小时涨幅', '是否自选']}
                    defaultpageSize={20}
                    enableLoadMore={false}
                    data={my_own}
                    isFinish={true}
                  />
                )
              }
              
            </Layout>
          </View>
        )
      }
      {
        pageActiveKey === 'market' && (
        <View className='marketBox'>
          <Layout isLoading={marketLoading} isError={isMarketError}>
            <ComplexList
              gridTitle={['币种/总交易额', '最新价格/24H价格变化', '24H价格变化']}
              defaultpageSize={20}
              enableLoadMore={true}
              data={marketData}
              loadMore={loadMore}
              isFinish={isFinish}
            />

          </Layout>
        </View>
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
              title={<View className='rankTitle'><View>交易所排行榜</View><View className='rankTitleTime'>实时更新</View></View>}
              type='select'
              selectArr={exchangeData.exchangeSelect}
              callback={() => {
                jump2List({
                  interFace: [Interface.hot_exchange],
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
                  rankName: '交易所排行榜',
                  rankDesc: '实时更新',
                  selectArr: exchangeData.exchangeSelect
                });
              }}
              pickChange={exchangePickChange}
            >
              <MoziGrid
                length={4}
                colName={['交易所', '24H交易量', '市场', '货币']}
                gridContent={exchangeData.exchangeArr}
                // callback={jump2List}
              >
              </MoziGrid>
            </MoziCard>
          </Layout>

          {/* 涨幅榜 */}
          <Layout isLoading={isPriceLoading} isError={isPriceError}>
            <MoziCard
              title={<View className='rankTitle'><View>涨幅榜</View><View className='rankTitleTime'>实时更新</View></View>}
              type='select'
              selectArr={priceData.priceSelect}
              callback={jump2List}
              pickChange={pricePickChange}
            >
              <RankGrid
                length={2}
                colName={['币种', '涨跌幅']}
                gridContent={priceData.priceArr}
                callback={jump2List}
              />
            </MoziCard>
          </Layout>

          {/* 波幅榜 */}
          <Layout isLoading={isWaveLoading} isError={isWaveError}>
            <MoziCard
              title={<View className='rankTitle'><View>波幅榜</View><View className='rankTitleTime'>实时更新</View></View>}
              type='select'
              selectArr={waveData.waveSelect}
              callback={jump2List}
              pickChange={wavePickChange}
            >
              <RankGrid
                length={2}
                colName={['币种', '波幅']}
                gridContent={waveData.waveArr}
                callback={jump2List}
              />
            </MoziCard>
          </Layout>

          {/* 热门交易榜 */}
          {/* <MoziCard
            title={<View className='rankTitle'><View>热门交易榜</View><View className='rankTitleTime'>每天更新</View></View>}
            type='select'
            selectArr={['近1天', '近3天', '近7天']}
            callback={jump2List}
          >
            <RankGrid
              length={2}
              colName={['币种', '热门指数']}
              gridContent={mockRank}
              callback={jump2List}
            />
          </MoziCard> */}

          {/* 成交额榜 */}
          <Layout isLoading={isTradeLoading} isError={isTradeError}>
            <MoziCard
              title={<View className='rankTitle'><View>成交额榜</View><View className='rankTitleTime'>每天更新</View></View>}
              type='select'
              selectArr={tradeData.tradeSelect}
              callback={jump2List}
              pickChange={tradePickChange}
            >
              <RankGrid
                length={2}
                colName={['币种', '成交额']}
                gridContent={tradeData.tradeArr}
                callback={jump2List}
              />
            </MoziCard>
          </Layout>
        </View>
        )
      }
    </View>
  )
}