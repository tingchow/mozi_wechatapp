<script setup>
import { ref } from 'vue'

// 响应式数据
const switchValue = ref(true)
const inputValue = ref('')
const radioValue = ref('1')
const checkboxValue = ref(['1'])
const pickerShow = ref(false)
const pickerList = [['苹果', '香蕉', '橙子', '西瓜']]
const pickerValue = ref(['苹果'])
const modalShow = ref(false)
const toastShow = ref(false)
const loadingShow = ref(false)

// 方法
const onSwitchChange = (value) => {
  console.log('开关状态变化:', value)
}

const onRadioChange = (value) => {
  console.log('单选框选中:', value)
}

const onCheckboxChange = (value) => {
  console.log('复选框选中:', value)
}

const onPickerConfirm = (value) => {
  pickerValue.value = value
  pickerShow.value = false
  console.log('选择器确认:', value)
}

const showModal = () => {
  modalShow.value = true
}

const showToast = () => {
  toastShow.value = true
  setTimeout(() => {
    toastShow.value = false
  }, 2000)
}

const showLoading = () => {
  loadingShow.value = true
  setTimeout(() => {
    loadingShow.value = false
  }, 3000)
}

const onButtonClick = (type) => {
  uni.showToast({
    title: `点击了${type}按钮`,
    icon: 'none'
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="container">
    <view class="header">
      <text class="title">UView Plus 组件测试</text>
      <text class="subtitle">验证Vue 3兼容版本的组件是否正常工作</text>
    </view>
    
    <view class="content">
      <!-- 按钮组件 -->
      <view class="section">
        <text class="section-title">按钮组件</text>
        <view class="demo-row">
          <up-button type="primary" @click="onButtonClick('主要')">主要按钮</up-button>
        </view>
        <view class="demo-row">
          <up-button type="success" @click="onButtonClick('成功')">成功按钮</up-button>
        </view>
        <view class="demo-row">
          <up-button type="warning" @click="onButtonClick('警告')">警告按钮</up-button>
        </view>
        <view class="demo-row">
          <up-button type="error" @click="onButtonClick('错误')">错误按钮</up-button>
        </view>
      </view>
      
      <!-- 表单组件 -->
      <view class="section">
        <text class="section-title">表单组件</text>
        
        <!-- 输入框 -->
        <view class="demo-row">
          <text class="label">输入框：</text>
          <up-input v-model="inputValue" placeholder="请输入内容" border="surround"></up-input>
        </view>
        
        <!-- 开关 -->
        <view class="demo-row">
          <text class="label">开关：</text>
          <up-switch v-model="switchValue" @change="onSwitchChange"></up-switch>
        </view>
        
        <!-- 单选框 -->
        <view class="demo-row">
          <text class="label">单选框：</text>
          <up-radio-group v-model="radioValue" @change="onRadioChange">
            <up-radio :name="1" label="选项1"></up-radio>
            <up-radio :name="2" label="选项2"></up-radio>
          </up-radio-group>
        </view>
        
        <!-- 复选框 -->
        <view class="demo-row">
          <text class="label">复选框：</text>
          <up-checkbox-group v-model="checkboxValue" @change="onCheckboxChange">
            <up-checkbox :name="1" label="选项1"></up-checkbox>
            <up-checkbox :name="2" label="选项2"></up-checkbox>
          </up-checkbox-group>
        </view>
      </view>
      
      <!-- 标签组件 -->
      <view class="section">
        <text class="section-title">标签组件</text>
        <view class="demo-row">
          <up-tag text="默认标签" type="primary"></up-tag>
          <up-tag text="成功标签" type="success"></up-tag>
          <up-tag text="警告标签" type="warning"></up-tag>
          <up-tag text="错误标签" type="error"></up-tag>
        </view>
        <view class="demo-row">
          <up-tag text="朴素标签" type="primary" plain></up-tag>
          <up-tag text="圆形标签" type="success" shape="circle"></up-tag>
        </view>
      </view>
      
      <!-- 反馈组件 -->
      <view class="section">
        <text class="section-title">反馈组件</text>
        <view class="demo-row">
          <up-button @click="showModal">显示模态框</up-button>
          <up-button @click="showToast">显示提示</up-button>
          <up-button @click="showLoading">显示加载</up-button>
        </view>
      </view>
      
      <!-- 选择器 -->
      <view class="section">
        <text class="section-title">选择器</text>
        <view class="demo-row">
          <text class="label">当前选择：{{ pickerValue[0] }}</text>
          <up-button @click="pickerShow = true">打开选择器</up-button>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <up-button type="info" @click="goBack">返回</up-button>
    </view>
    
    <!-- 选择器 -->
    <up-picker
      :show="pickerShow"
      :columns="pickerList"
      @confirm="onPickerConfirm"
      @cancel="pickerShow = false"
    ></up-picker>
    
    <!-- 模态框 -->
    <up-modal
      :show="modalShow"
      title="提示"
      content="这是一个模态框"
      @confirm="modalShow = false"
      @cancel="modalShow = false"
    ></up-modal>
    
    <!-- 消息提示 -->
    <up-toast ref="uToast"></up-toast>
    
    <!-- 加载提示 -->
    <up-loading-page :loading="loadingShow" loading-text="加载中..."></up-loading-page>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 20upx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40upx;
  padding: 20upx;
}

.title {
  font-size: 36upx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10upx;
}

.subtitle {
  font-size: 24upx;
  color: #666;
  display: block;
}

.content {
  padding: 0 20upx;
}

.section {
  background: white;
  border-radius: 15upx;
  padding: 30upx;
  margin-bottom: 30upx;
  box-shadow: 0 2upx 10upx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 28upx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20upx;
  display: block;
}

.demo-row {
  margin-bottom: 20upx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20upx;
}

.label {
  font-size: 26upx;
  color: #555;
  min-width: 120upx;
}

.footer {
  padding: 30upx;
  text-align: center;
}
</style>
