$injector
angularjs中与DI相关有angular.module()、angular.injector()、 $injector、$provide。
对于一个DI容器来说，必须具备3个要素：服务的注册、依赖关系的声明、对象的获取。
angular中，module和$provide相当于是服务的注册；injector用来获取对象（angular会自动完成依赖的注入）；
依赖关系的声明在angular中有3种方式
1.angular.module()创建、获取、注册angular中的模块
2.$provider
3.3、angular.injector()

angular中三种声明依赖的方式
// 第一种inference
injector.invoke(function(myService){alert(myService.my);});
// 第二种annotation
function explicit(serviceA) {alert(serviceA.my);};
explicit.$inject = ['myService'];
injector.invoke(explicit);
// 第三种inline
injector.invoke(['myService', function(serviceA){alert(serviceA.my);}]);


function invoke(fn, self, locals, serviceName) {
  if (typeof locals === 'string') {
    serviceName = locals;
    locals = null;
  }

  var args = injectionArgs(fn, locals, serviceName);
  if (isArray(fn)) {
    fn = fn[fn.length - 1];
  }

  if (!isClass(fn)) {
  // http://jsperf.com/angularjs-invoke-apply-vs-switch
  // #5388
   return fn.apply(self, args);
  } else {
    args.unshift(null);
    return new (Function.prototype.bind.apply(fn, args))();
  }
}


  function injectionArgs(fn, locals, serviceName) {
    var args = [],
    $inject = createInjector.$$annotate(fn, strictDi, serviceName);

    for (var i = 0, length = $inject.length; i < length; i++) {
      var key = $inject[i];
      if (typeof key !== 'string') {
      throw $injectorMinErr('itkn',
      'Incorrect injection token! Expected service name as string, got {0}', key);
      }
      args.push(locals && locals.hasOwnProperty(key) ? locals[key] :getService(key, serviceName));
    }
    return args;
}
function getService(serviceName, caller) {
    if (cache.hasOwnProperty(serviceName)) {
    if (cache[serviceName] === INSTANTIATING) {
    throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
    serviceName + ' <- ' + path.join(' <- '));
    }
    return cache[serviceName];
    } else {
    try {
    path.unshift(serviceName);
    cache[serviceName] = INSTANTIATING;
    return cache[serviceName] = factory(serviceName, caller);
    } catch (err) {
    if (cache[serviceName] === INSTANTIATING) {
    delete cache[serviceName];
    }
    throw err;
    } finally {
    path.shift();
    }
    }
}