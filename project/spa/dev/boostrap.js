/**
 * Created by Administrator on 2016/4/19.
 */


require.config({
    baseUrl : "/",
    paths : {
        "angular" : "lib/angular",
        "angular-translate" : "lib/angular-translate.min",
        "angular-cookie" : "lib/angular-cookies.min",
        "angular-resource" : "lib/angular-resource.min",
        "angular-ui-router" : "lib/angular-ui-router",
        "angular-async-loader" : "lib/angular-async-loader"
    },
    shim : {
        "angular" : {exports : "angular"},
        "angular-ui-router" : {deps : ["angular"]},
            "angular-translate" : {deps : ["angular"]},
            "angular-cookie" : {deps : ["angular"]},
        "angular-resource" : {deps : ["angular"]}
    }
})

require(['angular', 'module/app-router'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});

