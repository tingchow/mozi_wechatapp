import { View, Image, ScrollView, Text, Button } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro, { useLoad, getCurrentInstance, useDidShow, useReady, useReachBottom } from '@tarojs/taro'
import { Grid } from 'antd-mobile';
import { MoziGrid } from '../../MoziGrid';
// import IconFont from '../../iconfont';
import { HighlightArea } from '../../HighlightArea';
import './index.less';
import IconFont from '../../iconfont';
import { request } from '../../../utils/request';
import { jump2Detail } from '../../../utils/core';
import { AddCollect } from '../../AddCollect';
import { AddMonitor } from '../../AddMonitor';
import { GardenLoading } from '../../Loading';
// import { url } from 'inspector';
const backPng = 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/left-arrow.png';

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
  showHeader,
  headerImg,
  extraClass = '',
  commentCount = 0,
  shareCount = 0,
  onShare,
  showRanking = false
}) => {
  const isHotSpecial =
    rankTitle === '热门币种' ||
    rankTitle === '热门合约' ||
    rankTitle === '热门版块' ||
    (typeof rankTitle === 'string' && rankTitle.includes('可交易'));

  const [data, setData] = useState([]);
  const [ selected, setSelected ] = useState(selectArr[0]);
  // const [showHeader, setShowHeader] = useState(selectArr.length > 0);

  // const pageNo = useRef(1);
  // const pageSize = useRef(defaultpageSize);
  // const pageFinish = useRef(false);

   

  useEffect(() => {
    // init();
    // setSelected(selectArr[0]);
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
    setData(tempFindCoin);
  }, [renderData]);

  // 保证默认选中第一项（处理 selectArr 异步到达或变更）
  useEffect(() => {
    if (Array.isArray(selectArr) && selectArr.length > 0) {
      if (!selected || !selectArr.includes(selected)) {
        setSelected(selectArr[0]);
      }
    }
  }, [selectArr]);

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
    if (type === 'AddMonitor') {
      return <AddMonitor symbol={data[dataKey]} />
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

  // Tab 切换
  const onTabChange = (index) => {
    setSelected(selectArr[index]);
    if (onChangeCb) onChangeCb(index);
  }

  const goBack = () => {
    try {
      Taro.navigateBack({ delta: 1 });
    } catch (e) {
      Taro.switchTab({ url: '/pages/index/index' });
    }
  }

  // useReachBottom(() => {
  //   console.log('滑动到底部')
  //   loadMore();
  // })

  if (isLoading) {
    return <GardenLoading />
  }
  return (
    <View className={`scroll-list ${isHotSpecial ? 'hotcoins' : ''} ${extraClass}`}>
       
      {
        (showHeader || selectArr.length > 0) && (
          <View className='header-new'>
            <View className='header-bg' />
            <View className='back-btn' onClick={goBack}>
              <Image className='back-icon' src={backPng} mode='aspectFit' />
            </View>
            <View className='header-con'>
              <View className='left'>
                <View className='title'>{rankTitle}</View>
                {rankName && <View className='rank-name'>{rankName}</View>}
                <View className='desc'>
                  {rankDesc && <Text className='desc-con'>{rankDesc}</Text>}
                </View>
              </View>
              <View className='right'>
                { (headerImg || data[0]?.img) && <Image src={headerImg || data[0]?.img} mode='aspectFit' className='header-img' /> }
              </View>
            </View>
            { selectArr && selectArr.length > 0 && (
              <View className='tab-select'>
                {
                  selectArr.map((item, index) => (
                    <View
                      className={`tab-item ${selected === item ? 'active' : ''}`}
                      key={`${item}-${index}`}
                      onClick={() => onTabChange(index)}
                    >
                      <Text className='tab-text'>{item}</Text>
                    </View>
                  ))
                }
              </View>
            )}
          {/* 右侧操作胶囊：评论与分享 */}
          <View className='actions-capsule'>
            <View
              className='capsule comment-capsule'
              onClick={() => {
                try { Taro.setStorageSync('communityMainTabPreset', 'hot'); } catch (e) {}
                Taro.switchTab({ url: '/pages/community/index' });
              }}
            >
              <Image className='capsule-icon' mode='aspectFit' src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/comment.png' />
              <Text className='capsule-text'>{commentCount || 0}</Text>
            </View>
            <View className='divider'></View>
            <Button
              className='capsule share-capsule'
              openType='share'
            >
              <Image className='capsule-icon' mode='aspectFit' src='https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/community/share.png' />
              <Text className='capsule-text'>{shareCount || 0}</Text>
            </Button>
          </View>
          </View>
        )
      }
      <Grid className={`gridTitle ${(showHeader || selectArr.length > 0)? 'show-header-grid': ''} ${showRanking ? 'with-ranking' : ''}`} columns={gridTitle.length}>
        {
          gridTitle.map((colNameItem, colNameIndex) => {
            return <Grid.Item key={colNameIndex} className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
          })
        }
      </Grid>
      <ScrollView
        className={`scroll ${(showHeader || selectArr.length > 0)? 'show-header': ''}`}
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
          simpleRanking={showRanking}
        />
      </ScrollView>
    </View>
  )
}
