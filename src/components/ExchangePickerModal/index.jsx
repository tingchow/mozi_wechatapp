import { useEffect, useState } from 'react';
import { View, Image, Text, RootPortal } from '@tarojs/components';
import './index.less';

const EXCHANGES = [
  { id: 'binance', label: 'Binance', icon: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/icons/pc/binance.svg', desc: '全球最大交易所' },
  { id: 'okx', label: 'OKX', icon: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/icons/pc/okx.svg', desc: '领先的数字资产交易平台' },
  { id: 'bitget', label: 'Bitget', icon: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/icons/pc/bitget.svg', desc: '创新型合约交易平台' },
  { id: 'gate', label: 'Gate.io', icon: 'https://image-1317406749.cos.ap-shanghai.myqcloud.com/mozi_public/icons/pc/gate.svg', desc: '老牌数字资产交易平台' },
];

export default function ExchangePickerModal({
  open = false,
  symbol = 'BTC',
  onClose,
  onSelect,
}) {
  const [activeExchangeId, setActiveExchangeId] = useState(null);

  useEffect(() => {
    if (open) setActiveExchangeId(null);
  }, [open]);

  if (!open) return null;

  const displaySymbol = String(symbol || 'BTC').toUpperCase();

  const modal = (
    <View className='exchange-picker-root' catchMove>
      <View className='exchange-picker-mask' onClick={onClose} />
      <View className='exchange-picker-panel'>
        <View className='exchange-picker-handle' />
        <View className='exchange-picker-title'>选择 {displaySymbol} 交易平台</View>
        <View className='exchange-picker-grid'>
          {EXCHANGES.map((item) => (
            <View
              key={item.id}
              className={`exchange-picker-card ${activeExchangeId === item.id ? 'exchange-picker-card-active' : ''}`}
              onClick={() => {
                setActiveExchangeId(item.id);
                onSelect?.(item.id);
              }}
            >
              <Image className='exchange-picker-logo' src={item.icon} mode='aspectFit' />
              <Text className='exchange-picker-name'>{item.label}</Text>
              <Text className='exchange-picker-desc'>{item.desc}</Text>
            </View>
          ))}
        </View>
        <View className='exchange-picker-hint'>点击交易所将复制链接，请在浏览器打开</View>
        <View className='exchange-picker-cancel' onClick={onClose}>取消</View>
      </View>
    </View>
  );

  return <RootPortal>{modal}</RootPortal>;
}
