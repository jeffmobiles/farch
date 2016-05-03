/**
 * Created by Administrator on 2016/4/19.
 */

define(function(require,exports,module){
    var angular = require("angular");
    var asyncLoader = require("angular-async-loader");
    require("angular-ui-router");
    var cookie = require("angular-cookie");
    var translate = require("angular-translate");
    var resource = require("angular-resource");
    var app = angular.module("app",["ui.router","pascalprecht.translate","ngCookies","ngResource"]);
    asyncLoader.configure(app);
    module.exports = app;
})