/**
 * Created by Administrator on 2016/4/19.
 */


define(function (require) {
    var app = require('module/app');
    console.log("app",app);
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'module/home/home.html'
            })
            .state('basketball', ({
                url: '/basketball',
                templateUrl: 'module/basketball/basketball.html',
                controllerUrl: 'module/basketball/basketball',
                controller: 'basketballCon',
            }))
            .state('football',({
                url: '/football',
                templateUrl: 'module/football/football.html',
                controllerUrl: 'module/football/football',
                controller: 'footballCon',
            }))
    }]);
});