import Ember from 'ember';

const get = Ember.get;

export default Ember.Router.extend({
  _getHandlerFunction: function() {
    var container = this.container;
    var DefaultRoute = container.lookupFactory('route:basic');
    var LazyLoaderRoute = container.lookupFactory('route:-lazy-loader');
    var lazyLoaderService = container.lookup('service:lazy-loader');

    var _this = this;

    return function(name) {
      var routeName = 'route:' + name;
      var lazyRouteName = routeName + '.lazy';
      var handler = container.lookup(routeName);
      var needsLazyLoading = !!lazyLoaderService.needsLazyLoading(name);

      if (!handler) {
        if (needsLazyLoading) {
          handler = container.lookup(lazyRouteName);
          if (!handler) {
            container._registry.register(lazyRouteName, LazyLoaderRoute.extend());
            handler = container.lookup(lazyRouteName);
            handler.routeName = name;
          }
          return handler;
        }
        container._registry.register(routeName, DefaultRoute.extend());
        handler = container.lookup(routeName);

        if (get(_this, 'namespace.LOG_ACTIVE_GENERATION')) {
          Ember.Logger.info("generated -> " + routeName, { fullName: routeName });
        }
      }

      handler.routeName = name;
      return handler;
    };
  }
});
