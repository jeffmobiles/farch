问题:
module是什么? 做什么用的?


1.整个结构匿名函数.
(function(window){})(window)


2.匿名函数里有.

bindJQuery();

publishExternalAPI(angular);

/*** 注意1 ***/   jqLite.ready()..
jqLite(window.document).ready(function() {
????angularInit(window.document, bootstrap);
}
angularInit ---》bootstrap---》createInjector
//////////////////////////////////////////
// Functions which are declared directly.
//////////////////////////////////////////
var JQLitePrototype = JQLite.prototype = {
ready: function(fn) {
var fired = false;
function trigger() {
if (fired) return;
fired = true;
fn();
}

// check if document is already loaded
if (window.document.readyState === 'complete') {
window.setTimeout(trigger);                                  //setTimeout没有时间参数,默认的话是多少.
} else {
this.on('DOMContentLoaded', trigger); // works for modern browsers and IE9                 //现代浏览器DomContentLoaded时间.
// we can not use jqLite since we are not done loading and jQuery could be loaded later.
// jshint -W064
JQLite(window).on('load', trigger); // fallback to window.onload for others
// jshint +W064
}
},
toString: function() {
var value = [];
forEach(this, function(e) { value.push('' + e);});
return '[' + value.join(', ') + ']';
},

eq: function(index) {
return (index >= 0) ? jqLite(this[index]) : jqLite(this[this.length + index]);
},

length: 0,
push: push,
sort: [].sort,
splice: [].splice
};
3.angularInit作用：
function angularInit(element, bootstrap) {}
??三个变量, appElement,module,config= {}, 三个局部变量.
??使用了一个全局变量: var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];
??初始化appElement 为ng-app等变量.
大概appElement = element; 这里的element就是window.document.
???? module = element.getAttribute(name);   这里的module是
bootstrap:
function bootstrap(element, modules, config) {
??????var doBootstrap = function(){
????????var injector = createInjector(modules, config.strictDi);
??????};
????  angular.resumeBootstrap = function(extraModules) {}
????
angular.resumeDeferredBootstrap();
}


4.createInjector 作用
????instanceCache = {};
???    protoInstanceInjector
????var runBlocks = loadModules(modulesToLoad);

????loadModules(modulesToLoad){
??????循环迭代modulesToLoad, 将module放入loadedModules<HashMap> ,如果loadedModules存在该module, 返回.
??????forEach(modulesToLoad, function(module) {
????????loadedModules.put(module, true);
??????
????????moduleFn = angularModule(module);
????????/** **/moduleFn.requires属性和_runBlocks属性链接.
????????runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
????????runInvokeQueue(moduleFn._invokeQueue);
????????runInvokeQueue(moduleFn._configBlocks);
??????}
????return runBlocks;
????}
????createInternalInjector
??????return {
????????invoke : invoke;
????????instantiate : instantiate;
????????get : getService;
????????annotate : createInjector.$$annotate,
????????has : function(name) {}
??????}???
????????
5.HashMap的实现:\
??Object["key"] = value;

?HashMap.prototype = {
/**
 * Store key value pair
 * @param key key to store can be any type
 * @param value value to store can be any type
 */
put: function(key, value) {
this[hashKey(key, this.nextUid)] = value;
},

/**
 * @param key
 * @returns {Object} the value for the key
 */
get: function(key) {
return this[hashKey(key, this.nextUid)];
},

/**
 * Remove the key/value pair
 * @param key
 */
remove: function(key) {
var value = this[key = hashKey(key, this.nextUid)];
delete this[key];
return value;
}
};













