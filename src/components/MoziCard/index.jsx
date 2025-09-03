import { Card } from 'antd-mobile';
import { Picker, View } from '@tarojs/components';
import IconFont from '../iconfont';
import { useEffect, useState } from 'react';
import './index.less';

export const MoziCard = (props) => {
  const { 
    borderRadius = '8px', 
    backgroundColor = '#fff', 
    marginBottom = '10px', 
    customStyle = {},
    ...otherProps 
  } = props;

  // 合并样式，customStyle 优先级最高
  const cardStyle = {
    borderRadius,
    backgroundColor,
    marginBottom,
    ...customStyle
  };

  return (
    <Card
      title={
        props.customTitle ? props.customTitle : (
          <div className='title' onClick={props.callback}>
            <span>{props.title}</span>
            {props.sumNum > 0? <span className='titleNum'>({props.sumNum})</span>: null}
          </div>
        )
      }
      extra={props.customTitle ? null : <CardExtra type={props.type} callback={props.callback} selectArr={props.selectArr} moreDesc={props.moreDesc} pickChange={props.pickChange} />}
      style={cardStyle}
      bodyClassName='cardBody'
      headerClassName='cardHead'
      
    >
      {props.children}
    </Card>
  );
};

const CardExtra = (props) => {
  
  const { type, callback, selectArr = [] } = props;
  const [ selected, setSelected ] = useState(selectArr[0]);

  const onChange = (e) => {
    console.log(e);
    e.preventDefault();
    e.stopPropagation();
    setSelected(selectArr[e.detail.value]);
    props.pickChange(e.detail.value);
  };

  if (type === 'more') {
    return (
      <View onClick={callback}>
        {
          props?.moreDesc? <View className='more-desc'>{props.moreDesc}</View>
          :<IconFont name='right' />
        }
      </View>
    );
  } else if (type === 'select') {
    return (
      <Picker mode='selector' range={selectArr} onChange={onChange}>
        <View className='pickerSelect'>
          <View className='selectIcon'>{selected}</View>
          <IconFont name='caret-down' />
        </View>
      </Picker>
    )
  } else {
    return null;
  }
};