import { View, Image, ScrollView } from '@tarojs/components';
import { memo, useState, useEffect, useRef } from 'react';
import Taro, { useLoad, getCurrentInstance, useDidShow, useReady } from '@tarojs/taro'
import { MoziGrid } from '../../MoziGrid';
import { jump2Detail } from '../../../utils/core';
import { HighlightArea } from '../../HighlightArea';
import './index.less';
import IconFont from '../../iconfont';
import { request } from '../../../utils/request';
import { GardenLoading } from '../../Loading';
import { TopBtn } from '../../TopBtn';
// import { throttle } from 'lodash';

export const ComplexList = memo(({data, gridTitle, loadMore, isFinish}) => {
  const isLoadMore = useRef(false);

  const getMore = async () => {
    if (isLoadMore.current) return;
    isLoadMore.current = true;
    await loadMore();
    isLoadMore.current = false;
  };

  if (data) {
    return (
      <ScrollView
        className='scroll'
        scrollY
        enablePassive={true}
        enableBackToTop={true}
        onScrollToLower={getMore}
        // compileMode
      >
        <MoziGrid
          length={gridTitle.length}
          colName={gridTitle}
          gridContent={data}
          callback={(gridCon) => {jump2Detail(gridCon.key)}}
        />
        {
          isFinish?
          <View className='loadFinish'>已全部加载完毕</View>:
          <GardenLoading />
        }
        
      </ScrollView>
    )
  }
});
