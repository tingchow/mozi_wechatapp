import { useState, useRef } from 'react';
import Taro, { useLoad, useShareAppMessage } from '@tarojs/taro'
import { View } from '@tarojs/components';
import { SimpleList } from '../../components/ListCom/SimpleList';
import { Layout } from '../../components/Layout';
import { LogoLoading } from '../../components/LogoLoading';
import { PageLogin } from '../../components/PageLogin';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';

export default function List() {

  const [listParam, setListParam] = useState({});
  const [data, setData] = useState([]);
  const [readyData, setReadyData] = useState([]);
  const [readyIndex, setReadyIndex] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const [headerImg, setHeaderImg] = useState('');
  const pageNo = useRef(1);
  const pageSize = useRef(100);
  const pageFinish = useRef(false);
  const [ popVis, setPopVis ] = useState(false);
  const [ selectedPick, setSelected ] = useState('');

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });


  useLoad(() => {

    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    });

    const app = Taro.getApp();
    init(app.listParam);
    console.log('app', app);
    if (app.listParam) {
      setListParam(app.listParam);
      // 如果是从可交易平台入口，且没有头图，则使用搜索币种的 logo
      if (app.listParam.fromPlatform && !app.listParam.headerImg) {
        (async () => {
          try {
            const info = await request({
              url: Interface.COIN_INFO,
              data: { coin: app.listParam.searchCoin }
            });
            if (Array.isArray(info?.data) && info.data[0]?.url) {
              setHeaderImg(info.data[0].url);
            }
          } catch (e) {
            // ignore
          }
        })();
      }
      if (Array.isArray(app.listParam.selectArr) && app.listParam.selectArr.length > 0) {
        setSelected(app.listParam.selectArr[0]);
      }
      // 统一开启头部容器（即使没有 tabs 也显示标题区）
      setShowHeader(true);
      delete app.findType;
      
      Taro.setNavigationBarTitle({
        title: app.listParam.rankTitle
      });
    }
    if (listParam.pageSize) {
      pageSize.current = listParam.pageSize;
    }
    
    
  });

  // 初始化获取数据
  const init = async (listParam) => {
    console.log('init', listParam);
    try {
      const requestData = Array.isArray(listParam.requestData) && listParam.requestData.length > 0? listParam.requestData[0]: listParam.requestData;
      const coinData = await request({
        url: listParam.interFace,
        data: {
          ...requestData,
          pageNo: pageNo.current,
          pageSize: pageSize.current
        }
      });
      if (coinData?.data) {
        if (listParam.reponseData) {
          const tmpResData = Object.keys(coinData?.data).map((resData) => {
            return coinData?.data[resData]
          });
          console.log('tmpResData',tmpResData);
          setReadyData(tmpResData);
        } else {
          setData(coinData.data);
        }

        // 若未传入 headerImg：根据首条 symbol 调用 COIN_INFO 获取 logo 作为头图
        if (!listParam.headerImg && !headerImg) {
          try {
            const arr = Array.isArray(coinData.data)
              ? coinData.data
              : (Array.isArray(coinData.data.list) ? coinData.data.list : []);
            if (arr && arr.length > 0) {
              const first = arr[0] || {};
              const firstSymbol = first.symbol || first.coin;
              if (firstSymbol) {
                const info = await request({
                  url: Interface.COIN_INFO,
                  data: { coin: firstSymbol }
                });
                if (Array.isArray(info?.data) && info.data[0]?.url) {
                  setHeaderImg(info.data[0].url);
                } else if (info?.data?.url) {
                  setHeaderImg(info.data.url);
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async (e) => {
    if (!listParam.enableLoadMore) return;
    if (pageFinish.current) return;
    const requestData = Array.isArray(listParam.requestData) && listParam.requestData.length > 0? listParam.requestData[0]: listParam.requestData;
    const coinData = await request({
      url: listParam.interFace,
      data: {
        ...requestData,
        pageNo: ++pageNo.current,
        pageSize: pageSize.current
      }
    });

    if (pageNo.current * pageSize.current >= coinData.data.pageCount) {
      pageFinish.current = true;
    }
    if (listParam.reponseData) {
      const tmpResData = Object.keys(coinData?.data).map((resData) => {
        return coinData?.data[resData]
      });
      setReadyData([...readyData, ...tmpResData]);
    } else {
      setData([...data, ...coinData.data]);
    }
    
    
  };

  // const [ selected, setSelected ] = useState(listParam.selectArr[0]);
  const onChange = async (value) => {
    console.log('已选择');
    console.log('change', value);
    setSelected(listParam.selectArr[value]);

    // e.preventDefault();
    // e.stopPropagation();
    // setSelected(listParam.selectArr[e.detail.value]);
    if (listParam.reponseData) {
      setReadyIndex(value);
    }
    if (Array.isArray(listParam.requestData) && listParam.requestData.length > 0) {
      setLoading(true);
      const coinData = await request({
        url: listParam.interFace,
        data: {
          ...listParam.requestData[value],
          pageNo: pageNo.current,
          pageSize: pageSize.current
        }
      });
      setLoading(false);
      if (coinData?.data) {
        setData(coinData.data);
      }
    }
    
  }

  return (
    <Layout>
      {/* 进入列表页和切换维度请求时显示全屏品牌 Loading */}
      <LogoLoading
        visible={isLoading}
        fullscreen
        mask
        image={require('../../assets/image/community/loadding.png')}
        size={72}
      />
      { listParam && 
      <SimpleList
        isLoading={isLoading}
        // interFace={listParam.interFace} // Interface.hot_coin
        gridTitle={listParam.gridTitle} // ['币种', '24H价格变化(%)']
        // requestData={listParam.requestData}
        rankName={listParam.rankName}
        rankDesc={listParam.rankDesc}
        selectArr={listParam.selectArr}
        selectedPick={selectedPick}
        enableLoadMore={listParam}
        renderData={listParam.reponseData? readyData[readyIndex]: data.list || data}
        loadMore={loadMore}
        rankTitle={listParam.rankTitle}
        // onChangeCb={(value) => {onChange(value)}}
        onChangeCb={onChange}
        gridCon={listParam.gridCon} // ['coin', 'priceChangePercent']
        showHeader={showHeader}
        headerImg={headerImg || listParam.headerImg}
        // loginCb={() => {setPopVis(true)}}
      />
       }
      
      {/* <PageLogin show={popVis} hideCb={() => {setPopVis(false)}} /> */}
    </Layout>
  )
}
