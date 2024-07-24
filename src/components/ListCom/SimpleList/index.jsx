import { View, Image, ScrollView, Text, Picker } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro, { useLoad, getCurrentInstance, useDidShow, useReady } from '@tarojs/taro'
import { MoziGrid } from '../../MoziGrid';
import IconFont from '../../iconfont';
import { HighlightArea } from '../../HighlightArea';
import './index.less';
import { request } from '../../../utils/request';
import { jump2Detail } from '../../../utils/core';
import { AddCollect } from '../../AddCollect';
// import { url } from 'inspector';

export const SimpleList = ({ 
  interFace,
  gridTitle,
  gridCon,
  defaultpageSize = 20,
  enableLoadMore = false,
  requestData = [],
  rankName='',
  rankDesc='',
  selectArr=[]
}) => {
  console.log({
    ...requestData,
    pageNo: 1,
    pageSize: 1
  });

  const [data, setData] = useState([]);
  const [showHeader, setShowHeader] = useState(false);

  const pageNo = useRef(1);
  const pageSize = useRef(defaultpageSize);
  const pageFinish = useRef(false);

  useDidShow(() => {
    init();
  });

  useDidShow(() => {
    console.log('试个列表,', requestData);
    if (Array.isArray(requestData) && requestData.length > 1) {
      console.log('试个列表');
      setShowHeader(true);
    }
  });

  const matchDom = (type, data, dataKey) => {
    if (type === 'Img+Text') {
      return <View className='gridText'><Image className='gridIcon' mode='aspectFit' src={data[dataKey[0]]} />{data[dataKey[1]]}</View>
    }
    if (type === 'HighlightArea') {
      return <HighlightArea value={data[dataKey]} />
    }
    if (type === 'AddCollect') {
      return <AddCollect isOwn={data[dataKey[0]]} symbol={data[dataKey[1]]} />
    }
    if (type === 'Text') {
      return data[dataKey]
    }
  };

  const init = async () => {
    const coinData = await request({
      url: interFace[0],
      data: {
        ...requestData[0],
        pageNo: pageNo.current,
        pageSize: pageSize.current
      }
    });
    console.log('coinData', coinData);
    const tempFindCoin = coinData.data.map((item) => {
      const itemObj = {};
      gridCon.forEach((value, index) => {
        if (value.type === 'key' || value.type === 'img') {
          itemObj[value.type] = item[value.data]
        } else {
          itemObj[`key${index + 1}`] = matchDom(value.type, item, value.data)
        }
      });
      return itemObj;
    });
    setData(tempFindCoin);
  };

  const cardRequest = async (url, data) => {
    const res = await request({
      url,
      data
    });
    console.log('响应信息', res);
    return res;
  };

  

  const loadMore = async (e) => {
    if (!enableLoadMore) return;
    if (pageFinish.current) return;
    console.log('pageNo', pageNo)

    const coinData = await request({
      url: interFace[0],
      data: {
        ...requestData[0],
        pageNo: ++pageNo.current,
        pageSize: pageSize.current
      }
    });

    if (pageNo.current * pageSize.current >= coinData.data.pageCount) {
      pageFinish.current = true;
    }
    const tempFindCoin = coinData.data.map((item) => {
      const itemObj = {};
      gridCon.forEach((value, index) => {
        if (value.type === 'key') {
          itemObj.key = item[value.data]
        } else {
          itemObj[`key${index + 1}`] = matchDom(value.type, item, value.data)
        }
      });
      return itemObj;
    });
    setData([...data, ...tempFindCoin]);
    
  };

  const [ selected, setSelected ] = useState(selectArr[0]);
  const onChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(selectArr[e.detail.value]);
  }



  if (data.length > 0) {
    console.log('data', data)
    console.log('data[0]', data[0]);
    return (
      <View className='scroll-list'>
        {
          showHeader && data && (
            <View className='header'>
              <View className='left'>
                <View className='title'>Mozi行情榜</View>
                <View>{rankName}</View>
                <View className='desc'>
                  <Text className='desc-con'>{rankDesc}</Text>
                  <Picker mode='selector' range={selectArr} onChange={onChange}>
                    <View className='picker-select'>
                      <View className='select-icon'>{selected}</View>
                      <IconFont name='caret-down' />
                    </View>
                  </Picker>
                </View>
              </View>
              <View className='right'>
                { console.log('data', data) }
                { data[0].img && <Image src={data[0].img} mode='aspectFit' className='header-img' /> }
              </View>
            </View>
          )
        }
        <ScrollView
          className='scroll'
          scrollY
          enableBackToTop={true}
          enablePassive={true}
          onScrollToLower={loadMore}
          // compileMode
        >
          <MoziGrid
            length={gridTitle.length}
            colName={gridTitle}
            gridContent={data}
            callback={(gridCon) => {
              if (!gridCon.key) return;
              jump2Detail(gridCon.key);
            }}
          />
        </ScrollView>
      </View>
    )
  }
}
