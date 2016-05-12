/**
 * Created by Administrator on 2016/5/11.
 */
var http = require("http");
var config = require("./config");
var iconv = require("iconv-lite");
var jquery = require("jquery");
var BufferHelper = require("bufferhelper");
var cheerio = require("cheerio");
console.log(jquery);
//var cheerio = require("cheerio"); //����˲���dom,����������ʽ.
var code = "sh600399";
var date = "2016-05-11";
var page = 1;
var copy = function(source){
    var dst = {};
    for(var key in source){
        dst[key] = source[key];
    }
    return dst;
}
var option = {
    hostname : config.trade_detail.hostname,
    path : config.trade_detail.path + code+"&"+date+"&" // ���page����
}

/** 9����һҳ 9:33-9:42 **/
var openDate = new Date();
var midCloseDate = new Date();
openDate.setHours(9,25,00);
midCloseDate.setHours(11,30,00);
console.log(openDate,midCloseDate);

var afternoon_open_time = new Date();
afternoon_open_time.setHours(13,00,00);

var afternoon_close_time = new Date();
afternoon_close_time.setHours(15,00,00);

var currentDate = new Date();
console.log(currentDate);
var dateDiff = 0;
//�����ǰʱ�䴦�����̽���֮������̿�ʼ֮ǰ,��ȫ��������ʱ���, 15��8����=120����=2Сʱ.
if(currentDate > midCloseDate && currentDate < afternoon_open_time){
    dateDiff= 15;
}
//���������ǰʱ�䴦�������������,����������뿪�̹��೤ʱ��.
else if (currentDate < midCloseDate){
    dateDiff= (currentDate - openDate)/(1000*60) /8;
}
else if (currentDate > afternoon_open_time) {
    dateDiff = 15 + (currentDate - afternoon_open_time) / (1000 * 60) / 8;
    console.log(dateDiff);
}

console.log(parseInt(dateDiff));
page = parseInt(dateDiff) >=28 ? 28 : parseInt(dateDiff);

var power = 0;
var power_data = [];
    var reqOption = copy(option);
    reqOption.path = option.path + page;

    getHtmlContent(reqOption,caclPower);


function caclPower(result){
    var $ = cheerio.load(result);
    var this_power = 0;
    $("#datatbl>tbody>tr").each(function(i,e){
        //���page���ÿһ��.
        var trade_time,trade_price,trade_swing,trade_change,trade_vol,trade_amount,trade_type;
        $(e).find("td,th").each(function(index,tds){
            switch (index) {
                case 0 : trade_time = $(tds).text();
                case 1 : trade_price =$(tds).text();
                case 2 : trade_swing = $(tds).text();
                case 3 : trade_change =$(tds).text()!=="--"?$(tds).text() : 0;;
                case 4 : trade_vol = $(tds).text();
                case 5 : trade_amount =$(tds).text();
                case 6 : trade_type =$(tds).text();
            }

        });
        this_power += parseFloat(trade_change) * parseInt(trade_vol);
    });
    power_data.push(this_power);
    if(page > 1) {
        page = page -1;
        reqOption = copy(option);
        reqOption.path = option.path + (page);
        //console.log(reqOption.path);
        getHtmlContent(reqOption,caclPower)
    }
    if(page === 1) {
        for(var i = 0;i<power_data.length;i++){
            power += power_data[i];
        }
        console.log(power_data.length+"power="+power);
    }
}

/** �������ݵõ�ĳһҳ����ϸ.**/
function getHtmlContent(options,callback){
    var req = http.request(options,function(res){
        //console.log(".........begin......");
        var bufferhelper = new BufferHelper();
        res.on("data",function(chunk){
            bufferhelper.concat(chunk);
            //console.log(bufferhelper.toBuffer());
        });
        res.on("end",function(){
            var result = iconv.decode(bufferhelper.toString(),"utf-8");
            callback(result);
        })
    }).on("error",function(e){
        console.log(e);
    });
    req.end();
}
function getMultipleHtmlContent(options,callback){
    var htmlContent;
    var req ;
    for(var i = parseInt(dateDiff);i>=1;i--){
        req =http.request(option+i,function(res){
            console.log(".........begin......");
            var bufferhelper = new BufferHelper();
            res.on("data",function(chunk){
                bufferhelper.concat(chunk);
            });
            res.on("end",function(){
                var result = iconv.decode(bufferhelper.toString(),"utf-8");
                htmlContent +=result;
            })
        }).on("error",function(e){
            console.log(e);
        });
    }
    req.end();
}