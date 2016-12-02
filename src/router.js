import { stream } from 'flyd';

import buildQueryString from './util/querystring.build';
import parseQueryString from './util/querystring.parse';
import { isNil } from './util/is';

const hasOwn = Object.prototype.hasOwnProperty;

export default ($window) => {
  const params$ = stream();
  const route$ = stream();
  const path$ = stream();

  const routeMatchers = {};
  const supportsPushState = typeof $window.history.pushState === 'function';
  const callAsync = typeof setImmediate === 'function'
    ? setImmediate : setTimeout; // eslint-disable-line no-undef

  let prefix = '#!';
  function setPrefix(value) {
    prefix = value;
  }

  function normalize(fragment) {
    let data = $window.location[fragment]
      .replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);

    if (fragment === 'pathname' && data[0] !== '/') {
      data = '/' + data;
    }
    return data;
  }

  let asyncId;
  function debounceAsync(f) {
    return () => {
      if (isNil(asyncId)) {
        return false;
      }

      return (asyncId = callAsync(() => {
        asyncId = null;
        f();
      }));
    };
  }

  function parsePath(path, queryData, hashData) {
    const queryIndex = path.indexOf('?');
    const hashIndex = path.indexOf('#');
    const pathEnd = queryIndex > -1
      ? queryIndex : hashIndex > -1 ? hashIndex : path.length;

    if (queryIndex > -1) {
      const queryEnd = hashIndex > -1 ? hashIndex : path.length;
      const queryParams = parseQueryString(
        path.slice(queryIndex + 1, queryEnd)
      );

      Object.keys(queryParams).forEach((key) => {
        queryData[key] = queryParams[key];
      });
    }

    if (hashIndex > -1) {
      const hashParams = parseQueryString(path.slice(hashIndex + 1));

      Object.keys(hashParams).forEach((key) => {
        hashData[key] = hashParams[key];
      });
    }

    return path.slice(0, pathEnd);
  }

  function getPath() {
    const type = prefix.charAt(0);

    /* eslint-disable max-len, indent */
    switch (type) {
      case '#':
        return normalize('hash').slice(prefix.length);
      case '?':
        return normalize('search').slice(prefix.length) + normalize('hash');
      default:
        return normalize('pathname').slice(prefix.length) + normalize('search') + normalize('hash');
    }
    /* eslint-enable max-len, indent */
  }

  function setPath(path, data, options = {}) {
    const queryData = {};
    const hashData = {};
    path = parsePath(path, queryData, hashData);

    if (!isNil(data)) {
      Object.keys(data).forEach((key) => {
        queryData[key] = data[key];
      });

      path = path.replace(/:([^\/]+)/g, (match, token) => {
        delete queryData[token];
        return data[token];
      });
    }

    const query = buildQueryString(queryData);
    if (query) {
      path += '?' + query;
    }

    const hash = buildQueryString(hashData);
    if (hash) {
      path += '#' + hash;
    }

    if (supportsPushState) {
      if (options.replace) {
        $window.history.replaceState(null, null, prefix + path);
      } else {
        $window.history.pushState(null, null, prefix + path);
      }
      $window.onpopstate();
    } else {
      $window.location.href = prefix + path;
    }
  }

  function getMatcher(route) {
    /* eslint-disable max-len */
    return routeMatchers[route] || (routeMatchers[route] = new RegExp(`^${route}`.replace(/:[^\/]+?\.{3}/g, '(.*?)').replace(/:[^\/]+/g, '([^\\/]+)') + '\/?$'));
    /* eslint-enable max-len */
  }

  function defineRoutes(routes, resolve, reject) {
    if (supportsPushState) {
      $window.onpopstate = debounceAsync(resolveRoute);
    } else if (prefix.charAt(0) === '#') {
      $window.onhashchange = resolveRoute;
    }

    resolveRoute();

    function resolveRoute() {
      const path = getPath();
      const params = {};
      const pathname = parsePath(path, params, params);

      for (const route in routes) {
        if (!hasOwn.call(routes, route)) {
          continue;
        }

        const matcher = getMatcher(route);

        if (matcher.test(pathname)) {
          pathname.replace(matcher, () => {
            const keys = route.match(/:[^\/]+/g) || [];
            const values = [].slice.call(arguments, 1, -2);

            keys.forEach((key, i) => {
              params[key.replace(/:|\./g, '')] = decodeURIComponent(values[i]);
            });

            params$(params);
            route$(route);
            path$(path);

            resolve(routes[route], params, path, route);
          });

          return true;
        }
      }

      params$(params);
      route$(null);
      path$(path);

      reject(path, params);
      return false;
    }

    return resolveRoute;
  }

  return {
    defineRoutes,
    setPrefix,
    setPath,
    params$,
    route$,
    path$,
  };
};
