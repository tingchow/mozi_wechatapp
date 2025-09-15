import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import IconFont from '../iconfont';
import './index.less';

/**
 * 自定义日历组件
 */
export const CalendarCard = (props) => {
  const {
    onDateChange,
    onToggleChange,
    defaultToggle = true,
  } = props;

  const [selectedDate, setSelectedDate] = useState(null);
  const [isToggleOn, setIsToggleOn] = useState(defaultToggle);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 处理开关切换
  const handleToggleChange = () => {
    const newState = !isToggleOn;
    setIsToggleOn(newState);
    onToggleChange && onToggleChange(newState);
  };

  // 处理日期点击
  const handleDateClick = (date, isCurrentMonth) => {
    if (isCurrentMonth) {
      setSelectedDate(date);
      onDateChange && onDateChange(date);
    }
  };

  // 切换月份
  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // 格式化月份年份
  const formatMonthYear = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    return `${year}年${month}月`;
  };

  // 生成日历数据
  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 当月第一天
    const firstDay = new Date(year, month, 1);
    // 当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    // 第一周的第一天（从周日开始）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 重置时间部分
    
    // 生成42天（6周 x 7天）
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0); // 重置时间部分
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      const isSelected = selectedDate && 
        currentDate.getTime() === selectedDate.getTime();
      
      // 固定显示当前日期前三个日期有事件标记
      const todayTime = today.getTime();
      const currentTime = currentDate.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000; // 一天的毫秒数
      
      const hasEvents = isCurrentMonth && (
        currentTime === todayTime - oneDayMs ||     // 昨天
        currentTime === todayTime - 2 * oneDayMs || // 前天  
        currentTime === todayTime - 3 * oneDayMs    // 大前天
      );
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth: isCurrentMonth,
        isToday: isToday,
        isSelected: isSelected,
        hasEvents: hasEvents && isCurrentMonth
      });
    }
    
    return days;
  };

  // 星期标题
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <View className="simple-calendar-card">
      {/* 上部分：交易所公告开关 */}
      <View className="calendar-header">
        <View className="announcement-section">
          <View className="announcement-icon">
            <Image 
              className="icon-image" 
              src={'https://image-1317406749.cos.ap-shanghai.myqcloud.com/assets/icon/calendar.png'}
              mode="aspectFit"
            />
          </View>
          <View className="announcement-content">
            <View className="announcement-title">交易所公告</View>
            <View className="announcement-subtitle">打开订阅推送，免费试用</View>
          </View>
          <View className="announcement-switch">
            <View 
              className={`custom-switch ${isToggleOn ? 'checked' : ''}`}
              onClick={handleToggleChange}
            >
              <View className="switch-button"></View>
            </View>
          </View>
        </View>
      </View>

      {/* 下部分：自定义日历 */}
      <View className="calendar-content">
        {/* 日历头部 - 月份切换 */}
        <View className="calendar-header-bar">
          <View className="calendar-nav" onClick={() => changeMonth(-1)}>
            <Text className="nav-text">‹</Text>
          </View>
          <Text className="calendar-title">{formatMonthYear()}</Text>
          <View className="calendar-nav" onClick={() => changeMonth(1)}>
            <Text className="nav-text">›</Text>
          </View>
        </View>
        
        {/* 星期标题 */}
        <View className="calendar-week-header">
          {weekDays.map((day, index) => (
            <View key={index} className="week-day">
              <Text className="week-day-text">{day}</Text>
            </View>
          ))}
        </View>
        
        {/* 日期网格 */}
        <View className="calendar-grid">
          {generateCalendarData().map((dayData, index) => (
            <View
              key={index}
              className={`calendar-day ${
                !dayData.isCurrentMonth ? 'other-month' : ''
              } ${dayData.isToday ? 'today' : ''} ${
                dayData.isSelected ? 'selected' : ''
              }`}
              onClick={() => handleDateClick(dayData.date, dayData.isCurrentMonth)}
            >
              <View className="day-content">
                <Text className="day-text">{dayData.day}</Text>
                <View className="event-dots">
                  {dayData.hasEvents && (
                    <>
                      <View 
                        className="event-dot" 
                        style={{backgroundColor: '#ff6b6b'}}
                      ></View>
                      <View 
                        className="event-dot" 
                        style={{backgroundColor: '#ffa500'}}
                      ></View>
                      <View 
                        className="event-dot" 
                        style={{backgroundColor: '#4169e1'}}
                      ></View>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CalendarCard;