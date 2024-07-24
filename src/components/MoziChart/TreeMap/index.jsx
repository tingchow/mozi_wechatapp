import ReactDOM, { useState, useEffect } from 'react';
import { Card, Image, List, Grid } from 'antd-mobile';
import IconFont from '../../iconfont';
import './index.less';

export const MoziTreeMap = (props) => {

  const { list, name, desc } = props;

  const [newList, setList] = useState([]);

  const swapElements = (arr, index1, index2) => {
    // 交换元素
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
  }

  useEffect(() => {
    const handledArr = handleArr(list);
    setList(handledArr);
  }, []);

  const handleArr = (arr) => {
    let sortedArr = arr.slice().sort((a, b) => Math.abs(b[desc]) - Math.abs(a[desc]));
    let maxValue1 = sortedArr[0][desc];
    let maxValue2 = sortedArr[1][desc]? sortedArr[1][desc] : maxValue1;

    const tempArr = arr.slice();

    let bigSpanNum = 0;
    tempArr.forEach(item => {
      if (bigSpanNum === 2) {
        item.span = 1;
      } else {
        if (item[desc] === maxValue1 || item[desc] === maxValue2) {
          item.span = 2;
          bigSpanNum++;
        } else {
          item.span = 1;
        }
      }
    });

    let sumSpan = 0;
    tempArr.forEach((item, index) => {
      if (item.span === 2) {
        if ((sumSpan + item.span) % 4 === 1) {
          if (tempArr[index - 1].span === 2) {
            swapElements(tempArr, index, index - 2);
          } else {
            swapElements(tempArr, index, index - 1);
          }
        }
      }
      sumSpan += item.span;
    });

    return tempArr;
  };



  return (
    <Grid className='treemapContainer' columns={4} gap={4}>
      {
        newList.map((item) => {
          return (
            <Grid.Item className={`treemapItem ${item[desc] > 0? 'green': 'red'}`} span={item.span}>
              <div>{item[name]}</div>
              <div>{item[desc]}</div>
            </Grid.Item>
          );
        })
      }
    </Grid>
  );
};