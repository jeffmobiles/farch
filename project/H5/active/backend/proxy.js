/**
 * Created by Administrator on 2016/5/13.
 */
var http = require('http'),
    fs = require("fs"),
    url = require('url'),
    querystring = require('querystring')


function onRequest(req, res) {

    console.log("proxy server 8081 is started...");
    var reqUrl = req.url
    if ('/' == reqUrl || 'favicon.ico' == reqUrl) {
        return res.end('Im debugger')
    }
    var proxySet = req.headers.ps
    console.log(proxySet)
    if (proxySet)  proxySet = JSON.parse(proxySet)

    proxySet = proxySet || {}
    delete req.headers.ps
    res.writeHead(200 ,{'Content-Type': 'text/plain','Cache-Control': 'no-cache,no-store'})

    if (proxySet.cache){
        var cacheFile = './cache/'+ proxySet.cache
        if (!fs.existsSync(cacheFile)) fs.mkdirSync(cacheFile)
        cacheFile += '/'+ reqUrl.replace(/^\//,'').replace(/\//g,'-')
        if (fs.existsSync(cacheFile)){
            console.log('from cache ' , cacheFile)
            return fs.createReadStream(cacheFile).pipe(res)
        }
    }



    var source = 'target.com'

    delete req.headers['accept-encoding']

    var httpProxy = getProxy(source , req ,res ,cacheFile)
    req.pipe(httpProxy)
}


function getProxy(host , req ,res , cacheFile){
    var backTimeoutTTL = 20000
    req.headers.host = host
    var options = {
        host : host,
        port : 80 ,
        headers: req.headers,
        path : req.url,
        agent : false,
        method : req.method ,
    };
    var request_timer;
    var httpProxy = http.request(options , function(response) {
        if (request_timer) clearTimeout(request_timer)
        response.setEncoding('utf8')
        response.pipe(res)
        cacheFile && response.pipe(fs.createWriteStream(cacheFile))
    });
    httpProxy.on('error' , function(e){
        res.end('error happend :' + req.url)
    })
    request_timer = setTimeout(function() {
        console.log('request timeout [%s] %s' , host , req.url)
        httpProxy.abort();
        res.end('request timeout :' + req.url)
    }, backTimeoutTTL);
    return httpProxy

}

http.createServer(onRequest).listen(63342)