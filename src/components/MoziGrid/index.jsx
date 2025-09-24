import { Grid, List } from 'antd-mobile';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import './index.less';
// import IconFont from '../iconfont';

export const MoziGrid = (props) => {
  const { gridTitleBgColor = '#F6F6F6', showRanking = false, className = '' } = props;
  
  return (
    <View className={className}>
      {
        !props?.hideTitle && !showRanking && (
        <Grid 
          className='gridTitle' 
          columns={props.length}
          style={{ backgroundColor: gridTitleBgColor }}
        >
          {
            props.colName.map((colNameItem, colNameIndex) => (
              <Grid.Item key={colNameIndex} className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
            ))
          }
        </Grid>
        )
      }
      
      <View className='list'>
        {showRanking ? (
          // 当显示排名时，使用自定义布局让logo跨越三行
          <View className='ranking-layout'>
            <View className='ranking-column'>
              {props.gridContent.length > 0 && props.gridContent[0].img ? (
                <View className='ranking-logo-container'>
                <Image 
                  src={props.gridContent[0].img} 
                  mode='aspectFit' 
                  className='ranking-logo-full'
                  onError={(e) => console.log('图片加载失败:', e, props.gridContent[0].img)}
                  onLoad={() => console.log('图片加载成功:', props.gridContent[0].img)}
                />
                  <Text className='ranking-logo-text'>{props?.extraTopName || ''}</Text>
                </View>
              ) : (
                <View className='logo-placeholder-full'>🏆</View>
              )}
            </View>
            <View className='content-column'>
              {
                !props?.hideTitle && (
                  <Grid 
                    className='gridTitle' 
                    columns={props.length}
                    style={{ backgroundColor: gridTitleBgColor }}
                  >
                    {
                      props.colName.map((colNameItem, colNameIndex) => (
                        <Grid.Item key={colNameIndex} className={`gridTitleItem ${colNameIndex !== 0 && 'text'}`}>{colNameItem}</Grid.Item>
                      ))
                    }
                  </Grid>
                )
              }
              <List className='mozi-grid-list'>
                {
                  props.gridContent.map((gridCon, index) => {
                    return (
                      <List.Item key={index} className='gridListItem' onClick={(e) => { e.stopPropagation; props.callback && props.callback(gridCon) }} clickable={false}>
                        <Grid className='gridContent' columns={props.length}>
                          {
                            Object.keys(gridCon).map((gridConItem, girdConIndex) => {
                              if (gridConItem === 'key' || gridConItem === 'img') {
                                return null;
                              }
                              const rawCellValue = gridCon[gridConItem];
                              const displayValue = typeof rawCellValue === 'string' ? rawCellValue.replace(/^\$/,'') : rawCellValue;
                              return (
                                <Grid.Item key={gridConItem} className={`gridConItem  ${girdConIndex !== 0 && 'text'}`}>
                                  {displayValue}
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
        ) : (
          // 原有的普通布局
          <List className='mozi-grid-list'>
            {
              props.gridContent.map((gridCon, index) => {
                return (
                  <List.Item key={index} className='gridListItem' onClick={(e) => { e.stopPropagation; props.callback && props.callback(gridCon) }} clickable={false}>
                    <Grid className='gridContent' columns={props.length}>
                      {
                        Object.keys(gridCon).map((gridConItem, girdConIndex) => {
                          if (gridConItem === 'key' || gridConItem === 'img') {
                            return null;
                          }
                          const rawCellValue = gridCon[gridConItem];
                          const displayValue = typeof rawCellValue === 'string' ? rawCellValue.replace(/^\$/,'') : rawCellValue;
                          return (
                            <Grid.Item key={gridConItem} className={`gridConItem  ${girdConIndex !== 0 && 'text'}`}>
                              {displayValue}
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
        )}
      </View>
    </View>
  );
};