import { Grid, List } from 'antd-mobile';
import { View, Image, Text } from '@tarojs/components';
import './index.less';
// import IconFont from '../iconfont';

export const RankGrid = (props) => {

  return (
    <View className='rankGridContainer'>
      <View className='rankGridHead'>
        <Image className='firstPic' mode='aspectFit' src={props.gridContent[0].img} />
        <Text>{props.gridContent[0].key}</Text>
      </View>
      <View className='rankGridDesc'>
        <Grid className='gridTitle' columns={props.length + 1}>
          <Grid.Item className="gridTitleItem ranking-header"></Grid.Item>
          {
            props.colName.map((colNameItem, colNameIndex) => {
              // console.log(colNameItem);
              return <Grid.Item className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
            })
          }
        </Grid>
        <List>
          {
            props.gridContent.map((gridCon, index) => {
              return (
                <List.Item className='gridListItem' onClick={() => { props.callback && props.callback(gridCon) }} clickable={false}>
                  <View className='ranking-row'>
                    <Text className='ranking-number'>{index + 1}</Text>
                    <Grid className='gridContent' columns={props.length}>
                      {
                        Object.keys(gridCon).map((gridConItem, girdConIndex) => {
                          // console.log(gridConItem);
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
                  </View>
                </List.Item>
              )
            })
          }
        </List>
      </View>
    </View>
  );
};