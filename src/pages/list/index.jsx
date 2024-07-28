import { useState, useRef } from 'react';
import Taro, { useLoad } from '@tarojs/taro'
import { View } from '@tarojs/components';
import { SimpleList } from '../../components/ListCom/SimpleList';
import { Layout } from '../../components/Layout';
import { PageLogin } from '../../components/PageLogin';
import { request } from '../../utils/request';

export default function List() {

  const [listParam, setListParam] = useState({});
  const [data, setData] = useState([]);
  const [readyData, setReadyData] = useState([]);
  const [readyIndex, setReadyIndex] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const pageNo = useRef(1);
  const pageSize = useRef(100);
  const pageFinish = useRef(false);
  const [ popVis, setPopVis ] = useState(false);




  useLoad(() => {
    const app = Taro.getApp();
    init(app.listParam);
    console.log('app', app);
    if (app.listParam) {
      setListParam(app.listParam);
      if (Array.isArray(app.listParam.selectArr) && app.listParam.selectArr.length > 0) {
        setShowHeader(true);
      }
      delete app.findType;
    }
    if (listParam.pageSize) {
      pageSize.current = listParam.pageSize;
    }
    
  });

  // 初始化获取数据
  const init = async (listParam) => {
    console.log('init', listParam);
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
        // setData(coinData.data[listParam.reponseData[0]]);
      } else {
        setData(coinData.data);
      }
    }
    setLoading(false);
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
    <Layout isLoading={isLoading}>
      
      <SimpleList
        // interFace={listParam.interFace} // Interface.hot_coin
        gridTitle={listParam.gridTitle} // ['币种', '24H价格变化(%)']
        // requestData={listParam.requestData}
        rankName={listParam.rankName}
        rankDesc={listParam.rankDesc}
        selectArr={listParam.selectArr}
        enableLoadMore={listParam}
        renderData={listParam.reponseData? readyData[readyIndex]: data}
        loadMore={loadMore}
        rankTitle={listParam.rankTitle}
        // onChangeCb={(value) => {onChange(value)}}
        onChangeCb={onChange}
        gridCon={listParam.gridCon} // ['coin', 'priceChangePercent']
        // loginCb={() => {setPopVis(true)}}
      />
      {/* <PageLogin show={popVis} hideCb={() => {setPopVis(false)}} /> */}
    </Layout>
  )
}
