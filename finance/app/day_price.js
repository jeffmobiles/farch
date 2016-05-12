/**
 * Created by Administrator on 2016/5/12.
 */
/**
 * 日线时间序列.
 * 1.http://vip.stock.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/600399.phtml?year=2016&jidu=1
 **/
var http = require("http");
var iconv = require("iconv-lite");
var jquery = require("jquery");
var bufferHelper = require("bufferhelper");
var cheerio = require("cheerio");

var day_config = {
    host : "vip.stock.finance.sina.com.cn",
    path : "/corp/go.php/vMS_MarketHistory/stockid/600399.phtml?year=2016&jidu=1"
}
var buffer = new bufferHelper();
var req = http.request(day_config,function(res){
    res.on("data",function(chunk){
        buffer.concat(chunk);
    });
    res.on("end",function(){
        var result = iconv.decode(buffer.toString(),"utf-8");
        exec(result);
    })
})
req.end();

/**
 处理抓取的数据
 **/
function exec(result){
    console.log(result.length);
    var $ = cheerio.load(result);  //获取dom
    console.log("$=",$("#FundHoldSharesTable>tbody>tr"));
    $("#FundHoldSharesTable>tbody").each(function(index,item){
        console.log(item);
    })
}