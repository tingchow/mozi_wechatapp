import { View, Text, Input, Button, Image as TaroImage } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { Card, Image, List, Grid } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import logo from '../../assets/mozilogo.png';
import './index.less';

// 区块内容
const area = {
  derivativeArea: {
    title: '衍生品专区',
    list: [{
      icon: '多空比图片',
      text: '多空比',
      path: '跳转地址'
    }, {
      icon: '持仓量图片',
      text: '持仓量',
      path: '跳转地址'
    }, {
      icon: '资金费率图片',
      text: '资金费率',
      path: '跳转地址'
    }, {
      icon: '成交额图片',
      text: '成交额',
      path: '跳转地址'
    }]
  },
  investArea: {
    title: '投资机会',
    list: [{
      icon: '热门交易所图片',
      text: '热门交易所',
      path: '跳转地址'
    }, {
      icon: '热门币种图片',
      text: '热门币种',
      path: '跳转地址'
    }, {
      icon: '热门版块图片',
      text: '热门版块',
      path: '跳转地址'
    }, {
      icon: '热门合约图片',
      text: '热门合约',
      path: '跳转地址'
    }]
  }
};

const mockZixuan = [{
  title: 'BTC',
  price: '10',
  rise: '20',
  isOwn: true,
}, {
  title: 'OKX',
  price: '40',
  rise: '-10',
  isOwn: false,
}];

export default function Index() {

  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <div className='indexBox'>
      <div className='header'>
        <TaroImage src={logo} />
        {/* <div className='logo'></div> */}
        <div className='searchBox'>
          <div className='searchIcon'>icon</div>
          <Input className='searchInput' type='text' placeholder='请输入内容' confirm-type='search' />
          <div className='searchCancel'>取消</div>
        </div>
      </div>
      <Card
        title={area.derivativeArea.title}
        extra='>'
        style={{ borderRadius: '8px', backgroundColor: '#fff' }}
        bodyClassName='derivativeBody'
      >
        <Grid columns={4}>
        {
          area.derivativeArea.list.map((item, index) => {
            return (
              <Grid.Item className='derivativeItem'>
                <Image className='derivativeIcon' src={item.icon} />
                <span>{item.text}</span>
              </Grid.Item>
            )
          })
        }
        </Grid>
      </Card>
      <Card
        title={area.investArea.title}
        extra='>'
        style={{ borderRadius: '8px', backgroundColor: '#fff' }}
        bodyClassName='derivativeBody'
      >
        <Grid columns={4}>
        {
          area.investArea.list.map((item, index) => {
            return (
              <Grid.Item className='derivativeItem'>
                <Image className='derivativeIcon' src={item.icon} />
                <span>{item.text}</span>
              </Grid.Item>
            )
          })
        }
        </Grid>
      </Card>
      <Card
        title='自选'
        extra='>'
        style={{ borderRadius: '8px', backgroundColor: '#fff' }}
        // bodyClassName='derivativeBody'
      >
        <Grid className='ownSelect' columns={4}>
           <Grid.Item className='ownTitle'>热门交易所</Grid.Item>
           <Grid.Item className='ownTitle'>最新价</Grid.Item>
           <Grid.Item className='ownTitle'>24小时涨幅</Grid.Item>
           <Grid.Item className='ownTitle'>加自选</Grid.Item>
        </Grid>
        <List>
          {mockZixuan.map((item, index) => {
            return (
              <List.Item>
                <Grid columns={4}>
                  <Grid.Item>{item.title}</Grid.Item>
                  <Grid.Item>{item.price}</Grid.Item>
                  <Grid.Item>{item.rise}</Grid.Item>
                  <Grid.Item>{item.isOwn}</Grid.Item>
                </Grid>
              </List.Item>
            )
          })}
        </List>
      </Card>
    </div>
  )
}
