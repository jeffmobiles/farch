/**
 * Created by Administrator on 2016/4/19.
 */

define(function (require) {
    var app = require('../app');
    // dynamic load services here or add into dependencies of state config
    // require('../services/usersService');
    app.controller('footballCon', ['$scope', function ($scope) {
        $scope.name = "welcome fffffff";
    }]);

});