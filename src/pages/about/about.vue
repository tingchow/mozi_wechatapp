<script setup>
import { onMounted } from 'vue'

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  console.log('About page loaded')
})
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="app-name">Mozi UniApp</text>
      <text class="version">版本 1.0.0</text>
    </view>
    
    <view class="content">
      <view class="section">
        <text class="section-title">关于应用</text>
        <text class="section-content">
          Mozi UniApp 是一个基于 uni-app 框架开发的跨平台应用，
          支持编译到iOS、Android、H5、小程序等多个平台。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">技术栈</text>
        <view class="tech-list">
          <view class="tech-item">Vue.js 3</view>
          <view class="tech-item">uni-app</view>
          <view class="tech-item">uView UI</view>
          <view class="tech-item">Pinia</view>
          <view class="tech-item">Vite</view>
          <view class="tech-item">ES6+</view>
        </view>
      </view>
      
      <view class="section">
        <text class="section-title">联系我们</text>
        <view class="contact-info">
          <view class="contact-item">
            <text class="contact-label">邮箱：</text>
            <text class="contact-value">contact@mozi.com</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">官网：</text>
            <text class="contact-value">www.mozi.com</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <button class="btn btn-primary" @click="goBack">返回首页</button>
    </view>
  </view>
</template>

<style scoped>
.container {
  padding: 40upx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 60upx;
}

.app-name {
  font-size: 40upx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10upx;
}

.version {
  font-size: 24upx;
  color: #666;
  display: block;
}

.content {
  max-width: 600upx;
  margin: 0 auto;
}

.section {
  background: white;
  border-radius: 20upx;
  padding: 30upx;
  margin-bottom: 30upx;
  box-shadow: 0 4upx 20upx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32upx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20upx;
  display: block;
}

.section-content {
  font-size: 28upx;
  color: #666;
  line-height: 1.6;
  display: block;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15upx;
}

.tech-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10upx 20upx;
  border-radius: 25upx;
  font-size: 24upx;
}

.contact-item {
  display: flex;
  margin-bottom: 15upx;
}

.contact-label {
  font-size: 28upx;
  color: #333;
  font-weight: bold;
  min-width: 80upx;
}

.contact-value {
  font-size: 28upx;
  color: #666;
}

.footer {
  margin-top: 60upx;
  text-align: center;
}

.btn {
  width: 300upx;
  padding: 25upx;
  border-radius: 15upx;
  font-size: 32upx;
  border: none;
  color: white;
}

.btn:active {
  opacity: 0.8;
}
</style>