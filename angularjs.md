����:
module��ʲô? ��ʲô�õ�?


1.�����ṹ��������.
(function(window){})(window)


2.������������.

bindJQuery();

publishExternalAPI(angular);

/*** ע��1 ***/   jqLite.ready()..
jqLite(window.document).ready(function() {
????angularInit(window.document, bootstrap);
}
angularInit ---��bootstrap---��createInjector
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
window.setTimeout(trigger);                                  //setTimeoutû��ʱ�����,Ĭ�ϵĻ��Ƕ���.
} else {
this.on('DOMContentLoaded', trigger); // works for modern browsers and IE9                 //�ִ������DomContentLoadedʱ��.
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
3.angularInit���ã�
function angularInit(element, bootstrap) {}
??��������, appElement,module,config= {}, �����ֲ�����.
??ʹ����һ��ȫ�ֱ���: var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];
??��ʼ��appElement Ϊng-app�ȱ���.
���appElement = element; �����element����window.document.
???? module = element.getAttribute(name);   �����module��
bootstrap:
function bootstrap(element, modules, config) {
??????var doBootstrap = function(){
????????var injector = createInjector(modules, config.strictDi);
??????};
????  angular.resumeBootstrap = function(extraModules) {}
????
angular.resumeDeferredBootstrap();
}


4.createInjector ����
????instanceCache = {};
???    protoInstanceInjector
????var runBlocks = loadModules(modulesToLoad);

????loadModules(modulesToLoad){
??????ѭ������modulesToLoad, ��module����loadedModules<HashMap> ,���loadedModules���ڸ�module, ����.
??????forEach(modulesToLoad, function(module) {
????????loadedModules.put(module, true);
??????
????????moduleFn = angularModule(module);
????????/** **/moduleFn.requires���Ժ�_runBlocks��������.
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
5.HashMap��ʵ��:\
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













