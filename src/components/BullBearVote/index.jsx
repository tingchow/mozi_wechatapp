import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo } from 'react'
import './index.less'

export default function BullBearVote({
  title = '您对今天的BTC有何看法?',
  participants = 0,
  selected = null, // 'bull' | 'bear' | null
  disabled = false,
  onSelect = () => {}
}) {
  const displayCount = useMemo(() => {
    if (!participants) return ''
    return `${participants}人参与`
  }, [participants])

  const handleSelect = (type) => {
    if (disabled) return
    if (selected === type) return
    onSelect?.(type)
  }

  return (
    <View className={`bbv-container ${disabled ? 'is-disabled' : ''}`}>
      <View className='bbv-header'>
        <Text className='bbv-title'>{title}</Text>
        {!!participants && <Text className='bbv-count'>{displayCount}</Text>}
      </View>
      <View className='bbv-body'>
        <View
          className={`bbv-btn bull ${selected === 'bull' ? 'active' : ''}`}
          onClick={() => handleSelect('bull')}
        >
          <Text>看涨</Text>
        </View>
        <View
          className={`bbv-btn bear ${selected === 'bear' ? 'active' : ''}`}
          onClick={() => handleSelect('bear')}
        >
          <Text>看跌</Text>
        </View>
      </View>
    </View>
  )
}


