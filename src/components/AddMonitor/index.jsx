import IconFont from '../iconfont';
import { Input, View, PageContainer, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState, useRef } from 'react';
import { request } from '../../utils/request';
import { Interface } from '../../utils/constants';
import { PopLogin } from '../PopLogin';
import { jump2NoTab } from '../../utils/core';
import './index.less';

let isClick = false;

export const AddMonitor = (props) => {

  const [ isOwn, setOwn ] = useState(props.isOwn);


  const changeOwn = async (e) => {
    e.stopPropagation();
    jump2NoTab('addwarn', {symbol: props.symbol})
  };


  return (
    <View className='monitor' onClick={changeOwn} catchMove={true}>
      <IconFont name='bell-fill' size={40} />
    </View>
  );
};