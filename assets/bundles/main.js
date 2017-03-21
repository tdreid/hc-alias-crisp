/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	module.exports = __webpack_require__(29);


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(3),
	    AliasApp = __webpack_require__(4),
	    AppStore = __webpack_require__(11),
	    $ = __webpack_require__(15);

	var signedRequest = $("meta[name=acpt]").attr("content");
	$.ajaxSetup({
	  beforeSend: function beforeSend(request) {
	    request.setRequestHeader("X-acpt", signedRequest);
	  }
	});

	var baseUrl = $("meta[name=base-url]").attr("content");
	AppStore.set("base_url", baseUrl);

	React.render(React.createElement(AliasApp, null), document.getElementById('react-app'));

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(3),
	    AliasActions = __webpack_require__(5),
	    AliasStore = __webpack_require__(17),
	    Alias = __webpack_require__(18),
	    AddAlias = __webpack_require__(26),
	    Spinner = __webpack_require__(27),
	    AP = __webpack_require__(16),
	    _ = __webpack_require__(14);

	module.exports = React.createClass({

	  displayName: "HipChatAliasApp",

	  propTypes: {
	    aliases: React.PropTypes.arrayOf(React.PropTypes.shape({
	      alias: React.PropTypes.string.isRequired,
	      mentions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
	    })).isRequired
	  },

	  getInitialState: function getInitialState() {
	    return this._getState();
	  },

	  componentDidMount: function componentDidMount() {
	    AliasStore.on("change", this._onChange);
	    AliasActions.fetchAliases();
	  },

	  componentWillUnmount: function componentWillUnmount() {
	    AliasStore.off("change", this._onChange);
	  },

	  _onChange: function _onChange() {
	    this.setState(this._getState());
	  },

	  _getState: function _getState() {
	    return {
	      aliases: AliasStore.get("aliases"),
	      adding_alias: AliasStore.get("adding_alias"),
	      loading: AliasStore.get("loading")
	    };
	  },

	  _renderAlias: function _renderAlias(alias) {
	    return React.createElement(Alias, { alias: alias.alias,
	      mentions: alias.mentions });
	  },

	  _renderAliases: function _renderAliases() {
	    AP.require(["dialog"], function (dialog) {
	      dialog.update({
	        title: "Choose alias"
	      });
	    });
	    return _.map(this.state.aliases, this._renderAlias);
	  },

	  _renderAddNew: function _renderAddNew() {
	    AP.require(["dialog"], function (dialog) {
	      dialog.update({
	        title: "Add a new alias"
	      });
	    });
	    return React.createElement(AddAlias, null);
	  },

	  _configureNewAlias: function _configureNewAlias() {
	    AliasActions.configureNewAlias();
	  },

	  render: function render() {

	    if (this.state.loading) {
	      return React.createElement(
	        "div",
	        { className: "dialog" },
	        React.createElement(Spinner, { size: "medium",
	          spin: true })
	      );
	    }

	    if (this.state.adding_alias || this.state.aliases.length === 0) {
	      return this._renderAddNew();
	    }

	    return React.createElement(
	      "div",
	      { className: "dialog" },
	      React.createElement(
	        "table",
	        { className: "aui aui-table-interactive aliases-container" },
	        React.createElement(
	          "tbody",
	          { className: "aliases" },
	          this._renderAliases()
	        )
	      ),
	      React.createElement(
	        "div",
	        null,
	        React.createElement(
	          "a",
	          { className: "aui-button aui-button-link", onClick: this._configureNewAlias },
	          "Configure a new alias"
	        )
	      )
	    );
	  }
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var AppDispatcher = __webpack_require__(6),
	    AppStore = __webpack_require__(11),
	    $ = __webpack_require__(15),
	    AP = __webpack_require__(16),
	    _ = __webpack_require__(14);

	var AliasActions = {

	  fetchAliases: function fetchAliases() {
	    var baseUrl = AppStore.get("base_url");
	    $.ajax({
	      url: baseUrl + "/alias",
	      type: "GET",
	      dataType: "json"
	    }).done(function (data) {
	      AppDispatcher.dispatch({
	        type: "aliases-fetched",
	        payload: data
	      });
	    });
	  },

	  deleteAlias: function deleteAlias(aliasName) {
	    var baseUrl = AppStore.get("base_url");
	    $.ajax({
	      url: baseUrl + "/alias/" + aliasName,
	      type: "DELETE"
	    }).done(function () {
	      AppDispatcher.dispatch({
	        type: "alias-deleted",
	        alias: aliasName
	      });
	    });
	  },

	  appendAliasToChat: function appendAliasToChat(alias) {
	    var mentionsText = alias.alias + "："; //using full-width colon to avoid mention regex to match
	    _.each(alias.mentions, function (mention) {
	      mentionsText += mention + " ";
	    });

	    AP.require(["chat", "dialog"], function (chat, dialog) {
	      chat.appendMessage(mentionsText);
	      dialog.close();
	    });
	  },

	  getUsers: function getUsers(input, callback) {
	    var baseUrl = AppStore.get("base_url");
	    $.ajax({
	      url: baseUrl + "/room_participants",
	      type: "GET",
	      dataType: "json"
	    }).done(function (users) {

	      AppDispatcher.dispatch({
	        type: "get-room-participants",
	        payload: {
	          roomParticipants: users
	        }
	      });

	      var options = _.map(users, function (user) {
	        return {
	          value: "@" + user.mention_name,
	          label: "@" + user.mention_name
	        };
	      });

	      callback(null, {
	        options: options,
	        complete: true
	      });
	    });
	  },

	  updateMentions: function updateMentions(aliasName, mentions) {
	    var baseUrl = AppStore.get("base_url");
	    $.ajax({
	      url: baseUrl + "/alias/" + aliasName,
	      type: "PUT",
	      contentType: "application/json",
	      data: JSON.stringify({
	        mentions: mentions
	      })
	    }).done(function () {
	      AppDispatcher.dispatch({
	        type: "alias-updated",
	        payload: {
	          alias: aliasName,
	          mentions: mentions
	        }
	      });
	    });
	  },

	  saveAlias: function saveAlias(aliasName, mentions) {
	    var baseUrl = AppStore.get("base_url");
	    $.ajax({
	      url: baseUrl + "/alias/" + aliasName,
	      type: "POST",
	      contentType: "application/json",
	      data: JSON.stringify({
	        mentions: mentions
	      }),
	      dataType: "json"
	    }).done(function (data) {
	      AppDispatcher.dispatch({
	        type: "alias-saved",
	        payload: data
	      });
	    });
	  },

	  configureNewAlias: function configureNewAlias() {
	    AppDispatcher.dispatch({
	      type: "configure-new-alias"
	    });
	  }
	};

	module.exports = AliasActions;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Dispatcher = __webpack_require__(7).Dispatcher;

	module.exports = new Dispatcher();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(8);


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Dispatcher
	 * 
	 * @preventMunge
	 */

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var invariant = __webpack_require__(10);

	var _prefix = 'ID_';

	/**
	 * Dispatcher is used to broadcast payloads to registered callbacks. This is
	 * different from generic pub-sub systems in two ways:
	 *
	 *   1) Callbacks are not subscribed to particular events. Every payload is
	 *      dispatched to every registered callback.
	 *   2) Callbacks can be deferred in whole or part until other callbacks have
	 *      been executed.
	 *
	 * For example, consider this hypothetical flight destination form, which
	 * selects a default city when a country is selected:
	 *
	 *   var flightDispatcher = new Dispatcher();
	 *
	 *   // Keeps track of which country is selected
	 *   var CountryStore = {country: null};
	 *
	 *   // Keeps track of which city is selected
	 *   var CityStore = {city: null};
	 *
	 *   // Keeps track of the base flight price of the selected city
	 *   var FlightPriceStore = {price: null}
	 *
	 * When a user changes the selected city, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'city-update',
	 *     selectedCity: 'paris'
	 *   });
	 *
	 * This payload is digested by `CityStore`:
	 *
	 *   flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'city-update') {
	 *       CityStore.city = payload.selectedCity;
	 *     }
	 *   });
	 *
	 * When the user selects a country, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'country-update',
	 *     selectedCountry: 'australia'
	 *   });
	 *
	 * This payload is digested by both stores:
	 *
	 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       CountryStore.country = payload.selectedCountry;
	 *     }
	 *   });
	 *
	 * When the callback to update `CountryStore` is registered, we save a reference
	 * to the returned token. Using this token with `waitFor()`, we can guarantee
	 * that `CountryStore` is updated before the callback that updates `CityStore`
	 * needs to query its data.
	 *
	 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       // `CountryStore.country` may not be updated.
	 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
	 *       // `CountryStore.country` is now guaranteed to be updated.
	 *
	 *       // Select the default city for the new country
	 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
	 *     }
	 *   });
	 *
	 * The usage of `waitFor()` can be chained, for example:
	 *
	 *   FlightPriceStore.dispatchToken =
	 *     flightDispatcher.register(function(payload) {
	 *       switch (payload.actionType) {
	 *         case 'country-update':
	 *         case 'city-update':
	 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
	 *           FlightPriceStore.price =
	 *             getFlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *     }
	 *   });
	 *
	 * The `country-update` payload will be guaranteed to invoke the stores'
	 * registered callbacks in order: `CountryStore`, `CityStore`, then
	 * `FlightPriceStore`.
	 */

	var Dispatcher = (function () {
	  function Dispatcher() {
	    _classCallCheck(this, Dispatcher);

	    this._callbacks = {};
	    this._isDispatching = false;
	    this._isHandled = {};
	    this._isPending = {};
	    this._lastID = 1;
	  }

	  /**
	   * Registers a callback to be invoked with every dispatched payload. Returns
	   * a token that can be used with `waitFor()`.
	   */

	  Dispatcher.prototype.register = function register(callback) {
	    var id = _prefix + this._lastID++;
	    this._callbacks[id] = callback;
	    return id;
	  };

	  /**
	   * Removes a callback based on its token.
	   */

	  Dispatcher.prototype.unregister = function unregister(id) {
	    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
	    delete this._callbacks[id];
	  };

	  /**
	   * Waits for the callbacks specified to be invoked before continuing execution
	   * of the current callback. This method should only be used by a callback in
	   * response to a dispatched payload.
	   */

	  Dispatcher.prototype.waitFor = function waitFor(ids) {
	    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
	    for (var ii = 0; ii < ids.length; ii++) {
	      var id = ids[ii];
	      if (this._isPending[id]) {
	        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
	        continue;
	      }
	      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
	      this._invokeCallback(id);
	    }
	  };

	  /**
	   * Dispatches a payload to all registered callbacks.
	   */

	  Dispatcher.prototype.dispatch = function dispatch(payload) {
	    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
	    this._startDispatching(payload);
	    try {
	      for (var id in this._callbacks) {
	        if (this._isPending[id]) {
	          continue;
	        }
	        this._invokeCallback(id);
	      }
	    } finally {
	      this._stopDispatching();
	    }
	  };

	  /**
	   * Is this Dispatcher currently dispatching.
	   */

	  Dispatcher.prototype.isDispatching = function isDispatching() {
	    return this._isDispatching;
	  };

	  /**
	   * Call the callback stored with the given id. Also do some internal
	   * bookkeeping.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
	    this._isPending[id] = true;
	    this._callbacks[id](this._pendingPayload);
	    this._isHandled[id] = true;
	  };

	  /**
	   * Set up bookkeeping needed when dispatching.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
	    for (var id in this._callbacks) {
	      this._isPending[id] = false;
	      this._isHandled[id] = false;
	    }
	    this._pendingPayload = payload;
	    this._isDispatching = true;
	  };

	  /**
	   * Clear bookkeeping used for dispatching.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
	    delete this._pendingPayload;
	    this._isDispatching = false;
	  };

	  return Dispatcher;
	})();

	module.exports = Dispatcher;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function (condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Store = __webpack_require__(12);

	var AppStore = (function (_Store) {
	  _inherits(AppStore, _Store);

	  function AppStore() {
	    _classCallCheck(this, AppStore);

	    _get(Object.getPrototypeOf(AppStore.prototype), "constructor", this).apply(this, arguments);
	  }

	  _createClass(AppStore, [{
	    key: "getDefaults",
	    value: function getDefaults() {
	      return {
	        base_url: ""
	      };
	    }
	  }]);

	  return AppStore;
	})(Store);

	module.exports = new AppStore();

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var EventEmitter = __webpack_require__(13).EventEmitter,
	    _ = __webpack_require__(14);

	function toArray(obj) {
	  if (_.isArray(obj)) {
	    return obj;
	  } else {
	    return [obj];
	  }
	}

	var Store = (function (_EventEmitter) {
	  _inherits(Store, _EventEmitter);

	  function Store() {
	    _classCallCheck(this, Store);

	    _get(Object.getPrototypeOf(Store.prototype), "constructor", this).call(this);

	    this.data = this.getDefaults();

	    this.registerListeners();
	  }

	  _createClass(Store, [{
	    key: "has",
	    value: function has(key) {
	      return this.data.hasOwnProperty(key);
	    }
	  }, {
	    key: "get",
	    value: function get(key) {
	      return this.data[key];
	    }
	  }, {
	    key: "getAll",
	    value: function getAll() {
	      return this.data;
	    }
	  }, {
	    key: "setIfNotEqual",
	    value: function setIfNotEqual(key, value) {
	      var data = key;

	      if (value !== undefined) {
	        data = {};
	        data[key] = value;
	      }

	      this.doSet(data, true);
	    }
	  }, {
	    key: "set",
	    value: function set(key, value) {
	      var data = key;

	      if (value !== undefined) {
	        data = {};
	        data[key] = value;
	      }

	      this.doSet(data, false);
	    }
	  }, {
	    key: "doSet",
	    value: function doSet(data, doEqualityCheck) {
	      var changeset = {};
	      var hasChange = false;

	      _.keys(data).forEach(function (key) {

	        var shouldSet = !doEqualityCheck || doEqualityCheck && !_.isEqual(data[key], this.data[key]);

	        if (shouldSet) {
	          hasChange = true;
	          var oldValue = this.get(key),
	              value = data[key];

	          this.data[key] = value;
	          changeset[key] = value;
	          this.emit("change:" + key, value, oldValue);
	        }
	      }, this);

	      if (!doEqualityCheck || doEqualityCheck && hasChange) {
	        this.emit("change", changeset);
	      }
	    }
	  }, {
	    key: "unset",
	    value: function unset(key) {
	      if (this.has(key)) {
	        var oldValue = this.get(key);
	        delete this.data[key];

	        this.emit("change:" + key, undefined, oldValue);
	      }
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      var changeset = {};

	      _.keys(this.data).forEach(function (key) {
	        changeset[key] = this.get(key);
	        this.unset(key);
	      }, this);

	      this.emit("change", changeset);
	    }

	    /**
	     * Registers listeners.
	     */
	  }, {
	    key: "registerListeners",
	    value: function registerListeners() {}

	    /**
	     * Returns the default value of the store
	     */
	  }, {
	    key: "getDefaults",
	    value: function getDefaults() {
	      return {};
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      this.data = this.getDefaults();
	    }
	  }, {
	    key: "on",
	    value: function on(type, callback) {
	      var _this = this;

	      toArray(type).forEach(function (t) {
	        return _get(Object.getPrototypeOf(Store.prototype), "on", _this).call(_this, t, callback);
	      });
	    }
	  }, {
	    key: "once",
	    value: function once(type, callback) {
	      var _this2 = this;

	      toArray(type).forEach(function (t) {
	        return _get(Object.getPrototypeOf(Store.prototype), "once", _this2).call(_this2, t, callback);
	      });
	    }
	  }, {
	    key: "off",
	    value: function off(type, callback) {
	      var _this3 = this;

	      toArray(type).forEach(function (t) {
	        return _get(Object.getPrototypeOf(Store.prototype), "removeListener", _this3).call(_this3, t, callback);
	      });
	    }
	  }]);

	  return Store;
	})(EventEmitter);

	module.exports = Store;

/***/ },
/* 13 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = $;

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = AP;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Store = __webpack_require__(12),
	    AppDispatcher = __webpack_require__(6),
	    _ = __webpack_require__(14);

	var AliasStore = (function (_Store) {
	  _inherits(AliasStore, _Store);

	  function AliasStore() {
	    _classCallCheck(this, AliasStore);

	    _get(Object.getPrototypeOf(AliasStore.prototype), "constructor", this).apply(this, arguments);
	  }

	  _createClass(AliasStore, [{
	    key: "getDefaults",
	    value: function getDefaults() {
	      return {
	        aliases: [],
	        adding_alias: false,
	        loading: true,
	        roomParticipants: []
	      };
	    }
	  }, {
	    key: "registerListeners",
	    value: function registerListeners() {
	      var _this = this;

	      this.dispatchToken = AppDispatcher.register(function (action) {
	        switch (action.type) {
	          case "aliases-fetched":
	            _this.set({
	              "aliases": action.payload,
	              "loading": false
	            });
	            break;
	          case "alias-deleted":
	            var newAliases = _.filter(_this.data.aliases, function (alias) {
	              return alias.alias !== action.alias;
	            });
	            _this.set("aliases", newAliases);
	            break;
	          case "alias-updated":
	            var updatedAlias = _.find(_this.data.aliases, function (alias) {
	              return alias.alias === action.payload.alias;
	            });
	            updatedAlias.mentions = action.payload.mentions;
	            _this.set("aliases", _this.data.aliases);
	            break;
	          case "alias-saved":
	            _this.set({
	              "aliases": action.payload,
	              "adding_alias": false
	            });
	            break;
	          case "configure-new-alias":
	            _this.set({
	              "adding_alias": true
	            });
	            break;
	          case "get-room-participants":
	            _this.set("roomParticipants", action.payload.roomParticipants);
	            break;
	        }
	      });
	    }
	  }]);

	  return AliasStore;
	})(Store);

	module.exports = new AliasStore();

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(3),
	    AliasActions = __webpack_require__(5),
	    AliasStore = __webpack_require__(17),
	    MentionSelect = __webpack_require__(19),
	    _ = __webpack_require__(14);

	module.exports = React.createClass({

	  displayName: "Alias",

	  propTypes: {
	    alias: React.PropTypes.string.isRequired,
	    mentions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
	  },

	  getInitialState: function getInitialState() {
	    return {
	      edit: false,
	      edited_mentions: null
	    };
	  },

	  componentDidMount: function componentDidMount() {},

	  _onChange: function _onChange() {
	    this.setState(this._getState());
	  },

	  _getState: function _getState() {
	    return {};
	  },

	  _delete: function _delete(e) {
	    AliasActions.deleteAlias(this.props.alias);
	    e.stopPropagation();
	  },

	  _select: function _select() {
	    AliasActions.appendAliasToChat({
	      alias: this.props.alias,
	      mentions: this.props.mentions
	    });
	  },

	  _edit: function _edit(e) {
	    this.setState({
	      edit: true
	    });

	    e.stopPropagation();
	  },

	  _isValidEdit: function _isValidEdit() {
	    return false;
	  },

	  _renderEdit: function _renderEdit() {

	    var mentions = this.state.edited_mentions || this.props.mentions;
	    var value = mentions.join(",");

	    return React.createElement(
	      "tr",
	      { className: "alias edit", "data-alias": this.props.alias, key: this.props.alias },
	      React.createElement(
	        "td",
	        { className: "name" },
	        React.createElement(
	          "span",
	          { className: "hc-mention hc-mention-me" },
	          this.props.alias
	        )
	      ),
	      React.createElement(
	        "td",
	        { className: "mentions" },
	        React.createElement(MentionSelect, { initialMentions: mentions,
	          onChange: this._onMentionsChange })
	      ),
	      React.createElement(
	        "td",
	        { className: "actions aui-compact-button-column" },
	        React.createElement(
	          "a",
	          { className: "aui-icon aui-icon-small aui-iconfont-success save", onClick: this._saveEdit,
	            disabled: !this._isValidEdit() },
	          "Edit"
	        ),
	        React.createElement(
	          "a",
	          { className: "aui-icon aui-icon-small aui-iconfont-undo cancel", onClick: this._cancelEdit },
	          "Delete"
	        )
	      )
	    );
	  },

	  _getSelectOptions: function _getSelectOptions(input, callback) {
	    AliasActions.getUsers(input, callback);
	  },

	  _saveEdit: function _saveEdit() {
	    AliasActions.updateMentions(this.props.alias, !_.isEmpty(this.state.edited_mentions) ? this.state.edited_mentions : this.props.mentions);
	    this.setState({
	      edit: false
	    });
	  },

	  _cancelEdit: function _cancelEdit() {
	    this.setState({
	      edit: false
	    });
	  },

	  _onMentionsChange: function _onMentionsChange(mentions) {
	    this.setState({
	      edited_mentions: mentions
	    });
	  },

	  render: function render() {

	    if (this.state.edit) {
	      return this._renderEdit();
	    }

	    var mentions = _.map(this.props.mentions, function (mention) {
	      return React.createElement(
	        "span",
	        { className: "hc-mention" },
	        { mention: mention }
	      );
	    });

	    return React.createElement(
	      "tr",
	      { className: "alias", "data-alias": this.props.alias, key: this.props.alias, onClick: this._select },
	      React.createElement(
	        "td",
	        { className: "name" },
	        React.createElement(
	          "span",
	          { className: "hc-mention hc-mention-me" },
	          this.props.alias
	        )
	      ),
	      React.createElement(
	        "td",
	        { className: "mentions" },
	        mentions
	      ),
	      React.createElement(
	        "td",
	        { className: "actions aui-compact-button-column" },
	        React.createElement(
	          "a",
	          { className: "aui-icon aui-icon-small aui-iconfont-edit edit", onClick: this._edit },
	          "Edit"
	        ),
	        React.createElement(
	          "a",
	          { className: "aui-icon aui-icon-small aui-iconfont-delete delete", onClick: this._delete },
	          "Delete"
	        )
	      )
	    );
	  }
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(3),
	    AliasActions = __webpack_require__(5),
	    Select = __webpack_require__(20),
	    _ = __webpack_require__(14);

	module.exports = React.createClass({
	  displayName: "exports",

	  getInitialState: function getInitialState() {
	    return {
	      mentions: this.props.initialMentions
	    };
	  },

	  _getSelectOptions: function _getSelectOptions(input, callback) {
	    AliasActions.getUsers(input, callback);
	  },

	  _onMentionsChange: function _onMentionsChange(val) {
	    var mentions = val !== "" ? val.split(",") : [];
	    mentions = _.map(mentions, function (mention) {
	      if (mention.indexOf("@") !== 0) {
	        mention = "@" + mention;
	      }

	      return mention;
	    });

	    this.setState({
	      mentions: mentions
	    });
	    this.props.onChange(mentions);
	  },

	  render: function render() {
	    var mentions = this.state.mentions;
	    var value = mentions.join(",");

	    return React.createElement(Select, { multi: true,
	      allowCreate: true,
	      value: value,
	      delimitier: ",",
	      asyncOptions: this._getSelectOptions,
	      onChange: this._onMentionsChange });
	  }

	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* disable some rules until we refactor more completely; fixing them now would
	   cause conflicts with some open PRs unnecessarily. */
	/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(3);
	var Input = __webpack_require__(21);
	var classes = __webpack_require__(22);
	var Value = __webpack_require__(23);
	var SingleValue = __webpack_require__(24);
	var Option = __webpack_require__(25);

	var requestId = 0;

	var Select = React.createClass({

		displayName: 'Select',

		propTypes: {
			addLabelText: React.PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
			allowCreate: React.PropTypes.bool, // whether to allow creation of new entries
			asyncOptions: React.PropTypes.func, // function to call to get options
			autoload: React.PropTypes.bool, // whether to auto-load the default async options set
			backspaceRemoves: React.PropTypes.bool, // whether backspace removes an item if there is no text input
			cacheAsyncResults: React.PropTypes.bool, // whether to allow cache
			className: React.PropTypes.string, // className for the outer element
			clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
			clearValueText: React.PropTypes.string, // title for the "clear" control
			clearable: React.PropTypes.bool, // should it be possible to reset value
			delimiter: React.PropTypes.string, // delimiter to use to join multiple values
			disabled: React.PropTypes.bool, // whether the Select is disabled or not
			filterOption: React.PropTypes.func, // method to filter a single option  (option, filterString)
			filterOptions: React.PropTypes.func, // method to filter the options array: function ([options], filterString, [values])
			ignoreCase: React.PropTypes.bool, // whether to perform case-insensitive filtering
			inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
			isLoading: React.PropTypes.bool, // whether the Select is loading externally or not (such as options being loaded)
			labelKey: React.PropTypes.string, // path of the label value in option objects
			matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
			matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
			multi: React.PropTypes.bool, // multi-value input
			name: React.PropTypes.string, // field name, for hidden <input /> tag
			newOptionCreator: React.PropTypes.func, // factory to create new options when allowCreate set
			noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
			onBlur: React.PropTypes.func, // onBlur handler: function (event) {}
			onChange: React.PropTypes.func, // onChange handler: function (newValue) {}
			onFocus: React.PropTypes.func, // onFocus handler: function (event) {}
			onInputChange: React.PropTypes.func, // onInputChange handler: function (inputValue) {}
			onOptionLabelClick: React.PropTypes.func, // onCLick handler for value labels: function (value, event) {}
			optionComponent: React.PropTypes.func, // option component to render in dropdown
			optionRenderer: React.PropTypes.func, // optionRenderer: function (option) {}
			options: React.PropTypes.array, // array of options
			placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
			searchable: React.PropTypes.bool, // whether to enable searching feature or not
			searchingText: React.PropTypes.string, // message to display whilst options are loading via asyncOptions
			searchPromptText: React.PropTypes.string, // label to prompt for search input
			singleValueComponent: React.PropTypes.func, // single value component when multiple is set to false
			value: React.PropTypes.any, // initial field value
			valueComponent: React.PropTypes.func, // value component to render in multiple mode
			valueKey: React.PropTypes.string, // path of the label value in option objects
			valueRenderer: React.PropTypes.func // valueRenderer: function (option) {}
		},

		getDefaultProps: function getDefaultProps() {
			return {
				addLabelText: 'Add "{label}"?',
				allowCreate: false,
				asyncOptions: undefined,
				autoload: true,
				backspaceRemoves: true,
				cacheAsyncResults: true,
				className: undefined,
				clearAllText: 'Clear all',
				clearValueText: 'Clear value',
				clearable: true,
				delimiter: ',',
				disabled: false,
				ignoreCase: true,
				inputProps: {},
				isLoading: false,
				labelKey: 'label',
				matchPos: 'any',
				matchProp: 'any',
				name: undefined,
				newOptionCreator: undefined,
				noResultsText: 'No results found',
				onChange: undefined,
				onInputChange: undefined,
				onOptionLabelClick: undefined,
				optionComponent: Option,
				options: undefined,
				placeholder: 'Select...',
				searchable: true,
				searchingText: 'Searching...',
				searchPromptText: 'Type to search',
				singleValueComponent: SingleValue,
				value: undefined,
				valueComponent: Value,
				valueKey: 'value'
			};
		},

		getInitialState: function getInitialState() {
			return {
				/*
	    * set by getStateFromValue on componentWillMount:
	    * - value
	    * - values
	    * - filteredOptions
	    * - inputValue
	    * - placeholder
	    * - focusedOption
	   */
				isFocused: false,
				isLoading: false,
				isOpen: false,
				options: this.props.options
			};
		},

		componentWillMount: function componentWillMount() {
			var _this = this;

			this._optionsCache = {};
			this._optionsFilterString = '';
			this._closeMenuIfClickedOutside = function (event) {
				if (!_this.state.isOpen) {
					return;
				}
				var menuElem = React.findDOMNode(_this.refs.selectMenuContainer);
				var controlElem = React.findDOMNode(_this.refs.control);

				var eventOccuredOutsideMenu = _this.clickedOutsideElement(menuElem, event);
				var eventOccuredOutsideControl = _this.clickedOutsideElement(controlElem, event);

				// Hide dropdown menu if click occurred outside of menu
				if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
					_this.setState({
						isOpen: false
					}, _this._unbindCloseMenuIfClickedOutside);
				}
			};
			this._bindCloseMenuIfClickedOutside = function () {
				if (!document.addEventListener && document.attachEvent) {
					document.attachEvent('onclick', _this._closeMenuIfClickedOutside);
				} else {
					document.addEventListener('click', _this._closeMenuIfClickedOutside);
				}
			};
			this._unbindCloseMenuIfClickedOutside = function () {
				if (!document.removeEventListener && document.detachEvent) {
					document.detachEvent('onclick', _this._closeMenuIfClickedOutside);
				} else {
					document.removeEventListener('click', _this._closeMenuIfClickedOutside);
				}
			};
			this.setState(this.getStateFromValue(this.props.value));
		},

		componentDidMount: function componentDidMount() {
			if (this.props.asyncOptions && this.props.autoload) {
				this.autoloadAsyncOptions();
			}
		},

		componentWillUnmount: function componentWillUnmount() {
			clearTimeout(this._blurTimeout);
			clearTimeout(this._focusTimeout);
			if (this.state.isOpen) {
				this._unbindCloseMenuIfClickedOutside();
			}
		},

		componentWillReceiveProps: function componentWillReceiveProps(newProps) {
			var _this2 = this;

			var optionsChanged = false;
			if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
				optionsChanged = true;
				this.setState({
					options: newProps.options,
					filteredOptions: this.filterOptions(newProps.options)
				});
			}
			if (newProps.value !== this.state.value || newProps.placeholder !== this.props.placeholder || optionsChanged) {
				var setState = function setState(newState) {
					_this2.setState(_this2.getStateFromValue(newProps.value, newState && newState.options || newProps.options, newProps.placeholder));
				};
				if (this.props.asyncOptions) {
					this.loadAsyncOptions(newProps.value, {}, setState);
				} else {
					setState();
				}
			}
		},

		componentDidUpdate: function componentDidUpdate() {
			var _this3 = this;

			if (!this.props.disabled && this._focusAfterUpdate) {
				clearTimeout(this._blurTimeout);
				clearTimeout(this._focusTimeout);
				this._focusTimeout = setTimeout(function () {
					if (!_this3.isMounted()) return;
					_this3.getInputNode().focus();
					_this3._focusAfterUpdate = false;
				}, 50);
			}
			if (this._focusedOptionReveal) {
				if (this.refs.focused && this.refs.menu) {
					var focusedDOM = React.findDOMNode(this.refs.focused);
					var menuDOM = React.findDOMNode(this.refs.menu);
					var focusedRect = focusedDOM.getBoundingClientRect();
					var menuRect = menuDOM.getBoundingClientRect();

					if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
						menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
					}
				}
				this._focusedOptionReveal = false;
			}
		},

		focus: function focus() {
			this.getInputNode().focus();
		},

		clickedOutsideElement: function clickedOutsideElement(element, event) {
			var eventTarget = event.target ? event.target : event.srcElement;
			while (eventTarget != null) {
				if (eventTarget === element) return false;
				eventTarget = eventTarget.offsetParent;
			}
			return true;
		},

		getStateFromValue: function getStateFromValue(value, options, placeholder) {
			var _this4 = this;

			if (!options) {
				options = this.state.options;
			}
			if (!placeholder) {
				placeholder = this.props.placeholder;
			}

			// reset internal filter string
			this._optionsFilterString = '';

			var values = this.initValuesArray(value, options);
			var filteredOptions = this.filterOptions(options, values);

			var focusedOption;
			var valueForState = null;
			if (!this.props.multi && values.length) {
				focusedOption = values[0];
				valueForState = values[0][this.props.valueKey];
			} else {
				focusedOption = this.getFirstFocusableOption(filteredOptions);
				valueForState = values.map(function (v) {
					return v[_this4.props.valueKey];
				}).join(this.props.delimiter);
			}

			return {
				value: valueForState,
				values: values,
				inputValue: '',
				filteredOptions: filteredOptions,
				placeholder: !this.props.multi && values.length ? values[0][this.props.labelKey] : placeholder,
				focusedOption: focusedOption
			};
		},

		getFirstFocusableOption: function getFirstFocusableOption(options) {

			for (var optionIndex = 0; optionIndex < options.length; ++optionIndex) {
				if (!options[optionIndex].disabled) {
					return options[optionIndex];
				}
			}
		},

		initValuesArray: function initValuesArray(values, options) {
			var _this5 = this;

			if (!Array.isArray(values)) {
				if (typeof values === 'string') {
					values = values === '' ? [] : this.props.multi ? values.split(this.props.delimiter) : [values];
				} else {
					values = values !== undefined && values !== null ? [values] : [];
				}
			}
			return values.map(function (val) {
				if (typeof val === 'string' || typeof val === 'number') {
					for (var key in options) {
						if (options.hasOwnProperty(key) && options[key] && (options[key][_this5.props.valueKey] === val || typeof options[key][_this5.props.valueKey] === 'number' && options[key][_this5.props.valueKey].toString() === val)) {
							return options[key];
						}
					}
					return { value: val, label: val };
				} else {
					return val;
				}
			});
		},

		setValue: function setValue(value, focusAfterUpdate) {
			if (focusAfterUpdate || focusAfterUpdate === undefined) {
				this._focusAfterUpdate = true;
			}
			var newState = this.getStateFromValue(value);
			newState.isOpen = false;
			this.fireChangeEvent(newState);
			this.setState(newState);
		},

		selectValue: function selectValue(value) {
			if (!this.props.multi) {
				this.setValue(value);
			} else if (value) {
				this.addValue(value);
			}
			this._unbindCloseMenuIfClickedOutside();
		},

		addValue: function addValue(value) {
			this.setValue(this.state.values.concat(value));
		},

		popValue: function popValue() {
			this.setValue(this.state.values.slice(0, this.state.values.length - 1));
		},

		removeValue: function removeValue(valueToRemove) {
			this.setValue(this.state.values.filter(function (value) {
				return value !== valueToRemove;
			}));
		},

		clearValue: function clearValue(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, ignore it.
			if (event && event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
			this.setValue(null);
		},

		resetValue: function resetValue() {
			this.setValue(this.state.value === '' ? null : this.state.value);
		},

		getInputNode: function getInputNode() {
			var input = this.refs.input;
			return this.props.searchable ? input : React.findDOMNode(input);
		},

		fireChangeEvent: function fireChangeEvent(newState) {
			if (newState.value !== this.state.value && this.props.onChange) {
				this.props.onChange(newState.value, newState.values);
			}
		},

		handleMouseDown: function handleMouseDown(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, or if the component is disabled, ignore it.
			if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();

			// for the non-searchable select, close the dropdown when button is clicked
			if (this.state.isOpen && !this.props.searchable) {
				this.setState({
					isOpen: false
				}, this._unbindCloseMenuIfClickedOutside);
				return;
			}

			if (this.state.isFocused) {
				this.setState({
					isOpen: true
				}, this._bindCloseMenuIfClickedOutside);
			} else {
				this._openAfterFocus = true;
				this.getInputNode().focus();
			}
		},

		handleMouseDownOnMenu: function handleMouseDownOnMenu(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, or if the component is disabled, ignore it.
			if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
		},

		handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
			// if the event was triggered by a mousedown and not the primary
			// button, or if the component is disabled, ignore it.
			if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
				return;
			}
			// If not focused, handleMouseDown will handle it
			if (!this.state.isOpen) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
			this.setState({
				isOpen: false
			}, this._unbindCloseMenuIfClickedOutside);
		},

		handleInputFocus: function handleInputFocus(event) {
			var _this6 = this;

			var newIsOpen = this.state.isOpen || this._openAfterFocus;
			this.setState({
				isFocused: true,
				isOpen: newIsOpen
			}, function () {
				if (newIsOpen) {
					_this6._bindCloseMenuIfClickedOutside();
				} else {
					_this6._unbindCloseMenuIfClickedOutside();
				}
			});
			this._openAfterFocus = false;
			if (this.props.onFocus) {
				this.props.onFocus(event);
			}
		},

		handleInputBlur: function handleInputBlur(event) {
			var _this7 = this;

			this._blurTimeout = setTimeout(function () {
				if (_this7._focusAfterUpdate || !_this7.isMounted()) return;
				_this7.setState({
					isFocused: false,
					isOpen: false
				});
			}, 50);
			if (this.props.onBlur) {
				this.props.onBlur(event);
			}
		},

		handleKeyDown: function handleKeyDown(event) {
			if (this.props.disabled) return;
			switch (event.keyCode) {
				case 8:
					// backspace
					if (!this.state.inputValue && this.props.backspaceRemoves) {
						event.preventDefault();
						this.popValue();
					}
					return;
				case 9:
					// tab
					if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
						return;
					}
					this.selectFocusedOption();
					break;
				case 13:
					// enter
					if (!this.state.isOpen) return;
					this.selectFocusedOption();
					break;
				case 27:
					// escape
					if (this.state.isOpen) {
						this.resetValue();
					} else if (this.props.clearable) {
						this.clearValue(event);
					}
					break;
				case 38:
					// up
					this.focusPreviousOption();
					break;
				case 40:
					// down
					this.focusNextOption();
					break;
				case 188:
					// ,
					if (this.props.allowCreate && this.props.multi) {
						event.preventDefault();
						event.stopPropagation();
						this.selectFocusedOption();
					} else {
						return;
					}
					break;
				default:
					return;
			}
			event.preventDefault();
		},

		// Ensures that the currently focused option is available in filteredOptions.
		// If not, returns the first available option.
		_getNewFocusedOption: function _getNewFocusedOption(filteredOptions) {
			for (var key in filteredOptions) {
				if (filteredOptions.hasOwnProperty(key) && filteredOptions[key] === this.state.focusedOption) {
					return filteredOptions[key];
				}
			}
			return this.getFirstFocusableOption(filteredOptions);
		},

		handleInputChange: function handleInputChange(event) {
			// assign an internal variable because we need to use
			// the latest value before setState() has completed.
			this._optionsFilterString = event.target.value;

			if (this.props.onInputChange) {
				this.props.onInputChange(event.target.value);
			}

			if (this.props.asyncOptions) {
				this.setState({
					isLoading: true,
					inputValue: event.target.value
				});
				this.loadAsyncOptions(event.target.value, {
					isLoading: false,
					isOpen: true
				}, this._bindCloseMenuIfClickedOutside);
			} else {
				var filteredOptions = this.filterOptions(this.state.options);
				this.setState({
					isOpen: true,
					inputValue: event.target.value,
					filteredOptions: filteredOptions,
					focusedOption: this._getNewFocusedOption(filteredOptions)
				}, this._bindCloseMenuIfClickedOutside);
			}
		},

		autoloadAsyncOptions: function autoloadAsyncOptions() {
			var _this8 = this;

			this.setState({
				isLoading: true
			});
			this.loadAsyncOptions(this.props.value || '', { isLoading: false }, function () {
				// update with new options but don't focus
				_this8.setValue(_this8.props.value, false);
			});
		},

		loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
			var _this9 = this;

			var thisRequestId = this._currentRequestId = requestId++;
			if (this.props.cacheAsyncResults) {
				for (var i = 0; i <= input.length; i++) {
					var cacheKey = input.slice(0, i);
					if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
						var options = this._optionsCache[cacheKey].options;
						var filteredOptions = this.filterOptions(options);
						var newState = {
							options: options,
							filteredOptions: filteredOptions,
							focusedOption: this._getNewFocusedOption(filteredOptions)
						};
						for (var key in state) {
							if (state.hasOwnProperty(key)) {
								newState[key] = state[key];
							}
						}
						this.setState(newState);
						if (callback) callback.call(this, newState);
						return;
					}
				}
			}

			this.props.asyncOptions(input, function (err, data) {
				if (err) throw err;
				if (_this9.props.cacheAsyncResults) {
					_this9._optionsCache[input] = data;
				}
				if (thisRequestId !== _this9._currentRequestId) {
					return;
				}
				var filteredOptions = _this9.filterOptions(data.options);
				var newState = {
					options: data.options,
					filteredOptions: filteredOptions,
					focusedOption: _this9._getNewFocusedOption(filteredOptions)
				};
				for (var key in state) {
					if (state.hasOwnProperty(key)) {
						newState[key] = state[key];
					}
				}
				_this9.setState(newState);
				if (callback) {
					callback.call(_this9, newState);
				}
			});
		},

		filterOptions: function filterOptions(options, values) {
			var filterValue = this._optionsFilterString;
			var exclude = (values || this.state.values).map(function (i) {
				return i.value;
			});
			if (this.props.filterOptions) {
				return this.props.filterOptions.call(this, options, filterValue, exclude);
			} else {
				var filterOption = function filterOption(op) {
					if (this.props.multi && exclude.indexOf(op[this.props.valueKey]) > -1) return false;
					if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
					var valueTest = String(op[this.props.valueKey]);
					var labelTest = String(op[this.props.labelKey]);
					if (this.props.ignoreCase) {
						valueTest = valueTest.toLowerCase();
						labelTest = labelTest.toLowerCase();
						filterValue = filterValue.toLowerCase();
					}
					return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
				};
				return (options || []).filter(filterOption, this);
			}
		},

		selectFocusedOption: function selectFocusedOption() {
			if (this.props.allowCreate && !this.state.focusedOption) {
				return this.selectValue(this.state.inputValue);
			}

			if (this.state.focusedOption) {
				return this.selectValue(this.state.focusedOption);
			}
		},

		focusOption: function focusOption(op) {
			this.setState({
				focusedOption: op
			});
		},

		focusNextOption: function focusNextOption() {
			this.focusAdjacentOption('next');
		},

		focusPreviousOption: function focusPreviousOption() {
			this.focusAdjacentOption('previous');
		},

		focusAdjacentOption: function focusAdjacentOption(dir) {
			this._focusedOptionReveal = true;
			var ops = this.state.filteredOptions.filter(function (op) {
				return !op.disabled;
			});
			if (!this.state.isOpen) {
				this.setState({
					isOpen: true,
					inputValue: '',
					focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
				}, this._bindCloseMenuIfClickedOutside);
				return;
			}
			if (!ops.length) {
				return;
			}
			var focusedIndex = -1;
			for (var i = 0; i < ops.length; i++) {
				if (this.state.focusedOption === ops[i]) {
					focusedIndex = i;
					break;
				}
			}
			var focusedOption = ops[0];
			if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
				focusedOption = ops[focusedIndex + 1];
			} else if (dir === 'previous') {
				if (focusedIndex > 0) {
					focusedOption = ops[focusedIndex - 1];
				} else {
					focusedOption = ops[ops.length - 1];
				}
			}
			this.setState({
				focusedOption: focusedOption
			});
		},

		unfocusOption: function unfocusOption(op) {
			if (this.state.focusedOption === op) {
				this.setState({
					focusedOption: null
				});
			}
		},

		buildMenu: function buildMenu() {
			var _this10 = this;

			var focusedValue = this.state.focusedOption ? this.state.focusedOption[this.props.valueKey] : null;
			var renderLabel = this.props.optionRenderer;
			if (!renderLabel) renderLabel = function (op) {
				return op[_this10.props.labelKey];
			};
			if (this.state.filteredOptions.length > 0) {
				focusedValue = focusedValue == null ? this.state.filteredOptions[0] : focusedValue;
			}
			// Add the current value to the filtered options in last resort
			var options = this.state.filteredOptions;
			if (this.props.allowCreate && this.state.inputValue.trim()) {
				var inputValue = this.state.inputValue;
				options = options.slice();
				var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
					value: inputValue,
					label: inputValue,
					create: true
				};
				options.unshift(newOption);
			}
			var ops = Object.keys(options).map(function (key) {
				var op = options[key];
				var isSelected = this.state.value === op[this.props.valueKey];
				var isFocused = focusedValue === op[this.props.valueKey];
				var optionClass = classes({
					'Select-option': true,
					'is-selected': isSelected,
					'is-focused': isFocused,
					'is-disabled': op.disabled
				});
				var ref = isFocused ? 'focused' : null;
				var mouseEnter = this.focusOption.bind(this, op);
				var mouseLeave = this.unfocusOption.bind(this, op);
				var mouseDown = this.selectValue.bind(this, op);
				var optionResult = React.createElement(this.props.optionComponent, {
					key: 'option-' + op[this.props.valueKey],
					className: optionClass,
					renderFunc: renderLabel,
					mouseEnter: mouseEnter,
					mouseLeave: mouseLeave,
					mouseDown: mouseDown,
					click: mouseDown,
					addLabelText: this.props.addLabelText,
					option: op,
					ref: ref
				});
				return optionResult;
			}, this);

			if (ops.length) {
				return ops;
			} else {
				var noResultsText, promptClass;
				if (this.isLoading()) {
					promptClass = 'Select-searching';
					noResultsText = this.props.searchingText;
				} else if (this.state.inputValue || !this.props.asyncOptions) {
					promptClass = 'Select-noresults';
					noResultsText = this.props.noResultsText;
				} else {
					promptClass = 'Select-search-prompt';
					noResultsText = this.props.searchPromptText;
				}

				return React.createElement(
					'div',
					{ className: promptClass },
					noResultsText
				);
			}
		},

		handleOptionLabelClick: function handleOptionLabelClick(value, event) {
			if (this.props.onOptionLabelClick) {
				this.props.onOptionLabelClick(value, event);
			}
		},

		isLoading: function isLoading() {
			return this.props.isLoading || this.state.isLoading;
		},

		render: function render() {
			var selectClass = classes('Select', this.props.className, {
				'is-multi': this.props.multi,
				'is-searchable': this.props.searchable,
				'is-open': this.state.isOpen,
				'is-focused': this.state.isFocused,
				'is-loading': this.isLoading(),
				'is-disabled': this.props.disabled,
				'has-value': this.state.value
			});
			var value = [];
			if (this.props.multi) {
				this.state.values.forEach(function (val) {
					var onOptionLabelClick = this.handleOptionLabelClick.bind(this, val);
					var onRemove = this.removeValue.bind(this, val);
					var valueComponent = React.createElement(this.props.valueComponent, {
						key: val.value,
						option: val,
						renderer: this.props.valueRenderer,
						optionLabelClick: !!this.props.onOptionLabelClick,
						onOptionLabelClick: onOptionLabelClick,
						onRemove: onRemove,
						disabled: this.props.disabled
					});
					value.push(valueComponent);
				}, this);
			}

			if (!this.state.inputValue && (!this.props.multi || !value.length)) {
				var val = this.state.values[0] || null;
				if (this.props.valueRenderer && !!this.state.values.length) {
					value.push(React.createElement(Value, {
						key: 0,
						option: val,
						renderer: this.props.valueRenderer,
						disabled: this.props.disabled }));
				} else {
					var singleValueComponent = React.createElement(this.props.singleValueComponent, {
						key: 'placeholder',
						value: val,
						placeholder: this.state.placeholder
					});
					value.push(singleValueComponent);
				}
			}

			var loading = this.isLoading() ? React.createElement('span', { className: 'Select-loading', 'aria-hidden': 'true' }) : null;
			var clear = this.props.clearable && this.state.value && !this.props.disabled ? React.createElement('span', { className: 'Select-clear', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, 'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onTouchEnd: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: '&times;' } }) : null;

			var menu;
			var menuProps;
			if (this.state.isOpen) {
				menuProps = {
					ref: 'menu',
					className: 'Select-menu',
					onMouseDown: this.handleMouseDownOnMenu
				};
				menu = React.createElement(
					'div',
					{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
					React.createElement(
						'div',
						menuProps,
						this.buildMenu()
					)
				);
			}

			var input;
			var inputProps = {
				ref: 'input',
				className: 'Select-input ' + (this.props.inputProps.className || ''),
				tabIndex: this.props.tabIndex || 0,
				onFocus: this.handleInputFocus,
				onBlur: this.handleInputBlur
			};
			for (var key in this.props.inputProps) {
				if (this.props.inputProps.hasOwnProperty(key) && key !== 'className') {
					inputProps[key] = this.props.inputProps[key];
				}
			}

			if (!this.props.disabled) {
				if (this.props.searchable) {
					input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
				} else {
					input = React.createElement(
						'div',
						inputProps,
						' '
					);
				}
			} else if (!this.props.multi || !this.state.values.length) {
				input = React.createElement(
					'div',
					{ className: 'Select-input' },
					' '
				);
			}

			return React.createElement(
				'div',
				{ ref: 'wrapper', className: selectClass },
				React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
				React.createElement(
					'div',
					{ className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
					value,
					input,
					React.createElement('span', { className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow }),
					React.createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow }),
					loading,
					clear
				),
				menu
			);
		}

	});

	module.exports = Select;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = __webpack_require__(3);

	var sizerStyle = { position: 'absolute', visibility: 'hidden', height: 0, width: 0, overflow: 'scroll', whiteSpace: 'nowrap' };

	var AutosizeInput = React.createClass({
		displayName: 'AutosizeInput',

		propTypes: {
			value: React.PropTypes.any, // field value
			defaultValue: React.PropTypes.any, // default field value
			onChange: React.PropTypes.func, // onChange handler: function(newValue) {}
			style: React.PropTypes.object, // css styles for the outer element
			className: React.PropTypes.string, // className for the outer element
			minWidth: React.PropTypes.oneOfType([// minimum width for input element
			React.PropTypes.number, React.PropTypes.string]),
			inputStyle: React.PropTypes.object, // css styles for the input element
			inputClassName: React.PropTypes.string // className for the input element
		},
		getDefaultProps: function getDefaultProps() {
			return {
				minWidth: 1
			};
		},
		getInitialState: function getInitialState() {
			return {
				inputWidth: this.props.minWidth
			};
		},
		componentDidMount: function componentDidMount() {
			this.copyInputStyles();
			this.updateInputWidth();
		},
		componentDidUpdate: function componentDidUpdate() {
			this.updateInputWidth();
		},
		copyInputStyles: function copyInputStyles() {
			if (!this.isMounted() || !window.getComputedStyle) {
				return;
			}
			var inputStyle = window.getComputedStyle(React.findDOMNode(this.refs.input));
			var widthNode = React.findDOMNode(this.refs.sizer);
			widthNode.style.fontSize = inputStyle.fontSize;
			widthNode.style.fontFamily = inputStyle.fontFamily;
			widthNode.style.letterSpacing = inputStyle.letterSpacing;
			if (this.props.placeholder) {
				var placeholderNode = React.findDOMNode(this.refs.placeholderSizer);
				placeholderNode.style.fontSize = inputStyle.fontSize;
				placeholderNode.style.fontFamily = inputStyle.fontFamily;
				placeholderNode.style.letterSpacing = inputStyle.letterSpacing;
			}
		},
		updateInputWidth: function updateInputWidth() {
			if (!this.isMounted() || typeof React.findDOMNode(this.refs.sizer).scrollWidth === 'undefined') {
				return;
			}
			var newInputWidth;
			if (this.props.placeholder) {
				newInputWidth = Math.max(React.findDOMNode(this.refs.sizer).scrollWidth, React.findDOMNode(this.refs.placeholderSizer).scrollWidth) + 2;
			} else {
				newInputWidth = React.findDOMNode(this.refs.sizer).scrollWidth + 2;
			}
			if (newInputWidth < this.props.minWidth) {
				newInputWidth = this.props.minWidth;
			}
			if (newInputWidth !== this.state.inputWidth) {
				this.setState({
					inputWidth: newInputWidth
				});
			}
		},
		getInput: function getInput() {
			return this.refs.input;
		},
		focus: function focus() {
			React.findDOMNode(this.refs.input).focus();
		},
		select: function select() {
			React.findDOMNode(this.refs.input).select();
		},
		render: function render() {
			var escapedValue = (this.props.value || '').replace(/\&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
			var wrapperStyle = this.props.style || {};
			wrapperStyle.display = 'inline-block';
			var inputStyle = _extends({}, this.props.inputStyle);
			inputStyle.width = this.state.inputWidth;
			inputStyle.boxSizing = 'content-box';
			var placeholder = this.props.placeholder ? React.createElement(
				'div',
				{ ref: 'placeholderSizer', style: sizerStyle },
				this.props.placeholder
			) : null;
			return React.createElement(
				'div',
				{ className: this.props.className, style: wrapperStyle },
				React.createElement('input', _extends({}, this.props, { ref: 'input', className: this.props.inputClassName, style: inputStyle })),
				React.createElement('div', { ref: 'sizer', style: sizerStyle, dangerouslySetInnerHTML: { __html: escapedValue } }),
				placeholder
			);
		}
	});

	module.exports = AutosizeInput;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	  Copyright (c) 2016 Jed Watson.
	  Licensed under the MIT License (MIT), see
	  http://jedwatson.github.io/classnames
	*/
	/* global define */

	(function () {
		'use strict';

		var hasOwn = {}.hasOwnProperty;

		function classNames () {
			var classes = [];

			for (var i = 0; i < arguments.length; i++) {
				var arg = arguments[i];
				if (!arg) continue;

				var argType = typeof arg;

				if (argType === 'string' || argType === 'number') {
					classes.push(arg);
				} else if (Array.isArray(arg)) {
					classes.push(classNames.apply(null, arg));
				} else if (argType === 'object') {
					for (var key in arg) {
						if (hasOwn.call(arg, key) && arg[key]) {
							classes.push(key);
						}
					}
				}
			}

			return classes.join(' ');
		}

		if (typeof module !== 'undefined' && module.exports) {
			module.exports = classNames;
		} else if (true) {
			// register as 'classnames', consistent with npm package name
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return classNames;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {
			window.classNames = classNames;
		}
	}());


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(3);
	var classes = __webpack_require__(22);

	var Value = React.createClass({

		displayName: 'Value',

		propTypes: {
			disabled: React.PropTypes.bool, // disabled prop passed to ReactSelect
			onOptionLabelClick: React.PropTypes.func, // method to handle click on value label
			onRemove: React.PropTypes.func, // method to handle remove of that value
			option: React.PropTypes.object.isRequired, // option passed to component
			optionLabelClick: React.PropTypes.bool, // indicates if onOptionLabelClick should be handled
			renderer: React.PropTypes.func // method to render option label passed to ReactSelect
		},

		blockEvent: function blockEvent(event) {
			event.stopPropagation();
		},

		handleOnRemove: function handleOnRemove(event) {
			if (!this.props.disabled) {
				this.props.onRemove(event);
			}
		},

		render: function render() {
			var label = this.props.option.label;
			if (this.props.renderer) {
				label = this.props.renderer(this.props.option);
			}

			if (!this.props.onRemove && !this.props.optionLabelClick) {
				return React.createElement(
					'div',
					{
						className: classes('Select-value', this.props.option.className),
						style: this.props.option.style,
						title: this.props.option.title
					},
					label
				);
			}

			if (this.props.optionLabelClick) {
				label = React.createElement(
					'a',
					{ className: classes('Select-item-label__a', this.props.option.className),
						onMouseDown: this.blockEvent,
						onTouchEnd: this.props.onOptionLabelClick,
						onClick: this.props.onOptionLabelClick,
						style: this.props.option.style,
						title: this.props.option.title },
					label
				);
			}

			return React.createElement(
				'div',
				{ className: classes('Select-item', this.props.option.className),
					style: this.props.option.style,
					title: this.props.option.title },
				React.createElement(
					'span',
					{ className: 'Select-item-icon',
						onMouseDown: this.blockEvent,
						onClick: this.handleOnRemove,
						onTouchEnd: this.handleOnRemove },
					'×'
				),
				React.createElement(
					'span',
					{ className: 'Select-item-label' },
					label
				)
			);
		}

	});

	module.exports = Value;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(3);
	var classes = __webpack_require__(22);

	var SingleValue = React.createClass({
		displayName: 'SingleValue',

		propTypes: {
			placeholder: React.PropTypes.string, // this is default value provided by React-Select based component
			value: React.PropTypes.object // selected option
		},
		render: function render() {
			var classNames = classes('Select-placeholder', this.props.value && this.props.value.className);
			return React.createElement(
				'div',
				{
					className: classNames,
					style: this.props.value && this.props.value.style,
					title: this.props.value && this.props.value.title
				},
				this.props.placeholder
			);
		}
	});

	module.exports = SingleValue;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(3);
	var classes = __webpack_require__(22);

	var Option = React.createClass({
		displayName: 'Option',

		propTypes: {
			addLabelText: React.PropTypes.string, // string rendered in case of allowCreate option passed to ReactSelect
			className: React.PropTypes.string, // className (based on mouse position)
			mouseDown: React.PropTypes.func, // method to handle click on option element
			mouseEnter: React.PropTypes.func, // method to handle mouseEnter on option element
			mouseLeave: React.PropTypes.func, // method to handle mouseLeave on option element
			option: React.PropTypes.object.isRequired, // object that is base for that option
			renderFunc: React.PropTypes.func // method passed to ReactSelect component to render label text
		},

		blockEvent: function blockEvent(event) {
			event.preventDefault();
			if (event.target.tagName !== 'A' || !('href' in event.target)) {
				return;
			}

			if (event.target.target) {
				window.open(event.target.href);
			} else {
				window.location.href = event.target.href;
			}
		},

		render: function render() {
			var obj = this.props.option;
			var renderedLabel = this.props.renderFunc(obj);
			var optionClasses = classes(this.props.className, obj.className);

			return obj.disabled ? React.createElement(
				'div',
				{ className: optionClasses,
					onMouseDown: this.blockEvent,
					onClick: this.blockEvent },
				renderedLabel
			) : React.createElement(
				'div',
				{ className: optionClasses,
					style: obj.style,
					onMouseEnter: this.props.mouseEnter,
					onMouseLeave: this.props.mouseLeave,
					onMouseDown: this.props.mouseDown,
					onClick: this.props.mouseDown,
					title: obj.title },
				obj.create ? this.props.addLabelText.replace('{label}', obj.label) : renderedLabel
			);
		}
	});

	module.exports = Option;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var MentionSelect = __webpack_require__(19),
	    AliasActions = __webpack_require__(5),
	    AliasStore = __webpack_require__(17),
	    AppDispatcher = __webpack_require__(6),
	    _ = __webpack_require__(14);

	module.exports = React.createClass({
	  displayName: "exports",

	  getInitialState: function getInitialState() {
	    return {
	      name_field_error: null,
	      mentions: [],
	      name: null,
	      saving: false,
	      roomParticipants: AliasStore.get('roomParticipants')
	    };
	  },

	  componentDidMount: function componentDidMount() {
	    var _this = this;

	    AliasStore.on("change", this._onStoreChange);
	    AppDispatcher.register(function (action) {
	      switch (action.type) {
	        case "alias-saved":
	          _this.setState({ saving: false });
	          break;
	        default:
	          break;
	      }
	    });
	  },

	  _onStoreChange: function _onStoreChange() {
	    var roomParticipants = AliasStore.get('roomParticipants');
	    this.setState({ roomParticipants: roomParticipants });
	  },

	  _onNameChange: function _onNameChange(e) {
	    var name = e.target.value;
	    var name_field_error = this.state.name_field_error;
	    if (name.indexOf("@") !== 0 || name.length < 3) {
	      name_field_error = "Alias name must start with @ and be longer than 3 characters.";
	    } else {
	      name_field_error = null;
	    }

	    if (_.some(this.state.roomParticipants, function (user) {
	      return user.mention_name === name.slice(1);
	    })) {
	      name_field_error = "Alias name is already used for another user.";
	    }

	    this.setState({
	      name: e.target.value,
	      name_field_error: name_field_error
	    });
	  },

	  _onMentionsChange: function _onMentionsChange(mentions) {
	    this.setState({
	      mentions: mentions
	    });
	  },

	  _onChange: function _onChange() {
	    this.setState(this._getState());
	  },

	  _getState: function _getState() {
	    return {
	      name_field_error: null,
	      valid: false
	    };
	  },

	  _saveAlias: function _saveAlias(e) {
	    this.setState({
	      saving: true
	    });
	    AliasActions.saveAlias(this.state.name, this.state.mentions);

	    e.preventDefault();
	  },

	  _isValid: function _isValid() {
	    return _.isNull(this.state.name_field_error) && !_.isNull(this.state.name) && this.state.mentions.length > 0;
	  },

	  render: function render() {

	    var nameInputValidationAtrributes = {
	      "data-aui-notification-field": true,
	      "data-aui-notification-position": "top"
	    };

	    if (!_.isNull(this.state.name_field_error)) {
	      nameInputValidationAtrributes["data-aui-notification-error"] = this.state.name_field_error;
	    } else {
	      nameInputValidationAtrributes["data-aui-notification-info"] = "Must start with @";
	    }

	    return React.createElement(
	      "div",
	      { className: "dialog" },
	      React.createElement(
	        "div",
	        { className: "aui-group instruction" },
	        React.createElement("div", { className: "aui-item image" }),
	        React.createElement(
	          "div",
	          { className: "aui-item description" },
	          React.createElement(
	            "h4",
	            null,
	            "Alias"
	          ),
	          React.createElement(
	            "div",
	            null,
	            "Do you want to mention a bunch of people at the same time? Alias got you covered. It will remember who's who and help you @mention your whole team."
	          )
	        )
	      ),
	      React.createElement(
	        "form",
	        { className: "aui top-label" },
	        React.createElement(
	          "div",
	          { className: "aui-group add-new-alias" },
	          React.createElement(
	            "div",
	            { className: "aui-item name" },
	            React.createElement(
	              "div",
	              { className: "field-group" },
	              React.createElement("input", _extends({ type: "text", className: "text", name: "alias", placeholder: "Alias name..."
	              }, nameInputValidationAtrributes, {
	                onChange: this._onNameChange }))
	            )
	          ),
	          React.createElement(
	            "div",
	            { className: "aui-item mentions" },
	            React.createElement(MentionSelect, { initialMentions: [],
	              onChange: this._onMentionsChange })
	          ),
	          React.createElement(
	            "div",
	            { className: "aui-item actions" },
	            React.createElement("input", { className: "button submit", type: "submit", value: "Add", onClick: this._saveAlias,
	              disabled: !this._isValid() || this.state.saving })
	          )
	        )
	      )
	    );
	  }

	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var invariant = __webpack_require__(28),
	    $ = __webpack_require__(15);

	module.exports = React.createClass({

	  displayName: "Spinner",

	  componentWillMount: function componentWillMount() {
	    invariant(_.contains(["small", "medium", "large"], this.props.size), "Spinner size must be either small, medium or large");
	  },

	  getDefaultProps: function getDefaultProps() {
	    return {
	      size: 'medium',
	      zIndex: 100
	    };
	  },

	  componentDidMount: function componentDidMount() {
	    this._setSpinner();
	  },

	  componentDidUpdate: function componentDidUpdate() {
	    this._setSpinner();
	  },

	  _setSpinner: function _setSpinner() {
	    var options;

	    if (this.refs.spinner) {
	      if (this.props.spin) {
	        options = this._getOptions();
	        AJS.$(React.findDOMNode(this.refs.spinner)).spin(this.props.size, options);
	      } else {
	        AJS.$(React.findDOMNode(this.refs.spinner)).spinStop();
	      }
	    }
	  },

	  _getOptions: function _getOptions() {
	    var options = this.props,
	        colorOptions = {
	      color: "#000000"
	    };

	    if (!this.props.color) {
	      colorOptions.color = "#000000";
	      options = _.merge(options, colorOptions);
	    }
	    return options;
	  },

	  render: function render() {
	    return React.createElement("div", { className: "hc-spinner " + (this.props.spinner_class ? this.props.spinner_class : ""), ref: "spinner" });
	  }
	});

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if ("production" !== process.env.NODE_ENV) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        'Invariant Violation: ' +
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ },
/* 29 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);