import { useState, useRef } from 'react';
import Taro, { useLoad, useShareAppMessage } from '@tarojs/taro'
import { View } from '@tarojs/components';
import { TabBar } from 'antd-mobile';
import { handleOptions } from '../../components/MoziChart/options';
import IconFont from '../../components/iconfont';
import * as echarts from '../../components/MoziChart/ec-canvas/echarts';
import './index.less';

export default function Landscapechart() {

  // const chart = useRef(null);
  const [tabShow, setTabShow] = useState(false);
  const [activeKey, setActiveKey] = useState('hour');
  const [isPositionSize, setIsPositionSize] = useState(false);
  const [safePadding, setSafePadding] = useState({});
  const [isPCRHis, setIsPCRHis] = useState(false);

  const chartRef = useRef(null);

  const chartData = useRef(null);

  // 将K线原始数据转换为折线数据（只在横屏折线时使用）
  const buildLineDataset = (raw) => {
    if (!raw) return { categoryData: [], lineData: [] };
    // 已是折线结构
    if (Array.isArray(raw.lineData) && Array.isArray(raw.categoryData)) return raw;
    // 兼容：传入的是k线处理后的对象 { categoryData, values }
    if (Array.isArray(raw.values) && Array.isArray(raw.categoryData)) {
      const lineData = raw.values.map((v) => Array.isArray(v) ? v[1] : (v?.Close ?? v?.close ?? 0));
      return { categoryData: raw.categoryData, lineData };
    }
    // 原始数组 [{dt, Open, Close, ...}]
    if (Array.isArray(raw)) {
      const categoryData = raw.map((it) => it?.dt ?? it?.time ?? it?.t ?? '');
      const lineData = raw.map((it) => it?.Close ?? it?.close ?? (Array.isArray(it) ? it[1] : 0));
      return { categoryData, lineData };
    }
    return { categoryData: [], lineData: [] };
  };

  useShareAppMessage(() => {
    return {
      title: '你能用微信盯盘啦！'
    };
  });

  // 仅在“持仓量”横屏时，根据设备安全区增加左右内边距，避免被刘海遮挡
  useLoad(() => {
    const app = Taro.getApp();
    if (app.chartData?.msg === '持仓量') {
      setIsPositionSize(true);
      try {
        const sys = Taro.getSystemInfoSync();
        const leftInset = sys?.safeArea?.left ? sys.safeArea.left : 0;
        const rightInset = sys?.safeArea?.right ? (sys.screenWidth - sys.safeArea.right) : 0;
        if (leftInset || rightInset) {
          setSafePadding({ paddingLeft: `${leftInset}px`, paddingRight: `${rightInset}px` });
        }
      } catch (e) {
        // ignore
      }
    } else if (app.chartData?.msg === '历史多空比') {
      // 历史多空比横屏：也开启安全区
      try {
        const sys = Taro.getSystemInfoSync();
        const leftInset = sys?.safeArea?.left ? sys.safeArea.left : 0;
        const rightInset = sys?.safeArea?.right ? (sys.screenWidth - sys.safeArea.right) : 0;
        if (leftInset || rightInset) {
          setSafePadding({ paddingLeft: `${leftInset}px`, paddingRight: `${rightInset}px` });
        }
      } catch (e) {}
      setIsPCRHis(true);
    } else if (app.chartData?.msg === '成交量') {
      // 当前成交额（treemap）横屏：与持仓量同样的左右安全区
      try {
        const sys = Taro.getSystemInfoSync();
        const leftInset = sys?.safeArea?.left ? sys.safeArea.left : 0;
        const rightInset = sys?.safeArea?.right ? (sys.screenWidth - sys.safeArea.right) : 0;
        if (leftInset || rightInset) {
          setSafePadding({ paddingLeft: `${leftInset}px`, paddingRight: `${rightInset}px` });
        }
      } catch (e) {}
    }
  });

  const initChart = (canvas, width, height, dpr) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);

    // const data = {"shortData":[0.51,0.55,0.51,0.52,0.53,0.5,0.53,0.51,0.54,0.53,0.51,0.53,0.5,0.52,0.54,0.52,0.55,0.54,0.5,0.53,0.51,0.5,0.51,0.52,0.51,0.5,0.51,0.52,0.49,0.5],"longShortData":[0.94,0.82,0.95,0.91,0.88,0.98,0.89,0.97,0.85,0.88,0.97,0.89,0.99,0.93,0.87,0.93,0.83,0.84,1,0.89,0.96,1,0.96,0.93,0.95,0.99,0.96,0.94,1.05,1],"longData":[0.49,0.45,0.49,0.48,0.47,0.5,0.47,0.49,0.46,0.47,0.49,0.47,0.5,0.48,0.46,0.48,0.45,0.46,0.5,0.47,0.49,0.5,0.49,0.48,0.49,0.5,0.49,0.48,0.51,0.5],"xAxisData":["2024-05-22","2024-05-23","2024-05-24","2024-05-25","2024-05-26","2024-05-27","2024-05-28","2024-05-29","2024-05-30","2024-05-31","2024-06-01","2024-06-02","2024-06-03","2024-06-04","2024-06-05","2024-06-06","2024-06-07","2024-06-08","2024-06-09","2024-06-10","2024-06-11","2024-06-12","2024-06-13","2024-06-14","2024-06-15","2024-06-16","2024-06-17","2024-06-18","2024-06-19","2024-06-20"]}
    // const type = 'samebar'

    // chart.setOption(handleOptions(data, type));
    const app = Taro.getApp();
    const forceType = app.chartData?.forceType; // 详情页当前显示的图表类型
    if (app.chartData.active) {
      const dataType = app.chartData.active;
      setTabShow(true);
      setActiveKey(dataType);
      chartData.current = app.chartData;
      if (forceType === 'line') {
        chart.setOption(handleOptions(buildLineDataset(app.chartData[dataType].data), 'line', app.chartData[dataType].msg));
      } else {
        chart.setOption(handleOptions(app.chartData[dataType].data, app.chartData[dataType].type, app.chartData[dataType].msg));
      }
    } else {
      if (forceType === 'line') {
        chart.setOption(handleOptions(buildLineDataset(app.chartData.data), 'line', app.chartData.msg));
      } else {
        chart.setOption(handleOptions(app.chartData.data, app.chartData.type, app.chartData.msg));
      }
    }
    chartRef.current = chart;

    return chart;
  }

  const backPage = () => {
    Taro.navigateBack();
  }

  const activeClick = (value) => {
    if (value === activeKey) return;
    setActiveKey(value);
    const app = Taro.getApp();
    const forceType = app.chartData?.forceType;
    if (forceType === 'line') {
      chartRef.current.setOption(handleOptions(buildLineDataset(chartData.current[value].data), 'line'));
    } else {
      chartRef.current.setOption(handleOptions(chartData.current[value].data, 'kline'));
    }
  };


  return (
    <View className='chart-box' style={Object.keys(safePadding).length ? safePadding : {}}>
      <View className='chartHeader'>
        <View className={`chart-close ${isPositionSize ? 'chart-close--ps' : ''}`} onClick={backPage}>
          <IconFont name='close' size={18} color='#000' />
        </View>
        {tabShow && (
          <TabBar className='chartTab' activeKey={activeKey} onChange={activeClick}>
            <TabBar.Item key='hour' title='1H' />
            <TabBar.Item key='day' title='1日' />
            <TabBar.Item key='week' title='1周' />
            <TabBar.Item key='month' title='1月' />
          </TabBar>
        )}
      </View>
      <View className='mychart'>
        <ec-canvas canvas-id="mychart-landscape" ec={{onInit: initChart}}></ec-canvas>
      </View>
    </View>
  )
}
