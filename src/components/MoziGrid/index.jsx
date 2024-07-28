import { Grid, List } from 'antd-mobile';
import { View, Text, ScrollView } from '@tarojs/components';
import './index.less';
// import IconFont from '../iconfont';

export const MoziGrid = (props) => {
  console.log('grid', props);
  return (
    <View>
      {
        !props?.hideTitle && (
        <Grid className='gridTitle' columns={props.length}>
          {
            props.colName.map((colNameItem, colNameIndex) => {
              return <Grid.Item className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
            })
          }
        </Grid>
        )
      }
      
      <View className='list'>
        <List>
          {
            props.gridContent.map((gridCon) => {
              return (
                <List.Item className='gridListItem' onClick={(e) => { e.stopPropagation; props.callback && props.callback(gridCon) }} clickable={false}>
                  <Grid className='gridContent' columns={props.length}>
                    {
                      Object.keys(gridCon).map((gridConItem, girdConIndex) => {
                        if (gridConItem === 'key' || gridConItem === 'img') {
                          return null;
                        }
                        return (
                          <Grid.Item className={`gridConItem  ${girdConIndex !== 0 && 'text'}`}>
                            {gridCon[gridConItem]}
                          </Grid.Item>
                        )
                      })
                    }
                  </Grid>
                </List.Item>
              )
            })
          }
        </List>
      </View>
    </View>
  );
};