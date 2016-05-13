/**
 * Created by Administrator on 2016/5/13.
 */
/**
 * 封装成weixin toolkit.
 * 依赖: ajax(包含跨域解决方案), sha1库
 *
 * 微信依赖: appid,secret,timestamp,nonceStr,jsApiList; signature是生产的.
 * 测试微信订阅号: appid=wx394d0054a95db231,
 *                 secret = 8788e1413f60a11079d64b7598f06c1f
 * @type {{}}
 */
var weixin = {};

/** 注意开发环境，生产环境.**/
weixin.account = {
    self : {
        appid : "wx394d0054a95db231",
        secret : "8788e1413f60a11079d64b7598f06c1f"
    },
    test : {
        appid : "wx7819ec8fd6b8005a",
        secret : "d4624c36b6795d1d99dcf0547af5443d"
    }
}


weixin.config = {
    "access_token_url":"https://api.weixin.qq.com/cgi-bin/token",
    "oauth2_access_token_url": "https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code",
    "oauth2_code":"https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect"
}

weixin.jssdk = {
    config: {
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: '', // 必填，公众号的唯一标识
        timestamp: new Date(), // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '',// 必填，签名，见附录1
        jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2 }
    }
}

weixin.tool = {
    /**
     * @desp , 注意secret需要安全的方面考虑.
     * @param appid
     * @param secret
     */
    requestAccessToken : function(appid,secret){
        console.log("proxy/proxy.jsp?url="+weixin.config.access_token_url.replace("{{$appid}}",appid).replace("{{$secret}}",secret));
        console.log("hello");
        $.ajax({
            type : "GET", // GET是默认type,这里写出来是表示微信接口方式为Get.
            url : "proxy/proxy.jsp?url="+weixin.config.access_token_url.replace("{{$appid}}",appid).replace("{{$secret}}",secret),
            dataType : "json",
            data : {
                grant_type : "client_credential",
                appid : appid,
                secret : secret
            },
            timeout : 3000,
            beforeSend : function(xhr){
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
            },
            success : function(data){
                console.log(data);
            },
            error : function(xhr,type){
                console.log(type);
            }
        })
    },
    /**
     *
     */
    jsonCallback : function(data){
        console.log("callback function:",data);
    }
}

