import ReactDOM, { useState, useEffect } from 'react';
import { Card, List, Grid } from 'antd-mobile';
import IconFont from '../../iconfont';
import { View, Text, Input, Button, Image, ScrollView, Picker } from '@tarojs/components'
import './index.less';

export const MoziPCRColChart = (props) => {

  const { data } = props;


  return (
    <View className='PCRBox'>
      <View className='PCRDesc'>
        <View className='PCRDescName'>交易所</View>
        <View className='PCRDescContent'>
          <View>多</View>
          <View>空</View>
        </View>
      </View>
      <View className='PCRList'>
        {
          data.map((pcrItem) => {
            return (
              <View className='pcrItem'>
                <View className='pcr-item-title'>
                  <View>{Number(pcrItem.order) + 1}</View>
                  <Image className='pcr-item-icon' mode='aspectFit' src={pcrItem.url} />
                  <View className='pcrItemName'>{pcrItem.name}</View>
                </View>
                <View className='pcrItemRatio'>
                  <View className='pcrItemLeft' style={{width: pcrItem.long}}></View>
                  <View className='pcrItemDesc'>
                    <View>{pcrItem.long}</View>
                    <View>{pcrItem.short}</View>
                  </View>
                </View>
              </View>
            )
          })
        }
      </View>
    </View>
  );
};