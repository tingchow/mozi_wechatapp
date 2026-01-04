import { View, Text, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import './index.less';

export default function PetCat() {
  const [catName, setCatName] = useState('Mozi');
  const [catMood, setCatMood] = useState('happy');

  useLoad(() => {
    console.log('宠物猫页面加载');
  });

  // 猫咪心情状态
  const moods = {
    happy: {
      emoji: '😸',
      text: '开心',
      color: '#11B787'
    },
    sleepy: {
      emoji: '😴',
      text: '困了',
      color: '#8C8C8C'
    },
    hungry: {
      emoji: '😿',
      text: '饿了',
      color: '#FA8C16'
    },
    playful: {
      emoji: '😺',
      text: '想玩',
      color: '#1890FF'
    }
  };

  // 互动按钮
  const handleFeed = () => {
    setCatMood('happy');
    Taro.showToast({
      title: `${catName}吃饱了！`,
      icon: 'success',
      duration: 2000
    });
  };

  const handlePlay = () => {
    setCatMood('playful');
    Taro.showToast({
      title: `${catName}很开心！`,
      icon: 'success',
      duration: 2000
    });
  };

  const handleSleep = () => {
    setCatMood('sleepy');
    Taro.showToast({
      title: `${catName}睡着了...`,
      icon: 'none',
      duration: 2000
    });
  };

  return (
    <View className='pet-cat-container'>
      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>我的宠物猫</Text>
      </View>

      {/* 猫咪展示区 */}
      <View className='cat-display'>
        <View className='cat-card'>
          <View className='cat-emoji'>{moods[catMood].emoji}</View>
          <Text className='cat-name'>{catName}</Text>
          <View className='cat-mood' style={{ color: moods[catMood].color }}>
            <Text className='mood-text'>心情：{moods[catMood].text}</Text>
          </View>
        </View>
      </View>

      {/* 互动按钮区 */}
      <View className='action-buttons'>
        <View className='action-btn feed-btn' onClick={handleFeed}>
          <Text className='btn-emoji'>🍖</Text>
          <Text className='btn-text'>喂食</Text>
        </View>
        <View className='action-btn play-btn' onClick={handlePlay}>
          <Text className='btn-emoji'>🎾</Text>
          <Text className='btn-text'>玩耍</Text>
        </View>
        <View className='action-btn sleep-btn' onClick={handleSleep}>
          <Text className='btn-emoji'>🛏️</Text>
          <Text className='btn-text'>睡觉</Text>
        </View>
      </View>

      {/* 猫咪信息 */}
      <View className='cat-info'>
        <View className='info-item'>
          <Text className='info-label'>品种</Text>
          <Text className='info-value'>英短蓝猫</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>年龄</Text>
          <Text className='info-value'>2岁</Text>
        </View>
        <View className='info-item'>
          <Text className='info-label'>性别</Text>
          <Text className='info-value'>公猫</Text>
        </View>
      </View>

      {/* 提示信息 */}
      <View className='tips'>
        <Text className='tips-text'>💡 多和{catName}互动，它会更开心哦~</Text>
      </View>
    </View>
  );
}
