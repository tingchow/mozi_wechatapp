import { View, Image, ScrollView, Button, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useLoad, useShareAppMessage, useDidShow, useDidHide } from '@tarojs/taro';
import IconFont from '../../components/iconfont';
import { Grid, TabBar, NoticeBar } from 'antd-mobile';
import { useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface, LOOPTIME } from '../../utils/constants';
import { MoziCard } from '../../components/MoziCard';
import { MoziGrid } from '../../components/MoziGrid';
import { SearchInput } from '../../components/SearchInput';
import { Layout } from '../../components/Layout';
import { AddCollect } from '../../components/AddCollect';
import { AddMonitor } from '../../components/AddMonitor';
import { HighlightArea } from '../../components/HighlightArea';
import { MoziTreeMap } from '../../components/MoziChart/TreeMap';
import { PageLogin } from '../../components/PageLogin';
import { Popup } from '../../components/PopLogin'
import { MarketDistribution } from '../../components/MarketDistribution';
import { jump2Detail, jump2Market, jump2List, jump2NoTab } from '../../utils/core';
import './index.less';

// 区块内容
// 导入图片
// 静态图使用 CDN 前缀，提升加载速度
const CDN_PREFIX = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets';
const bullBearRatioIcon = `${CDN_PREFIX}/icon/bull-bear-ratio.png`;
const inventoryIcon = `${CDN_PREFIX}/icon/inventory.png`;
const fundingRateIcon = `${CDN_PREFIX}/icon/funding-rate.png`;
const volumeTransactionIcon = `${CDN_PREFIX}/icon/volume-transaction.png`;
const HomeAlertIcon = `${CDN_PREFIX}/icon/home-alert.png`; // 提醒图标
// 首页背景轮播图（可替换为真实素材）
const HOME_BANNERS = [
  `${CDN_PREFIX}/image/home/banner1.png`,
  `${CDN_PREFIX}/image/home/banner2.png`,
  `${CDN_PREFIX}/image/home/banner3.png`,
];

// 是否显示首页“涨跌分布”组件（隐藏请设为 false）
const SHOW_MARKET_DISTRIBUTION = true;

const area = {
  derivativeArea: {
    title: '合约专区',
    list: [{
      icon: bullBearRatioIcon,
      text: '多空比',
      // path: '跳转地址',
      callback: () => {jump2NoTab('putcallratio')}
    }, {
      icon: inventoryIcon,
      text: '持仓量',
      callback: () => {jump2NoTab('positionsize')}
    }, {
      icon: fundingRateIcon,
      text: '资金费率',
      callback: () => {jump2NoTab('fundingrate')}
    }, {
      icon: volumeTransactionIcon,
      text: '成交额',
      callback: () => {jump2NoTab('tradevol')}
    }]
  },
};

export default function Index() {
  const sysInfo = Taro.getSystemInfoSync?.() || {};
  const statusBarHeight = Number(sysInfo.statusBarHeight || 0);
  const systemStr = String(sysInfo.system || '');
  const isIOS = /iOS|iPhone|iPad/i.test(systemStr);
  const safeTop = isIOS ? statusBarHeight : 0;
  const [ hot_coin, setHotCoin ] = useState(null);
  const [ hot_industry, setHotIndustry ] = useState(null);
  const [ hot_contract, setHotContract ] = useState(null);
  const [ hot_topics, setHotTopics ] = useState(null);
  const [ coinLoading, setCoinLoading ] = useState(true);
  const [ industryLoading, setIndustryLoading ] = useState(true);
  const [ contractLoading, setContractLoading ] = useState(true);
  const [ topicsLoading, setTopicsLoading ] = useState(false);
  const [ lastTopicsLoadTime, setLastTopicsLoadTime ] = useState(null);
  const [ my_own, setOwn ] = useState(null);
  const [ myOwnLoading, setMyOwnLoading ] = useState(false);
  const [ popVis, setPopVis ] = useState(false);
  const [ rankActiveKey, setRankActive ] = useState('zhangfu');
  const [ investmentTab, setInvestmentTab ] = useState('opportunity');
  const needLoop = useRef(true);
  const topicsCacheTimer = useRef(null);

  // 自选接口、涨幅榜、跌幅榜、振幅榜、成交额榜、新币榜、飙升榜
  const footerIfList = [{
    interface: Interface.find_coin,
    data: {
      pageSize: 10,
      pageNo: 1
    }
  }, {
    interface: Interface.price_change,
    data: {
      dim: 'today'
    }
  }, {
    interface: Interface.PRICE_DOWNCHANGE,
    data: {
      dim: 'today'
    }
  }, {
    interface: Interface.price_wave,
    data: {
      dim: 'today'
    }
  }, {
    interface: Interface.coin_trade,
    data: {
      intervals: 'today'
    }
  }, 
  {
    interface: Interface.NEW_COIN,
    data: {}
  }, 
  {
    interface: Interface.PRICE_UPTRADE,
    data: {
      intervals: '7_day'
    }
  }];

  // 全部请求
  const allRequest = async () => {
    // 热门币种
    const coin = await cardRequest(Interface.hot_coin, {
      pageSize: 10
    });
    setHotCoin(coin.data);
    setCoinLoading(false);
    // 热门版块
    const indusry = await cardRequest(Interface.hot_industry, {
      pageSize: 10
    });
    setHotIndustry(indusry.data);
    setIndustryLoading(false);
    // 热门合约
    const contract = await cardRequest(Interface.hot_contract, {
      pageSize: 10
    });
    setHotContract(contract.data);
    setContractLoading(false);

    const tempFooterList = [];

    for (let i = 0; i < footerIfList.length; i++) {
      const itemListData = await cardRequest(footerIfList[i].interface, footerIfList[i].data);

      let tempData = null;
      if (i === 0) {
        // 自选榜，数据额外处理
        tempData = itemListData.data.list.map((item) => {
          return {
            symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            currentPrice: item.currentPrice,
            priceChange24h: <HighlightArea value={item.priceChangePercentage24h}></HighlightArea>,
            own: <AddCollect symbol={item.symbol} isOwn={item.favorite} loginCb={() => {setPopVis(true)}} />,
            monitor: <AddMonitor symbol={item.symbol} />,
            key: item.symbol,
          };
        });
      } else {
        tempData = (itemListData.data?.slice(0, 10) || [] ).map((item) => {
          return {
            symbol: <View className='ownTitle'><Image className='ownImg' mode='aspectFit' src={item.url} />{item.symbol}</View>,
            last: item.last || item.volume_24h,
            priceRange: <HighlightArea value={item.priceRange || item.movers || item.price_24h}></HighlightArea>,
            own: (<AddCollect symbol={item.symbol} isOwn={item.favorite} loginCb={() => {setPopVis(true)}} />),
            monitor: <AddMonitor symbol={item.symbol} />,
            key: item.symbol
          }
        });
      }
      tempFooterList.push(tempData);
    }

    setFooterArr(tempFooterList);
    setFooterLoading(false);
    setTimeout(() => {
      if (needLoop.current) allRequest();
    }, LOOPTIME);
  };

  useLoad(async () => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });
    // allRequest();
  });

  useDidShow(() => {
    needLoop.current = true;
    allRequest();
  });

  useDidHide(() => {
    needLoop.current = false;
    // 清理话题缓存定时器
    if (topicsCacheTimer.current) {
      clearTimeout(topicsCacheTimer.current);
      topicsCacheTimer.current = null;
    }
  });

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  const [footerArr, setFooterArr] = useState([]);
  const [footerLoading, setFooterLoading] = useState(true);

  const go2List = () => {
    const arrIndex = activeArr.indexOf(rankActiveKey);
    const requestdimData = [{
      dim: 'today'
    }, {
      dim: '1_day'
    }, {
      dim: '3_day'
    }, {
      dim: '7_day'
    }, {
      dim: '15_day'
    }, {
      dim: '1_month'
    }];
    const requestintervalData = [{
      intervals: 'today'
    }, {
      intervals: '1_day'
    }, {
      intervals: '3_day'
    }, {
      intervals: '7_day'
    }, {
      intervals: '15_day'
    }, {
      intervals: '1_month'
    }];
    const requestbiaoshengintervalsData = [{
      intervals: '1_day'
    }, {
      intervals: '3_day'
    }, {
      intervals: '7_day'
    }, {
      intervals: '15_day'
    }, {
      intervals: '1_month'
    }];
    const selectArr = ['今日', '1天', '3天', '7天', '15天', '1月'];
    const selectbiaoshengArr = ['1天', '3天', '7天', '15天', '1月'];
    // const  = footerArr[activeArr.indexOf(rankActiveKey)];
    jump2List({
      interFace: footerIfList[arrIndex].interface,
      requestData: arrIndex === 0? {
        pageSize: 100,
        pageNo: 1
      }: arrIndex === 4 || arrIndex === 5? requestintervalData : arrIndex === 6? requestbiaoshengintervalsData: requestdimData,
      gridTitle: colNameArr[arrIndex],
      gridCon: [{
        type: 'Img+Text',
        data: ['url', 'symbol']
      }, {
        type: 'Text',
        data: arrIndex === 0? 'currentPrice':  arrIndex === 6? 'movers': arrIndex === 5? 'volume_24h': 'last'
      }, {
        type: 'HighlightArea',
        data: arrIndex === 0? 'priceChangePercentage24h': arrIndex === 6? 'movers': arrIndex === 4 || arrIndex === 5 ? 'price_24h': 'priceRange'
      }, {
        type: 'AddCollect',
        data: ['favorite', 'symbol']
      }, {
        type: 'AddMonitor',
        data: 'symbol'
      }, {
        type: 'key',
        data: 'symbol'
      }, {
        type: 'img',
        data: 'url'
      }],
      rankTitle: activeArrValue[arrIndex],
      rankName: 'Top100',
      rankDesc: '实时更新',
      selectArr: arrIndex === 6? selectbiaoshengArr: selectArr
    });
  };
  const cardRequest = async (url, data) => {
    const res = await request({
      url,
      data,
    });
    // setHotIndustry(res.data);
    return res;
  };

  // 清理话题缓存
  const clearTopicsCache = () => {
    setHotTopics(null);
    setLastTopicsLoadTime(null);
    if (topicsCacheTimer.current) {
      clearTimeout(topicsCacheTimer.current);
      topicsCacheTimer.current = null;
    }
  };

  // 加载热门话题数据 - 带缓存机制
  const loadHotTopics = async (forceRefresh = false) => {
    const now = Date.now();
    const CACHE_DURATION = 60 * 1000; // 缓存1分钟
    
    // 如果强制刷新，清理缓存
    if (forceRefresh) {
      clearTopicsCache();
    }
    
    // 检查缓存是否有效
    if (!forceRefresh && hot_topics !== null && lastTopicsLoadTime && (now - lastTopicsLoadTime < CACHE_DURATION)) {
      return;
    }
    
    setTopicsLoading(true);
    try {
      const topics = await cardRequest(Interface.HOT_TOPICS_API, {
        pageSize: 10
      });
      setHotTopics(topics.data.data || []);
      setLastTopicsLoadTime(now);
      
      // 清除之前的定时器
      if (topicsCacheTimer.current) {
        clearTimeout(topicsCacheTimer.current);
      }
      
      // 设置缓存清理定时器
      topicsCacheTimer.current = setTimeout(() => {
        setLastTopicsLoadTime(null); // 标记缓存过期
      }, CACHE_DURATION);
      
    } catch (error) {
      setHotTopics([]);
    }
    setTopicsLoading(false);
  };

  const handlePopupConfirm = () => {}

  const jump2Search = () => {
    jump2NoTab('search')
  };

  const rankActiveClick = (value) => {
    setRankActive(value);
  };

  const activeArr = ['zixuan', 'zhangfu', 'diefu', 'zhenfu', 'chengjiaoe', 'xinbi', 'biaosheng'];
  const activeArrValue = ['自选榜', '涨幅榜', '跌幅榜', '波幅榜', '成交额榜', '新币榜', '飙升榜'];
  const colNameArr = [
    ['币种', '最新价', '24小时幅度', '加自选', '加监控'],
    ['币种', '最新价', '24小时幅度', '加自选', '加监控'],
    ['币种', '最新价', '24小时幅度', '加自选', '加监控'],
    ['币种', '最新价', '24小时幅度', '加自选', '加监控'],
    ['币种', '最新成交额', '24小时幅度', '加自选', '加监控'],
    ['币种', '最新价', '24小时幅度', '加自选', '加监控'],
    ['币种', '最新价', '24小时幅度', '加自选', '加监控']
  ];

  // 统一格式化话题时间，去掉 ISO 字符 "T"，兼容时间戳
  const formatTopicTime = (value) => {
    if (!value) return '--';
    if (typeof value === 'string') {
      return value.replace('T', ' ').replace(/Z$/, '');
    }
    if (typeof value === 'number') {
      const d = new Date(value);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    return String(value);
  };
  return (
    <View className='indexBox'>
      {/* 顶部安全区纯背景色 */}
      {safeTop > 0 && (
        <View className='safe-area-top' style={{ height: safeTop }} />
      )}
      {/* 顶部区域：banner + 搜索框（同容器） */}
      <View className='hero-wrap' style={{ paddingTop: safeTop }}>
        {/* 顶部背景轮播 */}
        <View className='bg-banner'>
          <Swiper
            className='bg-banner-swiper'
            circular
            autoplay
            interval={4000}
            duration={500}
          >
            {HOME_BANNERS.map((url, idx) => (
              <SwiperItem key={idx}>
                <Image className='bg-banner-image' src={url} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
          {/* 头部-搜索框（改为相对 bg-banner 定位） */}
          <View className='header' onClick={jump2Search}>
            <View className='searchBox'>
              <View className='searchInput'>请输入搜索的币种</View>
              <View className='searchCancel'>
                <IconFont name='search' size={42} color='#fff' />
                搜索
              </View>
            </View>
          </View>
          {/* 通知条：放入 bg-banner 内，相对其定位 */}
          <View className='notice'>
            <NoticeBar
              className='notice-item'
              content='告别手动盯盘，实时波动随时跟进！开启智能告警配置吧！'
              color='alert'
              wrap
              icon={<Image src={HomeAlertIcon} className='notice-icon' />}
            />
          </View>
        </View>
      </View>

      {/* 合约专区 */}
      <MoziCard
        title={area.derivativeArea.title}
        customStyle={{ borderRadius: '0 0 8px 8px', paddingBottom: '20px',paddingTop: '10px'}}
      >
        <Grid columns={4}>
        {
          area.derivativeArea.list.map((item, index) => {
            return (
              <Grid.Item key={index} className='derivativeItem' onClick={item.callback}>
                <div className='derivativeIcon'>
                  <Image src={item.icon} style={{width: '100px', height: '70px'}} mode='aspectFit' />
                </div>
                <span>{item.text}</span>
              </Grid.Item>
            )
          })
        }
        </Grid>
      </MoziCard>

      {/* 投资机会 */}
      <MoziCard
        customTitle={
          <View className='investment-header'>
            <View className='investment-tabs'>
              <View 
                className={`tab-item ${investmentTab === 'opportunity' ? 'active' : ''}`}
                onClick={() => setInvestmentTab('opportunity')}
              >
                投资机会
              </View>
              <View 
                className={`tab-item ${investmentTab === 'topics' ? 'active' : ''}`}
                onClick={() => {
                  setInvestmentTab('topics');
                  loadHotTopics(); // 切换到话题热榜时加载数据（使用缓存）
                }}
                onLongPress={() => {
                  setInvestmentTab('topics');
                  loadHotTopics(true); // 长按强制刷新
                  
                }}
              >
                话题热榜
              </View>
            </View>
            <View 
              className='more-btn' 
              onClick={() => {
                if (investmentTab === 'topics') {
                  try { Taro.setStorageSync('communityMainTabPreset', 'hot'); } catch (e) {}
                  Taro.switchTab({ url: '/pages/community/index' });
                } else {
                  jump2Market('rank');
                }
              }}
            >
              查看更多 &gt;
            </View>
          </View>
        }
        customStyle={{ backgroundColor: 'transparent' }}
        className="investment-card"
      >
        {investmentTab === 'opportunity' ? (
          <ScrollView scrollX scrollWithAnimation className="investment-scroll" style={{whiteSpace: 'nowrap'}}>
            
            <div className='treemapBox content-card' onClick={() => {jump2List({
              interFace: Interface.hot_coin,
              gridTitle: ['币种', '热门指数', '24H价格变化'],
              gridCon: [{
                type: 'Text',
                data: 'coin'
              }, {
                type: 'Text',
                data: 'hot'
              }, {
                type: 'HighlightArea',
                data: 'priceChangePercent'
              }],
              rankTitle: '热门币种',
              showRanking: true
            })}}>
              <div className='treemapTitle'>热门币种</div>
              <div className='center-loading'>
                <Layout isLoading={coinLoading}>
                  <MoziTreeMap
                    list={hot_coin}
                    name='coin'
                    desc='priceChangePercent'
                  />
                </Layout>
              </div>
            </div>
            <div className='treemapBox content-card' onClick={() => {jump2List({
              interFace: Interface.hot_contract,
              gridTitle: ['合约', '热门指数', '24H价格变化'],
              gridCon: [{
                type: 'Text',
                data: 'coin'
              }, {
                type: 'Text',
                data: 'hot'
              }, {
                type: 'HighlightArea',
                data: 'priceChangePercent'
              }],
              rankTitle: '热门合约',
              showRanking: true
            })}}>
              <div className='treemapTitle'>热门合约</div>
              <Layout isLoading={contractLoading}>
                <MoziTreeMap
                  list={hot_contract}
                  name='coin'
                  desc='priceChangePercent'
                />
              </Layout>
            </div>
            <div className='treemapBox content-card last' onClick={() => {jump2List({
              interFace: Interface.hot_industry,
              gridTitle: ['版块', '24H变化'],
              gridCon: [{
                type: 'Text',
                data: 'section'
              }, {
                type: 'HighlightArea',
                data: 'changes'
              }],
              rankTitle: '热门版块',
              showRanking: true
            })}}>
              <div className='treemapTitle'>热门版块</div>
              <Layout isLoading={industryLoading}>
                <MoziTreeMap
                  // list={mock_hotbankuai.data}
                  list={hot_industry}
                  name='section'
                  desc='changes'
                />
              </Layout>
            </div>
          </ScrollView>
        ) : (
          <ScrollView 
            scrollX 
            scrollWithAnimation 
            className="topics-scroll"
            style={{whiteSpace: 'nowrap'}}
          >
            <View className='topics-content'>
              <Layout isLoading={topicsLoading}>
                <View className='topic-cards'>
                  {hot_topics && hot_topics.length > 0 ? (
                    hot_topics.slice(0, 3).map((topic, index) => {
                      // 根据排名显示不同的奖牌
                      const rankMedals = [
                        `${CDN_PREFIX}/icon/gold.png`,
                        `${CDN_PREFIX}/icon/silver.png`, 
                        `${CDN_PREFIX}/icon/copper.png`
                      ];
                      
                      const hasDesc = Boolean(topic.desc || topic.description);
                      return (
                        <View 
                          className={`topic-card ${hasDesc ? '' : 'no-desc'}`} 
                          key={topic.id || index}
                          onClick={() => {
                            try {
                              Taro.setStorageSync('communityMainTabPreset', 'hot');
                            } catch (e) {}
                            Taro.switchTab({ url: '/pages/community/index' });
                          }}
                        >
                          <View className='topic-rank'>
                            <Image 
                              src={rankMedals[index] || rankMedals[2]} 
                              className='rank-medal' 
                              mode='aspectFit' 
                            />
                          </View>
                          <View className='topic-title'>{topic.title || topic.name}</View>
                          {hasDesc && (
                            <View className='topic-desc'>{topic.desc || topic.description}</View>
                          )}
                          <View className='topic-stats'>
                            <View className='topic-hot'>🔥 {topic.discussionCount || topic.hot || 0} 讨论</View>
                            <View className='topic-date'>{formatTopicTime(topic.createdAt || topic.createTime)}</View>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    // 默认显示加载中或暂无数据
                    <View className='topic-card'>
                      <View className='topic-rank'>
                        <Image src={`${CDN_PREFIX}/icon/gold.png`} className='rank-medal' mode='aspectFit' />
                      </View>
                      <View className='topic-title'>暂无话题</View>
                      <View className='topic-desc'>敬请期待</View>
                      <View className='topic-stats'>
                        <View className='topic-hot'>🔥 0 讨论</View>
                        <View className='topic-date'>--</View>
                      </View>
                    </View>
                  )}
                </View>
              </Layout>
            </View>
          </ScrollView>
        )}
      </MoziCard>

      {/* 涨跌分布（隐藏开关） */}
      {SHOW_MARKET_DISTRIBUTION && <MarketDistribution />}

      {/* 自选 */}
      {/* <View className='own-box'> */}
        <MoziCard
          title='实时榜单'
          // type='more'
          // callback={() => jump2Market('market')}
        >
          <Layout isLoading={footerLoading}>
            <TabBar className='tab-box' activeKey={rankActiveKey} onChange={rankActiveClick}>
              <TabBar.Item key='zixuan' title='自选榜' />
              <TabBar.Item key='zhangfu' title='涨幅榜' />
              <TabBar.Item key='diefu' title='跌幅榜' />
              <TabBar.Item key='zhenfu' title='波幅榜' />
              <TabBar.Item key='chengjiaoe' title='成交额榜' />
              <TabBar.Item key='xinbi' title='新币榜' />
              <TabBar.Item key='biaosheng' title='飙升榜' />
            </TabBar>
            {
              footerArr.length > 0 && (
                <View>
                  <MoziGrid
                    length={5}
                    colName={colNameArr[activeArr.indexOf(rankActiveKey)]}
                    gridContent={footerArr[activeArr.indexOf(rankActiveKey)]}
                    callback={(gridCon) => {jump2Detail(gridCon.key)}}
                    gridTitleBgColor='transparent'
                    className='realtime-rank-large'
                  />
                  <View className='list-more' onClick={go2List}>查看更多 <IconFont name='right' /></View>
                </View>
              )

              
            }
          </Layout>
        </MoziCard>
      {/* </View> */}
      {/* <MoziCard
        title='可能感兴趣'
        type='more'
        callback={() => jump2Market('market')}
      >
        <Layout isLoading={myOwnLoading}>
          <MoziGrid
            length={5}
            colName={['币种', '最新价', '24小时涨幅', '总交易额', '加自选']}
            gridContent={my_own}
            callback={(gridCon) => {jump2Detail(gridCon.key)}}
          />
        </Layout>
      </MoziCard> */}
      
      {/* 首页悬浮机器人图标 */}
      <View className='float-robot-btn' onClick={() => jump2NoTab('robot')}>
        <Image className='robot-icon' src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/AI_Bot.png'} mode='aspectFit' />
      </View>
    </View>
  )
}
