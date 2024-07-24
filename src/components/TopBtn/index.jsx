import { Grid, List } from 'antd-mobile';
import { View, Text, ScrollView } from '@tarojs/components';
import './index.less';
import IconFont from '../iconfont';

export const TopBtn = ({isShow}) => {
  if (isShow) {
    return (
      <View className='topBtn'>
        <IconFont name='caret-up' size={50} color='#02c076' />
      </View>
    );
  }
};