function provider(name, provider_) {
  assertNotHasOwnProperty(name, 'service');
  if (isFunction(provider_) || isArray(provider_)) {
    provider_ = providerInjector.instantiate(provider_);
  }
  if (!provider_.$get) {
    throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
  }
  return providerCache[name + providerSuffix] = provider_;
}

function enforceReturnValue(name, factory) {
  return function enforcedReturnValue() {
  var result = instanceInjector.invoke(factory, this);
  if (isUndefined(result)) {
  throw $injectorMinErr('undef', "Provider '{0}' must return a value from $get factory method.", name);
  }
  return result;
  };
}

function factory(name, factoryFn, enforce) {
  return provider(name, {
    $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
  });
}

function service(name, constructor) {
  return factory(name, ['$injector', function($injector) {
    return $injector.instantiate(constructor);
  }]);
}

function value(name, val) {
  return factory(name, valueFn(val), false);
}

function constant(name, value) {
  assertNotHasOwnProperty(name, 'constant');
  providerCache[name] = value;
  instanceCache[name] = value;
}