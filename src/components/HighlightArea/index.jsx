import { Grid, List } from 'antd-mobile';
import { View, Text, ScrollView } from '@tarojs/components';
import './index.less';
// import IconFont from '../iconfont';

export const HighlightArea = ({title = '', value}) => {

  if (title) {
    return (
      <View className={`area-box ${String(value).includes('-')? 'red': 'green'}`}>
        <View className='area-box-title'>{title}</View>
        {value}
      </View>
    )
  }
  return (
    <View className={`areaBox ${String(value).includes('-')? 'red': 'green'}`}>
      {
        title && <View>{title}</View>
      }
      {value}
    </View>
  );
};