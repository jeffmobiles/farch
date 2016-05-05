/*
combined files : 

trip-smart-banner/smartbannerUI

*/
//@require smartbanner

;(function(win){
    var doc = document;
    var ua = navigator.userAgent;
    function getQuery(param) {
        var value = location.search.match(new RegExp('[\?\&]' + param + '=([^\&]*)(\&?)', 'i'));
        return value ? value[1] : value;
    }
    
    var SmartBanner;//唤起功能统一接入callout 2015.8.28
    // if(window.MT && window.MT.Callout){
    //     SmartBanner = MT.Callout();
    // }

    var SmartbannerUI = function(options) {
        var that = this;
        // that.sm = new SmartBanner({
        //     extParams : function() {
        //         return {};
        //     }
        // });
        if (that.calClose() || that.isTrip() || that.isAlipay() || that.isTaobao() || that.isTaobaoClient() || that.isTmall() || that.isUC() || that.isTaobaoH5() || getQuery('hideSM') == '1') return; //关闭则返回空
        that.setParam(options);
        that.createHtml();
    }

    SmartbannerUI.prototype = {
        constructor: SmartbannerUI,

        calClose : function(){
            var storage = window.localStorage;  //有些webview会禁用localstorage
            if(!storage) return;
            var closeDate = storage["closeDate"];
            var time = new Date().getTime();
            if(closeDate && time < closeDate) {
                this.iClose = true; 
            }
            return this.iClose;
        },

        setParam : function(options){//初始化参数
            this.isHide = options.hide=="0" || false;
            this.logoUrl = options.logoUrl || "//gw.alicdn.com/tps/i2/TB1NfnwGFXXXXXgXpXX07tlTXXX-200-200.png";
            this.text1 = options.text1 || '阿里旅行·去啊 送红包';
            this.text2 = options.text2 || '最高500元';
            this.buttonText = options.buttonText || "马上去抢";

            this.isPopMask = options.isPopMask=="1" || false;
            this.renderTo = options.renderTo || 'body';
            this.templateHtml = options.template || this.template();
            this.actionPara = options.action;
            this.downId = getQuery('downId') || "702851";
        },

        template : function(){
            var hide = this.isHide,
            tpl = ['<div class="J_smartBanner trip-smartbanner" '+(hide ? "style=\"display:none;\"" : "") +'>',
                        '<a class="smartAd-close J_smartClose" href="javascript:;"></a>',
                        '<div class="des">',
                            '<img src= "'+ this.logoUrl + '">',
                            '<div>',
                                '<span>' + this.text1 + '</span>',
                                '<span>' + this.text2 + '</span>',
                            '</div>',
                        '</div>',
                        '<a class="smartAd-open J_smartOpen" href="javascript:;">' + this.buttonText + '</a>',
                    '</div>'+
                    '<div class="smartbanner-mark" style="display:none;">'+
                        '<div class="holder">'+
                            '<a class="J_smartClose close" href="javascript:;"></a>'+
                            '<img src="//gw.alicdn.com//tps/i1/TB1bNz4JXXXXXb7aXXXFKF3MFXX-576-812.png">'+
                            '<a class="J_smartOpen open" href="javascript:;"></a>'+
                        '</div>'+
                    '</div>'];
            return tpl.join('');
        },

        createHtml : function() {
            var smartDom = this.templateHtml, tempDiv = doc.createElement('div');
            tempDiv.innerHTML = smartDom;
            this.smartDom = tempDiv.querySelector('.J_smartBanner');
            this.smartPop = tempDiv.querySelector('.smartbanner-mark');
            doc.querySelector(this.renderTo).appendChild(this.smartDom);
            if(!this.isHide && this.isPopMask){//H5首页展示弹层
                doc.querySelector(this.renderTo).appendChild(this.smartPop);
                document.querySelector(".smartbanner-mark").style.display="block";
            }
            
            this.listen();
        },

        listen: function (){
            var that = this;
            var smartDom = that.smartDom;
            var closeNode =  smartDom.querySelector('.J_smartClose');
            var openNode = document.querySelector('.J_smartOpen');

            var mask_open = document.querySelector(".smartbanner-mark .open");
            var mask_close = document.querySelector(".smartbanner-mark .close");

            closeNode && closeNode.addEventListener('click',function(e){
                window.goldlog && goldlog.record('/tbtrip.212.2','','','H46807196');
                
                e.preventDefault();
                e.stopPropagation(); 
                that.hide();
                var nowTime = new Date();
                nowTime.setDate(parseInt(nowTime.getDate())+1);
                window.localStorage["closeDate"] = nowTime.getTime();//关闭24小时过期

            },false);
            smartDom && smartDom.addEventListener('click',function(e){
                window.goldlog && goldlog.record('/tbtrip.212.1','','','H46807174');

                e.preventDefault();
                window.TAOBAOKE_CALLOUT.call();//唤起逻辑
                if(window.navigator.userAgent.match(/iPhone|iPod|iPad/i)){
                    location.href = '//h5.m.taobao.com/trip/router/alitrip.html';
                }else{
                    var ali_trackid = getQuery('ali_trackid');//兼容四个已投放的渠道
                    if(ali_trackid){
                        if(ali_trackid.indexOf("mm_33231696_5924724_20988309") > -1){
                            that.downId = "10003299";
                        }else if(ali_trackid.indexOf("mm_33231696_5924724_20986572") > -1){
                            that.downId = "10003300";
                        }else if(ali_trackid.indexOf("mm_33231696_5952393_20860259") > -1){
                            that.downId = "10003301";
                        }else if(ali_trackid.indexOf("mm_33231696_5952393_20992215") > -1){
                            that.downId = "10003302";
                        }
                    }

                    var taobaoH5_ttid="12mtb0000155,12mtb0000102,12mtb0000103,12mtb0000104,12mtb0000105,12mtb0000106,12mtb0000129,12mtb0000130";
                    if(getQuery("ttid") && taobaoH5_ttid.indexOf(getQuery("ttid")) > -1){//淘宝wap渠道
                        that.downId = "10004663";
                    }

                    //更新成最新的下载中转页链接
                    var url = "//h5.m.taobao.com/trip/router/alitrip.html?androidUrl=https%3A%2F%2Fdownload.alicdn.com%2Fnbdev-client%2Fclient4trip%2Fchannel%2Ftrip_" + that.downId + "%40travel_android.apk&trigger=1998935450";
                    location.href = url;
                }
            });

            mask_close && mask_close.addEventListener('click',function(){
                window.goldlog && goldlog.record('/tbtrip.212.3','','','H46807197');
                document.querySelector(".smartbanner-mark").style.display="none";
            });

            mask_open && mask_open.addEventListener('click',function(){//模拟点击事件
                
                if(typeof smartDom.click=="function"){
                    smartDom.click();
                }else{
                    var e = document.createEvent('MouseEvent');
                    e.initEvent('click', false, false);
                    smartDom.dispatchEvent(e);
                }
            });

        }, 

        hide : function(){
            this.smartDom && (this.smartDom.style.display = 'none');
        },

        isTaobao: function(){
             if(typeof smartbanner_mask_app != "undefined" && smartbanner_mask_app.isTaobao != "1"){
                return false;
            }
            return ua.match(/AliApp\(TB/i);
        },

        isTrip: function(){
            if(typeof smartbanner_mask_app != "undefined" && smartbanner_mask_app.isTrip != "1"){
                return false;
            }
            return ua.match(/alitrip/i);
        },

        isAlipay: function(){
            if(typeof smartbanner_mask_app != "undefined" && smartbanner_mask_app.isAlipay != "1"){
                return false;
            }
            return ua.match(/alipay/i);
        },

        isTmall: function(){
            if(typeof smartbanner_mask_app != "undefined" && smartbanner_mask_app.isTmall != "1"){
                return false;
            }
            return ua.match(/AliApp\(TM/i);
        },

        isUC: function(){
            if(typeof smartbanner_mask_app != "undefined" && smartbanner_mask_app.isUC != "1"){
                return false;
            }

            // add by buju
            // 手机上的UC浏览器UA是'Mobile UCBrowser'，支付宝的UC内核webview是'UCBrowser'，不要误杀
            return ua.match(/Mobile UCBrowser/i);
        },

        isTaobaoH5: function(){//淘宝wap页面放开，2015.7.7
            if(typeof smartbanner_mask_app != "undefined" && smartbanner_mask_app.isTaobaoH5 != "1"){
                return false;
            }
            return getQuery("ttid") == "12mtb0000155"; 
        },

        isTaobaoClient: function(){
            if(typeof smartbanner_client_ttid != "undefined" && getQuery("ttid")){
                return smartbanner_client_ttid.indexOf(getQuery("ttid")) > -1;
            }
            return false;
        }
    }

    win.BannerUI = SmartbannerUI;

})(window)

