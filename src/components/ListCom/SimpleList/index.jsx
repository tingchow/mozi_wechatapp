import { View, Image, ScrollView, Text, Picker } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro, { useLoad, getCurrentInstance, useDidShow, useReady, useReachBottom } from '@tarojs/taro'
import { Grid } from 'antd-mobile';
import { MoziGrid } from '../../MoziGrid';
import IconFont from '../../iconfont';
import { HighlightArea } from '../../HighlightArea';
import './index.less';
import { request } from '../../../utils/request';
import { jump2Detail } from '../../../utils/core';
import { AddCollect } from '../../AddCollect';
import { GardenLoading } from '../../Loading';
// import { url } from 'inspector';

export const SimpleList = ({ 
  interFace,
  gridTitle,
  gridCon,
  defaultpageSize = 20,
  enableLoadMore = false,
  requestData = [],
  rankTitle='Mozi列表',
  rankName='',
  rankDesc='',
  selectArr=[],
  selectedPick,
  renderData=[],
  loadMore,
  onChangeCb,
  isLoading,
  // loginCb,
  // showHeader
}) => {
  console.log('进入列表');

  const [data, setData] = useState([]);
  const [ selected, setSelected ] = useState(selectArr[0]);
  // const [showHeader, setShowHeader] = useState(selectArr.length > 0);

  // const pageNo = useRef(1);
  // const pageSize = useRef(defaultpageSize);
  // const pageFinish = useRef(false);

  console.log('选择的列表', selectArr);

  useEffect(() => {
    // init();
    // setSelected(selectArr[0]);
    console.log('renderData', renderData);
    const tempFindCoin = renderData.map((item) => {
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
    console.log('tempFindCoin', tempFindCoin);
    setData(tempFindCoin);
  }, [renderData]);

  useDidShow(() => {
    // console.log('试个列表,', requestData);
    // if (Array.isArray(requestData) && requestData.length > 1) {
    //   console.log('试个列表');
    //   setShowHeader(true);
    // }
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

  // const init = async () => {
  //   const coinData = await request({
  //     url: interFace[0],
  //     data: {
  //       ...requestData[0],
  //       pageNo: pageNo.current,
  //       pageSize: pageSize.current
  //     }
  //   });
  //   console.log('coinData', coinData);
  //   const tempFindCoin = coinData.data.map((item) => {
  //     const itemObj = {};
  //     gridCon.forEach((value, index) => {
  //       if (value.type === 'key' || value.type === 'img') {
  //         itemObj[value.type] = item[value.data]
  //       } else {
  //         itemObj[`key${index + 1}`] = matchDom(value.type, item, value.data)
  //       }
  //     });
  //     return itemObj;
  //   });
  //   setData(tempFindCoin);
  // };

  

  // const loadMore = async (e) => {
  //   if (!enableLoadMore) return;
  //   if (pageFinish.current) return;
  //   console.log('pageNo', pageNo)

  //   const coinData = await request({
  //     url: interFace[0],
  //     data: {
  //       ...requestData[0],
  //       pageNo: ++pageNo.current,
  //       pageSize: pageSize.current
  //     }
  //   });

  //   if (pageNo.current * pageSize.current >= coinData.data.pageCount) {
  //     pageFinish.current = true;
  //   }
  //   const tempFindCoin = coinData.data.map((item) => {
  //     const itemObj = {};
  //     gridCon.forEach((value, index) => {
  //       if (value.type === 'key') {
  //         itemObj.key = item[value.data]
  //       } else {
  //         itemObj[`key${index + 1}`] = matchDom(value.type, item, value.data)
  //       }
  //     });
  //     return itemObj;
  //   });
  //   setData([...data, ...tempFindCoin]);
    
  // };

  

  console.log('当前选项', selected);
  const onChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(selectArr[e.detail.value]);
    if (onChangeCb) onChangeCb(e.detail.value);
  }

  // useReachBottom(() => {
  //   console.log('滑动到底部')
  //   loadMore();
  // })

  if (isLoading) {
    return <GardenLoading />
  }

  if (data.length > 0) {
    return (
      <View className='scroll-list'>
        {
          selectArr.length > 0 && (
            <View className='header'>
              <View className='left'>
                <View className='title'>{rankTitle}</View>
                <View>{rankName}</View>
                <View className='desc'>
                  {rankDesc && <Text className='desc-con'>{rankDesc}</Text>}
                  {
                    selectArr && selectedPick && (
                      <Picker mode='selector' range={selectArr} onChange={onChange}>
                        <View className='picker-select'>
                          <View className='select-icon'>{selectedPick}</View>
                          <IconFont name='caret-down' />
                        </View>
                      </Picker>
                    )
                  }
                  
                </View>
              </View>
              <View className='right'>
                { console.log('data', data) }
                { data[0].img && <Image src={data[0].img} mode='aspectFit' className='header-img' /> }
              </View>
            </View>
          )
        }
        <Grid className={`gridTitle ${selectArr.length > 0? 'show-header-grid': ''}`} columns={gridTitle.length}>
          {
            gridTitle.map((colNameItem, colNameIndex) => {
              return <Grid.Item className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
            })
          }
        </Grid>
        <ScrollView
          className={`scroll ${selectArr.length > 0? 'show-header': ''}`}
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
            hideTitle={true}
          />
        </ScrollView>
      </View>
    )
  }
}
