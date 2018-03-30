//index.js
//获取应用实例
var app = getApp()
//var WxDate = require('../../utils/util.js');
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    adiconlength:0,
    categories: [],
    activeCategoryId: 0,
    goods:[],
    goods1: [],
    scrollTop:"0",
    loadingMoreHidden:true,
    hasNoCoupons:true,
    coupons: [],
    searchInput: '',
    clock:"",
    closenotice:"结束仅剩",
    more_notice: "更多 >",
    dateNow:"", 
    dateEnd:""
    
  },

  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  toDetailsTapMore: function (e) {
    
    this.setData({
      more_notice: "没有更多了！！！",
    })
    
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  scroll: function (e) {
    //  console.log(e) ;
    var that = this,scrollTop=that.data.scrollTop;
    that.setData({
      scrollTop:e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /*
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    */
    wx.request({
      url: 'https://api.it120.cc/2cecca99fe1c8f0d813c4a4e19eacf14/banner/list',
      data: {
        key: 'mallName',
        icon: [],
        ad: [],
      },
      success: function(res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
            
            that.setData({
              ad: res.data.data.filter(function (x, index, self) {
                return self[index].type == "ad";
              }),
              icon: res.data.data.filter(function (x, index, self) {
                return self[index].type == "icon";
              }),
            })

            
        }
      }
    })

    //clock
    
    
    var total_second = 2 * 60 * 60 * 1000;
    function count_down(that) {
      that.setData({
        clock: date_format(total_second)
      });
      if (total_second <= 0) {
        that.setData({
          clock: "over",
          closenotice: "已经截止"
        });
        return;
      }
      setTimeout(function () {
        total_second -= 1000;
        count_down(that);
      }, 1000)
    }
    function date_format(second) {
      var second = Math.floor(second / 1000);
      var hr = Math.floor(second / 3600);
      var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
      var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;
          return hr + ":" + min + ":" + sec;
    }
    function fill_zero_prefix(num) {
      return num < 10 ? "0" + num : num
    }
    count_down(this);



    wx.request({
      url: 'https://api.it120.cc/2cecca99fe1c8f0d813c4a4e19eacf14/shop/goods/category/all',
      success: function(res) {
        var categories = [{ id:0, name: "全部" } ];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:0
        });
        that.getGoodsList(0);
      }
    })
    that.getCoupons ();
    that.getNotice ();
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    
    wx.request({
      url: 'https://api.it120.cc/2cecca99fe1c8f0d813c4a4e19eacf14/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput
      },
      success: function (res) {
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        for (var i = 0; i < res.data.data.length; i++) {
          goods.push(res.data.data[i]);
        }
        that.setData({
          goods: goods.filter(function (x, index, self) {
            return self[index].recommendStatusStr == "推荐";
          }),
          goods1: goods
        })
      }
    })
  },

  getCoupons: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/2cecca99fe1c8f0d813c4a4e19eacf14/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
        }
      }
    })
  },
  gitCoupon : function (e) {
    var that = this;
    wx.request({
      url: "https://api.it120.cc/2cecca99fe1c8f0d813c4a4e19eacf14/discounts/fetch",
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: "https://api.it120.cc/2cecca99fe1c8f0d813c4a4e19eacf14/notice/list",
      data: { pageSize :5},
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch : function (){
    this.getGoodsList(this.data.activeCategoryId);
  }
})
