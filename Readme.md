1.https://github.com/jeffmobiles/farch.git



Angularjs:
1.directive 写法:

AMD :

1.angularjs dependency inject & requirejs dependecncy management.
. It is important to remember that the purpose of both the libraries is totally different. The dependency injection system built into AngularJS deals with the objects needed in a component;
while dependency management in RequireJS deals with the modules or, JavaScript files.
When RequireJS attempts to load a module, it checks for all dependent modules and loads them first. Objects of loaded modules are cached and they are served when same modules are requested again.
On the other hand, AngularJS maintains an injector with a list of names and corresponding objects.
An entry is added to the i
njector when a component is created and the object is served whenever it is referenced using the registered name.

2.angularjs 如何管理依赖的, $injector是什么, 如何管理的.

