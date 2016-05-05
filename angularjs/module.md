You can think of a module as a Container for the different parts of your app – controllers, services, filters, directives, etc.
模块是一个容器包含控制器,服务,过滤器,指令等不同部分.
The $provide service has a number of methods for registering components with the $injector. Many of these functions are also exposed on angular.Module.
$provide 服务有一系列用$injector注册组件的方法
$provide提供了provide()、constant()、value()、factory()、service()来创建各种不同性质的服务
angular.Module中也提供了这5个服务注册方法。其实2者功能是完全一样的，就是用来向DI容器注册服务到injector中。


        setupModuleLoader(window)
        这个方法 确保window['angular']=Object是个对象.
                 确保angualr["module"]= function
                 然后返回angualr.module这个函数
function setupModuleLoader(window) {
  console.log("setupModuleLoader......",window);
  var $injectorMinErr = minErr('$injector');
  var ngMinErr = minErr('ng');

  function ensure(obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }

  var angular = ensure(window, 'angular', Object);

  // We need to expose `angular.$$minErr` to modules such as `ngResource` that reference it during bootstrap
  angular.$$minErr = angular.$$minErr || minErr;

  return ensure(angular, 'module', function() {})