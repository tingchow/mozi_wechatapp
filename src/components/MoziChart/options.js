export const handleOptions = (data, type, msg) => {

  console.log(data, type)
  if (type === 'kline') {
    // 币圈遵循国外 绿涨红跌 原则
    // const upColor = '#00da3c';  // 阳线颜色
    const upColor = '#02c076';  // 阳线颜色
    const upBorderColor = '#008F28'; // 阳线边框颜色
    // const downColor = '#ec0000'; // 阴线颜色
    const downColor = '#ff3333'; // 阴线颜色
    const downBorderColor = '#8A0000'; // 阴线边框颜色

    // 处理传入数据
    const handleData = (data) => {
      console.log('传入数据', data);
      const categoryData = [];
      const values = [];
      data.forEach((item) => {
        categoryData.push(item.dt);
        values.push([item.Open, item.Close, item.Low, item.High]);
      });
      return {
        categoryData,
        values,
      };
    };

    // 计算MA线数据
    const calculateMA = (dayCount, data) => {
      const result = [];
      for (let i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
          result.push('-');
          continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
          sum += +data.values[i - j][1];
        }
        result.push(sum / dayCount);
      }
      return result;
    };

    return {
      legend: {
        type: 'scroll',
        data: ['K线', 'MA5', 'MA10', 'MA20', 'MA30'],
        selected: {
          'K线': true,
          'MA5': false,
          'MA10': false,
          'MA20': false,
          'MA30': false,
        }
      },
      // 移动端暂不展示tooltip，需要考虑更好的展示方法
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
        // triggerOn: 'none',
        // transitionDuration: 0,
        // confine: true,
      },
      animation: false,
      animationDurationUpdate: 0,
      grid: {
        // left: '10%',
        // right: '10%',
        // bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: data.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        },
        // 科学记数法
        // axisLabel: {
        //   formatter: function (value) {
        //     if (Math.abs(value) > 100000) {
        //         if (value == 0) {
        //             return "0";
        //         } else if ((value + '').indexOf('e') > 0) {
        //             return (value + '').replace(/e/, "E");
        //         } else {
        //             var res = value.toString();
        //             var numN1 = 0;
        //             var numN2 = 0;
        //             var num1 = 0;
        //             var num2 = 0;
        //             var t1 = 1;

        //             for (var k = 0; k < res.length; k++) {
        //                 if (res[k] == ".")
        //                     t1 = 0;
        //                 if (t1)
        //                     num1++;
        //                 else
        //                     num2++;
        //             }

        //             // 均转换为科学计数法表示

        //             if (Math.abs(value) < 1) {
        //                 // 小数点后一位开始计算
        //                 for (var i = 2; i < res.length; i++) {
        //                     if (res[i] == "0") {
        //                         numN2++; //记录10的负指数值（默认值从1开始）
        //                     } else if (res[i] == ".")
        //                         continue;
        //                     else
        //                         break;
        //                 }

        //                 var v = parseFloat(value);
        //                 v = v * Math.pow(10, numN2);
        //                 v = v.toFixed(1); //四舍五入 仅保留一位小数位数
        //                 return v.toString() + "e-" + numN2;
        //             } else if (num1 > 1) {
        //                 numN1 = num1 - 1;
        //                 var v = parseFloat(value);
        //                 v = v / Math.pow(10, numN1);
        //                 if (num2 > 1) {
        //                     v = v.toFixed(1);
        //                 }
        //                 return v.toString() + "e" + numN1;
        //             }

        //         }
        //     } else {
        //         return value;
        //     }
        //   }
        // }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          // 需要展示滑动块，用来辅助
          show: true,
          type: 'slider',
          start: 70,
          end: 100,
          top: '87%',
          height: 20
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: data.values,
          scale: true,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor
          },
          markPoint: {
            label: {
              formatter: function (param) {
                return param != null ? Math.round(param.value) + '' : '';
              }
            },
            data: [
              {
                name: 'highest value',
                type: 'max',
                valueDim: 'highest'
              },
              {
                name: 'lowest value',
                type: 'min',
                valueDim: 'lowest'
              },
            ],
            tooltip: {
              triggerOn: 'none',
              formatter: function (param) {
                return param.name + '<br>' + (param.data.coord || '');
              },
              confine: true
            }
          },
          markLine: {
            symbol: ['none', 'none'],
            data: [
              [
                {
                  name: 'from lowest to highest',
                  type: 'min',
                  valueDim: 'lowest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    show: false
                  },
                  emphasis: {
                    label: {
                      show: false
                    }
                  }
                },
                {
                  type: 'max',
                  valueDim: 'highest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    show: false
                  },
                  emphasis: {
                    label: {
                      show: false
                    }
                  }
                }
              ],
              {
                name: 'min line on close',
                type: 'min',
                valueDim: 'close'
              },
              {
                name: 'max line on close',
                type: 'max',
                valueDim: 'close'
              }
            ]
          }
        },
        {
          name: 'MA5',
          type: 'line',
          data: calculateMA(5, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA10',
          type: 'line',
          data: calculateMA(10, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA20',
          type: 'line',
          data: calculateMA(20, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA30',
          type: 'line',
          data: calculateMA(30, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
      ]
    };
  }

  if (type === 'treemap') {
    return {
      series: [
        {
          type: 'treemap',
          // roam: 'scale',
          // zoomToNodeRatio: 0.1,
          label: {
            show: true,
            position: ['5%', '30%'],
            formatter: (info) => {
              let tip = [
                  `{nameClass|${info.name}}`,
                  `{valueClass|${info.data.valueDisplay}}`
                ].join('\n');
              return tip;
            },
            rich: {
              //块内文字样式
              // nameClass: {
              //   fontSize: 30,
              //   // lineHeight: 10,
              //   fontWeight: 400
              // },
              // valueClass: {
              //   fontSize: 15,
              //   fontWeight: 200
              // },
            }
          },
          data,
          itemStyle: {
            // color: (info) => {
            //   console.log('color', info.data?.state === 1? '#02c076': '#ff3333');
            //   return info.data?.state === 1? '#02c076': '#ff3333'
            // }
            borderColor: '#fff'
          },
          levels: [{
            itemStyle: {
              borderWidth: 0,
              gapWidth: 1
            }
          }],
          breadcrumb: {
            show: false //隐藏底部导航条
          }
        }
      ],
      tooltip: {
        //弹出框配置
        formatter: function (info) {
          let value = info.value;
          let valueDisplay = info.data.valueDisplay;
          let name = info.name;
          console.log('treemap-msg', msg);
          let tip =  `
              ${name}
              ${msg}: ${valueDisplay}
          `;
          return tip;
        },
        backgroundColor: 'rgba(0,0,0,0.9)',
        // padding: 2,
        borderWidth: 0,
        textStyle: {
          color: '#fff'
        },
        confine: true
      },
    }
  }

  if (type === 'pie') {
    return {
      // tooltip: {
      //   trigger: 'item',
      // },
      legend: {
        top: '5%',
        left: 'center',
        type: 'scroll'
      },
      series: [
        {
          // name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              // fontSize: 40,
              // fontWeight: 'bold',
              formatter: '{b}: {c}'
            },
            
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    }
  }

  if (type === 'samebar') {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          // Use axis to trigger tooltip
          type: 'line' // 'shadow' as default; can also be 'line' or 'shadow'
        }
      },
      legend: {
        selectedMode: false
      },
      yAxis: [{
        type: 'value',
      }, {
        type: 'value',
      }],
      xAxis: {
        type: 'category',
        data: data.xAxisData
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          // 需要展示滑动块，用来辅助
          show: true,
          type: 'slider',
          start: 80,
          end: 100,
          top: '87%',
          height: 20
        }
      ],
      
      series: [
        {
          name: '空',
          type: 'bar',
          stack: 'total',
          // label: {
          //   show: true,
          //   formatter: (params) => params.value *100 + '%'
          // },
          color: '#ff3333',
          data: data.shortData
        },
        {
          name: '多',
          type: 'bar',
          stack: 'total',
          color: '#02c076',
          // label: {
          //   show: true,
          //   formatter: (params) => params.value* 100 + '%'
          // },
          emphasis: {
            focus: 'series'
          },
          data: data.longData
        },
        {
          name: '多空比',
          type: 'line',
          yAxisIndex: 1,
          data: data.longShortData
        }
      ]
    }
  }

  if (type === 'linebar') {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (info) {
          console.log('info', info);
          let valueList = info[0].data.toolTips;
          let tips = '';
          valueList.forEach((item) => {
            tips += `
              ${item.exchange}${item.value}
            `
          });
          return tips;
        }
      },
      legend: {
        selectedMode: false
      },
      xAxis: [
        {
          type: 'category',
          data: data.xAxisData,
          axisPointer: {
            type: 'line'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: (value) => data.yAxisLeftSlot.replace('{}', value) ?? value
          }
        },
        {
          type: 'value',
          axisLabel: {
            formatter: (value) => data.yAxisRightSlot.replace('{}', value) ?? value
          }
        }
      ],
      series: [
        {
          name: '持仓',
          type: 'bar',
          data: data.barData
        },
        {
          name: '价格',
          type: 'line',
          yAxisIndex: 1,
          data: data.lineData
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          // 需要展示滑动块，用来辅助
          show: true,
          type: 'slider',
          start: 80,
          end: 100,
          top: '87%',
          height: 20
        }
      ],
    };
  }

  if (type === 'updownbarline') {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (info) {
          console.log('info', info);
          let valueList = info[0].data.toolTips;
          let tips = '';
          valueList.forEach((item) => {
            tips += `
              ${item.url}${item.exchange}${item.value}
            `
          });
          return tips;
        }
      },
      legend: {
        selectedMode: false
      },
      xAxis: [
        {
          type: 'category',
          data: data.xAxisData,
          axisPointer: {
            type: 'line'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: (value) => data.yAxisLeftSlot.replace('{}', value) ?? value
          }
        },
        {
          type: 'value',
          axisLabel: {
            formatter: (value) => data.yAxisRightSlot.replace('{}', value) ?? value
          }
        }
      ],
      series: [
        {
          // name: '',
          type: 'bar',
          stack: 'one',
          color: '#02c076',
          data: data.upData
        },
        {
          // name: '',
          type: 'bar',
          stack: 'one',
          color: '#ff3333',
          data: data.downData
        },
        {
          // name: '价格',
          type: 'line',
          yAxisIndex: 1,
          data: data.coinFee
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          // 需要展示滑动块，用来辅助
          show: true,
          type: 'slider',
          start: 80,
          end: 100,
          top: '87%',
          height: 20
        }
      ],
    };
  }
};
