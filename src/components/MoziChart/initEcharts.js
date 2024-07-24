import * as echarts from '../ec-canvas/ec-canvas';
import { handleOptions } from './options';

export const initChart = (canvas, width, height, dpr, propsData, type) =>  {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart); 

  chart.setOption(handleOptions(propsData, type));

  return chart;
};