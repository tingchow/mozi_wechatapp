<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  onDateChange: {
    type: Function,
    default: null
  },
  onToggleChange: {
    type: Function,
    default: null
  },
  defaultToggle: {
    type: Boolean,
    default: true
  }
})

const selectedDate = ref(null)
const isToggleOn = ref(props.defaultToggle)
const currentMonth = ref(new Date())

// 处理开关切换
const handleToggleChange = () => {
  const newState = !isToggleOn.value
  isToggleOn.value = newState
  props.onToggleChange && props.onToggleChange(newState)
}

// 处理日期点击
const handleDateClick = (date, isCurrentMonth) => {
  if (isCurrentMonth) {
    selectedDate.value = date
    props.onDateChange && props.onDateChange(date)
  }
}

// 切换月份
const changeMonth = (direction) => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + direction)
  currentMonth.value = newMonth
}

// 格式化月份年份
const formatMonthYear = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

// 生成日历数据
const generateCalendarData = () => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  // 当月第一天
  const firstDay = new Date(year, month, 1)
  // 当月最后一天
  const lastDay = new Date(year, month + 1, 0)
  // 第一周的第一天（从周日开始）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 重置时间部分
  
  // 生成42天（6周 x 7天）
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    currentDate.setHours(0, 0, 0, 0) // 重置时间部分
    
    const isCurrentMonth = currentDate.getMonth() === month
    const isToday = currentDate.getTime() === today.getTime()
    const isSelected = selectedDate.value && 
      currentDate.getTime() === selectedDate.value.getTime()
    
    // 固定显示当前日期前三个日期有事件标记
    const todayTime = today.getTime()
    const currentTime = currentDate.getTime()
    const oneDayMs = 24 * 60 * 60 * 1000 // 一天的毫秒数
    
    const hasEvents = isCurrentMonth && (
      currentTime === todayTime - oneDayMs ||     // 昨天
      currentTime === todayTime - 2 * oneDayMs || // 前天  
      currentTime === todayTime - 3 * oneDayMs    // 大前天
    )
    
    days.push({
      date: currentDate,
      day: currentDate.getDate(),
      isCurrentMonth: isCurrentMonth,
      isToday: isToday,
      isSelected: isSelected,
      hasEvents: hasEvents && isCurrentMonth
    })
  }
  
  return days
}

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
</script>

<template>
  <view class="simple-calendar-card">
    <!-- 上部分：交易所公告开关 -->
    <view class="calendar-header">
      <view class="announcement-section">
        <view class="announcement-icon">
          <image 
            class="icon-image" 
            src="/static/images/profile/calendar.png" 
            mode="aspectFit"
          />
        </view>
        <view class="announcement-content">
          <view class="announcement-title">交易所公告</view>
          <view class="announcement-subtitle">打开订阅推送，免费试用</view>
        </view>
        <view class="announcement-switch">
          <view 
            :class="`custom-switch ${isToggleOn ? 'checked' : ''}`"
            @click="handleToggleChange"
          >
            <view class="switch-button"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 下部分：自定义日历 -->
    <view class="calendar-content">
      <!-- 日历头部 - 月份切换 -->
      <view class="calendar-header-bar">
        <view class="calendar-nav" @click="changeMonth(-1)">
          <text class="nav-text">‹</text>
        </view>
        <text class="calendar-title">{{ formatMonthYear }}</text>
        <view class="calendar-nav" @click="changeMonth(1)">
          <text class="nav-text">›</text>
        </view>
      </view>
      
      <!-- 星期标题 -->
      <view class="calendar-week-header">
        <view v-for="(day, index) in weekDays" :key="index" class="week-day">
          <text class="week-day-text">{{ day }}</text>
        </view>
      </view>
      
      <!-- 日期网格 -->
      <view class="calendar-grid">
        <view
          v-for="(dayData, index) in generateCalendarData()"
          :key="index"
          :class="`calendar-day ${
            !dayData.isCurrentMonth ? 'other-month' : ''
          } ${dayData.isToday ? 'today' : ''} ${
            dayData.isSelected ? 'selected' : ''
          }`"
          @click="handleDateClick(dayData.date, dayData.isCurrentMonth)"
        >
          <view class="day-content">
            <text class="day-text">{{ dayData.day }}</text>
            <view class="event-dots">
              <view 
                v-if="dayData.hasEvents"
                class="event-dot" 
                style="background-color: #ff6b6b"
              ></view>
              <view 
                v-if="dayData.hasEvents"
                class="event-dot" 
                style="background-color: #ffa500"
              ></view>
              <view 
                v-if="dayData.hasEvents"
                class="event-dot" 
                style="background-color: #4169e1"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.simple-calendar-card {
  background: white;
  border-radius: 20upx;
  margin: 20upx 0;
  box-shadow: 0 4upx 20upx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.calendar-header {
  padding: 30upx 40upx;
  border-bottom: 2upx solid #f0f0f0;
}

.announcement-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.announcement-icon {
  width: 80upx;
  height: 80upx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 16upx;
  margin-right: 24upx;

  .icon-image {
    width: 48upx;
    height: 48upx;
  }
}

.announcement-content {
  flex: 1;

  .announcement-title {
    font-size: 32upx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8upx;
  }

  .announcement-subtitle {
    font-size: 24upx;
    color: #999;
  }
}

.announcement-switch {
  .custom-switch {
    width: 96upx;
    height: 54upx;
    background: #ccc;
    border-radius: 27upx;
    position: relative;
    transition: all 0.3s;
    cursor: pointer;

    &.checked {
      background: #45e87f;
    }

    .switch-button {
      width: 48upx;
      height: 48upx;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 3upx;
      left: 3upx;
      transition: all 0.3s;
      box-shadow: 0 2upx 6upx rgba(0, 0, 0, 0.2);
    }

    &.checked .switch-button {
      left: 45upx;
    }
  }
}

.calendar-content {
  padding: 30upx 40upx;
}

.calendar-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30upx;
}

.calendar-nav {
  width: 60upx;
  height: 60upx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12upx;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    background: #e9ecef;
    transform: scale(0.95);
  }

  .nav-text {
    font-size: 40upx;
    color: #666;
    font-weight: bold;
  }
}

.calendar-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
}

.calendar-week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8upx;
  margin-bottom: 20upx;
}

.week-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60upx;

  .week-day-text {
    font-size: 24upx;
    color: #999;
    font-weight: 500;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8upx;
}

.calendar-day {
  height: 80upx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12upx;
  cursor: pointer;
  transition: all 0.3s;

  &.other-month {
    opacity: 0.3;
  }

  &.today {
    background: #45e87f;
    color: white;

    .day-text {
      color: white;
      font-weight: bold;
    }
  }

  &.selected {
    background: #667eea;
    color: white;

    .day-text {
      color: white;
      font-weight: bold;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.day-text {
  font-size: 28upx;
  color: #333;
  margin-bottom: 4upx;
}

.event-dots {
  display: flex;
  gap: 4upx;
  height: 16upx;
  align-items: center;
}

.event-dot {
  width: 8upx;
  height: 8upx;
  border-radius: 50%;
}
</style>
