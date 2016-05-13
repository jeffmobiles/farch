/**
 * Created by Administrator on 2016/5/13.
 */
/**
 * ��װ��weixin toolkit.
 * ����: ajax(��������������), sha1��
 *
 * ΢������: appid,secret,timestamp,nonceStr,jsApiList; signature��������.
 * ����΢�Ŷ��ĺ�: appid=wx394d0054a95db231,
 *                 secret = 8788e1413f60a11079d64b7598f06c1f
 * @type {{}}
 */
var weixin = {};

/** ע�⿪����������������.**/
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
        debug: true, // ��������ģʽ,���õ�����api�ķ���ֵ���ڿͻ���alert��������Ҫ�鿴����Ĳ�����������pc�˴򿪣�������Ϣ��ͨ��log���������pc��ʱ�Ż��ӡ��
        appId: '', // ������ںŵ�Ψһ��ʶ
        timestamp: new Date(), // �������ǩ����ʱ���
        nonceStr: '', // �������ǩ���������
        signature: '',// ���ǩ��������¼1
        jsApiList: [] // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2 }
    }
}

weixin.tool = {
    /**
     * @desp , ע��secret��Ҫ��ȫ�ķ��濼��.
     * @param appid
     * @param secret
     */
    requestAccessToken : function(appid,secret){
        console.log("proxy/proxy.jsp?url="+weixin.config.access_token_url.replace("{{$appid}}",appid).replace("{{$secret}}",secret));
        console.log("hello");
        $.ajax({
            type : "GET", // GET��Ĭ��type,����д�����Ǳ�ʾ΢�Žӿڷ�ʽΪGet.
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

