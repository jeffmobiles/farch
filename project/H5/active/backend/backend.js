/**
 * Created by Administrator on 2016/5/13.
 */

/**
 * nodejs 实现后台功能, 提供restful接口.
 **/

var express = require("express");
var http = require("http");
var backend = express();

backend.set("port","8081");
backend.get("/access_token/:appid/:secret",function(req,resp){
    resp.set({'content-type':'text/json','Encoding':'utf8'});
    var appid = req.param("appid");
    var secret = req.param("secret");
    var weixinUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+secret;
})


http.createServer(backend).listen(backend.get("port"),function(){
    console.log("backend server listening on port;"+backend.get("port"));
    console.log("backend server is started.......");
})