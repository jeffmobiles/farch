/**
 * Created by Administrator on 2016/5/5.
 */
    /** 1-----------------------------------΢�Ŵ�-----------------------------**/
var ua = navigator.userAgent.toLowerCase();
var isWeixin = ua.indexOf('micromessenger') != -1;
var isAndroid = ua.indexOf('android') != -1;
var isIos = (ua.indexOf('iphone') != -1) || (ua.indexOf('ipad') != -1);
if (!isWeixin) {
    document.head.innerHTML = '<title>��Ǹ��������</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/connect/zh_CN/htmledition/style/wap_err1a9853.css">';
    document.body.innerHTML = '<div class="page_msg"><div class="inner"><span class="msg_icon_wrp"><i class="icon80_smile"></i></span><div class="msg_content"><h4>����΢�ſͻ��˴�����</h4></div></div></div>';
}