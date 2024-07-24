import { SpinLoading } from 'antd-mobile';
import { View } from '@tarojs/components';
// import IconFont from '../iconfont';
import { useEffect, useState } from 'react';
import './index.less';

export const ComLayout = (props) => {


  if (props.isLoading) {
    return <SpinLoading color='primary' />
  }

  return (
    <View>
      {props.children}
    </View>
  );
};
