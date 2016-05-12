/**
 * Created by Administrator on 2016/5/12.
 */
var fs = require("fs");
var csv = require("csv");
console.log(csv());
csv()
    .from.stream(fs.createReadStream("../resource/600399.csv"))
    .to.path("../resource/600399_day.js")
    .transform(function(row){
        row.unshift(row.pop());
    })