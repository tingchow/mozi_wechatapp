import { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro'
import { SimpleList } from '../../components/ListCom/SimpleList';

export default function List() {

  const [listParam, setListParam] = useState({});

  useLoad(() => {
    const app = Taro.getApp();
    console.log('app', app);
    if (app.listParam) {
      setListParam(app.listParam);
      delete app.findType;
    }
  });


  if (Object.keys(listParam).length !== 0) {
    return (
      <SimpleList
        interFace={listParam.interFace} // Interface.hot_coin
        gridTitle={listParam.gridTitle} // ['币种', '24H价格变化(%)']
        requestData={listParam.requestData}
        rankName={listParam.rankName}
        rankDesc={listParam.rankDesc}
        selectArr={listParam.selectArr}
        defaultpageSize={100}
        enableLoadMore={false}
        gridCon={listParam.gridCon} // ['coin', 'priceChangePercent']
      />
    )
  }
}
