Component({
  properties: {
    // arrawsalt | close | info-circle | plus-square | moneycollect | attachment | share | wechat-fill | m-pingfen | info-circle-fill | file-copy | caret-down | caret-up | bodongfenxi | jijin | jiaoyichaxun | jifen | wangdian | piaowu | licaichanpin2 | licaichanpin | heart-fill | close-circle-fill | search | right
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer: function(color) {
        this.setData({
          isStr: typeof color === 'string',
        });
      }
    },
    size: {
      type: Number,
      value: 24,
      observer: function(size) {
        this.setData({
          svgSize: size / 750 * qq.getSystemInfoSync().windowWidth,
        });
      },
    },
  },
  data: {
    svgSize: 24 / 750 * qq.getSystemInfoSync().windowWidth,
    quot: '"',
    isStr: true,
  },
});
