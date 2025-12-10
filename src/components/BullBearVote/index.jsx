import { View, Text } from '@tarojs/components'
import { useMemo } from 'react'
import './index.less'

/**
 * 看涨看跌指示器组件（带投票功能）
 * @param {string} title - 标题（可选）
 * @param {number} upCount - 看涨数量
 * @param {number} downCount - 看跌数量
 * @param {string} bullLabel - 看涨标签（可选，默认"看涨"）
 * @param {string} bearLabel - 看跌标签（可选，默认"看跌"）
 * @param {boolean} showPercentage - 是否显示百分比，默认true
 * @param {string} selected - 当前选中的选项 'bull' | 'bear' | null
 * @param {boolean} disabled - 是否禁用投票
 * @param {function} onSelect - 选择回调函数
 * @param {number} participants - 参与人数（可选）
 * @param {boolean} showParticipants - 是否显示参与人数，默认true
 */
export default function BullBearIndicator({
  title = '',
  upCount = 0,
  downCount = 0,
  bullLabel = '看涨',
  bearLabel = '看跌',
  showPercentage = true,
  selected = null,
  disabled = false,
  onSelect,
  participants = 0,
  showParticipants = true
}) {
  // 计算百分比
  const { bullPercentage, bearPercentage } = useMemo(() => {
    const total = upCount + downCount
    return {
      bullPercentage: total > 0 ? (upCount / total) * 100 : 50,
      bearPercentage: total > 0 ? (downCount / total) * 100 : 50
    }
  }, [upCount, downCount])

  // 参与人数显示
  const displayCount = useMemo(() => {
    return `${participants}人参与`
  }, [participants])

  // 处理点击
  const handleSelect = (type) => {
    if (disabled) return
    if (onSelect) {
      onSelect(type)
    }
  }

  return (
    <View className='bbv-container'>
      {/* 标题和参与人数 */}
      {(title || showParticipants) && (
        <View className='bbv-header'>
          {title && <Text className='bbv-title'>{title}</Text>}
          {showParticipants && (
            <Text className='bbv-participants-count'>{displayCount}</Text>
          )}
        </View>
      )}

      {/* 指示器 */}
      <View className={`bbv-indicator ${disabled ? 'is-disabled' : ''}`}>
        <View
          className={`bbv-bull-side ${selected === 'bull' ? 'is-selected' : ''} ${onSelect ? 'is-clickable' : ''}`}
          style={{ width: `${bullPercentage}%` }}
          onClick={() => handleSelect('bull')}
        >
          <Text className='bbv-label'>{bullLabel}</Text>
        </View>

        <View className='bbv-divider' />

        <View
          className={`bbv-bear-side ${selected === 'bear' ? 'is-selected' : ''} ${onSelect ? 'is-clickable' : ''}`}
          style={{ width: `${bearPercentage}%` }}
          onClick={() => handleSelect('bear')}
        >
          <Text className='bbv-label'>{bearLabel}</Text>
        </View>
      </View>

      {/* 百分比 */}
      {showPercentage && (
        <View className='bbv-percentages'>
          <Text className='bbv-bull-percent'>{bullPercentage.toFixed(0)}%</Text>
          <Text className='bbv-bear-percent'>{bearPercentage.toFixed(0)}%</Text>
        </View>
      )}
    </View>
  )
}
