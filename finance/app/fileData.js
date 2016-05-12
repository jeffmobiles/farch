/**
 * Created by Administrator on 2016/5/12.
 */
var fs = require("fs");
var csv = require("csv");
var iconv = require("iconv-lite");
var bufferHelper = require("bufferhelper");


//var buffer = new bufferHelper();
//var input  = fs.createReadStream("../app/resouce/600399.csv");
//
//var transformer = csv.transform(function(record){
//       var row = iconv.decode(record,"utf-8");
//       return row;
//})
//
//transformer.on("readable",function(){
//    while(data = transformer.read()){
//        console.log("b,",data);
//    }
//})
//var csv = require('csv');

var output = [];
var parser = csv.parse({delimiter: ':'})
var input = fs.createReadStream('../app/resouce/600399.csv');
var output = fs.createWriteStream("../app/resouce/600399.js");
var index = 0;
var transformer = csv.transform(function(record, callback){
    setTimeout(function(){
        //console.log(record.toString().split(",")[1] +"\n");
        //Date,Open,High,Low,Close,Volume,Adj Close
        var item = record.toString().split(",");
        var date = item[0];
        var open = item[1];
        var high = item[2];
        var low = item[3];
        var close = item[4];
        var vol = item[5];
        var adj = item[6];
        if (index = 0) {
            callback(null,"var p =[");
        } else {
            if(index / 100 === 0) {
                callback(null, close+',');
            } else {
                callback(null, close+','+"\n");
            }
        }
        index++;
    }, 500);
}, {parallel: 10});

input.pipe(parser).pipe(transformer).pipe(output);

