/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/debug/src/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(/*! ./common */ "./node_modules/debug/src/common.js")(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ "./node_modules/debug/src/common.js":
/*!******************************************!*\
  !*** ./node_modules/debug/src/common.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(/*! ms */ "./node_modules/ms/index.js");
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ "./node_modules/extend/index.js":
/*!**************************************!*\
  !*** ./node_modules/extend/index.js ***!
  \**************************************/
/***/ ((module) => {

"use strict";


var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


/***/ }),

/***/ "./node_modules/ms/index.js":
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "./lib/convert.js":
/*!************************!*\
  !*** ./lib/convert.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertDocsHtmlToMarkdown: () => (/* binding */ convertDocsHtmlToMarkdown)
/* harmony export */ });
/* harmony import */ var _fix_google_html_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fix-google-html.js */ "./lib/fix-google-html.js");
/* harmony import */ var rehype_dom_parse__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rehype-dom-parse */ "./node_modules/rehype-dom-parse/lib/index.js");
/* harmony import */ var hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! hast-util-to-mdast */ "./node_modules/hast-util-to-mdast/lib/handlers/index.js");
/* harmony import */ var _rehype_to_remark_with_spaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rehype-to-remark-with-spaces.js */ "./lib/rehype-to-remark-with-spaces.js");
/* harmony import */ var remark_gfm__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! remark-gfm */ "./node_modules/remark-gfm/lib/index.js");
/* harmony import */ var remark_stringify__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! remark-stringify */ "./node_modules/remark-stringify/lib/index.js");
/* harmony import */ var unified__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! unified */ "./node_modules/unified/lib/index.js");

// rehype-dom-parse is a lightweight version of rehype-parse that leverages
// browser APIs -- reduces bundle size by ~200 kB!







/** @typedef {import("mdast-util-to-markdown").State} MdastState */
/** @typedef {import("unist").Node} UnistNode */
/** @typedef {import("hast-util-to-mdast").Handle} Handle */

/** @type {Handle} */
function preserveTagAndConvertContents (state, node, _parent) {
  return [
    { type: 'html', value: `<${node.tagName}>` },
    ...state.all(node),
    { type: 'html', value: `</${node.tagName}>` },
  ];
}

function unwrapBold(node) {
  if (node.children.length === 1 && ['strong', 'title'].includes(node.children[0].tagName)) {
    // Recursive unwrap in case there's another one hidden in there
    return unwrapBold({ ...node, children: node.children[0].children });
  } else {
    return node;
  }
}

function removeEmpty(state, node, _parent) {
  if (node.children.length === 0) return null
  return hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_2__.handlers[node.tagName](state, node)
}

/** @type {Handle} */
function headingWithId (state, node, _parent) {
  const num = parseInt(node.tagName.slice(1))
  const nextNum = num + 1
  const nextHeading = 'h' + nextNum
  const newNode = hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_2__.handlers[nextHeading](state, { ...unwrapBold(node), tagName: nextHeading })

  if (false) {}

  return newNode;
}

function titleToH1 (state, node, _parent) {
  return hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_2__.handlers.h1(state, { ...node, tagName: 'h1' })
}

/**
 * Use two blank lines before headings. This is a "join" function, which tells
 * remark-stringify how to join adjacent nodes.
 * @param {UnistNode} previous
 * @param {UnistNode} next
 * @param {UnistNode} _parent
 * @param {MdastState} _state
 * @returns {boolean|number|void}
 */
function doubleBlankLinesBeforeHeadings (previous, next, parent, _state) {
  if (previous.type !== 'heading' && next.type === 'heading') {
    return 2;
  }
  if (previous.type === 'list' && next.type === 'list' && previous.ordered === next.ordered) {
    return 0;
  }
  if (previous.type === 'listItem' && next.type === 'listItem') {
    return 0;
  }
  if (
    next.type === 'list' &&
    previous.type === 'paragraph' &&
    parent.type === 'listItem'
  ) {
    console.log(previous, next)
    return 0;
  }
  return undefined;
}

const processor = (0,unified__WEBPACK_IMPORTED_MODULE_3__.unified)()
  .use(rehype_dom_parse__WEBPACK_IMPORTED_MODULE_4__["default"])
  .use(_fix_google_html_js__WEBPACK_IMPORTED_MODULE_0__["default"])
  // .use(require('./lib/log-tree').default)
  .use(_rehype_to_remark_with_spaces_js__WEBPACK_IMPORTED_MODULE_1__["default"], {
    handlers: {
      // Preserve sup/sub markup; most Markdowns have no markup for it.
      sub: preserveTagAndConvertContents,
      sup: preserveTagAndConvertContents,
      table: preserveTagAndConvertContents,
      tr: preserveTagAndConvertContents,
      td: preserveTagAndConvertContents,
      th: preserveTagAndConvertContents,
      title: titleToH1,
      h1: headingWithId,
      h2: headingWithId,
      h3: headingWithId,
      h4: headingWithId,
      h5: headingWithId,
      h6: headingWithId,
      strong: removeEmpty,
      em: removeEmpty,
    }
  })
  .use(remark_gfm__WEBPACK_IMPORTED_MODULE_5__["default"])
  .use(remark_stringify__WEBPACK_IMPORTED_MODULE_6__["default"], {
    bullet: '-',
    emphasis: '*',
    fences: true,
    listItemIndent: 'one',
    strong: '*',
    join: [doubleBlankLinesBeforeHeadings],
    tightDefinitions: true,
    rule: '-',
  });

/**
 * Parse a Google Docs Slice Clip (the Google Docs internal format for
 * representing copied documents or selections from a document). This parses a
 * string representing the document and unwraps it if enclosed in a wrapper
 * object. You can pass in a string or object.
 * @param {any} raw
 * @returns {any}
 */
function parseGdocsSliceClip(raw) {
  const wrapper = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const data = typeof wrapper.data === 'string' ? JSON.parse(wrapper.data) : wrapper.data;

  // Do a basic check to ensure we are dealing with what we think we are. This
  // is not meant to be exhaustive or to check the exact schema.
  if (
    typeof data?.resolved?.dsl_entitypositionmap !== 'object'
    || typeof data?.resolved?.dsl_spacers !== 'string'
    || !Array.isArray(data?.resolved?.dsl_styleslices)
  ) {
    throw new SyntaxError(`Document does not appear to be a GDocs Slice Clip: ${JSON.stringify(raw)}`);
  }

  return data;
}

function fixOffsetLinks(md) {
  return md.replace(/\[ ([^\]]+)\]/g, ' [$1]')
}

function fixNoTitle(md) {
  if (/^# \w+/m.exec(md)) {
    return md
  } else {
    return md.replace(/^#(#+) /mg, '$1 ')
  }
}

function convertDocsHtmlToMarkdown(html, rawSliceClip) {
  const sliceClip = rawSliceClip ? parseGdocsSliceClip(rawSliceClip) : null;
  return processor.process({
    value: html,
    data: {
      sliceClip
    }
  }).then(result => result.value).then(fixOffsetLinks).then(fixNoTitle);
}


/***/ }),

/***/ "./lib/css.js":
/*!********************!*\
  !*** ./lib/css.js ***!
  \********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseCssPropertyList: () => (/* binding */ parseCssPropertyList),
/* harmony export */   resolveNodeStyle: () => (/* binding */ resolveNodeStyle)
/* harmony export */ });
/**
 * Light-Weight CSS Tooling
 *
 * The code here is meant to be a pretty light-weight and minimal approach to
 * CSS handling that meets the needs of the rest of the GDoc2Md library. It is
 * not meant to apply much validation or strictness to the CSS it handles, or
 * to handle particularly complex CSS content that we don't expect to see from
 * Google Docs.
 *
 * If our needs get drastically more complex in the future, we should switch to
 * using a dedicated third-party CSS parser like css-tree or postcss.
 */

/** @typedef {{[index: string]: string}} Style */

/**
 * Check whether a string is empty or only contains whitespace.
 * @param {string} text
 * @returns {boolean}
 */
function isBlank(text) {
  return /^\s*$/.test(text);
}

/**
 * Parse a CSS property list (e.g. from an HTML `style` attribute) into a simple
 * object where the keys are the property names and the values are the property
 * values (as strings).
 * Value strings are lower-cased for easier handling (since most CSS values are
 * case insensitive), but this doesn't break out individual properties from
 * shorthand properties or do other specialized property/value handling.
 * @param {string} text
 * @returns {Style}
 */
function parseCssPropertyList(text) {
  const properties = Object.create(null);
  if (!text) return properties;

  // This is pretty simplistic, and there are significant caveats:
  // - The semicolon could be inside a quoted string, in which case it shouldn't
  //   split properties.
  // - The property names and values are not limited to the actual allowed
  //   characters (the rules used here are much simpler than in real CSS).
  //
  // For the most part, this library doesn't need to be too concerned with
  // invalid input. We expect to be working with valid HTML & CSS that was
  // output by Google Docs. We haven't seen content that violates the above
  // caveats, so this is OK for now, but that could potentially change.
  for (const property of text.split(';')) {
    if (isBlank(property)) continue;

    try {
      const {name, value} = property
        .match(/^\s*(?<name>[\w-]+)\s*:\s*(?<value>.+)\s*$/)
        .groups;
      // Lower-case values for easier lookups and comparisons. Technically this
      // should only happen for parts of the value that are not quoted.
      properties[name] = value.toLowerCase();
    }
    catch(error) {
      console.warn(`Could not parse CSS property "${property}" (${error})`);
    }
  }

  return properties;
}

/**
 * Get the content of the node's `style` attribute as a parsed object. This
 * caches the results on the node for easy retrieval.
 * @param {RehypeNode} node
 * @returns {Style}
 */
function getNodeStyle(node) {
  return node._style ||= parseCssPropertyList(node.properties?.style);
}

/**
 * Resolve the actual, inherited value of a single style property based on the
 * whole tree of nodes. This caches results on the node for easy retrieval.
 * @param {string} propertyName
 * @param {RehypeNode} node
 * @param {RehypeNode[]} ancestors List of ancestor nodes, ordered shallowest to
 *        deepest in the tree.
 * @returns {string|undefined}
 */
function getResolvedStyleProperty(propertyName, node, ancestors) {
  node._resolvedStyle ||= Object.create(null);
  if (propertyName in node._resolvedStyle) {
    return node._resolvedStyle[propertyName];
  }

  let value = getNodeStyle(node)[propertyName];
  if ((value && value !== 'inherit') || !ancestors?.length) {
    node._resolvedStyle[propertyName] = value;
    return value;
  }

  // WARNING: Not all properties are inheritable, but this code doesn't check
  // for inheritability. If it turns out we need to do so, MDN has nice data
  // to build an allow/block-list from:
  // https://github.com/mdn/data/blob/main/css/properties.json
  const parentAncestors = ancestors.slice(0, -1);
  const parent = ancestors[parentAncestors.length];
  return getResolvedStyleProperty(propertyName, parent, parentAncestors);
}

/**
 * Get an object with properties representing a node's fully resolved styles,
 * including anything inherited from ancestors.
 * @param {RehypeNode} node
 * @param {RehypeNode[]} ancestors Ancestors of `node`, starting with the tree
 *        root and ending with the parent of `node`.
 * @returns {Style}
 */
function resolveNodeStyle(node, ancestors) {
  return new Proxy(Object.create(null), {
    get (target, property, _receiver) {
      if (!(property in target)) {
        target[property] = getResolvedStyleProperty(property, node, ancestors);
      }
      return target[property];
    }
  });
}


/***/ }),

/***/ "./lib/fix-google-html.js":
/*!********************************!*\
  !*** ./lib/fix-google-html.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createCodeBlocks: () => (/* binding */ createCodeBlocks),
/* harmony export */   "default": () => (/* binding */ fixGoogleHtml),
/* harmony export */   detectTableColumnAlignment: () => (/* binding */ detectTableColumnAlignment),
/* harmony export */   fixNestedLists: () => (/* binding */ fixNestedLists),
/* harmony export */   moveLinebreaksOutsideOfAnchors: () => (/* binding */ moveLinebreaksOutsideOfAnchors),
/* harmony export */   moveSpaceOutsideSensitiveChildren: () => (/* binding */ moveSpaceOutsideSensitiveChildren),
/* harmony export */   removeLineBreaksBeforeBlocks: () => (/* binding */ removeLineBreaksBeforeBlocks),
/* harmony export */   unInlineStyles: () => (/* binding */ unInlineStyles),
/* harmony export */   unwrapLineBreaks: () => (/* binding */ unwrapLineBreaks)
/* harmony export */ });
/* harmony import */ var hastscript__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! hastscript */ "./node_modules/hastscript/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit/lib/index.js");
/* harmony import */ var unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! unist-util-visit-parents */ "./node_modules/unist-util-visit-parents/lib/index.js");
/* harmony import */ var github_slugger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! github-slugger */ "./node_modules/github-slugger/index.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var _css_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css.js */ "./lib/css.js");









const log = debug__WEBPACK_IMPORTED_MODULE_1__("app:fix-google-html:debug");

const blockElements = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "caption",
  "center", // historic
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir", // historic
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "frameset", // historic
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "isindex", // historic
  "li",
  "main",
  "menu",
  "nav",
  "noframes", // historic
  "ol",
  "p",
  "pre",
  "section",
  "summary",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "td",
  "th",
  "tr",
  "ul",
]);

// These elements convert to Markdown nodes that can't start or end with spaces.
// For example, you can't start emphasis with a space: `This * is emphasized*`.
const spaceSensitiveElements = new Set(["em", "strong"]);

const isList = (node) => node.tagName === "ul" || node.tagName === "ol";
const isStyled = (node) => node.type === "element" && node.properties.style;
const isBlock = (node) => node && blockElements.has(node.tagName);
const isSpaceSensitive = (node) =>
  node && spaceSensitiveElements.has(node.tagName);
const isCell = (node) => node.tagName === "th" || node.tagName === "td";
const isAnchor = (node) => node.tagName === "a";

const spaceAtStartPattern = /^(\s+)/;
const spaceAtEndPattern = /(\s+)$/;

// Wrap the children of `node` with the `wrapper` node.
function wrapChildren(node, wrapper) {
  wrapper.children = node.children;
  node.children = [wrapper];
  return wrapper;
}

/**
 * Fix the incorrect formatting of nested lists in Google Docs's HTML. Lists
 * can only have `div` and `li` children, but Google Docs has other lists as
 * direct descendents. This moves those free-floating lists into the previous
 * `li` element under the assumption that they represent subitems of it.
 *
 * @param {RehypeNode} node Fix the tree below this node
 *
 * @example
 * Input a tree like:
 *    <ul>
 *      <li>An item!</li>
 *      <ul>
 *        <li>A subitem!</li>
 *      </ul>
 *    </ul>
 *
 * Output:
 *    <ul>
 *      <li>An Item!
 *        <ul>
 *          <li>A subitem!</li>
 *        </ul>
 *      </li>
 *    </ul>
 */
function fixNestedLists(node) {
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(node, isList, (node, index, parent) => {
    if (isList(parent)) {
      const previous = parent.children[index - 1];
      if (previous && previous.tagName === "li") {
        previous.children.push(node);
        parent.children.splice(index, 1);
        return index;
      } else {
        console.warn("No previous list item to move nested list into!");
      }
    }
  });
}

/**
 * Google Docs does italics/bolds/etc on `<span>`s with style attributes, but
 * rehype-remark does not pick up on those. Instead, transform them into
 * semantic `em`, `strong`, etc. elements.
 *
 * @param {RehypeNode} node Fix the tree below this node
 */
function unInlineStyles(node) {
  convertInlineStylesToElements(node);
  mergeConsecutiveInlineStyles(node);
}

/**
 * @private
 * Convert CSS in style attribtutes to semantic elements that are more readily
 * converted to Markdown.
 * @param {RehypeNode} node Fix the tree below this node
 */
function convertInlineStylesToElements(node) {
  (0,unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_4__.visitParents)(
    node,
    (n) => isStyled(n) && !isBlock(n),
    (node, parents) => {
      const style = (0,_css_js__WEBPACK_IMPORTED_MODULE_2__.resolveNodeStyle)(node, parents);

      // Turn a big font size into h1
      if (
        style["font-size"] &&
        parseFloat(style["font-size"].slice(0, -2)) > 20
      ) {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("title"));
      }

      if (style["font-style"] === "italic") {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("em"));
      }

      const weight = style["font-weight"];
      if (weight === "bold" || weight === "700") {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("strong"));
      }

      const verticalAlign = style["vertical-align"];
      if (verticalAlign === "super") {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("sup"));
      } else if (verticalAlign === "sub") {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("sub"));
      }

      // Some browsers paste with the `text-decoration` property and some use the
      // newer `text-decoration-line`, so we need to support both.
      const decorationLine =
        style["text-decoration"] || style["text-decoration-line"];
      if (decorationLine?.startsWith("line-through")) {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("del"));
      }

      // Google docs doesn't really have anything that represents "code", so infer
      // it from the use of monospace fonts.
      if (/(,\s*monospace)|(Consolas)/i.test(style["font-family"])) {
        wrapChildren(node, (0,hastscript__WEBPACK_IMPORTED_MODULE_5__.h)("code"));
      }

      // Keep the structure as flat as possible by removing semantically
      // meaningless elements once we've extracted formatting from them.
      if (node.tagName === "span") {
        const parent = parents[parents.length - 1];
        const index = parent.children.indexOf(node);
        if (index === -1) {
          throw new Error("Could not find visited node in its parent");
        }

        const childrenCount = node.children.length;
        parent.children.splice(index, 1, ...node.children);
        return index + childrenCount;
      }
    },
  );
}

/**
 * @private
 * Find consecutive inline elements of the same type and merge their contents.
 * For example, this would convert:
 *
 *     <code>const </code><code>name</code>
 *
 * To:
 *
 *     <code>const name</code>
 * @param {RehypeNode} node Fix the tree below this node
 */
function mergeConsecutiveInlineStyles(node) {
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(
    node,
    (n) => n.tagName && n.children?.length,
    (node, _index, _parent) => {
      const newChildren = [];
      let activeNode = null;
      for (const child of node.children) {
        if (activeNode) {
          if (child.tagName === activeNode.tagName) {
            activeNode.children.push(...child.children);
          } else {
            activeNode = null;
          }
        }
        if (!activeNode) {
          newChildren.push(child);
          if (child.tagName && !isBlock(child)) {
            activeNode = child;
          }
        }
      }
      node.children = newChildren;
    },
  );
}

/**
 * Line breaks frequently wind up wrapped with a somewhat pointless `<span>`
 * element that makes them hard to deal correctly with. Unwrap those line breaks
 * so that they are bare `<br>` elements.
 *
 * Changes this:
 *     <span><br></span>
 * To:
 *     <br>
 * @param {RehypeNode} node Fix the tree below this node
 */
function unwrapLineBreaks(node) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (
      child.tagName === "span" &&
      child.children.length === 1 &&
      child.children[0].tagName === "br"
    ) {
      children.splice(i, 1, child.children[0]);
    } else if (child.children) {
      unwrapLineBreaks(child);
    }
  }
  node.children = children;
}

/**
 * Moves linebreaks outside of anchor elements,
 * if the linebreak is the first and/or last child of the anchor.
 * @param {RehypeNode} node
 */
function moveLinebreaksOutsideOfAnchors(node) {
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(node, isAnchor, (node, index, parent) => {
    const children = node.children;
    if (children[children.length - 1]?.tagName === "br") {
      const endingBr = children.pop();
      parent.children.splice(index + 1, 0, endingBr);
    }
    if (children[0]?.tagName === "br") {
      const beginningBr = children.shift();
      parent.children.splice(index, 0, beginningBr);
    }
  });
}

/**
 * Paragraphs and other block elements frequently wind up preceded with
 * pointless `<br>` elements. This is probably because paragraphs do not, by
 * default, have any space around them in a Google doc, even though having a
 * blank line is what causes Google Docs to spit out `<p>` elements instead of
 * just `<br>` elements.
 *
 * Changes this:
 *     <br><p>Blah</p>
 * To:
 *     <p>Blah</p>
 * @param {RehypeNode} node Fix the tree below this node
 */
function removeLineBreaksBeforeBlocks(node) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.tagName === "br" && isBlock(children[i + 1])) {
      children.splice(i, 1);
      i -= 1;
    } else if (child.children) {
      removeLineBreaksBeforeBlocks(child);
    }
  }
  node.children = children;
}

/**
 * Remove spaces from the start or end of nodes where it's not valid in Markdown
 * (e.g. `<em>`) and return the removed spaces. Works recursively to handle
 * nested nodes with surrounding spaces.
 * @param {RehypeNode} node
 * @returns {string}
 */
function _extractInvalidSpace(node, side = "start") {
  let totalSpace = "";

  const reverse = side === "start" ? false : true;
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(
    node,
    (child, index, parent) => {
      if (child.type === "text") {
        const pattern =
          side === "start" ? spaceAtStartPattern : spaceAtEndPattern;
        const spaceMatch = child.value.match(pattern);
        if (spaceMatch) {
          const space = spaceMatch[1];
          const body =
            side === "start"
              ? child.value.slice(space.length)
              : child.value.slice(0, -space.length);
          totalSpace =
            side === "start" ? totalSpace + space : space + totalSpace;
          if (body.length) {
            child.value = body;
            return unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_4__.EXIT;
          } else {
            parent.children.splice(index, 1);
            return side === "start" ? index : index - 1;
          }
        } else {
          return unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_4__.EXIT;
        }
      } else if (isSpaceSensitive(child)) {
        return unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_4__.CONTINUE;
      } else {
        return unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_4__.EXIT;
      }
    },
    reverse,
  );

  return totalSpace;
}

/**
 * In Google Docs (and HTML in general), an element that formats some text can
 * start with spaces, tabs, etc. However, in Markdown, some inline markup
 * (mainly emphasis marks like `**bold**` and `_italic_`) can't start or end
 * with spaces. This finds such elements and moves leading and trailing spaces
 * from inside to outside them.
 *
 * For example, this turns a tree like:
 *
 *     <p>Hello<em> italics </em></p>
 *
 * Into:
 *
 *     <p>Hello <em>italics</em> </p>
 *
 * @param {RehypeNode} node Fix the tree below this node
 */
function moveSpaceOutsideSensitiveChildren(node) {
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(node, isSpaceSensitive, (node, index, parent) => {
    let nextIndex = index + 1;

    const startSpace = _extractInvalidSpace(node, "start");
    if (startSpace) {
      parent.children.splice(index, 0, { type: "text", value: startSpace });
      nextIndex++;
    }

    const endSpace = _extractInvalidSpace(node, "end");
    if (endSpace) {
      parent.children.splice(nextIndex, 0, { type: "text", value: endSpace });
      nextIndex++;
    }

    return nextIndex;
  });
}

/**
 * @param {RehypeNode} node
 * @returns {string|null}
 */
function getNodeTextAlignment(node) {
  const style = (0,_css_js__WEBPACK_IMPORTED_MODULE_2__.resolveNodeStyle)(node);
  const alignMatch = style["text-align"]?.match(/^(left|center|right)/);
  if (alignMatch) {
    return alignMatch[1];
  }
  return null;
}

/**
 * Tables in Google Docs don't actually put alignment info on the columns or
 * cells. Instead, cells have paragraphs that are aligned. This detects the
 * alignment of the content of table cells so that the Markdown conversion will
 * set the correct alignment for columns.
 * @param {RehypeNode} node Fix the tree below this node
 */
function detectTableColumnAlignment(node) {
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(node, isCell, (node, _index, _parent) => {
    if (!node.properties.align) {
      let alignment = getNodeTextAlignment(node);
      if (!alignment && node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const childAlignment = getNodeTextAlignment(node.children[i]);
          if (i === 0) {
            alignment = childAlignment;
          } else if (childAlignment !== alignment) {
            alignment = null;
            break;
          }
        }
      }

      if (alignment) {
        node.properties.align = alignment;
      }
    }
  });
}

/**
 * @private
 * Determine whether all the text nodes that are descendents of this node are
 * wrapped inside nodes represent `<code>` elements. Returns `null` if the
 * node has no text descendents, otherwise returns a boolean.
 * @param {RehypeNode} parent Check children of this node.
 * @returns {boolean|null}
 */
function isAllTextCode(parent) {
  if (!parent.children?.length) return null;
  if (["h1", "h2", "h3", "h4", "h5", "h6", "li"].includes(parent.tagName))
    return null;

  let hasText = false;
  for (const child of parent.children) {
    if (child.tagName === "code") {
      hasText = true;
      continue;
    } else if (child.type === "text") {
      if (!child.value.match(/^\s+$/)) {
        return false;
      }
    } else {
      const childResult = isAllTextCode(child);
      if (childResult === false) {
        return false;
      } else if (childResult === true) {
        hasText = true;
      }
    }
  }

  return hasText ? true : null;
}

function hasCodeNewline(parent) {
  if (!parent.children?.length) return null;

  let hasNewline = false;
  for (const child of parent.children) {
    if (child.tagName === "br") {
      hasNewline = true;
      continue;
    } else if (child.type === "text") {
      if (child.textContent && child.innerText.includes("\n")) {
        hasNewline = true;
        continue;
      }
    } else {
      const childResult = hasCodeNewline(child);
      if (childResult === false) {
        return false;
      } else if (childResult === true) {
        hasNewline = true;
      }
    }
  }

  return hasNewline ? true : null;
}

/**
 * Identify paragraphs where all the text is wrapped in `<code>` nodes and wrap
 * the entire pagraph in a `<pre><code>` node. Merge consecutive all-code
 * paragraphs into a single `<pre><code>` block.
 * @param {RehypeNode} node Fix the tree below this node
 */
function createCodeBlocks(node) {
  if (!node.children?.length) return;

  // TODO: identify *lines* that are all code (not just block elements) by
  // splitting on `<br>` nodes, and break up parent blocks that have complete
  // code lines in them.

  let codeBlocks = [];

  if (
    node.tagName === "p" &&
    node.children.some((child) => child.tagName === "code") &&
    node.children.every(
      (child) =>
        child.tagName === "code" ||
        (child.type === "text" && child.value.match(/^\s+$/)),
    )
  ) {
    codeBlocks = [{ start: 0, end: node.children.length }];
  } else {
    let activeCodeBlock = null;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (["tr", "td", "th", "li"].includes(child.tagName)) {
        createCodeBlocks(child);
      } else if (isBlock(child)) {
        if (isAllTextCode(child)) {
          if (!activeCodeBlock) {
            activeCodeBlock = { start: i, end: 0 };
            codeBlocks.push(activeCodeBlock);
          }
        } else {
          if (activeCodeBlock) {
            activeCodeBlock.end = i;
            activeCodeBlock = null;
          } else {
            createCodeBlocks(child);
          }
        }
      } else {
        createCodeBlocks(child);
      }
    }
    if (activeCodeBlock) {
      activeCodeBlock.end = node.children.length;
      codeBlocks.push(activeCodeBlock);
    }
  }

  // Go in reverse order so we can use the indexes as is, without worrying about
  // how replacing each block changes the indexes of the next one.
  for (const block of codeBlocks.reverse()) {
    const length = block.end - block.start;
    if (
      node.type !== "root" &&
      length === 1 &&
      !hasCodeNewline(node.children[block.start])
    ) {
      console.log(node.children[block.start]);
      continue;
    }
    const contents = node.children
      .slice(block.start, block.end)
      .flatMap((node) =>
        // Unwrap paragraphs and replace them with their contents + a line break
        // so we don't wind up adding blank lines around each line of code.
        node.tagName === "p"
          ? [...node.children, { type: "element", tagName: "br" }]
          : [node],
      );
    node.children.splice(block.start, length, {
      type: "element",
      tagName: "pre",
      children: [
        {
          type: "element",
          tagName: "code",
          children: contents,
        },
      ],
    });
  }
}

const isChecklistItem = (node) =>
  node.tagName === "li" && node.properties?.role === "checkbox";

/**
 * Insert actual `<input>` checkboxes at the start of items in checklists.
 *
 * Google Docs checklists use ARIA attributes to indicate that items are
 * checklist items, and in some browsers include an image (!) of a checkbox.
 * Neither of these cleanly translate to Markdown on their own.
 * @param {RehypeNode} node Fix the tree below this node
 */
function fixChecklists(node) {
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(node, isChecklistItem, (node, _index, _parent) => {
    // As of 2023-08-16, Chrome Canary starts checklist items with an inline,
    // b64-encoded image of an (un)checked checkbox. Remove it so we don't get
    // images in our Markdown output.
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === "element") {
        if (
          child.tagName === "img" &&
          child.properties?.ariaRoleDescription?.includes("checkbox")
        ) {
          node.children.splice(i, 1);
        }
        break;
      }
    }

    const checked = node.properties.ariaChecked?.toLowerCase() === "true";
    // The checkbox must be in a <p> element.
    // See: https://github.com/syntax-tree/hast-util-to-mdast/issues/80
    node.children.splice(0, 0, {
      type: "element",
      tagName: "p",
      children: [
        {
          type: "element",
          tagName: "input",
          properties: { type: "checkbox", checked },
        },
      ],
    });
  });
}

function getTextContent(node) {
  if (node.type === "text") {
    return node.value;
  } else if (node.children) {
    return node.children.map(getTextContent).join("");
  } else {
    return "";
  }
}

/**
 * Create IDs for headings, and update internal links to use those IDs.
 * @param {RehypeNode} node
 * @param {*} sliceClip
 */
function fixInternalLinks(node, sliceClip) {
  if (!sliceClip) return;

  let internalHeadings;
  try {
    internalHeadings = sliceClip.resolved.dsl_styleslices
      .find((styleslice) => styleslice.stsl_type === "paragraph")
      .stsl_styles.filter((style) => style?.ps_hdid)
      .map((heading) => ({ level: heading.ps_hd, id: heading.ps_hdid }));
  } catch (error) {
    console.error("Error extracting headings from GDocs slice clip:", error);
  }

  // Nothing to do if there were no headings!
  if (!internalHeadings?.length) return;

  const headings = [];
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(
    node,
    (n) => n.tagName?.match(/^h\d$/),
    (node, _index, _parent) => {
      headings.push(node);
    },
  );

  // check if the headings in the tree match the internal headings
  if (
    !headings.every(
      (heading, index) =>
        heading.tagName.toLowerCase() ===
        `h${internalHeadings?.[index]?.level}`,
    )
  ) {
    console.warn(
      "Headings in slice clip data do not match headings in document; " +
        "intra-document links will be broken.",
    );
    return;
  }

  // Replace heading IDs with new, readable IDs.
  const slugger = new github_slugger__WEBPACK_IMPORTED_MODULE_0__["default"]();
  const headingIdMap = new Map();
  headings.forEach((heading, index) => {
    const internalHeading = internalHeadings[index];
    const newId = slugger.slug(getTextContent(heading));
    heading.properties.id = newId;
    headingIdMap.set(internalHeading.id, newId);
  });

  // Update any links to the headings.
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(
    node,
    (n) => n.tagName === "a",
    (node, _index, _parent) => {
      let url;
      try {
        url = new URL(node.properties.href);
      } catch (_error) {
        return;
      }

      if (url.host === "docs.google.com") {
        const internalHeadingId = url.hash.match(
          /^#heading=([a-z0-9.]+)$/,
        )?.[1];
        log("Updating link to %o", internalHeadingId);
        const newId = headingIdMap.get(internalHeadingId);
        if (newId) {
          node.properties.href = `#${newId}`;
        }
      }
    },
  );
}

/**
 * A rehype plugin to clean up the HTML of a Google Doc. .This applies to the
 * live HTML of Doc, as when you copy and paste it; not *exported* HTML (it
 * might apply there, too; I haven’t looked into it).
 */
function fixGoogleHtml() {
  return (tree, _file) => {
    unInlineStyles(tree);
    createCodeBlocks(tree);
    moveSpaceOutsideSensitiveChildren(tree);
    fixNestedLists(tree);
    detectTableColumnAlignment(tree);
    unwrapLineBreaks(tree);
    moveLinebreaksOutsideOfAnchors(tree);
    removeLineBreaksBeforeBlocks(tree);
    fixChecklists(tree);
    fixInternalLinks(tree, _file.data.sliceClip);
    return tree;
  };
}


/***/ }),

/***/ "./lib/rehype-to-remark-with-spaces.js":
/*!*********************************************!*\
  !*** ./lib/rehype-to-remark-with-spaces.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rehype2remarkWithSpaces)
/* harmony export */ });
/* harmony import */ var rehype_remark__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rehype-remark */ "./node_modules/rehype-remark/lib/index.js");


/**
 * The official rehype-remark plugin gets a little aggeressive with removing
 * spaces, so this wraps it with some space preservation.
 *
 * Ideally, this needs to be solved upstream in rehype-remark.
 * TODO: create a minimal test case and file a bug there!
 */
function rehype2remarkWithSpaces () {
  const spaceToken = '++IAMASPACE++';

  function preserveInitialSpaces (node) {
    if (node.type === 'text' && node.value.startsWith(' ')) {
      if (node.value.startsWith(' ')) {
        node.value = spaceToken + node.value.slice(1);
      }
      if (node.value.endsWith(' ')) {
        node.value = node.value.slice(0, -1) + spaceToken;
      }
    }
    if (node.children) {
      node.children.forEach(preserveInitialSpaces);
    }
  }

  function recreateSpaces (node) {
    if (node.value && typeof node.value === 'string') {
      node.value = node.value.split(spaceToken).join(' ');
    }
    if (node.children) {
      node.children.forEach(recreateSpaces);
    }
  }

  const convert = rehype_remark__WEBPACK_IMPORTED_MODULE_0__["default"].apply(this, arguments);
  return function (tree, file) {
    preserveInitialSpaces(tree);
    const markdownTree = convert.apply(this, [tree, file]);
    recreateSpaces(markdownTree);
    return markdownTree;
  };
}


/***/ }),

/***/ "./node_modules/@ungap/structured-clone/esm/deserialize.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@ungap/structured-clone/esm/deserialize.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deserialize: () => (/* binding */ deserialize)
/* harmony export */ });
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types.js */ "./node_modules/@ungap/structured-clone/esm/types.js");


const env = typeof self === 'object' ? self : globalThis;

const deserializer = ($, _) => {
  const as = (out, index) => {
    $.set(index, out);
    return out;
  };

  const unpair = index => {
    if ($.has(index))
      return $.get(index);

    const [type, value] = _[index];
    switch (type) {
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.PRIMITIVE:
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.VOID:
        return as(value, index);
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY: {
        const arr = as([], index);
        for (const index of value)
          arr.push(unpair(index));
        return arr;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.OBJECT: {
        const object = as({}, index);
        for (const [key, index] of value)
          object[unpair(key)] = unpair(index);
        return object;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.DATE:
        return as(new Date(value), index);
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.REGEXP: {
        const {source, flags} = value;
        return as(new RegExp(source, flags), index);
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.MAP: {
        const map = as(new Map, index);
        for (const [key, index] of value)
          map.set(unpair(key), unpair(index));
        return map;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.SET: {
        const set = as(new Set, index);
        for (const index of value)
          set.add(unpair(index));
        return set;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.ERROR: {
        const {name, message} = value;
        return as(new env[name](message), index);
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.BIGINT:
        return as(BigInt(value), index);
      case 'BigInt':
        return as(Object(BigInt(value)), index);
    }
    return as(new env[type](value), index);
  };

  return unpair;
};

/**
 * @typedef {Array<string,any>} Record a type representation
 */

/**
 * Returns a deserialized value from a serialized array of Records.
 * @param {Record[]} serialized a previously serialized value.
 * @returns {any}
 */
const deserialize = serialized => deserializer(new Map, serialized)(0);


/***/ }),

/***/ "./node_modules/@ungap/structured-clone/esm/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/@ungap/structured-clone/esm/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   deserialize: () => (/* reexport safe */ _deserialize_js__WEBPACK_IMPORTED_MODULE_0__.deserialize),
/* harmony export */   serialize: () => (/* reexport safe */ _serialize_js__WEBPACK_IMPORTED_MODULE_1__.serialize)
/* harmony export */ });
/* harmony import */ var _deserialize_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./deserialize.js */ "./node_modules/@ungap/structured-clone/esm/deserialize.js");
/* harmony import */ var _serialize_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./serialize.js */ "./node_modules/@ungap/structured-clone/esm/serialize.js");



/**
 * @typedef {Array<string,any>} Record a type representation
 */

/**
 * Returns an array of serialized Records.
 * @param {any} any a serializable value.
 * @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
 * a transfer option (ignored when polyfilled) and/or non standard fields that
 * fallback to the polyfill if present.
 * @returns {Record[]}
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (typeof structuredClone === "function" ?
  /* c8 ignore start */
  (any, options) => (
    options && ('json' in options || 'lossy' in options) ?
      (0,_deserialize_js__WEBPACK_IMPORTED_MODULE_0__.deserialize)((0,_serialize_js__WEBPACK_IMPORTED_MODULE_1__.serialize)(any, options)) : structuredClone(any)
  ) :
  (any, options) => (0,_deserialize_js__WEBPACK_IMPORTED_MODULE_0__.deserialize)((0,_serialize_js__WEBPACK_IMPORTED_MODULE_1__.serialize)(any, options)));
  /* c8 ignore stop */




/***/ }),

/***/ "./node_modules/@ungap/structured-clone/esm/serialize.js":
/*!***************************************************************!*\
  !*** ./node_modules/@ungap/structured-clone/esm/serialize.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   serialize: () => (/* binding */ serialize)
/* harmony export */ });
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types.js */ "./node_modules/@ungap/structured-clone/esm/types.js");


const EMPTY = '';

const {toString} = {};
const {keys} = Object;

const typeOf = value => {
  const type = typeof value;
  if (type !== 'object' || !value)
    return [_types_js__WEBPACK_IMPORTED_MODULE_0__.PRIMITIVE, type];

  const asString = toString.call(value).slice(8, -1);
  switch (asString) {
    case 'Array':
      return [_types_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY, EMPTY];
    case 'Object':
      return [_types_js__WEBPACK_IMPORTED_MODULE_0__.OBJECT, EMPTY];
    case 'Date':
      return [_types_js__WEBPACK_IMPORTED_MODULE_0__.DATE, EMPTY];
    case 'RegExp':
      return [_types_js__WEBPACK_IMPORTED_MODULE_0__.REGEXP, EMPTY];
    case 'Map':
      return [_types_js__WEBPACK_IMPORTED_MODULE_0__.MAP, EMPTY];
    case 'Set':
      return [_types_js__WEBPACK_IMPORTED_MODULE_0__.SET, EMPTY];
  }

  if (asString.includes('Array'))
    return [_types_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY, asString];

  if (asString.includes('Error'))
    return [_types_js__WEBPACK_IMPORTED_MODULE_0__.ERROR, asString];

  return [_types_js__WEBPACK_IMPORTED_MODULE_0__.OBJECT, asString];
};

const shouldSkip = ([TYPE, type]) => (
  TYPE === _types_js__WEBPACK_IMPORTED_MODULE_0__.PRIMITIVE &&
  (type === 'function' || type === 'symbol')
);

const serializer = (strict, json, $, _) => {

  const as = (out, value) => {
    const index = _.push(out) - 1;
    $.set(value, index);
    return index;
  };

  const pair = value => {
    if ($.has(value))
      return $.get(value);

    let [TYPE, type] = typeOf(value);
    switch (TYPE) {
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.PRIMITIVE: {
        let entry = value;
        switch (type) {
          case 'bigint':
            TYPE = _types_js__WEBPACK_IMPORTED_MODULE_0__.BIGINT;
            entry = value.toString();
            break;
          case 'function':
          case 'symbol':
            if (strict)
              throw new TypeError('unable to serialize ' + type);
            entry = null;
            break;
          case 'undefined':
            return as([_types_js__WEBPACK_IMPORTED_MODULE_0__.VOID], value);
        }
        return as([TYPE, entry], value);
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY: {
        if (type)
          return as([type, [...value]], value);
  
        const arr = [];
        const index = as([TYPE, arr], value);
        for (const entry of value)
          arr.push(pair(entry));
        return index;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.OBJECT: {
        if (type) {
          switch (type) {
            case 'BigInt':
              return as([type, value.toString()], value);
            case 'Boolean':
            case 'Number':
            case 'String':
              return as([type, value.valueOf()], value);
          }
        }

        if (json && ('toJSON' in value))
          return pair(value.toJSON());

        const entries = [];
        const index = as([TYPE, entries], value);
        for (const key of keys(value)) {
          if (strict || !shouldSkip(typeOf(value[key])))
            entries.push([pair(key), pair(value[key])]);
        }
        return index;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.DATE:
        return as([TYPE, value.toISOString()], value);
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.REGEXP: {
        const {source, flags} = value;
        return as([TYPE, {source, flags}], value);
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.MAP: {
        const entries = [];
        const index = as([TYPE, entries], value);
        for (const [key, entry] of value) {
          if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry))))
            entries.push([pair(key), pair(entry)]);
        }
        return index;
      }
      case _types_js__WEBPACK_IMPORTED_MODULE_0__.SET: {
        const entries = [];
        const index = as([TYPE, entries], value);
        for (const entry of value) {
          if (strict || !shouldSkip(typeOf(entry)))
            entries.push(pair(entry));
        }
        return index;
      }
    }

    const {message} = value;
    return as([TYPE, {name: type, message}], value);
  };

  return pair;
};

/**
 * @typedef {Array<string,any>} Record a type representation
 */

/**
 * Returns an array of serialized Records.
 * @param {any} value a serializable value.
 * @param {{json?: boolean, lossy?: boolean}?} options an object with a `lossy` or `json` property that,
 *  if `true`, will not throw errors on incompatible types, and behave more
 *  like JSON stringify would behave. Symbol and Function will be discarded.
 * @returns {Record[]}
 */
 const serialize = (value, {json, lossy} = {}) => {
  const _ = [];
  return serializer(!(json || lossy), !!json, new Map, _)(value), _;
};


/***/ }),

/***/ "./node_modules/@ungap/structured-clone/esm/types.js":
/*!***********************************************************!*\
  !*** ./node_modules/@ungap/structured-clone/esm/types.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ARRAY: () => (/* binding */ ARRAY),
/* harmony export */   BIGINT: () => (/* binding */ BIGINT),
/* harmony export */   DATE: () => (/* binding */ DATE),
/* harmony export */   ERROR: () => (/* binding */ ERROR),
/* harmony export */   MAP: () => (/* binding */ MAP),
/* harmony export */   OBJECT: () => (/* binding */ OBJECT),
/* harmony export */   PRIMITIVE: () => (/* binding */ PRIMITIVE),
/* harmony export */   REGEXP: () => (/* binding */ REGEXP),
/* harmony export */   SET: () => (/* binding */ SET),
/* harmony export */   VOID: () => (/* binding */ VOID)
/* harmony export */ });
const VOID       = -1;
const PRIMITIVE  = 0;
const ARRAY      = 1;
const OBJECT     = 2;
const DATE       = 3;
const REGEXP     = 4;
const MAP        = 5;
const SET        = 6;
const ERROR      = 7;
const BIGINT     = 8;
// export const SYMBOL = 9;


/***/ }),

/***/ "./node_modules/bail/index.js":
/*!************************************!*\
  !*** ./node_modules/bail/index.js ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bail: () => (/* binding */ bail)
/* harmony export */ });
/**
 * Throw a given error.
 *
 * @param {Error | null | undefined} [error]
 */
function bail(error) {
  if (error) {
    throw error
  }
}


/***/ }),

/***/ "./node_modules/ccount/index.js":
/*!**************************************!*\
  !*** ./node_modules/ccount/index.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ccount: () => (/* binding */ ccount)
/* harmony export */ });
/**
 * Count how often a character (or substring) is used in a string.
 *
 * @param {string} value
 *   Value to search in.
 * @param {string} character
 *   Character (or substring) to look for.
 * @return {number}
 *   Number of times `character` occurred in `value`.
 */
function ccount(value, character) {
  const source = String(value)

  if (typeof character !== 'string') {
    throw new TypeError('Expected character')
  }

  let count = 0
  let index = source.indexOf(character)

  while (index !== -1) {
    count++
    index = source.indexOf(character, index + character.length)
  }

  return count
}


/***/ }),

/***/ "./node_modules/comma-separated-tokens/index.js":
/*!******************************************************!*\
  !*** ./node_modules/comma-separated-tokens/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parse: () => (/* binding */ parse),
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/**
 * @typedef {Object} StringifyOptions
 * @property {boolean} [padLeft=true] Whether to pad a space before a token (`boolean`, default: `true`).
 * @property {boolean} [padRight=false] Whether to pad a space after a token (`boolean`, default: `false`).
 */

/**
 * Parse comma separated tokens to an array.
 *
 * @param {string} value
 * @returns {Array.<string>}
 */
function parse(value) {
  /** @type {Array.<string>} */
  var tokens = []
  var input = String(value || '')
  var index = input.indexOf(',')
  var start = 0
  /** @type {boolean} */
  var end
  /** @type {string} */
  var token

  while (!end) {
    if (index === -1) {
      index = input.length
      end = true
    }

    token = input.slice(start, index).trim()

    if (token || !end) {
      tokens.push(token)
    }

    start = index + 1
    index = input.indexOf(',', start)
  }

  return tokens
}

/**
 * Serialize an array of strings to comma separated tokens.
 *
 * @param {Array.<string|number>} values
 * @param {StringifyOptions} [options]
 * @returns {string}
 */
function stringify(values, options) {
  var settings = options || {}

  // Ensure the last empty entry is seen.
  if (values[values.length - 1] === '') {
    values = values.concat('')
  }

  return values
    .join(
      (settings.padRight ? ' ' : '') +
        ',' +
        (settings.padLeft === false ? '' : ' ')
    )
    .trim()
}


/***/ }),

/***/ "./node_modules/decode-named-character-reference/index.dom.js":
/*!********************************************************************!*\
  !*** ./node_modules/decode-named-character-reference/index.dom.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeNamedCharacterReference: () => (/* binding */ decodeNamedCharacterReference)
/* harmony export */ });
/// <reference lib="dom" />

/* eslint-env browser */

const element = document.createElement('i')

/**
 * @param {string} value
 * @returns {string|false}
 */
function decodeNamedCharacterReference(value) {
  const characterReference = '&' + value + ';'
  element.innerHTML = characterReference
  const char = element.textContent

  // Some named character references do not require the closing semicolon
  // (`&not`, for instance), which leads to situations where parsing the assumed
  // named reference of `&notit;` will result in the string `¬it;`.
  // When we encounter a trailing semicolon after parsing, and the character
  // reference to decode was not a semicolon (`&semi;`), we can assume that the
  // matching was not complete.
  // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
  // yield `null`.
  if (char.charCodeAt(char.length - 1) === 59 /* `;` */ && value !== 'semi') {
    return false
  }

  // If the decoded string is equal to the input, the character reference was
  // not valid.
  // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
  // yield `null`.
  return char === characterReference ? false : char
}


/***/ }),

/***/ "./node_modules/dequal/dist/index.mjs":
/*!********************************************!*\
  !*** ./node_modules/dequal/dist/index.mjs ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dequal: () => (/* binding */ dequal)
/* harmony export */ });
var has = Object.prototype.hasOwnProperty;

function find(iter, tar, key) {
	for (key of iter.keys()) {
		if (dequal(key, tar)) return key;
	}
}

function dequal(foo, bar) {
	var ctor, len, tmp;
	if (foo === bar) return true;

	if (foo && bar && (ctor=foo.constructor) === bar.constructor) {
		if (ctor === Date) return foo.getTime() === bar.getTime();
		if (ctor === RegExp) return foo.toString() === bar.toString();

		if (ctor === Array) {
			if ((len=foo.length) === bar.length) {
				while (len-- && dequal(foo[len], bar[len]));
			}
			return len === -1;
		}

		if (ctor === Set) {
			if (foo.size !== bar.size) {
				return false;
			}
			for (len of foo) {
				tmp = len;
				if (tmp && typeof tmp === 'object') {
					tmp = find(bar, tmp);
					if (!tmp) return false;
				}
				if (!bar.has(tmp)) return false;
			}
			return true;
		}

		if (ctor === Map) {
			if (foo.size !== bar.size) {
				return false;
			}
			for (len of foo) {
				tmp = len[0];
				if (tmp && typeof tmp === 'object') {
					tmp = find(bar, tmp);
					if (!tmp) return false;
				}
				if (!dequal(len[1], bar.get(tmp))) {
					return false;
				}
			}
			return true;
		}

		if (ctor === ArrayBuffer) {
			foo = new Uint8Array(foo);
			bar = new Uint8Array(bar);
		} else if (ctor === DataView) {
			if ((len=foo.byteLength) === bar.byteLength) {
				while (len-- && foo.getInt8(len) === bar.getInt8(len));
			}
			return len === -1;
		}

		if (ArrayBuffer.isView(foo)) {
			if ((len=foo.byteLength) === bar.byteLength) {
				while (len-- && foo[len] === bar[len]);
			}
			return len === -1;
		}

		if (!ctor || typeof foo === 'object') {
			len = 0;
			for (ctor in foo) {
				if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
				if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
			}
			return Object.keys(bar).length === len;
		}
	}

	return foo !== foo && bar !== bar;
}


/***/ }),

/***/ "./node_modules/devlop/lib/development.js":
/*!************************************************!*\
  !*** ./node_modules/devlop/lib/development.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deprecate: () => (/* binding */ deprecate),
/* harmony export */   equal: () => (/* binding */ equal),
/* harmony export */   ok: () => (/* binding */ ok),
/* harmony export */   unreachable: () => (/* binding */ unreachable)
/* harmony export */ });
/* harmony import */ var dequal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dequal */ "./node_modules/dequal/dist/index.mjs");


/**
 * @type {Set<string>}
 */
const codesWarned = new Set()

class AssertionError extends Error {
  name = /** @type {const} */ ('Assertion')
  code = /** @type {const} */ ('ERR_ASSERTION')

  /**
   * Create an assertion error.
   *
   * @param {string} message
   *   Message explaining error.
   * @param {unknown} actual
   *   Value.
   * @param {unknown} expected
   *   Baseline.
   * @param {string} operator
   *   Name of equality operation.
   * @param {boolean} generated
   *   Whether `message` is a custom message or not
   * @returns
   *   Instance.
   */
  // eslint-disable-next-line max-params
  constructor(message, actual, expected, operator, generated) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    /**
     * @type {unknown}
     */
    this.actual = actual

    /**
     * @type {unknown}
     */
    this.expected = expected

    /**
     * @type {boolean}
     */
    this.generated = generated

    /**
     * @type {string}
     */
    this.operator = operator
  }
}

class DeprecationError extends Error {
  name = /** @type {const} */ ('DeprecationWarning')

  /**
   * Create a deprecation message.
   *
   * @param {string} message
   *   Message explaining deprecation.
   * @param {string | undefined} code
   *   Deprecation identifier; deprecation messages will be generated only once per code.
   * @returns
   *   Instance.
   */
  constructor(message, code) {
    super(message)

    /**
     * @type {string | undefined}
     */
    this.code = code
  }
}

/**
 * Wrap a function or class to show a deprecation message when first called.
 *
 * > 👉 **Important**: only shows a message when the `development` condition is
 * > used, does nothing in production.
 *
 * When the resulting wrapped `fn` is called, emits a warning once to
 * `console.error` (`stderr`).
 * If a code is given, one warning message will be emitted in total per code.
 *
 * @template {Function} T
 *   Function or class kind.
 * @param {T} fn
 *   Function or class.
 * @param {string} message
 *   Message explaining deprecation.
 * @param {string | null | undefined} [code]
 *   Deprecation identifier (optional); deprecation messages will be generated
 *   only once per code.
 * @returns {T}
 *   Wrapped `fn`.
 */
function deprecate(fn, message, code) {
  let warned = false

  // The wrapper will keep the same prototype as fn to maintain prototype chain
  Object.setPrototypeOf(deprecated, fn)

  // @ts-expect-error: it’s perfect, typescript…
  return deprecated

  /**
   * @this {unknown}
   * @param  {...Array<unknown>} args
   * @returns {unknown}
   */
  function deprecated(...args) {
    if (!warned) {
      warned = true

      if (typeof code === 'string' && codesWarned.has(code)) {
        // Empty.
      } else {
        console.error(new DeprecationError(message, code || undefined))

        if (typeof code === 'string') codesWarned.add(code)
      }
    }

    return new.target
      ? Reflect.construct(fn, args, new.target)
      : Reflect.apply(fn, this, args)
  }
}

/**
 * Assert deep strict equivalence.
 *
 * > 👉 **Important**: only asserts when the `development` condition is used,
 * > does nothing in production.
 *
 * @template {unknown} T
 *   Expected kind.
 * @param {unknown} actual
 *   Value.
 * @param {T} expected
 *   Baseline.
 * @param {Error | string | null | undefined} [message]
 *   Message for assertion error (default: `'Expected values to be deeply equal'`).
 * @returns {asserts actual is T}
 *   Nothing; throws when `actual` is not deep strict equal to `expected`.
 * @throws {AssertionError}
 *   Throws when `actual` is not deep strict equal to `expected`.
 */
function equal(actual, expected, message) {
  assert(
    (0,dequal__WEBPACK_IMPORTED_MODULE_0__.dequal)(actual, expected),
    actual,
    expected,
    'equal',
    'Expected values to be deeply equal',
    message
  )
}

/**
 * Assert if `value` is truthy.
 *
 * > 👉 **Important**: only asserts when the `development` condition is used,
 * > does nothing in production.
 *
 * @param {unknown} value
 *   Value to assert.
 * @param {Error | string | null | undefined} [message]
 *   Message for assertion error (default: `'Expected value to be truthy'`).
 * @returns {asserts value}
 *   Nothing; throws when `value` is falsey.
 * @throws {AssertionError}
 *   Throws when `value` is falsey.
 */
function ok(value, message) {
  assert(
    Boolean(value),
    false,
    true,
    'ok',
    'Expected value to be truthy',
    message
  )
}

/**
 * Assert that a code path never happens.
 *
 * > 👉 **Important**: only asserts when the `development` condition is used,
 * > does nothing in production.
 *
 * @param {Error | string | null | undefined} [message]
 *   Message for assertion error (default: `'Unreachable'`).
 * @returns {never}
 *   Nothing; always throws.
 * @throws {AssertionError}
 *   Throws when `value` is falsey.
 */
function unreachable(message) {
  assert(false, false, true, 'ok', 'Unreachable', message)
}

/**
 * @param {boolean} bool
 *   Whether to skip this operation.
 * @param {unknown} actual
 *   Actual value.
 * @param {unknown} expected
 *   Expected value.
 * @param {string} operator
 *   Operator.
 * @param {string} defaultMessage
 *   Default message for operation.
 * @param {Error | string | null | undefined} userMessage
 *   User-provided message.
 * @returns {asserts bool}
 *   Nothing; throws when falsey.
 */
// eslint-disable-next-line max-params
function assert(bool, actual, expected, operator, defaultMessage, userMessage) {
  if (!bool) {
    throw userMessage instanceof Error
      ? userMessage
      : new AssertionError(
          userMessage || defaultMessage,
          actual,
          expected,
          operator,
          !userMessage
        )
  }
}


/***/ }),

/***/ "./node_modules/github-slugger/index.js":
/*!**********************************************!*\
  !*** ./node_modules/github-slugger/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BananaSlug),
/* harmony export */   slug: () => (/* binding */ slug)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/github-slugger/regex.js");


const own = Object.hasOwnProperty

/**
 * Slugger.
 */
class BananaSlug {
  /**
   * Create a new slug class.
   */
  constructor () {
    /** @type {Record<string, number>} */
    // eslint-disable-next-line no-unused-expressions
    this.occurrences

    this.reset()
  }

  /**
   * Generate a unique slug.
  *
  * Tracks previously generated slugs: repeated calls with the same value
  * will result in different slugs.
  * Use the `slug` function to get same slugs.
   *
   * @param  {string} value
   *   String of text to slugify
   * @param  {boolean} [maintainCase=false]
   *   Keep the current case, otherwise make all lowercase
   * @return {string}
   *   A unique slug string
   */
  slug (value, maintainCase) {
    const self = this
    let result = slug(value, maintainCase === true)
    const originalSlug = result

    while (own.call(self.occurrences, result)) {
      self.occurrences[originalSlug]++
      result = originalSlug + '-' + self.occurrences[originalSlug]
    }

    self.occurrences[result] = 0

    return result
  }

  /**
   * Reset - Forget all previous slugs
   *
   * @return void
   */
  reset () {
    this.occurrences = Object.create(null)
  }
}

/**
 * Generate a slug.
 *
 * Does not track previously generated slugs: repeated calls with the same value
 * will result in the exact same slug.
 * Use the `GithubSlugger` class to get unique slugs.
 *
 * @param  {string} value
 *   String of text to slugify
 * @param  {boolean} [maintainCase=false]
 *   Keep the current case, otherwise make all lowercase
 * @return {string}
 *   A unique slug string
 */
function slug (value, maintainCase) {
  if (typeof value !== 'string') return ''
  if (!maintainCase) value = value.toLowerCase()
  return value.replace(_regex_js__WEBPACK_IMPORTED_MODULE_0__.regex, '').replace(/ /g, '-')
}


/***/ }),

/***/ "./node_modules/github-slugger/regex.js":
/*!**********************************************!*\
  !*** ./node_modules/github-slugger/regex.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   regex: () => (/* binding */ regex)
/* harmony export */ });
// This module is generated by `script/`.
/* eslint-disable no-control-regex, no-misleading-character-class, no-useless-escape */
const regex = /[\0-\x1F!-,\.\/:-@\[-\^`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482\u0530\u0557\u0558\u055A-\u055F\u0589-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EE\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06DE\u06E9\u06FD\u06FE\u0700-\u070F\u074B\u074C\u07B2-\u07BF\u07F6-\u07F9\u07FB\u07FC\u07FE\u07FF\u082E-\u083F\u085C-\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u08E2\u0964\u0965\u0970\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09F2-\u09FB\u09FD\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF0-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B70\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BF0-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D4F-\u0D53\u0D58-\u0D5E\u0D64\u0D65\u0D70-\u0D79\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3F\u0E4F\u0E5A-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F98\u0FBD-\u0FC5\u0FC7-\u0FFF\u104A-\u104F\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u1360-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DB\u17DE\u17DF\u17EA-\u180A\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u1945\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DA-\u19FF\u1A1C-\u1A1F\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1AA6\u1AA8-\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B6A\u1B74-\u1B7F\u1BF4-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E\u1C7F\u1C89-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CCF\u1CD3\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u203E\u2041-\u2053\u2055-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u20CF\u20F1-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u215F\u2189-\u24B5\u24EA-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u3004\u3008-\u3020\u3030\u3036\u3037\u303D-\u3040\u3097\u3098\u309B\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\u9FFD-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA673\uA67E\uA6F2-\uA716\uA720\uA721\uA789\uA78A\uA7C0\uA7C1\uA7CB-\uA7F4\uA828-\uA82B\uA82D-\uA83F\uA874-\uA87F\uA8C6-\uA8CF\uA8DA-\uA8DF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA954-\uA95F\uA97D-\uA97F\uA9C1-\uA9CE\uA9DA-\uA9DF\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A-\uAA5F\uAA77-\uAA79\uAAC3-\uAADA\uAADE\uAADF\uAAF0\uAAF1\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABEB\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFDFF\uFE10-\uFE1F\uFE30-\uFE32\uFE35-\uFE4C\uFE50-\uFE6F\uFE75\uFEFD-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF3E\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDD3F\uDD75-\uDDFC\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEE1-\uDEFF\uDF20-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE40-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE7-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD28-\uDD2F\uDD3A-\uDE7F\uDEAA\uDEAD-\uDEAF\uDEB2-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF51-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC47-\uDC65\uDC70-\uDC7E\uDCBB-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD40-\uDD43\uDD48-\uDD4F\uDD74\uDD75\uDD77-\uDD7F\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDFF\uDE12\uDE38-\uDE3D\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC4B-\uDC4F\uDC5A-\uDC5D\uDC62-\uDC7F\uDCC6\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDC1-\uDDD7\uDDDE-\uDDFF\uDE41-\uDE43\uDE45-\uDE4F\uDE5A-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF3A-\uDFFF]|\uD806[\uDC3B-\uDC9F\uDCEA-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD44-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE2\uDDE5-\uDDFF\uDE3F-\uDE46\uDE48-\uDE4F\uDE9A-\uDE9C\uDE9E-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC41-\uDC4F\uDC5A-\uDC71\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF7-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83D\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDECF\uDEEE\uDEEF\uDEF5-\uDEFF\uDF37-\uDF3F\uDF44-\uDF4F\uDF5A-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE80-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE2\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDC9C\uDC9F-\uDFFF]|\uD834[\uDC00-\uDD64\uDD6A-\uDD6C\uDD73-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDE41\uDE45-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD4F-\uDEBF\uDEFA-\uDFFF]|\uD83A[\uDCC5-\uDCCF\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD83C[\uDC00-\uDD2F\uDD4A-\uDD4F\uDD6A-\uDD6F\uDD8A-\uDFFF]|\uD83E[\uDC00-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]/g


/***/ }),

/***/ "./node_modules/hast-util-embedded/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/hast-util-embedded/lib/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   embedded: () => (/* binding */ embedded)
/* harmony export */ });
/* harmony import */ var hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-is-element */ "./node_modules/hast-util-is-element/lib/index.js");


/**
 * Check if a node is a *embedded content*.
 *
 * @param value
 *   Thing to check (typically `Node`).
 * @returns
 *   Whether `value` is an element considered embedded content.
 *
 *   The elements `audio`, `canvas`, `embed`, `iframe`, `img`, `math`,
 *   `object`, `picture`, `svg`, and `video` are embedded content.
 */
const embedded = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)(
  /**
   * @param element
   * @returns {element is {tagName: 'audio' | 'canvas' | 'embed' | 'iframe' | 'img' | 'math' | 'object' | 'picture' | 'svg' | 'video'}}
   */
  function (element) {
    return (
      element.tagName === 'audio' ||
      element.tagName === 'canvas' ||
      element.tagName === 'embed' ||
      element.tagName === 'iframe' ||
      element.tagName === 'img' ||
      element.tagName === 'math' ||
      element.tagName === 'object' ||
      element.tagName === 'picture' ||
      element.tagName === 'svg' ||
      element.tagName === 'video'
    )
  }
)


/***/ }),

/***/ "./node_modules/hast-util-from-dom/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/hast-util-from-dom/lib/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromDom: () => (/* binding */ fromDom)
/* harmony export */ });
/* harmony import */ var hastscript__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hastscript */ "./node_modules/hastscript/lib/index.js");
/* harmony import */ var web_namespaces__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! web-namespaces */ "./node_modules/web-namespaces/index.js");
/**
 * @typedef {import('hast').Comment} HastComment
 * @typedef {import('hast').Doctype} HastDoctype
 * @typedef {import('hast').Element} HastElement
 * @typedef {import('hast').Nodes} HastNodes
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('hast').RootContent} HastRootContent
 * @typedef {import('hast').Text} HastText
 */

/**
 * @callback AfterTransform
 *   Callback called when each node is transformed.
 * @param {Node} domNode
 *   DOM node that was handled.
 * @param {HastNodes} hastNode
 *   Corresponding hast node.
 * @returns {undefined | void}
 *   Nothing.
 *
 *   Note: `void` included until TS infers `undefined` nicely.
 *
 * @typedef Options
 *   Configuration.
 * @property {AfterTransform | null | undefined} [afterTransform]
 *   Callback called when each node is transformed (optional).
 */




/**
 * Transform a DOM tree to a hast tree.
 *
 * @param {Node} tree
 *   DOM tree to transform.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {HastNodes}
 *   Equivalent hast node.
 */
function fromDom(tree, options) {
  return transform(tree, options || {}) || {type: 'root', children: []}
}

/**
 * @param {Node} node
 *   DOM node to transform.
 * @param {Options} options
 *   Configuration.
 * @returns {HastNodes | undefined}
 *   Equivalent hast node.
 *
 *   Note that certain legacy DOM nodes (i.e., Attr nodes (2),  CDATA, processing instructions)
 */
function transform(node, options) {
  const transformed = one(node, options)
  if (transformed && options.afterTransform)
    options.afterTransform(node, transformed)
  return transformed
}

/**
 * @param {Node} node
 *   DOM node to transform.
 * @param {Options} options
 *   Configuration.
 * @returns {HastNodes | undefined}
 *   Equivalent hast node.
 */
function one(node, options) {
  switch (node.nodeType) {
    case 1 /* Element */: {
      const domNode = /** @type {Element} */ (node)
      return element(domNode, options)
    }

    // Ignore: Attr (2).

    case 3 /* Text */: {
      const domNode = /** @type {Text} */ (node)
      return text(domNode)
    }

    // Ignore: CDATA (4).
    // Removed: Entity reference (5)
    // Removed: Entity (6)
    // Ignore: Processing instruction (7).

    case 8 /* Comment */: {
      const domNode = /** @type {Comment} */ (node)
      return comment(domNode)
    }

    case 9 /* Document */: {
      const domNode = /** @type {Document} */ (node)
      return root(domNode, options)
    }

    case 10 /* Document type */: {
      return doctype()
    }

    case 11 /* Document fragment */: {
      const domNode = /** @type {DocumentFragment} */ (node)
      return root(domNode, options)
    }

    default: {
      return undefined
    }
  }
}

/**
 * Transform a document.
 *
 * @param {Document | DocumentFragment} node
 *   DOM node to transform.
 * @param {Options} options
 *   Configuration.
 * @returns {HastRoot}
 *   Equivalent hast node.
 */
function root(node, options) {
  return {type: 'root', children: all(node, options)}
}

/**
 * Transform a doctype.
 *
 * @returns {HastDoctype}
 *   Equivalent hast node.
 */
function doctype() {
  return {type: 'doctype'}
}

/**
 * Transform a text.
 *
 * @param {Text} node
 *   DOM node to transform.
 * @returns {HastText}
 *   Equivalent hast node.
 */
function text(node) {
  return {type: 'text', value: node.nodeValue || ''}
}

/**
 * Transform a comment.
 *
 * @param {Comment} node
 *   DOM node to transform.
 * @returns {HastComment}
 *   Equivalent hast node.
 */
function comment(node) {
  return {type: 'comment', value: node.nodeValue || ''}
}

/**
 * Transform an element.
 *
 * @param {Element} node
 *   DOM node to transform.
 * @param {Options} options
 *   Configuration.
 * @returns {HastElement}
 *   Equivalent hast node.
 */
function element(node, options) {
  const space = node.namespaceURI
  const fn = space === web_namespaces__WEBPACK_IMPORTED_MODULE_0__.webNamespaces.svg ? hastscript__WEBPACK_IMPORTED_MODULE_1__.s : hastscript__WEBPACK_IMPORTED_MODULE_1__.h
  const tagName =
    space === web_namespaces__WEBPACK_IMPORTED_MODULE_0__.webNamespaces.html ? node.tagName.toLowerCase() : node.tagName
  /** @type {DocumentFragment | Element} */
  const content =
    // @ts-expect-error: DOM types are wrong, content can exist.
    space === web_namespaces__WEBPACK_IMPORTED_MODULE_0__.webNamespaces.html && tagName === 'template' ? node.content : node
  const attributes = node.getAttributeNames()
  /** @type {Record<string, string>} */
  const props = {}
  let index = -1

  while (++index < attributes.length) {
    props[attributes[index]] = node.getAttribute(attributes[index]) || ''
  }

  return fn(tagName, props, all(content, options))
}

/**
 * Transform child nodes in a parent.
 *
 * @param {Document | DocumentFragment | Element} node
 *   DOM node to transform.
 * @param {Options} options
 *   Configuration.
 * @returns {Array<HastRootContent>}
 *   Equivalent hast nodes.
 */
function all(node, options) {
  const nodes = node.childNodes
  /** @type {Array<HastRootContent>} */
  const children = []
  let index = -1

  while (++index < nodes.length) {
    const child = transform(nodes[index], options)

    if (child !== undefined) {
      // @ts-expect-error Assume no document inside document.
      children.push(child)
    }
  }

  return children
}


/***/ }),

/***/ "./node_modules/hast-util-has-property/lib/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/hast-util-has-property/lib/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasProperty: () => (/* binding */ hasProperty)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Nodes} Nodes
 */

const own = {}.hasOwnProperty

/**
 * Check if `node` is an element and has a `name` property.
 *
 * @template {string} Key
 *   Type of key.
 * @param {Nodes} node
 *   Node to check (typically `Element`).
 * @param {Key} name
 *   Property name to check.
 * @returns {node is Element & {properties: Record<Key, Array<number | string> | number | string | true>}}}
 *   Whether `node` is an element that has a `name` property.
 *
 *   Note: see <https://github.com/DefinitelyTyped/DefinitelyTyped/blob/27c9274/types/hast/index.d.ts#L37C29-L37C98>.
 */
function hasProperty(node, name) {
  const value =
    node.type === 'element' &&
    own.call(node.properties, name) &&
    node.properties[name]

  return value !== null && value !== undefined && value !== false
}


/***/ }),

/***/ "./node_modules/hast-util-is-body-ok-link/lib/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/hast-util-is-body-ok-link/lib/index.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isBodyOkLink: () => (/* binding */ isBodyOkLink)
/* harmony export */ });
/**
 * @typedef {import('hast').Nodes} Nodes
 */

const list = new Set(['pingback', 'prefetch', 'stylesheet'])

/**
 * Checks whether a node is a “body OK” link.
 *
 * @param {Nodes} node
 *   Node to check.
 * @returns {boolean}
 *   Whether `node` is a “body OK” link.
 */
function isBodyOkLink(node) {
  if (node.type !== 'element' || node.tagName !== 'link') {
    return false
  }

  if (node.properties.itemProp) {
    return true
  }

  const rel = node.properties.rel
  let index = -1

  if (!Array.isArray(rel) || rel.length === 0) {
    return false
  }

  while (++index < rel.length) {
    if (!list.has(String(rel[index]))) {
      return false
    }
  }

  return true
}


/***/ }),

/***/ "./node_modules/hast-util-is-element/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/hast-util-is-element/lib/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertElement: () => (/* binding */ convertElement),
/* harmony export */   isElement: () => (/* binding */ isElement)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Parents} Parents
 */

/**
 * @template Fn
 * @template Fallback
 * @typedef {Fn extends (value: any) => value is infer Thing ? Thing : Fallback} Predicate
 */

/**
 * @callback Check
 *   Check that an arbitrary value is an element.
 * @param {unknown} this
 *   Context object (`this`) to call `test` with
 * @param {unknown} [element]
 *   Anything (typically a node).
 * @param {number | null | undefined} [index]
 *   Position of `element` in its parent.
 * @param {Parents | null | undefined} [parent]
 *   Parent of `element`.
 * @returns {boolean}
 *   Whether this is an element and passes a test.
 *
 * @typedef {Array<TestFunction | string> | TestFunction | string | null | undefined} Test
 *   Check for an arbitrary element.
 *
 *   * when `string`, checks that the element has that tag name
 *   * when `function`, see `TestFunction`
 *   * when `Array`, checks if one of the subtests pass
 *
 * @callback TestFunction
 *   Check if an element passes a test.
 * @param {unknown} this
 *   The given context.
 * @param {Element} element
 *   An element.
 * @param {number | undefined} [index]
 *   Position of `element` in its parent.
 * @param {Parents | undefined} [parent]
 *   Parent of `element`.
 * @returns {boolean | undefined | void}
 *   Whether this element passes the test.
 *
 *   Note: `void` is included until TS sees no return as `undefined`.
 */

/**
 * Check if `element` is an `Element` and whether it passes the given test.
 *
 * @param element
 *   Thing to check, typically `element`.
 * @param test
 *   Check for a specific element.
 * @param index
 *   Position of `element` in its parent.
 * @param parent
 *   Parent of `element`.
 * @param context
 *   Context object (`this`) to call `test` with.
 * @returns
 *   Whether `element` is an `Element` and passes a test.
 * @throws
 *   When an incorrect `test`, `index`, or `parent` is given; there is no error
 *   thrown when `element` is not a node or not an element.
 */
const isElement =
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends TestFunction>(element: unknown, test: Condition, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & Predicate<Condition, Element>) &
   *   (<Condition extends string>(element: unknown, test: Condition, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & {tagName: Condition}) &
   *   ((element?: null | undefined) => false) &
   *   ((element: unknown, test?: null | undefined, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element) &
   *   ((element: unknown, test?: Test, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => boolean)
   * )}
   */
  (
    /**
     * @param {unknown} [element]
     * @param {Test | undefined} [test]
     * @param {number | null | undefined} [index]
     * @param {Parents | null | undefined} [parent]
     * @param {unknown} [context]
     * @returns {boolean}
     */
    // eslint-disable-next-line max-params
    function (element, test, index, parent, context) {
      const check = convertElement(test)

      if (
        index !== null &&
        index !== undefined &&
        (typeof index !== 'number' ||
          index < 0 ||
          index === Number.POSITIVE_INFINITY)
      ) {
        throw new Error('Expected positive finite `index`')
      }

      if (
        parent !== null &&
        parent !== undefined &&
        (!parent.type || !parent.children)
      ) {
        throw new Error('Expected valid `parent`')
      }

      if (
        (index === null || index === undefined) !==
        (parent === null || parent === undefined)
      ) {
        throw new Error('Expected both `index` and `parent`')
      }

      return looksLikeAnElement(element)
        ? check.call(context, element, index, parent)
        : false
    }
  )

/**
 * Generate a check from a test.
 *
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes a compatible test.
 *
 * The created function is a bit faster because it expects valid input only:
 * an `element`, `index`, and `parent`.
 *
 * @param test
 *   A test for a specific element.
 * @returns
 *   A check.
 */
const convertElement =
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends TestFunction>(test: Condition) => (element: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & Predicate<Condition, Element>) &
   *   (<Condition extends string>(test: Condition) => (element: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & {tagName: Condition}) &
   *   ((test?: null | undefined) => (element?: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element) &
   *   ((test?: Test) => Check)
   * )}
   */
  (
    /**
     * @param {Test | null | undefined} [test]
     * @returns {Check}
     */
    function (test) {
      if (test === null || test === undefined) {
        return element
      }

      if (typeof test === 'string') {
        return tagNameFactory(test)
      }

      // Assume array.
      if (typeof test === 'object') {
        return anyFactory(test)
      }

      if (typeof test === 'function') {
        return castFactory(test)
      }

      throw new Error('Expected function, string, or array as `test`')
    }
  )

/**
 * Handle multiple tests.
 *
 * @param {Array<TestFunction | string>} tests
 * @returns {Check}
 */
function anyFactory(tests) {
  /** @type {Array<Check>} */
  const checks = []
  let index = -1

  while (++index < tests.length) {
    checks[index] = convertElement(tests[index])
  }

  return castFactory(any)

  /**
   * @this {unknown}
   * @type {TestFunction}
   */
  function any(...parameters) {
    let index = -1

    while (++index < checks.length) {
      if (checks[index].apply(this, parameters)) return true
    }

    return false
  }
}

/**
 * Turn a string into a test for an element with a certain type.
 *
 * @param {string} check
 * @returns {Check}
 */
function tagNameFactory(check) {
  return castFactory(tagName)

  /**
   * @param {Element} element
   * @returns {boolean}
   */
  function tagName(element) {
    return element.tagName === check
  }
}

/**
 * Turn a custom test into a test for an element that passes that test.
 *
 * @param {TestFunction} testFunction
 * @returns {Check}
 */
function castFactory(testFunction) {
  return check

  /**
   * @this {unknown}
   * @type {Check}
   */
  function check(value, index, parent) {
    return Boolean(
      looksLikeAnElement(value) &&
        testFunction.call(
          this,
          value,
          typeof index === 'number' ? index : undefined,
          parent || undefined
        )
    )
  }
}

/**
 * Make sure something is an element.
 *
 * @param {unknown} element
 * @returns {element is Element}
 */
function element(element) {
  return Boolean(
    element &&
      typeof element === 'object' &&
      'type' in element &&
      element.type === 'element' &&
      'tagName' in element &&
      typeof element.tagName === 'string'
  )
}

/**
 * @param {unknown} value
 * @returns {value is Element}
 */
function looksLikeAnElement(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    'tagName' in value
  )
}


/***/ }),

/***/ "./node_modules/hast-util-parse-selector/lib/index.js":
/*!************************************************************!*\
  !*** ./node_modules/hast-util-parse-selector/lib/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseSelector: () => (/* binding */ parseSelector)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Properties} Properties
 */

/**
 * @template {string} SimpleSelector
 *   Selector type.
 * @template {string} DefaultTagName
 *   Default tag name.
 * @typedef {(
 *   SimpleSelector extends ''
 *     ? DefaultTagName
 *     : SimpleSelector extends `${infer TagName}.${infer Rest}`
 *     ? ExtractTagName<TagName, DefaultTagName>
 *     : SimpleSelector extends `${infer TagName}#${infer Rest}`
 *     ? ExtractTagName<TagName, DefaultTagName>
 *     : SimpleSelector extends string
 *     ? SimpleSelector
 *     : DefaultTagName
 * )} ExtractTagName
 *   Extract tag name from a simple selector.
 */

const search = /[#.]/g

/**
 * Create a hast element from a simple CSS selector.
 *
 * @template {string} Selector
 *   Type of selector.
 * @template {string} [DefaultTagName='div']
 *   Type of default tag name (default: `'div'`).
 * @param {Selector | null | undefined} [selector]
 *   Simple CSS selector (optional).
 *
 *   Can contain a tag name (`foo`), classes (`.bar`), and an ID (`#baz`).
 *   Multiple classes are allowed.
 *   Uses the last ID if multiple IDs are found.
 * @param {DefaultTagName | null | undefined} [defaultTagName='div']
 *   Tag name to use if `selector` does not specify one (default: `'div'`).
 * @returns {Element & {tagName: ExtractTagName<Selector, DefaultTagName>}}
 *   Built element.
 */
function parseSelector(selector, defaultTagName) {
  const value = selector || ''
  /** @type {Properties} */
  const props = {}
  let start = 0
  /** @type {string | undefined} */
  let previous
  /** @type {string | undefined} */
  let tagName

  while (start < value.length) {
    search.lastIndex = start
    const match = search.exec(value)
    const subvalue = value.slice(start, match ? match.index : value.length)

    if (subvalue) {
      if (!previous) {
        tagName = subvalue
      } else if (previous === '#') {
        props.id = subvalue
      } else if (Array.isArray(props.className)) {
        props.className.push(subvalue)
      } else {
        props.className = [subvalue]
      }

      start += subvalue.length
    }

    if (match) {
      previous = match[0]
      start++
    }
  }

  return {
    type: 'element',
    // @ts-expect-error: tag name is parsed.
    tagName: tagName || defaultTagName || 'div',
    properties: props,
    children: []
  }
}


/***/ }),

/***/ "./node_modules/hast-util-phrasing/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/hast-util-phrasing/lib/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   phrasing: () => (/* binding */ phrasing)
/* harmony export */ });
/* harmony import */ var hast_util_embedded__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hast-util-embedded */ "./node_modules/hast-util-embedded/lib/index.js");
/* harmony import */ var hast_util_has_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! hast-util-has-property */ "./node_modules/hast-util-has-property/lib/index.js");
/* harmony import */ var hast_util_is_body_ok_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! hast-util-is-body-ok-link */ "./node_modules/hast-util-is-body-ok-link/lib/index.js");
/* harmony import */ var hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-is-element */ "./node_modules/hast-util-is-element/lib/index.js");
/**
 * @typedef {import('hast').Nodes} Nodes
 */






const basic = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)([
  'a',
  'abbr',
  // `area` is in fact only phrasing if it is inside a `map` element.
  // However, since `area`s are required to be inside a `map` element, and it’s
  // a rather involved check, it’s ignored here for now.
  'area',
  'b',
  'bdi',
  'bdo',
  'br',
  'button',
  'cite',
  'code',
  'data',
  'datalist',
  'del',
  'dfn',
  'em',
  'i',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'map',
  'mark',
  'meter',
  'noscript',
  'output',
  'progress',
  'q',
  'ruby',
  's',
  'samp',
  'script',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'template',
  'textarea',
  'time',
  'u',
  'var',
  'wbr'
])

const meta = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)('meta')

/**
 * Check if the given value is *phrasing* content.
 *
 * @param {Nodes} value
 *   Node to check.
 * @returns {boolean}
 *   Whether `value` is phrasing content.
 */
function phrasing(value) {
  return Boolean(
    value.type === 'text' ||
      basic(value) ||
      (0,hast_util_embedded__WEBPACK_IMPORTED_MODULE_1__.embedded)(value) ||
      (0,hast_util_is_body_ok_link__WEBPACK_IMPORTED_MODULE_2__.isBodyOkLink)(value) ||
      (meta(value) && (0,hast_util_has_property__WEBPACK_IMPORTED_MODULE_3__.hasProperty)(value, 'itemProp'))
  )
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/a.js":
/*!***********************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/a.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ a)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Link}
 *   mdast node.
 */
function a(state, node) {
  const properties = node.properties || {}
  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))

  /** @type {Link} */
  const result = {
    type: 'link',
    url: state.resolve(String(properties.href || '') || null),
    title: properties.title ? String(properties.title) : null,
    children
  }
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/base.js":
/*!**************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/base.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   base: () => (/* binding */ base)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {undefined}
 *   Nothing.
 */
function base(state, node) {
  if (!state.baseFound) {
    state.frozenBaseUrl =
      String((node.properties && node.properties.href) || '') || undefined
    state.baseFound = true
  }
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/blockquote.js":
/*!********************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/blockquote.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blockquote: () => (/* binding */ blockquote)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Blockquote} Blockquote
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Blockquote}
 *   mdast node.
 */
function blockquote(state, node) {
  /** @type {Blockquote} */
  const result = {type: 'blockquote', children: state.toFlow(state.all(node))}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/br.js":
/*!************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/br.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   br: () => (/* binding */ br)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Break} Break
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Break}
 *   mdast node.
 */
function br(state, node) {
  /** @type {Break} */
  const result = {type: 'break'}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/code.js":
/*!**************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/code.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   code: () => (/* binding */ code)
/* harmony export */ });
/* harmony import */ var hast_util_to_text__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hast-util-to-text */ "./node_modules/hast-util-to-text/lib/index.js");
/* harmony import */ var trim_trailing_lines__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! trim-trailing-lines */ "./node_modules/trim-trailing-lines/index.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Code} Code
 *
 * @typedef {import('../state.js').State} State
 */




const prefix = 'language-'

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Code}
 *   mdast node.
 */
function code(state, node) {
  const children = node.children
  let index = -1
  /** @type {Array<number | string> | undefined} */
  let classList
  /** @type {string | undefined} */
  let lang

  if (node.tagName === 'pre') {
    while (++index < children.length) {
      const child = children[index]

      if (
        child.type === 'element' &&
        child.tagName === 'code' &&
        child.properties &&
        child.properties.className &&
        Array.isArray(child.properties.className)
      ) {
        classList = child.properties.className
        break
      }
    }
  }

  if (classList) {
    index = -1

    while (++index < classList.length) {
      if (String(classList[index]).slice(0, prefix.length) === prefix) {
        lang = String(classList[index]).slice(prefix.length)
        break
      }
    }
  }

  /** @type {Code} */
  const result = {
    type: 'code',
    lang: lang || null,
    meta: null,
    value: (0,trim_trailing_lines__WEBPACK_IMPORTED_MODULE_0__.trimTrailingLines)((0,hast_util_to_text__WEBPACK_IMPORTED_MODULE_1__.toText)(node))
  }
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/comment.js":
/*!*****************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/comment.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   comment: () => (/* binding */ comment)
/* harmony export */ });
/**
 * @typedef {import('hast').Comment} Comment
 *
 * @typedef {import('mdast').Html} Html
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Comment>} node
 *   hast element to transform.
 * @returns {Html}
 *   mdast node.
 */
function comment(state, node) {
  /** @type {Html} */
  const result = {
    type: 'html',
    value: '<!--' + node.value + '-->'
  }
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/del.js":
/*!*************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/del.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   del: () => (/* binding */ del)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Delete} Delete
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Delete}
 *   mdast node.
 */
function del(state, node) {
  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))
  /** @type {Delete} */
  const result = {type: 'delete', children}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/dl.js":
/*!************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/dl.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dl: () => (/* binding */ dl)
/* harmony export */ });
/* harmony import */ var _util_list_items_spread_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/list-items-spread.js */ "./node_modules/hast-util-to-mdast/lib/util/list-items-spread.js");
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 *
 * @typedef {import('mdast').BlockContent} BlockContent
 * @typedef {import('mdast').DefinitionContent} DefinitionContent
 * @typedef {import('mdast').List} List
 * @typedef {import('mdast').ListContent} ListContent
 * @typedef {import('mdast').ListItem} ListItem
 *
 * @typedef {import('../state.js').State} State
 *
 */

/**
 * @typedef Group
 *   Title/definition group.
 * @property {Array<Element>} titles
 *   One or more titles.
 * @property {Array<ElementContent>} definitions
 *   One or more definitions.
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {List | undefined}
 *   mdast node.
 */
function dl(state, node) {
  /** @type {Array<ElementContent>} */
  const clean = []
  /** @type {Array<Group>} */
  const groups = []
  let index = -1

  // Unwrap `<div>`s
  while (++index < node.children.length) {
    const child = node.children[index]

    if (child.type === 'element' && child.tagName === 'div') {
      clean.push(...child.children)
    } else {
      clean.push(child)
    }
  }

  /** @type {Group} */
  let group = {definitions: [], titles: []}
  index = -1

  // Group titles and definitions.
  while (++index < clean.length) {
    const child = clean[index]

    if (child.type === 'element' && child.tagName === 'dt') {
      const previous = clean[index - 1]

      if (
        previous &&
        previous.type === 'element' &&
        previous.tagName === 'dd'
      ) {
        groups.push(group)
        group = {definitions: [], titles: []}
      }

      group.titles.push(child)
    } else {
      group.definitions.push(child)
    }
  }

  groups.push(group)

  // Create items.
  index = -1
  /** @type {Array<ListContent>} */
  const content = []

  while (++index < groups.length) {
    const result = [
      ...handle(state, groups[index].titles),
      ...handle(state, groups[index].definitions)
    ]

    if (result.length > 0) {
      content.push({
        type: 'listItem',
        spread: result.length > 1,
        checked: null,
        children: result
      })
    }
  }

  // Create a list if there are items.
  if (content.length > 0) {
    /** @type {List} */
    const result = {
      type: 'list',
      ordered: false,
      start: null,
      spread: (0,_util_list_items_spread_js__WEBPACK_IMPORTED_MODULE_0__.listItemsSpread)(content),
      children: content
    }
    state.patch(node, result)
    return result
  }
}

/**
 * @param {State} state
 *   State.
 * @param {Array<ElementContent>} children
 *   hast element children to transform.
 * @returns {Array<BlockContent | DefinitionContent>}
 *   mdast nodes.
 */
function handle(state, children) {
  const nodes = state.all({type: 'root', children})
  const listItems = state.toSpecificContent(nodes, create)

  if (listItems.length === 0) {
    return []
  }

  if (listItems.length === 1) {
    return listItems[0].children
  }

  return [
    {
      type: 'list',
      ordered: false,
      start: null,
      spread: (0,_util_list_items_spread_js__WEBPACK_IMPORTED_MODULE_0__.listItemsSpread)(listItems),
      children: listItems
    }
  ]
}

/**
 * @returns {ListItem}
 */
function create() {
  return {type: 'listItem', spread: false, checked: null, children: []}
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/em.js":
/*!************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/em.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   em: () => (/* binding */ em)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Emphasis} Emphasis
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Emphasis}
 *   mdast node.
 */
function em(state, node) {
  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))

  /** @type {Emphasis} */
  const result = {type: 'emphasis', children}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/heading.js":
/*!*****************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/heading.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   heading: () => (/* binding */ heading)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Heading}
 *   mdast node.
 */
function heading(state, node) {
  const depth = /** @type {Heading['depth']} */ (
    /* c8 ignore next */
    Number(node.tagName.charAt(1)) || 1
  )
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))

  /** @type {Heading} */
  const result = {type: 'heading', depth, children}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/hr.js":
/*!************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/hr.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hr: () => (/* binding */ hr)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').ThematicBreak} ThematicBreak
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {ThematicBreak}
 *   mdast node.
 */
function hr(state, node) {
  /** @type {ThematicBreak} */
  const result = {type: 'thematicBreak'}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/iframe.js":
/*!****************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/iframe.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   iframe: () => (/* binding */ iframe)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Link} Link
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Link | undefined}
 *   mdast node.
 */
function iframe(state, node) {
  const properties = node.properties || {}
  const src = String(properties.src || '')
  const title = String(properties.title || '')

  // Only create a link if there is a title.
  // We can’t use the content of the frame because conforming HTML parsers treat
  // it as text, whereas legacy parsers treat it as HTML, so it will likely
  // contain tags that will show up in text.
  if (src && title) {
    /** @type {Link} */
    const result = {
      type: 'link',
      title: null,
      url: state.resolve(src),
      children: [{type: 'text', value: title}]
    }
    state.patch(node, result)
    return result
  }
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/img.js":
/*!*************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/img.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   img: () => (/* binding */ img)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Image} Image
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Image}
 *   mdast node.
 */
function img(state, node) {
  const properties = node.properties || {}

  /** @type {Image} */
  const result = {
    type: 'image',
    url: state.resolve(String(properties.src || '') || null),
    title: properties.title ? String(properties.title) : null,
    alt: properties.alt ? String(properties.alt) : ''
  }
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handlers: () => (/* binding */ handlers),
/* harmony export */   nodeHandlers: () => (/* binding */ nodeHandlers)
/* harmony export */ });
/* harmony import */ var _a_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./a.js */ "./node_modules/hast-util-to-mdast/lib/handlers/a.js");
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./base.js */ "./node_modules/hast-util-to-mdast/lib/handlers/base.js");
/* harmony import */ var _blockquote_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./blockquote.js */ "./node_modules/hast-util-to-mdast/lib/handlers/blockquote.js");
/* harmony import */ var _br_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./br.js */ "./node_modules/hast-util-to-mdast/lib/handlers/br.js");
/* harmony import */ var _code_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./code.js */ "./node_modules/hast-util-to-mdast/lib/handlers/code.js");
/* harmony import */ var _comment_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./comment.js */ "./node_modules/hast-util-to-mdast/lib/handlers/comment.js");
/* harmony import */ var _del_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./del.js */ "./node_modules/hast-util-to-mdast/lib/handlers/del.js");
/* harmony import */ var _dl_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./dl.js */ "./node_modules/hast-util-to-mdast/lib/handlers/dl.js");
/* harmony import */ var _em_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./em.js */ "./node_modules/hast-util-to-mdast/lib/handlers/em.js");
/* harmony import */ var _heading_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./heading.js */ "./node_modules/hast-util-to-mdast/lib/handlers/heading.js");
/* harmony import */ var _hr_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./hr.js */ "./node_modules/hast-util-to-mdast/lib/handlers/hr.js");
/* harmony import */ var _iframe_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./iframe.js */ "./node_modules/hast-util-to-mdast/lib/handlers/iframe.js");
/* harmony import */ var _img_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./img.js */ "./node_modules/hast-util-to-mdast/lib/handlers/img.js");
/* harmony import */ var _inline_code_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./inline-code.js */ "./node_modules/hast-util-to-mdast/lib/handlers/inline-code.js");
/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./input.js */ "./node_modules/hast-util-to-mdast/lib/handlers/input.js");
/* harmony import */ var _li_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./li.js */ "./node_modules/hast-util-to-mdast/lib/handlers/li.js");
/* harmony import */ var _list_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./list.js */ "./node_modules/hast-util-to-mdast/lib/handlers/list.js");
/* harmony import */ var _media_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./media.js */ "./node_modules/hast-util-to-mdast/lib/handlers/media.js");
/* harmony import */ var _p_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./p.js */ "./node_modules/hast-util-to-mdast/lib/handlers/p.js");
/* harmony import */ var _q_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./q.js */ "./node_modules/hast-util-to-mdast/lib/handlers/q.js");
/* harmony import */ var _root_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./root.js */ "./node_modules/hast-util-to-mdast/lib/handlers/root.js");
/* harmony import */ var _select_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./select.js */ "./node_modules/hast-util-to-mdast/lib/handlers/select.js");
/* harmony import */ var _strong_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./strong.js */ "./node_modules/hast-util-to-mdast/lib/handlers/strong.js");
/* harmony import */ var _table_cell_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./table-cell.js */ "./node_modules/hast-util-to-mdast/lib/handlers/table-cell.js");
/* harmony import */ var _table_row_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./table-row.js */ "./node_modules/hast-util-to-mdast/lib/handlers/table-row.js");
/* harmony import */ var _table_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./table.js */ "./node_modules/hast-util-to-mdast/lib/handlers/table.js");
/* harmony import */ var _text_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./text.js */ "./node_modules/hast-util-to-mdast/lib/handlers/text.js");
/* harmony import */ var _textarea_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./textarea.js */ "./node_modules/hast-util-to-mdast/lib/handlers/textarea.js");
/* harmony import */ var _wbr_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./wbr.js */ "./node_modules/hast-util-to-mdast/lib/handlers/wbr.js");
/**
 * @typedef {import('hast').Parents} Parents
 *
 * @typedef {import('../state.js').State} State
 */































/**
 * Default handlers for nodes.
 *
 * Each key is a node type, each value is a `NodeHandler`.
 */
const nodeHandlers = {
  comment: _comment_js__WEBPACK_IMPORTED_MODULE_0__.comment,
  doctype: ignore,
  root: _root_js__WEBPACK_IMPORTED_MODULE_1__.root,
  text: _text_js__WEBPACK_IMPORTED_MODULE_2__.text
}

/**
 * Default handlers for elements.
 *
 * Each key is an element name, each value is a `Handler`.
 */
const handlers = {
  // Ignore:
  applet: ignore,
  area: ignore,
  basefont: ignore,
  bgsound: ignore,
  caption: ignore,
  col: ignore,
  colgroup: ignore,
  command: ignore,
  content: ignore,
  datalist: ignore,
  dialog: ignore,
  element: ignore,
  embed: ignore,
  frame: ignore,
  frameset: ignore,
  isindex: ignore,
  keygen: ignore,
  link: ignore,
  math: ignore,
  menu: ignore,
  menuitem: ignore,
  meta: ignore,
  nextid: ignore,
  noembed: ignore,
  noframes: ignore,
  optgroup: ignore,
  option: ignore,
  param: ignore,
  script: ignore,
  shadow: ignore,
  source: ignore,
  spacer: ignore,
  style: ignore,
  svg: ignore,
  template: ignore,
  title: ignore,
  track: ignore,

  // Use children:
  abbr: all,
  acronym: all,
  bdi: all,
  bdo: all,
  big: all,
  blink: all,
  button: all,
  canvas: all,
  cite: all,
  data: all,
  details: all,
  dfn: all,
  font: all,
  ins: all,
  label: all,
  map: all,
  marquee: all,
  meter: all,
  nobr: all,
  noscript: all,
  object: all,
  output: all,
  progress: all,
  rb: all,
  rbc: all,
  rp: all,
  rt: all,
  rtc: all,
  ruby: all,
  slot: all,
  small: all,
  span: all,
  sup: all,
  sub: all,
  tbody: all,
  tfoot: all,
  thead: all,
  time: all,

  // Use children as flow.
  address: flow,
  article: flow,
  aside: flow,
  body: flow,
  center: flow,
  div: flow,
  fieldset: flow,
  figcaption: flow,
  figure: flow,
  form: flow,
  footer: flow,
  header: flow,
  hgroup: flow,
  html: flow,
  legend: flow,
  main: flow,
  multicol: flow,
  nav: flow,
  picture: flow,
  section: flow,

  // Handle.
  a: _a_js__WEBPACK_IMPORTED_MODULE_3__.a,
  audio: _media_js__WEBPACK_IMPORTED_MODULE_4__.media,
  b: _strong_js__WEBPACK_IMPORTED_MODULE_5__.strong,
  base: _base_js__WEBPACK_IMPORTED_MODULE_6__.base,
  blockquote: _blockquote_js__WEBPACK_IMPORTED_MODULE_7__.blockquote,
  br: _br_js__WEBPACK_IMPORTED_MODULE_8__.br,
  code: _inline_code_js__WEBPACK_IMPORTED_MODULE_9__.inlineCode,
  dir: _list_js__WEBPACK_IMPORTED_MODULE_10__.list,
  dl: _dl_js__WEBPACK_IMPORTED_MODULE_11__.dl,
  dt: _li_js__WEBPACK_IMPORTED_MODULE_12__.li,
  dd: _li_js__WEBPACK_IMPORTED_MODULE_12__.li,
  del: _del_js__WEBPACK_IMPORTED_MODULE_13__.del,
  em: _em_js__WEBPACK_IMPORTED_MODULE_14__.em,
  h1: _heading_js__WEBPACK_IMPORTED_MODULE_15__.heading,
  h2: _heading_js__WEBPACK_IMPORTED_MODULE_15__.heading,
  h3: _heading_js__WEBPACK_IMPORTED_MODULE_15__.heading,
  h4: _heading_js__WEBPACK_IMPORTED_MODULE_15__.heading,
  h5: _heading_js__WEBPACK_IMPORTED_MODULE_15__.heading,
  h6: _heading_js__WEBPACK_IMPORTED_MODULE_15__.heading,
  hr: _hr_js__WEBPACK_IMPORTED_MODULE_16__.hr,
  i: _em_js__WEBPACK_IMPORTED_MODULE_14__.em,
  iframe: _iframe_js__WEBPACK_IMPORTED_MODULE_17__.iframe,
  img: _img_js__WEBPACK_IMPORTED_MODULE_18__.img,
  image: _img_js__WEBPACK_IMPORTED_MODULE_18__.img,
  input: _input_js__WEBPACK_IMPORTED_MODULE_19__.input,
  kbd: _inline_code_js__WEBPACK_IMPORTED_MODULE_9__.inlineCode,
  li: _li_js__WEBPACK_IMPORTED_MODULE_12__.li,
  listing: _code_js__WEBPACK_IMPORTED_MODULE_20__.code,
  mark: _em_js__WEBPACK_IMPORTED_MODULE_14__.em,
  ol: _list_js__WEBPACK_IMPORTED_MODULE_10__.list,
  p: _p_js__WEBPACK_IMPORTED_MODULE_21__.p,
  plaintext: _code_js__WEBPACK_IMPORTED_MODULE_20__.code,
  pre: _code_js__WEBPACK_IMPORTED_MODULE_20__.code,
  q: _q_js__WEBPACK_IMPORTED_MODULE_22__.q,
  s: _del_js__WEBPACK_IMPORTED_MODULE_13__.del,
  samp: _inline_code_js__WEBPACK_IMPORTED_MODULE_9__.inlineCode,
  select: _select_js__WEBPACK_IMPORTED_MODULE_23__.select,
  strike: _del_js__WEBPACK_IMPORTED_MODULE_13__.del,
  strong: _strong_js__WEBPACK_IMPORTED_MODULE_5__.strong,
  summary: _p_js__WEBPACK_IMPORTED_MODULE_21__.p,
  table: _table_js__WEBPACK_IMPORTED_MODULE_24__.table,
  td: _table_cell_js__WEBPACK_IMPORTED_MODULE_25__.tableCell,
  textarea: _textarea_js__WEBPACK_IMPORTED_MODULE_26__.textarea,
  th: _table_cell_js__WEBPACK_IMPORTED_MODULE_25__.tableCell,
  tr: _table_row_js__WEBPACK_IMPORTED_MODULE_27__.tableRow,
  tt: _inline_code_js__WEBPACK_IMPORTED_MODULE_9__.inlineCode,
  u: _em_js__WEBPACK_IMPORTED_MODULE_14__.em,
  ul: _list_js__WEBPACK_IMPORTED_MODULE_10__.list,
  var: _inline_code_js__WEBPACK_IMPORTED_MODULE_9__.inlineCode,
  video: _media_js__WEBPACK_IMPORTED_MODULE_4__.media,
  wbr: _wbr_js__WEBPACK_IMPORTED_MODULE_28__.wbr,
  xmp: _code_js__WEBPACK_IMPORTED_MODULE_20__.code
}

/**
 * @param {State} state
 *   State.
 * @param {Parents} node
 *   Parent to transform.
 */
function all(state, node) {
  return state.all(node)
}

/**
 * @param {State} state
 *   State.
 * @param {Parents} node
 *   Parent to transform.
 */
function flow(state, node) {
  return state.toFlow(state.all(node))
}

/**
 * @returns {undefined}
 */
function ignore() {}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/inline-code.js":
/*!*********************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/inline-code.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inlineCode: () => (/* binding */ inlineCode)
/* harmony export */ });
/* harmony import */ var hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-to-text */ "./node_modules/hast-util-to-text/lib/index.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').InlineCode} InlineCode
 *
 * @typedef {import('../state.js').State} State
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {InlineCode}
 *   mdast node.
 */
function inlineCode(state, node) {
  /** @type {InlineCode} */
  const result = {type: 'inlineCode', value: (0,hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__.toText)(node)}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/input.js":
/*!***************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/input.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   input: () => (/* binding */ input)
/* harmony export */ });
/* harmony import */ var _util_find_selected_options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/find-selected-options.js */ "./node_modules/hast-util-to-mdast/lib/util/find-selected-options.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Image} Image
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').Text} Text
 *
 * @typedef {import('../util/find-selected-options.js').Options} Options
 * @typedef {import('../state.js').State} State
 */



const defaultChecked = '[x]'
const defaultUnchecked = '[ ]'

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Array<Link | Text> | Image | Text | undefined}
 *   mdast node.
 */
// eslint-disable-next-line complexity
function input(state, node) {
  const properties = node.properties || {}
  const value = String(properties.value || properties.placeholder || '')

  if (
    properties.disabled ||
    properties.type === 'hidden' ||
    properties.type === 'file'
  ) {
    return
  }

  if (properties.type === 'checkbox' || properties.type === 'radio') {
    /** @type {Text} */
    const result = {
      type: 'text',
      value: properties.checked
        ? state.options.checked || defaultChecked
        : state.options.unchecked || defaultUnchecked
    }
    state.patch(node, result)
    return result
  }

  if (properties.type === 'image') {
    const alt = properties.alt || value

    if (alt) {
      /** @type {Image} */
      const result = {
        type: 'image',
        url: state.resolve(String(properties.src || '') || null),
        title: String(properties.title || '') || null,
        alt: String(alt)
      }
      state.patch(node, result)
      return result
    }

    return
  }

  /** @type {Options} */
  let values = []

  if (value) {
    values = [[value, undefined]]
  } else if (
    // `list` is not supported on these types:
    properties.type !== 'button' &&
    properties.type !== 'file' &&
    properties.type !== 'password' &&
    properties.type !== 'reset' &&
    properties.type !== 'submit' &&
    properties.list
  ) {
    const list = String(properties.list)
    const datalist = state.elementById.get(list)

    if (datalist && datalist.tagName === 'datalist') {
      values = (0,_util_find_selected_options_js__WEBPACK_IMPORTED_MODULE_0__.findSelectedOptions)(datalist, properties)
    }
  }

  if (values.length === 0) {
    return
  }

  // Hide password value.
  if (properties.type === 'password') {
    // Passwords don’t support `list`.
    values[0] = ['•'.repeat(values[0][0].length), undefined]
  }

  if (properties.type === 'email' || properties.type === 'url') {
    /** @type {Array<Link | Text>} */
    const results = []
    let index = -1

    while (++index < values.length) {
      const value = state.resolve(values[index][0])
      /** @type {Link} */
      const result = {
        type: 'link',
        title: null,
        url: properties.type === 'email' ? 'mailto:' + value : value,
        children: [{type: 'text', value: values[index][1] || value}]
      }

      results.push(result)

      if (index !== values.length - 1) {
        results.push({type: 'text', value: ', '})
      }
    }

    return results
  }

  /** @type {Array<string>} */
  const texts = []
  let index = -1

  while (++index < values.length) {
    texts.push(
      values[index][1]
        ? values[index][1] + ' (' + values[index][0] + ')'
        : values[index][0]
    )
  }

  /** @type {Text} */
  const result = {type: 'text', value: texts.join(', ')}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/li.js":
/*!************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/li.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   li: () => (/* binding */ li)
/* harmony export */ });
/* harmony import */ var hast_util_phrasing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-phrasing */ "./node_modules/hast-util-phrasing/lib/index.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').ListItem} ListItem
 *
 * @typedef {import('../state.js').State} State
 */

/**
 * @typedef ExtractResult
 *   Result of extracting a leading checkbox.
 * @property {Element | undefined} checkbox
 *   The checkbox that was removed, if any.
 * @property {Element} rest
 *   If there was a leading checkbox, a deep clone of the node w/o the leading
 *   checkbox; otherwise a reference to the given, untouched, node.
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {ListItem}
 *   mdast node.
 */
function li(state, node) {
  // If the list item starts with a checkbox, remove the checkbox and mark the
  // list item as a GFM task list item.
  const {rest, checkbox} = extractLeadingCheckbox(node)
  const checked = checkbox ? Boolean(checkbox.properties.checked) : null
  const spread = spreadout(rest)
  const children = state.toFlow(state.all(rest))

  /** @type {ListItem} */
  const result = {type: 'listItem', spread, checked, children}
  state.patch(node, result)
  return result
}

/**
 * Check if an element should spread out.
 *
 * The reason to spread out a markdown list item is primarily whether writing
 * the equivalent in markdown, would yield a spread out item.
 *
 * A spread out item results in `<p>` and `</p>` tags.
 * Otherwise, the phrasing would be output directly.
 * We can check for that: if there’s a `<p>` element, spread it out.
 *
 * But what if there are no paragraphs?
 * In that case, we can also assume that if two “block” things were written in
 * an item, that it is spread out, because blocks are typically joined by blank
 * lines, which also means a spread item.
 *
 * Lastly, because in HTML things can be wrapped in a `<div>` or similar, we
 * delve into non-phrasing elements here to figure out if they themselves
 * contain paragraphs or 2 or more flow non-phrasing elements.
 *
 * @param {Readonly<Element>} node
 * @returns {boolean}
 */
function spreadout(node) {
  let index = -1
  let seenFlow = false

  while (++index < node.children.length) {
    const child = node.children[index]

    if (child.type === 'element') {
      if ((0,hast_util_phrasing__WEBPACK_IMPORTED_MODULE_0__.phrasing)(child)) continue

      if (child.tagName === 'p' || seenFlow || spreadout(child)) {
        return true
      }

      seenFlow = true
    }
  }

  return false
}

/**
 * Extract a leading checkbox from a list item.
 *
 * If there was a leading checkbox, makes a deep clone of the node w/o the
 * leading checkbox; otherwise a reference to the given, untouched, node is
 * given back.
 *
 * So for example:
 *
 * ```html
 * <li><input type="checkbox">Text</li>
 * ```
 *
 * …becomes:
 *
 * ```html
 * <li>Text</li>
 * ```
 *
 * ```html
 * <li><p><input type="checkbox">Text</p></li>
 * ```
 *
 * …becomes:
 *
 * ```html
 * <li><p>Text</p></li>
 * ```
 *
 * @param {Readonly<Element>} node
 * @returns {ExtractResult}
 */
function extractLeadingCheckbox(node) {
  const head = node.children[0]

  if (
    head &&
    head.type === 'element' &&
    head.tagName === 'input' &&
    head.properties &&
    (head.properties.type === 'checkbox' || head.properties.type === 'radio')
  ) {
    const rest = {...node, children: node.children.slice(1)}
    return {checkbox: head, rest}
  }

  // The checkbox may be nested in another element.
  // If the first element has children, look for a leading checkbox inside it.
  //
  // This only handles nesting in `<p>` elements, which is most common.
  // It’s possible a leading checkbox might be nested in other types of flow or
  // phrasing elements (and *deeply* nested, which is not possible with `<p>`).
  // Limiting things to `<p>` elements keeps this simpler for now.
  if (head && head.type === 'element' && head.tagName === 'p') {
    const {checkbox, rest: restHead} = extractLeadingCheckbox(head)

    if (checkbox) {
      const rest = {...node, children: [restHead, ...node.children.slice(1)]}
      return {checkbox, rest}
    }
  }

  return {checkbox: undefined, rest: node}
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/list.js":
/*!**************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/list.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   list: () => (/* binding */ list)
/* harmony export */ });
/* harmony import */ var _util_list_items_spread_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/list-items-spread.js */ "./node_modules/hast-util-to-mdast/lib/util/list-items-spread.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').List} List
 * @typedef {import('mdast').ListContent} ListContent
 * @typedef {import('mdast').ListItem} ListItem
 *
 * @typedef {import('../state.js').State} State
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {List}
 *   mdast node.
 */
function list(state, node) {
  const ordered = node.tagName === 'ol'
  const children = state.toSpecificContent(state.all(node), create)
  /** @type {number | null} */
  let start = null

  if (ordered) {
    start =
      node.properties && node.properties.start
        ? Number.parseInt(String(node.properties.start), 10)
        : 1
  }

  /** @type {List} */
  const result = {
    type: 'list',
    ordered,
    start,
    spread: (0,_util_list_items_spread_js__WEBPACK_IMPORTED_MODULE_0__.listItemsSpread)(children),
    children
  }
  state.patch(node, result)
  return result
}

/**
 * @returns {ListItem}
 */
function create() {
  return {type: 'listItem', spread: false, checked: null, children: []}
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/media.js":
/*!***************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/media.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   media: () => (/* binding */ media)
/* harmony export */ });
/* harmony import */ var mdast_util_to_string__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mdast-util-to-string */ "./node_modules/mdast-util-to-string/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit-parents/lib/index.js");
/* harmony import */ var _util_wrap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/wrap.js */ "./node_modules/hast-util-to-mdast/lib/util/wrap.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Image} Image
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').RootContent} MdastRootContent
 *
 * @typedef {import('../state.js').State} State
 */





/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Array<MdastRootContent> | Link}
 *   mdast node.
 */
function media(state, node) {
  const properties = node.properties || {}
  const poster = node.tagName === 'video' ? String(properties.poster || '') : ''
  let src = String(properties.src || '')
  let index = -1
  let linkInFallbackContent = false
  let nodes = state.all(node)

  /** @type {Root} */
  const fragment = {type: 'root', children: nodes}

  ;(0,unist_util_visit__WEBPACK_IMPORTED_MODULE_0__.visit)(fragment, function (node) {
    if (node.type === 'link') {
      linkInFallbackContent = true
      return unist_util_visit__WEBPACK_IMPORTED_MODULE_1__.EXIT
    }
  })

  // If the content links to something, or if it’s not phrasing…
  if (linkInFallbackContent || (0,_util_wrap_js__WEBPACK_IMPORTED_MODULE_2__.wrapNeeded)(nodes)) {
    return nodes
  }

  // Find the source.
  while (!src && ++index < node.children.length) {
    const child = node.children[index]

    if (
      child.type === 'element' &&
      child.tagName === 'source' &&
      child.properties
    ) {
      src = String(child.properties.src || '')
    }
  }

  // If there’s a poster defined on the video, create an image.
  if (poster) {
    /** @type {Image} */
    const image = {
      type: 'image',
      title: null,
      url: state.resolve(poster),
      alt: (0,mdast_util_to_string__WEBPACK_IMPORTED_MODULE_3__.toString)(nodes)
    }
    state.patch(node, image)
    nodes = [image]
  }

  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (nodes)

  // Link to the media resource.
  /** @type {Link} */
  const result = {
    type: 'link',
    title: properties.title ? String(properties.title) : null,
    url: state.resolve(src),
    children
  }
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/p.js":
/*!***********************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/p.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ p)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Paragraph | undefined}
 *   mdast node.
 */
function p(state, node) {
  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))

  if (children.length > 0) {
    /** @type {Paragraph} */
    const result = {type: 'paragraph', children}
    state.patch(node, result)
    return result
  }
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/q.js":
/*!***********************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/q.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   q: () => (/* binding */ q)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').RootContent} MdastRootContent
 *
 * @typedef {import('../state.js').State} State
 */

const defaultQuotes = ['"']

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Array<MdastRootContent>}
 *   mdast nodes.
 */
function q(state, node) {
  const quotes = state.options.quotes || defaultQuotes

  state.qNesting++
  const contents = state.all(node)
  state.qNesting--

  const quote = quotes[state.qNesting % quotes.length]
  const head = contents[0]
  const tail = contents[contents.length - 1]
  const open = quote.charAt(0)
  const close = quote.length > 1 ? quote.charAt(1) : quote

  if (head && head.type === 'text') {
    head.value = open + head.value
  } else {
    contents.unshift({type: 'text', value: open})
  }

  if (tail && tail.type === 'text') {
    tail.value += close
  } else {
    contents.push({type: 'text', value: close})
  }

  return contents
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/root.js":
/*!**************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/root.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   root: () => (/* binding */ root)
/* harmony export */ });
/* harmony import */ var _util_wrap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/wrap.js */ "./node_modules/hast-util-to-mdast/lib/util/wrap.js");
/**
 * @typedef {import('hast').Root} HastRoot
 *
 * @typedef {import('mdast').Root} MdastRoot
 *
 * @typedef {import('../state.js').State} State
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<HastRoot>} node
 *   hast root to transform.
 * @returns {MdastRoot}
 *   mdast node.
 */
function root(state, node) {
  let children = state.all(node)

  if (state.options.document || (0,_util_wrap_js__WEBPACK_IMPORTED_MODULE_0__.wrapNeeded)(children)) {
    children = (0,_util_wrap_js__WEBPACK_IMPORTED_MODULE_0__.wrap)(children)
  }

  /** @type {MdastRoot} */
  const result = {type: 'root', children}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/select.js":
/*!****************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/select.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   select: () => (/* binding */ select)
/* harmony export */ });
/* harmony import */ var _util_find_selected_options_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/find-selected-options.js */ "./node_modules/hast-util-to-mdast/lib/util/find-selected-options.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Text} Text
 *
 * @typedef {import('../state.js').State} State
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Text | undefined}
 *   mdast node.
 */
function select(state, node) {
  const values = (0,_util_find_selected_options_js__WEBPACK_IMPORTED_MODULE_0__.findSelectedOptions)(node)
  let index = -1
  /** @type {Array<string>} */
  const results = []

  while (++index < values.length) {
    const value = values[index]
    results.push(value[1] ? value[1] + ' (' + value[0] + ')' : value[0])
  }

  if (results.length > 0) {
    /** @type {Text} */
    const result = {type: 'text', value: results.join(', ')}
    state.patch(node, result)
    return result
  }
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/strong.js":
/*!****************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/strong.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   strong: () => (/* binding */ strong)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Strong} Strong
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Strong}
 *   mdast node.
 */
function strong(state, node) {
  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))

  /** @type {Strong} */
  const result = {type: 'strong', children}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/table-cell.js":
/*!********************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/table-cell.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   tableCell: () => (/* binding */ tableCell)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').TableCell} TableCell
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {TableCell}
 *   mdast node.
 */
function tableCell(state, node) {
  // Allow potentially “invalid” nodes, they might be unknown.
  // We also support straddling later.
  const children = /** @type {Array<PhrasingContent>} */ (state.all(node))

  /** @type {TableCell} */
  const result = {type: 'tableCell', children}
  state.patch(node, result)

  if (node.properties) {
    const rowSpan = node.properties.rowSpan
    const colSpan = node.properties.colSpan

    if (rowSpan || colSpan) {
      const data = /** @type {Record<string, unknown>} */ (
        result.data || (result.data = {})
      )
      if (rowSpan) data.hastUtilToMdastTemporaryRowSpan = rowSpan
      if (colSpan) data.hastUtilToMdastTemporaryColSpan = colSpan
    }
  }

  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/table-row.js":
/*!*******************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/table-row.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   tableRow: () => (/* binding */ tableRow)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').RowContent} RowContent
 * @typedef {import('mdast').TableRow} TableRow
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {TableRow}
 *   mdast node.
 */
function tableRow(state, node) {
  const children = state.toSpecificContent(state.all(node), create)

  /** @type {TableRow} */
  const result = {type: 'tableRow', children}
  state.patch(node, result)
  return result
}

/**
 * @returns {RowContent}
 */
function create() {
  return {type: 'tableCell', children: []}
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/table.js":
/*!***************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/table.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   table: () => (/* binding */ table)
/* harmony export */ });
/* harmony import */ var hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-to-text */ "./node_modules/hast-util-to-text/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit-parents/lib/index.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').AlignType} AlignType
 * @typedef {import('mdast').RowContent} RowContent
 * @typedef {import('mdast').Table} Table
 * @typedef {import('mdast').TableContent} TableContent
 * @typedef {import('mdast').Text} Text
 *
 * @typedef {import('../state.js').State} State
 *
 * @typedef Info
 *   Inferred info on a table.
 * @property {Array<AlignType>} align
 *   Alignment.
 * @property {boolean} headless
 *   Whether a `thead` is missing.
 */




/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Table | Text}
 *   mdast node.
 */
// eslint-disable-next-line complexity
function table(state, node) {
  // Ignore nested tables.
  if (state.inTable) {
    /** @type {Text} */
    const result = {type: 'text', value: (0,hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__.toText)(node)}
    state.patch(node, result)
    return result
  }

  state.inTable = true

  const {align, headless} = inspect(node)
  const rows = state.toSpecificContent(state.all(node), createRow)

  // Add an empty header row.
  if (headless) {
    rows.unshift(createRow())
  }

  let rowIndex = -1

  while (++rowIndex < rows.length) {
    const row = rows[rowIndex]
    const cells = state.toSpecificContent(row.children, createCell)
    row.children = cells
  }

  let columns = 1
  rowIndex = -1

  while (++rowIndex < rows.length) {
    const cells = rows[rowIndex].children
    let cellIndex = -1

    while (++cellIndex < cells.length) {
      const cell = cells[cellIndex]

      if (cell.data) {
        const data = /** @type {Record<string, unknown>} */ (cell.data)
        const colSpan =
          Number.parseInt(String(data.hastUtilToMdastTemporaryColSpan), 10) || 1
        const rowSpan =
          Number.parseInt(String(data.hastUtilToMdastTemporaryRowSpan), 10) || 1

        if (colSpan > 1 || rowSpan > 1) {
          let otherRowIndex = rowIndex - 1

          while (++otherRowIndex < rowIndex + rowSpan) {
            let colIndex = cellIndex - 1

            while (++colIndex < cellIndex + colSpan) {
              if (!rows[otherRowIndex]) {
                // Don’t add rows that don’t exist.
                // Browsers don’t render them either.
                break
              }

              /** @type {Array<RowContent>} */
              const newCells = []

              if (otherRowIndex !== rowIndex || colIndex !== cellIndex) {
                newCells.push({type: 'tableCell', children: []})
              }

              rows[otherRowIndex].children.splice(colIndex, 0, ...newCells)
            }
          }
        }

        // Clean the data fields.
        if ('hastUtilToMdastTemporaryColSpan' in cell.data)
          delete cell.data.hastUtilToMdastTemporaryColSpan
        if ('hastUtilToMdastTemporaryRowSpan' in cell.data)
          delete cell.data.hastUtilToMdastTemporaryRowSpan
        if (Object.keys(cell.data).length === 0) delete cell.data
      }
    }

    if (cells.length > columns) columns = cells.length
  }

  // Add extra empty cells.
  rowIndex = -1

  while (++rowIndex < rows.length) {
    const cells = rows[rowIndex].children
    let cellIndex = cells.length - 1
    while (++cellIndex < columns) {
      cells.push({type: 'tableCell', children: []})
    }
  }

  let alignIndex = align.length - 1
  while (++alignIndex < columns) {
    align.push(null)
  }

  state.inTable = false

  /** @type {Table} */
  const result = {type: 'table', align, children: rows}
  state.patch(node, result)
  return result
}

/**
 * Infer whether the HTML table has a head and how it aligns.
 *
 * @param {Readonly<Element>} node
 *   Table element to check.
 * @returns {Info}
 *   Info.
 */
function inspect(node) {
  /** @type {Info} */
  const info = {align: [null], headless: true}
  let rowIndex = 0
  let cellIndex = 0

  ;(0,unist_util_visit__WEBPACK_IMPORTED_MODULE_1__.visit)(node, function (child) {
    if (child.type === 'element') {
      // Don’t enter nested tables.
      if (child.tagName === 'table' && node !== child) {
        return unist_util_visit__WEBPACK_IMPORTED_MODULE_2__.SKIP
      }

      if (
        (child.tagName === 'th' || child.tagName === 'td') &&
        child.properties
      ) {
        if (!info.align[cellIndex]) {
          const value = String(child.properties.align || '') || null

          if (
            value === 'center' ||
            value === 'left' ||
            value === 'right' ||
            value === null
          ) {
            info.align[cellIndex] = value
          }
        }

        // If there is a `th` in the first row, assume there is a header row.
        if (info.headless && rowIndex < 2 && child.tagName === 'th') {
          info.headless = false
        }

        cellIndex++
      }
      // If there is a `thead`, assume there is a header row.
      else if (child.tagName === 'thead') {
        info.headless = false
      } else if (child.tagName === 'tr') {
        rowIndex++
        cellIndex = 0
      }
    }
  })

  return info
}

/**
 * @returns {RowContent}
 */
function createCell() {
  return {type: 'tableCell', children: []}
}

/**
 * @returns {TableContent}
 */
function createRow() {
  return {type: 'tableRow', children: []}
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/text.js":
/*!**************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/text.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   text: () => (/* binding */ text)
/* harmony export */ });
/**
 * @typedef {import('hast').Text} HastText
 *
 * @typedef {import('mdast').Text} MdastText
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<HastText>} node
 *   hast element to transform.
 * @returns {MdastText}
 *   mdast node.
 */
function text(state, node) {
  /** @type {MdastText} */
  const result = {type: 'text', value: node.value}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/textarea.js":
/*!******************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/textarea.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   textarea: () => (/* binding */ textarea)
/* harmony export */ });
/* harmony import */ var hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-to-text */ "./node_modules/hast-util-to-text/lib/index.js");
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Text} Text
 *
 * @typedef {import('../state.js').State} State
 */



/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Text}
 *   mdast node.
 */
function textarea(state, node) {
  /** @type {Text} */
  const result = {type: 'text', value: (0,hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__.toText)(node)}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/handlers/wbr.js":
/*!*************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/handlers/wbr.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   wbr: () => (/* binding */ wbr)
/* harmony export */ });
/**
 * @typedef {import('hast').Element} Element
 *
 * @typedef {import('mdast').Text} Text
 *
 * @typedef {import('../state.js').State} State
 */

// Fix to let VS Code see references to the above types.
''

/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Text}
 *   mdast node.
 */
function wbr(state, node) {
  /** @type {Text} */
  const result = {type: 'text', value: '\u200B'}
  state.patch(node, result)
  return result
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toMdast: () => (/* binding */ toMdast)
/* harmony export */ });
/* harmony import */ var _ungap_structured_clone__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ungap/structured-clone */ "./node_modules/@ungap/structured-clone/esm/index.js");
/* harmony import */ var rehype_minify_whitespace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rehype-minify-whitespace */ "./node_modules/rehype-minify-whitespace/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit/lib/index.js");
/* harmony import */ var _state_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./state.js */ "./node_modules/hast-util-to-mdast/lib/state.js");
/**
 * @typedef {import('hast').Nodes} Nodes
 *
 * @typedef {import('mdast').Nodes} MdastNodes
 * @typedef {import('mdast').RootContent} MdastRootContent
 *
 * @typedef {import('./state.js').Options} Options
 */






/** @type {Readonly<Options>} */
const emptyOptions = {}

/**
 * Transform hast to mdast.
 *
 * @param {Readonly<Nodes>} tree
 *   hast tree to transform.
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {MdastNodes}
 *   mdast tree.
 */
function toMdast(tree, options) {
  // We have to clone, cause we’ll use `rehype-minify-whitespace` on the tree,
  // which modifies.
  const cleanTree = (0,_ungap_structured_clone__WEBPACK_IMPORTED_MODULE_0__["default"])(tree)
  const settings = options || emptyOptions
  const transformWhitespace = (0,rehype_minify_whitespace__WEBPACK_IMPORTED_MODULE_1__["default"])({
    newlines: settings.newlines === true
  })
  const state = (0,_state_js__WEBPACK_IMPORTED_MODULE_2__.createState)(settings)
  /** @type {MdastNodes} */
  let mdast

  // @ts-expect-error: fine to pass an arbitrary node.
  transformWhitespace(cleanTree)

  ;(0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(cleanTree, function (node) {
    if (node && node.type === 'element' && node.properties) {
      const id = String(node.properties.id || '') || undefined

      if (id && !state.elementById.has(id)) {
        state.elementById.set(id, node)
      }
    }
  })

  const result = state.one(cleanTree, undefined)

  if (!result) {
    mdast = {type: 'root', children: []}
  } else if (Array.isArray(result)) {
    // Assume content.
    const children = /** @type {Array<MdastRootContent>} */ (result)
    mdast = {type: 'root', children}
  } else {
    mdast = result
  }

  // Collapse text nodes, and fix whitespace.
  //
  // Most of this is taken care of by `rehype-minify-whitespace`, but
  // we’re generating some whitespace too, and some nodes are in the end
  // ignored.
  // So clean up.
  (0,unist_util_visit__WEBPACK_IMPORTED_MODULE_3__.visit)(mdast, function (node, index, parent) {
    if (node.type === 'text' && index !== undefined && parent) {
      const previous = parent.children[index - 1]

      if (previous && previous.type === node.type) {
        previous.value += node.value
        parent.children.splice(index, 1)

        if (previous.position && node.position) {
          previous.position.end = node.position.end
        }

        // Iterate over the previous node again, to handle its total value.
        return index - 1
      }

      node.value = node.value.replace(/[\t ]*(\r?\n|\r)[\t ]*/, '$1')

      // We don’t care about other phrasing nodes in between (e.g., `[ asd ]()`),
      // as there the whitespace matters.
      if (
        parent &&
        (parent.type === 'heading' ||
          parent.type === 'paragraph' ||
          parent.type === 'root')
      ) {
        if (!index) {
          node.value = node.value.replace(/^[\t ]+/, '')
        }

        if (index === parent.children.length - 1) {
          node.value = node.value.replace(/[\t ]+$/, '')
        }
      }

      if (!node.value) {
        parent.children.splice(index, 1)
        return index
      }
    }
  })

  return mdast
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/state.js":
/*!******************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/state.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createState: () => (/* binding */ createState)
/* harmony export */ });
/* harmony import */ var unist_util_position__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-position */ "./node_modules/unist-util-position/lib/index.js");
/* harmony import */ var _handlers_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers/index.js */ "./node_modules/hast-util-to-mdast/lib/handlers/index.js");
/* harmony import */ var _util_wrap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/wrap.js */ "./node_modules/hast-util-to-mdast/lib/util/wrap.js");
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Nodes} Nodes
 * @typedef {import('hast').Parents} Parents
 *
 * @typedef {import('mdast').BlockContent} MdastBlockContent
 * @typedef {import('mdast').DefinitionContent} MdastDefinitionContent
 * @typedef {import('mdast').Nodes} MdastNodes
 * @typedef {import('mdast').Parents} MdastParents
 * @typedef {import('mdast').RootContent} MdastRootContent
 */

/**
 * @typedef {MdastBlockContent | MdastDefinitionContent} MdastFlowContent
 */

/**
 * @callback All
 *   Transform the children of a hast parent to mdast.
 * @param {Parents} parent
 *   Parent.
 * @returns {Array<MdastRootContent>}
 *   mdast children.
 *
 * @callback Handle
 *   Handle a particular element.
 * @param {State} state
 *   Info passed around about the current state.
 * @param {Element} element
 *   Element to transform.
 * @param {Parents | undefined} parent
 *   Parent of `element`.
 * @returns {Array<MdastNodes> | MdastNodes | undefined | void}
 *   mdast node or nodes.
 *
 *   Note: `void` is included until TS nicely infers `undefined`.
 *
 * @callback NodeHandle
 *   Handle a particular node.
 * @param {State} state
 *   Info passed around about the current state.
 * @param {any} node
 *   Node to transform.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {Array<MdastNodes> | MdastNodes | undefined | void}
 *   mdast node or nodes.
 *
 *   Note: `void` is included until TS nicely infers `undefined`.
 *
 * @callback One
 *   Transform a hast node to mdast.
 * @param {Nodes} node
 *   Expected hast node.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {Array<MdastNodes> | MdastNodes | undefined}
 *   mdast result.
 *
 * @typedef Options
 *   Configuration.
 * @property {string | null | undefined} [checked='[x]']
 *   Value to use for a checked checkbox or radio input (default: `'[x]'`)
 * @property {boolean | null | undefined} [document]
 *   Whether the given tree represents a complete document (optional).
 *
 *   Applies when the `tree` is a `root` node.
 *   When the tree represents a complete document, then things are wrapped in
 *   paragraphs when needed, and otherwise they’re left as-is.
 *   The default checks for whether there’s mixed content: some phrasing nodes
 *   *and* some non-phrasing nodes.
 * @property {Record<string, Handle | null | undefined> | null | undefined} [handlers]
 *   Object mapping tag names to functions handling the corresponding elements
 *   (optional).
 *
 *   Merged into the defaults.
 * @property {boolean | null | undefined} [newlines=false]
 *   Keep line endings when collapsing whitespace (default: `false`).
 *
 *   The default collapses to a single space.
 * @property {Record<string, NodeHandle | null | undefined> | null | undefined} [nodeHandlers]
 *   Object mapping node types to functions handling the corresponding nodes
 *   (optional).
 *
 *   Merged into the defaults.
 * @property {Array<string> | null | undefined} [quotes=['"']]
 *   List of quotes to use (default: `['"']`).
 *
 *   Each value can be one or two characters.
 *   When two, the first character determines the opening quote and the second
 *   the closing quote at that level.
 *   When one, both the opening and closing quote are that character.
 *
 *   The order in which the preferred quotes appear determines which quotes to
 *   use at which level of nesting.
 *   So, to prefer `‘’` at the first level of nesting, and `“”` at the second,
 *   pass `['‘’', '“”']`.
 *   If `<q>`s are nested deeper than the given amount of quotes, the markers
 *   wrap around: a third level of nesting when using `['«»', '‹›']` should
 *   have double guillemets, a fourth single, a fifth double again, etc.
 * @property {string | null | undefined} [unchecked='[ ]']
 *   Value to use for an unchecked checkbox or radio input (default: `'[ ]'`).
 *
 * @callback Patch
 *   Copy a node’s positional info.
 * @param {Nodes} from
 *   hast node to copy from.
 * @param {MdastNodes} to
 *   mdast node to copy into.
 * @returns {undefined}
 *   Nothing.
 *
 * @callback Resolve
 *   Resolve a URL relative to a base.
 * @param {string | null | undefined} url
 *   Possible URL value.
 * @returns {string}
 *   URL, resolved to a `base` element, if any.
 *
 * @typedef State
 *   Info passed around about the current state.
 * @property {All} all
 *   Transform the children of a hast parent to mdast.
 * @property {boolean} baseFound
 *   Whether a `<base>` element was seen.
 * @property {Map<string, Element>} elementById
 *   Elements by their `id`.
 * @property {string | undefined} frozenBaseUrl
 *   `href` of `<base>`, if any.
 * @property {Record<string, Handle>} handlers
 *   Applied element handlers.
 * @property {boolean} inTable
 *   Whether we’re in a table.
 * @property {Record<string, NodeHandle>} nodeHandlers
 *   Applied node handlers.
 * @property {One} one
 *   Transform a hast node to mdast.
 * @property {Options} options
 *   User configuration.
 * @property {Patch} patch
 *   Copy a node’s positional info.
 * @property {number} qNesting
 *   Non-negative finite integer representing how deep we’re in `<q>`s.
 * @property {Resolve} resolve
 *   Resolve a URL relative to a base.
 * @property {ToFlow} toFlow
 *   Transform a list of mdast nodes to flow.
 * @property {<ChildType extends MdastNodes, ParentType extends MdastParents & {'children': Array<ChildType>}>(nodes: Array<MdastRootContent>, build: (() => ParentType)) => Array<ParentType>} toSpecificContent
 *   Turn arbitrary content into a list of a particular node type.
 *
 *   This is useful for example for lists, which must have list items as
 *   content.
 *   in this example, when non-items are found, they will be queued, and
 *   inserted into an adjacent item.
 *   When no actual items exist, one will be made with `build`.
 *
 * @callback ToFlow
 *   Transform a list of mdast nodes to flow.
 * @param {Array<MdastRootContent>} nodes
 *   mdast nodes.
 * @returns {Array<MdastFlowContent>}
 *   mdast flow children.
 */





const own = {}.hasOwnProperty

/**
 * Create a state.
 *
 * @param {Readonly<Options>} options
 *   User configuration.
 * @returns {State}
 *   State.
 */
function createState(options) {
  return {
    all,
    baseFound: false,
    elementById: new Map(),
    frozenBaseUrl: undefined,
    handlers: {..._handlers_index_js__WEBPACK_IMPORTED_MODULE_0__.handlers, ...options.handlers},
    inTable: false,
    nodeHandlers: {..._handlers_index_js__WEBPACK_IMPORTED_MODULE_0__.nodeHandlers, ...options.nodeHandlers},
    one,
    options,
    patch,
    qNesting: 0,
    resolve,
    toFlow,
    toSpecificContent
  }
}

/**
 * Transform the children of a hast parent to mdast.
 *
 * You might want to combine this with `toFlow` or `toSpecificContent`.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {Parents} parent
 *   Parent.
 * @returns {Array<MdastRootContent>}
 *   mdast children.
 */
function all(parent) {
  const children = parent.children || []
  /** @type {Array<MdastRootContent>} */
  const results = []
  let index = -1

  while (++index < children.length) {
    const child = children[index]
    // Content -> content.
    const result =
      /** @type {Array<MdastRootContent> | MdastRootContent | undefined} */ (
        this.one(child, parent)
      )

    if (Array.isArray(result)) {
      results.push(...result)
    } else if (result) {
      results.push(result)
    }
  }

  let start = 0
  let end = results.length

  while (start < end && results[start].type === 'break') {
    start++
  }

  while (end > start && results[end - 1].type === 'break') {
    end--
  }

  return start === 0 && end === results.length
    ? results
    : results.slice(start, end)
}

/**
 * Transform a hast node to mdast.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {Nodes} node
 *   hast node to transform.
 * @param {Parents | undefined} parent
 *   Parent of `node`.
 * @returns {Array<MdastNodes> | MdastNodes | undefined}
 *   mdast result.
 */
function one(node, parent) {
  if (node.type === 'element') {
    if (node.properties && node.properties.dataMdast === 'ignore') {
      return
    }

    if (own.call(this.handlers, node.tagName)) {
      return this.handlers[node.tagName](this, node, parent) || undefined
    }
  } else if (own.call(this.nodeHandlers, node.type)) {
    return this.nodeHandlers[node.type](this, node, parent) || undefined
  }

  // Unknown literal.
  if ('value' in node && typeof node.value === 'string') {
    /** @type {MdastRootContent} */
    const result = {type: 'text', value: node.value}
    this.patch(node, result)
    return result
  }

  // Unknown parent.
  if ('children' in node) {
    return this.all(node)
  }
}

/**
 * Copy a node’s positional info.
 *
 * @param {Nodes} origin
 *   hast node to copy from.
 * @param {MdastNodes} node
 *   mdast node to copy into.
 * @returns {undefined}
 *   Nothing.
 */
function patch(origin, node) {
  if (origin.position) node.position = (0,unist_util_position__WEBPACK_IMPORTED_MODULE_1__.position)(origin)
}

/**
 * @this {State}
 *   Info passed around about the current state.
 * @param {string | null | undefined} url
 *   Possible URL value.
 * @returns {string}
 *   URL, resolved to a `base` element, if any.
 */
function resolve(url) {
  const base = this.frozenBaseUrl

  if (url === null || url === undefined) {
    return ''
  }

  if (base) {
    return String(new URL(url, base))
  }

  return url
}

/**
 * Transform a list of mdast nodes to flow.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {Array<MdastRootContent>} nodes
 *   Parent.
 * @returns {Array<MdastFlowContent>}
 *   mdast flow children.
 */
function toFlow(nodes) {
  return (0,_util_wrap_js__WEBPACK_IMPORTED_MODULE_2__.wrap)(nodes)
}

/**
 * Turn arbitrary content into a particular node type.
 *
 * This is useful for example for lists, which must have list items as content.
 * in this example, when non-items are found, they will be queued, and
 * inserted into an adjacent item.
 * When no actual items exist, one will be made with `build`.
 *
 * @template {MdastNodes} ChildType
 *   Node type of children.
 * @template {MdastParents & {'children': Array<ChildType>}} ParentType
 *   Node type of parent.
 * @param {Array<MdastRootContent>} nodes
 *   Nodes, which are either `ParentType`, or will be wrapped in one.
 * @param {() => ParentType} build
 *   Build a parent if needed (must have empty `children`).
 * @returns {Array<ParentType>}
 *   List of parents.
 */
function toSpecificContent(nodes, build) {
  const reference = build()
  /** @type {Array<ParentType>} */
  const results = []
  /** @type {Array<ChildType>} */
  let queue = []
  let index = -1

  while (++index < nodes.length) {
    const node = nodes[index]

    if (expectedParent(node)) {
      if (queue.length > 0) {
        node.children.unshift(...queue)
        queue = []
      }

      results.push(node)
    } else {
      // Assume `node` can be a child of `ParentType`.
      // If we start checking nodes, we’d run into problems with unknown nodes,
      // which we do want to support.
      const child = /** @type {ChildType} */ (node)
      queue.push(child)
    }
  }

  if (queue.length > 0) {
    let node = results[results.length - 1]

    if (!node) {
      node = build()
      results.push(node)
    }

    node.children.push(...queue)
    queue = []
  }

  return results

  /**
   * @param {MdastNodes} node
   * @returns {node is ParentType}
   */
  function expectedParent(node) {
    return node.type === reference.type
  }
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/util/find-selected-options.js":
/*!***************************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/util/find-selected-options.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findSelectedOptions: () => (/* binding */ findSelectedOptions)
/* harmony export */ });
/* harmony import */ var hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-to-text */ "./node_modules/hast-util-to-text/lib/index.js");
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Properties} Properties
 *
 * @typedef {import('../state.js').State} State
 */

/**
 * @typedef {[string, Value]} Option
 *   Option, where the item at `0` is the label, the item at `1` the value.
 *
 * @typedef {Array<Option>} Options
 *   List of options.
 *
 * @typedef {string | undefined} Value
 *   `value` field of option.
 */



/**
 * @param {Readonly<Element>} node
 *   hast element to inspect.
 * @param {Properties | undefined} [properties]
 *   Properties to use, normally taken from `node`, but can be changed.
 * @returns {Options}
 *   Options.
 */
function findSelectedOptions(node, properties) {
  /** @type {Array<Element>} */
  const selectedOptions = []
  /** @type {Options} */
  const values = []
  const props = properties || node.properties || {}
  const options = findOptions(node)
  const size =
    Math.min(Number.parseInt(String(props.size), 10), 0) ||
    (props.multiple ? 4 : 1)
  let index = -1

  while (++index < options.length) {
    const option = options[index]

    if (option && option.properties && option.properties.selected) {
      selectedOptions.push(option)
    }
  }

  const list = selectedOptions.length > 0 ? selectedOptions : options
  const max = list.length > size ? size : list.length
  index = -1

  while (++index < max) {
    const option = list[index]
    const props = option.properties || {}
    const content = (0,hast_util_to_text__WEBPACK_IMPORTED_MODULE_0__.toText)(option)
    const label = content || String(props.label || '')
    const value = String(props.value || '') || content
    values.push([value, label === value ? undefined : label])
  }

  return values
}

/**
 * @param {Element} node
 *   Parent to find in.
 * @returns {Array<Element>}
 *   Option elements.
 */
function findOptions(node) {
  /** @type {Array<Element>} */
  const results = []
  let index = -1

  while (++index < node.children.length) {
    const child = node.children[index]

    if ('children' in child && Array.isArray(child.children)) {
      results.push(...findOptions(child))
    }

    if (
      child.type === 'element' &&
      child.tagName === 'option' &&
      (!child.properties || !child.properties.disabled)
    ) {
      results.push(child)
    }
  }

  return results
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/util/list-items-spread.js":
/*!***********************************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/util/list-items-spread.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   listItemsSpread: () => (/* binding */ listItemsSpread)
/* harmony export */ });
/**
 * @typedef {import('mdast').ListContent} ListContent
 */

// Fix to let VS Code see references to the above types.
''

/**
 * Infer whether list items are spread.
 *
 * @param {Readonly<Array<Readonly<ListContent>>>} children
 *   List items.
 * @returns {boolean}
 *   Whether one or more list items are spread.
 */
function listItemsSpread(children) {
  let index = -1

  if (children.length > 1) {
    while (++index < children.length) {
      if (children[index].spread) {
        return true
      }
    }
  }

  return false
}


/***/ }),

/***/ "./node_modules/hast-util-to-mdast/lib/util/wrap.js":
/*!**********************************************************!*\
  !*** ./node_modules/hast-util-to-mdast/lib/util/wrap.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   wrap: () => (/* binding */ wrap),
/* harmony export */   wrapNeeded: () => (/* binding */ wrapNeeded)
/* harmony export */ });
/* harmony import */ var _ungap_structured_clone__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ungap/structured-clone */ "./node_modules/@ungap/structured-clone/esm/index.js");
/* harmony import */ var hast_util_phrasing__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! hast-util-phrasing */ "./node_modules/hast-util-phrasing/lib/index.js");
/* harmony import */ var hast_util_whitespace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hast-util-whitespace */ "./node_modules/hast-util-whitespace/lib/index.js");
/* harmony import */ var mdast_util_phrasing__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mdast-util-phrasing */ "./node_modules/mdast-util-phrasing/lib/index.js");
/**
 * @typedef {import('mdast').BlockContent} BlockContent
 * @typedef {import('mdast').Delete} Delete
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').Nodes} Nodes
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').RootContent} RootContent
 *
 * @typedef {import('mdast-util-to-hast')} DoNotTouchItRegistersDataFields
 */






/**
 * Check if there are phrasing mdast nodes.
 *
 * This is needed if a fragment is given, which could just be a sentence, and
 * doesn’t need a wrapper paragraph.
 *
 * @param {Array<Nodes>} nodes
 * @returns {boolean}
 */
function wrapNeeded(nodes) {
  let index = -1

  while (++index < nodes.length) {
    const node = nodes[index]

    if (!phrasing(node) || ('children' in node && wrapNeeded(node.children))) {
      return true
    }
  }

  return false
}

/**
 * Wrap runs of phrasing content into paragraphs, leaving the non-phrasing
 * content as-is.
 *
 * @param {Array<RootContent>} nodes
 *   Content.
 * @returns {Array<BlockContent>}
 *   Content where phrasing is wrapped in paragraphs.
 */
function wrap(nodes) {
  return runs(nodes, onphrasing, function (d) {
    return d
  })

  /**
   * @param {Array<PhrasingContent>} nodes
   * @returns {Array<Paragraph>}
   */
  function onphrasing(nodes) {
    return nodes.every(function (d) {
      return d.type === 'text' ? (0,hast_util_whitespace__WEBPACK_IMPORTED_MODULE_1__.whitespace)(d.value) : false
    })
      ? []
      : [{type: 'paragraph', children: nodes}]
  }
}

/**
 * @param {Delete | Link} node
 * @returns {Array<BlockContent>}
 */
function split(node) {
  return runs(node.children, onphrasing, onnonphrasing)

  /**
   * Use `parent`, put the phrasing run inside it.
   *
   * @param {Array<PhrasingContent>} nodes
   * @returns {Array<BlockContent>}
   */
  function onphrasing(nodes) {
    const newParent = cloneWithoutChildren(node)
    newParent.children = nodes
    // @ts-expect-error Assume fine.
    return [newParent]
  }

  /**
   * Use `child`, add `parent` as its first child, put the original children
   * into `parent`.
   * If `child` is not a parent, `parent` will not be added.
   *
   * @param {BlockContent} child
   * @returns {BlockContent}
   */
  function onnonphrasing(child) {
    if ('children' in child && 'children' in node) {
      const newParent = cloneWithoutChildren(node)
      const newChild = cloneWithoutChildren(child)
      // @ts-expect-error Assume fine.
      newParent.children = child.children
      // @ts-expect-error Assume fine.
      newChild.children.push(newParent)
      return newChild
    }

    return {...child}
  }
}

/**
 * Wrap all runs of mdast phrasing content in `paragraph` nodes.
 *
 * @param {Array<RootContent>} nodes
 *   List of input nodes.
 * @param {(nodes: Array<PhrasingContent>) => Array<BlockContent>} onphrasing
 *   Turn phrasing content into block content.
 * @param {(node: BlockContent) => BlockContent} onnonphrasing
 *   Map block content (defaults to keeping them as-is).
 * @returns {Array<BlockContent>}
 */
function runs(nodes, onphrasing, onnonphrasing) {
  const flattened = flatten(nodes)
  /** @type {Array<BlockContent>} */
  const result = []
  /** @type {Array<PhrasingContent>} */
  let queue = []
  let index = -1

  while (++index < flattened.length) {
    const node = flattened[index]

    if (phrasing(node)) {
      queue.push(node)
    } else {
      if (queue.length > 0) {
        result.push(...onphrasing(queue))
        queue = []
      }

      // @ts-expect-error Assume non-phrasing.
      result.push(onnonphrasing(node))
    }
  }

  if (queue.length > 0) {
    result.push(...onphrasing(queue))
    queue = []
  }

  return result
}

/**
 * Flatten a list of nodes.
 *
 * @param {Array<RootContent>} nodes
 *   List of nodes, will unravel `delete` and `link`.
 * @returns {Array<RootContent>}
 *   Unraveled nodes.
 */
function flatten(nodes) {
  /** @type {Array<RootContent>} */
  const flattened = []
  let index = -1

  while (++index < nodes.length) {
    const node = nodes[index]

    // Straddling: some elements are *weird*.
    // Namely: `map`, `ins`, `del`, and `a`, as they are hybrid elements.
    // See: <https://html.spec.whatwg.org/#paragraphs>.
    // Paragraphs are the weirdest of them all.
    // See the straddling fixture for more info!
    // `ins` is ignored in mdast, so we don’t need to worry about that.
    // `map` maps to its content, so we don’t need to worry about that either.
    // `del` maps to `delete` and `a` to `link`, so we do handle those.
    // What we’ll do is split `node` over each of its children.
    if (
      (node.type === 'delete' || node.type === 'link') &&
      wrapNeeded(node.children)
    ) {
      flattened.push(...split(node))
    } else {
      flattened.push(node)
    }
  }

  return flattened
}

/**
 * Check if an mdast node is phrasing.
 *
 * Also supports checking embedded hast fields.
 *
 * @param {Nodes} node
 *   mdast node to check.
 * @returns {node is PhrasingContent}
 *   Whether `node` is phrasing content (includes nodes with `hName` fields
 *   set to phrasing hast element names).
 */
function phrasing(node) {
  const tagName = node.data && node.data.hName
  return tagName
    ? (0,hast_util_phrasing__WEBPACK_IMPORTED_MODULE_2__.phrasing)({type: 'element', tagName, properties: {}, children: []})
    : (0,mdast_util_phrasing__WEBPACK_IMPORTED_MODULE_3__.phrasing)(node)
}

/**
 * @template {Parents} ParentType
 *   Parent type.
 * @param {ParentType} node
 *   Node to clone.
 * @returns {ParentType}
 *   Cloned node, without children.
 */
function cloneWithoutChildren(node) {
  return (0,_ungap_structured_clone__WEBPACK_IMPORTED_MODULE_0__["default"])({...node, children: []})
}


/***/ }),

/***/ "./node_modules/hast-util-to-text/lib/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/hast-util-to-text/lib/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toText: () => (/* binding */ toText)
/* harmony export */ });
/* harmony import */ var unist_util_find_after__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-find-after */ "./node_modules/unist-util-find-after/lib/index.js");
/* harmony import */ var hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-is-element */ "./node_modules/hast-util-is-element/lib/index.js");
/**
 * @typedef {import('hast').Comment} Comment
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Nodes} Nodes
 * @typedef {import('hast').Parents} Parents
 * @typedef {import('hast').Text} Text
 * @typedef {import('hast-util-is-element').TestFunction} TestFunction
 */

/**
 * @typedef {'normal' | 'nowrap' | 'pre' | 'pre-wrap'} Whitespace
 *   Valid and useful whitespace values (from CSS).
 *
 * @typedef {0 | 1 | 2} BreakNumber
 *   Specific break:
 *
 *   *   `0` — space
 *   *   `1` — line ending
 *   *   `2` — blank line
 *
 * @typedef {'\n'} BreakForce
 *   Forced break.
 *
 * @typedef {boolean} BreakValue
 *   Whether there was a break.
 *
 * @typedef {BreakNumber | BreakValue | undefined} BreakBefore
 *   Any value for a break before.
 *
 * @typedef {BreakForce | BreakNumber | BreakValue | undefined} BreakAfter
 *   Any value for a break after.
 *
 * @typedef CollectionInfo
 *   Info on current collection.
 * @property {BreakAfter} breakAfter
 *   Whether there was a break after.
 * @property {BreakBefore} breakBefore
 *   Whether there was a break before.
 * @property {Whitespace} whitespace
 *   Current whitespace setting.
 *
 * @typedef Options
 *   Configuration.
 * @property {Whitespace | null | undefined} [whitespace='normal']
 *   Initial CSS whitespace setting to use (default: `'normal'`).
 */




const searchLineFeeds = /\n/g
const searchTabOrSpaces = /[\t ]+/g

const br = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)('br')
const cell = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)(isCell)
const p = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)('p')
const row = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)('tr')

// Note that we don’t need to include void elements here as they don’t have text.
// See: <https://github.com/wooorm/html-void-elements>
const notRendered = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)([
  // List from: <https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements>
  'datalist',
  'head',
  'noembed',
  'noframes',
  'noscript', // Act as if we support scripting.
  'rp',
  'script',
  'style',
  'template',
  'title',
  // Hidden attribute.
  hidden,
  // From: <https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3>
  closedDialog
])

// See: <https://html.spec.whatwg.org/multipage/rendering.html#the-css-user-agent-style-sheet-and-presentational-hints>
const blockOrCaption = (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_0__.convertElement)([
  'address', // Flow content
  'article', // Sections and headings
  'aside', // Sections and headings
  'blockquote', // Flow content
  'body', // Page
  'caption', // `table-caption`
  'center', // Flow content (legacy)
  'dd', // Lists
  'dialog', // Flow content
  'dir', // Lists (legacy)
  'dl', // Lists
  'dt', // Lists
  'div', // Flow content
  'figure', // Flow content
  'figcaption', // Flow content
  'footer', // Flow content
  'form,', // Flow content
  'h1', // Sections and headings
  'h2', // Sections and headings
  'h3', // Sections and headings
  'h4', // Sections and headings
  'h5', // Sections and headings
  'h6', // Sections and headings
  'header', // Flow content
  'hgroup', // Sections and headings
  'hr', // Flow content
  'html', // Page
  'legend', // Flow content
  'listing', // Flow content (legacy)
  'main', // Flow content
  'menu', // Lists
  'nav', // Sections and headings
  'ol', // Lists
  'p', // Flow content
  'plaintext', // Flow content (legacy)
  'pre', // Flow content
  'section', // Sections and headings
  'ul', // Lists
  'xmp' // Flow content (legacy)
])

/**
 * Get the plain-text value of a node.
 *
 * ###### Algorithm
 *
 * *   if `tree` is a comment, returns its `value`
 * *   if `tree` is a text, applies normal whitespace collapsing to its
 *     `value`, as defined by the CSS Text spec
 * *   if `tree` is a root or element, applies an algorithm similar to the
 *     `innerText` getter as defined by HTML
 *
 * ###### Notes
 *
 * > 👉 **Note**: the algorithm acts as if `tree` is being rendered, and as if
 * > we’re a CSS-supporting user agent, with scripting enabled.
 *
 * *   if `tree` is an element that is not displayed (such as a `head`), we’ll
 *     still use the `innerText` algorithm instead of switching to `textContent`
 * *   if descendants of `tree` are elements that are not displayed, they are
 *     ignored
 * *   CSS is not considered, except for the default user agent style sheet
 * *   a line feed is collapsed instead of ignored in cases where Fullwidth, Wide,
 *     or Halfwidth East Asian Width characters are used, the same goes for a case
 *     with Chinese, Japanese, or Yi writing systems
 * *   replaced elements (such as `audio`) are treated like non-replaced elements
 *
 * @param {Nodes} tree
 *   Tree to turn into text.
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized `tree`.
 */
function toText(tree, options = {}) {
  const children = 'children' in tree ? tree.children : []
  const block = blockOrCaption(tree)
  const whitespace = inferWhitespace(tree, {
    whitespace: options.whitespace || 'normal',
    breakBefore: false,
    breakAfter: false
  })

  /** @type {Array<BreakNumber | string>} */
  const results = []

  // Treat `text` and `comment` as having normal white-space.
  // This deviates from the spec as in the DOM the node’s `.data` has to be
  // returned.
  // If you want that behavior use `hast-util-to-string`.
  // All other nodes are later handled as if they are `element`s (so the
  // algorithm also works on a `root`).
  // Nodes without children are treated as a void element, so `doctype` is thus
  // ignored.
  if (tree.type === 'text' || tree.type === 'comment') {
    results.push(
      ...collectText(tree, {
        whitespace,
        breakBefore: true,
        breakAfter: true
      })
    )
  }

  // 1.  If this element is not being rendered, or if the user agent is a
  //     non-CSS user agent, then return the same value as the textContent IDL
  //     attribute on this element.
  //
  //     Note: we’re not supporting stylesheets so we’re acting as if the node
  //     is rendered.
  //
  //     If you want that behavior use `hast-util-to-string`.
  //     Important: we’ll have to account for this later though.

  // 2.  Let results be a new empty list.
  let index = -1

  // 3.  For each child node node of this element:
  while (++index < children.length) {
    // 3.1. Let current be the list resulting in running the inner text
    //      collection steps with node.
    //      Each item in results will either be a JavaScript string or a
    //      positive integer (a required line break count).
    // 3.2. For each item item in current, append item to results.
    results.push(
      ...renderedTextCollection(
        children[index],
        // @ts-expect-error: `tree` is a parent if we’re here.
        tree,
        {
          whitespace,
          breakBefore: index ? undefined : block,
          breakAfter:
            index < children.length - 1 ? br(children[index + 1]) : block
        }
      )
    )
  }

  // 4.  Remove any items from results that are the empty string.
  // 5.  Remove any runs of consecutive required line break count items at the
  //     start or end of results.
  // 6.  Replace each remaining run of consecutive required line break count
  //     items with a string consisting of as many U+000A LINE FEED (LF)
  //     characters as the maximum of the values in the required line break
  //     count items.
  /** @type {Array<string>} */
  const result = []
  /** @type {number | undefined} */
  let count

  index = -1

  while (++index < results.length) {
    const value = results[index]

    if (typeof value === 'number') {
      if (count !== undefined && value > count) count = value
    } else if (value) {
      if (count !== undefined && count > -1) {
        result.push('\n'.repeat(count) || ' ')
      }

      count = -1
      result.push(value)
    }
  }

  // 7.  Return the concatenation of the string items in results.
  return result.join('')
}

/**
 * <https://html.spec.whatwg.org/multipage/dom.html#rendered-text-collection-steps>
 *
 * @param {Nodes} node
 * @param {Parents} parent
 * @param {CollectionInfo} info
 * @returns {Array<BreakNumber | string>}
 */
function renderedTextCollection(node, parent, info) {
  if (node.type === 'element') {
    return collectElement(node, parent, info)
  }

  if (node.type === 'text') {
    return info.whitespace === 'normal'
      ? collectText(node, info)
      : collectPreText(node)
  }

  return []
}

/**
 * Collect an element.
 *
 * @param {Element} node
 *   Element node.
 * @param {Parents} parent
 * @param {CollectionInfo} info
 *   Info on current collection.
 * @returns {Array<BreakNumber | string>}
 */
function collectElement(node, parent, info) {
  // First we infer the `white-space` property.
  const whitespace = inferWhitespace(node, info)
  const children = node.children || []
  let index = -1
  /** @type {Array<BreakNumber | string>} */
  let items = []

  // We’re ignoring point 3, and exiting without any content here, because we
  // deviated from the spec in `toText` at step 3.
  if (notRendered(node)) {
    return items
  }

  /** @type {BreakNumber | undefined} */
  let prefix
  /** @type {BreakForce | BreakNumber | undefined} */
  let suffix
  // Note: we first detect if there is going to be a break before or after the
  // contents, as that changes the white-space handling.

  // 2.  If node’s computed value of `visibility` is not `visible`, then return
  //     items.
  //
  //     Note: Ignored, as everything is visible by default user agent styles.

  // 3.  If node is not being rendered, then return items. [...]
  //
  //     Note: We already did this above.

  // See `collectText` for step 4.

  // 5.  If node is a `<br>` element, then append a string containing a single
  //     U+000A LINE FEED (LF) character to items.
  if (br(node)) {
    suffix = '\n'
  }

  // 7.  If node’s computed value of `display` is `table-row`, and node’s CSS
  //     box is not the last `table-row` box of the nearest ancestor `table`
  //     box, then append a string containing a single U+000A LINE FEED (LF)
  //     character to items.
  //
  //     See: <https://html.spec.whatwg.org/multipage/rendering.html#tables-2>
  //     Note: needs further investigation as this does not account for implicit
  //     rows.
  else if (
    row(node) &&
    // @ts-expect-error: something up with types of parents.
    (0,unist_util_find_after__WEBPACK_IMPORTED_MODULE_1__.findAfter)(parent, node, row)
  ) {
    suffix = '\n'
  }

  // 8.  If node is a `<p>` element, then append 2 (a required line break count)
  //     at the beginning and end of items.
  else if (p(node)) {
    prefix = 2
    suffix = 2
  }

  // 9.  If node’s used value of `display` is block-level or `table-caption`,
  //     then append 1 (a required line break count) at the beginning and end of
  //     items.
  else if (blockOrCaption(node)) {
    prefix = 1
    suffix = 1
  }

  // 1.  Let items be the result of running the inner text collection steps with
  //     each child node of node in tree order, and then concatenating the
  //     results to a single list.
  while (++index < children.length) {
    items = items.concat(
      renderedTextCollection(children[index], node, {
        whitespace,
        breakBefore: index ? undefined : prefix,
        breakAfter:
          index < children.length - 1 ? br(children[index + 1]) : suffix
      })
    )
  }

  // 6.  If node’s computed value of `display` is `table-cell`, and node’s CSS
  //     box is not the last `table-cell` box of its enclosing `table-row` box,
  //     then append a string containing a single U+0009 CHARACTER TABULATION
  //     (tab) character to items.
  //
  //     See: <https://html.spec.whatwg.org/multipage/rendering.html#tables-2>
  if (
    cell(node) &&
    // @ts-expect-error: something up with types of parents.
    (0,unist_util_find_after__WEBPACK_IMPORTED_MODULE_1__.findAfter)(parent, node, cell)
  ) {
    items.push('\t')
  }

  // Add the pre- and suffix.
  if (prefix) items.unshift(prefix)
  if (suffix) items.push(suffix)

  return items
}

/**
 * 4.  If node is a Text node, then for each CSS text box produced by node,
 *     in content order, compute the text of the box after application of the
 *     CSS `white-space` processing rules and `text-transform` rules, set
 *     items to the list of the resulting strings, and return items.
 *     The CSS `white-space` processing rules are slightly modified:
 *     collapsible spaces at the end of lines are always collapsed, but they
 *     are only removed if the line is the last line of the block, or it ends
 *     with a br element.
 *     Soft hyphens should be preserved.
 *
 *     Note: See `collectText` and `collectPreText`.
 *     Note: we don’t deal with `text-transform`, no element has that by
 *     default.
 *
 * See: <https://drafts.csswg.org/css-text/#white-space-phase-1>
 *
 * @param {Comment | Text} node
 *   Text node.
 * @param {CollectionInfo} info
 *   Info on current collection.
 * @returns {Array<BreakNumber | string>}
 *   Result.
 */
function collectText(node, info) {
  const value = String(node.value)
  /** @type {Array<string>} */
  const lines = []
  /** @type {Array<BreakNumber | string>} */
  const result = []
  let start = 0

  while (start <= value.length) {
    searchLineFeeds.lastIndex = start

    const match = searchLineFeeds.exec(value)
    const end = match && 'index' in match ? match.index : value.length

    lines.push(
      // Any sequence of collapsible spaces and tabs immediately preceding or
      // following a segment break is removed.
      trimAndCollapseSpacesAndTabs(
        // […] ignoring bidi formatting characters (characters with the
        // Bidi_Control property [UAX9]: ALM, LTR, RTL, LRE-RLO, LRI-PDI) as if
        // they were not there.
        value
          .slice(start, end)
          .replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ''),
        start === 0 ? info.breakBefore : true,
        end === value.length ? info.breakAfter : true
      )
    )

    start = end + 1
  }

  // Collapsible segment breaks are transformed for rendering according to the
  // segment break transformation rules.
  // So here we jump to 4.1.2 of [CSSTEXT]:
  // Any collapsible segment break immediately following another collapsible
  // segment break is removed
  let index = -1
  /** @type {BreakNumber | undefined} */
  let join

  while (++index < lines.length) {
    // *   If the character immediately before or immediately after the segment
    //     break is the zero-width space character (U+200B), then the break is
    //     removed, leaving behind the zero-width space.
    if (
      lines[index].charCodeAt(lines[index].length - 1) === 0x20_0b /* ZWSP */ ||
      (index < lines.length - 1 &&
        lines[index + 1].charCodeAt(0) === 0x20_0b) /* ZWSP */
    ) {
      result.push(lines[index])
      join = undefined
    }

    // *   Otherwise, if the East Asian Width property [UAX11] of both the
    //     character before and after the segment break is Fullwidth, Wide, or
    //     Halfwidth (not Ambiguous), and neither side is Hangul, then the
    //     segment break is removed.
    //
    //     Note: ignored.
    // *   Otherwise, if the writing system of the segment break is Chinese,
    //     Japanese, or Yi, and the character before or after the segment break
    //     is punctuation or a symbol (Unicode general category P* or S*) and
    //     has an East Asian Width property of Ambiguous, and the character on
    //     the other side of the segment break is Fullwidth, Wide, or Halfwidth,
    //     and not Hangul, then the segment break is removed.
    //
    //     Note: ignored.

    // *   Otherwise, the segment break is converted to a space (U+0020).
    else if (lines[index]) {
      if (typeof join === 'number') result.push(join)
      result.push(lines[index])
      join = 0
    } else if (index === 0 || index === lines.length - 1) {
      // If this line is empty, and it’s the first or last, add a space.
      // Note that this function is only called in normal whitespace, so we
      // don’t worry about `pre`.
      result.push(0)
    }
  }

  return result
}

/**
 * Collect a text node as “pre” whitespace.
 *
 * @param {Text} node
 *   Text node.
 * @returns {Array<BreakNumber | string>}
 *   Result.
 */
function collectPreText(node) {
  return [String(node.value)]
}

/**
 * 3.  Every collapsible tab is converted to a collapsible space (U+0020).
 * 4.  Any collapsible space immediately following another collapsible
 *     space—even one outside the boundary of the inline containing that
 *     space, provided both spaces are within the same inline formatting
 *     context—is collapsed to have zero advance width. (It is invisible,
 *     but retains its soft wrap opportunity, if any.)
 *
 * @param {string} value
 *   Value to collapse.
 * @param {BreakBefore} breakBefore
 *   Whether there was a break before.
 * @param {BreakAfter} breakAfter
 *   Whether there was a break after.
 * @returns {string}
 *   Result.
 */
function trimAndCollapseSpacesAndTabs(value, breakBefore, breakAfter) {
  /** @type {Array<string>} */
  const result = []
  let start = 0
  /** @type {number | undefined} */
  let end

  while (start < value.length) {
    searchTabOrSpaces.lastIndex = start
    const match = searchTabOrSpaces.exec(value)
    end = match ? match.index : value.length

    // If we’re not directly after a segment break, but there was white space,
    // add an empty value that will be turned into a space.
    if (!start && !end && match && !breakBefore) {
      result.push('')
    }

    if (start !== end) {
      result.push(value.slice(start, end))
    }

    start = match ? end + match[0].length : end
  }

  // If we reached the end, there was trailing white space, and there’s no
  // segment break after this node, add an empty value that will be turned
  // into a space.
  if (start !== end && !breakAfter) {
    result.push('')
  }

  return result.join(' ')
}

/**
 * Figure out the whitespace of a node.
 *
 * We don’t support void elements here (so `nobr wbr` -> `normal` is ignored).
 *
 * @param {Nodes} node
 *   Node (typically `Element`).
 * @param {CollectionInfo} info
 *   Info on current collection.
 * @returns {Whitespace}
 *   Applied whitespace.
 */
function inferWhitespace(node, info) {
  if (node.type === 'element') {
    const props = node.properties || {}
    switch (node.tagName) {
      case 'listing':
      case 'plaintext':
      case 'xmp': {
        return 'pre'
      }

      case 'nobr': {
        return 'nowrap'
      }

      case 'pre': {
        return props.wrap ? 'pre-wrap' : 'pre'
      }

      case 'td':
      case 'th': {
        return props.noWrap ? 'nowrap' : info.whitespace
      }

      case 'textarea': {
        return 'pre-wrap'
      }

      default:
    }
  }

  return info.whitespace
}

/**
 * @type {TestFunction}
 * @param {Element} node
 * @returns {node is {properties: {hidden: true}}}
 */
function hidden(node) {
  return Boolean((node.properties || {}).hidden)
}

/**
 * @type {TestFunction}
 * @param {Element} node
 * @returns {node is {tagName: 'td' | 'th'}}
 */
function isCell(node) {
  return node.tagName === 'td' || node.tagName === 'th'
}

/**
 * @type {TestFunction}
 */
function closedDialog(node) {
  return node.tagName === 'dialog' && !(node.properties || {}).open
}


/***/ }),

/***/ "./node_modules/hast-util-whitespace/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/hast-util-whitespace/lib/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   whitespace: () => (/* binding */ whitespace)
/* harmony export */ });
/**
 * @typedef {import('hast').Nodes} Nodes
 */

// HTML whitespace expression.
// See <https://infra.spec.whatwg.org/#ascii-whitespace>.
const re = /[ \t\n\f\r]/g

/**
 * Check if the given value is *inter-element whitespace*.
 *
 * @param {Nodes | string} thing
 *   Thing to check (`Node` or `string`).
 * @returns {boolean}
 *   Whether the `value` is inter-element whitespace (`boolean`): consisting of
 *   zero or more of space, tab (`\t`), line feed (`\n`), carriage return
 *   (`\r`), or form feed (`\f`); if a node is passed it must be a `Text` node,
 *   whose `value` field is checked.
 */
function whitespace(thing) {
  return typeof thing === 'object'
    ? thing.type === 'text'
      ? empty(thing.value)
      : false
    : empty(thing)
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function empty(value) {
  return value.replace(re, '') === ''
}


/***/ }),

/***/ "./node_modules/hastscript/lib/create-h.js":
/*!*************************************************!*\
  !*** ./node_modules/hastscript/lib/create-h.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createH: () => (/* binding */ createH)
/* harmony export */ });
/* harmony import */ var comma_separated_tokens__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! comma-separated-tokens */ "./node_modules/comma-separated-tokens/index.js");
/* harmony import */ var hast_util_parse_selector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-parse-selector */ "./node_modules/hast-util-parse-selector/lib/index.js");
/* harmony import */ var property_information__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! property-information */ "./node_modules/property-information/lib/find.js");
/* harmony import */ var property_information__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! property-information */ "./node_modules/property-information/lib/normalize.js");
/* harmony import */ var space_separated_tokens__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! space-separated-tokens */ "./node_modules/space-separated-tokens/index.js");
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Nodes} Nodes
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').RootContent} RootContent
 *
 * @typedef {import('property-information').Info} Info
 * @typedef {import('property-information').Schema} Schema
 */

/**
 * @typedef {Element | Root} Result
 *   Result from a `h` (or `s`) call.
 *
 * @typedef {number | string} StyleValue
 *   Value for a CSS style field.
 * @typedef {Record<string, StyleValue>} Style
 *   Supported value of a `style` prop.
 * @typedef {boolean | number | string | null | undefined} PrimitiveValue
 *   Primitive property value.
 * @typedef {Array<number | string>} ArrayValue
 *   List of property values for space- or comma separated values (such as `className`).
 * @typedef {ArrayValue | PrimitiveValue} PropertyValue
 *   Primitive value or list value.
 * @typedef {{[property: string]: PropertyValue | Style}} Properties
 *   Acceptable value for element properties.
 *
 * @typedef {number | string | null | undefined} PrimitiveChild
 *   Primitive children, either ignored (nullish), or turned into text nodes.
 * @typedef {Array<ArrayChildNested | Nodes | PrimitiveChild>} ArrayChild
 *   List of children.
 * @typedef {Array<Nodes | PrimitiveChild>} ArrayChildNested
 *   List of children (deep).
 * @typedef {ArrayChild | Nodes | PrimitiveChild} Child
 *   Acceptable child value.
 */






const buttonTypes = new Set(['button', 'menu', 'reset', 'submit'])

const own = {}.hasOwnProperty

/**
 * @param {Schema} schema
 *   Schema to use.
 * @param {string} defaultTagName
 *   Default tag name.
 * @param {Array<string> | undefined} [caseSensitive]
 *   Case-sensitive tag names (default: `undefined`).
 * @returns
 *   `h`.
 */
function createH(schema, defaultTagName, caseSensitive) {
  const adjust = caseSensitive && createAdjustMap(caseSensitive)

  /**
   * Hyperscript compatible DSL for creating virtual hast trees.
   *
   * @overload
   * @param {null | undefined} [selector]
   * @param {...Child} children
   * @returns {Root}
   *
   * @overload
   * @param {string} selector
   * @param {Properties} properties
   * @param {...Child} children
   * @returns {Element}
   *
   * @overload
   * @param {string} selector
   * @param {...Child} children
   * @returns {Element}
   *
   * @param {string | null | undefined} [selector]
   *   Selector.
   * @param {Child | Properties | null | undefined} [properties]
   *   Properties (or first child) (default: `undefined`).
   * @param {...Child} children
   *   Children.
   * @returns {Result}
   *   Result.
   */
  function h(selector, properties, ...children) {
    let index = -1
    /** @type {Result} */
    let node

    if (selector === undefined || selector === null) {
      node = {type: 'root', children: []}
      // Properties are not supported for roots.
      const child = /** @type {Child} */ (properties)
      children.unshift(child)
    } else {
      node = (0,hast_util_parse_selector__WEBPACK_IMPORTED_MODULE_0__.parseSelector)(selector, defaultTagName)
      // Normalize the name.
      node.tagName = node.tagName.toLowerCase()
      if (adjust && own.call(adjust, node.tagName)) {
        node.tagName = adjust[node.tagName]
      }

      // Handle props.
      if (isProperties(properties, node.tagName)) {
        /** @type {string} */
        let key

        for (key in properties) {
          if (own.call(properties, key)) {
            addProperty(schema, node.properties, key, properties[key])
          }
        }
      } else {
        children.unshift(properties)
      }
    }

    // Handle children.
    while (++index < children.length) {
      addChild(node.children, children[index])
    }

    if (node.type === 'element' && node.tagName === 'template') {
      node.content = {type: 'root', children: node.children}
      node.children = []
    }

    return node
  }

  return h
}

/**
 * Check if something is properties or a child.
 *
 * @param {Child | Properties} value
 *   Value to check.
 * @param {string} name
 *   Tag name.
 * @returns {value is Properties}
 *   Whether `value` is a properties object.
 */
function isProperties(value, name) {
  if (
    value === null ||
    value === undefined ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return false
  }

  if (name === 'input' || !value.type || typeof value.type !== 'string') {
    return true
  }

  if ('children' in value && Array.isArray(value.children)) {
    return false
  }

  if (name === 'button') {
    return buttonTypes.has(value.type.toLowerCase())
  }

  return !('value' in value)
}

/**
 * @param {Schema} schema
 *   Schema.
 * @param {Properties} properties
 *   Properties object.
 * @param {string} key
 *   Property name.
 * @param {PropertyValue | Style} value
 *   Property value.
 * @returns {undefined}
 *   Nothing.
 */
function addProperty(schema, properties, key, value) {
  const info = (0,property_information__WEBPACK_IMPORTED_MODULE_1__.find)(schema, key)
  let index = -1
  /** @type {PropertyValue} */
  let result

  // Ignore nullish and NaN values.
  if (value === undefined || value === null) return

  if (typeof value === 'number') {
    // Ignore NaN.
    if (Number.isNaN(value)) return

    result = value
  }
  // Booleans.
  else if (typeof value === 'boolean') {
    result = value
  }
  // Handle list values.
  else if (typeof value === 'string') {
    if (info.spaceSeparated) {
      result = (0,space_separated_tokens__WEBPACK_IMPORTED_MODULE_2__.parse)(value)
    } else if (info.commaSeparated) {
      result = (0,comma_separated_tokens__WEBPACK_IMPORTED_MODULE_3__.parse)(value)
    } else if (info.commaOrSpaceSeparated) {
      result = (0,space_separated_tokens__WEBPACK_IMPORTED_MODULE_2__.parse)((0,comma_separated_tokens__WEBPACK_IMPORTED_MODULE_3__.parse)(value).join(' '))
    } else {
      result = parsePrimitive(info, info.property, value)
    }
  } else if (Array.isArray(value)) {
    result = value.concat()
  } else {
    result = info.property === 'style' ? style(value) : String(value)
  }

  if (Array.isArray(result)) {
    /** @type {Array<number | string>} */
    const finalResult = []

    while (++index < result.length) {
      // Assume no booleans in array.
      const value = /** @type {number | string} */ (
        parsePrimitive(info, info.property, result[index])
      )
      finalResult[index] = value
    }

    result = finalResult
  }

  // Class names (which can be added both on the `selector` and here).
  if (info.property === 'className' && Array.isArray(properties.className)) {
    // Assume no booleans in `className`.
    const value = /** @type {number | string} */ (result)
    result = properties.className.concat(value)
  }

  properties[info.property] = result
}

/**
 * @param {Array<RootContent>} nodes
 *   Children.
 * @param {Child} value
 *   Child.
 * @returns {undefined}
 *   Nothing.
 */
function addChild(nodes, value) {
  let index = -1

  if (value === undefined || value === null) {
    // Empty.
  } else if (typeof value === 'string' || typeof value === 'number') {
    nodes.push({type: 'text', value: String(value)})
  } else if (Array.isArray(value)) {
    while (++index < value.length) {
      addChild(nodes, value[index])
    }
  } else if (typeof value === 'object' && 'type' in value) {
    if (value.type === 'root') {
      addChild(nodes, value.children)
    } else {
      nodes.push(value)
    }
  } else {
    throw new Error('Expected node, nodes, or string, got `' + value + '`')
  }
}

/**
 * Parse a single primitives.
 *
 * @param {Info} info
 *   Property information.
 * @param {string} name
 *   Property name.
 * @param {PrimitiveValue} value
 *   Property value.
 * @returns {PrimitiveValue}
 *   Property value.
 */
function parsePrimitive(info, name, value) {
  if (typeof value === 'string') {
    if (info.number && value && !Number.isNaN(Number(value))) {
      return Number(value)
    }

    if (
      (info.boolean || info.overloadedBoolean) &&
      (value === '' || (0,property_information__WEBPACK_IMPORTED_MODULE_4__.normalize)(value) === (0,property_information__WEBPACK_IMPORTED_MODULE_4__.normalize)(name))
    ) {
      return true
    }
  }

  return value
}

/**
 * Serialize a `style` object as a string.
 *
 * @param {Style} value
 *   Style object.
 * @returns {string}
 *   CSS string.
 */
function style(value) {
  /** @type {Array<string>} */
  const result = []
  /** @type {string} */
  let key

  for (key in value) {
    if (own.call(value, key)) {
      result.push([key, value[key]].join(': '))
    }
  }

  return result.join('; ')
}

/**
 * Create a map to adjust casing.
 *
 * @param {Array<string>} values
 *   List of properly cased keys.
 * @returns {Record<string, string>}
 *   Map of lowercase keys to uppercase keys.
 */
function createAdjustMap(values) {
  /** @type {Record<string, string>} */
  const result = {}
  let index = -1

  while (++index < values.length) {
    result[values[index].toLowerCase()] = values[index]
  }

  return result
}


/***/ }),

/***/ "./node_modules/hastscript/lib/index.js":
/*!**********************************************!*\
  !*** ./node_modules/hastscript/lib/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ h),
/* harmony export */   s: () => (/* binding */ s)
/* harmony export */ });
/* harmony import */ var property_information__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! property-information */ "./node_modules/property-information/index.js");
/* harmony import */ var _create_h_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./create-h.js */ "./node_modules/hastscript/lib/create-h.js");
/* harmony import */ var _svg_case_sensitive_tag_names_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./svg-case-sensitive-tag-names.js */ "./node_modules/hastscript/lib/svg-case-sensitive-tag-names.js");
/**
 * @typedef {import('./create-h.js').Child} Child
 *   Acceptable child value.
 * @typedef {import('./create-h.js').Properties} Properties
 *   Acceptable value for element properties.
 * @typedef {import('./create-h.js').Result} Result
 *   Result from a `h` (or `s`) call.
 */

// Register the JSX namespace on `h`.
/**
 * @typedef {import('./jsx-classic.js').Element} h.JSX.Element
 * @typedef {import('./jsx-classic.js').ElementChildrenAttribute} h.JSX.ElementChildrenAttribute
 * @typedef {import('./jsx-classic.js').IntrinsicAttributes} h.JSX.IntrinsicAttributes
 * @typedef {import('./jsx-classic.js').IntrinsicElements} h.JSX.IntrinsicElements
 */

// Register the JSX namespace on `s`.
/**
 * @typedef {import('./jsx-classic.js').Element} s.JSX.Element
 * @typedef {import('./jsx-classic.js').ElementChildrenAttribute} s.JSX.ElementChildrenAttribute
 * @typedef {import('./jsx-classic.js').IntrinsicAttributes} s.JSX.IntrinsicAttributes
 * @typedef {import('./jsx-classic.js').IntrinsicElements} s.JSX.IntrinsicElements
 */





// Note: this explicit type is needed, otherwise TS creates broken types.
/** @type {ReturnType<createH>} */
const h = (0,_create_h_js__WEBPACK_IMPORTED_MODULE_0__.createH)(property_information__WEBPACK_IMPORTED_MODULE_1__.html, 'div')

// Note: this explicit type is needed, otherwise TS creates broken types.
/** @type {ReturnType<createH>} */
const s = (0,_create_h_js__WEBPACK_IMPORTED_MODULE_0__.createH)(property_information__WEBPACK_IMPORTED_MODULE_1__.svg, 'g', _svg_case_sensitive_tag_names_js__WEBPACK_IMPORTED_MODULE_2__.svgCaseSensitiveTagNames)


/***/ }),

/***/ "./node_modules/hastscript/lib/svg-case-sensitive-tag-names.js":
/*!*********************************************************************!*\
  !*** ./node_modules/hastscript/lib/svg-case-sensitive-tag-names.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   svgCaseSensitiveTagNames: () => (/* binding */ svgCaseSensitiveTagNames)
/* harmony export */ });
const svgCaseSensitiveTagNames = [
  'altGlyph',
  'altGlyphDef',
  'altGlyphItem',
  'animateColor',
  'animateMotion',
  'animateTransform',
  'clipPath',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'foreignObject',
  'glyphRef',
  'linearGradient',
  'radialGradient',
  'solidColor',
  'textArea',
  'textPath'
]


/***/ }),

/***/ "./node_modules/is-plain-obj/index.js":
/*!********************************************!*\
  !*** ./node_modules/is-plain-obj/index.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isPlainObject)
/* harmony export */ });
function isPlainObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}


/***/ }),

/***/ "./node_modules/longest-streak/index.js":
/*!**********************************************!*\
  !*** ./node_modules/longest-streak/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   longestStreak: () => (/* binding */ longestStreak)
/* harmony export */ });
/**
 * Get the count of the longest repeating streak of `substring` in `value`.
 *
 * @param {string} value
 *   Content to search in.
 * @param {string} substring
 *   Substring to look for, typically one character.
 * @returns {number}
 *   Count of most frequent adjacent `substring`s in `value`.
 */
function longestStreak(value, substring) {
  const source = String(value)
  let index = source.indexOf(substring)
  let expected = index
  let count = 0
  let max = 0

  if (typeof substring !== 'string') {
    throw new TypeError('Expected substring')
  }

  while (index !== -1) {
    if (index === expected) {
      if (++count > max) {
        max = count
      }
    } else {
      count = 1
    }

    expected = index + substring.length
    index = source.indexOf(substring, expected)
  }

  return max
}


/***/ }),

/***/ "./node_modules/markdown-table/index.js":
/*!**********************************************!*\
  !*** ./node_modules/markdown-table/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   markdownTable: () => (/* binding */ markdownTable)
/* harmony export */ });
/**
 * @typedef Options
 *   Configuration (optional).
 * @property {string|null|ReadonlyArray<string|null|undefined>} [align]
 *   One style for all columns, or styles for their respective columns.
 *   Each style is either `'l'` (left), `'r'` (right), or `'c'` (center).
 *   Other values are treated as `''`, which doesn’t place the colon in the
 *   alignment row but does align left.
 *   *Only the lowercased first character is used, so `Right` is fine.*
 * @property {boolean} [padding=true]
 *   Whether to add a space of padding between delimiters and cells.
 *
 *   When `true`, there is padding:
 *
 *   ```markdown
 *   | Alpha | B     |
 *   | ----- | ----- |
 *   | C     | Delta |
 *   ```
 *
 *   When `false`, there is no padding:
 *
 *   ```markdown
 *   |Alpha|B    |
 *   |-----|-----|
 *   |C    |Delta|
 *   ```
 * @property {boolean} [delimiterStart=true]
 *   Whether to begin each row with the delimiter.
 *
 *   > 👉 **Note**: please don’t use this: it could create fragile structures
 *   > that aren’t understandable to some markdown parsers.
 *
 *   When `true`, there are starting delimiters:
 *
 *   ```markdown
 *   | Alpha | B     |
 *   | ----- | ----- |
 *   | C     | Delta |
 *   ```
 *
 *   When `false`, there are no starting delimiters:
 *
 *   ```markdown
 *   Alpha | B     |
 *   ----- | ----- |
 *   C     | Delta |
 *   ```
 * @property {boolean} [delimiterEnd=true]
 *   Whether to end each row with the delimiter.
 *
 *   > 👉 **Note**: please don’t use this: it could create fragile structures
 *   > that aren’t understandable to some markdown parsers.
 *
 *   When `true`, there are ending delimiters:
 *
 *   ```markdown
 *   | Alpha | B     |
 *   | ----- | ----- |
 *   | C     | Delta |
 *   ```
 *
 *   When `false`, there are no ending delimiters:
 *
 *   ```markdown
 *   | Alpha | B
 *   | ----- | -----
 *   | C     | Delta
 *   ```
 * @property {boolean} [alignDelimiters=true]
 *   Whether to align the delimiters.
 *   By default, they are aligned:
 *
 *   ```markdown
 *   | Alpha | B     |
 *   | ----- | ----- |
 *   | C     | Delta |
 *   ```
 *
 *   Pass `false` to make them staggered:
 *
 *   ```markdown
 *   | Alpha | B |
 *   | - | - |
 *   | C | Delta |
 *   ```
 * @property {(value: string) => number} [stringLength]
 *   Function to detect the length of table cell content.
 *   This is used when aligning the delimiters (`|`) between table cells.
 *   Full-width characters and emoji mess up delimiter alignment when viewing
 *   the markdown source.
 *   To fix this, you can pass this function, which receives the cell content
 *   and returns its “visible” size.
 *   Note that what is and isn’t visible depends on where the text is displayed.
 *
 *   Without such a function, the following:
 *
 *   ```js
 *   markdownTable([
 *     ['Alpha', 'Bravo'],
 *     ['中文', 'Charlie'],
 *     ['👩‍❤️‍👩', 'Delta']
 *   ])
 *   ```
 *
 *   Yields:
 *
 *   ```markdown
 *   | Alpha | Bravo |
 *   | - | - |
 *   | 中文 | Charlie |
 *   | 👩‍❤️‍👩 | Delta |
 *   ```
 *
 *   With [`string-width`](https://github.com/sindresorhus/string-width):
 *
 *   ```js
 *   import stringWidth from 'string-width'
 *
 *   markdownTable(
 *     [
 *       ['Alpha', 'Bravo'],
 *       ['中文', 'Charlie'],
 *       ['👩‍❤️‍👩', 'Delta']
 *     ],
 *     {stringLength: stringWidth}
 *   )
 *   ```
 *
 *   Yields:
 *
 *   ```markdown
 *   | Alpha | Bravo   |
 *   | ----- | ------- |
 *   | 中文  | Charlie |
 *   | 👩‍❤️‍👩    | Delta   |
 *   ```
 */

/**
 * @typedef {Options} MarkdownTableOptions
 * @todo
 *   Remove next major.
 */

/**
 * Generate a markdown ([GFM](https://docs.github.com/en/github/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables)) table..
 *
 * @param {ReadonlyArray<ReadonlyArray<string|null|undefined>>} table
 *   Table data (matrix of strings).
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {string}
 */
function markdownTable(table, options = {}) {
  const align = (options.align || []).concat()
  const stringLength = options.stringLength || defaultStringLength
  /** @type {Array<number>} Character codes as symbols for alignment per column. */
  const alignments = []
  /** @type {Array<Array<string>>} Cells per row. */
  const cellMatrix = []
  /** @type {Array<Array<number>>} Sizes of each cell per row. */
  const sizeMatrix = []
  /** @type {Array<number>} */
  const longestCellByColumn = []
  let mostCellsPerRow = 0
  let rowIndex = -1

  // This is a superfluous loop if we don’t align delimiters, but otherwise we’d
  // do superfluous work when aligning, so optimize for aligning.
  while (++rowIndex < table.length) {
    /** @type {Array<string>} */
    const row = []
    /** @type {Array<number>} */
    const sizes = []
    let columnIndex = -1

    if (table[rowIndex].length > mostCellsPerRow) {
      mostCellsPerRow = table[rowIndex].length
    }

    while (++columnIndex < table[rowIndex].length) {
      const cell = serialize(table[rowIndex][columnIndex])

      if (options.alignDelimiters !== false) {
        const size = stringLength(cell)
        sizes[columnIndex] = size

        if (
          longestCellByColumn[columnIndex] === undefined ||
          size > longestCellByColumn[columnIndex]
        ) {
          longestCellByColumn[columnIndex] = size
        }
      }

      row.push(cell)
    }

    cellMatrix[rowIndex] = row
    sizeMatrix[rowIndex] = sizes
  }

  // Figure out which alignments to use.
  let columnIndex = -1

  if (typeof align === 'object' && 'length' in align) {
    while (++columnIndex < mostCellsPerRow) {
      alignments[columnIndex] = toAlignment(align[columnIndex])
    }
  } else {
    const code = toAlignment(align)

    while (++columnIndex < mostCellsPerRow) {
      alignments[columnIndex] = code
    }
  }

  // Inject the alignment row.
  columnIndex = -1
  /** @type {Array<string>} */
  const row = []
  /** @type {Array<number>} */
  const sizes = []

  while (++columnIndex < mostCellsPerRow) {
    const code = alignments[columnIndex]
    let before = ''
    let after = ''

    if (code === 99 /* `c` */) {
      before = ':'
      after = ':'
    } else if (code === 108 /* `l` */) {
      before = ':'
    } else if (code === 114 /* `r` */) {
      after = ':'
    }

    // There *must* be at least one hyphen-minus in each alignment cell.
    let size =
      options.alignDelimiters === false
        ? 1
        : Math.max(
            1,
            longestCellByColumn[columnIndex] - before.length - after.length
          )

    const cell = before + '-'.repeat(size) + after

    if (options.alignDelimiters !== false) {
      size = before.length + size + after.length

      if (size > longestCellByColumn[columnIndex]) {
        longestCellByColumn[columnIndex] = size
      }

      sizes[columnIndex] = size
    }

    row[columnIndex] = cell
  }

  // Inject the alignment row.
  cellMatrix.splice(1, 0, row)
  sizeMatrix.splice(1, 0, sizes)

  rowIndex = -1
  /** @type {Array<string>} */
  const lines = []

  while (++rowIndex < cellMatrix.length) {
    const row = cellMatrix[rowIndex]
    const sizes = sizeMatrix[rowIndex]
    columnIndex = -1
    /** @type {Array<string>} */
    const line = []

    while (++columnIndex < mostCellsPerRow) {
      const cell = row[columnIndex] || ''
      let before = ''
      let after = ''

      if (options.alignDelimiters !== false) {
        const size =
          longestCellByColumn[columnIndex] - (sizes[columnIndex] || 0)
        const code = alignments[columnIndex]

        if (code === 114 /* `r` */) {
          before = ' '.repeat(size)
        } else if (code === 99 /* `c` */) {
          if (size % 2) {
            before = ' '.repeat(size / 2 + 0.5)
            after = ' '.repeat(size / 2 - 0.5)
          } else {
            before = ' '.repeat(size / 2)
            after = before
          }
        } else {
          after = ' '.repeat(size)
        }
      }

      if (options.delimiterStart !== false && !columnIndex) {
        line.push('|')
      }

      if (
        options.padding !== false &&
        // Don’t add the opening space if we’re not aligning and the cell is
        // empty: there will be a closing space.
        !(options.alignDelimiters === false && cell === '') &&
        (options.delimiterStart !== false || columnIndex)
      ) {
        line.push(' ')
      }

      if (options.alignDelimiters !== false) {
        line.push(before)
      }

      line.push(cell)

      if (options.alignDelimiters !== false) {
        line.push(after)
      }

      if (options.padding !== false) {
        line.push(' ')
      }

      if (
        options.delimiterEnd !== false ||
        columnIndex !== mostCellsPerRow - 1
      ) {
        line.push('|')
      }
    }

    lines.push(
      options.delimiterEnd === false
        ? line.join('').replace(/ +$/, '')
        : line.join('')
    )
  }

  return lines.join('\n')
}

/**
 * @param {string|null|undefined} [value]
 * @returns {string}
 */
function serialize(value) {
  return value === null || value === undefined ? '' : String(value)
}

/**
 * @param {string} value
 * @returns {number}
 */
function defaultStringLength(value) {
  return value.length
}

/**
 * @param {string|null|undefined} value
 * @returns {number}
 */
function toAlignment(value) {
  const code = typeof value === 'string' ? value.codePointAt(0) : 0

  return code === 67 /* `C` */ || code === 99 /* `c` */
    ? 99 /* `c` */
    : code === 76 /* `L` */ || code === 108 /* `l` */
    ? 108 /* `l` */
    : code === 82 /* `R` */ || code === 114 /* `r` */
    ? 114 /* `r` */
    : 0
}


/***/ }),

/***/ "./node_modules/mdast-util-find-and-replace/lib/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/mdast-util-find-and-replace/lib/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findAndReplace: () => (/* binding */ findAndReplace)
/* harmony export */ });
/* harmony import */ var escape_string_regexp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! escape-string-regexp */ "./node_modules/mdast-util-find-and-replace/node_modules/escape-string-regexp/index.js");
/* harmony import */ var unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! unist-util-visit-parents */ "./node_modules/unist-util-visit-parents/lib/index.js");
/* harmony import */ var unist_util_is__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-is */ "./node_modules/unist-util-is/lib/index.js");
/**
 * @typedef {import('mdast').Nodes} Nodes
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Text} Text
 * @typedef {import('unist-util-visit-parents').Test} Test
 * @typedef {import('unist-util-visit-parents').VisitorResult} VisitorResult
 */

/**
 * @typedef RegExpMatchObject
 *   Info on the match.
 * @property {number} index
 *   The index of the search at which the result was found.
 * @property {string} input
 *   A copy of the search string in the text node.
 * @property {[...Array<Parents>, Text]} stack
 *   All ancestors of the text node, where the last node is the text itself.
 *
 * @typedef {RegExp | string} Find
 *   Pattern to find.
 *
 *   Strings are escaped and then turned into global expressions.
 *
 * @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
 *   Several find and replaces, in array form.
 *
 * @typedef {[Find, Replace?]} FindAndReplaceTuple
 *   Find and replace in tuple form.
 *
 * @typedef {ReplaceFunction | string | null | undefined} Replace
 *   Thing to replace with.
 *
 * @callback ReplaceFunction
 *   Callback called when a search matches.
 * @param {...any} parameters
 *   The parameters are the result of corresponding search expression:
 *
 *   * `value` (`string`) — whole match
 *   * `...capture` (`Array<string>`) — matches from regex capture groups
 *   * `match` (`RegExpMatchObject`) — info on the match
 * @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
 *   Thing to replace with.
 *
 *   * when `null`, `undefined`, `''`, remove the match
 *   * …or when `false`, do not replace at all
 *   * …or when `string`, replace with a text node of that value
 *   * …or when `Node` or `Array<Node>`, replace with those nodes
 *
 * @typedef {[RegExp, ReplaceFunction]} Pair
 *   Normalized find and replace.
 *
 * @typedef {Array<Pair>} Pairs
 *   All find and replaced.
 *
 * @typedef Options
 *   Configuration.
 * @property {Test | null | undefined} [ignore]
 *   Test for which nodes to ignore (optional).
 */





/**
 * Find patterns in a tree and replace them.
 *
 * The algorithm searches the tree in *preorder* for complete values in `Text`
 * nodes.
 * Partial matches are not supported.
 *
 * @param {Nodes} tree
 *   Tree to change.
 * @param {FindAndReplaceList | FindAndReplaceTuple} list
 *   Patterns to find.
 * @param {Options | null | undefined} [options]
 *   Configuration (when `find` is not `Find`).
 * @returns {undefined}
 *   Nothing.
 */
function findAndReplace(tree, list, options) {
  const settings = options || {}
  const ignored = (0,unist_util_is__WEBPACK_IMPORTED_MODULE_1__.convert)(settings.ignore || [])
  const pairs = toPairs(list)
  let pairIndex = -1

  while (++pairIndex < pairs.length) {
    (0,unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_2__.visitParents)(tree, 'text', visitor)
  }

  /** @type {import('unist-util-visit-parents').BuildVisitor<Root, 'text'>} */
  function visitor(node, parents) {
    let index = -1
    /** @type {Parents | undefined} */
    let grandparent

    while (++index < parents.length) {
      const parent = parents[index]
      /** @type {Array<Nodes> | undefined} */
      const siblings = grandparent ? grandparent.children : undefined

      if (
        ignored(
          parent,
          siblings ? siblings.indexOf(parent) : undefined,
          grandparent
        )
      ) {
        return
      }

      grandparent = parent
    }

    if (grandparent) {
      return handler(node, parents)
    }
  }

  /**
   * Handle a text node which is not in an ignored parent.
   *
   * @param {Text} node
   *   Text node.
   * @param {Array<Parents>} parents
   *   Parents.
   * @returns {VisitorResult}
   *   Result.
   */
  function handler(node, parents) {
    const parent = parents[parents.length - 1]
    const find = pairs[pairIndex][0]
    const replace = pairs[pairIndex][1]
    let start = 0
    /** @type {Array<Nodes>} */
    const siblings = parent.children
    const index = siblings.indexOf(node)
    let change = false
    /** @type {Array<PhrasingContent>} */
    let nodes = []

    find.lastIndex = 0

    let match = find.exec(node.value)

    while (match) {
      const position = match.index
      /** @type {RegExpMatchObject} */
      const matchObject = {
        index: match.index,
        input: match.input,
        stack: [...parents, node]
      }
      let value = replace(...match, matchObject)

      if (typeof value === 'string') {
        value = value.length > 0 ? {type: 'text', value} : undefined
      }

      // It wasn’t a match after all.
      if (value === false) {
        // False acts as if there was no match.
        // So we need to reset `lastIndex`, which currently being at the end of
        // the current match, to the beginning.
        find.lastIndex = position + 1
      } else {
        if (start !== position) {
          nodes.push({
            type: 'text',
            value: node.value.slice(start, position)
          })
        }

        if (Array.isArray(value)) {
          nodes.push(...value)
        } else if (value) {
          nodes.push(value)
        }

        start = position + match[0].length
        change = true
      }

      if (!find.global) {
        break
      }

      match = find.exec(node.value)
    }

    if (change) {
      if (start < node.value.length) {
        nodes.push({type: 'text', value: node.value.slice(start)})
      }

      parent.children.splice(index, 1, ...nodes)
    } else {
      nodes = [node]
    }

    return index + nodes.length
  }
}

/**
 * Turn a tuple or a list of tuples into pairs.
 *
 * @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
 *   Schema.
 * @returns {Pairs}
 *   Clean pairs.
 */
function toPairs(tupleOrList) {
  /** @type {Pairs} */
  const result = []

  if (!Array.isArray(tupleOrList)) {
    throw new TypeError('Expected find and replace tuple or list of tuples')
  }

  /** @type {FindAndReplaceList} */
  // @ts-expect-error: correct.
  const list =
    !tupleOrList[0] || Array.isArray(tupleOrList[0])
      ? tupleOrList
      : [tupleOrList]

  let index = -1

  while (++index < list.length) {
    const tuple = list[index]
    result.push([toExpression(tuple[0]), toFunction(tuple[1])])
  }

  return result
}

/**
 * Turn a find into an expression.
 *
 * @param {Find} find
 *   Find.
 * @returns {RegExp}
 *   Expression.
 */
function toExpression(find) {
  return typeof find === 'string' ? new RegExp((0,escape_string_regexp__WEBPACK_IMPORTED_MODULE_0__["default"])(find), 'g') : find
}

/**
 * Turn a replace into a function.
 *
 * @param {Replace} replace
 *   Replace.
 * @returns {ReplaceFunction}
 *   Function.
 */
function toFunction(replace) {
  return typeof replace === 'function'
    ? replace
    : function () {
        return replace
      }
}


/***/ }),

/***/ "./node_modules/mdast-util-find-and-replace/node_modules/escape-string-regexp/index.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/mdast-util-find-and-replace/node_modules/escape-string-regexp/index.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ escapeStringRegexp)
/* harmony export */ });
function escapeStringRegexp(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d');
}


/***/ }),

/***/ "./node_modules/mdast-util-gfm-autolink-literal/lib/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/mdast-util-gfm-autolink-literal/lib/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmAutolinkLiteralFromMarkdown: () => (/* binding */ gfmAutolinkLiteralFromMarkdown),
/* harmony export */   gfmAutolinkLiteralToMarkdown: () => (/* binding */ gfmAutolinkLiteralToMarkdown)
/* harmony export */ });
/* harmony import */ var ccount__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ccount */ "./node_modules/ccount/index.js");
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var mdast_util_find_and_replace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mdast-util-find-and-replace */ "./node_modules/mdast-util-find-and-replace/lib/index.js");
/**
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 *
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-from-markdown').Transform} FromMarkdownTransform
 *
 * @typedef {import('mdast-util-to-markdown').ConstructName} ConstructName
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 *
 * @typedef {import('mdast-util-find-and-replace').RegExpMatchObject} RegExpMatchObject
 * @typedef {import('mdast-util-find-and-replace').ReplaceFunction} ReplaceFunction
 */






/** @type {ConstructName} */
const inConstruct = 'phrasing'
/** @type {Array<ConstructName>} */
const notInConstruct = ['autolink', 'link', 'image', 'label']

/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM autolink
 * literals in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
 */
function gfmAutolinkLiteralFromMarkdown() {
  return {
    transforms: [transformGfmAutolinkLiterals],
    enter: {
      literalAutolink: enterLiteralAutolink,
      literalAutolinkEmail: enterLiteralAutolinkValue,
      literalAutolinkHttp: enterLiteralAutolinkValue,
      literalAutolinkWww: enterLiteralAutolinkValue
    },
    exit: {
      literalAutolink: exitLiteralAutolink,
      literalAutolinkEmail: exitLiteralAutolinkEmail,
      literalAutolinkHttp: exitLiteralAutolinkHttp,
      literalAutolinkWww: exitLiteralAutolinkWww
    }
  }
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM autolink
 * literals in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
 */
function gfmAutolinkLiteralToMarkdown() {
  return {
    unsafe: [
      {
        character: '@',
        before: '[+\\-.\\w]',
        after: '[\\-.\\w]',
        inConstruct,
        notInConstruct
      },
      {
        character: '.',
        before: '[Ww]',
        after: '[\\-.\\w]',
        inConstruct,
        notInConstruct
      },
      {
        character: ':',
        before: '[ps]',
        after: '\\/',
        inConstruct,
        notInConstruct
      }
    ]
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterLiteralAutolink(token) {
  this.enter({type: 'link', title: null, url: '', children: []}, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterLiteralAutolinkValue(token) {
  this.config.enter.autolinkProtocol.call(this, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkHttp(token) {
  this.config.exit.autolinkProtocol.call(this, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkWww(token) {
  this.config.exit.data.call(this, token)
  const node = this.stack[this.stack.length - 1]
  ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(node.type === 'link')
  node.url = 'http://' + this.sliceSerialize(token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkEmail(token) {
  this.config.exit.autolinkEmail.call(this, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolink(token) {
  this.exit(token)
}

/** @type {FromMarkdownTransform} */
function transformGfmAutolinkLiterals(tree) {
  (0,mdast_util_find_and_replace__WEBPACK_IMPORTED_MODULE_1__.findAndReplace)(
    tree,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl],
      [/([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/g, findEmail]
    ],
    {ignore: ['link', 'linkReference']}
  )
}

/**
 * @type {ReplaceFunction}
 * @param {string} _
 * @param {string} protocol
 * @param {string} domain
 * @param {string} path
 * @param {RegExpMatchObject} match
 * @returns {Array<PhrasingContent> | Link | false}
 */
// eslint-disable-next-line max-params
function findUrl(_, protocol, domain, path, match) {
  let prefix = ''

  // Not an expected previous character.
  if (!previous(match)) {
    return false
  }

  // Treat `www` as part of the domain.
  if (/^w/i.test(protocol)) {
    domain = protocol + domain
    protocol = ''
    prefix = 'http://'
  }

  if (!isCorrectDomain(domain)) {
    return false
  }

  const parts = splitUrl(domain + path)

  if (!parts[0]) return false

  /** @type {Link} */
  const result = {
    type: 'link',
    title: null,
    url: prefix + protocol + parts[0],
    children: [{type: 'text', value: protocol + parts[0]}]
  }

  if (parts[1]) {
    return [result, {type: 'text', value: parts[1]}]
  }

  return result
}

/**
 * @type {ReplaceFunction}
 * @param {string} _
 * @param {string} atext
 * @param {string} label
 * @param {RegExpMatchObject} match
 * @returns {Link | false}
 */
function findEmail(_, atext, label, match) {
  if (
    // Not an expected previous character.
    !previous(match, true) ||
    // Label ends in not allowed character.
    /[-\d_]$/.test(label)
  ) {
    return false
  }

  return {
    type: 'link',
    title: null,
    url: 'mailto:' + atext + '@' + label,
    children: [{type: 'text', value: atext + '@' + label}]
  }
}

/**
 * @param {string} domain
 * @returns {boolean}
 */
function isCorrectDomain(domain) {
  const parts = domain.split('.')

  if (
    parts.length < 2 ||
    (parts[parts.length - 1] &&
      (/_/.test(parts[parts.length - 1]) ||
        !/[a-zA-Z\d]/.test(parts[parts.length - 1]))) ||
    (parts[parts.length - 2] &&
      (/_/.test(parts[parts.length - 2]) ||
        !/[a-zA-Z\d]/.test(parts[parts.length - 2])))
  ) {
    return false
  }

  return true
}

/**
 * @param {string} url
 * @returns {[string, string | undefined]}
 */
function splitUrl(url) {
  const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url)

  if (!trailExec) {
    return [url, undefined]
  }

  url = url.slice(0, trailExec.index)

  let trail = trailExec[0]
  let closingParenIndex = trail.indexOf(')')
  const openingParens = (0,ccount__WEBPACK_IMPORTED_MODULE_2__.ccount)(url, '(')
  let closingParens = (0,ccount__WEBPACK_IMPORTED_MODULE_2__.ccount)(url, ')')

  while (closingParenIndex !== -1 && openingParens > closingParens) {
    url += trail.slice(0, closingParenIndex + 1)
    trail = trail.slice(closingParenIndex + 1)
    closingParenIndex = trail.indexOf(')')
    closingParens++
  }

  return [url, trail]
}

/**
 * @param {RegExpMatchObject} match
 * @param {boolean | null | undefined} [email=false]
 * @returns {boolean}
 */
function previous(match, email) {
  const code = match.input.charCodeAt(match.index - 1)

  return (
    (match.index === 0 ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_3__.unicodeWhitespace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_3__.unicodePunctuation)(code)) &&
    (!email || code !== 47)
  )
}


/***/ }),

/***/ "./node_modules/mdast-util-gfm-footnote/lib/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/mdast-util-gfm-footnote/lib/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmFootnoteFromMarkdown: () => (/* binding */ gfmFootnoteFromMarkdown),
/* harmony export */   gfmFootnoteToMarkdown: () => (/* binding */ gfmFootnoteToMarkdown)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-normalize-identifier */ "./node_modules/micromark-util-normalize-identifier/dev/index.js");
/**
 * @typedef {import('mdast').FootnoteDefinition} FootnoteDefinition
 * @typedef {import('mdast').FootnoteReference} FootnoteReference
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Map} Map
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 */




footnoteReference.peek = footnoteReferencePeek

/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM footnotes
 * in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown`.
 */
function gfmFootnoteFromMarkdown() {
  return {
    enter: {
      gfmFootnoteDefinition: enterFootnoteDefinition,
      gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
      gfmFootnoteCall: enterFootnoteCall,
      gfmFootnoteCallString: enterFootnoteCallString
    },
    exit: {
      gfmFootnoteDefinition: exitFootnoteDefinition,
      gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
      gfmFootnoteCall: exitFootnoteCall,
      gfmFootnoteCallString: exitFootnoteCallString
    }
  }
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM footnotes
 * in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown`.
 */
function gfmFootnoteToMarkdown() {
  return {
    // This is on by default already.
    unsafe: [{character: '[', inConstruct: ['phrasing', 'label', 'reference']}],
    handlers: {footnoteDefinition, footnoteReference}
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterFootnoteDefinition(token) {
  this.enter(
    {type: 'footnoteDefinition', identifier: '', label: '', children: []},
    token
  )
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterFootnoteDefinitionLabelString() {
  this.buffer()
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitFootnoteDefinitionLabelString(token) {
  const label = this.resume()
  const node = this.stack[this.stack.length - 1]
  ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(node.type === 'footnoteDefinition')
  node.label = label
  node.identifier = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_1__.normalizeIdentifier)(
    this.sliceSerialize(token)
  ).toLowerCase()
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitFootnoteDefinition(token) {
  this.exit(token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterFootnoteCall(token) {
  this.enter({type: 'footnoteReference', identifier: '', label: ''}, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterFootnoteCallString() {
  this.buffer()
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitFootnoteCallString(token) {
  const label = this.resume()
  const node = this.stack[this.stack.length - 1]
  ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(node.type === 'footnoteReference')
  node.label = label
  node.identifier = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_1__.normalizeIdentifier)(
    this.sliceSerialize(token)
  ).toLowerCase()
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitFootnoteCall(token) {
  this.exit(token)
}

/**
 * @type {ToMarkdownHandle}
 * @param {FootnoteReference} node
 */
function footnoteReference(node, _, state, info) {
  const tracker = state.createTracker(info)
  let value = tracker.move('[^')
  const exit = state.enter('footnoteReference')
  const subexit = state.enter('reference')
  value += tracker.move(
    state.safe(state.associationId(node), {
      ...tracker.current(),
      before: value,
      after: ']'
    })
  )
  subexit()
  exit()
  value += tracker.move(']')
  return value
}

/** @type {ToMarkdownHandle} */
function footnoteReferencePeek() {
  return '['
}

/**
 * @type {ToMarkdownHandle}
 * @param {FootnoteDefinition} node
 */
function footnoteDefinition(node, _, state, info) {
  const tracker = state.createTracker(info)
  let value = tracker.move('[^')
  const exit = state.enter('footnoteDefinition')
  const subexit = state.enter('label')
  value += tracker.move(
    state.safe(state.associationId(node), {
      ...tracker.current(),
      before: value,
      after: ']'
    })
  )
  subexit()
  value += tracker.move(
    ']:' + (node.children && node.children.length > 0 ? ' ' : '')
  )
  tracker.shift(4)
  value += tracker.move(
    state.indentLines(state.containerFlow(node, tracker.current()), map)
  )
  exit()

  return value
}

/** @type {Map} */
function map(line, index, blank) {
  if (index === 0) {
    return line
  }

  return (blank ? '' : '    ') + line
}


/***/ }),

/***/ "./node_modules/mdast-util-gfm-strikethrough/lib/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-gfm-strikethrough/lib/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmStrikethroughFromMarkdown: () => (/* binding */ gfmStrikethroughFromMarkdown),
/* harmony export */   gfmStrikethroughToMarkdown: () => (/* binding */ gfmStrikethroughToMarkdown)
/* harmony export */ });
/**
 * @typedef {import('mdast').Delete} Delete
 *
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {import('mdast-util-to-markdown').ConstructName} ConstructName
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 */

/**
 * List of constructs that occur in phrasing (paragraphs, headings), but cannot
 * contain strikethrough.
 * So they sort of cancel each other out.
 * Note: could use a better name.
 *
 * Note: keep in sync with: <https://github.com/syntax-tree/mdast-util-to-markdown/blob/8ce8dbf/lib/unsafe.js#L14>
 *
 * @type {Array<ConstructName>}
 */
const constructsWithoutStrikethrough = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe'
]

handleDelete.peek = peekDelete

/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM
 * strikethrough in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
 */
function gfmStrikethroughFromMarkdown() {
  return {
    canContainEols: ['delete'],
    enter: {strikethrough: enterStrikethrough},
    exit: {strikethrough: exitStrikethrough}
  }
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM
 * strikethrough in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM strikethrough.
 */
function gfmStrikethroughToMarkdown() {
  return {
    unsafe: [
      {
        character: '~',
        inConstruct: 'phrasing',
        notInConstruct: constructsWithoutStrikethrough
      }
    ],
    handlers: {delete: handleDelete}
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterStrikethrough(token) {
  this.enter({type: 'delete', children: []}, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitStrikethrough(token) {
  this.exit(token)
}

/**
 * @type {ToMarkdownHandle}
 * @param {Delete} node
 */
function handleDelete(node, _, state, info) {
  const tracker = state.createTracker(info)
  const exit = state.enter('strikethrough')
  let value = tracker.move('~~')
  value += state.containerPhrasing(node, {
    ...tracker.current(),
    before: value,
    after: '~'
  })
  value += tracker.move('~~')
  exit()
  return value
}

/** @type {ToMarkdownHandle} */
function peekDelete() {
  return '~'
}


/***/ }),

/***/ "./node_modules/mdast-util-gfm-table/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/mdast-util-gfm-table/lib/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTableFromMarkdown: () => (/* binding */ gfmTableFromMarkdown),
/* harmony export */   gfmTableToMarkdown: () => (/* binding */ gfmTableToMarkdown)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var markdown_table__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! markdown-table */ "./node_modules/markdown-table/index.js");
/* harmony import */ var mdast_util_to_markdown__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mdast-util-to-markdown */ "./node_modules/mdast-util-to-markdown/lib/handle/index.js");
/**
 * @typedef {import('mdast').InlineCode} InlineCode
 * @typedef {import('mdast').Table} Table
 * @typedef {import('mdast').TableCell} TableCell
 * @typedef {import('mdast').TableRow} TableRow
 *
 * @typedef {import('markdown-table').Options} MarkdownTableOptions
 *
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').State} State
 * @typedef {import('mdast-util-to-markdown').Info} Info
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {boolean | null | undefined} [tableCellPadding=true]
 *   Whether to add a space of padding between delimiters and cells (default:
 *   `true`).
 * @property {boolean | null | undefined} [tablePipeAlign=true]
 *   Whether to align the delimiters (default: `true`).
 * @property {MarkdownTableOptions['stringLength'] | null | undefined} [stringLength]
 *   Function to detect the length of table cell content, used when aligning
 *   the delimiters between cells (optional).
 */





/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM tables in
 * markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown` to enable GFM tables.
 */
function gfmTableFromMarkdown() {
  return {
    enter: {
      table: enterTable,
      tableData: enterCell,
      tableHeader: enterCell,
      tableRow: enterRow
    },
    exit: {
      codeText: exitCodeText,
      table: exitTable,
      tableData: exit,
      tableHeader: exit,
      tableRow: exit
    }
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterTable(token) {
  const align = token._align
  ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(align, 'expected `_align` on table')
  this.enter(
    {
      type: 'table',
      align: align.map(function (d) {
        return d === 'none' ? null : d
      }),
      children: []
    },
    token
  )
  this.data.inTable = true
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitTable(token) {
  this.exit(token)
  this.data.inTable = undefined
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterRow(token) {
  this.enter({type: 'tableRow', children: []}, token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exit(token) {
  this.exit(token)
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterCell(token) {
  this.enter({type: 'tableCell', children: []}, token)
}

// Overwrite the default code text data handler to unescape escaped pipes when
// they are in tables.
/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitCodeText(token) {
  let value = this.resume()

  if (this.data.inTable) {
    value = value.replace(/\\([\\|])/g, replace)
  }

  const node = this.stack[this.stack.length - 1]
  ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(node.type === 'inlineCode')
  node.value = value
  this.exit(token)
}

/**
 * @param {string} $0
 * @param {string} $1
 * @returns {string}
 */
function replace($0, $1) {
  // Pipes work, backslashes don’t (but can’t escape pipes).
  return $1 === '|' ? $1 : $0
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM tables in
 * markdown.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration.
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM tables.
 */
function gfmTableToMarkdown(options) {
  const settings = options || {}
  const padding = settings.tableCellPadding
  const alignDelimiters = settings.tablePipeAlign
  const stringLength = settings.stringLength
  const around = padding ? ' ' : '|'

  return {
    unsafe: [
      {character: '\r', inConstruct: 'tableCell'},
      {character: '\n', inConstruct: 'tableCell'},
      // A pipe, when followed by a tab or space (padding), or a dash or colon
      // (unpadded delimiter row), could result in a table.
      {atBreak: true, character: '|', after: '[\t :-]'},
      // A pipe in a cell must be encoded.
      {character: '|', inConstruct: 'tableCell'},
      // A colon must be followed by a dash, in which case it could start a
      // delimiter row.
      {atBreak: true, character: ':', after: '-'},
      // A delimiter row can also start with a dash, when followed by more
      // dashes, a colon, or a pipe.
      // This is a stricter version than the built in check for lists, thematic
      // breaks, and setex heading underlines though:
      // <https://github.com/syntax-tree/mdast-util-to-markdown/blob/51a2038/lib/unsafe.js#L57>
      {atBreak: true, character: '-', after: '[:|-]'}
    ],
    handlers: {
      inlineCode: inlineCodeWithTable,
      table: handleTable,
      tableCell: handleTableCell,
      tableRow: handleTableRow
    }
  }

  /**
   * @type {ToMarkdownHandle}
   * @param {Table} node
   */
  function handleTable(node, _, state, info) {
    return serializeData(handleTableAsData(node, state, info), node.align)
  }

  /**
   * This function isn’t really used normally, because we handle rows at the
   * table level.
   * But, if someone passes in a table row, this ensures we make somewhat sense.
   *
   * @type {ToMarkdownHandle}
   * @param {TableRow} node
   */
  function handleTableRow(node, _, state, info) {
    const row = handleTableRowAsData(node, state, info)
    const value = serializeData([row])
    // `markdown-table` will always add an align row
    return value.slice(0, value.indexOf('\n'))
  }

  /**
   * @type {ToMarkdownHandle}
   * @param {TableCell} node
   */
  function handleTableCell(node, _, state, info) {
    const exit = state.enter('tableCell')
    const subexit = state.enter('phrasing')
    const value = state.containerPhrasing(node, {
      ...info,
      before: around,
      after: around
    })
    subexit()
    exit()
    return value
  }

  /**
   * @param {Array<Array<string>>} matrix
   * @param {Array<string | null | undefined> | null | undefined} [align]
   */
  function serializeData(matrix, align) {
    return (0,markdown_table__WEBPACK_IMPORTED_MODULE_1__.markdownTable)(matrix, {
      align,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength
    })
  }

  /**
   * @param {Table} node
   * @param {State} state
   * @param {Info} info
   */
  function handleTableAsData(node, state, info) {
    const children = node.children
    let index = -1
    /** @type {Array<Array<string>>} */
    const result = []
    const subexit = state.enter('table')

    while (++index < children.length) {
      result[index] = handleTableRowAsData(children[index], state, info)
    }

    subexit()

    return result
  }

  /**
   * @param {TableRow} node
   * @param {State} state
   * @param {Info} info
   */
  function handleTableRowAsData(node, state, info) {
    const children = node.children
    let index = -1
    /** @type {Array<string>} */
    const result = []
    const subexit = state.enter('tableRow')

    while (++index < children.length) {
      // Note: the positional info as used here is incorrect.
      // Making it correct would be impossible due to aligning cells?
      // And it would need copy/pasting `markdown-table` into this project.
      result[index] = handleTableCell(children[index], node, state, info)
    }

    subexit()

    return result
  }

  /**
   * @type {ToMarkdownHandle}
   * @param {InlineCode} node
   */
  function inlineCodeWithTable(node, parent, state) {
    let value = mdast_util_to_markdown__WEBPACK_IMPORTED_MODULE_2__.handle.inlineCode(node, parent, state)

    if (state.stack.includes('tableCell')) {
      value = value.replace(/\|/g, '\\$&')
    }

    return value
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-gfm-task-list-item/lib/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/mdast-util-gfm-task-list-item/lib/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTaskListItemFromMarkdown: () => (/* binding */ gfmTaskListItemFromMarkdown),
/* harmony export */   gfmTaskListItemToMarkdown: () => (/* binding */ gfmTaskListItemToMarkdown)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var mdast_util_to_markdown__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mdast-util-to-markdown */ "./node_modules/mdast-util-to-markdown/lib/handle/index.js");
/**
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 */




/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM task
 * list items in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-from-markdown` to enable GFM task list items.
 */
function gfmTaskListItemFromMarkdown() {
  return {
    exit: {
      taskListCheckValueChecked: exitCheck,
      taskListCheckValueUnchecked: exitCheck,
      paragraph: exitParagraphWithTaskListItem
    }
  }
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM task list
 * items in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM task list items.
 */
function gfmTaskListItemToMarkdown() {
  return {
    unsafe: [{atBreak: true, character: '-', after: '[:|-]'}],
    handlers: {listItem: listItemWithTaskListItem}
  }
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitCheck(token) {
  // We’re always in a paragraph, in a list item.
  const node = this.stack[this.stack.length - 2]
  ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(node.type === 'listItem')
  node.checked = token.type === 'taskListCheckValueChecked'
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitParagraphWithTaskListItem(token) {
  const parent = this.stack[this.stack.length - 2]

  if (
    parent &&
    parent.type === 'listItem' &&
    typeof parent.checked === 'boolean'
  ) {
    const node = this.stack[this.stack.length - 1]
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(node.type === 'paragraph')
    const head = node.children[0]

    if (head && head.type === 'text') {
      const siblings = parent.children
      let index = -1
      /** @type {Paragraph | undefined} */
      let firstParaghraph

      while (++index < siblings.length) {
        const sibling = siblings[index]
        if (sibling.type === 'paragraph') {
          firstParaghraph = sibling
          break
        }
      }

      if (firstParaghraph === node) {
        // Must start with a space or a tab.
        head.value = head.value.slice(1)

        if (head.value.length === 0) {
          node.children.shift()
        } else if (
          node.position &&
          head.position &&
          typeof head.position.start.offset === 'number'
        ) {
          head.position.start.column++
          head.position.start.offset++
          node.position.start = Object.assign({}, head.position.start)
        }
      }
    }
  }

  this.exit(token)
}

/**
 * @type {ToMarkdownHandle}
 * @param {ListItem} node
 */
function listItemWithTaskListItem(node, parent, state, info) {
  const head = node.children[0]
  const checkable =
    typeof node.checked === 'boolean' && head && head.type === 'paragraph'
  const checkbox = '[' + (node.checked ? 'x' : ' ') + '] '
  const tracker = state.createTracker(info)

  if (checkable) {
    tracker.move(checkbox)
  }

  let value = mdast_util_to_markdown__WEBPACK_IMPORTED_MODULE_1__.handle.listItem(node, parent, state, {
    ...info,
    ...tracker.current()
  })

  if (checkable) {
    value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check)
  }

  return value

  /**
   * @param {string} $0
   * @returns {string}
   */
  function check($0) {
    return $0 + checkbox
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-gfm/lib/index.js":
/*!**************************************************!*\
  !*** ./node_modules/mdast-util-gfm/lib/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmFromMarkdown: () => (/* binding */ gfmFromMarkdown),
/* harmony export */   gfmToMarkdown: () => (/* binding */ gfmToMarkdown)
/* harmony export */ });
/* harmony import */ var mdast_util_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-gfm-autolink-literal */ "./node_modules/mdast-util-gfm-autolink-literal/lib/index.js");
/* harmony import */ var mdast_util_gfm_footnote__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mdast-util-gfm-footnote */ "./node_modules/mdast-util-gfm-footnote/lib/index.js");
/* harmony import */ var mdast_util_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mdast-util-gfm-strikethrough */ "./node_modules/mdast-util-gfm-strikethrough/lib/index.js");
/* harmony import */ var mdast_util_gfm_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mdast-util-gfm-table */ "./node_modules/mdast-util-gfm-table/lib/index.js");
/* harmony import */ var mdast_util_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! mdast-util-gfm-task-list-item */ "./node_modules/mdast-util-gfm-task-list-item/lib/index.js");
/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 */

/**
 * @typedef {import('mdast-util-gfm-table').Options} Options
 *   Configuration.
 */







/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
 * literals, footnotes, strikethrough, tables, tasklists).
 *
 * @returns {Array<FromMarkdownExtension>}
 *   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
 *   footnotes, strikethrough, tables, tasklists).
 */
function gfmFromMarkdown() {
  return [
    (0,mdast_util_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_0__.gfmAutolinkLiteralFromMarkdown)(),
    (0,mdast_util_gfm_footnote__WEBPACK_IMPORTED_MODULE_1__.gfmFootnoteFromMarkdown)(),
    (0,mdast_util_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_2__.gfmStrikethroughFromMarkdown)(),
    (0,mdast_util_gfm_table__WEBPACK_IMPORTED_MODULE_3__.gfmTableFromMarkdown)(),
    (0,mdast_util_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_4__.gfmTaskListItemFromMarkdown)()
  ]
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM (autolink
 * literals, footnotes, strikethrough, tables, tasklists).
 *
 * @param {Options | null | undefined} [options]
 *   Configuration.
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM (autolink literals,
 *   footnotes, strikethrough, tables, tasklists).
 */
function gfmToMarkdown(options) {
  return {
    extensions: [
      (0,mdast_util_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_0__.gfmAutolinkLiteralToMarkdown)(),
      (0,mdast_util_gfm_footnote__WEBPACK_IMPORTED_MODULE_1__.gfmFootnoteToMarkdown)(),
      (0,mdast_util_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_2__.gfmStrikethroughToMarkdown)(),
      (0,mdast_util_gfm_table__WEBPACK_IMPORTED_MODULE_3__.gfmTableToMarkdown)(options),
      (0,mdast_util_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_4__.gfmTaskListItemToMarkdown)()
    ]
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-phrasing/lib/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/mdast-util-phrasing/lib/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   phrasing: () => (/* binding */ phrasing)
/* harmony export */ });
/* harmony import */ var unist_util_is__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-is */ "./node_modules/unist-util-is/lib/index.js");
/**
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 */



/**
 * Check if the given value is *phrasing content*.
 *
 * > 👉 **Note**: Excludes `html`, which can be both phrasing or flow.
 *
 * @param node
 *   Thing to check, typically `Node`.
 * @returns
 *   Whether `value` is phrasing content.
 */

const phrasing =
  /** @type {(node?: unknown) => node is PhrasingContent} */
  (
    (0,unist_util_is__WEBPACK_IMPORTED_MODULE_0__.convert)([
      'break',
      'delete',
      'emphasis',
      'footnote',
      'footnoteReference',
      'image',
      'imageReference',
      'inlineCode',
      'link',
      'linkReference',
      'strong',
      'text'
    ])
  )


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/configure.js":
/*!**************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/configure.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   configure: () => (/* binding */ configure)
/* harmony export */ });
/**
 * @typedef {import('./types.js').Options} Options
 * @typedef {import('./types.js').State} State
 */

const own = {}.hasOwnProperty

/**
 * @param {State} base
 * @param {Options} extension
 * @returns {State}
 */
function configure(base, extension) {
  let index = -1
  /** @type {keyof Options} */
  let key

  // First do subextensions.
  if (extension.extensions) {
    while (++index < extension.extensions.length) {
      configure(base, extension.extensions[index])
    }
  }

  for (key in extension) {
    if (own.call(extension, key)) {
      switch (key) {
        case 'extensions': {
          // Empty.
          break
        }

        /* c8 ignore next 4 */
        case 'unsafe': {
          list(base[key], extension[key])
          break
        }

        case 'join': {
          list(base[key], extension[key])
          break
        }

        case 'handlers': {
          map(base[key], extension[key])
          break
        }

        default: {
          // @ts-expect-error: matches.
          base.options[key] = extension[key]
        }
      }
    }
  }

  return base
}

/**
 * @template T
 * @param {Array<T>} left
 * @param {Array<T> | null | undefined} right
 */
function list(left, right) {
  if (right) {
    left.push(...right)
  }
}

/**
 * @template T
 * @param {Record<string, T>} left
 * @param {Record<string, T> | null | undefined} right
 */
function map(left, right) {
  if (right) {
    Object.assign(left, right)
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/blockquote.js":
/*!**********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/blockquote.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blockquote: () => (/* binding */ blockquote)
/* harmony export */ });
/**
 * @typedef {import('mdast').Blockquote} Blockquote
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').Map} Map
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {Blockquote} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function blockquote(node, _, state, info) {
  const exit = state.enter('blockquote')
  const tracker = state.createTracker(info)
  tracker.move('> ')
  tracker.shift(2)
  const value = state.indentLines(
    state.containerFlow(node, tracker.current()),
    map
  )
  exit()
  return value
}

/** @type {Map} */
function map(line, _, blank) {
  return '>' + (blank ? '' : ' ') + line
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/break.js":
/*!*****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/break.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hardBreak: () => (/* binding */ hardBreak)
/* harmony export */ });
/* harmony import */ var _util_pattern_in_scope_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/pattern-in-scope.js */ "./node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js");
/**
 * @typedef {import('mdast').Break} Break
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



/**
 * @param {Break} _
 * @param {Parents | undefined} _1
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function hardBreak(_, _1, state, info) {
  let index = -1

  while (++index < state.unsafe.length) {
    // If we can’t put eols in this construct (setext headings, tables), use a
    // space instead.
    if (
      state.unsafe[index].character === '\n' &&
      (0,_util_pattern_in_scope_js__WEBPACK_IMPORTED_MODULE_0__.patternInScope)(state.stack, state.unsafe[index])
    ) {
      return /[ \t]/.test(info.before) ? '' : ' '
    }
  }

  return '\\\n'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/code.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/code.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   code: () => (/* binding */ code)
/* harmony export */ });
/* harmony import */ var longest_streak__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! longest-streak */ "./node_modules/longest-streak/index.js");
/* harmony import */ var _util_format_code_as_indented_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/format-code-as-indented.js */ "./node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js");
/* harmony import */ var _util_check_fence_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-fence.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-fence.js");
/**
 * @typedef {import('mdast').Code} Code
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').Map} Map
 * @typedef {import('../types.js').State} State
 */





/**
 * @param {Code} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function code(node, _, state, info) {
  const marker = (0,_util_check_fence_js__WEBPACK_IMPORTED_MODULE_0__.checkFence)(state)
  const raw = node.value || ''
  const suffix = marker === '`' ? 'GraveAccent' : 'Tilde'

  if ((0,_util_format_code_as_indented_js__WEBPACK_IMPORTED_MODULE_1__.formatCodeAsIndented)(node, state)) {
    const exit = state.enter('codeIndented')
    const value = state.indentLines(raw, map)
    exit()
    return value
  }

  const tracker = state.createTracker(info)
  const sequence = marker.repeat(Math.max((0,longest_streak__WEBPACK_IMPORTED_MODULE_2__.longestStreak)(raw, marker) + 1, 3))
  const exit = state.enter('codeFenced')
  let value = tracker.move(sequence)

  if (node.lang) {
    const subexit = state.enter(`codeFencedLang${suffix}`)
    value += tracker.move(
      state.safe(node.lang, {
        before: value,
        after: ' ',
        encode: ['`'],
        ...tracker.current()
      })
    )
    subexit()
  }

  if (node.lang && node.meta) {
    const subexit = state.enter(`codeFencedMeta${suffix}`)
    value += tracker.move(' ')
    value += tracker.move(
      state.safe(node.meta, {
        before: value,
        after: '\n',
        encode: ['`'],
        ...tracker.current()
      })
    )
    subexit()
  }

  value += tracker.move('\n')

  if (raw) {
    value += tracker.move(raw + '\n')
  }

  value += tracker.move(sequence)
  exit()
  return value
}

/** @type {Map} */
function map(line, _, blank) {
  return (blank ? '' : '    ') + line
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/definition.js":
/*!**********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/definition.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   definition: () => (/* binding */ definition)
/* harmony export */ });
/* harmony import */ var _util_check_quote_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-quote.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-quote.js");
/**
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



/**
 * @param {Definition} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function definition(node, _, state, info) {
  const quote = (0,_util_check_quote_js__WEBPACK_IMPORTED_MODULE_0__.checkQuote)(state)
  const suffix = quote === '"' ? 'Quote' : 'Apostrophe'
  const exit = state.enter('definition')
  let subexit = state.enter('label')
  const tracker = state.createTracker(info)
  let value = tracker.move('[')
  value += tracker.move(
    state.safe(state.associationId(node), {
      before: value,
      after: ']',
      ...tracker.current()
    })
  )
  value += tracker.move(']: ')

  subexit()

  if (
    // If there’s no url, or…
    !node.url ||
    // If there are control characters or whitespace.
    /[\0- \u007F]/.test(node.url)
  ) {
    subexit = state.enter('destinationLiteral')
    value += tracker.move('<')
    value += tracker.move(
      state.safe(node.url, {before: value, after: '>', ...tracker.current()})
    )
    value += tracker.move('>')
  } else {
    // No whitespace, raw is prettier.
    subexit = state.enter('destinationRaw')
    value += tracker.move(
      state.safe(node.url, {
        before: value,
        after: node.title ? ' ' : '\n',
        ...tracker.current()
      })
    )
  }

  subexit()

  if (node.title) {
    subexit = state.enter(`title${suffix}`)
    value += tracker.move(' ' + quote)
    value += tracker.move(
      state.safe(node.title, {
        before: value,
        after: quote,
        ...tracker.current()
      })
    )
    value += tracker.move(quote)
    subexit()
  }

  exit()

  return value
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/emphasis.js":
/*!********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/emphasis.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   emphasis: () => (/* binding */ emphasis)
/* harmony export */ });
/* harmony import */ var _util_check_emphasis_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-emphasis.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js");
/**
 * @typedef {import('mdast').Emphasis} Emphasis
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



emphasis.peek = emphasisPeek

// To do: there are cases where emphasis cannot “form” depending on the
// previous or next character of sequences.
// There’s no way around that though, except for injecting zero-width stuff.
// Do we need to safeguard against that?
/**
 * @param {Emphasis} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function emphasis(node, _, state, info) {
  const marker = (0,_util_check_emphasis_js__WEBPACK_IMPORTED_MODULE_0__.checkEmphasis)(state)
  const exit = state.enter('emphasis')
  const tracker = state.createTracker(info)
  let value = tracker.move(marker)
  value += tracker.move(
    state.containerPhrasing(node, {
      before: value,
      after: marker,
      ...tracker.current()
    })
  )
  value += tracker.move(marker)
  exit()
  return value
}

/**
 * @param {Emphasis} _
 * @param {Parents | undefined} _1
 * @param {State} state
 * @returns {string}
 */
function emphasisPeek(_, _1, state) {
  return state.options.emphasis || '*'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/heading.js":
/*!*******************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/heading.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   heading: () => (/* binding */ heading)
/* harmony export */ });
/* harmony import */ var _util_format_heading_as_setext_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/format-heading-as-setext.js */ "./node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js");
/**
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



/**
 * @param {Heading} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function heading(node, _, state, info) {
  const rank = Math.max(Math.min(6, node.depth || 1), 1)
  const tracker = state.createTracker(info)

  if ((0,_util_format_heading_as_setext_js__WEBPACK_IMPORTED_MODULE_0__.formatHeadingAsSetext)(node, state)) {
    const exit = state.enter('headingSetext')
    const subexit = state.enter('phrasing')
    const value = state.containerPhrasing(node, {
      ...tracker.current(),
      before: '\n',
      after: '\n'
    })
    subexit()
    exit()

    return (
      value +
      '\n' +
      (rank === 1 ? '=' : '-').repeat(
        // The whole size…
        value.length -
          // Minus the position of the character after the last EOL (or
          // 0 if there is none)…
          (Math.max(value.lastIndexOf('\r'), value.lastIndexOf('\n')) + 1)
      )
    )
  }

  const sequence = '#'.repeat(rank)
  const exit = state.enter('headingAtx')
  const subexit = state.enter('phrasing')

  // Note: for proper tracking, we should reset the output positions when there
  // is no content returned, because then the space is not output.
  // Practically, in that case, there is no content, so it doesn’t matter that
  // we’ve tracked one too many characters.
  tracker.move(sequence + ' ')

  let value = state.containerPhrasing(node, {
    before: '# ',
    after: '\n',
    ...tracker.current()
  })

  if (/^[\t ]/.test(value)) {
    // To do: what effect has the character reference on tracking?
    value =
      '&#x' +
      value.charCodeAt(0).toString(16).toUpperCase() +
      ';' +
      value.slice(1)
  }

  value = value ? sequence + ' ' + value : sequence

  if (state.options.closeAtx) {
    value += ' ' + sequence
  }

  subexit()
  exit()

  return value
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/html.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/html.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   html: () => (/* binding */ html)
/* harmony export */ });
/**
 * @typedef {import('mdast').Html} Html
 */

html.peek = htmlPeek

/**
 * @param {Html} node
 * @returns {string}
 */
function html(node) {
  return node.value || ''
}

/**
 * @returns {string}
 */
function htmlPeek() {
  return '<'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/image-reference.js":
/*!***************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/image-reference.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   imageReference: () => (/* binding */ imageReference)
/* harmony export */ });
/**
 * @typedef {import('mdast').ImageReference} ImageReference
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */

imageReference.peek = imageReferencePeek

/**
 * @param {ImageReference} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function imageReference(node, _, state, info) {
  const type = node.referenceType
  const exit = state.enter('imageReference')
  let subexit = state.enter('label')
  const tracker = state.createTracker(info)
  let value = tracker.move('![')
  const alt = state.safe(node.alt, {
    before: value,
    after: ']',
    ...tracker.current()
  })
  value += tracker.move(alt + '][')

  subexit()
  // Hide the fact that we’re in phrasing, because escapes don’t work.
  const stack = state.stack
  state.stack = []
  subexit = state.enter('reference')
  // Note: for proper tracking, we should reset the output positions when we end
  // up making a `shortcut` reference, because then there is no brace output.
  // Practically, in that case, there is no content, so it doesn’t matter that
  // we’ve tracked one too many characters.
  const reference = state.safe(state.associationId(node), {
    before: value,
    after: ']',
    ...tracker.current()
  })
  subexit()
  state.stack = stack
  exit()

  if (type === 'full' || !alt || alt !== reference) {
    value += tracker.move(reference + ']')
  } else if (type === 'shortcut') {
    // Remove the unwanted `[`.
    value = value.slice(0, -1)
  } else {
    value += tracker.move(']')
  }

  return value
}

/**
 * @returns {string}
 */
function imageReferencePeek() {
  return '!'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/image.js":
/*!*****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/image.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   image: () => (/* binding */ image)
/* harmony export */ });
/* harmony import */ var _util_check_quote_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-quote.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-quote.js");
/**
 * @typedef {import('mdast').Image} Image
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



image.peek = imagePeek

/**
 * @param {Image} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function image(node, _, state, info) {
  const quote = (0,_util_check_quote_js__WEBPACK_IMPORTED_MODULE_0__.checkQuote)(state)
  const suffix = quote === '"' ? 'Quote' : 'Apostrophe'
  const exit = state.enter('image')
  let subexit = state.enter('label')
  const tracker = state.createTracker(info)
  let value = tracker.move('![')
  value += tracker.move(
    state.safe(node.alt, {before: value, after: ']', ...tracker.current()})
  )
  value += tracker.move('](')

  subexit()

  if (
    // If there’s no url but there is a title…
    (!node.url && node.title) ||
    // If there are control characters or whitespace.
    /[\0- \u007F]/.test(node.url)
  ) {
    subexit = state.enter('destinationLiteral')
    value += tracker.move('<')
    value += tracker.move(
      state.safe(node.url, {before: value, after: '>', ...tracker.current()})
    )
    value += tracker.move('>')
  } else {
    // No whitespace, raw is prettier.
    subexit = state.enter('destinationRaw')
    value += tracker.move(
      state.safe(node.url, {
        before: value,
        after: node.title ? ' ' : ')',
        ...tracker.current()
      })
    )
  }

  subexit()

  if (node.title) {
    subexit = state.enter(`title${suffix}`)
    value += tracker.move(' ' + quote)
    value += tracker.move(
      state.safe(node.title, {
        before: value,
        after: quote,
        ...tracker.current()
      })
    )
    value += tracker.move(quote)
    subexit()
  }

  value += tracker.move(')')
  exit()

  return value
}

/**
 * @returns {string}
 */
function imagePeek() {
  return '!'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handle: () => (/* binding */ handle)
/* harmony export */ });
/* harmony import */ var _blockquote_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./blockquote.js */ "./node_modules/mdast-util-to-markdown/lib/handle/blockquote.js");
/* harmony import */ var _break_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./break.js */ "./node_modules/mdast-util-to-markdown/lib/handle/break.js");
/* harmony import */ var _code_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./code.js */ "./node_modules/mdast-util-to-markdown/lib/handle/code.js");
/* harmony import */ var _definition_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./definition.js */ "./node_modules/mdast-util-to-markdown/lib/handle/definition.js");
/* harmony import */ var _emphasis_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./emphasis.js */ "./node_modules/mdast-util-to-markdown/lib/handle/emphasis.js");
/* harmony import */ var _heading_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./heading.js */ "./node_modules/mdast-util-to-markdown/lib/handle/heading.js");
/* harmony import */ var _html_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./html.js */ "./node_modules/mdast-util-to-markdown/lib/handle/html.js");
/* harmony import */ var _image_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./image.js */ "./node_modules/mdast-util-to-markdown/lib/handle/image.js");
/* harmony import */ var _image_reference_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./image-reference.js */ "./node_modules/mdast-util-to-markdown/lib/handle/image-reference.js");
/* harmony import */ var _inline_code_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./inline-code.js */ "./node_modules/mdast-util-to-markdown/lib/handle/inline-code.js");
/* harmony import */ var _link_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./link.js */ "./node_modules/mdast-util-to-markdown/lib/handle/link.js");
/* harmony import */ var _link_reference_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./link-reference.js */ "./node_modules/mdast-util-to-markdown/lib/handle/link-reference.js");
/* harmony import */ var _list_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./list.js */ "./node_modules/mdast-util-to-markdown/lib/handle/list.js");
/* harmony import */ var _list_item_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./list-item.js */ "./node_modules/mdast-util-to-markdown/lib/handle/list-item.js");
/* harmony import */ var _paragraph_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./paragraph.js */ "./node_modules/mdast-util-to-markdown/lib/handle/paragraph.js");
/* harmony import */ var _root_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./root.js */ "./node_modules/mdast-util-to-markdown/lib/handle/root.js");
/* harmony import */ var _strong_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./strong.js */ "./node_modules/mdast-util-to-markdown/lib/handle/strong.js");
/* harmony import */ var _text_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./text.js */ "./node_modules/mdast-util-to-markdown/lib/handle/text.js");
/* harmony import */ var _thematic_break_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./thematic-break.js */ "./node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js");




















/**
 * Default (CommonMark) handlers.
 */
const handle = {
  blockquote: _blockquote_js__WEBPACK_IMPORTED_MODULE_0__.blockquote,
  break: _break_js__WEBPACK_IMPORTED_MODULE_1__.hardBreak,
  code: _code_js__WEBPACK_IMPORTED_MODULE_2__.code,
  definition: _definition_js__WEBPACK_IMPORTED_MODULE_3__.definition,
  emphasis: _emphasis_js__WEBPACK_IMPORTED_MODULE_4__.emphasis,
  hardBreak: _break_js__WEBPACK_IMPORTED_MODULE_1__.hardBreak,
  heading: _heading_js__WEBPACK_IMPORTED_MODULE_5__.heading,
  html: _html_js__WEBPACK_IMPORTED_MODULE_6__.html,
  image: _image_js__WEBPACK_IMPORTED_MODULE_7__.image,
  imageReference: _image_reference_js__WEBPACK_IMPORTED_MODULE_8__.imageReference,
  inlineCode: _inline_code_js__WEBPACK_IMPORTED_MODULE_9__.inlineCode,
  link: _link_js__WEBPACK_IMPORTED_MODULE_10__.link,
  linkReference: _link_reference_js__WEBPACK_IMPORTED_MODULE_11__.linkReference,
  list: _list_js__WEBPACK_IMPORTED_MODULE_12__.list,
  listItem: _list_item_js__WEBPACK_IMPORTED_MODULE_13__.listItem,
  paragraph: _paragraph_js__WEBPACK_IMPORTED_MODULE_14__.paragraph,
  root: _root_js__WEBPACK_IMPORTED_MODULE_15__.root,
  strong: _strong_js__WEBPACK_IMPORTED_MODULE_16__.strong,
  text: _text_js__WEBPACK_IMPORTED_MODULE_17__.text,
  thematicBreak: _thematic_break_js__WEBPACK_IMPORTED_MODULE_18__.thematicBreak
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/inline-code.js":
/*!***********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/inline-code.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inlineCode: () => (/* binding */ inlineCode)
/* harmony export */ });
/**
 * @typedef {import('mdast').InlineCode} InlineCode
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').State} State
 */

inlineCode.peek = inlineCodePeek

/**
 * @param {InlineCode} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @returns {string}
 */
function inlineCode(node, _, state) {
  let value = node.value || ''
  let sequence = '`'
  let index = -1

  // If there is a single grave accent on its own in the code, use a fence of
  // two.
  // If there are two in a row, use one.
  while (new RegExp('(^|[^`])' + sequence + '([^`]|$)').test(value)) {
    sequence += '`'
  }

  // If this is not just spaces or eols (tabs don’t count), and either the
  // first or last character are a space, eol, or tick, then pad with spaces.
  if (
    /[^ \r\n]/.test(value) &&
    ((/^[ \r\n]/.test(value) && /[ \r\n]$/.test(value)) || /^`|`$/.test(value))
  ) {
    value = ' ' + value + ' '
  }

  // We have a potential problem: certain characters after eols could result in
  // blocks being seen.
  // For example, if someone injected the string `'\n# b'`, then that would
  // result in an ATX heading.
  // We can’t escape characters in `inlineCode`, but because eols are
  // transformed to spaces when going from markdown to HTML anyway, we can swap
  // them out.
  while (++index < state.unsafe.length) {
    const pattern = state.unsafe[index]
    const expression = state.compilePattern(pattern)
    /** @type {RegExpExecArray | null} */
    let match

    // Only look for `atBreak`s.
    // Btw: note that `atBreak` patterns will always start the regex at LF or
    // CR.
    if (!pattern.atBreak) continue

    while ((match = expression.exec(value))) {
      let position = match.index

      // Support CRLF (patterns only look for one of the characters).
      if (
        value.charCodeAt(position) === 10 /* `\n` */ &&
        value.charCodeAt(position - 1) === 13 /* `\r` */
      ) {
        position--
      }

      value = value.slice(0, position) + ' ' + value.slice(match.index + 1)
    }
  }

  return sequence + value + sequence
}

/**
 * @returns {string}
 */
function inlineCodePeek() {
  return '`'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/link-reference.js":
/*!**************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/link-reference.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   linkReference: () => (/* binding */ linkReference)
/* harmony export */ });
/**
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */

linkReference.peek = linkReferencePeek

/**
 * @param {LinkReference} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function linkReference(node, _, state, info) {
  const type = node.referenceType
  const exit = state.enter('linkReference')
  let subexit = state.enter('label')
  const tracker = state.createTracker(info)
  let value = tracker.move('[')
  const text = state.containerPhrasing(node, {
    before: value,
    after: ']',
    ...tracker.current()
  })
  value += tracker.move(text + '][')

  subexit()
  // Hide the fact that we’re in phrasing, because escapes don’t work.
  const stack = state.stack
  state.stack = []
  subexit = state.enter('reference')
  // Note: for proper tracking, we should reset the output positions when we end
  // up making a `shortcut` reference, because then there is no brace output.
  // Practically, in that case, there is no content, so it doesn’t matter that
  // we’ve tracked one too many characters.
  const reference = state.safe(state.associationId(node), {
    before: value,
    after: ']',
    ...tracker.current()
  })
  subexit()
  state.stack = stack
  exit()

  if (type === 'full' || !text || text !== reference) {
    value += tracker.move(reference + ']')
  } else if (type === 'shortcut') {
    // Remove the unwanted `[`.
    value = value.slice(0, -1)
  } else {
    value += tracker.move(']')
  }

  return value
}

/**
 * @returns {string}
 */
function linkReferencePeek() {
  return '['
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/link.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/link.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   link: () => (/* binding */ link)
/* harmony export */ });
/* harmony import */ var _util_check_quote_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-quote.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-quote.js");
/* harmony import */ var _util_format_link_as_autolink_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/format-link-as-autolink.js */ "./node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js");
/**
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Exit} Exit
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */




link.peek = linkPeek

/**
 * @param {Link} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function link(node, _, state, info) {
  const quote = (0,_util_check_quote_js__WEBPACK_IMPORTED_MODULE_0__.checkQuote)(state)
  const suffix = quote === '"' ? 'Quote' : 'Apostrophe'
  const tracker = state.createTracker(info)
  /** @type {Exit} */
  let exit
  /** @type {Exit} */
  let subexit

  if ((0,_util_format_link_as_autolink_js__WEBPACK_IMPORTED_MODULE_1__.formatLinkAsAutolink)(node, state)) {
    // Hide the fact that we’re in phrasing, because escapes don’t work.
    const stack = state.stack
    state.stack = []
    exit = state.enter('autolink')
    let value = tracker.move('<')
    value += tracker.move(
      state.containerPhrasing(node, {
        before: value,
        after: '>',
        ...tracker.current()
      })
    )
    value += tracker.move('>')
    exit()
    state.stack = stack
    return value
  }

  exit = state.enter('link')
  subexit = state.enter('label')
  let value = tracker.move('[')
  value += tracker.move(
    state.containerPhrasing(node, {
      before: value,
      after: '](',
      ...tracker.current()
    })
  )
  value += tracker.move('](')
  subexit()

  if (
    // If there’s no url but there is a title…
    (!node.url && node.title) ||
    // If there are control characters or whitespace.
    /[\0- \u007F]/.test(node.url)
  ) {
    subexit = state.enter('destinationLiteral')
    value += tracker.move('<')
    value += tracker.move(
      state.safe(node.url, {before: value, after: '>', ...tracker.current()})
    )
    value += tracker.move('>')
  } else {
    // No whitespace, raw is prettier.
    subexit = state.enter('destinationRaw')
    value += tracker.move(
      state.safe(node.url, {
        before: value,
        after: node.title ? ' ' : ')',
        ...tracker.current()
      })
    )
  }

  subexit()

  if (node.title) {
    subexit = state.enter(`title${suffix}`)
    value += tracker.move(' ' + quote)
    value += tracker.move(
      state.safe(node.title, {
        before: value,
        after: quote,
        ...tracker.current()
      })
    )
    value += tracker.move(quote)
    subexit()
  }

  value += tracker.move(')')

  exit()
  return value
}

/**
 * @param {Link} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @returns {string}
 */
function linkPeek(node, _, state) {
  return (0,_util_format_link_as_autolink_js__WEBPACK_IMPORTED_MODULE_1__.formatLinkAsAutolink)(node, state) ? '<' : '['
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/list-item.js":
/*!*********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/list-item.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   listItem: () => (/* binding */ listItem)
/* harmony export */ });
/* harmony import */ var _util_check_bullet_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/check-bullet.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet.js");
/* harmony import */ var _util_check_list_item_indent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-list-item-indent.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js");
/**
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').Map} Map
 * @typedef {import('../types.js').State} State
 */




/**
 * @param {ListItem} node
 * @param {Parents | undefined} parent
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function listItem(node, parent, state, info) {
  const listItemIndent = (0,_util_check_list_item_indent_js__WEBPACK_IMPORTED_MODULE_0__.checkListItemIndent)(state)
  let bullet = state.bulletCurrent || (0,_util_check_bullet_js__WEBPACK_IMPORTED_MODULE_1__.checkBullet)(state)

  // Add the marker value for ordered lists.
  if (parent && parent.type === 'list' && parent.ordered) {
    bullet =
      (typeof parent.start === 'number' && parent.start > -1
        ? parent.start
        : 1) +
      (state.options.incrementListMarker === false
        ? 0
        : parent.children.indexOf(node)) +
      bullet
  }

  let size = bullet.length + 1

  if (
    listItemIndent === 'tab' ||
    (listItemIndent === 'mixed' &&
      ((parent && parent.type === 'list' && parent.spread) || node.spread))
  ) {
    size = Math.ceil(size / 4) * 4
  }

  const tracker = state.createTracker(info)
  tracker.move(bullet + ' '.repeat(size - bullet.length))
  tracker.shift(size)
  const exit = state.enter('listItem')
  const value = state.indentLines(
    state.containerFlow(node, tracker.current()),
    map
  )
  exit()

  return value

  /** @type {Map} */
  function map(line, index, blank) {
    if (index) {
      return (blank ? '' : ' '.repeat(size)) + line
    }

    return (blank ? bullet : bullet + ' '.repeat(size - bullet.length)) + line
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/list.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/list.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   list: () => (/* binding */ list)
/* harmony export */ });
/* harmony import */ var _util_check_bullet_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/check-bullet.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet.js");
/* harmony import */ var _util_check_bullet_other_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/check-bullet-other.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js");
/* harmony import */ var _util_check_bullet_ordered_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-bullet-ordered.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js");
/* harmony import */ var _util_check_rule_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/check-rule.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-rule.js");
/**
 * @typedef {import('mdast').List} List
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */






/**
 * @param {List} node
 * @param {Parents | undefined} parent
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function list(node, parent, state, info) {
  const exit = state.enter('list')
  const bulletCurrent = state.bulletCurrent
  /** @type {string} */
  let bullet = node.ordered ? (0,_util_check_bullet_ordered_js__WEBPACK_IMPORTED_MODULE_0__.checkBulletOrdered)(state) : (0,_util_check_bullet_js__WEBPACK_IMPORTED_MODULE_1__.checkBullet)(state)
  /** @type {string} */
  const bulletOther = node.ordered
    ? bullet === '.'
      ? ')'
      : '.'
    : (0,_util_check_bullet_other_js__WEBPACK_IMPORTED_MODULE_2__.checkBulletOther)(state)
  let useDifferentMarker =
    parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false

  if (!node.ordered) {
    const firstListItem = node.children ? node.children[0] : undefined

    // If there’s an empty first list item directly in two list items,
    // we have to use a different bullet:
    //
    // ```markdown
    // * - *
    // ```
    //
    // …because otherwise it would become one big thematic break.
    if (
      // Bullet could be used as a thematic break marker:
      (bullet === '*' || bullet === '-') &&
      // Empty first list item:
      firstListItem &&
      (!firstListItem.children || !firstListItem.children[0]) &&
      // Directly in two other list items:
      state.stack[state.stack.length - 1] === 'list' &&
      state.stack[state.stack.length - 2] === 'listItem' &&
      state.stack[state.stack.length - 3] === 'list' &&
      state.stack[state.stack.length - 4] === 'listItem' &&
      // That are each the first child.
      state.indexStack[state.indexStack.length - 1] === 0 &&
      state.indexStack[state.indexStack.length - 2] === 0 &&
      state.indexStack[state.indexStack.length - 3] === 0
    ) {
      useDifferentMarker = true
    }

    // If there’s a thematic break at the start of the first list item,
    // we have to use a different bullet:
    //
    // ```markdown
    // * ---
    // ```
    //
    // …because otherwise it would become one big thematic break.
    if ((0,_util_check_rule_js__WEBPACK_IMPORTED_MODULE_3__.checkRule)(state) === bullet && firstListItem) {
      let index = -1

      while (++index < node.children.length) {
        const item = node.children[index]

        if (
          item &&
          item.type === 'listItem' &&
          item.children &&
          item.children[0] &&
          item.children[0].type === 'thematicBreak'
        ) {
          useDifferentMarker = true
          break
        }
      }
    }
  }

  if (useDifferentMarker) {
    bullet = bulletOther
  }

  state.bulletCurrent = bullet
  const value = state.containerFlow(node, info)
  state.bulletLastUsed = bullet
  state.bulletCurrent = bulletCurrent
  exit()
  return value
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/paragraph.js":
/*!*********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/paragraph.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   paragraph: () => (/* binding */ paragraph)
/* harmony export */ });
/**
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {Paragraph} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function paragraph(node, _, state, info) {
  const exit = state.enter('paragraph')
  const subexit = state.enter('phrasing')
  const value = state.containerPhrasing(node, info)
  subexit()
  exit()
  return value
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/root.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/root.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   root: () => (/* binding */ root)
/* harmony export */ });
/* harmony import */ var mdast_util_phrasing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-phrasing */ "./node_modules/mdast-util-phrasing/lib/index.js");
/**
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



/**
 * @param {Root} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function root(node, _, state, info) {
  // Note: `html` nodes are ambiguous.
  const hasPhrasing = node.children.some(function (d) {
    return (0,mdast_util_phrasing__WEBPACK_IMPORTED_MODULE_0__.phrasing)(d)
  })
  const fn = hasPhrasing ? state.containerPhrasing : state.containerFlow
  return fn.call(state, node, info)
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/strong.js":
/*!******************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/strong.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   strong: () => (/* binding */ strong)
/* harmony export */ });
/* harmony import */ var _util_check_strong_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-strong.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-strong.js");
/**
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').Strong} Strong
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */



strong.peek = strongPeek

// To do: there are cases where emphasis cannot “form” depending on the
// previous or next character of sequences.
// There’s no way around that though, except for injecting zero-width stuff.
// Do we need to safeguard against that?
/**
 * @param {Strong} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function strong(node, _, state, info) {
  const marker = (0,_util_check_strong_js__WEBPACK_IMPORTED_MODULE_0__.checkStrong)(state)
  const exit = state.enter('strong')
  const tracker = state.createTracker(info)
  let value = tracker.move(marker + marker)
  value += tracker.move(
    state.containerPhrasing(node, {
      before: value,
      after: marker,
      ...tracker.current()
    })
  )
  value += tracker.move(marker + marker)
  exit()
  return value
}

/**
 * @param {Strong} _
 * @param {Parents | undefined} _1
 * @param {State} state
 * @returns {string}
 */
function strongPeek(_, _1, state) {
  return state.options.strong || '*'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/text.js":
/*!****************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/text.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   text: () => (/* binding */ text)
/* harmony export */ });
/**
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').Text} Text
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {Text} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
function text(node, _, state, info) {
  return state.safe(node.value, info)
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js":
/*!**************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   thematicBreak: () => (/* binding */ thematicBreak)
/* harmony export */ });
/* harmony import */ var _util_check_rule_repetition_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/check-rule-repetition.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js");
/* harmony import */ var _util_check_rule_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/check-rule.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-rule.js");
/**
 * @typedef {import('mdast').Parents} Parents
 * @typedef {import('mdast').ThematicBreak} ThematicBreak
 * @typedef {import('../types.js').State} State
 */




/**
 * @param {ThematicBreak} _
 * @param {Parents | undefined} _1
 * @param {State} state
 * @returns {string}
 */
function thematicBreak(_, _1, state) {
  const value = (
    (0,_util_check_rule_js__WEBPACK_IMPORTED_MODULE_0__.checkRule)(state) + (state.options.ruleSpaces ? ' ' : '')
  ).repeat((0,_util_check_rule_repetition_js__WEBPACK_IMPORTED_MODULE_1__.checkRuleRepetition)(state))

  return state.options.ruleSpaces ? value.slice(0, -1) : value
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toMarkdown: () => (/* binding */ toMarkdown)
/* harmony export */ });
/* harmony import */ var zwitch__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! zwitch */ "./node_modules/zwitch/index.js");
/* harmony import */ var _configure_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./configure.js */ "./node_modules/mdast-util-to-markdown/lib/configure.js");
/* harmony import */ var _handle_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./handle/index.js */ "./node_modules/mdast-util-to-markdown/lib/handle/index.js");
/* harmony import */ var _join_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./join.js */ "./node_modules/mdast-util-to-markdown/lib/join.js");
/* harmony import */ var _unsafe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./unsafe.js */ "./node_modules/mdast-util-to-markdown/lib/unsafe.js");
/* harmony import */ var _util_association_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/association.js */ "./node_modules/mdast-util-to-markdown/lib/util/association.js");
/* harmony import */ var _util_compile_pattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/compile-pattern.js */ "./node_modules/mdast-util-to-markdown/lib/util/compile-pattern.js");
/* harmony import */ var _util_container_phrasing_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./util/container-phrasing.js */ "./node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js");
/* harmony import */ var _util_container_flow_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./util/container-flow.js */ "./node_modules/mdast-util-to-markdown/lib/util/container-flow.js");
/* harmony import */ var _util_indent_lines_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/indent-lines.js */ "./node_modules/mdast-util-to-markdown/lib/util/indent-lines.js");
/* harmony import */ var _util_safe_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./util/safe.js */ "./node_modules/mdast-util-to-markdown/lib/util/safe.js");
/* harmony import */ var _util_track_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/track.js */ "./node_modules/mdast-util-to-markdown/lib/util/track.js");
/**
 * @typedef {import('mdast').Nodes} Nodes
 * @typedef {import('./types.js').Enter} Enter
 * @typedef {import('./types.js').Info} Info
 * @typedef {import('./types.js').Join} Join
 * @typedef {import('./types.js').FlowParents} FlowParents
 * @typedef {import('./types.js').Options} Options
 * @typedef {import('./types.js').PhrasingParents} PhrasingParents
 * @typedef {import('./types.js').SafeConfig} SafeConfig
 * @typedef {import('./types.js').State} State
 * @typedef {import('./types.js').TrackFields} TrackFields
 */














/**
 * Turn an mdast syntax tree into markdown.
 *
 * @param {Nodes} tree
 *   Tree to serialize.
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized markdown representing `tree`.
 */
function toMarkdown(tree, options = {}) {
  /** @type {State} */
  const state = {
    enter,
    indentLines: _util_indent_lines_js__WEBPACK_IMPORTED_MODULE_0__.indentLines,
    associationId: _util_association_js__WEBPACK_IMPORTED_MODULE_1__.association,
    containerPhrasing: containerPhrasingBound,
    containerFlow: containerFlowBound,
    createTracker: _util_track_js__WEBPACK_IMPORTED_MODULE_2__.track,
    compilePattern: _util_compile_pattern_js__WEBPACK_IMPORTED_MODULE_3__.compilePattern,
    safe: safeBound,
    stack: [],
    unsafe: [..._unsafe_js__WEBPACK_IMPORTED_MODULE_4__.unsafe],
    join: [..._join_js__WEBPACK_IMPORTED_MODULE_5__.join],
    // @ts-expect-error: GFM / frontmatter are typed in `mdast` but not defined
    // here.
    handlers: {..._handle_index_js__WEBPACK_IMPORTED_MODULE_6__.handle},
    options: {},
    indexStack: [],
    // @ts-expect-error: add `handle` in a second.
    handle: undefined
  }

  ;(0,_configure_js__WEBPACK_IMPORTED_MODULE_7__.configure)(state, options)

  if (state.options.tightDefinitions) {
    state.join.push(joinDefinition)
  }

  state.handle = (0,zwitch__WEBPACK_IMPORTED_MODULE_8__.zwitch)('type', {
    invalid,
    unknown,
    handlers: state.handlers
  })

  let result = state.handle(tree, undefined, state, {
    before: '\n',
    after: '\n',
    now: {line: 1, column: 1},
    lineShift: 0
  })

  if (
    result &&
    result.charCodeAt(result.length - 1) !== 10 &&
    result.charCodeAt(result.length - 1) !== 13
  ) {
    result += '\n'
  }

  return result

  /** @type {Enter} */
  function enter(name) {
    state.stack.push(name)
    return exit

    /**
     * @returns {undefined}
     */
    function exit() {
      state.stack.pop()
    }
  }
}

/**
 * @param {unknown} value
 * @returns {never}
 */
function invalid(value) {
  throw new Error('Cannot handle value `' + value + '`, expected node')
}

/**
 * @param {unknown} value
 * @returns {never}
 */
function unknown(value) {
  // Always a node.
  const node = /** @type {Nodes} */ (value)
  throw new Error('Cannot handle unknown node `' + node.type + '`')
}

/** @type {Join} */
function joinDefinition(left, right) {
  // No blank line between adjacent definitions.
  if (left.type === 'definition' && left.type === right.type) {
    return 0
  }
}

/**
 * Serialize the children of a parent that contains phrasing children.
 *
 * These children will be joined flush together.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {PhrasingParents} parent
 *   Parent of flow nodes.
 * @param {Info} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined together.
 */
function containerPhrasingBound(parent, info) {
  return (0,_util_container_phrasing_js__WEBPACK_IMPORTED_MODULE_9__.containerPhrasing)(parent, this, info)
}

/**
 * Serialize the children of a parent that contains flow children.
 *
 * These children will typically be joined by blank lines.
 * What they are joined by exactly is defined by `Join` functions.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {FlowParents} parent
 *   Parent of flow nodes.
 * @param {TrackFields} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined by (blank) lines.
 */
function containerFlowBound(parent, info) {
  return (0,_util_container_flow_js__WEBPACK_IMPORTED_MODULE_10__.containerFlow)(parent, this, info)
}

/**
 * Make a string safe for embedding in markdown constructs.
 *
 * In markdown, almost all punctuation characters can, in certain cases,
 * result in something.
 * Whether they do is highly subjective to where they happen and in what
 * they happen.
 *
 * To solve this, `mdast-util-to-markdown` tracks:
 *
 * * Characters before and after something;
 * * What “constructs” we are in.
 *
 * This information is then used by this function to escape or encode
 * special characters.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {string | null | undefined} value
 *   Raw value to make safe.
 * @param {SafeConfig} config
 *   Configuration.
 * @returns {string}
 *   Serialized markdown safe for embedding.
 */
function safeBound(value, config) {
  return (0,_util_safe_js__WEBPACK_IMPORTED_MODULE_11__.safe)(this, value, config)
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/join.js":
/*!*********************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/join.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   join: () => (/* binding */ join)
/* harmony export */ });
/* harmony import */ var _util_format_code_as_indented_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/format-code-as-indented.js */ "./node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js");
/* harmony import */ var _util_format_heading_as_setext_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/format-heading-as-setext.js */ "./node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js");
/**
 * @typedef {import('./types.js').Join} Join
 */




/** @type {Array<Join>} */
const join = [joinDefaults]

/** @type {Join} */
function joinDefaults(left, right, parent, state) {
  // Indented code after list or another indented code.
  if (
    right.type === 'code' &&
    (0,_util_format_code_as_indented_js__WEBPACK_IMPORTED_MODULE_0__.formatCodeAsIndented)(right, state) &&
    (left.type === 'list' ||
      (left.type === right.type && (0,_util_format_code_as_indented_js__WEBPACK_IMPORTED_MODULE_0__.formatCodeAsIndented)(left, state)))
  ) {
    return false
  }

  // Join children of a list or an item.
  // In which case, `parent` has a `spread` field.
  if ('spread' in parent && typeof parent.spread === 'boolean') {
    if (
      left.type === 'paragraph' &&
      // Two paragraphs.
      (left.type === right.type ||
        right.type === 'definition' ||
        // Paragraph followed by a setext heading.
        (right.type === 'heading' && (0,_util_format_heading_as_setext_js__WEBPACK_IMPORTED_MODULE_1__.formatHeadingAsSetext)(right, state)))
    ) {
      return
    }

    return parent.spread ? 1 : 0
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/unsafe.js":
/*!***********************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/unsafe.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   unsafe: () => (/* binding */ unsafe)
/* harmony export */ });
/**
 * @typedef {import('./types.js').ConstructName} ConstructName
 * @typedef {import('./types.js').Unsafe} Unsafe
 */

/**
 * List of constructs that occur in phrasing (paragraphs, headings), but cannot
 * contain things like attention (emphasis, strong), images, or links.
 * So they sort of cancel each other out.
 * Note: could use a better name.
 *
 * @type {Array<ConstructName>}
 */
const fullPhrasingSpans = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe'
]

/** @type {Array<Unsafe>} */
const unsafe = [
  {character: '\t', after: '[\\r\\n]', inConstruct: 'phrasing'},
  {character: '\t', before: '[\\r\\n]', inConstruct: 'phrasing'},
  {
    character: '\t',
    inConstruct: ['codeFencedLangGraveAccent', 'codeFencedLangTilde']
  },
  {
    character: '\r',
    inConstruct: [
      'codeFencedLangGraveAccent',
      'codeFencedLangTilde',
      'codeFencedMetaGraveAccent',
      'codeFencedMetaTilde',
      'destinationLiteral',
      'headingAtx'
    ]
  },
  {
    character: '\n',
    inConstruct: [
      'codeFencedLangGraveAccent',
      'codeFencedLangTilde',
      'codeFencedMetaGraveAccent',
      'codeFencedMetaTilde',
      'destinationLiteral',
      'headingAtx'
    ]
  },
  {character: ' ', after: '[\\r\\n]', inConstruct: 'phrasing'},
  {character: ' ', before: '[\\r\\n]', inConstruct: 'phrasing'},
  {
    character: ' ',
    inConstruct: ['codeFencedLangGraveAccent', 'codeFencedLangTilde']
  },
  // An exclamation mark can start an image, if it is followed by a link or
  // a link reference.
  {
    character: '!',
    after: '\\[',
    inConstruct: 'phrasing',
    notInConstruct: fullPhrasingSpans
  },
  // A quote can break out of a title.
  {character: '"', inConstruct: 'titleQuote'},
  // A number sign could start an ATX heading if it starts a line.
  {atBreak: true, character: '#'},
  {character: '#', inConstruct: 'headingAtx', after: '(?:[\r\n]|$)'},
  // Dollar sign and percentage are not used in markdown.
  // An ampersand could start a character reference.
  {character: '&', after: '[#A-Za-z]', inConstruct: 'phrasing'},
  // An apostrophe can break out of a title.
  {character: "'", inConstruct: 'titleApostrophe'},
  // A left paren could break out of a destination raw.
  {character: '(', inConstruct: 'destinationRaw'},
  // A left paren followed by `]` could make something into a link or image.
  {
    before: '\\]',
    character: '(',
    inConstruct: 'phrasing',
    notInConstruct: fullPhrasingSpans
  },
  // A right paren could start a list item or break out of a destination
  // raw.
  {atBreak: true, before: '\\d+', character: ')'},
  {character: ')', inConstruct: 'destinationRaw'},
  // An asterisk can start thematic breaks, list items, emphasis, strong.
  {atBreak: true, character: '*', after: '(?:[ \t\r\n*])'},
  {character: '*', inConstruct: 'phrasing', notInConstruct: fullPhrasingSpans},
  // A plus sign could start a list item.
  {atBreak: true, character: '+', after: '(?:[ \t\r\n])'},
  // A dash can start thematic breaks, list items, and setext heading
  // underlines.
  {atBreak: true, character: '-', after: '(?:[ \t\r\n-])'},
  // A dot could start a list item.
  {atBreak: true, before: '\\d+', character: '.', after: '(?:[ \t\r\n]|$)'},
  // Slash, colon, and semicolon are not used in markdown for constructs.
  // A less than can start html (flow or text) or an autolink.
  // HTML could start with an exclamation mark (declaration, cdata, comment),
  // slash (closing tag), question mark (instruction), or a letter (tag).
  // An autolink also starts with a letter.
  // Finally, it could break out of a destination literal.
  {atBreak: true, character: '<', after: '[!/?A-Za-z]'},
  {
    character: '<',
    after: '[!/?A-Za-z]',
    inConstruct: 'phrasing',
    notInConstruct: fullPhrasingSpans
  },
  {character: '<', inConstruct: 'destinationLiteral'},
  // An equals to can start setext heading underlines.
  {atBreak: true, character: '='},
  // A greater than can start block quotes and it can break out of a
  // destination literal.
  {atBreak: true, character: '>'},
  {character: '>', inConstruct: 'destinationLiteral'},
  // Question mark and at sign are not used in markdown for constructs.
  // A left bracket can start definitions, references, labels,
  {atBreak: true, character: '['},
  {character: '[', inConstruct: 'phrasing', notInConstruct: fullPhrasingSpans},
  {character: '[', inConstruct: ['label', 'reference']},
  // A backslash can start an escape (when followed by punctuation) or a
  // hard break (when followed by an eol).
  // Note: typical escapes are handled in `safe`!
  {character: '\\', after: '[\\r\\n]', inConstruct: 'phrasing'},
  // A right bracket can exit labels.
  {character: ']', inConstruct: ['label', 'reference']},
  // Caret is not used in markdown for constructs.
  // An underscore can start emphasis, strong, or a thematic break.
  {atBreak: true, character: '_'},
  {character: '_', inConstruct: 'phrasing', notInConstruct: fullPhrasingSpans},
  // A grave accent can start code (fenced or text), or it can break out of
  // a grave accent code fence.
  {atBreak: true, character: '`'},
  {
    character: '`',
    inConstruct: ['codeFencedLangGraveAccent', 'codeFencedMetaGraveAccent']
  },
  {character: '`', inConstruct: 'phrasing', notInConstruct: fullPhrasingSpans},
  // Left brace, vertical bar, right brace are not used in markdown for
  // constructs.
  // A tilde can start code (fenced).
  {atBreak: true, character: '~'}
]


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/association.js":
/*!*********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/association.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   association: () => (/* binding */ association)
/* harmony export */ });
/* harmony import */ var micromark_util_decode_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-decode-string */ "./node_modules/micromark-util-decode-string/dev/index.js");
/**
 * @typedef {import('../types.js').AssociationId} AssociationId
 */



/**
 * Get an identifier from an association to match it to others.
 *
 * Associations are nodes that match to something else through an ID:
 * <https://github.com/syntax-tree/mdast#association>.
 *
 * The `label` of an association is the string value: character escapes and
 * references work, and casing is intact.
 * The `identifier` is used to match one association to another:
 * controversially, character escapes and references don’t work in this
 * matching: `&copy;` does not match `©`, and `\+` does not match `+`.
 *
 * But casing is ignored (and whitespace) is trimmed and collapsed: ` A\nb`
 * matches `a b`.
 * So, we do prefer the label when figuring out how we’re going to serialize:
 * it has whitespace, casing, and we can ignore most useless character
 * escapes and all character references.
 *
 * @type {AssociationId}
 */
function association(node) {
  if (node.label || !node.identifier) {
    return node.label || ''
  }

  return (0,micromark_util_decode_string__WEBPACK_IMPORTED_MODULE_0__.decodeString)(node.identifier)
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js":
/*!******************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkBulletOrdered: () => (/* binding */ checkBulletOrdered)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['bulletOrdered'], null | undefined>}
 */
function checkBulletOrdered(state) {
  const marker = state.options.bulletOrdered || '.'

  if (marker !== '.' && marker !== ')') {
    throw new Error(
      'Cannot serialize items with `' +
        marker +
        '` for `options.bulletOrdered`, expected `.` or `)`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js":
/*!****************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkBulletOther: () => (/* binding */ checkBulletOther)
/* harmony export */ });
/* harmony import */ var _check_bullet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./check-bullet.js */ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet.js");
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */



/**
 * @param {State} state
 * @returns {Exclude<Options['bullet'], null | undefined>}
 */
function checkBulletOther(state) {
  const bullet = (0,_check_bullet_js__WEBPACK_IMPORTED_MODULE_0__.checkBullet)(state)
  const bulletOther = state.options.bulletOther

  if (!bulletOther) {
    return bullet === '*' ? '-' : '*'
  }

  if (bulletOther !== '*' && bulletOther !== '+' && bulletOther !== '-') {
    throw new Error(
      'Cannot serialize items with `' +
        bulletOther +
        '` for `options.bulletOther`, expected `*`, `+`, or `-`'
    )
  }

  if (bulletOther === bullet) {
    throw new Error(
      'Expected `bullet` (`' +
        bullet +
        '`) and `bulletOther` (`' +
        bulletOther +
        '`) to be different'
    )
  }

  return bulletOther
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-bullet.js":
/*!**********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-bullet.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkBullet: () => (/* binding */ checkBullet)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['bullet'], null | undefined>}
 */
function checkBullet(state) {
  const marker = state.options.bullet || '*'

  if (marker !== '*' && marker !== '+' && marker !== '-') {
    throw new Error(
      'Cannot serialize items with `' +
        marker +
        '` for `options.bullet`, expected `*`, `+`, or `-`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js":
/*!************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkEmphasis: () => (/* binding */ checkEmphasis)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['emphasis'], null | undefined>}
 */
function checkEmphasis(state) {
  const marker = state.options.emphasis || '*'

  if (marker !== '*' && marker !== '_') {
    throw new Error(
      'Cannot serialize emphasis with `' +
        marker +
        '` for `options.emphasis`, expected `*`, or `_`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-fence.js":
/*!*********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-fence.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkFence: () => (/* binding */ checkFence)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['fence'], null | undefined>}
 */
function checkFence(state) {
  const marker = state.options.fence || '`'

  if (marker !== '`' && marker !== '~') {
    throw new Error(
      'Cannot serialize code with `' +
        marker +
        '` for `options.fence`, expected `` ` `` or `~`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js":
/*!********************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkListItemIndent: () => (/* binding */ checkListItemIndent)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['listItemIndent'], null | undefined>}
 */
function checkListItemIndent(state) {
  const style = state.options.listItemIndent || 'one'

  if (style !== 'tab' && style !== 'one' && style !== 'mixed') {
    throw new Error(
      'Cannot serialize items with `' +
        style +
        '` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`'
    )
  }

  return style
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-quote.js":
/*!*********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-quote.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkQuote: () => (/* binding */ checkQuote)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['quote'], null | undefined>}
 */
function checkQuote(state) {
  const marker = state.options.quote || '"'

  if (marker !== '"' && marker !== "'") {
    throw new Error(
      'Cannot serialize title with `' +
        marker +
        '` for `options.quote`, expected `"`, or `\'`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkRuleRepetition: () => (/* binding */ checkRuleRepetition)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['ruleRepetition'], null | undefined>}
 */
function checkRuleRepetition(state) {
  const repetition = state.options.ruleRepetition || 3

  if (repetition < 3) {
    throw new Error(
      'Cannot serialize rules with repetition `' +
        repetition +
        '` for `options.ruleRepetition`, expected `3` or more'
    )
  }

  return repetition
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-rule.js":
/*!********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-rule.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkRule: () => (/* binding */ checkRule)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['rule'], null | undefined>}
 */
function checkRule(state) {
  const marker = state.options.rule || '*'

  if (marker !== '*' && marker !== '-' && marker !== '_') {
    throw new Error(
      'Cannot serialize rules with `' +
        marker +
        '` for `options.rule`, expected `*`, `-`, or `_`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/check-strong.js":
/*!**********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/check-strong.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkStrong: () => (/* binding */ checkStrong)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Options} Options
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {State} state
 * @returns {Exclude<Options['strong'], null | undefined>}
 */
function checkStrong(state) {
  const marker = state.options.strong || '*'

  if (marker !== '*' && marker !== '_') {
    throw new Error(
      'Cannot serialize strong with `' +
        marker +
        '` for `options.strong`, expected `*`, or `_`'
    )
  }

  return marker
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/compile-pattern.js":
/*!*************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/compile-pattern.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compilePattern: () => (/* binding */ compilePattern)
/* harmony export */ });
/**
 * @typedef {import('../types.js').CompilePattern} CompilePattern
 */

/**
 * @type {CompilePattern}
 */
function compilePattern(pattern) {
  if (!pattern._compiled) {
    const before =
      (pattern.atBreak ? '[\\r\\n][\\t ]*' : '') +
      (pattern.before ? '(?:' + pattern.before + ')' : '')

    pattern._compiled = new RegExp(
      (before ? '(' + before + ')' : '') +
        (/[|\\{}()[\]^$+*?.-]/.test(pattern.character) ? '\\' : '') +
        pattern.character +
        (pattern.after ? '(?:' + pattern.after + ')' : ''),
      'g'
    )
  }

  return pattern._compiled
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/container-flow.js":
/*!************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/container-flow.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containerFlow: () => (/* binding */ containerFlow)
/* harmony export */ });
/**
 * @typedef {import('../types.js').FlowParents} FlowParents
 * @typedef {import('../types.js').FlowChildren} FlowChildren
 * @typedef {import('../types.js').State} State
 * @typedef {import('../types.js').TrackFields} TrackFields
 */

/**
 * @param {FlowParents} parent
 *   Parent of flow nodes.
 * @param {State} state
 *   Info passed around about the current state.
 * @param {TrackFields} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined by (blank) lines.
 */
function containerFlow(parent, state, info) {
  const indexStack = state.indexStack
  const children = parent.children || []
  const tracker = state.createTracker(info)
  /** @type {Array<string>} */
  const results = []
  let index = -1

  indexStack.push(-1)

  while (++index < children.length) {
    const child = children[index]

    indexStack[indexStack.length - 1] = index

    results.push(
      tracker.move(
        state.handle(child, parent, state, {
          before: '\n',
          after: '\n',
          ...tracker.current()
        })
      )
    )

    if (child.type !== 'list') {
      state.bulletLastUsed = undefined
    }

    if (index < children.length - 1) {
      results.push(
        tracker.move(between(child, children[index + 1], parent, state))
      )
    }
  }

  indexStack.pop()

  return results.join('')
}

/**
 * @param {FlowChildren} left
 * @param {FlowChildren} right
 * @param {FlowParents} parent
 * @param {State} state
 * @returns {string}
 */
function between(left, right, parent, state) {
  let index = state.join.length

  while (index--) {
    const result = state.join[index](left, right, parent, state)

    if (result === true || result === 1) {
      break
    }

    if (typeof result === 'number') {
      return '\n'.repeat(1 + result)
    }

    if (result === false) {
      return '\n\n<!---->\n\n'
    }
  }

  return '\n\n'
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js":
/*!****************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containerPhrasing: () => (/* binding */ containerPhrasing)
/* harmony export */ });
/**
 * @typedef {import('../types.js').Handle} Handle
 * @typedef {import('../types.js').Info} Info
 * @typedef {import('../types.js').PhrasingParents} PhrasingParents
 * @typedef {import('../types.js').State} State
 */

/**
 * Serialize the children of a parent that contains phrasing children.
 *
 * These children will be joined flush together.
 *
 * @param {PhrasingParents} parent
 *   Parent of flow nodes.
 * @param {State} state
 *   Info passed around about the current state.
 * @param {Info} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined together.
 */
function containerPhrasing(parent, state, info) {
  const indexStack = state.indexStack
  const children = parent.children || []
  /** @type {Array<string>} */
  const results = []
  let index = -1
  let before = info.before

  indexStack.push(-1)
  let tracker = state.createTracker(info)

  while (++index < children.length) {
    const child = children[index]
    /** @type {string} */
    let after

    indexStack[indexStack.length - 1] = index

    if (index + 1 < children.length) {
      /** @type {Handle} */
      // @ts-expect-error: hush, it’s actually a `zwitch`.
      let handle = state.handle.handlers[children[index + 1].type]
      /** @type {Handle} */
      // @ts-expect-error: hush, it’s actually a `zwitch`.
      if (handle && handle.peek) handle = handle.peek
      after = handle
        ? handle(children[index + 1], parent, state, {
            before: '',
            after: '',
            ...tracker.current()
          }).charAt(0)
        : ''
    } else {
      after = info.after
    }

    // In some cases, html (text) can be found in phrasing right after an eol.
    // When we’d serialize that, in most cases that would be seen as html
    // (flow).
    // As we can’t escape or so to prevent it from happening, we take a somewhat
    // reasonable approach: replace that eol with a space.
    // See: <https://github.com/syntax-tree/mdast-util-to-markdown/issues/15>
    if (
      results.length > 0 &&
      (before === '\r' || before === '\n') &&
      child.type === 'html'
    ) {
      results[results.length - 1] = results[results.length - 1].replace(
        /(\r?\n|\r)$/,
        ' '
      )
      before = ' '

      // To do: does this work to reset tracker?
      tracker = state.createTracker(info)
      tracker.move(results.join(''))
    }

    results.push(
      tracker.move(
        state.handle(child, parent, state, {
          ...tracker.current(),
          before,
          after
        })
      )
    )

    before = results[results.length - 1].slice(-1)
  }

  indexStack.pop()

  return results.join('')
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatCodeAsIndented: () => (/* binding */ formatCodeAsIndented)
/* harmony export */ });
/**
 * @typedef {import('mdast').Code} Code
 * @typedef {import('../types.js').State} State
 */

/**
 * @param {Code} node
 * @param {State} state
 * @returns {boolean}
 */
function formatCodeAsIndented(node, state) {
  return Boolean(
    state.options.fences === false &&
      node.value &&
      // If there’s no info…
      !node.lang &&
      // And there’s a non-whitespace character…
      /[^ \r\n]/.test(node.value) &&
      // And the value doesn’t start or end in a blank…
      !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node.value)
  )
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatHeadingAsSetext: () => (/* binding */ formatHeadingAsSetext)
/* harmony export */ });
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit/lib/index.js");
/* harmony import */ var unist_util_visit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-visit */ "./node_modules/unist-util-visit-parents/lib/index.js");
/* harmony import */ var mdast_util_to_string__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mdast-util-to-string */ "./node_modules/mdast-util-to-string/lib/index.js");
/**
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('../types.js').State} State
 */




/**
 * @param {Heading} node
 * @param {State} state
 * @returns {boolean}
 */
function formatHeadingAsSetext(node, state) {
  let literalWithBreak = false

  // Look for literals with a line break.
  // Note that this also
  ;(0,unist_util_visit__WEBPACK_IMPORTED_MODULE_0__.visit)(node, function (node) {
    if (
      ('value' in node && /\r?\n|\r/.test(node.value)) ||
      node.type === 'break'
    ) {
      literalWithBreak = true
      return unist_util_visit__WEBPACK_IMPORTED_MODULE_1__.EXIT
    }
  })

  return Boolean(
    (!node.depth || node.depth < 3) &&
      (0,mdast_util_to_string__WEBPACK_IMPORTED_MODULE_2__.toString)(node) &&
      (state.options.setext || literalWithBreak)
  )
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatLinkAsAutolink: () => (/* binding */ formatLinkAsAutolink)
/* harmony export */ });
/* harmony import */ var mdast_util_to_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-to-string */ "./node_modules/mdast-util-to-string/lib/index.js");
/**
 * @typedef {import('mdast').Link} Link
 * @typedef {import('../types.js').State} State
 */



/**
 * @param {Link} node
 * @param {State} state
 * @returns {boolean}
 */
function formatLinkAsAutolink(node, state) {
  const raw = (0,mdast_util_to_string__WEBPACK_IMPORTED_MODULE_0__.toString)(node)

  return Boolean(
    !state.options.resourceLink &&
      // If there’s a url…
      node.url &&
      // And there’s a no title…
      !node.title &&
      // And the content of `node` is a single text node…
      node.children &&
      node.children.length === 1 &&
      node.children[0].type === 'text' &&
      // And if the url is the same as the content…
      (raw === node.url || 'mailto:' + raw === node.url) &&
      // And that starts w/ a protocol…
      /^[a-z][a-z+.-]+:/i.test(node.url) &&
      // And that doesn’t contain ASCII control codes (character escapes and
      // references don’t work), space, or angle brackets…
      !/[\0- <>\u007F]/.test(node.url)
  )
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/indent-lines.js":
/*!**********************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/indent-lines.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   indentLines: () => (/* binding */ indentLines)
/* harmony export */ });
/**
 * @typedef {import('../types.js').IndentLines} IndentLines
 */

const eol = /\r?\n|\r/g

/**
 * @type {IndentLines}
 */
function indentLines(value, map) {
  /** @type {Array<string>} */
  const result = []
  let start = 0
  let line = 0
  /** @type {RegExpExecArray | null} */
  let match

  while ((match = eol.exec(value))) {
    one(value.slice(start, match.index))
    result.push(match[0])
    start = match.index + match[0].length
    line++
  }

  one(value.slice(start))

  return result.join('')

  /**
   * @param {string} value
   */
  function one(value) {
    result.push(map(value, line, !value))
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js":
/*!**************************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   patternInScope: () => (/* binding */ patternInScope)
/* harmony export */ });
/**
 * @typedef {import('../types.js').ConstructName} ConstructName
 * @typedef {import('../types.js').Unsafe} Unsafe
 */

/**
 * @param {Array<ConstructName>} stack
 * @param {Unsafe} pattern
 * @returns {boolean}
 */
function patternInScope(stack, pattern) {
  return (
    listInScope(stack, pattern.inConstruct, true) &&
    !listInScope(stack, pattern.notInConstruct, false)
  )
}

/**
 * @param {Array<ConstructName>} stack
 * @param {Unsafe['inConstruct']} list
 * @param {boolean} none
 * @returns {boolean}
 */
function listInScope(stack, list, none) {
  if (typeof list === 'string') {
    list = [list]
  }

  if (!list || list.length === 0) {
    return none
  }

  let index = -1

  while (++index < list.length) {
    if (stack.includes(list[index])) {
      return true
    }
  }

  return false
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/safe.js":
/*!**************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/safe.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   safe: () => (/* binding */ safe)
/* harmony export */ });
/* harmony import */ var _pattern_in_scope_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pattern-in-scope.js */ "./node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js");
/**
 * @typedef {import('../types.js').SafeConfig} SafeConfig
 * @typedef {import('../types.js').State} State
 */



/**
 * Make a string safe for embedding in markdown constructs.
 *
 * In markdown, almost all punctuation characters can, in certain cases,
 * result in something.
 * Whether they do is highly subjective to where they happen and in what
 * they happen.
 *
 * To solve this, `mdast-util-to-markdown` tracks:
 *
 * * Characters before and after something;
 * * What “constructs” we are in.
 *
 * This information is then used by this function to escape or encode
 * special characters.
 *
 * @param {State} state
 *   Info passed around about the current state.
 * @param {string | null | undefined} input
 *   Raw value to make safe.
 * @param {SafeConfig} config
 *   Configuration.
 * @returns {string}
 *   Serialized markdown safe for embedding.
 */
function safe(state, input, config) {
  const value = (config.before || '') + (input || '') + (config.after || '')
  /** @type {Array<number>} */
  const positions = []
  /** @type {Array<string>} */
  const result = []
  /** @type {Record<number, {before: boolean, after: boolean}>} */
  const infos = {}
  let index = -1

  while (++index < state.unsafe.length) {
    const pattern = state.unsafe[index]

    if (!(0,_pattern_in_scope_js__WEBPACK_IMPORTED_MODULE_0__.patternInScope)(state.stack, pattern)) {
      continue
    }

    const expression = state.compilePattern(pattern)
    /** @type {RegExpExecArray | null} */
    let match

    while ((match = expression.exec(value))) {
      const before = 'before' in pattern || Boolean(pattern.atBreak)
      const after = 'after' in pattern
      const position = match.index + (before ? match[1].length : 0)

      if (positions.includes(position)) {
        if (infos[position].before && !before) {
          infos[position].before = false
        }

        if (infos[position].after && !after) {
          infos[position].after = false
        }
      } else {
        positions.push(position)
        infos[position] = {before, after}
      }
    }
  }

  positions.sort(numerical)

  let start = config.before ? config.before.length : 0
  const end = value.length - (config.after ? config.after.length : 0)
  index = -1

  while (++index < positions.length) {
    const position = positions[index]

    // Character before or after matched:
    if (position < start || position >= end) {
      continue
    }

    // If this character is supposed to be escaped because it has a condition on
    // the next character, and the next character is definitly being escaped,
    // then skip this escape.
    if (
      (position + 1 < end &&
        positions[index + 1] === position + 1 &&
        infos[position].after &&
        !infos[position + 1].before &&
        !infos[position + 1].after) ||
      (positions[index - 1] === position - 1 &&
        infos[position].before &&
        !infos[position - 1].before &&
        !infos[position - 1].after)
    ) {
      continue
    }

    if (start !== position) {
      // If we have to use a character reference, an ampersand would be more
      // correct, but as backslashes only care about punctuation, either will
      // do the trick
      result.push(escapeBackslashes(value.slice(start, position), '\\'))
    }

    start = position

    if (
      /[!-/:-@[-`{-~]/.test(value.charAt(position)) &&
      (!config.encode || !config.encode.includes(value.charAt(position)))
    ) {
      // Character escape.
      result.push('\\')
    } else {
      // Character reference.
      result.push(
        '&#x' + value.charCodeAt(position).toString(16).toUpperCase() + ';'
      )
      start++
    }
  }

  result.push(escapeBackslashes(value.slice(start, end), config.after))

  return result.join('')
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function numerical(a, b) {
  return a - b
}

/**
 * @param {string} value
 * @param {string} after
 * @returns {string}
 */
function escapeBackslashes(value, after) {
  const expression = /\\(?=[!-/:-@[-`{-~])/g
  /** @type {Array<number>} */
  const positions = []
  /** @type {Array<string>} */
  const results = []
  const whole = value + after
  let index = -1
  let start = 0
  /** @type {RegExpExecArray | null} */
  let match

  while ((match = expression.exec(whole))) {
    positions.push(match.index)
  }

  while (++index < positions.length) {
    if (start !== positions[index]) {
      results.push(value.slice(start, positions[index]))
    }

    results.push('\\')
    start = positions[index]
  }

  results.push(value.slice(start))

  return results.join('')
}


/***/ }),

/***/ "./node_modules/mdast-util-to-markdown/lib/util/track.js":
/*!***************************************************************!*\
  !*** ./node_modules/mdast-util-to-markdown/lib/util/track.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   track: () => (/* binding */ track)
/* harmony export */ });
/**
 * @typedef {import('../types.js').CreateTracker} CreateTracker
 * @typedef {import('../types.js').TrackCurrent} TrackCurrent
 * @typedef {import('../types.js').TrackMove} TrackMove
 * @typedef {import('../types.js').TrackShift} TrackShift
 */

/**
 * Track positional info in the output.
 *
 * @type {CreateTracker}
 */
function track(config) {
  // Defaults are used to prevent crashes when older utilities somehow activate
  // this code.
  /* c8 ignore next 5 */
  const options = config || {}
  const now = options.now || {}
  let lineShift = options.lineShift || 0
  let line = now.line || 1
  let column = now.column || 1

  return {move, current, shift}

  /**
   * Get the current tracked info.
   *
   * @type {TrackCurrent}
   */
  function current() {
    return {now: {line, column}, lineShift}
  }

  /**
   * Define an increased line shift (the typical indent for lines).
   *
   * @type {TrackShift}
   */
  function shift(value) {
    lineShift += value
  }

  /**
   * Move past some generated markdown.
   *
   * @type {TrackMove}
   */
  function move(input) {
    // eslint-disable-next-line unicorn/prefer-default-parameters
    const value = input || ''
    const chunks = value.split(/\r?\n|\r/g)
    const tail = chunks[chunks.length - 1]
    line += chunks.length - 1
    column =
      chunks.length === 1 ? column + tail.length : 1 + tail.length + lineShift
    return value
  }
}


/***/ }),

/***/ "./node_modules/mdast-util-to-string/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/mdast-util-to-string/lib/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toString: () => (/* binding */ toString)
/* harmony export */ });
/**
 * @typedef {import('mdast').Nodes} Nodes
 *
 * @typedef Options
 *   Configuration (optional).
 * @property {boolean | null | undefined} [includeImageAlt=true]
 *   Whether to use `alt` for `image`s (default: `true`).
 * @property {boolean | null | undefined} [includeHtml=true]
 *   Whether to use `value` of HTML (default: `true`).
 */

/** @type {Options} */
const emptyOptions = {}

/**
 * Get the text content of a node or list of nodes.
 *
 * Prefers the node’s plain-text fields, otherwise serializes its children,
 * and if the given value is an array, serialize the nodes in it.
 *
 * @param {unknown} [value]
 *   Thing to serialize, typically `Node`.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized `value`.
 */
function toString(value, options) {
  const settings = options || emptyOptions
  const includeImageAlt =
    typeof settings.includeImageAlt === 'boolean'
      ? settings.includeImageAlt
      : true
  const includeHtml =
    typeof settings.includeHtml === 'boolean' ? settings.includeHtml : true

  return one(value, includeImageAlt, includeHtml)
}

/**
 * One node or several nodes.
 *
 * @param {unknown} value
 *   Thing to serialize.
 * @param {boolean} includeImageAlt
 *   Include image `alt`s.
 * @param {boolean} includeHtml
 *   Include HTML.
 * @returns {string}
 *   Serialized node.
 */
function one(value, includeImageAlt, includeHtml) {
  if (node(value)) {
    if ('value' in value) {
      return value.type === 'html' && !includeHtml ? '' : value.value
    }

    if (includeImageAlt && 'alt' in value && value.alt) {
      return value.alt
    }

    if ('children' in value) {
      return all(value.children, includeImageAlt, includeHtml)
    }
  }

  if (Array.isArray(value)) {
    return all(value, includeImageAlt, includeHtml)
  }

  return ''
}

/**
 * Serialize a list of nodes.
 *
 * @param {Array<unknown>} values
 *   Thing to serialize.
 * @param {boolean} includeImageAlt
 *   Include image `alt`s.
 * @param {boolean} includeHtml
 *   Include HTML.
 * @returns {string}
 *   Serialized nodes.
 */
function all(values, includeImageAlt, includeHtml) {
  /** @type {Array<string>} */
  const result = []
  let index = -1

  while (++index < values.length) {
    result[index] = one(values[index], includeImageAlt, includeHtml)
  }

  return result.join('')
}

/**
 * Check if `value` looks like a node.
 *
 * @param {unknown} value
 *   Thing.
 * @returns {value is Nodes}
 *   Whether `value` is a node.
 */
function node(value) {
  return Boolean(value && typeof value === 'object')
}


/***/ }),

/***/ "./node_modules/micromark-core-commonmark/dev/lib/blank-line.js":
/*!**********************************************************************!*\
  !*** ./node_modules/micromark-core-commonmark/dev/lib/blank-line.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blankLine: () => (/* binding */ blankLine)
/* harmony export */ });
/* harmony import */ var micromark_factory_space__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-factory-space */ "./node_modules/micromark-factory-space/dev/index.js");
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/types.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/**
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 */





/** @type {Construct} */
const blankLine = {tokenize: tokenizeBlankLine, partial: true}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeBlankLine(effects, ok, nok) {
  return start

  /**
   * Start of blank line.
   *
   * > 👉 **Note**: `␠` represents a space character.
   *
   * ```markdown
   * > | ␠␠␊
   *     ^
   * > | ␊
   *     ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    return (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_0__.markdownSpace)(code)
      ? (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_1__.factorySpace)(effects, after, micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__.types.linePrefix)(code)
      : after(code)
  }

  /**
   * At eof/eol, after optional whitespace.
   *
   * > 👉 **Note**: `␠` represents a space character.
   *
   * ```markdown
   * > | ␠␠␊
   *       ^
   * > | ␊
   *     ^
   * ```
   *
   * @type {State}
   */
  function after(code) {
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__.codes.eof || (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_0__.markdownLineEnding)(code) ? ok(code) : nok(code)
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/html.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/html.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmAutolinkLiteralHtml: () => (/* binding */ gfmAutolinkLiteralHtml)
/* harmony export */ });
/* harmony import */ var micromark_util_sanitize_uri__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-sanitize-uri */ "./node_modules/micromark-util-sanitize-uri/dev/index.js");
/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-util-types').Handle} Handle
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Token} Token
 */



/**
 * Create an HTML extension for `micromark` to support GitHub autolink literal
 * when serializing to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to
 *   support GitHub autolink literal when serializing to HTML.
 */
function gfmAutolinkLiteralHtml() {
  return {
    exit: {literalAutolinkEmail, literalAutolinkHttp, literalAutolinkWww}
  }
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function literalAutolinkWww(token) {
  anchorFromToken.call(this, token, 'http://')
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function literalAutolinkEmail(token) {
  anchorFromToken.call(this, token, 'mailto:')
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function literalAutolinkHttp(token) {
  anchorFromToken.call(this, token)
}

/**
 * @this CompileContext
 * @param {Token} token
 * @param {string | null | undefined} [protocol]
 * @returns {undefined}
 */
function anchorFromToken(token, protocol) {
  const url = this.sliceSerialize(token)
  this.tag('<a href="' + (0,micromark_util_sanitize_uri__WEBPACK_IMPORTED_MODULE_0__.sanitizeUri)((protocol || '') + url) + '">')
  this.raw(this.encode(url))
  this.tag('</a>')
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/syntax.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/syntax.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmAutolinkLiteral: () => (/* binding */ gfmAutolinkLiteral)
/* harmony export */ });
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/**
 * @typedef {import('micromark-util-types').Code} Code
 * @typedef {import('micromark-util-types').ConstructRecord} ConstructRecord
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Previous} Previous
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 */




const wwwPrefix = {tokenize: tokenizeWwwPrefix, partial: true}
const domain = {tokenize: tokenizeDomain, partial: true}
const path = {tokenize: tokenizePath, partial: true}
const trail = {tokenize: tokenizeTrail, partial: true}
const emailDomainDotTrail = {
  tokenize: tokenizeEmailDomainDotTrail,
  partial: true
}

const wwwAutolink = {tokenize: tokenizeWwwAutolink, previous: previousWww}
const protocolAutolink = {
  tokenize: tokenizeProtocolAutolink,
  previous: previousProtocol
}
const emailAutolink = {tokenize: tokenizeEmailAutolink, previous: previousEmail}

/** @type {ConstructRecord} */
const text = {}

/**
 * Create an extension for `micromark` to support GitHub autolink literal
 * syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions` to enable GFM
 *   autolink literal syntax.
 */
function gfmAutolinkLiteral() {
  return {text}
}

/** @type {Code} */
let code = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.digit0

// Add alphanumerics.
while (code < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftCurlyBrace) {
  text[code] = emailAutolink
  code++
  if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.colon) code = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseA
  else if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket) code = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseA
}

text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.plusSign] = emailAutolink
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dash] = emailAutolink
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot] = emailAutolink
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore] = emailAutolink
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseH] = [emailAutolink, protocolAutolink]
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseH] = [emailAutolink, protocolAutolink]
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseW] = [emailAutolink, wwwAutolink]
text[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseW] = [emailAutolink, wwwAutolink]

// To do: perform email autolink literals on events, afterwards.
// That’s where `markdown-rs` and `cmark-gfm` perform it.
// It should look for `@`, then for atext backwards, and then for a label
// forwards.
// To do: `mailto:`, `xmpp:` protocol as prefix.

/**
 * Email autolink literal.
 *
 * ```markdown
 * > | a contact@example.org b
 *       ^^^^^^^^^^^^^^^^^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeEmailAutolink(effects, ok, nok) {
  const self = this
  /** @type {boolean | undefined} */
  let dot
  /** @type {boolean} */
  let data

  return start

  /**
   * Start of email autolink literal.
   *
   * ```markdown
   * > | a contact@example.org b
   *       ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    if (
      !gfmAtext(code) ||
      !previousEmail.call(self, self.previous) ||
      previousUnbalanced(self.events)
    ) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkEmail')
    return atext(code)
  }

  /**
   * In email atext.
   *
   * ```markdown
   * > | a contact@example.org b
   *       ^
   * ```
   *
   * @type {State}
   */
  function atext(code) {
    if (gfmAtext(code)) {
      effects.consume(code)
      return atext
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.atSign) {
      effects.consume(code)
      return emailDomain
    }

    return nok(code)
  }

  /**
   * In email domain.
   *
   * The reference code is a bit overly complex as it handles the `@`, of which
   * there may be just one.
   * Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L318>
   *
   * ```markdown
   * > | a contact@example.org b
   *               ^
   * ```
   *
   * @type {State}
   */
  function emailDomain(code) {
    // Dot followed by alphanumerical (not `-` or `_`).
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot) {
      return effects.check(
        emailDomainDotTrail,
        emailDomainAfter,
        emailDomainDot
      )(code)
    }

    // Alphanumerical, `-`, and `_`.
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dash ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlphanumeric)(code)
    ) {
      data = true
      effects.consume(code)
      return emailDomain
    }

    // To do: `/` if xmpp.

    // Note: normally we’d truncate trailing punctuation from the link.
    // However, email autolink literals cannot contain any of those markers,
    // except for `.`, but that can only occur if it isn’t trailing.
    // So we can ignore truncating!
    return emailDomainAfter(code)
  }

  /**
   * In email domain, on dot that is not a trail.
   *
   * ```markdown
   * > | a contact@example.org b
   *                      ^
   * ```
   *
   * @type {State}
   */
  function emailDomainDot(code) {
    effects.consume(code)
    dot = true
    return emailDomain
  }

  /**
   * After email domain.
   *
   * ```markdown
   * > | a contact@example.org b
   *                          ^
   * ```
   *
   * @type {State}
   */
  function emailDomainAfter(code) {
    // Domain must not be empty, must include a dot, and must end in alphabetical.
    // Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L332>.
    if (data && dot && (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlpha)(self.previous)) {
      effects.exit('literalAutolinkEmail')
      effects.exit('literalAutolink')
      return ok(code)
    }

    return nok(code)
  }
}

/**
 * `www` autolink literal.
 *
 * ```markdown
 * > | a www.example.org b
 *       ^^^^^^^^^^^^^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeWwwAutolink(effects, ok, nok) {
  const self = this

  return wwwStart

  /**
   * Start of www autolink literal.
   *
   * ```markdown
   * > | www.example.com/a?b#c
   *     ^
   * ```
   *
   * @type {State}
   */
  function wwwStart(code) {
    if (
      (code !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseW && code !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseW) ||
      !previousWww.call(self, self.previous) ||
      previousUnbalanced(self.events)
    ) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkWww')
    // Note: we *check*, so we can discard the `www.` we parsed.
    // If it worked, we consider it as a part of the domain.
    return effects.check(
      wwwPrefix,
      effects.attempt(domain, effects.attempt(path, wwwAfter), nok),
      nok
    )(code)
  }

  /**
   * After a www autolink literal.
   *
   * ```markdown
   * > | www.example.com/a?b#c
   *                          ^
   * ```
   *
   * @type {State}
   */
  function wwwAfter(code) {
    effects.exit('literalAutolinkWww')
    effects.exit('literalAutolink')
    return ok(code)
  }
}

/**
 * Protocol autolink literal.
 *
 * ```markdown
 * > | a https://example.org b
 *       ^^^^^^^^^^^^^^^^^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeProtocolAutolink(effects, ok, nok) {
  const self = this
  let buffer = ''
  let seen = false

  return protocolStart

  /**
   * Start of protocol autolink literal.
   *
   * ```markdown
   * > | https://example.com/a?b#c
   *     ^
   * ```
   *
   * @type {State}
   */
  function protocolStart(code) {
    if (
      (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseH || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseH) &&
      previousProtocol.call(self, self.previous) &&
      !previousUnbalanced(self.events)
    ) {
      effects.enter('literalAutolink')
      effects.enter('literalAutolinkHttp')
      buffer += String.fromCodePoint(code)
      effects.consume(code)
      return protocolPrefixInside
    }

    return nok(code)
  }

  /**
   * In protocol.
   *
   * ```markdown
   * > | https://example.com/a?b#c
   *     ^^^^^
   * ```
   *
   * @type {State}
   */
  function protocolPrefixInside(code) {
    // `5` is size of `https`
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlpha)(code) && buffer.length < 5) {
      // @ts-expect-error: definitely number.
      buffer += String.fromCodePoint(code)
      effects.consume(code)
      return protocolPrefixInside
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.colon) {
      const protocol = buffer.toLowerCase()

      if (protocol === 'http' || protocol === 'https') {
        effects.consume(code)
        return protocolSlashesInside
      }
    }

    return nok(code)
  }

  /**
   * In slashes.
   *
   * ```markdown
   * > | https://example.com/a?b#c
   *           ^^
   * ```
   *
   * @type {State}
   */
  function protocolSlashesInside(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.slash) {
      effects.consume(code)

      if (seen) {
        return afterProtocol
      }

      seen = true
      return protocolSlashesInside
    }

    return nok(code)
  }

  /**
   * After protocol, before domain.
   *
   * ```markdown
   * > | https://example.com/a?b#c
   *             ^
   * ```
   *
   * @type {State}
   */
  function afterProtocol(code) {
    // To do: this is different from `markdown-rs`:
    // https://github.com/wooorm/markdown-rs/blob/b3a921c761309ae00a51fe348d8a43adbc54b518/src/construct/gfm_autolink_literal.rs#L172-L182
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiControl)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodeWhitespace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodePunctuation)(code)
      ? nok(code)
      : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code)
  }

  /**
   * After a protocol autolink literal.
   *
   * ```markdown
   * > | https://example.com/a?b#c
   *                              ^
   * ```
   *
   * @type {State}
   */
  function protocolAfter(code) {
    effects.exit('literalAutolinkHttp')
    effects.exit('literalAutolink')
    return ok(code)
  }
}

/**
 * `www` prefix.
 *
 * ```markdown
 * > | a www.example.org b
 *       ^^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeWwwPrefix(effects, ok, nok) {
  let size = 0

  return wwwPrefixInside

  /**
   * In www prefix.
   *
   * ```markdown
   * > | www.example.com
   *     ^^^^
   * ```
   *
   * @type {State}
   */
  function wwwPrefixInside(code) {
    if ((code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseW || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseW) && size < 3) {
      size++
      effects.consume(code)
      return wwwPrefixInside
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot && size === 3) {
      effects.consume(code)
      return wwwPrefixAfter
    }

    return nok(code)
  }

  /**
   * After www prefix.
   *
   * ```markdown
   * > | www.example.com
   *         ^
   * ```
   *
   * @type {State}
   */
  function wwwPrefixAfter(code) {
    // If there is *anything*, we can link.
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ? nok(code) : ok(code)
  }
}

/**
 * Domain.
 *
 * ```markdown
 * > | a https://example.org b
 *               ^^^^^^^^^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeDomain(effects, ok, nok) {
  /** @type {boolean | undefined} */
  let underscoreInLastSegment
  /** @type {boolean | undefined} */
  let underscoreInLastLastSegment
  /** @type {boolean | undefined} */
  let seen

  return domainInside

  /**
   * In domain.
   *
   * ```markdown
   * > | https://example.com/a
   *             ^^^^^^^^^^^
   * ```
   *
   * @type {State}
   */
  function domainInside(code) {
    // Check whether this marker, which is a trailing punctuation
    // marker, optionally followed by more trailing markers, and then
    // followed by an end.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore) {
      return effects.check(trail, domainAfter, domainAtPunctuation)(code)
    }

    // GH documents that only alphanumerics (other than `-`, `.`, and `_`) can
    // occur, which sounds like ASCII only, but they also support `www.點看.com`,
    // so that’s Unicode.
    // Instead of some new production for Unicode alphanumerics, markdown
    // already has that for Unicode punctuation and whitespace, so use those.
    // Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L12>.
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodeWhitespace)(code) ||
      (code !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dash && (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodePunctuation)(code))
    ) {
      return domainAfter(code)
    }

    seen = true
    effects.consume(code)
    return domainInside
  }

  /**
   * In domain, at potential trailing punctuation, that was not trailing.
   *
   * ```markdown
   * > | https://example.com
   *                    ^
   * ```
   *
   * @type {State}
   */
  function domainAtPunctuation(code) {
    // There is an underscore in the last segment of the domain
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore) {
      underscoreInLastSegment = true
    }
    // Otherwise, it’s a `.`: save the last segment underscore in the
    // penultimate segment slot.
    else {
      underscoreInLastLastSegment = underscoreInLastSegment
      underscoreInLastSegment = undefined
    }

    effects.consume(code)
    return domainInside
  }

  /**
   * After domain.
   *
   * ```markdown
   * > | https://example.com/a
   *                        ^
   * ```
   *
   * @type {State} */
  function domainAfter(code) {
    // Note: that’s GH says a dot is needed, but it’s not true:
    // <https://github.com/github/cmark-gfm/issues/279>
    if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) {
      return nok(code)
    }

    return ok(code)
  }
}

/**
 * Path.
 *
 * ```markdown
 * > | a https://example.org/stuff b
 *                          ^^^^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizePath(effects, ok) {
  let sizeOpen = 0
  let sizeClose = 0

  return pathInside

  /**
   * In path.
   *
   * ```markdown
   * > | https://example.com/a
   *                        ^^
   * ```
   *
   * @type {State}
   */
  function pathInside(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftParenthesis) {
      sizeOpen++
      effects.consume(code)
      return pathInside
    }

    // To do: `markdown-rs` also needs this.
    // If this is a paren, and there are less closings than openings,
    // we don’t check for a trail.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightParenthesis && sizeClose < sizeOpen) {
      return pathAtPunctuation(code)
    }

    // Check whether this trailing punctuation marker is optionally
    // followed by more trailing markers, and then followed
    // by an end.
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.exclamationMark ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.quotationMark ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.ampersand ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.apostrophe ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightParenthesis ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.asterisk ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.comma ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.colon ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.semicolon ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lessThan ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.questionMark ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde
    ) {
      return effects.check(trail, ok, pathAtPunctuation)(code)
    }

    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodeWhitespace)(code)
    ) {
      return ok(code)
    }

    effects.consume(code)
    return pathInside
  }

  /**
   * In path, at potential trailing punctuation, that was not trailing.
   *
   * ```markdown
   * > | https://example.com/a"b
   *                          ^
   * ```
   *
   * @type {State}
   */
  function pathAtPunctuation(code) {
    // Count closing parens.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightParenthesis) {
      sizeClose++
    }

    effects.consume(code)
    return pathInside
  }
}

/**
 * Trail.
 *
 * This calls `ok` if this *is* the trail, followed by an end, which means
 * the entire trail is not part of the link.
 * It calls `nok` if this *is* part of the link.
 *
 * ```markdown
 * > | https://example.com").
 *                        ^^^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeTrail(effects, ok, nok) {
  return trail

  /**
   * In trail of domain or path.
   *
   * ```markdown
   * > | https://example.com").
   *                        ^
   * ```
   *
   * @type {State}
   */
  function trail(code) {
    // Regular trailing punctuation.
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.exclamationMark ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.quotationMark ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.apostrophe ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightParenthesis ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.asterisk ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.comma ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.colon ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.semicolon ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.questionMark ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde
    ) {
      effects.consume(code)
      return trail
    }

    // `&` followed by one or more alphabeticals and then a `;`, is
    // as a whole considered as trailing punctuation.
    // In all other cases, it is considered as continuation of the URL.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.ampersand) {
      effects.consume(code)
      return trailCharRefStart
    }

    // Needed because we allow literals after `[`, as we fix:
    // <https://github.com/github/cmark-gfm/issues/278>.
    // Check that it is not followed by `(` or `[`.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket) {
      effects.consume(code)
      return trailBracketAfter
    }

    if (
      // `<` is an end.
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lessThan ||
      // So is whitespace.
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodeWhitespace)(code)
    ) {
      return ok(code)
    }

    return nok(code)
  }

  /**
   * In trail, after `]`.
   *
   * > 👉 **Note**: this deviates from `cmark-gfm` to fix a bug.
   * > See end of <https://github.com/github/cmark-gfm/issues/278> for more.
   *
   * ```markdown
   * > | https://example.com](
   *                         ^
   * ```
   *
   * @type {State}
   */
  function trailBracketAfter(code) {
    // Whitespace or something that could start a resource or reference is the end.
    // Switch back to trail otherwise.
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftParenthesis ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code) ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodeWhitespace)(code)
    ) {
      return ok(code)
    }

    return trail(code)
  }

  /**
   * In character-reference like trail, after `&`.
   *
   * ```markdown
   * > | https://example.com&amp;).
   *                         ^
   * ```
   *
   * @type {State}
   */
  function trailCharRefStart(code) {
    // When non-alpha, it’s not a trail.
    return (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlpha)(code) ? trailCharRefInside(code) : nok(code)
  }

  /**
   * In character-reference like trail.
   *
   * ```markdown
   * > | https://example.com&amp;).
   *                         ^
   * ```
   *
   * @type {State}
   */
  function trailCharRefInside(code) {
    // Switch back to trail if this is well-formed.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.semicolon) {
      effects.consume(code)
      return trail
    }

    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlpha)(code)) {
      effects.consume(code)
      return trailCharRefInside
    }

    // It’s not a trail.
    return nok(code)
  }
}

/**
 * Dot in email domain trail.
 *
 * This calls `ok` if this *is* the trail, followed by an end, which means
 * the trail is not part of the link.
 * It calls `nok` if this *is* part of the link.
 *
 * ```markdown
 * > | contact@example.org.
 *                        ^
 * ```
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeEmailDomainDotTrail(effects, ok, nok) {
  return start

  /**
   * Dot.
   *
   * ```markdown
   * > | contact@example.org.
   *                    ^   ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    // Must be dot.
    effects.consume(code)
    return after
  }

  /**
   * After dot.
   *
   * ```markdown
   * > | contact@example.org.
   *                     ^   ^
   * ```
   *
   * @type {State}
   */
  function after(code) {
    // Not a trail if alphanumeric.
    return (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlphanumeric)(code) ? nok(code) : ok(code)
  }
}

/**
 * See:
 * <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L156>.
 *
 * @type {Previous}
 */
function previousWww(code) {
  return (
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftParenthesis ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.asterisk ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde ||
    (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code)
  )
}

/**
 * See:
 * <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L214>.
 *
 * @type {Previous}
 */
function previousProtocol(code) {
  return !(0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlpha)(code)
}

/**
 * @this {TokenizeContext}
 * @type {Previous}
 */
function previousEmail(code) {
  // Do not allow a slash “inside” atext.
  // The reference code is a bit weird, but that’s what it results in.
  // Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L307>.
  // Other than slash, every preceding character is allowed.
  return !(code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.slash || gfmAtext(code))
}

/**
 * @param {Code} code
 * @returns {boolean}
 */
function gfmAtext(code) {
  return (
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.plusSign ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dash ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.dot ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.underscore ||
    (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.asciiAlphanumeric)(code)
  )
}

/**
 * @param {Array<Event>} events
 * @returns {boolean}
 */
function previousUnbalanced(events) {
  let index = events.length
  let result = false

  while (index--) {
    const token = events[index][1]

    if (
      (token.type === 'labelLink' || token.type === 'labelImage') &&
      !token._balanced
    ) {
      result = true
      break
    }

    // If we’ve seen this token, and it was marked as not having any unbalanced
    // bracket before it, we can exit.
    if (token._gfmAutolinkLiteralWalkedInto) {
      result = false
      break
    }
  }

  if (events.length > 0 && !result) {
    // Mark the last token as “walked into” w/o finding
    // anything.
    events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true
  }

  return result
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-footnote/dev/lib/html.js":
/*!***********************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-footnote/dev/lib/html.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultBackLabel: () => (/* binding */ defaultBackLabel),
/* harmony export */   gfmFootnoteHtml: () => (/* binding */ gfmFootnoteHtml)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-normalize-identifier */ "./node_modules/micromark-util-normalize-identifier/dev/index.js");
/* harmony import */ var micromark_util_sanitize_uri__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-sanitize-uri */ "./node_modules/micromark-util-sanitize-uri/dev/index.js");
/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * @callback BackLabelTemplate
 *   Generate a back label dynamically.
 *
 *   For the following markdown:
 *
 *   ```markdown
 *   Alpha[^micromark], bravo[^micromark], and charlie[^remark].
 *
 *   [^remark]: things about remark
 *   [^micromark]: things about micromark
 *   ```
 *
 *   This function will be called with:
 *
 *   * `0` and `0` for the backreference from `things about micromark` to
 *      `alpha`, as it is the first used definition, and the first call to it
 *   * `0` and `1` for the backreference from `things about micromark` to
 *      `bravo`, as it is the first used definition, and the second call to it
 *   * `1` and `0` for the backreference from `things about remark` to
 *      `charlie`, as it is the second used definition
 * @param {number} referenceIndex
 *   Index of the definition in the order that they are first referenced,
 *   0-indexed.
 * @param {number} rereferenceIndex
 *   Index of calls to the same definition, 0-indexed.
 * @returns {string}
 *   Back label to use when linking back from definitions to their reference.
 */

/**
 * @typedef Options
 *   Configuration.
 * @property {string | null | undefined} [clobberPrefix='user-content-']
 *   Prefix to use before the `id` attribute on footnotes to prevent them from
 *   *clobbering* (default: `'user-content-'`).
 *
 *   Pass `''` for trusted markdown and when you are careful with
 *   polyfilling.
 *   You could pass a different prefix.
 *
 *   DOM clobbering is this:
 *
 *   ```html
 *   <p id="x"></p>
 *   <script>alert(x) // `x` now refers to the `p#x` DOM element</script>
 *   ```
 *
 *   The above example shows that elements are made available by browsers, by
 *   their ID, on the `window` object.
 *   This is a security risk because you might be expecting some other variable
 *   at that place.
 *   It can also break polyfills.
 *   Using a prefix solves these problems.
 * @property {string | null | undefined} [label='Footnotes']
 *   Textual label to use for the footnotes section (default: `'Footnotes'`).
 *
 *   Change it when the markdown is not in English.
 *
 *   This label is typically hidden visually (assuming a `sr-only` CSS class
 *   is defined that does that) and so affects screen readers only.
 *   If you do have such a class, but want to show this section to everyone,
 *   pass different attributes with the `labelAttributes` option.
 * @property {string | null | undefined} [labelAttributes='class="sr-only"']
 *   Attributes to use on the footnote label (default: `'class="sr-only"'`).
 *
 *   Change it to show the label and add other attributes.
 *
 *   This label is typically hidden visually (assuming an `sr-only` CSS class
 *   is defined that does that) and so affects screen readers only.
 *   If you do have such a class, but want to show this section to everyone,
 *   pass an empty string.
 *   You can also add different attributes.
 *
 *   > 👉 **Note**: `id="footnote-label"` is always added, because footnote
 *   > calls use it with `aria-describedby` to provide an accessible label.
 * @property {string | null | undefined} [labelTagName='h2']
 *   HTML tag name to use for the footnote label element (default: `'h2'`).
 *
 *   Change it to match your document structure.
 *
 *   This label is typically hidden visually (assuming a `sr-only` CSS class
 *   is defined that does that) and so affects screen readers only.
 *   If you do have such a class, but want to show this section to everyone,
 *   pass different attributes with the `labelAttributes` option.
 * @property {BackLabelTemplate | string | null | undefined} [backLabel]
 *   Textual label to describe the backreference back to references (default:
 *   `defaultBackLabel`).
 *
 *   The default value is:
 *
 *   ```js
 *   function defaultBackLabel(referenceIndex, rereferenceIndex) {
 *    return (
 *      'Back to reference ' +
 *      (referenceIndex + 1) +
 *      (rereferenceIndex > 1 ? '-' + rereferenceIndex : '')
 *    )
 *  }
 *   ```
 *
 *   Change it when the markdown is not in English.
 *
 *   This label is used in the `aria-label` attribute on each backreference
 *   (the `↩` links).
 *   It affects users of assistive technology.
 */





const own = {}.hasOwnProperty

/** @type {Options} */
const emptyOptions = {}

/**
 * Generate the default label that GitHub uses on backreferences.
 *
 * @param {number} referenceIndex
 *   Index of the definition in the order that they are first referenced,
 *   0-indexed.
 * @param {number} rereferenceIndex
 *   Index of calls to the same definition, 0-indexed.
 * @returns {string}
 *   Default label.
 */
function defaultBackLabel(referenceIndex, rereferenceIndex) {
  return (
    'Back to reference ' +
    (referenceIndex + 1) +
    (rereferenceIndex > 1 ? '-' + rereferenceIndex : '')
  )
}

/**
 * Create an extension for `micromark` to support GFM footnotes when
 * serializing to HTML.
 *
 * @param {Options | null | undefined} [options={}]
 *   Configuration (optional).
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to
 *   support GFM footnotes when serializing to HTML.
 */
function gfmFootnoteHtml(options) {
  const config = options || emptyOptions
  const label = config.label || 'Footnotes'
  const labelTagName = config.labelTagName || 'h2'
  const labelAttributes =
    config.labelAttributes === null || config.labelAttributes === undefined
      ? 'class="sr-only"'
      : config.labelAttributes
  const backLabel = config.backLabel || defaultBackLabel
  const clobberPrefix =
    config.clobberPrefix === null || config.clobberPrefix === undefined
      ? 'user-content-'
      : config.clobberPrefix
  return {
    enter: {
      gfmFootnoteDefinition() {
        const stack = this.getData('tightStack')
        stack.push(false)
      },
      gfmFootnoteDefinitionLabelString() {
        this.buffer()
      },
      gfmFootnoteCallString() {
        this.buffer()
      }
    },
    exit: {
      gfmFootnoteDefinition() {
        let definitions = this.getData('gfmFootnoteDefinitions')
        const footnoteStack = this.getData('gfmFootnoteDefinitionStack')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(footnoteStack, 'expected `footnoteStack`')
        const tightStack = this.getData('tightStack')
        const current = footnoteStack.pop()
        const value = this.resume()

        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(current, 'expected to be in a footnote')

        if (!definitions) {
          this.setData('gfmFootnoteDefinitions', (definitions = {}))
        }

        if (!own.call(definitions, current)) definitions[current] = value

        tightStack.pop()
        this.setData('slurpOneLineEnding', true)
        // “Hack” to prevent a line ending from showing up if we’re in a definition in
        // an empty list item.
        this.setData('lastWasTag')
      },
      gfmFootnoteDefinitionLabelString(token) {
        let footnoteStack = this.getData('gfmFootnoteDefinitionStack')

        if (!footnoteStack) {
          this.setData('gfmFootnoteDefinitionStack', (footnoteStack = []))
        }

        footnoteStack.push((0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_1__.normalizeIdentifier)(this.sliceSerialize(token)))
        this.resume() // Drop the label.
        this.buffer() // Get ready for a value.
      },
      gfmFootnoteCallString(token) {
        let calls = this.getData('gfmFootnoteCallOrder')
        let counts = this.getData('gfmFootnoteCallCounts')
        const id = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_1__.normalizeIdentifier)(this.sliceSerialize(token))
        /** @type {number} */
        let counter

        this.resume()

        if (!calls) this.setData('gfmFootnoteCallOrder', (calls = []))
        if (!counts) this.setData('gfmFootnoteCallCounts', (counts = {}))

        const index = calls.indexOf(id)
        const safeId = (0,micromark_util_sanitize_uri__WEBPACK_IMPORTED_MODULE_2__.sanitizeUri)(id.toLowerCase())

        if (index === -1) {
          calls.push(id)
          counts[id] = 1
          counter = calls.length
        } else {
          counts[id]++
          counter = index + 1
        }

        const reuseCounter = counts[id]

        this.tag(
          '<sup><a href="#' +
            clobberPrefix +
            'fn-' +
            safeId +
            '" id="' +
            clobberPrefix +
            'fnref-' +
            safeId +
            (reuseCounter > 1 ? '-' + reuseCounter : '') +
            '" data-footnote-ref="" aria-describedby="footnote-label">' +
            String(counter) +
            '</a></sup>'
        )
      },
      null() {
        const calls = this.getData('gfmFootnoteCallOrder') || []
        const counts = this.getData('gfmFootnoteCallCounts') || {}
        const definitions = this.getData('gfmFootnoteDefinitions') || {}
        let index = -1

        if (calls.length > 0) {
          this.lineEndingIfNeeded()
          this.tag(
            '<section data-footnotes="" class="footnotes"><' +
              labelTagName +
              ' id="footnote-label"' +
              (labelAttributes ? ' ' + labelAttributes : '') +
              '>'
          )
          this.raw(this.encode(label))
          this.tag('</' + labelTagName + '>')
          this.lineEndingIfNeeded()
          this.tag('<ol>')
        }

        while (++index < calls.length) {
          // Called definitions are always defined.
          const id = calls[index]
          const safeId = (0,micromark_util_sanitize_uri__WEBPACK_IMPORTED_MODULE_2__.sanitizeUri)(id.toLowerCase())
          let referenceIndex = 0
          /** @type {Array<string>} */
          const references = []

          while (++referenceIndex <= counts[id]) {
            references.push(
              '<a href="#' +
                clobberPrefix +
                'fnref-' +
                safeId +
                (referenceIndex > 1 ? '-' + referenceIndex : '') +
                '" data-footnote-backref="" aria-label="' +
                this.encode(
                  typeof backLabel === 'string'
                    ? backLabel
                    : backLabel(index, referenceIndex)
                ) +
                '" class="data-footnote-backref">↩' +
                (referenceIndex > 1
                  ? '<sup>' + referenceIndex + '</sup>'
                  : '') +
                '</a>'
            )
          }

          const reference = references.join(' ')
          let injected = false

          this.lineEndingIfNeeded()
          this.tag('<li id="' + clobberPrefix + 'fn-' + safeId + '">')
          this.lineEndingIfNeeded()
          this.tag(
            definitions[id].replace(/<\/p>(?:\r?\n|\r)?$/, function ($0) {
              injected = true
              return ' ' + reference + $0
            })
          )

          if (!injected) {
            this.lineEndingIfNeeded()
            this.tag(reference)
          }

          this.lineEndingIfNeeded()
          this.tag('</li>')
        }

        if (calls.length > 0) {
          this.lineEndingIfNeeded()
          this.tag('</ol>')
          this.lineEndingIfNeeded()
          this.tag('</section>')
        }
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-footnote/dev/lib/syntax.js":
/*!*************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-footnote/dev/lib/syntax.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmFootnote: () => (/* binding */ gfmFootnote)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_core_commonmark__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! micromark-core-commonmark */ "./node_modules/micromark-core-commonmark/dev/lib/blank-line.js");
/* harmony import */ var micromark_factory_space__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! micromark-factory-space */ "./node_modules/micromark-factory-space/dev/index.js");
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-util-normalize-identifier */ "./node_modules/micromark-util-normalize-identifier/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/types.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/constants.js");
/**
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').Exiter} Exiter
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 */








const indent = {tokenize: tokenizeIndent, partial: true}

// To do: micromark should support a `_hiddenGfmFootnoteSupport`, which only
// affects label start (image).
// That will let us drop `tokenizePotentialGfmFootnote*`.
// It currently has a `_hiddenFootnoteSupport`, which affects that and more.
// That can be removed when `micromark-extension-footnote` is archived.

/**
 * Create an extension for `micromark` to enable GFM footnote syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions` to
 *   enable GFM footnote syntax.
 */
function gfmFootnote() {
  /** @type {Extension} */
  return {
    document: {
      [micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket]: {
        tokenize: tokenizeDefinitionStart,
        continuation: {tokenize: tokenizeDefinitionContinuation},
        exit: gfmFootnoteDefinitionEnd
      }
    },
    text: {
      [micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket]: {tokenize: tokenizeGfmFootnoteCall},
      [micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket]: {
        add: 'after',
        tokenize: tokenizePotentialGfmFootnoteCall,
        resolveTo: resolveToPotentialGfmFootnoteCall
      }
    }
  }
}

// To do: remove after micromark update.
/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
  const self = this
  let index = self.events.length
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
  /** @type {Token} */
  let labelStart

  // Find an opening.
  while (index--) {
    const token = self.events[index][1]

    if (token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.labelImage) {
      labelStart = token
      break
    }

    // Exit if we’ve walked far enough.
    if (
      token.type === 'gfmFootnoteCall' ||
      token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.labelLink ||
      token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.label ||
      token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.image ||
      token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.link
    ) {
      break
    }
  }

  return start

  /**
   * @type {State}
   */
  function start(code) {
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_2__.ok)(code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket, 'expected `]`')

    if (!labelStart || !labelStart._balanced) {
      return nok(code)
    }

    const id = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_3__.normalizeIdentifier)(
      self.sliceSerialize({start: labelStart.end, end: self.now()})
    )

    if (id.codePointAt(0) !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.caret || !defined.includes(id.slice(1))) {
      return nok(code)
    }

    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    return ok(code)
  }
}

// To do: remove after micromark update.
/** @type {Resolver} */
function resolveToPotentialGfmFootnoteCall(events, context) {
  let index = events.length
  /** @type {Token | undefined} */
  let labelStart

  // Find an opening.
  while (index--) {
    if (
      events[index][1].type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.labelImage &&
      events[index][0] === 'enter'
    ) {
      labelStart = events[index][1]
      break
    }
  }

  (0,devlop__WEBPACK_IMPORTED_MODULE_2__.ok)(labelStart, 'expected `labelStart` to resolve')

  // Change the `labelImageMarker` to a `data`.
  events[index + 1][1].type = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.data
  events[index + 3][1].type = 'gfmFootnoteCallLabelMarker'

  // The whole (without `!`):
  /** @type {Token} */
  const call = {
    type: 'gfmFootnoteCall',
    start: Object.assign({}, events[index + 3][1].start),
    end: Object.assign({}, events[events.length - 1][1].end)
  }
  // The `^` marker
  /** @type {Token} */
  const marker = {
    type: 'gfmFootnoteCallMarker',
    start: Object.assign({}, events[index + 3][1].end),
    end: Object.assign({}, events[index + 3][1].end)
  }
  // Increment the end 1 character.
  marker.end.column++
  marker.end.offset++
  marker.end._bufferIndex++
  /** @type {Token} */
  const string = {
    type: 'gfmFootnoteCallString',
    start: Object.assign({}, marker.end),
    end: Object.assign({}, events[events.length - 1][1].start)
  }
  /** @type {Token} */
  const chunk = {
    type: micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.types.chunkString,
    contentType: 'string',
    start: Object.assign({}, string.start),
    end: Object.assign({}, string.end)
  }

  /** @type {Array<Event>} */
  const replacement = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    events[index + 1],
    events[index + 2],
    ['enter', call, context],
    // The `[`
    events[index + 3],
    events[index + 4],
    // The `^`.
    ['enter', marker, context],
    ['exit', marker, context],
    // Everything in between.
    ['enter', string, context],
    ['enter', chunk, context],
    ['exit', chunk, context],
    ['exit', string, context],
    // The ending (`]`, properly parsed and labelled).
    events[events.length - 2],
    events[events.length - 1],
    ['exit', call, context]
  ]

  events.splice(index, events.length - index + 1, ...replacement)

  return events
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeGfmFootnoteCall(effects, ok, nok) {
  const self = this
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
  let size = 0
  /** @type {boolean} */
  let data

  // Note: the implementation of `markdown-rs` is different, because it houses
  // core *and* extensions in one project.
  // Therefore, it can include footnote logic inside `label-end`.
  // We can’t do that, but luckily, we can parse footnotes in a simpler way than
  // needed for labels.
  return start

  /**
   * Start of footnote label.
   *
   * ```markdown
   * > | a [^b] c
   *       ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_2__.ok)(code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket, 'expected `[`')
    effects.enter('gfmFootnoteCall')
    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    return callStart
  }

  /**
   * After `[`, at `^`.
   *
   * ```markdown
   * > | a [^b] c
   *        ^
   * ```
   *
   * @type {State}
   */
  function callStart(code) {
    if (code !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.caret) return nok(code)

    effects.enter('gfmFootnoteCallMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallMarker')
    effects.enter('gfmFootnoteCallString')
    effects.enter('chunkString').contentType = 'string'
    return callData
  }

  /**
   * In label.
   *
   * ```markdown
   * > | a [^b] c
   *         ^
   * ```
   *
   * @type {State}
   */
  function callData(code) {
    if (
      // Too long.
      size > micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__.constants.linkReferenceSizeMax ||
      // Closing brace with nothing.
      (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket && !data) ||
      // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_5__.markdownLineEndingOrSpace)(code)
    ) {
      return nok(code)
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket) {
      effects.exit('chunkString')
      const token = effects.exit('gfmFootnoteCallString')

      if (!defined.includes((0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_3__.normalizeIdentifier)(self.sliceSerialize(token)))) {
        return nok(code)
      }

      effects.enter('gfmFootnoteCallLabelMarker')
      effects.consume(code)
      effects.exit('gfmFootnoteCallLabelMarker')
      effects.exit('gfmFootnoteCall')
      return ok
    }

    if (!(0,micromark_util_character__WEBPACK_IMPORTED_MODULE_5__.markdownLineEndingOrSpace)(code)) {
      data = true
    }

    size++
    effects.consume(code)
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.backslash ? callEscape : callData
  }

  /**
   * On character after escape.
   *
   * ```markdown
   * > | a [^b\c] d
   *           ^
   * ```
   *
   * @type {State}
   */
  function callEscape(code) {
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.backslash ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return callData
    }

    return callData(code)
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeDefinitionStart(effects, ok, nok) {
  const self = this
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
  /** @type {string} */
  let identifier
  let size = 0
  /** @type {boolean | undefined} */
  let data

  return start

  /**
   * Start of GFM footnote definition.
   *
   * ```markdown
   * > | [^a]: b
   *     ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_2__.ok)(code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket, 'expected `[`')
    effects.enter('gfmFootnoteDefinition')._container = true
    effects.enter('gfmFootnoteDefinitionLabel')
    effects.enter('gfmFootnoteDefinitionLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteDefinitionLabelMarker')
    return labelAtMarker
  }

  /**
   * In label, at caret.
   *
   * ```markdown
   * > | [^a]: b
   *      ^
   * ```
   *
   * @type {State}
   */
  function labelAtMarker(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.caret) {
      effects.enter('gfmFootnoteDefinitionMarker')
      effects.consume(code)
      effects.exit('gfmFootnoteDefinitionMarker')
      effects.enter('gfmFootnoteDefinitionLabelString')
      effects.enter('chunkString').contentType = 'string'
      return labelInside
    }

    return nok(code)
  }

  /**
   * In label.
   *
   * > 👉 **Note**: `cmark-gfm` prevents whitespace from occurring in footnote
   * > definition labels.
   *
   * ```markdown
   * > | [^a]: b
   *       ^
   * ```
   *
   * @type {State}
   */
  function labelInside(code) {
    if (
      // Too long.
      size > micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__.constants.linkReferenceSizeMax ||
      // Closing brace with nothing.
      (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket && !data) ||
      // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_5__.markdownLineEndingOrSpace)(code)
    ) {
      return nok(code)
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket) {
      effects.exit('chunkString')
      const token = effects.exit('gfmFootnoteDefinitionLabelString')
      identifier = (0,micromark_util_normalize_identifier__WEBPACK_IMPORTED_MODULE_3__.normalizeIdentifier)(self.sliceSerialize(token))
      effects.enter('gfmFootnoteDefinitionLabelMarker')
      effects.consume(code)
      effects.exit('gfmFootnoteDefinitionLabelMarker')
      effects.exit('gfmFootnoteDefinitionLabel')
      return labelAfter
    }

    if (!(0,micromark_util_character__WEBPACK_IMPORTED_MODULE_5__.markdownLineEndingOrSpace)(code)) {
      data = true
    }

    size++
    effects.consume(code)
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.backslash ? labelEscape : labelInside
  }

  /**
   * After `\`, at a special character.
   *
   * > 👉 **Note**: `cmark-gfm` currently does not support escaped brackets:
   * > <https://github.com/github/cmark-gfm/issues/240>
   *
   * ```markdown
   * > | [^a\*b]: c
   *         ^
   * ```
   *
   * @type {State}
   */
  function labelEscape(code) {
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.backslash ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return labelInside
    }

    return labelInside(code)
  }

  /**
   * After definition label.
   *
   * ```markdown
   * > | [^a]: b
   *         ^
   * ```
   *
   * @type {State}
   */
  function labelAfter(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.colon) {
      effects.enter('definitionMarker')
      effects.consume(code)
      effects.exit('definitionMarker')

      if (!defined.includes(identifier)) {
        defined.push(identifier)
      }

      // Any whitespace after the marker is eaten, forming indented code
      // is not possible.
      // No space is also fine, just like a block quote marker.
      return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_6__.factorySpace)(
        effects,
        whitespaceAfter,
        'gfmFootnoteDefinitionWhitespace'
      )
    }

    return nok(code)
  }

  /**
   * After definition prefix.
   *
   * ```markdown
   * > | [^a]: b
   *           ^
   * ```
   *
   * @type {State}
   */
  function whitespaceAfter(code) {
    // `markdown-rs` has a wrapping token for the prefix that is closed here.
    return ok(code)
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeDefinitionContinuation(effects, ok, nok) {
  /// Start of footnote definition continuation.
  ///
  /// ```markdown
  ///   | [^a]: b
  /// > |     c
  ///     ^
  /// ```
  //
  // Either a blank line, which is okay, or an indented thing.
  return effects.check(micromark_core_commonmark__WEBPACK_IMPORTED_MODULE_7__.blankLine, ok, effects.attempt(indent, ok, nok))
}

/** @type {Exiter} */
function gfmFootnoteDefinitionEnd(effects) {
  effects.exit('gfmFootnoteDefinition')
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeIndent(effects, ok, nok) {
  const self = this

  return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_6__.factorySpace)(
    effects,
    afterPrefix,
    'gfmFootnoteDefinitionIndent',
    micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__.constants.tabSize + 1
  )

  /**
   * @type {State}
   */
  function afterPrefix(code) {
    const tail = self.events[self.events.length - 1]
    return tail &&
      tail[1].type === 'gfmFootnoteDefinitionIndent' &&
      tail[2].sliceSerialize(tail[1], true).length === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__.constants.tabSize
      ? ok(code)
      : nok(code)
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-strikethrough/dev/lib/html.js":
/*!****************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-strikethrough/dev/lib/html.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmStrikethroughHtml: () => (/* binding */ gfmStrikethroughHtml)
/* harmony export */ });
/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * Create an HTML extension for `micromark` to support GFM strikethrough when
 * serializing to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions`, to
 *   support GFM strikethrough when serializing to HTML.
 */
function gfmStrikethroughHtml() {
  return {
    enter: {
      strikethrough() {
        this.tag('<del>')
      }
    },
    exit: {
      strikethrough() {
        this.tag('</del>')
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-strikethrough/dev/lib/syntax.js":
/*!******************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-strikethrough/dev/lib/syntax.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmStrikethrough: () => (/* binding */ gfmStrikethrough)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_util_chunked__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-chunked */ "./node_modules/micromark-util-chunked/dev/index.js");
/* harmony import */ var micromark_util_classify_character__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! micromark-util-classify-character */ "./node_modules/micromark-util-classify-character/dev/index.js");
/* harmony import */ var micromark_util_resolve_all__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-resolve-all */ "./node_modules/micromark-util-resolve-all/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/types.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/constants.js");
/**
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 *
 * @typedef Options
 *   Configuration (optional).
 * @property {boolean | null | undefined} [singleTilde=true]
 *   Whether to support strikethrough with a single tilde (default: `true`).
 *
 *   Single tildes work on github.com, but are technically prohibited by the
 *   GFM spec.
 */







/**
 * Create an extension for `micromark` to enable GFM strikethrough syntax.
 *
 * @param {Options | null | undefined} [options={}]
 *   Configuration.
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable GFM strikethrough syntax.
 */
function gfmStrikethrough(options) {
  const options_ = options || {}
  let single = options_.singleTilde
  const tokenizer = {
    tokenize: tokenizeStrikethrough,
    resolveAll: resolveAllStrikethrough
  }

  if (single === null || single === undefined) {
    single = true
  }

  return {
    text: {[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde]: tokenizer},
    insideSpan: {null: [tokenizer]},
    attentionMarkers: {null: [micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde]}
  }

  /**
   * Take events and resolve strikethrough.
   *
   * @type {Resolver}
   */
  function resolveAllStrikethrough(events, context) {
    let index = -1

    // Walk through all events.
    while (++index < events.length) {
      // Find a token that can close.
      if (
        events[index][0] === 'enter' &&
        events[index][1].type === 'strikethroughSequenceTemporary' &&
        events[index][1]._close
      ) {
        let open = index

        // Now walk back to find an opener.
        while (open--) {
          // Find a token that can open the closer.
          if (
            events[open][0] === 'exit' &&
            events[open][1].type === 'strikethroughSequenceTemporary' &&
            events[open][1]._open &&
            // If the sizes are the same:
            events[index][1].end.offset - events[index][1].start.offset ===
              events[open][1].end.offset - events[open][1].start.offset
          ) {
            events[index][1].type = 'strikethroughSequence'
            events[open][1].type = 'strikethroughSequence'

            /** @type {Token} */
            const strikethrough = {
              type: 'strikethrough',
              start: Object.assign({}, events[open][1].start),
              end: Object.assign({}, events[index][1].end)
            }

            /** @type {Token} */
            const text = {
              type: 'strikethroughText',
              start: Object.assign({}, events[open][1].end),
              end: Object.assign({}, events[index][1].start)
            }

            // Opening.
            /** @type {Array<Event>} */
            const nextEvents = [
              ['enter', strikethrough, context],
              ['enter', events[open][1], context],
              ['exit', events[open][1], context],
              ['enter', text, context]
            ]

            const insideSpan = context.parser.constructs.insideSpan.null

            if (insideSpan) {
              // Between.
              (0,micromark_util_chunked__WEBPACK_IMPORTED_MODULE_1__.splice)(
                nextEvents,
                nextEvents.length,
                0,
                (0,micromark_util_resolve_all__WEBPACK_IMPORTED_MODULE_2__.resolveAll)(insideSpan, events.slice(open + 1, index), context)
              )
            }

            // Closing.
            (0,micromark_util_chunked__WEBPACK_IMPORTED_MODULE_1__.splice)(nextEvents, nextEvents.length, 0, [
              ['exit', text, context],
              ['enter', events[index][1], context],
              ['exit', events[index][1], context],
              ['exit', strikethrough, context]
            ])

            ;(0,micromark_util_chunked__WEBPACK_IMPORTED_MODULE_1__.splice)(events, open - 1, index - open + 3, nextEvents)

            index = open + nextEvents.length - 2
            break
          }
        }
      }
    }

    index = -1

    while (++index < events.length) {
      if (events[index][1].type === 'strikethroughSequenceTemporary') {
        events[index][1].type = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__.types.data
      }
    }

    return events
  }

  /**
   * @this {TokenizeContext}
   * @type {Tokenizer}
   */
  function tokenizeStrikethrough(effects, ok, nok) {
    const previous = this.previous
    const events = this.events
    let size = 0

    return start

    /** @type {State} */
    function start(code) {
      ;(0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde, 'expected `~`')

      if (
        previous === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde &&
        events[events.length - 1][1].type !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__.types.characterEscape
      ) {
        return nok(code)
      }

      effects.enter('strikethroughSequenceTemporary')
      return more(code)
    }

    /** @type {State} */
    function more(code) {
      const before = (0,micromark_util_classify_character__WEBPACK_IMPORTED_MODULE_5__.classifyCharacter)(previous)

      if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde) {
        // If this is the third marker, exit.
        if (size > 1) return nok(code)
        effects.consume(code)
        size++
        return more
      }

      if (size < 2 && !single) return nok(code)
      const token = effects.exit('strikethroughSequenceTemporary')
      const after = (0,micromark_util_classify_character__WEBPACK_IMPORTED_MODULE_5__.classifyCharacter)(code)
      token._open =
        !after || (after === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_6__.constants.attentionSideAfter && Boolean(before))
      token._close =
        !before || (before === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_6__.constants.attentionSideAfter && Boolean(after))
      return ok(code)
    }
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-table/dev/lib/edit-map.js":
/*!************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-table/dev/lib/edit-map.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EditMap: () => (/* binding */ EditMap)
/* harmony export */ });
/**
 * @typedef {import('micromark-util-types').Event} Event
 */

// Port of `edit_map.rs` from `markdown-rs`.
// This should move to `markdown-js` later.

// Deal with several changes in events, batching them together.
//
// Preferably, changes should be kept to a minimum.
// Sometimes, it’s needed to change the list of events, because parsing can be
// messy, and it helps to expose a cleaner interface of events to the compiler
// and other users.
// It can also help to merge many adjacent similar events.
// And, in other cases, it’s needed to parse subcontent: pass some events
// through another tokenizer and inject the result.

/**
 * @typedef {[number, number, Array<Event>]} Change
 * @typedef {[number, number, number]} Jump
 */

/**
 * Tracks a bunch of edits.
 */
class EditMap {
  /**
   * Create a new edit map.
   */
  constructor() {
    /**
     * Record of changes.
     *
     * @type {Array<Change>}
     */
    this.map = []
  }

  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   * @param {number} remove
   * @param {Array<Event>} add
   * @returns {undefined}
   */
  add(index, remove, add) {
    addImpl(this, index, remove, add)
  }

  // To do: add this when moving to `micromark`.
  // /**
  //  * Create an edit: but insert `add` before existing additions.
  //  *
  //  * @param {number} index
  //  * @param {number} remove
  //  * @param {Array<Event>} add
  //  * @returns {undefined}
  //  */
  // addBefore(index, remove, add) {
  //   addImpl(this, index, remove, add, true)
  // }

  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   * @returns {undefined}
   */
  consume(events) {
    this.map.sort(function (a, b) {
      return a[0] - b[0]
    })

    /* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
    if (this.map.length === 0) {
      return
    }

    // To do: if links are added in events, like they are in `markdown-rs`,
    // this is needed.
    // // Calculate jumps: where items in the current list move to.
    // /** @type {Array<Jump>} */
    // const jumps = []
    // let index = 0
    // let addAcc = 0
    // let removeAcc = 0
    // while (index < this.map.length) {
    //   const [at, remove, add] = this.map[index]
    //   removeAcc += remove
    //   addAcc += add.length
    //   jumps.push([at, removeAcc, addAcc])
    //   index += 1
    // }
    //
    // . shiftLinks(events, jumps)

    let index = this.map.length
    /** @type {Array<Array<Event>>} */
    const vecs = []
    while (index > 0) {
      index -= 1
      vecs.push(
        events.slice(this.map[index][0] + this.map[index][1]),
        this.map[index][2]
      )

      // Truncate rest.
      events.length = this.map[index][0]
    }

    vecs.push([...events])
    events.length = 0

    let slice = vecs.pop()

    while (slice) {
      events.push(...slice)
      slice = vecs.pop()
    }

    // Truncate everything.
    this.map.length = 0
  }
}

/**
 * Create an edit.
 *
 * @param {EditMap} editMap
 * @param {number} at
 * @param {number} remove
 * @param {Array<Event>} add
 * @returns {undefined}
 */
function addImpl(editMap, at, remove, add) {
  let index = 0

  /* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
  if (remove === 0 && add.length === 0) {
    return
  }

  while (index < editMap.map.length) {
    if (editMap.map[index][0] === at) {
      editMap.map[index][1] += remove

      // To do: before not used by tables, use when moving to micromark.
      // if (before) {
      //   add.push(...editMap.map[index][2])
      //   editMap.map[index][2] = add
      // } else {
      editMap.map[index][2].push(...add)
      // }

      return
    }

    index += 1
  }

  editMap.map.push([at, remove, add])
}

// /**
//  * Shift `previous` and `next` links according to `jumps`.
//  *
//  * This fixes links in case there are events removed or added between them.
//  *
//  * @param {Array<Event>} events
//  * @param {Array<Jump>} jumps
//  */
// function shiftLinks(events, jumps) {
//   let jumpIndex = 0
//   let index = 0
//   let add = 0
//   let rm = 0

//   while (index < events.length) {
//     const rmCurr = rm

//     while (jumpIndex < jumps.length && jumps[jumpIndex][0] <= index) {
//       add = jumps[jumpIndex][2]
//       rm = jumps[jumpIndex][1]
//       jumpIndex += 1
//     }

//     // Ignore items that will be removed.
//     if (rm > rmCurr) {
//       index += rm - rmCurr
//     } else {
//       // ?
//       // if let Some(link) = &events[index].link {
//       //     if let Some(next) = link.next {
//       //         events[next].link.as_mut().unwrap().previous = Some(index + add - rm);
//       //         while jumpIndex < jumps.len() && jumps[jumpIndex].0 <= next {
//       //             add = jumps[jumpIndex].2;
//       //             rm = jumps[jumpIndex].1;
//       //             jumpIndex += 1;
//       //         }
//       //         events[index].link.as_mut().unwrap().next = Some(next + add - rm);
//       //         index = next;
//       //         continue;
//       //     }
//       // }
//       index += 1
//     }
//   }
// }


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-table/dev/lib/html.js":
/*!********************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-table/dev/lib/html.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTableHtml: () => (/* binding */ gfmTableHtml)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * @typedef {import('./infer.js').Align} Align
 */



const alignment = {
  none: '',
  left: ' align="left"',
  right: ' align="right"',
  center: ' align="center"'
}

// To do: micromark@5: use `infer` here, when all events are exposed.

/**
 * Create an HTML extension for `micromark` to support GitHub tables when
 * serializing to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to
 *   support GitHub tables when serializing to HTML.
 */
function gfmTableHtml() {
  return {
    enter: {
      table(token) {
        const tableAlign = token._align
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(tableAlign, 'expected `_align`')
        this.lineEndingIfNeeded()
        this.tag('<table>')
        this.setData('tableAlign', tableAlign)
      },
      tableBody() {
        this.tag('<tbody>')
      },
      tableData() {
        const tableAlign = this.getData('tableAlign')
        const tableColumn = this.getData('tableColumn')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(tableAlign, 'expected `tableAlign`')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(typeof tableColumn === 'number', 'expected `tableColumn`')
        const align = alignment[tableAlign[tableColumn]]

        if (align === undefined) {
          // Capture results to ignore them.
          this.buffer()
        } else {
          this.lineEndingIfNeeded()
          this.tag('<td' + align + '>')
        }
      },
      tableHead() {
        this.lineEndingIfNeeded()
        this.tag('<thead>')
      },
      tableHeader() {
        const tableAlign = this.getData('tableAlign')
        const tableColumn = this.getData('tableColumn')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(tableAlign, 'expected `tableAlign`')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(typeof tableColumn === 'number', 'expected `tableColumn`')
        const align = alignment[tableAlign[tableColumn]]
        this.lineEndingIfNeeded()
        this.tag('<th' + align + '>')
      },
      tableRow() {
        this.setData('tableColumn', 0)
        this.lineEndingIfNeeded()
        this.tag('<tr>')
      }
    },
    exit: {
      // Overwrite the default code text data handler to unescape escaped pipes when
      // they are in tables.
      codeTextData(token) {
        let value = this.sliceSerialize(token)

        if (this.getData('tableAlign')) {
          value = value.replace(/\\([\\|])/g, replace)
        }

        this.raw(this.encode(value))
      },
      table() {
        this.setData('tableAlign')
        // Note: we don’t set `slurpAllLineEndings` anymore, in delimiter rows,
        // but we do need to reset it to match a funky newline GH generates for
        // list items combined with tables.
        this.setData('slurpAllLineEndings')
        this.lineEndingIfNeeded()
        this.tag('</table>')
      },
      tableBody() {
        this.lineEndingIfNeeded()
        this.tag('</tbody>')
      },
      tableData() {
        const tableAlign = this.getData('tableAlign')
        const tableColumn = this.getData('tableColumn')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(tableAlign, 'expected `tableAlign`')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(typeof tableColumn === 'number', 'expected `tableColumn`')

        if (tableColumn in tableAlign) {
          this.tag('</td>')
          this.setData('tableColumn', tableColumn + 1)
        } else {
          // Stop capturing.
          this.resume()
        }
      },
      tableHead() {
        this.lineEndingIfNeeded()
        this.tag('</thead>')
      },
      tableHeader() {
        const tableColumn = this.getData('tableColumn')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(typeof tableColumn === 'number', 'expected `tableColumn`')
        this.tag('</th>')
        this.setData('tableColumn', tableColumn + 1)
      },
      tableRow() {
        const tableAlign = this.getData('tableAlign')
        let tableColumn = this.getData('tableColumn')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(tableAlign, 'expected `tableAlign`')
        ;(0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(typeof tableColumn === 'number', 'expected `tableColumn`')

        while (tableColumn < tableAlign.length) {
          this.lineEndingIfNeeded()
          this.tag('<td' + alignment[tableAlign[tableColumn]] + '></td>')
          tableColumn++
        }

        this.setData('tableColumn', tableColumn)
        this.lineEndingIfNeeded()
        this.tag('</tr>')
      }
    }
  }
}

/**
 * @param {string} $0
 * @param {string} $1
 * @returns {string}
 */
function replace($0, $1) {
  // Pipes work, backslashes don’t (but can’t escape pipes).
  return $1 === '|' ? $1 : $0
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-table/dev/lib/infer.js":
/*!*********************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-table/dev/lib/infer.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTableAlign: () => (/* binding */ gfmTableAlign)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/**
 * @typedef {import('micromark-util-types').Event} Event
 */

/**
 * @typedef {'center' | 'left' | 'none' | 'right'} Align
 */



/**
 * Figure out the alignment of a GFM table.
 *
 * @param {Readonly<Array<Event>>} events
 *   List of events.
 * @param {number} index
 *   Table enter event.
 * @returns {Array<Align>}
 *   List of aligns.
 */
function gfmTableAlign(events, index) {
  (0,devlop__WEBPACK_IMPORTED_MODULE_0__.ok)(events[index][1].type === 'table', 'expected table')
  let inDelimiterRow = false
  /** @type {Array<Align>} */
  const align = []

  while (index < events.length) {
    const event = events[index]

    if (inDelimiterRow) {
      if (event[0] === 'enter') {
        // Start of alignment value: set a new column.
        // To do: `markdown-rs` uses `tableDelimiterCellValue`.
        if (event[1].type === 'tableContent') {
          align.push(
            events[index + 1][1].type === 'tableDelimiterMarker'
              ? 'left'
              : 'none'
          )
        }
      }
      // Exits:
      // End of alignment value: change the column.
      // To do: `markdown-rs` uses `tableDelimiterCellValue`.
      else if (event[1].type === 'tableContent') {
        if (events[index - 1][1].type === 'tableDelimiterMarker') {
          const alignIndex = align.length - 1

          align[alignIndex] = align[alignIndex] === 'left' ? 'center' : 'right'
        }
      }
      // Done!
      else if (event[1].type === 'tableDelimiterRow') {
        break
      }
    } else if (event[0] === 'enter' && event[1].type === 'tableDelimiterRow') {
      inDelimiterRow = true
    }

    index += 1
  }

  return align
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-table/dev/lib/syntax.js":
/*!**********************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-table/dev/lib/syntax.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTable: () => (/* binding */ gfmTable)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-factory-space */ "./node_modules/micromark-factory-space/dev/index.js");
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/types.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/constants.js");
/* harmony import */ var _edit_map_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./edit-map.js */ "./node_modules/micromark-extension-gfm-table/dev/lib/edit-map.js");
/* harmony import */ var _infer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./infer.js */ "./node_modules/micromark-extension-gfm-table/dev/lib/infer.js");
/**
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Point} Point
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 */

/**
 * @typedef {[number, number, number, number]} Range
 *   Cell info.
 *
 * @typedef {0 | 1 | 2 | 3} RowKind
 *   Where we are: `1` for head row, `2` for delimiter row, `3` for body row.
 */








/**
 * Create an HTML extension for `micromark` to support GitHub tables syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions` to enable GFM
 *   table syntax.
 */
function gfmTable() {
  return {
    flow: {null: {tokenize: tokenizeTable, resolveAll: resolveTable}}
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeTable(effects, ok, nok) {
  const self = this
  let size = 0
  let sizeB = 0
  /** @type {boolean | undefined} */
  let seen

  return start

  /**
   * Start of a GFM table.
   *
   * If there is a valid table row or table head before, then we try to parse
   * another row.
   * Otherwise, we try to parse a head.
   *
   * ```markdown
   * > | | a |
   *     ^
   *   | | - |
   * > | | b |
   *     ^
   * ```
   * @type {State}
   */
  function start(code) {
    let index = self.events.length - 1

    while (index > -1) {
      const type = self.events[index][1].type
      if (
        type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.lineEnding ||
        // Note: markdown-rs uses `whitespace` instead of `linePrefix`
        type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.linePrefix
      )
        index--
      else break
    }

    const tail = index > -1 ? self.events[index][1].type : null

    const next =
      tail === 'tableHead' || tail === 'tableRow' ? bodyRowStart : headRowBefore

    // Don’t allow lazy body rows.
    if (next === bodyRowStart && self.parser.lazy[self.now().line]) {
      return nok(code)
    }

    return next(code)
  }

  /**
   * Before table head row.
   *
   * ```markdown
   * > | | a |
   *     ^
   *   | | - |
   *   | | b |
   * ```
   *
   * @type {State}
   */
  function headRowBefore(code) {
    effects.enter('tableHead')
    effects.enter('tableRow')
    return headRowStart(code)
  }

  /**
   * Before table head row, after whitespace.
   *
   * ```markdown
   * > | | a |
   *     ^
   *   | | - |
   *   | | b |
   * ```
   *
   * @type {State}
   */
  function headRowStart(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      return headRowBreak(code)
    }

    // To do: micromark-js should let us parse our own whitespace in extensions,
    // like `markdown-rs`:
    //
    // ```js
    // // 4+ spaces.
    // if (markdownSpace(code)) {
    //   return nok(code)
    // }
    // ```

    seen = true
    // Count the first character, that isn’t a pipe, double.
    sizeB += 1
    return headRowBreak(code)
  }

  /**
   * At break in table head row.
   *
   * ```markdown
   * > | | a |
   *     ^
   *       ^
   *         ^
   *   | | - |
   *   | | b |
   * ```
   *
   * @type {State}
   */
  function headRowBreak(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.eof) {
      // Note: in `markdown-rs`, we need to reset, in `micromark-js` we don‘t.
      return nok(code)
    }

    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEnding)(code)) {
      // If anything other than one pipe (ignoring whitespace) was used, it’s fine.
      if (sizeB > 1) {
        sizeB = 0
        // To do: check if this works.
        // Feel free to interrupt:
        self.interrupt = true
        effects.exit('tableRow')
        effects.enter(micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.lineEnding)
        effects.consume(code)
        effects.exit(micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.lineEnding)
        return headDelimiterStart
      }

      // Note: in `markdown-rs`, we need to reset, in `micromark-js` we don‘t.
      return nok(code)
    }

    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownSpace)(code)) {
      // To do: check if this is fine.
      // effects.attempt(State::Next(StateName::GfmTableHeadRowBreak), State::Nok)
      // State::Retry(space_or_tab(tokenizer))
      return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__.factorySpace)(effects, headRowBreak, micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.whitespace)(code)
    }

    sizeB += 1

    if (seen) {
      seen = false
      // Header cell count.
      size += 1
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      // Whether a delimiter was seen.
      seen = true
      return headRowBreak
    }

    // Anything else is cell data.
    effects.enter(micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.data)
    return headRowData(code)
  }

  /**
   * In table head row data.
   *
   * ```markdown
   * > | | a |
   *       ^
   *   | | - |
   *   | | b |
   * ```
   *
   * @type {State}
   */
  function headRowData(code) {
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.eof ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEndingOrSpace)(code)
    ) {
      effects.exit(micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.data)
      return headRowBreak(code)
    }

    effects.consume(code)
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.backslash ? headRowEscape : headRowData
  }

  /**
   * In table head row escape.
   *
   * ```markdown
   * > | | a\-b |
   *         ^
   *   | | ---- |
   *   | | c    |
   * ```
   *
   * @type {State}
   */
  function headRowEscape(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.backslash || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      effects.consume(code)
      return headRowData
    }

    return headRowData(code)
  }

  /**
   * Before delimiter row.
   *
   * ```markdown
   *   | | a |
   * > | | - |
   *     ^
   *   | | b |
   * ```
   *
   * @type {State}
   */
  function headDelimiterStart(code) {
    // Reset `interrupt`.
    self.interrupt = false

    // Note: in `markdown-rs`, we need to handle piercing here too.
    if (self.parser.lazy[self.now().line]) {
      return nok(code)
    }

    effects.enter('tableDelimiterRow')
    // Track if we’ve seen a `:` or `|`.
    seen = false

    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownSpace)(code)) {
      (0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(self.parser.constructs.disable.null, 'expected `disabled.null`')
      return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__.factorySpace)(
        effects,
        headDelimiterBefore,
        micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.linePrefix,
        self.parser.constructs.disable.null.includes('codeIndented')
          ? undefined
          : micromark_util_symbol__WEBPACK_IMPORTED_MODULE_5__.constants.tabSize
      )(code)
    }

    return headDelimiterBefore(code)
  }

  /**
   * Before delimiter row, after optional whitespace.
   *
   * Reused when a `|` is found later, to parse another cell.
   *
   * ```markdown
   *   | | a |
   * > | | - |
   *     ^
   *   | | b |
   * ```
   *
   * @type {State}
   */
  function headDelimiterBefore(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.dash || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.colon) {
      return headDelimiterValueBefore(code)
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      seen = true
      // If we start with a pipe, we open a cell marker.
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      return headDelimiterCellBefore
    }

    // More whitespace / empty row not allowed at start.
    return headDelimiterNok(code)
  }

  /**
   * After `|`, before delimiter cell.
   *
   * ```markdown
   *   | | a |
   * > | | - |
   *      ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterCellBefore(code) {
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownSpace)(code)) {
      return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__.factorySpace)(
        effects,
        headDelimiterValueBefore,
        micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.whitespace
      )(code)
    }

    return headDelimiterValueBefore(code)
  }

  /**
   * Before delimiter cell value.
   *
   * ```markdown
   *   | | a |
   * > | | - |
   *       ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterValueBefore(code) {
    // Align: left.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.colon) {
      sizeB += 1
      seen = true

      effects.enter('tableDelimiterMarker')
      effects.consume(code)
      effects.exit('tableDelimiterMarker')
      return headDelimiterLeftAlignmentAfter
    }

    // Align: none.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.dash) {
      sizeB += 1
      // To do: seems weird that this *isn’t* left aligned, but that state is used?
      return headDelimiterLeftAlignmentAfter(code)
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.eof || (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEnding)(code)) {
      return headDelimiterCellAfter(code)
    }

    return headDelimiterNok(code)
  }

  /**
   * After delimiter cell left alignment marker.
   *
   * ```markdown
   *   | | a  |
   * > | | :- |
   *        ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterLeftAlignmentAfter(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.dash) {
      effects.enter('tableDelimiterFiller')
      return headDelimiterFiller(code)
    }

    // Anything else is not ok after the left-align colon.
    return headDelimiterNok(code)
  }

  /**
   * In delimiter cell filler.
   *
   * ```markdown
   *   | | a |
   * > | | - |
   *       ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterFiller(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.dash) {
      effects.consume(code)
      return headDelimiterFiller
    }

    // Align is `center` if it was `left`, `right` otherwise.
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.colon) {
      seen = true
      effects.exit('tableDelimiterFiller')
      effects.enter('tableDelimiterMarker')
      effects.consume(code)
      effects.exit('tableDelimiterMarker')
      return headDelimiterRightAlignmentAfter
    }

    effects.exit('tableDelimiterFiller')
    return headDelimiterRightAlignmentAfter(code)
  }

  /**
   * After delimiter cell right alignment marker.
   *
   * ```markdown
   *   | |  a |
   * > | | -: |
   *         ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterRightAlignmentAfter(code) {
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownSpace)(code)) {
      return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__.factorySpace)(
        effects,
        headDelimiterCellAfter,
        micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.whitespace
      )(code)
    }

    return headDelimiterCellAfter(code)
  }

  /**
   * After delimiter cell.
   *
   * ```markdown
   *   | |  a |
   * > | | -: |
   *          ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterCellAfter(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      return headDelimiterBefore(code)
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.eof || (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEnding)(code)) {
      // Exit when:
      // * there was no `:` or `|` at all (it’s a thematic break or setext
      //   underline instead)
      // * the header cell count is not the delimiter cell count
      if (!seen || size !== sizeB) {
        return headDelimiterNok(code)
      }

      // Note: in markdown-rs`, a reset is needed here.
      effects.exit('tableDelimiterRow')
      effects.exit('tableHead')
      // To do: in `markdown-rs`, resolvers need to be registered manually.
      // effects.register_resolver(ResolveName::GfmTable)
      return ok(code)
    }

    return headDelimiterNok(code)
  }

  /**
   * In delimiter row, at a disallowed byte.
   *
   * ```markdown
   *   | | a |
   * > | | x |
   *       ^
   * ```
   *
   * @type {State}
   */
  function headDelimiterNok(code) {
    // Note: in `markdown-rs`, we need to reset, in `micromark-js` we don‘t.
    return nok(code)
  }

  /**
   * Before table body row.
   *
   * ```markdown
   *   | | a |
   *   | | - |
   * > | | b |
   *     ^
   * ```
   *
   * @type {State}
   */
  function bodyRowStart(code) {
    // Note: in `markdown-rs` we need to manually take care of a prefix,
    // but in `micromark-js` that is done for us, so if we’re here, we’re
    // never at whitespace.
    effects.enter('tableRow')
    return bodyRowBreak(code)
  }

  /**
   * At break in table body row.
   *
   * ```markdown
   *   | | a |
   *   | | - |
   * > | | b |
   *     ^
   *       ^
   *         ^
   * ```
   *
   * @type {State}
   */
  function bodyRowBreak(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      return bodyRowBreak
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.eof || (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEnding)(code)) {
      effects.exit('tableRow')
      return ok(code)
    }

    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownSpace)(code)) {
      return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__.factorySpace)(effects, bodyRowBreak, micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.whitespace)(code)
    }

    // Anything else is cell content.
    effects.enter(micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.data)
    return bodyRowData(code)
  }

  /**
   * In table body row data.
   *
   * ```markdown
   *   | | a |
   *   | | - |
   * > | | b |
   *       ^
   * ```
   *
   * @type {State}
   */
  function bodyRowData(code) {
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.eof ||
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar ||
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEndingOrSpace)(code)
    ) {
      effects.exit(micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.data)
      return bodyRowBreak(code)
    }

    effects.consume(code)
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.backslash ? bodyRowEscape : bodyRowData
  }

  /**
   * In table body row escape.
   *
   * ```markdown
   *   | | a    |
   *   | | ---- |
   * > | | b\-c |
   *         ^
   * ```
   *
   * @type {State}
   */
  function bodyRowEscape(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.backslash || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.verticalBar) {
      effects.consume(code)
      return bodyRowData
    }

    return bodyRowData(code)
  }
}

/** @type {Resolver} */

function resolveTable(events, context) {
  let index = -1
  let inFirstCellAwaitingPipe = true
  /** @type {RowKind} */
  let rowKind = 0
  /** @type {Range} */
  let lastCell = [0, 0, 0, 0]
  /** @type {Range} */
  let cell = [0, 0, 0, 0]
  let afterHeadAwaitingFirstBodyRow = false
  let lastTableEnd = 0
  /** @type {Token | undefined} */
  let currentTable
  /** @type {Token | undefined} */
  let currentBody
  /** @type {Token | undefined} */
  let currentCell

  const map = new _edit_map_js__WEBPACK_IMPORTED_MODULE_6__.EditMap()

  while (++index < events.length) {
    const event = events[index]
    const token = event[1]

    if (event[0] === 'enter') {
      // Start of head.
      if (token.type === 'tableHead') {
        afterHeadAwaitingFirstBodyRow = false

        // Inject previous (body end and) table end.
        if (lastTableEnd !== 0) {
          (0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(currentTable, 'there should be a table opening')
          flushTableEnd(map, context, lastTableEnd, currentTable, currentBody)
          currentBody = undefined
          lastTableEnd = 0
        }

        // Inject table start.
        currentTable = {
          type: 'table',
          start: Object.assign({}, token.start),
          // Note: correct end is set later.
          end: Object.assign({}, token.end)
        }
        map.add(index, 0, [['enter', currentTable, context]])
      } else if (
        token.type === 'tableRow' ||
        token.type === 'tableDelimiterRow'
      ) {
        inFirstCellAwaitingPipe = true
        currentCell = undefined
        lastCell = [0, 0, 0, 0]
        cell = [0, index + 1, 0, 0]

        // Inject table body start.
        if (afterHeadAwaitingFirstBodyRow) {
          afterHeadAwaitingFirstBodyRow = false
          currentBody = {
            type: 'tableBody',
            start: Object.assign({}, token.start),
            // Note: correct end is set later.
            end: Object.assign({}, token.end)
          }
          map.add(index, 0, [['enter', currentBody, context]])
        }

        rowKind = token.type === 'tableDelimiterRow' ? 2 : currentBody ? 3 : 1
      }
      // Cell data.
      else if (
        rowKind &&
        (token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.data ||
          token.type === 'tableDelimiterMarker' ||
          token.type === 'tableDelimiterFiller')
      ) {
        inFirstCellAwaitingPipe = false

        // First value in cell.
        if (cell[2] === 0) {
          if (lastCell[1] !== 0) {
            cell[0] = cell[1]
            currentCell = flushCell(
              map,
              context,
              lastCell,
              rowKind,
              undefined,
              currentCell
            )
            lastCell = [0, 0, 0, 0]
          }

          cell[2] = index
        }
      } else if (token.type === 'tableCellDivider') {
        if (inFirstCellAwaitingPipe) {
          inFirstCellAwaitingPipe = false
        } else {
          if (lastCell[1] !== 0) {
            cell[0] = cell[1]
            currentCell = flushCell(
              map,
              context,
              lastCell,
              rowKind,
              undefined,
              currentCell
            )
          }

          lastCell = cell
          cell = [lastCell[1], index, 0, 0]
        }
      }
    }
    // Exit events.
    else if (token.type === 'tableHead') {
      afterHeadAwaitingFirstBodyRow = true
      lastTableEnd = index
    } else if (
      token.type === 'tableRow' ||
      token.type === 'tableDelimiterRow'
    ) {
      lastTableEnd = index

      if (lastCell[1] !== 0) {
        cell[0] = cell[1]
        currentCell = flushCell(
          map,
          context,
          lastCell,
          rowKind,
          index,
          currentCell
        )
      } else if (cell[1] !== 0) {
        currentCell = flushCell(map, context, cell, rowKind, index, currentCell)
      }

      rowKind = 0
    } else if (
      rowKind &&
      (token.type === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.data ||
        token.type === 'tableDelimiterMarker' ||
        token.type === 'tableDelimiterFiller')
    ) {
      cell[3] = index
    }
  }

  if (lastTableEnd !== 0) {
    (0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(currentTable, 'expected table opening')
    flushTableEnd(map, context, lastTableEnd, currentTable, currentBody)
  }

  map.consume(context.events)

  // To do: move this into `html`, when events are exposed there.
  // That’s what `markdown-rs` does.
  // That needs updates to `mdast-util-gfm-table`.
  index = -1
  while (++index < context.events.length) {
    const event = context.events[index]
    if (event[0] === 'enter' && event[1].type === 'table') {
      event[1]._align = (0,_infer_js__WEBPACK_IMPORTED_MODULE_7__.gfmTableAlign)(context.events, index)
    }
  }

  return events
}

/**
 * Generate a cell.
 *
 * @param {EditMap} map
 * @param {Readonly<TokenizeContext>} context
 * @param {Readonly<Range>} range
 * @param {RowKind} rowKind
 * @param {number | undefined} rowEnd
 * @param {Token | undefined} previousCell
 * @returns {Token | undefined}
 */
// eslint-disable-next-line max-params
function flushCell(map, context, range, rowKind, rowEnd, previousCell) {
  // `markdown-rs` uses:
  // rowKind === 2 ? 'tableDelimiterCell' : 'tableCell'
  const groupName =
    rowKind === 1
      ? 'tableHeader'
      : rowKind === 2
      ? 'tableDelimiter'
      : 'tableData'
  // `markdown-rs` uses:
  // rowKind === 2 ? 'tableDelimiterCellValue' : 'tableCellText'
  const valueName = 'tableContent'

  // Insert an exit for the previous cell, if there is one.
  //
  // ```markdown
  // > | | aa | bb | cc |
  //          ^-- exit
  //           ^^^^-- this cell
  // ```
  if (range[0] !== 0) {
    (0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(previousCell, 'expected previous cell enter')
    previousCell.end = Object.assign({}, getPoint(context.events, range[0]))
    map.add(range[0], 0, [['exit', previousCell, context]])
  }

  // Insert enter of this cell.
  //
  // ```markdown
  // > | | aa | bb | cc |
  //           ^-- enter
  //           ^^^^-- this cell
  // ```
  const now = getPoint(context.events, range[1])
  previousCell = {
    type: groupName,
    start: Object.assign({}, now),
    // Note: correct end is set later.
    end: Object.assign({}, now)
  }
  map.add(range[1], 0, [['enter', previousCell, context]])

  // Insert text start at first data start and end at last data end, and
  // remove events between.
  //
  // ```markdown
  // > | | aa | bb | cc |
  //            ^-- enter
  //             ^-- exit
  //           ^^^^-- this cell
  // ```
  if (range[2] !== 0) {
    const relatedStart = getPoint(context.events, range[2])
    const relatedEnd = getPoint(context.events, range[3])
    /** @type {Token} */
    const valueToken = {
      type: valueName,
      start: Object.assign({}, relatedStart),
      end: Object.assign({}, relatedEnd)
    }
    map.add(range[2], 0, [['enter', valueToken, context]])
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(range[3] !== 0)

    if (rowKind !== 2) {
      // Fix positional info on remaining events
      const start = context.events[range[2]]
      const end = context.events[range[3]]
      start[1].end = Object.assign({}, end[1].end)
      start[1].type = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.types.chunkText
      start[1].contentType = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_5__.constants.contentTypeText

      // Remove if needed.
      if (range[3] > range[2] + 1) {
        const a = range[2] + 1
        const b = range[3] - range[2] - 1
        map.add(a, b, [])
      }
    }

    map.add(range[3] + 1, 0, [['exit', valueToken, context]])
  }

  // Insert an exit for the last cell, if at the row end.
  //
  // ```markdown
  // > | | aa | bb | cc |
  //                    ^-- exit
  //               ^^^^^^-- this cell (the last one contains two “between” parts)
  // ```
  if (rowEnd !== undefined) {
    previousCell.end = Object.assign({}, getPoint(context.events, rowEnd))
    map.add(rowEnd, 0, [['exit', previousCell, context]])
    previousCell = undefined
  }

  return previousCell
}

/**
 * Generate table end (and table body end).
 *
 * @param {Readonly<EditMap>} map
 * @param {Readonly<TokenizeContext>} context
 * @param {number} index
 * @param {Token} table
 * @param {Token | undefined} tableBody
 */
// eslint-disable-next-line max-params
function flushTableEnd(map, context, index, table, tableBody) {
  /** @type {Array<Event>} */
  const exits = []
  const related = getPoint(context.events, index)

  if (tableBody) {
    tableBody.end = Object.assign({}, related)
    exits.push(['exit', tableBody, context])
  }

  table.end = Object.assign({}, related)
  exits.push(['exit', table, context])

  map.add(index + 1, 0, exits)
}

/**
 * @param {Readonly<Array<Event>>} events
 * @param {number} index
 * @returns {Readonly<Point>}
 */
function getPoint(events, index) {
  const event = events[index]
  const side = event[0] === 'enter' ? 'start' : 'end'
  return event[1][side]
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-tagfilter/lib/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-tagfilter/lib/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTagfilterHtml: () => (/* binding */ gfmTagfilterHtml)
/* harmony export */ });
/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Token} Token
 */

// An opening or closing tag start, followed by a case-insensitive specific tag name,
// followed by HTML whitespace, a greater than, or a slash.
const reFlow =
  /<(\/?)(iframe|noembed|noframes|plaintext|script|style|title|textarea|xmp)(?=[\t\n\f\r />])/gi

// As HTML (text) parses tags separately (and very strictly), we don’t need to be
// global.
const reText = new RegExp('^' + reFlow.source, 'i')

/**
 * Create an HTML extension for `micromark` to support GitHubs weird and
 * useless tagfilter when serializing to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to support
 *   GitHubs weird and useless tagfilter when serializing to HTML.
 */
function gfmTagfilterHtml() {
  return {
    exit: {
      htmlFlowData(token) {
        exitHtmlData.call(this, token, reFlow)
      },
      htmlTextData(token) {
        exitHtmlData.call(this, token, reText)
      }
    }
  }
}

/**
 * @this {CompileContext}
 * @param {Token} token
 * @param {RegExp} filter
 * @returns {undefined}
 */
function exitHtmlData(token, filter) {
  let value = this.sliceSerialize(token)

  if (this.options.allowDangerousHtml) {
    value = value.replace(filter, '&lt;$1$2')
  }

  this.raw(this.encode(value))
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-task-list-item/dev/lib/html.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-task-list-item/dev/lib/html.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTaskListItemHtml: () => (/* binding */ gfmTaskListItemHtml)
/* harmony export */ });
/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */

/**
 * Create an HTML extension for `micromark` to support GFM task list items when
 * serializing to HTML.
 *
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to
 *   support GFM task list items when serializing to HTML.
 */
function gfmTaskListItemHtml() {
  return {
    enter: {
      taskListCheck() {
        this.tag('<input type="checkbox" disabled="" ')
      }
    },
    exit: {
      taskListCheck() {
        this.tag('/>')
      },
      taskListCheckValueChecked() {
        this.tag('checked="" ')
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm-task-list-item/dev/lib/syntax.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/micromark-extension-gfm-task-list-item/dev/lib/syntax.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfmTaskListItem: () => (/* binding */ gfmTaskListItem)
/* harmony export */ });
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-factory-space */ "./node_modules/micromark-factory-space/dev/index.js");
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/types.js");
/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 */






const tasklistCheck = {tokenize: tokenizeTasklistCheck}

/**
 * Create an HTML extension for `micromark` to support GFM task list items
 * syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to
 *   support GFM task list items when serializing to HTML.
 */
function gfmTaskListItem() {
  return {
    text: {[micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket]: tasklistCheck}
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeTasklistCheck(effects, ok, nok) {
  const self = this

  return open

  /**
   * At start of task list item check.
   *
   * ```markdown
   * > | * [x] y.
   *       ^
   * ```
   *
   * @type {State}
   */
  function open(code) {
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_1__.ok)(code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.leftSquareBracket, 'expected `[`')

    if (
      // Exit if there’s stuff before.
      self.previous !== micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
      // Exit if not in the first content that is the first child of a list
      // item.
      !self._gfmTasklistFirstContentOfListItem
    ) {
      return nok(code)
    }

    effects.enter('taskListCheck')
    effects.enter('taskListCheckMarker')
    effects.consume(code)
    effects.exit('taskListCheckMarker')
    return inside
  }

  /**
   * In task list item check.
   *
   * ```markdown
   * > | * [x] y.
   *        ^
   * ```
   *
   * @type {State}
   */
  function inside(code) {
    // Currently we match how GH works in files.
    // To match how GH works in comments, use `markdownSpace` (`[\t ]`) instead
    // of `markdownLineEndingOrSpace` (`[\t\n\r ]`).
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEndingOrSpace)(code)) {
      effects.enter('taskListCheckValueUnchecked')
      effects.consume(code)
      effects.exit('taskListCheckValueUnchecked')
      return close
    }

    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseX || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseX) {
      effects.enter('taskListCheckValueChecked')
      effects.consume(code)
      effects.exit('taskListCheckValueChecked')
      return close
    }

    return nok(code)
  }

  /**
   * At close of task list item check.
   *
   * ```markdown
   * > | * [x] y.
   *         ^
   * ```
   *
   * @type {State}
   */
  function close(code) {
    if (code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.rightSquareBracket) {
      effects.enter('taskListCheckMarker')
      effects.consume(code)
      effects.exit('taskListCheckMarker')
      effects.exit('taskListCheck')
      return after
    }

    return nok(code)
  }

  /**
   * @type {State}
   */
  function after(code) {
    // EOL in paragraph means there must be something else after it.
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownLineEnding)(code)) {
      return ok(code)
    }

    // Space or tab?
    // Check what comes after.
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.markdownSpace)(code)) {
      return effects.check({tokenize: spaceThenNonSpace}, ok, nok)(code)
    }

    // EOF, or non-whitespace, both wrong.
    return nok(code)
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function spaceThenNonSpace(effects, ok, nok) {
  return (0,micromark_factory_space__WEBPACK_IMPORTED_MODULE_3__.factorySpace)(effects, after, micromark_util_symbol__WEBPACK_IMPORTED_MODULE_4__.types.whitespace)

  /**
   * After whitespace, after task list item check.
   *
   * ```markdown
   * > | * [x] y.
   *           ^
   * ```
   *
   * @type {State}
   */
  function after(code) {
    // EOF means there was nothing, so bad.
    // EOL means there’s content after it, so good.
    // Impossible to have more spaces.
    // Anything else is good.
    return code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ? nok(code) : ok(code)
  }
}


/***/ }),

/***/ "./node_modules/micromark-extension-gfm/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/micromark-extension-gfm/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gfm: () => (/* binding */ gfm),
/* harmony export */   gfmHtml: () => (/* binding */ gfmHtml)
/* harmony export */ });
/* harmony import */ var micromark_util_combine_extensions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-combine-extensions */ "./node_modules/micromark-util-combine-extensions/index.js");
/* harmony import */ var micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-extension-gfm-autolink-literal */ "./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/syntax.js");
/* harmony import */ var micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! micromark-extension-gfm-autolink-literal */ "./node_modules/micromark-extension-gfm-autolink-literal/dev/lib/html.js");
/* harmony import */ var micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-extension-gfm-footnote */ "./node_modules/micromark-extension-gfm-footnote/dev/lib/syntax.js");
/* harmony import */ var micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! micromark-extension-gfm-footnote */ "./node_modules/micromark-extension-gfm-footnote/dev/lib/html.js");
/* harmony import */ var micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-extension-gfm-strikethrough */ "./node_modules/micromark-extension-gfm-strikethrough/dev/lib/syntax.js");
/* harmony import */ var micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! micromark-extension-gfm-strikethrough */ "./node_modules/micromark-extension-gfm-strikethrough/dev/lib/html.js");
/* harmony import */ var micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! micromark-extension-gfm-table */ "./node_modules/micromark-extension-gfm-table/dev/lib/syntax.js");
/* harmony import */ var micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! micromark-extension-gfm-table */ "./node_modules/micromark-extension-gfm-table/dev/lib/html.js");
/* harmony import */ var micromark_extension_gfm_tagfilter__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! micromark-extension-gfm-tagfilter */ "./node_modules/micromark-extension-gfm-tagfilter/lib/index.js");
/* harmony import */ var micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! micromark-extension-gfm-task-list-item */ "./node_modules/micromark-extension-gfm-task-list-item/dev/lib/syntax.js");
/* harmony import */ var micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! micromark-extension-gfm-task-list-item */ "./node_modules/micromark-extension-gfm-task-list-item/dev/lib/html.js");
/**
 * @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
 * @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 */









/**
 * Create an extension for `micromark` to enable GFM syntax.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 *
 *   Passed to `micromark-extens-gfm-strikethrough`.
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions` to enable GFM
 *   syntax.
 */
function gfm(options) {
  return (0,micromark_util_combine_extensions__WEBPACK_IMPORTED_MODULE_0__.combineExtensions)([
    (0,micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_1__.gfmAutolinkLiteral)(),
    (0,micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_2__.gfmFootnote)(),
    (0,micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_3__.gfmStrikethrough)(options),
    (0,micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_4__.gfmTable)(),
    (0,micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_5__.gfmTaskListItem)()
  ])
}

/**
 * Create an extension for `micromark` to support GFM when serializing to HTML.
 *
 * @param {HtmlOptions | null | undefined} [options]
 *   Configuration (optional).
 *
 *   Passed to `micromark-extens-gfm-footnote`.
 * @returns {HtmlExtension}
 *   Extension for `micromark` that can be passed in `htmlExtensions` to
 *   support GFM when serializing to HTML.
 */
function gfmHtml(options) {
  return (0,micromark_util_combine_extensions__WEBPACK_IMPORTED_MODULE_0__.combineHtmlExtensions)([
    (0,micromark_extension_gfm_autolink_literal__WEBPACK_IMPORTED_MODULE_6__.gfmAutolinkLiteralHtml)(),
    (0,micromark_extension_gfm_footnote__WEBPACK_IMPORTED_MODULE_7__.gfmFootnoteHtml)(options),
    (0,micromark_extension_gfm_strikethrough__WEBPACK_IMPORTED_MODULE_8__.gfmStrikethroughHtml)(),
    (0,micromark_extension_gfm_table__WEBPACK_IMPORTED_MODULE_9__.gfmTableHtml)(),
    (0,micromark_extension_gfm_tagfilter__WEBPACK_IMPORTED_MODULE_10__.gfmTagfilterHtml)(),
    (0,micromark_extension_gfm_task_list_item__WEBPACK_IMPORTED_MODULE_11__.gfmTaskListItemHtml)()
  ])
}


/***/ }),

/***/ "./node_modules/micromark-factory-space/dev/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/micromark-factory-space/dev/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   factorySpace: () => (/* binding */ factorySpace)
/* harmony export */ });
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/**
 * @typedef {import('micromark-util-types').Effects} Effects
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').TokenType} TokenType
 */



// To do: implement `spaceOrTab`, `spaceOrTabMinMax`, `spaceOrTabWithOptions`.

/**
 * Parse spaces and tabs.
 *
 * There is no `nok` parameter:
 *
 * *   spaces in markdown are often optional, in which case this factory can be
 *     used and `ok` will be switched to whether spaces were found or not
 * *   one line ending or space can be detected with `markdownSpace(code)` right
 *     before using `factorySpace`
 *
 * ###### Examples
 *
 * Where `␉` represents a tab (plus how much it expands) and `␠` represents a
 * single space.
 *
 * ```markdown
 * ␉
 * ␠␠␠␠
 * ␉␠
 * ```
 *
 * @param {Effects} effects
 *   Context.
 * @param {State} ok
 *   State switched to when successful.
 * @param {TokenType} type
 *   Type (`' \t'`).
 * @param {number | undefined} [max=Infinity]
 *   Max (exclusive).
 * @returns {State}
 *   Start state.
 */
function factorySpace(effects, ok, type, max) {
  const limit = max ? max - 1 : Number.POSITIVE_INFINITY
  let size = 0

  return start

  /** @type {State} */
  function start(code) {
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_0__.markdownSpace)(code)) {
      effects.enter(type)
      return prefix(code)
    }

    return ok(code)
  }

  /** @type {State} */
  function prefix(code) {
    if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_0__.markdownSpace)(code) && size++ < limit) {
      effects.consume(code)
      return prefix
    }

    effects.exit(type)
    return ok(code)
  }
}


/***/ }),

/***/ "./node_modules/micromark-util-character/dev/index.js":
/*!************************************************************!*\
  !*** ./node_modules/micromark-util-character/dev/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   asciiAlpha: () => (/* binding */ asciiAlpha),
/* harmony export */   asciiAlphanumeric: () => (/* binding */ asciiAlphanumeric),
/* harmony export */   asciiAtext: () => (/* binding */ asciiAtext),
/* harmony export */   asciiControl: () => (/* binding */ asciiControl),
/* harmony export */   asciiDigit: () => (/* binding */ asciiDigit),
/* harmony export */   asciiHexDigit: () => (/* binding */ asciiHexDigit),
/* harmony export */   asciiPunctuation: () => (/* binding */ asciiPunctuation),
/* harmony export */   markdownLineEnding: () => (/* binding */ markdownLineEnding),
/* harmony export */   markdownLineEndingOrSpace: () => (/* binding */ markdownLineEndingOrSpace),
/* harmony export */   markdownSpace: () => (/* binding */ markdownSpace),
/* harmony export */   unicodePunctuation: () => (/* binding */ unicodePunctuation),
/* harmony export */   unicodeWhitespace: () => (/* binding */ unicodeWhitespace)
/* harmony export */ });
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/**
 * @typedef {import('micromark-util-types').Code} Code
 */



const unicodePunctuationInternal = regexCheck(/\p{P}/u)

/**
 * Check whether the character code represents an ASCII alpha (`a` through `z`,
 * case insensitive).
 *
 * An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
 *
 * An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
 * to U+005A (`Z`).
 *
 * An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
 * to U+007A (`z`).
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const asciiAlpha = regexCheck(/[A-Za-z]/)

/**
 * Check whether the character code represents an ASCII alphanumeric (`a`
 * through `z`, case insensitive, or `0` through `9`).
 *
 * An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
 * (see `asciiAlpha`).
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/)

/**
 * Check whether the character code represents an ASCII atext.
 *
 * atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
 * the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
 * U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
 * SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
 * CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
 * (`{`) to U+007E TILDE (`~`).
 *
 * See:
 * **\[RFC5322]**:
 * [Internet Message Format](https://tools.ietf.org/html/rfc5322).
 * P. Resnick.
 * IETF.
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/)

/**
 * Check whether a character code is an ASCII control character.
 *
 * An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
 * to U+001F (US), or U+007F (DEL).
 *
 * @param {Code} code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
function asciiControl(code) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    code !== null && (code < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.space || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.del)
  )
}

/**
 * Check whether the character code represents an ASCII digit (`0` through `9`).
 *
 * An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
 * U+0039 (`9`).
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const asciiDigit = regexCheck(/\d/)

/**
 * Check whether the character code represents an ASCII hex digit (`a` through
 * `f`, case insensitive, or `0` through `9`).
 *
 * An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
 * digit, or an ASCII lower hex digit.
 *
 * An **ASCII upper hex digit** is a character in the inclusive range U+0041
 * (`A`) to U+0046 (`F`).
 *
 * An **ASCII lower hex digit** is a character in the inclusive range U+0061
 * (`a`) to U+0066 (`f`).
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const asciiHexDigit = regexCheck(/[\dA-Fa-f]/)

/**
 * Check whether the character code represents ASCII punctuation.
 *
 * An **ASCII punctuation** is a character in the inclusive ranges U+0021
 * EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
 * SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
 * (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/)

/**
 * Check whether a character code is a markdown line ending.
 *
 * A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
 * LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
 *
 * In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
 * RETURN (CR) are replaced by these virtual characters depending on whether
 * they occurred together.
 *
 * @param {Code} code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
function markdownLineEnding(code) {
  return code !== null && code < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.horizontalTab
}

/**
 * Check whether a character code is a markdown line ending (see
 * `markdownLineEnding`) or markdown space (see `markdownSpace`).
 *
 * @param {Code} code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
function markdownLineEndingOrSpace(code) {
  return code !== null && (code < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.nul || code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.space)
}

/**
 * Check whether a character code is a markdown space.
 *
 * A **markdown space** is the concrete character U+0020 SPACE (SP) and the
 * virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
 *
 * In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
 * replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
 * SPACE (VS) characters, depending on the column at which the tab occurred.
 *
 * @param {Code} code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
function markdownSpace(code) {
  return (
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.horizontalTab ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.virtualSpace ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.space
  )
}

// Size note: removing ASCII from the regex and using `asciiPunctuation` here
// In fact adds to the bundle size.
/**
 * Check whether the character code represents Unicode punctuation.
 *
 * A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
 * Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
 * (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
 * (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
 * punctuation (see `asciiPunctuation`).
 *
 * See:
 * **\[UNICODE]**:
 * [The Unicode Standard](https://www.unicode.org/versions/).
 * Unicode Consortium.
 *
 * @param {Code} code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
function unicodePunctuation(code) {
  return asciiPunctuation(code) || unicodePunctuationInternal(code)
}

/**
 * Check whether the character code represents Unicode whitespace.
 *
 * Note that this does handle micromark specific markdown whitespace characters.
 * See `markdownLineEndingOrSpace` to check that.
 *
 * A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
 * Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
 * U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
 *
 * See:
 * **\[UNICODE]**:
 * [The Unicode Standard](https://www.unicode.org/versions/).
 * Unicode Consortium.
 *
 * @param code
 *   Code.
 * @returns {boolean}
 *   Whether it matches.
 */
const unicodeWhitespace = regexCheck(/\s/)

/**
 * Create a code check from a regex.
 *
 * @param {RegExp} regex
 * @returns {(code: Code) => boolean}
 */
function regexCheck(regex) {
  return check

  /**
   * Check whether a code matches the bound regex.
   *
   * @param {Code} code
   *   Character code.
   * @returns {boolean}
   *   Whether the character code matches the bound regex.
   */
  function check(code) {
    return code !== null && code > -1 && regex.test(String.fromCharCode(code))
  }
}


/***/ }),

/***/ "./node_modules/micromark-util-chunked/dev/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/micromark-util-chunked/dev/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   push: () => (/* binding */ push),
/* harmony export */   splice: () => (/* binding */ splice)
/* harmony export */ });
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/constants.js");


/**
 * Like `Array#splice`, but smarter for giant arrays.
 *
 * `Array#splice` takes all items to be inserted as individual argument which
 * causes a stack overflow in V8 when trying to insert 100k items for instance.
 *
 * Otherwise, this does not return the removed items, and takes `items` as an
 * array instead of rest parameters.
 *
 * @template {unknown} T
 *   Item type.
 * @param {Array<T>} list
 *   List to operate on.
 * @param {number} start
 *   Index to remove/insert at (can be negative).
 * @param {number} remove
 *   Number of items to remove.
 * @param {Array<T>} items
 *   Items to inject into `list`.
 * @returns {undefined}
 *   Nothing.
 */
function splice(list, start, remove, items) {
  const end = list.length
  let chunkStart = 0
  /** @type {Array<unknown>} */
  let parameters

  // Make start between zero and `end` (included).
  if (start < 0) {
    start = -start > end ? 0 : end + start
  } else {
    start = start > end ? end : start
  }

  remove = remove > 0 ? remove : 0

  // No need to chunk the items if there’s only a couple (10k) items.
  if (items.length < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.constants.v8MaxSafeChunkSize) {
    parameters = Array.from(items)
    parameters.unshift(start, remove)
    // @ts-expect-error Hush, it’s fine.
    list.splice(...parameters)
  } else {
    // Delete `remove` items starting from `start`
    if (remove) list.splice(start, remove)

    // Insert the items in chunks to not cause stack overflows.
    while (chunkStart < items.length) {
      parameters = items.slice(
        chunkStart,
        chunkStart + micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.constants.v8MaxSafeChunkSize
      )
      parameters.unshift(start, 0)
      // @ts-expect-error Hush, it’s fine.
      list.splice(...parameters)

      chunkStart += micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.constants.v8MaxSafeChunkSize
      start += micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.constants.v8MaxSafeChunkSize
    }
  }
}

/**
 * Append `items` (an array) at the end of `list` (another array).
 * When `list` was empty, returns `items` instead.
 *
 * This prevents a potentially expensive operation when `list` is empty,
 * and adds items in batches to prevent V8 from hanging.
 *
 * @template {unknown} T
 *   Item type.
 * @param {Array<T>} list
 *   List to operate on.
 * @param {Array<T>} items
 *   Items to add to `list`.
 * @returns {Array<T>}
 *   Either `list` or `items`.
 */
function push(list, items) {
  if (list.length > 0) {
    splice(list, list.length, 0, items)
    return list
  }

  return items
}


/***/ }),

/***/ "./node_modules/micromark-util-classify-character/dev/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/micromark-util-classify-character/dev/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   classifyCharacter: () => (/* binding */ classifyCharacter)
/* harmony export */ });
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/constants.js");
/**
 * @typedef {import('micromark-util-types').Code} Code
 */




/**
 * Classify whether a code represents whitespace, punctuation, or something
 * else.
 *
 * Used for attention (emphasis, strong), whose sequences can open or close
 * based on the class of surrounding characters.
 *
 * > 👉 **Note**: eof (`null`) is seen as whitespace.
 *
 * @param {Code} code
 *   Code.
 * @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
 *   Group.
 */
function classifyCharacter(code) {
  if (
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.eof ||
    (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.markdownLineEndingOrSpace)(code) ||
    (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodeWhitespace)(code)
  ) {
    return micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__.constants.characterGroupWhitespace
  }

  if ((0,micromark_util_character__WEBPACK_IMPORTED_MODULE_1__.unicodePunctuation)(code)) {
    return micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__.constants.characterGroupPunctuation
  }
}


/***/ }),

/***/ "./node_modules/micromark-util-combine-extensions/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/micromark-util-combine-extensions/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   combineExtensions: () => (/* binding */ combineExtensions),
/* harmony export */   combineHtmlExtensions: () => (/* binding */ combineHtmlExtensions)
/* harmony export */ });
/* harmony import */ var micromark_util_chunked__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-chunked */ "./node_modules/micromark-util-chunked/dev/index.js");
/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Handles} Handles
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').NormalizedExtension} NormalizedExtension
 */



const hasOwnProperty = {}.hasOwnProperty

/**
 * Combine multiple syntax extensions into one.
 *
 * @param {Array<Extension>} extensions
 *   List of syntax extensions.
 * @returns {NormalizedExtension}
 *   A single combined extension.
 */
function combineExtensions(extensions) {
  /** @type {NormalizedExtension} */
  const all = {}
  let index = -1

  while (++index < extensions.length) {
    syntaxExtension(all, extensions[index])
  }

  return all
}

/**
 * Merge `extension` into `all`.
 *
 * @param {NormalizedExtension} all
 *   Extension to merge into.
 * @param {Extension} extension
 *   Extension to merge.
 * @returns {undefined}
 */
function syntaxExtension(all, extension) {
  /** @type {keyof Extension} */
  let hook

  for (hook in extension) {
    const maybe = hasOwnProperty.call(all, hook) ? all[hook] : undefined
    /** @type {Record<string, unknown>} */
    const left = maybe || (all[hook] = {})
    /** @type {Record<string, unknown> | undefined} */
    const right = extension[hook]
    /** @type {string} */
    let code

    if (right) {
      for (code in right) {
        if (!hasOwnProperty.call(left, code)) left[code] = []
        const value = right[code]
        constructs(
          // @ts-expect-error Looks like a list.
          left[code],
          Array.isArray(value) ? value : value ? [value] : []
        )
      }
    }
  }
}

/**
 * Merge `list` into `existing` (both lists of constructs).
 * Mutates `existing`.
 *
 * @param {Array<unknown>} existing
 * @param {Array<unknown>} list
 * @returns {undefined}
 */
function constructs(existing, list) {
  let index = -1
  /** @type {Array<unknown>} */
  const before = []

  while (++index < list.length) {
    // @ts-expect-error Looks like an object.
    ;(list[index].add === 'after' ? existing : before).push(list[index])
  }

  (0,micromark_util_chunked__WEBPACK_IMPORTED_MODULE_0__.splice)(existing, 0, 0, before)
}

/**
 * Combine multiple HTML extensions into one.
 *
 * @param {Array<HtmlExtension>} htmlExtensions
 *   List of HTML extensions.
 * @returns {HtmlExtension}
 *   A single combined HTML extension.
 */
function combineHtmlExtensions(htmlExtensions) {
  /** @type {HtmlExtension} */
  const handlers = {}
  let index = -1

  while (++index < htmlExtensions.length) {
    htmlExtension(handlers, htmlExtensions[index])
  }

  return handlers
}

/**
 * Merge `extension` into `all`.
 *
 * @param {HtmlExtension} all
 *   Extension to merge into.
 * @param {HtmlExtension} extension
 *   Extension to merge.
 * @returns {undefined}
 */
function htmlExtension(all, extension) {
  /** @type {keyof HtmlExtension} */
  let hook

  for (hook in extension) {
    const maybe = hasOwnProperty.call(all, hook) ? all[hook] : undefined
    const left = maybe || (all[hook] = {})
    const right = extension[hook]
    /** @type {keyof Handles} */
    let type

    if (right) {
      for (type in right) {
        // @ts-expect-error assume document vs regular handler are managed correctly.
        left[type] = right[type]
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/micromark-util-decode-numeric-character-reference/dev/index.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/micromark-util-decode-numeric-character-reference/dev/index.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeNumericCharacterReference: () => (/* binding */ decodeNumericCharacterReference)
/* harmony export */ });
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/values.js");


/**
 * Turn the number (in string form as either hexa- or plain decimal) coming from
 * a numeric character reference into a character.
 *
 * Sort of like `String.fromCodePoint(Number.parseInt(value, base))`, but makes
 * non-characters and control characters safe.
 *
 * @param {string} value
 *   Value to decode.
 * @param {number} base
 *   Numeric base.
 * @returns {string}
 *   Character.
 */
function decodeNumericCharacterReference(value, base) {
  const code = Number.parseInt(value, base)

  if (
    // C0 except for HT, LF, FF, CR, space.
    code < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.ht ||
    code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.vt ||
    (code > micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.cr && code < micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.space) ||
    // Control character (DEL) of C0, and C1 controls.
    (code > micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.tilde && code < 160) ||
    // Lone high surrogates and low surrogates.
    (code > 55_295 && code < 57_344) ||
    // Noncharacters.
    (code > 64_975 && code < 65_008) ||
    /* eslint-disable no-bitwise */
    (code & 65_535) === 65_535 ||
    (code & 65_535) === 65_534 ||
    /* eslint-enable no-bitwise */
    // Out of range
    code > 1_114_111
  ) {
    return micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.values.replacementCharacter
  }

  return String.fromCodePoint(code)
}


/***/ }),

/***/ "./node_modules/micromark-util-decode-string/dev/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/micromark-util-decode-string/dev/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeString: () => (/* binding */ decodeString)
/* harmony export */ });
/* harmony import */ var decode_named_character_reference__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! decode-named-character-reference */ "./node_modules/decode-named-character-reference/index.dom.js");
/* harmony import */ var micromark_util_decode_numeric_character_reference__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-decode-numeric-character-reference */ "./node_modules/micromark-util-decode-numeric-character-reference/dev/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/constants.js");




const characterEscapeOrReference =
  /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi

/**
 * Decode markdown strings (which occur in places such as fenced code info
 * strings, destinations, labels, and titles).
 *
 * The “string” content type allows character escapes and -references.
 * This decodes those.
 *
 * @param {string} value
 *   Value to decode.
 * @returns {string}
 *   Decoded value.
 */
function decodeString(value) {
  return value.replace(characterEscapeOrReference, decode)
}

/**
 * @param {string} $0
 * @param {string} $1
 * @param {string} $2
 * @returns {string}
 */
function decode($0, $1, $2) {
  if ($1) {
    // Escape.
    return $1
  }

  // Reference.
  const head = $2.charCodeAt(0)

  if (head === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.numberSign) {
    const head = $2.charCodeAt(1)
    const hex = head === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.lowercaseX || head === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.codes.uppercaseX
    return (0,micromark_util_decode_numeric_character_reference__WEBPACK_IMPORTED_MODULE_1__.decodeNumericCharacterReference)(
      $2.slice(hex ? 2 : 1),
      hex ? micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__.constants.numericBaseHexadecimal : micromark_util_symbol__WEBPACK_IMPORTED_MODULE_2__.constants.numericBaseDecimal
    )
  }

  return (0,decode_named_character_reference__WEBPACK_IMPORTED_MODULE_3__.decodeNamedCharacterReference)($2) || $0
}


/***/ }),

/***/ "./node_modules/micromark-util-encode/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/micromark-util-encode/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   encode: () => (/* binding */ encode)
/* harmony export */ });
const characterReferences = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt'}

/**
 * Encode only the dangerous HTML characters.
 *
 * This ensures that certain characters which have special meaning in HTML are
 * dealt with.
 * Technically, we can skip `>` and `"` in many cases, but CM includes them.
 *
 * @param {string} value
 *   Value to encode.
 * @returns {string}
 *   Encoded value.
 */
function encode(value) {
  return value.replace(/["&<>]/g, replace)

  /**
   * @param {string} value
   * @returns {string}
   */
  function replace(value) {
    // @ts-expect-error Hush, it’s fine.
    return '&' + characterReferences[value] + ';'
  }
}


/***/ }),

/***/ "./node_modules/micromark-util-normalize-identifier/dev/index.js":
/*!***********************************************************************!*\
  !*** ./node_modules/micromark-util-normalize-identifier/dev/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalizeIdentifier: () => (/* binding */ normalizeIdentifier)
/* harmony export */ });
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/values.js");


/**
 * Normalize an identifier (as found in references, definitions).
 *
 * Collapses markdown whitespace, trim, and then lower- and uppercase.
 *
 * Some characters are considered “uppercase”, such as U+03F4 (`ϴ`), but if their
 * lowercase counterpart (U+03B8 (`θ`)) is uppercased will result in a different
 * uppercase character (U+0398 (`Θ`)).
 * So, to get a canonical form, we perform both lower- and uppercase.
 *
 * Using uppercase last makes sure keys will never interact with default
 * prototypal values (such as `constructor`): nothing in the prototype of
 * `Object` is uppercase.
 *
 * @param {string} value
 *   Identifier to normalize.
 * @returns {string}
 *   Normalized identifier.
 */
function normalizeIdentifier(value) {
  return (
    value
      // Collapse markdown whitespace.
      .replace(/[\t\n\r ]+/g, micromark_util_symbol__WEBPACK_IMPORTED_MODULE_0__.values.space)
      // Trim.
      .replace(/^ | $/g, '')
      // Some characters are considered “uppercase”, but if their lowercase
      // counterpart is uppercased will result in a different uppercase
      // character.
      // Hence, to get that form, we perform both lower- and uppercase.
      // Upper case makes sure keys will not interact with default prototypal
      // methods: no method is uppercase.
      .toLowerCase()
      .toUpperCase()
  )
}


/***/ }),

/***/ "./node_modules/micromark-util-resolve-all/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/micromark-util-resolve-all/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resolveAll: () => (/* binding */ resolveAll)
/* harmony export */ });
/**
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 */

/**
 * Call all `resolveAll`s.
 *
 * @param {Array<{resolveAll?: Resolver | undefined}>} constructs
 *   List of constructs, optionally with `resolveAll`s.
 * @param {Array<Event>} events
 *   List of events.
 * @param {TokenizeContext} context
 *   Context used by `tokenize`.
 * @returns {Array<Event>}
 *   Changed events.
 */
function resolveAll(constructs, events, context) {
  /** @type {Array<Resolver>} */
  const called = []
  let index = -1

  while (++index < constructs.length) {
    const resolve = constructs[index].resolveAll

    if (resolve && !called.includes(resolve)) {
      events = resolve(events, context)
      called.push(resolve)
    }
  }

  return events
}


/***/ }),

/***/ "./node_modules/micromark-util-sanitize-uri/dev/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/micromark-util-sanitize-uri/dev/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalizeUri: () => (/* binding */ normalizeUri),
/* harmony export */   sanitizeUri: () => (/* binding */ sanitizeUri)
/* harmony export */ });
/* harmony import */ var micromark_util_character__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! micromark-util-character */ "./node_modules/micromark-util-character/dev/index.js");
/* harmony import */ var micromark_util_encode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-util-encode */ "./node_modules/micromark-util-encode/index.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/codes.js");
/* harmony import */ var micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! micromark-util-symbol */ "./node_modules/micromark-util-symbol/lib/values.js");




/**
 * Make a value safe for injection as a URL.
 *
 * This encodes unsafe characters with percent-encoding and skips already
 * encoded sequences (see `normalizeUri`).
 * Further unsafe characters are encoded as character references (see
 * `micromark-util-encode`).
 *
 * A regex of allowed protocols can be given, in which case the URL is
 * sanitized.
 * For example, `/^(https?|ircs?|mailto|xmpp)$/i` can be used for `a[href]`, or
 * `/^https?$/i` for `img[src]` (this is what `github.com` allows).
 * If the URL includes an unknown protocol (one not matched by `protocol`, such
 * as a dangerous example, `javascript:`), the value is ignored.
 *
 * @param {string | null | undefined} url
 *   URI to sanitize.
 * @param {RegExp | null | undefined} [protocol]
 *   Allowed protocols.
 * @returns {string}
 *   Sanitized URI.
 */
function sanitizeUri(url, protocol) {
  const value = (0,micromark_util_encode__WEBPACK_IMPORTED_MODULE_0__.encode)(normalizeUri(url || ''))

  if (!protocol) {
    return value
  }

  const colon = value.indexOf(':')
  const questionMark = value.indexOf('?')
  const numberSign = value.indexOf('#')
  const slash = value.indexOf('/')

  if (
    // If there is no protocol, it’s relative.
    colon < 0 ||
    // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    (slash > -1 && colon > slash) ||
    (questionMark > -1 && colon > questionMark) ||
    (numberSign > -1 && colon > numberSign) ||
    // It is a protocol, it should be allowed.
    protocol.test(value.slice(0, colon))
  ) {
    return value
  }

  return ''
}

/**
 * Normalize a URL.
 *
 * Encode unsafe characters with percent-encoding, skipping already encoded
 * sequences.
 *
 * @param {string} value
 *   URI to normalize.
 * @returns {string}
 *   Normalized URI.
 */
function normalizeUri(value) {
  /** @type {Array<string>} */
  const result = []
  let index = -1
  let start = 0
  let skip = 0

  while (++index < value.length) {
    const code = value.charCodeAt(index)
    /** @type {string} */
    let replace = ''

    // A correct percent encoded value.
    if (
      code === micromark_util_symbol__WEBPACK_IMPORTED_MODULE_1__.codes.percentSign &&
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.asciiAlphanumeric)(value.charCodeAt(index + 1)) &&
      (0,micromark_util_character__WEBPACK_IMPORTED_MODULE_2__.asciiAlphanumeric)(value.charCodeAt(index + 2))
    ) {
      skip = 2
    }
    // ASCII.
    else if (code < 128) {
      if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code))) {
        replace = String.fromCharCode(code)
      }
    }
    // Astral.
    else if (code > 55_295 && code < 57_344) {
      const next = value.charCodeAt(index + 1)

      // A correct surrogate pair.
      if (code < 56_320 && next > 56_319 && next < 57_344) {
        replace = String.fromCharCode(code, next)
        skip = 1
      }
      // Lone surrogate.
      else {
        replace = micromark_util_symbol__WEBPACK_IMPORTED_MODULE_3__.values.replacementCharacter
      }
    }
    // Unicode.
    else {
      replace = String.fromCharCode(code)
    }

    if (replace) {
      result.push(value.slice(start, index), encodeURIComponent(replace))
      start = index + skip + 1
      replace = ''
    }

    if (skip) {
      index += skip
      skip = 0
    }
  }

  return result.join('') + value.slice(start)
}


/***/ }),

/***/ "./node_modules/micromark-util-symbol/lib/codes.js":
/*!*********************************************************!*\
  !*** ./node_modules/micromark-util-symbol/lib/codes.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   codes: () => (/* binding */ codes)
/* harmony export */ });
/**
 * Character codes.
 *
 * This module is compiled away!
 *
 * micromark works based on character codes.
 * This module contains constants for the ASCII block and the replacement
 * character.
 * A couple of them are handled in a special way, such as the line endings
 * (CR, LF, and CR+LF, commonly known as end-of-line: EOLs), the tab (horizontal
 * tab) and its expansion based on what column it’s at (virtual space),
 * and the end-of-file (eof) character.
 * As values are preprocessed before handling them, the actual characters LF,
 * CR, HT, and NUL (which is present as the replacement character), are
 * guaranteed to not exist.
 *
 * Unicode basic latin block.
 */
const codes = /** @type {const} */ ({
  carriageReturn: -5,
  lineFeed: -4,
  carriageReturnLineFeed: -3,
  horizontalTab: -2,
  virtualSpace: -1,
  eof: null,
  nul: 0,
  soh: 1,
  stx: 2,
  etx: 3,
  eot: 4,
  enq: 5,
  ack: 6,
  bel: 7,
  bs: 8,
  ht: 9, // `\t`
  lf: 10, // `\n`
  vt: 11, // `\v`
  ff: 12, // `\f`
  cr: 13, // `\r`
  so: 14,
  si: 15,
  dle: 16,
  dc1: 17,
  dc2: 18,
  dc3: 19,
  dc4: 20,
  nak: 21,
  syn: 22,
  etb: 23,
  can: 24,
  em: 25,
  sub: 26,
  esc: 27,
  fs: 28,
  gs: 29,
  rs: 30,
  us: 31,
  space: 32,
  exclamationMark: 33, // `!`
  quotationMark: 34, // `"`
  numberSign: 35, // `#`
  dollarSign: 36, // `$`
  percentSign: 37, // `%`
  ampersand: 38, // `&`
  apostrophe: 39, // `'`
  leftParenthesis: 40, // `(`
  rightParenthesis: 41, // `)`
  asterisk: 42, // `*`
  plusSign: 43, // `+`
  comma: 44, // `,`
  dash: 45, // `-`
  dot: 46, // `.`
  slash: 47, // `/`
  digit0: 48, // `0`
  digit1: 49, // `1`
  digit2: 50, // `2`
  digit3: 51, // `3`
  digit4: 52, // `4`
  digit5: 53, // `5`
  digit6: 54, // `6`
  digit7: 55, // `7`
  digit8: 56, // `8`
  digit9: 57, // `9`
  colon: 58, // `:`
  semicolon: 59, // `;`
  lessThan: 60, // `<`
  equalsTo: 61, // `=`
  greaterThan: 62, // `>`
  questionMark: 63, // `?`
  atSign: 64, // `@`
  uppercaseA: 65, // `A`
  uppercaseB: 66, // `B`
  uppercaseC: 67, // `C`
  uppercaseD: 68, // `D`
  uppercaseE: 69, // `E`
  uppercaseF: 70, // `F`
  uppercaseG: 71, // `G`
  uppercaseH: 72, // `H`
  uppercaseI: 73, // `I`
  uppercaseJ: 74, // `J`
  uppercaseK: 75, // `K`
  uppercaseL: 76, // `L`
  uppercaseM: 77, // `M`
  uppercaseN: 78, // `N`
  uppercaseO: 79, // `O`
  uppercaseP: 80, // `P`
  uppercaseQ: 81, // `Q`
  uppercaseR: 82, // `R`
  uppercaseS: 83, // `S`
  uppercaseT: 84, // `T`
  uppercaseU: 85, // `U`
  uppercaseV: 86, // `V`
  uppercaseW: 87, // `W`
  uppercaseX: 88, // `X`
  uppercaseY: 89, // `Y`
  uppercaseZ: 90, // `Z`
  leftSquareBracket: 91, // `[`
  backslash: 92, // `\`
  rightSquareBracket: 93, // `]`
  caret: 94, // `^`
  underscore: 95, // `_`
  graveAccent: 96, // `` ` ``
  lowercaseA: 97, // `a`
  lowercaseB: 98, // `b`
  lowercaseC: 99, // `c`
  lowercaseD: 100, // `d`
  lowercaseE: 101, // `e`
  lowercaseF: 102, // `f`
  lowercaseG: 103, // `g`
  lowercaseH: 104, // `h`
  lowercaseI: 105, // `i`
  lowercaseJ: 106, // `j`
  lowercaseK: 107, // `k`
  lowercaseL: 108, // `l`
  lowercaseM: 109, // `m`
  lowercaseN: 110, // `n`
  lowercaseO: 111, // `o`
  lowercaseP: 112, // `p`
  lowercaseQ: 113, // `q`
  lowercaseR: 114, // `r`
  lowercaseS: 115, // `s`
  lowercaseT: 116, // `t`
  lowercaseU: 117, // `u`
  lowercaseV: 118, // `v`
  lowercaseW: 119, // `w`
  lowercaseX: 120, // `x`
  lowercaseY: 121, // `y`
  lowercaseZ: 122, // `z`
  leftCurlyBrace: 123, // `{`
  verticalBar: 124, // `|`
  rightCurlyBrace: 125, // `}`
  tilde: 126, // `~`
  del: 127,
  // Unicode Specials block.
  byteOrderMarker: 65279,
  // Unicode Specials block.
  replacementCharacter: 65533 // `�`
})


/***/ }),

/***/ "./node_modules/micromark-util-symbol/lib/constants.js":
/*!*************************************************************!*\
  !*** ./node_modules/micromark-util-symbol/lib/constants.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   constants: () => (/* binding */ constants)
/* harmony export */ });
/**
 * This module is compiled away!
 *
 * Parsing markdown comes with a couple of constants, such as minimum or maximum
 * sizes of certain sequences.
 * Additionally, there are a couple symbols used inside micromark.
 * These are all defined here, but compiled away by scripts.
 */
const constants = /** @type {const} */ ({
  attentionSideBefore: 1, // Symbol to mark an attention sequence as before content: `*a`
  attentionSideAfter: 2, // Symbol to mark an attention sequence as after content: `a*`
  atxHeadingOpeningFenceSizeMax: 6, // 6 number signs is fine, 7 isn’t.
  autolinkDomainSizeMax: 63, // 63 characters is fine, 64 is too many.
  autolinkSchemeSizeMax: 32, // 32 characters is fine, 33 is too many.
  cdataOpeningString: 'CDATA[', // And preceded by `<![`.
  characterGroupWhitespace: 1, // Symbol used to indicate a character is whitespace
  characterGroupPunctuation: 2, // Symbol used to indicate a character is punctuation
  characterReferenceDecimalSizeMax: 7, // `&#9999999;`.
  characterReferenceHexadecimalSizeMax: 6, // `&#xff9999;`.
  characterReferenceNamedSizeMax: 31, // `&CounterClockwiseContourIntegral;`.
  codeFencedSequenceSizeMin: 3, // At least 3 ticks or tildes are needed.
  contentTypeDocument: 'document',
  contentTypeFlow: 'flow',
  contentTypeContent: 'content',
  contentTypeString: 'string',
  contentTypeText: 'text',
  hardBreakPrefixSizeMin: 2, // At least 2 trailing spaces are needed.
  htmlRaw: 1, // Symbol for `<script>`
  htmlComment: 2, // Symbol for `<!---->`
  htmlInstruction: 3, // Symbol for `<?php?>`
  htmlDeclaration: 4, // Symbol for `<!doctype>`
  htmlCdata: 5, // Symbol for `<![CDATA[]]>`
  htmlBasic: 6, // Symbol for `<div`
  htmlComplete: 7, // Symbol for `<x>`
  htmlRawSizeMax: 8, // Length of `textarea`.
  linkResourceDestinationBalanceMax: 32, // See: <https://spec.commonmark.org/0.30/#link-destination>, <https://github.com/remarkjs/react-markdown/issues/658#issuecomment-984345577>
  linkReferenceSizeMax: 999, // See: <https://spec.commonmark.org/0.30/#link-label>
  listItemValueSizeMax: 10, // See: <https://spec.commonmark.org/0.30/#ordered-list-marker>
  numericBaseDecimal: 10,
  numericBaseHexadecimal: 0x10,
  tabSize: 4, // Tabs have a hard-coded size of 4, per CommonMark.
  thematicBreakMarkerCountMin: 3, // At least 3 asterisks, dashes, or underscores are needed.
  v8MaxSafeChunkSize: 10000 // V8 (and potentially others) have problems injecting giant arrays into other arrays, hence we operate in chunks.
})


/***/ }),

/***/ "./node_modules/micromark-util-symbol/lib/types.js":
/*!*********************************************************!*\
  !*** ./node_modules/micromark-util-symbol/lib/types.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   types: () => (/* binding */ types)
/* harmony export */ });
/**
 * This module is compiled away!
 *
 * Here is the list of all types of tokens exposed by micromark, with a short
 * explanation of what they include and where they are found.
 * In picking names, generally, the rule is to be as explicit as possible
 * instead of reusing names.
 * For example, there is a `definitionDestination` and a `resourceDestination`,
 * instead of one shared name.
 */

// Note: when changing the next record, you must also change `TokenTypeMap`
// in `micromark-util-types/index.d.ts`.
const types = /** @type {const} */ ({
  // Generic type for data, such as in a title, a destination, etc.
  data: 'data',

  // Generic type for syntactic whitespace (tabs, virtual spaces, spaces).
  // Such as, between a fenced code fence and an info string.
  whitespace: 'whitespace',

  // Generic type for line endings (line feed, carriage return, carriage return +
  // line feed).
  lineEnding: 'lineEnding',

  // A line ending, but ending a blank line.
  lineEndingBlank: 'lineEndingBlank',

  // Generic type for whitespace (tabs, virtual spaces, spaces) at the start of a
  // line.
  linePrefix: 'linePrefix',

  // Generic type for whitespace (tabs, virtual spaces, spaces) at the end of a
  // line.
  lineSuffix: 'lineSuffix',

  // Whole ATX heading:
  //
  // ```markdown
  // #
  // ## Alpha
  // ### Bravo ###
  // ```
  //
  // Includes `atxHeadingSequence`, `whitespace`, `atxHeadingText`.
  atxHeading: 'atxHeading',

  // Sequence of number signs in an ATX heading (`###`).
  atxHeadingSequence: 'atxHeadingSequence',

  // Content in an ATX heading (`alpha`).
  // Includes text.
  atxHeadingText: 'atxHeadingText',

  // Whole autolink (`<https://example.com>` or `<admin@example.com>`)
  // Includes `autolinkMarker` and `autolinkProtocol` or `autolinkEmail`.
  autolink: 'autolink',

  // Email autolink w/o markers (`admin@example.com`)
  autolinkEmail: 'autolinkEmail',

  // Marker around an `autolinkProtocol` or `autolinkEmail` (`<` or `>`).
  autolinkMarker: 'autolinkMarker',

  // Protocol autolink w/o markers (`https://example.com`)
  autolinkProtocol: 'autolinkProtocol',

  // A whole character escape (`\-`).
  // Includes `escapeMarker` and `characterEscapeValue`.
  characterEscape: 'characterEscape',

  // The escaped character (`-`).
  characterEscapeValue: 'characterEscapeValue',

  // A whole character reference (`&amp;`, `&#8800;`, or `&#x1D306;`).
  // Includes `characterReferenceMarker`, an optional
  // `characterReferenceMarkerNumeric`, in which case an optional
  // `characterReferenceMarkerHexadecimal`, and a `characterReferenceValue`.
  characterReference: 'characterReference',

  // The start or end marker (`&` or `;`).
  characterReferenceMarker: 'characterReferenceMarker',

  // Mark reference as numeric (`#`).
  characterReferenceMarkerNumeric: 'characterReferenceMarkerNumeric',

  // Mark reference as numeric (`x` or `X`).
  characterReferenceMarkerHexadecimal: 'characterReferenceMarkerHexadecimal',

  // Value of character reference w/o markers (`amp`, `8800`, or `1D306`).
  characterReferenceValue: 'characterReferenceValue',

  // Whole fenced code:
  //
  // ````markdown
  // ```js
  // alert(1)
  // ```
  // ````
  codeFenced: 'codeFenced',

  // A fenced code fence, including whitespace, sequence, info, and meta
  // (` ```js `).
  codeFencedFence: 'codeFencedFence',

  // Sequence of grave accent or tilde characters (` ``` `) in a fence.
  codeFencedFenceSequence: 'codeFencedFenceSequence',

  // Info word (`js`) in a fence.
  // Includes string.
  codeFencedFenceInfo: 'codeFencedFenceInfo',

  // Meta words (`highlight="1"`) in a fence.
  // Includes string.
  codeFencedFenceMeta: 'codeFencedFenceMeta',

  // A line of code.
  codeFlowValue: 'codeFlowValue',

  // Whole indented code:
  //
  // ```markdown
  //     alert(1)
  // ```
  //
  // Includes `lineEnding`, `linePrefix`, and `codeFlowValue`.
  codeIndented: 'codeIndented',

  // A text code (``` `alpha` ```).
  // Includes `codeTextSequence`, `codeTextData`, `lineEnding`, and can include
  // `codeTextPadding`.
  codeText: 'codeText',

  codeTextData: 'codeTextData',

  // A space or line ending right after or before a tick.
  codeTextPadding: 'codeTextPadding',

  // A text code fence (` `` `).
  codeTextSequence: 'codeTextSequence',

  // Whole content:
  //
  // ```markdown
  // [a]: b
  // c
  // =
  // d
  // ```
  //
  // Includes `paragraph` and `definition`.
  content: 'content',
  // Whole definition:
  //
  // ```markdown
  // [micromark]: https://github.com/micromark/micromark
  // ```
  //
  // Includes `definitionLabel`, `definitionMarker`, `whitespace`,
  // `definitionDestination`, and optionally `lineEnding` and `definitionTitle`.
  definition: 'definition',

  // Destination of a definition (`https://github.com/micromark/micromark` or
  // `<https://github.com/micromark/micromark>`).
  // Includes `definitionDestinationLiteral` or `definitionDestinationRaw`.
  definitionDestination: 'definitionDestination',

  // Enclosed destination of a definition
  // (`<https://github.com/micromark/micromark>`).
  // Includes `definitionDestinationLiteralMarker` and optionally
  // `definitionDestinationString`.
  definitionDestinationLiteral: 'definitionDestinationLiteral',

  // Markers of an enclosed definition destination (`<` or `>`).
  definitionDestinationLiteralMarker: 'definitionDestinationLiteralMarker',

  // Unenclosed destination of a definition
  // (`https://github.com/micromark/micromark`).
  // Includes `definitionDestinationString`.
  definitionDestinationRaw: 'definitionDestinationRaw',

  // Text in an destination (`https://github.com/micromark/micromark`).
  // Includes string.
  definitionDestinationString: 'definitionDestinationString',

  // Label of a definition (`[micromark]`).
  // Includes `definitionLabelMarker` and `definitionLabelString`.
  definitionLabel: 'definitionLabel',

  // Markers of a definition label (`[` or `]`).
  definitionLabelMarker: 'definitionLabelMarker',

  // Value of a definition label (`micromark`).
  // Includes string.
  definitionLabelString: 'definitionLabelString',

  // Marker between a label and a destination (`:`).
  definitionMarker: 'definitionMarker',

  // Title of a definition (`"x"`, `'y'`, or `(z)`).
  // Includes `definitionTitleMarker` and optionally `definitionTitleString`.
  definitionTitle: 'definitionTitle',

  // Marker around a title of a definition (`"`, `'`, `(`, or `)`).
  definitionTitleMarker: 'definitionTitleMarker',

  // Data without markers in a title (`z`).
  // Includes string.
  definitionTitleString: 'definitionTitleString',

  // Emphasis (`*alpha*`).
  // Includes `emphasisSequence` and `emphasisText`.
  emphasis: 'emphasis',

  // Sequence of emphasis markers (`*` or `_`).
  emphasisSequence: 'emphasisSequence',

  // Emphasis text (`alpha`).
  // Includes text.
  emphasisText: 'emphasisText',

  // The character escape marker (`\`).
  escapeMarker: 'escapeMarker',

  // A hard break created with a backslash (`\\n`).
  // Note: does not include the line ending.
  hardBreakEscape: 'hardBreakEscape',

  // A hard break created with trailing spaces (`  \n`).
  // Does not include the line ending.
  hardBreakTrailing: 'hardBreakTrailing',

  // Flow HTML:
  //
  // ```markdown
  // <div
  // ```
  //
  // Inlcudes `lineEnding`, `htmlFlowData`.
  htmlFlow: 'htmlFlow',

  htmlFlowData: 'htmlFlowData',

  // HTML in text (the tag in `a <i> b`).
  // Includes `lineEnding`, `htmlTextData`.
  htmlText: 'htmlText',

  htmlTextData: 'htmlTextData',

  // Whole image (`![alpha](bravo)`, `![alpha][bravo]`, `![alpha][]`, or
  // `![alpha]`).
  // Includes `label` and an optional `resource` or `reference`.
  image: 'image',

  // Whole link label (`[*alpha*]`).
  // Includes `labelLink` or `labelImage`, `labelText`, and `labelEnd`.
  label: 'label',

  // Text in an label (`*alpha*`).
  // Includes text.
  labelText: 'labelText',

  // Start a link label (`[`).
  // Includes a `labelMarker`.
  labelLink: 'labelLink',

  // Start an image label (`![`).
  // Includes `labelImageMarker` and `labelMarker`.
  labelImage: 'labelImage',

  // Marker of a label (`[` or `]`).
  labelMarker: 'labelMarker',

  // Marker to start an image (`!`).
  labelImageMarker: 'labelImageMarker',

  // End a label (`]`).
  // Includes `labelMarker`.
  labelEnd: 'labelEnd',

  // Whole link (`[alpha](bravo)`, `[alpha][bravo]`, `[alpha][]`, or `[alpha]`).
  // Includes `label` and an optional `resource` or `reference`.
  link: 'link',

  // Whole paragraph:
  //
  // ```markdown
  // alpha
  // bravo.
  // ```
  //
  // Includes text.
  paragraph: 'paragraph',

  // A reference (`[alpha]` or `[]`).
  // Includes `referenceMarker` and an optional `referenceString`.
  reference: 'reference',

  // A reference marker (`[` or `]`).
  referenceMarker: 'referenceMarker',

  // Reference text (`alpha`).
  // Includes string.
  referenceString: 'referenceString',

  // A resource (`(https://example.com "alpha")`).
  // Includes `resourceMarker`, an optional `resourceDestination` with an optional
  // `whitespace` and `resourceTitle`.
  resource: 'resource',

  // A resource destination (`https://example.com`).
  // Includes `resourceDestinationLiteral` or `resourceDestinationRaw`.
  resourceDestination: 'resourceDestination',

  // A literal resource destination (`<https://example.com>`).
  // Includes `resourceDestinationLiteralMarker` and optionally
  // `resourceDestinationString`.
  resourceDestinationLiteral: 'resourceDestinationLiteral',

  // A resource destination marker (`<` or `>`).
  resourceDestinationLiteralMarker: 'resourceDestinationLiteralMarker',

  // A raw resource destination (`https://example.com`).
  // Includes `resourceDestinationString`.
  resourceDestinationRaw: 'resourceDestinationRaw',

  // Resource destination text (`https://example.com`).
  // Includes string.
  resourceDestinationString: 'resourceDestinationString',

  // A resource marker (`(` or `)`).
  resourceMarker: 'resourceMarker',

  // A resource title (`"alpha"`, `'alpha'`, or `(alpha)`).
  // Includes `resourceTitleMarker` and optionally `resourceTitleString`.
  resourceTitle: 'resourceTitle',

  // A resource title marker (`"`, `'`, `(`, or `)`).
  resourceTitleMarker: 'resourceTitleMarker',

  // Resource destination title (`alpha`).
  // Includes string.
  resourceTitleString: 'resourceTitleString',

  // Whole setext heading:
  //
  // ```markdown
  // alpha
  // bravo
  // =====
  // ```
  //
  // Includes `setextHeadingText`, `lineEnding`, `linePrefix`, and
  // `setextHeadingLine`.
  setextHeading: 'setextHeading',

  // Content in a setext heading (`alpha\nbravo`).
  // Includes text.
  setextHeadingText: 'setextHeadingText',

  // Underline in a setext heading, including whitespace suffix (`==`).
  // Includes `setextHeadingLineSequence`.
  setextHeadingLine: 'setextHeadingLine',

  // Sequence of equals or dash characters in underline in a setext heading (`-`).
  setextHeadingLineSequence: 'setextHeadingLineSequence',

  // Strong (`**alpha**`).
  // Includes `strongSequence` and `strongText`.
  strong: 'strong',

  // Sequence of strong markers (`**` or `__`).
  strongSequence: 'strongSequence',

  // Strong text (`alpha`).
  // Includes text.
  strongText: 'strongText',

  // Whole thematic break:
  //
  // ```markdown
  // * * *
  // ```
  //
  // Includes `thematicBreakSequence` and `whitespace`.
  thematicBreak: 'thematicBreak',

  // A sequence of one or more thematic break markers (`***`).
  thematicBreakSequence: 'thematicBreakSequence',

  // Whole block quote:
  //
  // ```markdown
  // > a
  // >
  // > b
  // ```
  //
  // Includes `blockQuotePrefix` and flow.
  blockQuote: 'blockQuote',
  // The `>` or `> ` of a block quote.
  blockQuotePrefix: 'blockQuotePrefix',
  // The `>` of a block quote prefix.
  blockQuoteMarker: 'blockQuoteMarker',
  // The optional ` ` of a block quote prefix.
  blockQuotePrefixWhitespace: 'blockQuotePrefixWhitespace',

  // Whole unordered list:
  //
  // ```markdown
  // - a
  //   b
  // ```
  //
  // Includes `listItemPrefix`, flow, and optionally  `listItemIndent` on further
  // lines.
  listOrdered: 'listOrdered',

  // Whole ordered list:
  //
  // ```markdown
  // 1. a
  //    b
  // ```
  //
  // Includes `listItemPrefix`, flow, and optionally  `listItemIndent` on further
  // lines.
  listUnordered: 'listUnordered',

  // The indent of further list item lines.
  listItemIndent: 'listItemIndent',

  // A marker, as in, `*`, `+`, `-`, `.`, or `)`.
  listItemMarker: 'listItemMarker',

  // The thing that starts a list item, such as `1. `.
  // Includes `listItemValue` if ordered, `listItemMarker`, and
  // `listItemPrefixWhitespace` (unless followed by a line ending).
  listItemPrefix: 'listItemPrefix',

  // The whitespace after a marker.
  listItemPrefixWhitespace: 'listItemPrefixWhitespace',

  // The numerical value of an ordered item.
  listItemValue: 'listItemValue',

  // Internal types used for subtokenizers, compiled away
  chunkDocument: 'chunkDocument',
  chunkContent: 'chunkContent',
  chunkFlow: 'chunkFlow',
  chunkText: 'chunkText',
  chunkString: 'chunkString'
})


/***/ }),

/***/ "./node_modules/micromark-util-symbol/lib/values.js":
/*!**********************************************************!*\
  !*** ./node_modules/micromark-util-symbol/lib/values.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   values: () => (/* binding */ values)
/* harmony export */ });
/**
 * This module is compiled away!
 *
 * While micromark works based on character codes, this module includes the
 * string versions of ’em.
 * The C0 block, except for LF, CR, HT, and w/ the replacement character added,
 * are available here.
 */
const values = /** @type {const} */ ({
  ht: '\t',
  lf: '\n',
  cr: '\r',
  space: ' ',
  exclamationMark: '!',
  quotationMark: '"',
  numberSign: '#',
  dollarSign: '$',
  percentSign: '%',
  ampersand: '&',
  apostrophe: "'",
  leftParenthesis: '(',
  rightParenthesis: ')',
  asterisk: '*',
  plusSign: '+',
  comma: ',',
  dash: '-',
  dot: '.',
  slash: '/',
  digit0: '0',
  digit1: '1',
  digit2: '2',
  digit3: '3',
  digit4: '4',
  digit5: '5',
  digit6: '6',
  digit7: '7',
  digit8: '8',
  digit9: '9',
  colon: ':',
  semicolon: ';',
  lessThan: '<',
  equalsTo: '=',
  greaterThan: '>',
  questionMark: '?',
  atSign: '@',
  uppercaseA: 'A',
  uppercaseB: 'B',
  uppercaseC: 'C',
  uppercaseD: 'D',
  uppercaseE: 'E',
  uppercaseF: 'F',
  uppercaseG: 'G',
  uppercaseH: 'H',
  uppercaseI: 'I',
  uppercaseJ: 'J',
  uppercaseK: 'K',
  uppercaseL: 'L',
  uppercaseM: 'M',
  uppercaseN: 'N',
  uppercaseO: 'O',
  uppercaseP: 'P',
  uppercaseQ: 'Q',
  uppercaseR: 'R',
  uppercaseS: 'S',
  uppercaseT: 'T',
  uppercaseU: 'U',
  uppercaseV: 'V',
  uppercaseW: 'W',
  uppercaseX: 'X',
  uppercaseY: 'Y',
  uppercaseZ: 'Z',
  leftSquareBracket: '[',
  backslash: '\\',
  rightSquareBracket: ']',
  caret: '^',
  underscore: '_',
  graveAccent: '`',
  lowercaseA: 'a',
  lowercaseB: 'b',
  lowercaseC: 'c',
  lowercaseD: 'd',
  lowercaseE: 'e',
  lowercaseF: 'f',
  lowercaseG: 'g',
  lowercaseH: 'h',
  lowercaseI: 'i',
  lowercaseJ: 'j',
  lowercaseK: 'k',
  lowercaseL: 'l',
  lowercaseM: 'm',
  lowercaseN: 'n',
  lowercaseO: 'o',
  lowercaseP: 'p',
  lowercaseQ: 'q',
  lowercaseR: 'r',
  lowercaseS: 's',
  lowercaseT: 't',
  lowercaseU: 'u',
  lowercaseV: 'v',
  lowercaseW: 'w',
  lowercaseX: 'x',
  lowercaseY: 'y',
  lowercaseZ: 'z',
  leftCurlyBrace: '{',
  verticalBar: '|',
  rightCurlyBrace: '}',
  tilde: '~',
  replacementCharacter: '�'
})


/***/ }),

/***/ "./node_modules/property-information/index.js":
/*!****************************************************!*\
  !*** ./node_modules/property-information/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   find: () => (/* reexport safe */ _lib_find_js__WEBPACK_IMPORTED_MODULE_0__.find),
/* harmony export */   hastToReact: () => (/* reexport safe */ _lib_hast_to_react_js__WEBPACK_IMPORTED_MODULE_1__.hastToReact),
/* harmony export */   html: () => (/* binding */ html),
/* harmony export */   normalize: () => (/* reexport safe */ _lib_normalize_js__WEBPACK_IMPORTED_MODULE_2__.normalize),
/* harmony export */   svg: () => (/* binding */ svg)
/* harmony export */ });
/* harmony import */ var _lib_util_merge_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/util/merge.js */ "./node_modules/property-information/lib/util/merge.js");
/* harmony import */ var _lib_xlink_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lib/xlink.js */ "./node_modules/property-information/lib/xlink.js");
/* harmony import */ var _lib_xml_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lib/xml.js */ "./node_modules/property-information/lib/xml.js");
/* harmony import */ var _lib_xmlns_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./lib/xmlns.js */ "./node_modules/property-information/lib/xmlns.js");
/* harmony import */ var _lib_aria_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./lib/aria.js */ "./node_modules/property-information/lib/aria.js");
/* harmony import */ var _lib_html_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./lib/html.js */ "./node_modules/property-information/lib/html.js");
/* harmony import */ var _lib_svg_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./lib/svg.js */ "./node_modules/property-information/lib/svg.js");
/* harmony import */ var _lib_find_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/find.js */ "./node_modules/property-information/lib/find.js");
/* harmony import */ var _lib_hast_to_react_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/hast-to-react.js */ "./node_modules/property-information/lib/hast-to-react.js");
/* harmony import */ var _lib_normalize_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/normalize.js */ "./node_modules/property-information/lib/normalize.js");
/**
 * @typedef {import('./lib/util/info.js').Info} Info
 * @typedef {import('./lib/util/schema.js').Schema} Schema
 */












var html = (0,_lib_util_merge_js__WEBPACK_IMPORTED_MODULE_3__.merge)([_lib_xml_js__WEBPACK_IMPORTED_MODULE_4__.xml, _lib_xlink_js__WEBPACK_IMPORTED_MODULE_5__.xlink, _lib_xmlns_js__WEBPACK_IMPORTED_MODULE_6__.xmlns, _lib_aria_js__WEBPACK_IMPORTED_MODULE_7__.aria, _lib_html_js__WEBPACK_IMPORTED_MODULE_8__.html], 'html')
var svg = (0,_lib_util_merge_js__WEBPACK_IMPORTED_MODULE_3__.merge)([_lib_xml_js__WEBPACK_IMPORTED_MODULE_4__.xml, _lib_xlink_js__WEBPACK_IMPORTED_MODULE_5__.xlink, _lib_xmlns_js__WEBPACK_IMPORTED_MODULE_6__.xmlns, _lib_aria_js__WEBPACK_IMPORTED_MODULE_7__.aria, _lib_svg_js__WEBPACK_IMPORTED_MODULE_9__.svg], 'svg')


/***/ }),

/***/ "./node_modules/property-information/lib/aria.js":
/*!*******************************************************!*\
  !*** ./node_modules/property-information/lib/aria.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   aria: () => (/* binding */ aria)
/* harmony export */ });
/* harmony import */ var _util_types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/types.js */ "./node_modules/property-information/lib/util/types.js");
/* harmony import */ var _util_create_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/create.js */ "./node_modules/property-information/lib/util/create.js");



var aria = (0,_util_create_js__WEBPACK_IMPORTED_MODULE_0__.create)({
  transform: ariaTransform,
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaAutoComplete: null,
    ariaBusy: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaChecked: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaColCount: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaColIndex: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaColSpan: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaControls: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaDetails: null,
    ariaDisabled: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaDropEffect: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaFlowTo: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaGrabbed: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaHasPopup: null,
    ariaHidden: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaLevel: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaLive: null,
    ariaModal: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaMultiLine: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaMultiSelectable: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaOrientation: null,
    ariaOwns: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaPressed: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaReadOnly: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaRelevant: null,
    ariaRequired: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaRoleDescription: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.spaceSeparated,
    ariaRowCount: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaRowIndex: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaRowSpan: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaSelected: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.booleanish,
    ariaSetSize: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaSort: null,
    ariaValueMax: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaValueMin: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaValueNow: _util_types_js__WEBPACK_IMPORTED_MODULE_1__.number,
    ariaValueText: null,
    role: null
  }
})

/**
 * @param {unknown} _
 * @param {string} prop
 * @returns {string}
 */
function ariaTransform(_, prop) {
  return prop === 'role' ? prop : 'aria-' + prop.slice(4).toLowerCase()
}


/***/ }),

/***/ "./node_modules/property-information/lib/find.js":
/*!*******************************************************!*\
  !*** ./node_modules/property-information/lib/find.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   find: () => (/* binding */ find)
/* harmony export */ });
/* harmony import */ var _normalize_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./normalize.js */ "./node_modules/property-information/lib/normalize.js");
/* harmony import */ var _util_defined_info_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/defined-info.js */ "./node_modules/property-information/lib/util/defined-info.js");
/* harmony import */ var _util_info_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/info.js */ "./node_modules/property-information/lib/util/info.js");




var valid = /^data[-\w.:]+$/i
var dash = /-[a-z]/g
var cap = /[A-Z]/g

/**
 * @param {import('./util/schema.js').Schema} schema
 * @param {string} value
 * @returns {import('./util/info.js').Info}
 */
function find(schema, value) {
  var normal = (0,_normalize_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(value)
  var prop = value
  var Type = _util_info_js__WEBPACK_IMPORTED_MODULE_1__.Info

  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]]
  }

  if (normal.length > 4 && normal.slice(0, 4) === 'data' && valid.test(value)) {
    // Attribute or property.
    if (value.charAt(4) === '-') {
      prop = datasetToProperty(value)
    } else {
      value = datasetToAttribute(value)
    }

    Type = _util_defined_info_js__WEBPACK_IMPORTED_MODULE_2__.DefinedInfo
  }

  return new Type(prop, value)
}

/**
 * @param {string} attribute
 * @returns {string}
 */
function datasetToProperty(attribute) {
  var value = attribute.slice(5).replace(dash, camelcase)
  return 'data' + value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * @param {string} property
 * @returns {string}
 */
function datasetToAttribute(property) {
  var value = property.slice(4)

  if (dash.test(value)) {
    return property
  }

  value = value.replace(cap, kebab)

  if (value.charAt(0) !== '-') {
    value = '-' + value
  }

  return 'data' + value
}

/**
 * @param {string} $0
 * @returns {string}
 */
function kebab($0) {
  return '-' + $0.toLowerCase()
}

/**
 * @param {string} $0
 * @returns {string}
 */
function camelcase($0) {
  return $0.charAt(1).toUpperCase()
}


/***/ }),

/***/ "./node_modules/property-information/lib/hast-to-react.js":
/*!****************************************************************!*\
  !*** ./node_modules/property-information/lib/hast-to-react.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hastToReact: () => (/* binding */ hastToReact)
/* harmony export */ });
var hastToReact = {
  classId: 'classID',
  dataType: 'datatype',
  itemId: 'itemID',
  strokeDashArray: 'strokeDasharray',
  strokeDashOffset: 'strokeDashoffset',
  strokeLineCap: 'strokeLinecap',
  strokeLineJoin: 'strokeLinejoin',
  strokeMiterLimit: 'strokeMiterlimit',
  typeOf: 'typeof',
  xLinkActuate: 'xlinkActuate',
  xLinkArcRole: 'xlinkArcrole',
  xLinkHref: 'xlinkHref',
  xLinkRole: 'xlinkRole',
  xLinkShow: 'xlinkShow',
  xLinkTitle: 'xlinkTitle',
  xLinkType: 'xlinkType',
  xmlnsXLink: 'xmlnsXlink'
}


/***/ }),

/***/ "./node_modules/property-information/lib/html.js":
/*!*******************************************************!*\
  !*** ./node_modules/property-information/lib/html.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   html: () => (/* binding */ html)
/* harmony export */ });
/* harmony import */ var _util_types_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/types.js */ "./node_modules/property-information/lib/util/types.js");
/* harmony import */ var _util_create_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/create.js */ "./node_modules/property-information/lib/util/create.js");
/* harmony import */ var _util_case_insensitive_transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/case-insensitive-transform.js */ "./node_modules/property-information/lib/util/case-insensitive-transform.js");




var html = (0,_util_create_js__WEBPACK_IMPORTED_MODULE_0__.create)({
  space: 'html',
  attributes: {
    acceptcharset: 'accept-charset',
    classname: 'class',
    htmlfor: 'for',
    httpequiv: 'http-equiv'
  },
  transform: _util_case_insensitive_transform_js__WEBPACK_IMPORTED_MODULE_1__.caseInsensitiveTransform,
  mustUseProperty: ['checked', 'multiple', 'muted', 'selected'],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    acceptCharset: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    accessKey: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    allowPaymentRequest: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    allowUserMedia: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    alt: null,
    as: null,
    async: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    autoCapitalize: null,
    autoComplete: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    autoFocus: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    autoPlay: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    capture: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    charSet: null,
    checked: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    cite: null,
    className: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    cols: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    colSpan: null,
    content: null,
    contentEditable: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.booleanish,
    controls: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    controlsList: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    coords: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number | _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    defer: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    dir: null,
    dirName: null,
    disabled: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    download: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.overloadedBoolean,
    draggable: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.booleanish,
    encType: null,
    enterKeyHint: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    formTarget: null,
    headers: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    height: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    hidden: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    high: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    href: null,
    hrefLang: null,
    htmlFor: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    httpEquiv: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    itemId: null,
    itemProp: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    itemRef: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    itemScope: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    itemType: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    low: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    manifest: null,
    max: null,
    maxLength: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    media: null,
    method: null,
    min: null,
    minLength: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    multiple: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    muted: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    name: null,
    nonce: null,
    noModule: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    noValidate: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforePrint: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextMenu: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    optimum: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    pattern: null,
    ping: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    placeholder: null,
    playsInline: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    poster: null,
    preload: null,
    readOnly: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    referrerPolicy: null,
    rel: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    required: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    reversed: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    rows: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    rowSpan: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    sandbox: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    scope: null,
    scoped: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    seamless: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    selected: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    shape: null,
    size: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    sizes: null,
    slot: null,
    span: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    spellCheck: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    start: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    step: null,
    style: null,
    tabIndex: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    useMap: null,
    value: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.booleanish,
    width: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    wrap: null,

    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null, // Several. Use CSS `text-align` instead,
    aLink: null, // `<body>`. Use CSS `a:active {color}` instead
    archive: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated, // `<object>`. List of URIs to archives
    axis: null, // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null, // `<body>`. Use CSS `background-image` instead
    bgColor: null, // `<body>` and table elements. Use CSS `background-color` instead
    border: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<table>`. Use CSS `border-width` instead,
    borderColor: null, // `<table>`. Use CSS `border-color` instead,
    bottomMargin: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<body>`
    cellPadding: null, // `<table>`
    cellSpacing: null, // `<table>`
    char: null, // Several table elements. When `align=char`, sets the character to align on
    charOff: null, // Several table elements. When `char`, offsets the alignment
    classId: null, // `<object>`
    clear: null, // `<br>`. Use CSS `clear` instead
    code: null, // `<object>`
    codeBase: null, // `<object>`
    codeType: null, // `<object>`
    color: null, // `<font>` and `<hr>`. Use CSS instead
    compact: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean, // Lists. Use CSS to reduce space between items instead
    declare: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean, // `<object>`
    event: null, // `<script>`
    face: null, // `<font>`. Use CSS instead
    frame: null, // `<table>`
    frameBorder: null, // `<iframe>`. Use CSS `border` instead
    hSpace: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<img>` and `<object>`
    leftMargin: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<body>`
    link: null, // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null, // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null, // `<img>`. Use a `<picture>`
    marginHeight: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<body>`
    marginWidth: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<body>`
    noResize: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean, // `<frame>`
    noHref: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean, // `<area>`. Use no href instead of an explicit `nohref`
    noShade: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean, // `<hr>`. Use background-color and height instead of borders
    noWrap: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean, // `<td>` and `<th>`
    object: null, // `<applet>`
    profile: null, // `<head>`
    prompt: null, // `<isindex>`
    rev: null, // `<link>`
    rightMargin: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<body>`
    rules: null, // `<table>`
    scheme: null, // `<meta>`
    scrolling: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.booleanish, // `<frame>`. Use overflow in the child context
    standby: null, // `<object>`
    summary: null, // `<table>`
    text: null, // `<body>`. Use CSS `color` instead
    topMargin: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<body>`
    valueType: null, // `<param>`
    version: null, // `<html>`. Use a doctype.
    vAlign: null, // Several. Use CSS `vertical-align` instead
    vLink: null, // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number, // `<img>` and `<object>`

    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    disableRemotePlayback: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    prefix: null,
    property: null,
    results: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    security: null,
    unselectable: null
  }
})


/***/ }),

/***/ "./node_modules/property-information/lib/normalize.js":
/*!************************************************************!*\
  !*** ./node_modules/property-information/lib/normalize.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalize: () => (/* binding */ normalize)
/* harmony export */ });
/**
 * @param {string} value
 * @returns {string}
 */
function normalize(value) {
  return value.toLowerCase()
}


/***/ }),

/***/ "./node_modules/property-information/lib/svg.js":
/*!******************************************************!*\
  !*** ./node_modules/property-information/lib/svg.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   svg: () => (/* binding */ svg)
/* harmony export */ });
/* harmony import */ var _util_types_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/types.js */ "./node_modules/property-information/lib/util/types.js");
/* harmony import */ var _util_create_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/create.js */ "./node_modules/property-information/lib/util/create.js");
/* harmony import */ var _util_case_sensitive_transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/case-sensitive-transform.js */ "./node_modules/property-information/lib/util/case-sensitive-transform.js");




var svg = (0,_util_create_js__WEBPACK_IMPORTED_MODULE_0__.create)({
  space: 'svg',
  attributes: {
    accentHeight: 'accent-height',
    alignmentBaseline: 'alignment-baseline',
    arabicForm: 'arabic-form',
    baselineShift: 'baseline-shift',
    capHeight: 'cap-height',
    className: 'class',
    clipPath: 'clip-path',
    clipRule: 'clip-rule',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    crossOrigin: 'crossorigin',
    dataType: 'datatype',
    dominantBaseline: 'dominant-baseline',
    enableBackground: 'enable-background',
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    hrefLang: 'hreflang',
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    horizOriginY: 'horiz-origin-y',
    imageRendering: 'image-rendering',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    navDown: 'nav-down',
    navDownLeft: 'nav-down-left',
    navDownRight: 'nav-down-right',
    navLeft: 'nav-left',
    navNext: 'nav-next',
    navPrev: 'nav-prev',
    navRight: 'nav-right',
    navUp: 'nav-up',
    navUpLeft: 'nav-up-left',
    navUpRight: 'nav-up-right',
    onAbort: 'onabort',
    onActivate: 'onactivate',
    onAfterPrint: 'onafterprint',
    onBeforePrint: 'onbeforeprint',
    onBegin: 'onbegin',
    onCancel: 'oncancel',
    onCanPlay: 'oncanplay',
    onCanPlayThrough: 'oncanplaythrough',
    onChange: 'onchange',
    onClick: 'onclick',
    onClose: 'onclose',
    onCopy: 'oncopy',
    onCueChange: 'oncuechange',
    onCut: 'oncut',
    onDblClick: 'ondblclick',
    onDrag: 'ondrag',
    onDragEnd: 'ondragend',
    onDragEnter: 'ondragenter',
    onDragExit: 'ondragexit',
    onDragLeave: 'ondragleave',
    onDragOver: 'ondragover',
    onDragStart: 'ondragstart',
    onDrop: 'ondrop',
    onDurationChange: 'ondurationchange',
    onEmptied: 'onemptied',
    onEnd: 'onend',
    onEnded: 'onended',
    onError: 'onerror',
    onFocus: 'onfocus',
    onFocusIn: 'onfocusin',
    onFocusOut: 'onfocusout',
    onHashChange: 'onhashchange',
    onInput: 'oninput',
    onInvalid: 'oninvalid',
    onKeyDown: 'onkeydown',
    onKeyPress: 'onkeypress',
    onKeyUp: 'onkeyup',
    onLoad: 'onload',
    onLoadedData: 'onloadeddata',
    onLoadedMetadata: 'onloadedmetadata',
    onLoadStart: 'onloadstart',
    onMessage: 'onmessage',
    onMouseDown: 'onmousedown',
    onMouseEnter: 'onmouseenter',
    onMouseLeave: 'onmouseleave',
    onMouseMove: 'onmousemove',
    onMouseOut: 'onmouseout',
    onMouseOver: 'onmouseover',
    onMouseUp: 'onmouseup',
    onMouseWheel: 'onmousewheel',
    onOffline: 'onoffline',
    onOnline: 'ononline',
    onPageHide: 'onpagehide',
    onPageShow: 'onpageshow',
    onPaste: 'onpaste',
    onPause: 'onpause',
    onPlay: 'onplay',
    onPlaying: 'onplaying',
    onPopState: 'onpopstate',
    onProgress: 'onprogress',
    onRateChange: 'onratechange',
    onRepeat: 'onrepeat',
    onReset: 'onreset',
    onResize: 'onresize',
    onScroll: 'onscroll',
    onSeeked: 'onseeked',
    onSeeking: 'onseeking',
    onSelect: 'onselect',
    onShow: 'onshow',
    onStalled: 'onstalled',
    onStorage: 'onstorage',
    onSubmit: 'onsubmit',
    onSuspend: 'onsuspend',
    onTimeUpdate: 'ontimeupdate',
    onToggle: 'ontoggle',
    onUnload: 'onunload',
    onVolumeChange: 'onvolumechange',
    onWaiting: 'onwaiting',
    onZoom: 'onzoom',
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pointerEvents: 'pointer-events',
    referrerPolicy: 'referrerpolicy',
    renderingIntent: 'rendering-intent',
    shapeRendering: 'shape-rendering',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    strokeDashArray: 'stroke-dasharray',
    strokeDashOffset: 'stroke-dashoffset',
    strokeLineCap: 'stroke-linecap',
    strokeLineJoin: 'stroke-linejoin',
    strokeMiterLimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    tabIndex: 'tabindex',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textRendering: 'text-rendering',
    typeOf: 'typeof',
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    vectorEffect: 'vector-effect',
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    xHeight: 'x-height',
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: 'playbackorder',
    timelineBegin: 'timelinebegin'
  },
  transform: _util_case_sensitive_transform_js__WEBPACK_IMPORTED_MODULE_1__.caseSensitiveTransform,
  properties: {
    about: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    accentHeight: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    amplitude: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    arabicForm: null,
    ascent: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    attributeName: null,
    attributeType: null,
    azimuth: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    by: null,
    calcMode: null,
    capHeight: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    className: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    diffuseConstant: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    direction: null,
    display: null,
    dur: null,
    divisor: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    dominantBaseline: null,
    download: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    g2: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    glyphName: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    horizOriginX: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    horizOriginY: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    id: null,
    ideographic: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    k: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    k1: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    k2: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    k3: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    k4: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    kernelMatrix: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null, // SEMI_COLON_SEPARATED
    keySplines: null, // SEMI_COLON_SEPARATED
    keyTimes: null, // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    overlineThickness: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    pointsAtY: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    pointsAtZ: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    rev: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    requiredFeatures: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    requiredFonts: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    requiredFormats: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    specularExponent: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    strikethroughThickness: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    string: null,
    stroke: null,
    strokeDashArray: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    strokeOpacity: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    strokeWidth: null,
    style: null,
    surfaceScale: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    tabIndex: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    tableValues: null,
    target: null,
    targetX: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    targetY: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.commaOrSpaceSeparated,
    to: null,
    transform: null,
    u1: null,
    u2: null,
    underlinePosition: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    underlineThickness: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    values: null,
    vAlphabetic: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    vMathematical: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    vectorEffect: null,
    vHanging: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    vIdeographic: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    version: null,
    vertAdvY: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    vertOriginX: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    vertOriginY: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: _util_types_js__WEBPACK_IMPORTED_MODULE_2__.number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  }
})


/***/ }),

/***/ "./node_modules/property-information/lib/util/case-insensitive-transform.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/property-information/lib/util/case-insensitive-transform.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   caseInsensitiveTransform: () => (/* binding */ caseInsensitiveTransform)
/* harmony export */ });
/* harmony import */ var _case_sensitive_transform_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./case-sensitive-transform.js */ "./node_modules/property-information/lib/util/case-sensitive-transform.js");


/**
 * @param {Object.<string, string>} attributes
 * @param {string} property
 * @returns {string}
 */
function caseInsensitiveTransform(attributes, property) {
  return (0,_case_sensitive_transform_js__WEBPACK_IMPORTED_MODULE_0__.caseSensitiveTransform)(attributes, property.toLowerCase())
}


/***/ }),

/***/ "./node_modules/property-information/lib/util/case-sensitive-transform.js":
/*!********************************************************************************!*\
  !*** ./node_modules/property-information/lib/util/case-sensitive-transform.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   caseSensitiveTransform: () => (/* binding */ caseSensitiveTransform)
/* harmony export */ });
/**
 * @param {Object.<string, string>} attributes
 * @param {string} attribute
 * @returns {string}
 */
function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute
}


/***/ }),

/***/ "./node_modules/property-information/lib/util/create.js":
/*!**************************************************************!*\
  !*** ./node_modules/property-information/lib/util/create.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   create: () => (/* binding */ create)
/* harmony export */ });
/* harmony import */ var _normalize_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../normalize.js */ "./node_modules/property-information/lib/normalize.js");
/* harmony import */ var _schema_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./schema.js */ "./node_modules/property-information/lib/util/schema.js");
/* harmony import */ var _defined_info_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./defined-info.js */ "./node_modules/property-information/lib/util/defined-info.js");




/**
 * @typedef {import('./schema.js').Properties} Properties
 * @typedef {import('./schema.js').Normal} Normal
 * @typedef {import('./info.js').Info} Info
 */

/**
 * @typedef {Object.<string, string>} Attributes
 *
 * @typedef {Object} Definition
 * @property {Object.<string, number|null>} properties
 * @property {(attributes: Attributes, property: string) => string} transform
 * @property {string} [space]
 * @property {Attributes} [attributes]
 * @property {Array.<string>} [mustUseProperty]
 */

var own = {}.hasOwnProperty

/**
 * @param {Definition} definition
 * @returns {import('./schema.js').Schema}
 */
function create(definition) {
  /** @type {Properties} */
  var property = {}
  /** @type {Normal} */
  var normal = {}
  /** @type {string} */
  var prop
  /** @type {Info} */
  var info

  for (prop in definition.properties) {
    if (own.call(definition.properties, prop)) {
      info = new _defined_info_js__WEBPACK_IMPORTED_MODULE_0__.DefinedInfo(
        prop,
        definition.transform(definition.attributes, prop),
        definition.properties[prop],
        definition.space
      )

      if (
        definition.mustUseProperty &&
        definition.mustUseProperty.includes(prop)
      ) {
        info.mustUseProperty = true
      }

      property[prop] = info

      normal[(0,_normalize_js__WEBPACK_IMPORTED_MODULE_1__.normalize)(prop)] = prop
      normal[(0,_normalize_js__WEBPACK_IMPORTED_MODULE_1__.normalize)(info.attribute)] = prop
    }
  }

  return new _schema_js__WEBPACK_IMPORTED_MODULE_2__.Schema(property, normal, definition.space)
}


/***/ }),

/***/ "./node_modules/property-information/lib/util/defined-info.js":
/*!********************************************************************!*\
  !*** ./node_modules/property-information/lib/util/defined-info.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefinedInfo: () => (/* binding */ DefinedInfo)
/* harmony export */ });
/* harmony import */ var _info_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./info.js */ "./node_modules/property-information/lib/util/info.js");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types.js */ "./node_modules/property-information/lib/util/types.js");



var checks = Object.keys(_types_js__WEBPACK_IMPORTED_MODULE_0__)

class DefinedInfo extends _info_js__WEBPACK_IMPORTED_MODULE_1__.Info {
  /**
   * @constructor
   * @param {string} property
   * @param {string} attribute
   * @param {number} [mask]
   * @param {string} [space]
   */
  constructor(property, attribute, mask, space) {
    var index = -1

    super(property, attribute)

    mark(this, 'space', space)

    while (++index < checks.length) {
      mark(
        this,
        checks[index],
        (mask & _types_js__WEBPACK_IMPORTED_MODULE_0__[checks[index]]) === _types_js__WEBPACK_IMPORTED_MODULE_0__[checks[index]]
      )
    }
  }
}

DefinedInfo.prototype.defined = true

/**
 * @param {InstanceType<typeof DefinedInfo>} values
 * @param {string} key
 * @param {unknown} value
 */
function mark(values, key, value) {
  if (value) {
    values[key] = value
  }
}


/***/ }),

/***/ "./node_modules/property-information/lib/util/info.js":
/*!************************************************************!*\
  !*** ./node_modules/property-information/lib/util/info.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Info: () => (/* binding */ Info)
/* harmony export */ });
class Info {
  /**
   * @constructor
   * @param {string} property
   * @param {string} attribute
   */
  constructor(property, attribute) {
    this.property = property
    this.attribute = attribute
  }
}

/** @type {string|null} */
Info.prototype.space = null
Info.prototype.attribute = null
Info.prototype.property = null
Info.prototype.boolean = false
Info.prototype.booleanish = false
Info.prototype.overloadedBoolean = false
Info.prototype.number = false
Info.prototype.commaSeparated = false
Info.prototype.spaceSeparated = false
Info.prototype.commaOrSpaceSeparated = false
Info.prototype.mustUseProperty = false
Info.prototype.defined = false


/***/ }),

/***/ "./node_modules/property-information/lib/util/merge.js":
/*!*************************************************************!*\
  !*** ./node_modules/property-information/lib/util/merge.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var _schema_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./schema.js */ "./node_modules/property-information/lib/util/schema.js");


/**
 * @typedef {import('./schema.js').Properties} Properties
 * @typedef {import('./schema.js').Normal} Normal
 */

/**
 * @param {import('./schema.js').Schema[]} definitions
 * @param {string} space
 * @returns {import('./schema.js').Schema}
 */
function merge(definitions, space) {
  /** @type {Properties} */
  var property = {}
  /** @type {Normal} */
  var normal = {}
  var index = -1

  while (++index < definitions.length) {
    Object.assign(property, definitions[index].property)
    Object.assign(normal, definitions[index].normal)
  }

  return new _schema_js__WEBPACK_IMPORTED_MODULE_0__.Schema(property, normal, space)
}


/***/ }),

/***/ "./node_modules/property-information/lib/util/schema.js":
/*!**************************************************************!*\
  !*** ./node_modules/property-information/lib/util/schema.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Schema: () => (/* binding */ Schema)
/* harmony export */ });
/**
 * @typedef {import('./info.js').Info} Info
 * @typedef {Object.<string, Info>} Properties
 * @typedef {Object.<string, string>} Normal
 */

class Schema {
  /**
   * @constructor
   * @param {Properties} property
   * @param {Normal} normal
   * @param {string} [space]
   */
  constructor(property, normal, space) {
    this.property = property
    this.normal = normal
    if (space) {
      this.space = space
    }
  }
}

/** @type {Properties} */
Schema.prototype.property = {}
/** @type {Normal} */
Schema.prototype.normal = {}
/** @type {string|null} */
Schema.prototype.space = null


/***/ }),

/***/ "./node_modules/property-information/lib/util/types.js":
/*!*************************************************************!*\
  !*** ./node_modules/property-information/lib/util/types.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   boolean: () => (/* binding */ boolean),
/* harmony export */   booleanish: () => (/* binding */ booleanish),
/* harmony export */   commaOrSpaceSeparated: () => (/* binding */ commaOrSpaceSeparated),
/* harmony export */   commaSeparated: () => (/* binding */ commaSeparated),
/* harmony export */   number: () => (/* binding */ number),
/* harmony export */   overloadedBoolean: () => (/* binding */ overloadedBoolean),
/* harmony export */   spaceSeparated: () => (/* binding */ spaceSeparated)
/* harmony export */ });
var powers = 0

var boolean = increment()
var booleanish = increment()
var overloadedBoolean = increment()
var number = increment()
var spaceSeparated = increment()
var commaSeparated = increment()
var commaOrSpaceSeparated = increment()

function increment() {
  return 2 ** ++powers
}


/***/ }),

/***/ "./node_modules/property-information/lib/xlink.js":
/*!********************************************************!*\
  !*** ./node_modules/property-information/lib/xlink.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   xlink: () => (/* binding */ xlink)
/* harmony export */ });
/* harmony import */ var _util_create_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/create.js */ "./node_modules/property-information/lib/util/create.js");


var xlink = (0,_util_create_js__WEBPACK_IMPORTED_MODULE_0__.create)({
  space: 'xlink',
  transform: xlinkTransform,
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  }
})

/**
 * @param {unknown} _
 * @param {string} prop
 * @returns {string}
 */
function xlinkTransform(_, prop) {
  return 'xlink:' + prop.slice(5).toLowerCase()
}


/***/ }),

/***/ "./node_modules/property-information/lib/xml.js":
/*!******************************************************!*\
  !*** ./node_modules/property-information/lib/xml.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   xml: () => (/* binding */ xml)
/* harmony export */ });
/* harmony import */ var _util_create_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/create.js */ "./node_modules/property-information/lib/util/create.js");


var xml = (0,_util_create_js__WEBPACK_IMPORTED_MODULE_0__.create)({
  space: 'xml',
  transform: xmlTransform,
  properties: {xmlLang: null, xmlBase: null, xmlSpace: null}
})

/**
 * @param {unknown} _
 * @param {string} prop
 * @returns {string}
 */
function xmlTransform(_, prop) {
  return 'xml:' + prop.slice(3).toLowerCase()
}


/***/ }),

/***/ "./node_modules/property-information/lib/xmlns.js":
/*!********************************************************!*\
  !*** ./node_modules/property-information/lib/xmlns.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   xmlns: () => (/* binding */ xmlns)
/* harmony export */ });
/* harmony import */ var _util_create_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/create.js */ "./node_modules/property-information/lib/util/create.js");
/* harmony import */ var _util_case_insensitive_transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/case-insensitive-transform.js */ "./node_modules/property-information/lib/util/case-insensitive-transform.js");



var xmlns = (0,_util_create_js__WEBPACK_IMPORTED_MODULE_0__.create)({
  space: 'xmlns',
  attributes: {xmlnsxlink: 'xmlns:xlink'},
  transform: _util_case_insensitive_transform_js__WEBPACK_IMPORTED_MODULE_1__.caseInsensitiveTransform,
  properties: {xmlns: null, xmlnsXLink: null}
})


/***/ }),

/***/ "./node_modules/rehype-dom-parse/lib/index.js":
/*!****************************************************!*\
  !*** ./node_modules/rehype-dom-parse/lib/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ parse)
/* harmony export */ });
/* harmony import */ var hast_util_from_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-from-dom */ "./node_modules/hast-util-from-dom/lib/index.js");
/**
 * @typedef {import('hast').Root} Root
 *
 * @typedef {import('unified').Parser<Root>} Parser
 *
 * @typedef {import('../index.js').Options} Options
 */



/**
 * Add support for parsing from HTML with DOM APIs.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
function parse(options) {
  /** @type {import('unified').Processor<Root>} */
  // @ts-expect-error: TS in JSDoc generates wrong types if `this` is typed regularly.
  const self = this
  const settings = {...self.data('settings'), ...options}

  self.parser = parser

  /** @type {Parser} */
  function parser(doc) {
    const create = settings.fragment === false ? createDocument : createFragment
    // Assume document/fragment in -> root out.
    return /** @type {Root} */ ((0,hast_util_from_dom__WEBPACK_IMPORTED_MODULE_0__.fromDom)(create(doc)))
  }
}

/**
 * Create a fragment.
 *
 * @param {string} value
 *   HTML.
 * @returns {DocumentFragment}
 *   Document fragment.
 */
function createFragment(value) {
  const doc = createDocument('<!doctype html><body>' + value)

  /**
   * Pretend as a DocumentFragment node, which is fine for `fromDom`.
   */
  return /** @type {DocumentFragment} */ ({
    nodeType: 11,
    childNodes: doc.body.childNodes
  })
}

/**
 * Create a document.
 *
 * @param {string} value
 *   HTML.
 * @returns {Document}
 *   Document.
 */
function createDocument(value) {
  return new DOMParser().parseFromString(value, 'text/html')
}


/***/ }),

/***/ "./node_modules/rehype-minify-whitespace/lib/block.js":
/*!************************************************************!*\
  !*** ./node_modules/rehype-minify-whitespace/lib/block.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blocks: () => (/* binding */ blocks)
/* harmony export */ });
// See: <https://html.spec.whatwg.org/#the-css-user-agent-style-sheet-and-presentational-hints>
const blocks = [
  'address', // Flow content.
  'article', // Sections and headings.
  'aside', // Sections and headings.
  'blockquote', // Flow content.
  'body', // Page.
  'br', // Contribute whitespace intrinsically.
  'caption', // Similar to block.
  'center', // Flow content, legacy.
  'col', // Similar to block.
  'colgroup', // Similar to block.
  'dd', // Lists.
  'dialog', // Flow content.
  'dir', // Lists, legacy.
  'div', // Flow content.
  'dl', // Lists.
  'dt', // Lists.
  'figcaption', // Flow content.
  'figure', // Flow content.
  'footer', // Flow content.
  'form', // Flow content.
  'h1', // Sections and headings.
  'h2', // Sections and headings.
  'h3', // Sections and headings.
  'h4', // Sections and headings.
  'h5', // Sections and headings.
  'h6', // Sections and headings.
  'head', // Page.
  'header', // Flow content.
  'hgroup', // Sections and headings.
  'hr', // Flow content.
  'html', // Page.
  'legend', // Flow content.
  'li', // Block-like.
  'li', // Similar to block.
  'listing', // Flow content, legacy
  'main', // Flow content.
  'menu', // Lists.
  'nav', // Sections and headings.
  'ol', // Lists.
  'optgroup', // Similar to block.
  'option', // Similar to block.
  'p', // Flow content.
  'plaintext', // Flow content, legacy
  'pre', // Flow content.
  'section', // Sections and headings.
  'summary', // Similar to block.
  'table', // Similar to block.
  'tbody', // Similar to block.
  'td', // Block-like.
  'td', // Similar to block.
  'tfoot', // Similar to block.
  'th', // Block-like.
  'th', // Similar to block.
  'thead', // Similar to block.
  'tr', // Similar to block.
  'ul', // Lists.
  'wbr', // Contribute whitespace intrinsically.
  'xmp' // Flow content, legacy
]


/***/ }),

/***/ "./node_modules/rehype-minify-whitespace/lib/content.js":
/*!**************************************************************!*\
  !*** ./node_modules/rehype-minify-whitespace/lib/content.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   content: () => (/* binding */ content)
/* harmony export */ });
const content = [
  // Form.
  'button',
  'input',
  'select',
  'textarea'
]


/***/ }),

/***/ "./node_modules/rehype-minify-whitespace/lib/index.js":
/*!************************************************************!*\
  !*** ./node_modules/rehype-minify-whitespace/lib/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rehypeMinifyWhitespace)
/* harmony export */ });
/* harmony import */ var hast_util_embedded__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! hast-util-embedded */ "./node_modules/hast-util-embedded/lib/index.js");
/* harmony import */ var hast_util_is_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! hast-util-is-element */ "./node_modules/hast-util-is-element/lib/index.js");
/* harmony import */ var hast_util_whitespace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hast-util-whitespace */ "./node_modules/hast-util-whitespace/lib/index.js");
/* harmony import */ var unist_util_is__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-is */ "./node_modules/unist-util-is/lib/index.js");
/* harmony import */ var _block_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./block.js */ "./node_modules/rehype-minify-whitespace/lib/block.js");
/* harmony import */ var _content_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./content.js */ "./node_modules/rehype-minify-whitespace/lib/content.js");
/* harmony import */ var _skippable_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./skippable.js */ "./node_modules/rehype-minify-whitespace/lib/skippable.js");
/**
 * @typedef {import('hast').Nodes} Nodes
 * @typedef {import('hast').Parents} Parents
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Text} Text
 */

/**
 * @callback Collapse
 *   Collapse a string.
 * @param {string} value
 *   Value to collapse.
 * @returns {string}
 *   Collapsed value.
 *
 * @typedef Options
 *   Configuration.
 * @property {boolean | null | undefined} [newlines=false]
 *   Collapse whitespace containing newlines to `'\n'` instead of `' '`
 *   (default: `false`); the default is to collapse to a single space.
 *
 * @typedef Result
 *   Result.
 * @property {boolean} remove
 *   Whether to remove.
 * @property {boolean} ignore
 *   Whether to ignore.
 * @property {boolean} stripAtStart
 *   Whether to strip at the start.
 *
 * @typedef State
 *   Info passed around.
 * @property {Collapse} collapse
 *   Collapse.
 * @property {Whitespace} whitespace
 *   Current whitespace.
 * @property {boolean | undefined} [before]
 *   Whether there is a break before (default: `false`).
 * @property {boolean | undefined} [after]
 *   Whether there is a break after (default: `false`).
 *
 * @typedef {'normal' | 'nowrap' | 'pre' | 'pre-wrap'} Whitespace
 *   Whitespace setting.
 */









/** @type {Options} */
const emptyOptions = {}
const ignorableNode = (0,unist_util_is__WEBPACK_IMPORTED_MODULE_0__.convert)(['doctype', 'comment'])

/**
 * Minify whitespace.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
function rehypeMinifyWhitespace(options) {
  const settings = options || emptyOptions
  const collapse = collapseFactory(
    settings.newlines ? replaceNewlines : replaceWhitespace
  )

  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    minify(tree, {collapse, whitespace: 'normal'})
  }
}

/**
 * @param {Nodes} node
 *   Node.
 * @param {State} state
 *   Info passed around.
 * @returns {Result}
 *   Result.
 */
function minify(node, state) {
  if ('children' in node) {
    const settings = {...state}

    if (node.type === 'root' || blocklike(node)) {
      settings.before = true
      settings.after = true
    }

    settings.whitespace = inferWhiteSpace(node, state)

    return all(node, settings)
  }

  if (node.type === 'text') {
    if (state.whitespace === 'normal') {
      return minifyText(node, state)
    }

    // Naïve collapse, but no trimming:
    if (state.whitespace === 'nowrap') {
      node.value = state.collapse(node.value)
    }

    // The `pre-wrap` or `pre` whitespace settings are neither collapsed nor
    // trimmed.
  }

  return {ignore: ignorableNode(node), stripAtStart: false, remove: false}
}

/**
 * @param {Text} node
 *   Node.
 * @param {State} state
 *   Info passed around.
 * @returns {Result}
 *   Result.
 */
function minifyText(node, state) {
  const value = state.collapse(node.value)
  const result = {ignore: false, stripAtStart: false, remove: false}
  let start = 0
  let end = value.length

  if (state.before && removable(value.charAt(0))) {
    start++
  }

  if (start !== end && removable(value.charAt(end - 1))) {
    if (state.after) {
      end--
    } else {
      result.stripAtStart = true
    }
  }

  if (start === end) {
    result.remove = true
  } else {
    node.value = value.slice(start, end)
  }

  return result
}

/**
 * @param {Parents} parent
 *   Node.
 * @param {State} state
 *   Info passed around.
 * @returns {Result}
 *   Result.
 */
function all(parent, state) {
  let before = state.before
  const after = state.after
  const children = parent.children
  let length = children.length
  let index = -1

  while (++index < length) {
    const result = minify(children[index], {
      ...state,
      after: collapsableAfter(children, index, after),
      before
    })

    if (result.remove) {
      children.splice(index, 1)
      index--
      length--
    } else if (!result.ignore) {
      before = result.stripAtStart
    }

    // If this element, such as a `<select>` or `<img>`, contributes content
    // somehow, allow whitespace again.
    if (content(children[index])) {
      before = false
    }
  }

  return {ignore: false, stripAtStart: Boolean(before || after), remove: false}
}

/**
 * @param {Array<Nodes>} nodes
 *   Nodes.
 * @param {number} index
 *   Index.
 * @param {boolean | undefined} [after]
 *   Whether there is a break after `nodes` (default: `false`).
 * @returns {boolean | undefined}
 *   Whether there is a break after the node at `index`.
 */
function collapsableAfter(nodes, index, after) {
  while (++index < nodes.length) {
    const node = nodes[index]
    let result = inferBoundary(node)

    if (result === undefined && 'children' in node && !skippable(node)) {
      result = collapsableAfter(node.children, -1)
    }

    if (typeof result === 'boolean') {
      return result
    }
  }

  return after
}

/**
 * Infer two types of boundaries:
 *
 * 1. `true` — boundary for which whitespace around it does not contribute
 *    anything
 * 2. `false` — boundary for which whitespace around it *does* contribute
 *
 * No result (`undefined`) is returned if it is unknown.
 *
 * @param {Nodes} node
 *   Node.
 * @returns {boolean | undefined}
 *   Boundary.
 */
function inferBoundary(node) {
  if (node.type === 'element') {
    if (content(node)) {
      return false
    }

    if (blocklike(node)) {
      return true
    }

    // Unknown: either depends on siblings if embedded or metadata, or on
    // children.
  } else if (node.type === 'text') {
    if (!(0,hast_util_whitespace__WEBPACK_IMPORTED_MODULE_1__.whitespace)(node)) {
      return false
    }
  } else if (!ignorableNode(node)) {
    return false
  }
}

/**
 * Infer whether a node is skippable.
 *
 * @param {Nodes} node
 *   Node.
 * @returns {boolean}
 *   Whether `node` is skippable.
 */
function content(node) {
  return (0,hast_util_embedded__WEBPACK_IMPORTED_MODULE_2__.embedded)(node) || (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_3__.isElement)(node, _content_js__WEBPACK_IMPORTED_MODULE_4__.content)
}

/**
 * See: <https://html.spec.whatwg.org/#the-css-user-agent-style-sheet-and-presentational-hints>
 *
 * @param {Nodes} node
 *   Node.
 * @returns {boolean}
 *   Whether `node` is block-like.
 */
function blocklike(node) {
  return (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_3__.isElement)(node, _block_js__WEBPACK_IMPORTED_MODULE_5__.blocks)
}

/**
 * @param {Parents} node
 *   Node.
 * @returns {boolean}
 *   Whether `node` is skippable.
 */
function skippable(node) {
  return (
    Boolean(node.type === 'element' && node.properties.hidden) ||
    ignorableNode(node) ||
    (0,hast_util_is_element__WEBPACK_IMPORTED_MODULE_3__.isElement)(node, _skippable_js__WEBPACK_IMPORTED_MODULE_6__.skippable)
  )
}

/**
 * @param {string} character
 *   Character.
 * @returns {boolean}
 *   Whether `character` is removable.
 */
function removable(character) {
  return character === ' ' || character === '\n'
}

/**
 * @type {Collapse}
 */
function replaceNewlines(value) {
  const match = /\r?\n|\r/.exec(value)
  return match ? match[0] : ' '
}

/**
 * @type {Collapse}
 */
function replaceWhitespace() {
  return ' '
}

/**
 * @param {Collapse} replace
 * @returns {Collapse}
 *   Collapse.
 */
function collapseFactory(replace) {
  return collapse

  /**
   * @type {Collapse}
   */
  function collapse(value) {
    return String(value).replace(/[\t\n\v\f\r ]+/g, replace)
  }
}

/**
 * We don’t need to support void elements here (so `nobr wbr` -> `normal` is
 * ignored).
 *
 * @param {Parents} node
 *   Node.
 * @param {State} state
 *   Info passed around.
 * @returns {Whitespace}
 *   Whitespace.
 */
function inferWhiteSpace(node, state) {
  if ('tagName' in node && node.properties) {
    switch (node.tagName) {
      // Whitespace in script/style, while not displayed by CSS as significant,
      // could have some meaning in JS/CSS, so we can’t touch them.
      case 'listing':
      case 'plaintext':
      case 'script':
      case 'style':
      case 'xmp': {
        return 'pre'
      }

      case 'nobr': {
        return 'nowrap'
      }

      case 'pre': {
        return node.properties.wrap ? 'pre-wrap' : 'pre'
      }

      case 'td':
      case 'th': {
        return node.properties.noWrap ? 'nowrap' : state.whitespace
      }

      case 'textarea': {
        return 'pre-wrap'
      }

      default:
    }
  }

  return state.whitespace
}


/***/ }),

/***/ "./node_modules/rehype-minify-whitespace/lib/skippable.js":
/*!****************************************************************!*\
  !*** ./node_modules/rehype-minify-whitespace/lib/skippable.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   skippable: () => (/* binding */ skippable)
/* harmony export */ });
const skippable = [
  'area',
  'base',
  'basefont',
  'dialog',
  'datalist',
  'head',
  'link',
  'meta',
  'noembed',
  'noframes',
  'param',
  'rp',
  'script',
  'source',
  'style',
  'template',
  'track',
  'title'
]


/***/ }),

/***/ "./node_modules/rehype-remark/lib/index.js":
/*!*************************************************!*\
  !*** ./node_modules/rehype-remark/lib/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rehypeRemark)
/* harmony export */ });
/* harmony import */ var hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hast-util-to-mdast */ "./node_modules/hast-util-to-mdast/lib/index.js");
/**
 * @typedef {import('hast').Root} HastRoot
 * @typedef {import('hast-util-to-mdast').Options} Options
 * @typedef {import('mdast').Root} MdastRoot
 * @typedef {import('unified').Processor<MdastRoot>} Processor
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @callback TransformBridge
 *   Bridge-mode.
 *
 *   Runs the destination with the new mdast tree.
 *   Discards result.
 * @param {HastRoot} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {Promise<undefined>}
 *   Nothing.
 *
 * @callback TransformMutate
 *  Mutate-mode.
 *
 *  Further transformers run on the mdast tree.
 * @param {HastRoot} tree
 *   Tree.
 * @param {VFile} file
 *   File.
 * @returns {MdastRoot}
 *   Tree (mdast).
 */



/** @satisfies {Options} */
const defaults = {document: true}

/**
 * Turn HTML into markdown.
 *
 * ###### Notes
 *
 * *   if a processor is given, runs the (remark) plugins used on it with an
 *     mdast tree, then discards the result (*bridge mode*)
 * *   otherwise, returns an mdast tree, the plugins used after `rehypeRemark`
 *     are remark plugins (*mutate mode*)
 *
 * > 👉 **Note**: It’s highly unlikely that you want to pass a `processor`.
 *
 * @overload
 * @param {Processor} processor
 * @param {Options | null | undefined} [options]
 * @returns {TransformBridge}
 *
 * @overload
 * @param {Options | null | undefined} [options]
 * @returns {TransformMutate}
 *
 * @param {Options | Processor | null | undefined} [destination]
 *   Processor or configuration (optional).
 * @param {Options | null | undefined} [options]
 *   When a processor was given, configuration (optional).
 * @returns {TransformBridge | TransformMutate}
 *   Transform.
 */
function rehypeRemark(destination, options) {
  if (destination && 'run' in destination) {
    /**
     * @type {TransformBridge}
     */
    return async function (tree, file) {
      const mdastTree = (0,hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_0__.toMdast)(tree, {...defaults, ...options})
      await destination.run(mdastTree, file)
    }
  }

  /**
   * @type {TransformMutate}
   */
  return function (tree) {
    return /** @type {MdastRoot} */ (
      (0,hast_util_to_mdast__WEBPACK_IMPORTED_MODULE_0__.toMdast)(tree, {...defaults, ...destination})
    )
  }
}


/***/ }),

/***/ "./node_modules/remark-gfm/lib/index.js":
/*!**********************************************!*\
  !*** ./node_modules/remark-gfm/lib/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ remarkGfm)
/* harmony export */ });
/* harmony import */ var mdast_util_gfm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mdast-util-gfm */ "./node_modules/mdast-util-gfm/lib/index.js");
/* harmony import */ var micromark_extension_gfm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! micromark-extension-gfm */ "./node_modules/micromark-extension-gfm/index.js");
/// <reference types="remark-parse" />
/// <reference types="remark-stringify" />

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-gfm').Options} MdastOptions
 * @typedef {import('micromark-extension-gfm').Options} MicromarkOptions
 * @typedef {import('unified').Processor<Root>} Processor
 */

/**
 * @typedef {MicromarkOptions & MdastOptions} Options
 *   Configuration.
 */




/** @type {Options} */
const emptyOptions = {}

/**
 * Add support GFM (autolink literals, footnotes, strikethrough, tables,
 * tasklists).
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
function remarkGfm(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ (this)
  const settings = options || emptyOptions
  const data = self.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

  micromarkExtensions.push((0,micromark_extension_gfm__WEBPACK_IMPORTED_MODULE_0__.gfm)(settings))
  fromMarkdownExtensions.push((0,mdast_util_gfm__WEBPACK_IMPORTED_MODULE_1__.gfmFromMarkdown)())
  toMarkdownExtensions.push((0,mdast_util_gfm__WEBPACK_IMPORTED_MODULE_1__.gfmToMarkdown)(settings))
}


/***/ }),

/***/ "./node_modules/remark-stringify/lib/index.js":
/*!****************************************************!*\
  !*** ./node_modules/remark-stringify/lib/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ remarkStringify)
/* harmony export */ });
/* harmony import */ var mdast_util_to_markdown__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-to-markdown */ "./node_modules/mdast-util-to-markdown/lib/index.js");
/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownOptions
 * @typedef {import('unified').Compiler<Root, string>} Compiler
 * @typedef {import('unified').Processor<undefined, undefined, undefined, Root, string>} Processor
 */

/**
 * @typedef {Omit<ToMarkdownOptions, 'extensions'>} Options
 */



/**
 * Add support for serializing to markdown.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
function remarkStringify(options) {
  /** @type {Processor} */
  // @ts-expect-error: TS in JSDoc generates wrong types if `this` is typed regularly.
  const self = this

  self.compiler = compiler

  /**
   * @type {Compiler}
   */
  function compiler(tree) {
    return (0,mdast_util_to_markdown__WEBPACK_IMPORTED_MODULE_0__.toMarkdown)(tree, {
      ...self.data('settings'),
      ...options,
      // Note: this option is not in the readme.
      // The goal is for it to be set by plugins on `data` instead of being
      // passed by users.
      extensions: self.data('toMarkdownExtensions') || []
    })
  }
}


/***/ }),

/***/ "./node_modules/space-separated-tokens/index.js":
/*!******************************************************!*\
  !*** ./node_modules/space-separated-tokens/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parse: () => (/* binding */ parse),
/* harmony export */   stringify: () => (/* binding */ stringify)
/* harmony export */ });
/**
 * Parse space separated tokens to an array of strings.
 *
 * @param {string} value Space separated tokens
 * @returns {Array.<string>} Tokens
 */
function parse(value) {
  const input = String(value || '').trim()
  return input ? input.split(/[ \t\n\r\f]+/g) : []
}

/**
 * Serialize an array of strings as space separated tokens.
 *
 * @param {Array.<string|number>} values Tokens
 * @returns {string} Space separated tokens
 */
function stringify(values) {
  return values.join(' ').trim()
}


/***/ }),

/***/ "./node_modules/trim-trailing-lines/index.js":
/*!***************************************************!*\
  !*** ./node_modules/trim-trailing-lines/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   trimTrailingLines: () => (/* binding */ trimTrailingLines)
/* harmony export */ });
/**
 * Remove final line endings from `value`
 *
 * @param {unknown} value
 *   Value with trailing line endings, coerced to string.
 * @return {string}
 *   Value without trailing line endings.
 */
function trimTrailingLines(value) {
  const input = String(value)
  let end = input.length

  while (end > 0) {
    const code = input.codePointAt(end - 1)
    if (code !== undefined && (code === 10 || code === 13)) {
      end--
    } else {
      break
    }
  }

  return input.slice(0, end)
}


/***/ }),

/***/ "./node_modules/trough/index.js":
/*!**************************************!*\
  !*** ./node_modules/trough/index.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   trough: () => (/* binding */ trough),
/* harmony export */   wrap: () => (/* binding */ wrap)
/* harmony export */ });
/**
 * @typedef {(error?: Error|null|undefined, ...output: any[]) => void} Callback
 * @typedef {(...input: any[]) => any} Middleware
 *
 * @typedef {(...input: any[]) => void} Run Call all middleware.
 * @typedef {(fn: Middleware) => Pipeline} Use Add `fn` (middleware) to the list.
 * @typedef {{run: Run, use: Use}} Pipeline
 */

/**
 * Create new middleware.
 *
 * @returns {Pipeline}
 */
function trough() {
  /** @type {Middleware[]} */
  const fns = []
  /** @type {Pipeline} */
  const pipeline = {run, use}

  return pipeline

  /** @type {Run} */
  function run(...values) {
    let middlewareIndex = -1
    /** @type {Callback} */
    const callback = values.pop()

    if (typeof callback !== 'function') {
      throw new TypeError('Expected function as last argument, not ' + callback)
    }

    next(null, ...values)

    /**
     * Run the next `fn`, or we’re done.
     *
     * @param {Error|null|undefined} error
     * @param {any[]} output
     */
    function next(error, ...output) {
      const fn = fns[++middlewareIndex]
      let index = -1

      if (error) {
        callback(error)
        return
      }

      // Copy non-nullish input into values.
      while (++index < values.length) {
        if (output[index] === null || output[index] === undefined) {
          output[index] = values[index]
        }
      }

      // Save the newly created `output` for the next call.
      values = output

      // Next or done.
      if (fn) {
        wrap(fn, next)(...output)
      } else {
        callback(null, ...output)
      }
    }
  }

  /** @type {Use} */
  function use(middelware) {
    if (typeof middelware !== 'function') {
      throw new TypeError(
        'Expected `middelware` to be a function, not ' + middelware
      )
    }

    fns.push(middelware)
    return pipeline
  }
}

/**
 * Wrap `middleware`.
 * Can be sync or async; return a promise, receive a callback, or return new
 * values and errors.
 *
 * @param {Middleware} middleware
 * @param {Callback} callback
 */
function wrap(middleware, callback) {
  /** @type {boolean} */
  let called

  return wrapped

  /**
   * Call `middleware`.
   * @param {any[]} parameters
   * @returns {void}
   */
  function wrapped(...parameters) {
    const fnExpectsCallback = middleware.length > parameters.length
    /** @type {any} */
    let result

    if (fnExpectsCallback) {
      parameters.push(done)
    }

    try {
      result = middleware(...parameters)
    } catch (error) {
      /** @type {Error} */
      const exception = error

      // Well, this is quite the pickle.
      // `middleware` received a callback and called it synchronously, but that
      // threw an error.
      // The only thing left to do is to throw the thing instead.
      if (fnExpectsCallback && called) {
        throw exception
      }

      return done(exception)
    }

    if (!fnExpectsCallback) {
      if (result instanceof Promise) {
        result.then(then, done)
      } else if (result instanceof Error) {
        done(result)
      } else {
        then(result)
      }
    }
  }

  /**
   * Call `callback`, only once.
   * @type {Callback}
   */
  function done(error, ...output) {
    if (!called) {
      called = true
      callback(error, ...output)
    }
  }

  /**
   * Call `done` with one value.
   *
   * @param {any} [value]
   */
  function then(value) {
    done(null, value)
  }
}


/***/ }),

/***/ "./node_modules/unified/lib/callable-instance.js":
/*!*******************************************************!*\
  !*** ./node_modules/unified/lib/callable-instance.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CallableInstance: () => (/* binding */ CallableInstance)
/* harmony export */ });
const CallableInstance =
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  (
    /** @type {unknown} */
    (
      /**
       * @this {Function}
       * @param {string | symbol} property
       * @returns {(...parameters: Array<unknown>) => unknown}
       */
      function (property) {
        const self = this
        const constr = self.constructor
        const proto = /** @type {Record<string | symbol, Function>} */ (
          // Prototypes do exist.
          // type-coverage:ignore-next-line
          constr.prototype
        )
        const func = proto[property]
        /** @type {(...parameters: Array<unknown>) => unknown} */
        const apply = function () {
          return func.apply(apply, arguments)
        }

        Object.setPrototypeOf(apply, proto)

        const names = Object.getOwnPropertyNames(func)

        for (const p of names) {
          const descriptor = Object.getOwnPropertyDescriptor(func, p)
          if (descriptor) Object.defineProperty(apply, p, descriptor)
        }

        return apply
      }
    )
  )


/***/ }),

/***/ "./node_modules/unified/lib/index.js":
/*!*******************************************!*\
  !*** ./node_modules/unified/lib/index.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Processor: () => (/* binding */ Processor),
/* harmony export */   unified: () => (/* binding */ unified)
/* harmony export */ });
/* harmony import */ var bail__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! bail */ "./node_modules/bail/index.js");
/* harmony import */ var extend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! extend */ "./node_modules/extend/index.js");
/* harmony import */ var devlop__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! devlop */ "./node_modules/devlop/lib/development.js");
/* harmony import */ var is_plain_obj__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! is-plain-obj */ "./node_modules/is-plain-obj/index.js");
/* harmony import */ var trough__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! trough */ "./node_modules/trough/index.js");
/* harmony import */ var vfile__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! vfile */ "./node_modules/vfile/lib/index.js");
/* harmony import */ var _callable_instance_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./callable-instance.js */ "./node_modules/unified/lib/callable-instance.js");
/**
 * @typedef {import('trough').Pipeline} Pipeline
 *
 * @typedef {import('unist').Node} Node
 *
 * @typedef {import('vfile').Compatible} Compatible
 * @typedef {import('vfile').Value} Value
 *
 * @typedef {import('../index.js').CompileResultMap} CompileResultMap
 * @typedef {import('../index.js').Data} Data
 * @typedef {import('../index.js').Settings} Settings
 */

/**
 * @typedef {CompileResultMap[keyof CompileResultMap]} CompileResults
 *   Acceptable results from compilers.
 *
 *   To register custom results, add them to
 *   {@link CompileResultMap `CompileResultMap`}.
 */

/**
 * @template {Node} [Tree=Node]
 *   The node that the compiler receives (default: `Node`).
 * @template {CompileResults} [Result=CompileResults]
 *   The thing that the compiler yields (default: `CompileResults`).
 * @callback Compiler
 *   A **compiler** handles the compiling of a syntax tree to something else
 *   (in most cases, text) (TypeScript type).
 *
 *   It is used in the stringify phase and called with a {@link Node `Node`}
 *   and {@link VFile `VFile`} representation of the document to compile.
 *   It should return the textual representation of the given tree (typically
 *   `string`).
 *
 *   > 👉 **Note**: unified typically compiles by serializing: most compilers
 *   > return `string` (or `Uint8Array`).
 *   > Some compilers, such as the one configured with
 *   > [`rehype-react`][rehype-react], return other values (in this case, a
 *   > React tree).
 *   > If you’re using a compiler that doesn’t serialize, expect different
 *   > result values.
 *   >
 *   > To register custom results in TypeScript, add them to
 *   > {@link CompileResultMap `CompileResultMap`}.
 *
 *   [rehype-react]: https://github.com/rehypejs/rehype-react
 * @param {Tree} tree
 *   Tree to compile.
 * @param {VFile} file
 *   File associated with `tree`.
 * @returns {Result}
 *   New content: compiled text (`string` or `Uint8Array`, for `file.value`) or
 *   something else (for `file.result`).
 */

/**
 * @template {Node} [Tree=Node]
 *   The node that the parser yields (default: `Node`)
 * @callback Parser
 *   A **parser** handles the parsing of text to a syntax tree.
 *
 *   It is used in the parse phase and is called with a `string` and
 *   {@link VFile `VFile`} of the document to parse.
 *   It must return the syntax tree representation of the given file
 *   ({@link Node `Node`}).
 * @param {string} document
 *   Document to parse.
 * @param {VFile} file
 *   File associated with `document`.
 * @returns {Tree}
 *   Node representing the given file.
 */

/**
 * @typedef {(
 *   Plugin<Array<any>, any, any> |
 *   PluginTuple<Array<any>, any, any> |
 *   Preset
 * )} Pluggable
 *   Union of the different ways to add plugins and settings.
 */

/**
 * @typedef {Array<Pluggable>} PluggableList
 *   List of plugins and presets.
 */

// Note: we can’t use `callback` yet as it messes up `this`:
//  <https://github.com/microsoft/TypeScript/issues/55197>.
/**
 * @template {Array<unknown>} [PluginParameters=[]]
 *   Arguments passed to the plugin (default: `[]`, the empty tuple).
 * @template {Node | string | undefined} [Input=Node]
 *   Value that is expected as input (default: `Node`).
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node it expects.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be
 *       `string`.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be the
 *       node it expects.
 * @template [Output=Input]
 *   Value that is yielded as output (default: `Input`).
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node that that yields.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be the
 *       node that it yields.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be
 *       result it yields.
 * @typedef {(
 *   (this: Processor, ...parameters: PluginParameters) =>
 *     Input extends string ? // Parser.
 *        Output extends Node | undefined ? undefined | void : never :
 *     Output extends CompileResults ? // Compiler.
 *        Input extends Node | undefined ? undefined | void : never :
 *     Transformer<
 *       Input extends Node ? Input : Node,
 *       Output extends Node ? Output : Node
 *     > | undefined | void
 * )} Plugin
 *   Single plugin.
 *
 *   Plugins configure the processors they are applied on in the following
 *   ways:
 *
 *   *   they change the processor, such as the parser, the compiler, or by
 *       configuring data
 *   *   they specify how to handle trees and files
 *
 *   In practice, they are functions that can receive options and configure the
 *   processor (`this`).
 *
 *   > 👉 **Note**: plugins are called when the processor is *frozen*, not when
 *   > they are applied.
 */

/**
 * Tuple of a plugin and its configuration.
 *
 * The first item is a plugin, the rest are its parameters.
 *
 * @template {Array<unknown>} [TupleParameters=[]]
 *   Arguments passed to the plugin (default: `[]`, the empty tuple).
 * @template {Node | string | undefined} [Input=undefined]
 *   Value that is expected as input (optional).
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node it expects.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be
 *       `string`.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be the
 *       node it expects.
 * @template [Output=undefined] (optional).
 *   Value that is yielded as output.
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node that that yields.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be the
 *       node that it yields.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be
 *       result it yields.
 * @typedef {(
 *   [
 *     plugin: Plugin<TupleParameters, Input, Output>,
 *     ...parameters: TupleParameters
 *   ]
 * )} PluginTuple
 */

/**
 * @typedef Preset
 *   Sharable configuration.
 *
 *   They can contain plugins and settings.
 * @property {PluggableList | undefined} [plugins]
 *   List of plugins and presets (optional).
 * @property {Settings | undefined} [settings]
 *   Shared settings for parsers and compilers (optional).
 */

/**
 * @template {VFile} [File=VFile]
 *   The file that the callback receives (default: `VFile`).
 * @callback ProcessCallback
 *   Callback called when the process is done.
 *
 *   Called with either an error or a result.
 * @param {Error | undefined} [error]
 *   Fatal error (optional).
 * @param {File | undefined} [file]
 *   Processed file (optional).
 * @returns {undefined}
 *   Nothing.
 */

/**
 * @template {Node} [Tree=Node]
 *   The tree that the callback receives (default: `Node`).
 * @callback RunCallback
 *   Callback called when transformers are done.
 *
 *   Called with either an error or results.
 * @param {Error | undefined} [error]
 *   Fatal error (optional).
 * @param {Tree | undefined} [tree]
 *   Transformed tree (optional).
 * @param {VFile | undefined} [file]
 *   File (optional).
 * @returns {undefined}
 *   Nothing.
 */

/**
 * @template {Node} [Output=Node]
 *   Node type that the transformer yields (default: `Node`).
 * @callback TransformCallback
 *   Callback passed to transforms.
 *
 *   If the signature of a `transformer` accepts a third argument, the
 *   transformer may perform asynchronous operations, and must call it.
 * @param {Error | undefined} [error]
 *   Fatal error to stop the process (optional).
 * @param {Output | undefined} [tree]
 *   New, changed, tree (optional).
 * @param {VFile | undefined} [file]
 *   New, changed, file (optional).
 * @returns {undefined}
 *   Nothing.
 */

/**
 * @template {Node} [Input=Node]
 *   Node type that the transformer expects (default: `Node`).
 * @template {Node} [Output=Input]
 *   Node type that the transformer yields (default: `Input`).
 * @callback Transformer
 *   Transformers handle syntax trees and files.
 *
 *   They are functions that are called each time a syntax tree and file are
 *   passed through the run phase.
 *   When an error occurs in them (either because it’s thrown, returned,
 *   rejected, or passed to `next`), the process stops.
 *
 *   The run phase is handled by [`trough`][trough], see its documentation for
 *   the exact semantics of these functions.
 *
 *   > 👉 **Note**: you should likely ignore `next`: don’t accept it.
 *   > it supports callback-style async work.
 *   > But promises are likely easier to reason about.
 *
 *   [trough]: https://github.com/wooorm/trough#function-fninput-next
 * @param {Input} tree
 *   Tree to handle.
 * @param {VFile} file
 *   File to handle.
 * @param {TransformCallback<Output>} next
 *   Callback.
 * @returns {(
 *   Promise<Output | undefined | void> |
 *   Promise<never> | // For some reason this is needed separately.
 *   Output |
 *   Error |
 *   undefined |
 *   void
 * )}
 *   If you accept `next`, nothing.
 *   Otherwise:
 *
 *   *   `Error` — fatal error to stop the process
 *   *   `Promise<undefined>` or `undefined` — the next transformer keeps using
 *       same tree
 *   *   `Promise<Node>` or `Node` — new, changed, tree
 */

/**
 * @template {Node | undefined} ParseTree
 *   Output of `parse`.
 * @template {Node | undefined} HeadTree
 *   Input for `run`.
 * @template {Node | undefined} TailTree
 *   Output for `run`.
 * @template {Node | undefined} CompileTree
 *   Input of `stringify`.
 * @template {CompileResults | undefined} CompileResult
 *   Output of `stringify`.
 * @template {Node | string | undefined} Input
 *   Input of plugin.
 * @template Output
 *   Output of plugin (optional).
 * @typedef {(
 *   Input extends string
 *     ? Output extends Node | undefined
 *       ? // Parser.
 *         Processor<
 *           Output extends undefined ? ParseTree : Output,
 *           HeadTree,
 *           TailTree,
 *           CompileTree,
 *           CompileResult
 *         >
 *       : // Unknown.
 *         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
 *     : Output extends CompileResults
 *     ? Input extends Node | undefined
 *       ? // Compiler.
 *         Processor<
 *           ParseTree,
 *           HeadTree,
 *           TailTree,
 *           Input extends undefined ? CompileTree : Input,
 *           Output extends undefined ? CompileResult : Output
 *         >
 *       : // Unknown.
 *         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
 *     : Input extends Node | undefined
 *     ? Output extends Node | undefined
 *       ? // Transform.
 *         Processor<
 *           ParseTree,
 *           HeadTree extends undefined ? Input : HeadTree,
 *           Output extends undefined ? TailTree : Output,
 *           CompileTree,
 *           CompileResult
 *         >
 *       : // Unknown.
 *         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
 *     : // Unknown.
 *       Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
 * )} UsePlugin
 *   Create a processor based on the input/output of a {@link Plugin plugin}.
 */

/**
 * @template {CompileResults | undefined} Result
 *   Node type that the transformer yields.
 * @typedef {(
 *   Result extends Value | undefined ?
 *     VFile :
 *     VFile & {result: Result}
 *   )} VFileWithOutput
 *   Type to generate a {@link VFile `VFile`} corresponding to a compiler result.
 *
 *   If a result that is not acceptable on a `VFile` is used, that will
 *   be stored on the `result` field of {@link VFile `VFile`}.
 */









// To do: next major: drop `Compiler`, `Parser`: prefer lowercase.

// To do: we could start yielding `never` in TS when a parser is missing and
// `parse` is called.
// Currently, we allow directly setting `processor.parser`, which is untyped.

const own = {}.hasOwnProperty

/**
 * @template {Node | undefined} [ParseTree=undefined]
 *   Output of `parse` (optional).
 * @template {Node | undefined} [HeadTree=undefined]
 *   Input for `run` (optional).
 * @template {Node | undefined} [TailTree=undefined]
 *   Output for `run` (optional).
 * @template {Node | undefined} [CompileTree=undefined]
 *   Input of `stringify` (optional).
 * @template {CompileResults | undefined} [CompileResult=undefined]
 *   Output of `stringify` (optional).
 * @extends {CallableInstance<[], Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>>}
 */
class Processor extends _callable_instance_js__WEBPACK_IMPORTED_MODULE_2__.CallableInstance {
  /**
   * Create a processor.
   */
  constructor() {
    // If `Processor()` is called (w/o new), `copy` is called instead.
    super('copy')

    /**
     * Compiler to use (deprecated).
     *
     * @deprecated
     *   Use `compiler` instead.
     * @type {(
     *   Compiler<
     *     CompileTree extends undefined ? Node : CompileTree,
     *     CompileResult extends undefined ? CompileResults : CompileResult
     *   > |
     *   undefined
     * )}
     */
    this.Compiler = undefined

    /**
     * Parser to use (deprecated).
     *
     * @deprecated
     *   Use `parser` instead.
     * @type {(
     *   Parser<ParseTree extends undefined ? Node : ParseTree> |
     *   undefined
     * )}
     */
    this.Parser = undefined

    // Note: the following fields are considered private.
    // However, they are needed for tests, and TSC generates an untyped
    // `private freezeIndex` field for, which trips `type-coverage` up.
    // Instead, we use `@deprecated` to visualize that they shouldn’t be used.
    /**
     * Internal list of configured plugins.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {Array<PluginTuple<Array<unknown>>>}
     */
    this.attachers = []

    /**
     * Compiler to use.
     *
     * @type {(
     *   Compiler<
     *     CompileTree extends undefined ? Node : CompileTree,
     *     CompileResult extends undefined ? CompileResults : CompileResult
     *   > |
     *   undefined
     * )}
     */
    this.compiler = undefined

    /**
     * Internal state to track where we are while freezing.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {number}
     */
    this.freezeIndex = -1

    /**
     * Internal state to track whether we’re frozen.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {boolean | undefined}
     */
    this.frozen = undefined

    /**
     * Internal state.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {Data}
     */
    this.namespace = {}

    /**
     * Parser to use.
     *
     * @type {(
     *   Parser<ParseTree extends undefined ? Node : ParseTree> |
     *   undefined
     * )}
     */
    this.parser = undefined

    /**
     * Internal list of configured transformers.
     *
     * @deprecated
     *   This is a private internal property and should not be used.
     * @type {Pipeline}
     */
    this.transformers = (0,trough__WEBPACK_IMPORTED_MODULE_3__.trough)()
  }

  /**
   * Copy a processor.
   *
   * @deprecated
   *   This is a private internal method and should not be used.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   New *unfrozen* processor ({@link Processor `Processor`}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  copy() {
    // Cast as the type parameters will be the same after attaching.
    const destination =
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */ (
        new Processor()
      )
    let index = -1

    while (++index < this.attachers.length) {
      const attacher = this.attachers[index]
      destination.use(...attacher)
    }

    destination.data(extend__WEBPACK_IMPORTED_MODULE_0__(true, {}, this.namespace))

    return destination
  }

  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > 👉 **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * > 👉 **Note**: to register custom data in TypeScript, augment the
   * > {@link Data `Data`} interface.
   *
   * @example
   *   This example show how to get and set info:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   const processor = unified().data('alpha', 'bravo')
   *
   *   processor.data('alpha') // => 'bravo'
   *
   *   processor.data() // => {alpha: 'bravo'}
   *
   *   processor.data({charlie: 'delta'})
   *
   *   processor.data() // => {charlie: 'delta'}
   *   ```
   *
   * @template {keyof Data} Key
   *
   * @overload
   * @returns {Data}
   *
   * @overload
   * @param {Data} dataset
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Key} key
   * @returns {Data[Key]}
   *
   * @overload
   * @param {Key} key
   * @param {Data[Key]} value
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @param {Data | Key} [key]
   *   Key to get or set, or entire dataset to set, or nothing to get the
   *   entire dataset (optional).
   * @param {Data[Key]} [value]
   *   Value to set (optional).
   * @returns {unknown}
   *   The current processor when setting, the value at `key` when getting, or
   *   the entire dataset when getting without key.
   */
  data(key, value) {
    if (typeof key === 'string') {
      // Set `key`.
      if (arguments.length === 2) {
        assertUnfrozen('data', this.frozen)
        this.namespace[key] = value
        return this
      }

      // Get `key`.
      return (own.call(this.namespace, key) && this.namespace[key]) || undefined
    }

    // Set space.
    if (key) {
      assertUnfrozen('data', this.frozen)
      this.namespace = key
      return this
    }

    // Get space.
    return this.namespace
  }

  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   The current processor.
   */
  freeze() {
    if (this.frozen) {
      return this
    }

    // Cast so that we can type plugins easier.
    // Plugins are supposed to be usable on different processors, not just on
    // this exact processor.
    const self = /** @type {Processor} */ (/** @type {unknown} */ (this))

    while (++this.freezeIndex < this.attachers.length) {
      const [attacher, ...options] = this.attachers[this.freezeIndex]

      if (options[0] === false) {
        continue
      }

      if (options[0] === true) {
        options[0] = undefined
      }

      const transformer = attacher.call(self, ...options)

      if (typeof transformer === 'function') {
        this.transformers.use(transformer)
      }
    }

    this.frozen = true
    this.freezeIndex = Number.POSITIVE_INFINITY

    return this
  }

  /**
   * Parse text to a syntax tree.
   *
   * > 👉 **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param {Compatible | undefined} [file]
   *   file to parse (optional); typically `string` or `VFile`; any value
   *   accepted as `x` in `new VFile(x)`.
   * @returns {ParseTree extends undefined ? Node : ParseTree}
   *   Syntax tree representing `file`.
   */
  parse(file) {
    this.freeze()
    const realFile = vfile(file)
    const parser = this.parser || this.Parser
    assertParser('parse', parser)
    return parser(String(realFile), realFile)
  }

  /**
   * Process the given file as configured on the processor.
   *
   * > 👉 **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @overload
   * @param {Compatible | undefined} file
   * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
   * @returns {undefined}
   *
   * @overload
   * @param {Compatible | undefined} [file]
   * @returns {Promise<VFileWithOutput<CompileResult>>}
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`]; any value accepted as
   *   `x` in `new VFile(x)`.
   * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
   *   Callback (optional).
   * @returns {Promise<VFile> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise a promise, rejected with a fatal error or resolved with the
   *   processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > 👉 **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@link CompileResultMap `CompileResultMap`}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(file, done) {
    const self = this

    this.freeze()
    assertParser('process', this.parser || this.Parser)
    assertCompiler('process', this.compiler || this.Compiler)

    return done ? executor(undefined, done) : new Promise(executor)

    // Note: `void`s needed for TS.
    /**
     * @param {((file: VFileWithOutput<CompileResult>) => undefined | void) | undefined} resolve
     * @param {(error: Error | undefined) => undefined | void} reject
     * @returns {undefined}
     */
    function executor(resolve, reject) {
      const realFile = vfile(file)
      // Assume `ParseTree` (the result of the parser) matches `HeadTree` (the
      // input of the first transform).
      const parseTree =
        /** @type {HeadTree extends undefined ? Node : HeadTree} */ (
          /** @type {unknown} */ (self.parse(realFile))
        )

      self.run(parseTree, realFile, function (error, tree, file) {
        if (error || !tree || !file) {
          return realDone(error)
        }

        // Assume `TailTree` (the output of the last transform) matches
        // `CompileTree` (the input of the compiler).
        const compileTree =
          /** @type {CompileTree extends undefined ? Node : CompileTree} */ (
            /** @type {unknown} */ (tree)
          )

        const compileResult = self.stringify(compileTree, file)

        if (looksLikeAValue(compileResult)) {
          file.value = compileResult
        } else {
          file.result = compileResult
        }

        realDone(error, /** @type {VFileWithOutput<CompileResult>} */ (file))
      })

      /**
       * @param {Error | undefined} error
       * @param {VFileWithOutput<CompileResult> | undefined} [file]
       * @returns {undefined}
       */
      function realDone(error, file) {
        if (error || !file) {
          reject(error)
        } else if (resolve) {
          resolve(file)
        } else {
          (0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(done, '`done` is defined if `resolve` is not')
          done(undefined, file)
        }
      }
    }
  }

  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > 👉 **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`; any value accepted as
   *   `x` in `new VFile(x)`.
   * @returns {VFileWithOutput<CompileResult>}
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > 👉 **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@link CompileResultMap `CompileResultMap`}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(file) {
    /** @type {boolean} */
    let complete = false
    /** @type {VFileWithOutput<CompileResult> | undefined} */
    let result

    this.freeze()
    assertParser('processSync', this.parser || this.Parser)
    assertCompiler('processSync', this.compiler || this.Compiler)

    this.process(file, realDone)
    assertDone('processSync', 'process', complete)
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(result, 'we either bailed on an error or have a tree')

    return result

    /**
     * @type {ProcessCallback<VFileWithOutput<CompileResult>>}
     */
    function realDone(error, file) {
      complete = true
      ;(0,bail__WEBPACK_IMPORTED_MODULE_5__.bail)(error)
      result = file
    }
  }

  /**
   * Run *transformers* on a syntax tree.
   *
   * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `run` performs the run phase, not other phases.
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} file
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} [file]
   * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {(
   *   RunCallback<TailTree extends undefined ? Node : TailTree> |
   *   Compatible
   * )} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
   *   Callback (optional).
   * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise, a promise rejected with a fatal error or resolved with the
   *   transformed tree.
   */
  run(tree, file, done) {
    assertNode(tree)
    this.freeze()

    const transformers = this.transformers

    if (!done && typeof file === 'function') {
      done = file
      file = undefined
    }

    return done ? executor(undefined, done) : new Promise(executor)

    // Note: `void`s needed for TS.
    /**
     * @param {(
     *   ((tree: TailTree extends undefined ? Node : TailTree) => undefined | void) |
     *   undefined
     * )} resolve
     * @param {(error: Error) => undefined | void} reject
     * @returns {undefined}
     */
    function executor(resolve, reject) {
      ;(0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(
        typeof file !== 'function',
        '`file` can’t be a `done` anymore, we checked'
      )
      const realFile = vfile(file)
      transformers.run(tree, realFile, realDone)

      /**
       * @param {Error | undefined} error
       * @param {Node} outputTree
       * @param {VFile} file
       * @returns {undefined}
       */
      function realDone(error, outputTree, file) {
        const resultingTree =
          /** @type {TailTree extends undefined ? Node : TailTree} */ (
            outputTree || tree
          )

        if (error) {
          reject(error)
        } else if (resolve) {
          resolve(resultingTree)
        } else {
          (0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(done, '`done` is defined if `resolve` is not')
          done(undefined, resultingTree, file)
        }
      }
    }
  }

  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > 👉 **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {TailTree extends undefined ? Node : TailTree}
   *   Transformed tree.
   */
  runSync(tree, file) {
    /** @type {boolean} */
    let complete = false
    /** @type {(TailTree extends undefined ? Node : TailTree) | undefined} */
    let result

    this.run(tree, file, realDone)

    assertDone('runSync', 'run', complete)
    ;(0,devlop__WEBPACK_IMPORTED_MODULE_4__.ok)(result, 'we either bailed on an error or have a tree')
    return result

    /**
     * @type {RunCallback<TailTree extends undefined ? Node : TailTree>}
     */
    function realDone(error, tree) {
      ;(0,bail__WEBPACK_IMPORTED_MODULE_5__.bail)(error)
      result = tree
      complete = true
    }
  }

  /**
   * Compile a syntax tree.
   *
   * > 👉 **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `stringify` performs the stringify phase, not the run phase
   * > or other phases.
   *
   * @param {CompileTree extends undefined ? Node : CompileTree} tree
   *   Tree to compile.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {CompileResult extends undefined ? Value : CompileResult}
   *   Textual representation of the tree (see note).
   *
   *   > 👉 **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@link CompileResultMap `CompileResultMap`}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(tree, file) {
    this.freeze()
    const realFile = vfile(file)
    const compiler = this.compiler || this.Compiler
    assertCompiler('stringify', compiler)
    assertNode(tree)

    return compiler(tree, realFile)
  }

  /**
   * Configure the processor to use a plugin, a list of usable values, or a
   * preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * > 👉 **Note**: `use` cannot be called on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @example
   *   There are many ways to pass plugins to `.use()`.
   *   This example gives an overview:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *     // Plugins:
   *     .use([pluginB, pluginC])
   *     // Two plugins, the second with options:
   *     .use([pluginD, [pluginE, {}]])
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @template {Array<unknown>} [Parameters=[]]
   * @template {Node | string | undefined} [Input=undefined]
   * @template [Output=Input]
   *
   * @overload
   * @param {Preset | null | undefined} [preset]
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {PluggableList} list
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Plugin<Parameters, Input, Output>} plugin
   * @param {...(Parameters | [boolean])} parameters
   * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
   *
   * @param {PluggableList | Plugin | Preset | null | undefined} value
   *   Usable value.
   * @param {...unknown} parameters
   *   Parameters, when a plugin is given as a usable value.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   Current processor.
   */
  use(value, ...parameters) {
    const attachers = this.attachers
    const namespace = this.namespace

    assertUnfrozen('use', this.frozen)

    if (value === null || value === undefined) {
      // Empty.
    } else if (typeof value === 'function') {
      addPlugin(value, parameters)
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        addList(value)
      } else {
        addPreset(value)
      }
    } else {
      throw new TypeError('Expected usable value, not `' + value + '`')
    }

    return this

    /**
     * @param {Pluggable} value
     * @returns {undefined}
     */
    function add(value) {
      if (typeof value === 'function') {
        addPlugin(value, [])
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          const [plugin, ...parameters] =
            /** @type {PluginTuple<Array<unknown>>} */ (value)
          addPlugin(plugin, parameters)
        } else {
          addPreset(value)
        }
      } else {
        throw new TypeError('Expected usable value, not `' + value + '`')
      }
    }

    /**
     * @param {Preset} result
     * @returns {undefined}
     */
    function addPreset(result) {
      if (!('plugins' in result) && !('settings' in result)) {
        throw new Error(
          'Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither'
        )
      }

      addList(result.plugins)

      if (result.settings) {
        namespace.settings = extend__WEBPACK_IMPORTED_MODULE_0__(true, namespace.settings, result.settings)
      }
    }

    /**
     * @param {PluggableList | null | undefined} plugins
     * @returns {undefined}
     */
    function addList(plugins) {
      let index = -1

      if (plugins === null || plugins === undefined) {
        // Empty.
      } else if (Array.isArray(plugins)) {
        while (++index < plugins.length) {
          const thing = plugins[index]
          add(thing)
        }
      } else {
        throw new TypeError('Expected a list of plugins, not `' + plugins + '`')
      }
    }

    /**
     * @param {Plugin} plugin
     * @param {Array<unknown>} parameters
     * @returns {undefined}
     */
    function addPlugin(plugin, parameters) {
      let index = -1
      let entryIndex = -1

      while (++index < attachers.length) {
        if (attachers[index][0] === plugin) {
          entryIndex = index
          break
        }
      }

      if (entryIndex === -1) {
        attachers.push([plugin, ...parameters])
      }
      // Only set if there was at least a `primary` value, otherwise we’d change
      // `arguments.length`.
      else if (parameters.length > 0) {
        let [primary, ...rest] = parameters
        const currentPrimary = attachers[entryIndex][1]
        if ((0,is_plain_obj__WEBPACK_IMPORTED_MODULE_1__["default"])(currentPrimary) && (0,is_plain_obj__WEBPACK_IMPORTED_MODULE_1__["default"])(primary)) {
          primary = extend__WEBPACK_IMPORTED_MODULE_0__(true, currentPrimary, primary)
        }

        attachers[entryIndex] = [plugin, primary, ...rest]
      }
    }
  }
}

// Note: this returns a *callable* instance.
// That’s why it’s documented as a function.
/**
 * Create a new processor.
 *
 * @example
 *   This example shows how a new processor can be created (from `remark`) and linked
 *   to **stdin**(4) and **stdout**(4).
 *
 *   ```js
 *   import process from 'node:process'
 *   import concatStream from 'concat-stream'
 *   import {remark} from 'remark'
 *
 *   process.stdin.pipe(
 *     concatStream(function (buf) {
 *       process.stdout.write(String(remark().processSync(buf)))
 *     })
 *   )
 *   ```
 *
 * @returns
 *   New *unfrozen* processor (`processor`).
 *
 *   This processor is configured to work the same as its ancestor.
 *   When the descendant processor is configured in the future it does not
 *   affect the ancestral processor.
 */
const unified = new Processor().freeze()

/**
 * Assert a parser is available.
 *
 * @param {string} name
 * @param {unknown} value
 * @returns {asserts value is Parser}
 */
function assertParser(name, value) {
  if (typeof value !== 'function') {
    throw new TypeError('Cannot `' + name + '` without `parser`')
  }
}

/**
 * Assert a compiler is available.
 *
 * @param {string} name
 * @param {unknown} value
 * @returns {asserts value is Compiler}
 */
function assertCompiler(name, value) {
  if (typeof value !== 'function') {
    throw new TypeError('Cannot `' + name + '` without `compiler`')
  }
}

/**
 * Assert the processor is not frozen.
 *
 * @param {string} name
 * @param {unknown} frozen
 * @returns {asserts frozen is false}
 */
function assertUnfrozen(name, frozen) {
  if (frozen) {
    throw new Error(
      'Cannot call `' +
        name +
        '` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.'
    )
  }
}

/**
 * Assert `node` is a unist node.
 *
 * @param {unknown} node
 * @returns {asserts node is Node}
 */
function assertNode(node) {
  // `isPlainObj` unfortunately uses `any` instead of `unknown`.
  // type-coverage:ignore-next-line
  if (!(0,is_plain_obj__WEBPACK_IMPORTED_MODULE_1__["default"])(node) || typeof node.type !== 'string') {
    throw new TypeError('Expected node, got `' + node + '`')
    // Fine.
  }
}

/**
 * Assert that `complete` is `true`.
 *
 * @param {string} name
 * @param {string} asyncName
 * @param {unknown} complete
 * @returns {asserts complete is true}
 */
function assertDone(name, asyncName, complete) {
  if (!complete) {
    throw new Error(
      '`' + name + '` finished async. Use `' + asyncName + '` instead'
    )
  }
}

/**
 * @param {Compatible | undefined} [value]
 * @returns {VFile}
 */
function vfile(value) {
  return looksLikeAVFile(value) ? value : new vfile__WEBPACK_IMPORTED_MODULE_6__.VFile(value)
}

/**
 * @param {Compatible | undefined} [value]
 * @returns {value is VFile}
 */
function looksLikeAVFile(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'message' in value &&
      'messages' in value
  )
}

/**
 * @param {unknown} [value]
 * @returns {value is Value}
 */
function looksLikeAValue(value) {
  return typeof value === 'string' || isUint8Array(value)
}

/**
 * Assert `value` is an `Uint8Array`.
 *
 * @param {unknown} value
 *   thing.
 * @returns {value is Uint8Array}
 *   Whether `value` is an `Uint8Array`.
 */
function isUint8Array(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'byteLength' in value &&
      'byteOffset' in value
  )
}


/***/ }),

/***/ "./node_modules/unist-util-find-after/lib/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/unist-util-find-after/lib/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findAfter: () => (/* binding */ findAfter)
/* harmony export */ });
/* harmony import */ var unist_util_is__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-is */ "./node_modules/unist-util-is/lib/index.js");
/**
 * @typedef {import('unist').Node} UnistNode
 * @typedef {import('unist').Parent} UnistParent
 */

/**
 * @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
 *   Test from `unist-util-is`.
 *
 *   Note: we have remove and add `undefined`, because otherwise when generating
 *   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
 *   which doesn’t work when publishing on npm.
 */

/**
 * @typedef {(
 *   Fn extends (value: any) => value is infer Thing
 *   ? Thing
 *   : Fallback
 * )} Predicate
 *   Get the value of a type guard `Fn`.
 * @template Fn
 *   Value; typically function that is a type guard (such as `(x): x is Y`).
 * @template Fallback
 *   Value to yield if `Fn` is not a type guard.
 */

/**
 * @typedef {(
 *   Check extends null | undefined // No test.
 *   ? Value
 *   : Value extends {type: Check} // String (type) test.
 *   ? Value
 *   : Value extends Check // Partial test.
 *   ? Value
 *   : Check extends Function // Function test.
 *   ? Predicate<Check, Value> extends Value
 *     ? Predicate<Check, Value>
 *     : never
 *   : never // Some other test?
 * )} MatchesOne
 *   Check whether a node matches a primitive check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test, but not arrays.
 */

/**
 * @typedef {(
 *   Check extends Array<any>
 *   ? MatchesOne<Value, Check[keyof Check]>
 *   : MatchesOne<Value, Check>
 * )} Matches
 *   Check whether a node matches a check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test.
 */

/**
 * @typedef {(
 *   Kind extends {children: Array<infer Child>}
 *   ? Child
 *   : never
 * )} Child
 *   Collect nodes that can be parents of `Child`.
 * @template {UnistNode} Kind
 *   All node types.
 */



/**
 * Find the first node in `parent` after another `node` or after an index,
 * that passes `test`.
 *
 * @param parent
 *   Parent node.
 * @param index
 *   Child node or index.
 * @param [test=undefined]
 *   Test for child to look for (optional).
 * @returns
 *   A child (matching `test`, if given) or `undefined`.
 */
const findAfter =
  // Note: overloads like this are needed to support optional generics.
  /**
   * @type {(
   *   (<Kind extends UnistParent, Check extends Test>(parent: Kind, index: Child<Kind> | number, test: Check) => Matches<Child<Kind>, Check> | undefined) &
   *   (<Kind extends UnistParent>(parent: Kind, index: Child<Kind> | number, test?: null | undefined) => Child<Kind> | undefined)
   * )}
   */
  (
    /**
     * @param {UnistParent} parent
     * @param {UnistNode | number} index
     * @param {Test} [test]
     * @returns {UnistNode | undefined}
     */
    function (parent, index, test) {
      const is = (0,unist_util_is__WEBPACK_IMPORTED_MODULE_0__.convert)(test)

      if (!parent || !parent.type || !parent.children) {
        throw new Error('Expected parent node')
      }

      if (typeof index === 'number') {
        if (index < 0 || index === Number.POSITIVE_INFINITY) {
          throw new Error('Expected positive finite number as index')
        }
      } else {
        index = parent.children.indexOf(index)

        if (index < 0) {
          throw new Error('Expected child node or index')
        }
      }

      while (++index < parent.children.length) {
        if (is(parent.children[index], index, parent)) {
          return parent.children[index]
        }
      }

      return undefined
    }
  )


/***/ }),

/***/ "./node_modules/unist-util-is/lib/index.js":
/*!*************************************************!*\
  !*** ./node_modules/unist-util-is/lib/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convert: () => (/* binding */ convert),
/* harmony export */   is: () => (/* binding */ is)
/* harmony export */ });
/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

/**
 * @template Fn
 * @template Fallback
 * @typedef {Fn extends (value: any) => value is infer Thing ? Thing : Fallback} Predicate
 */

/**
 * @callback Check
 *   Check that an arbitrary value is a node.
 * @param {unknown} this
 *   The given context.
 * @param {unknown} [node]
 *   Anything (typically a node).
 * @param {number | null | undefined} [index]
 *   The node’s position in its parent.
 * @param {Parent | null | undefined} [parent]
 *   The node’s parent.
 * @returns {boolean}
 *   Whether this is a node and passes a test.
 *
 * @typedef {Record<string, unknown> | Node} Props
 *   Object to check for equivalence.
 *
 *   Note: `Node` is included as it is common but is not indexable.
 *
 * @typedef {Array<Props | TestFunction | string> | Props | TestFunction | string | null | undefined} Test
 *   Check for an arbitrary node.
 *
 * @callback TestFunction
 *   Check if a node passes a test.
 * @param {unknown} this
 *   The given context.
 * @param {Node} node
 *   A node.
 * @param {number | undefined} [index]
 *   The node’s position in its parent.
 * @param {Parent | undefined} [parent]
 *   The node’s parent.
 * @returns {boolean | undefined | void}
 *   Whether this node passes the test.
 *
 *   Note: `void` is included until TS sees no return as `undefined`.
 */

/**
 * Check if `node` is a `Node` and whether it passes the given test.
 *
 * @param {unknown} node
 *   Thing to check, typically `Node`.
 * @param {Test} test
 *   A check for a specific node.
 * @param {number | null | undefined} index
 *   The node’s position in its parent.
 * @param {Parent | null | undefined} parent
 *   The node’s parent.
 * @param {unknown} context
 *   Context object (`this`) to pass to `test` functions.
 * @returns {boolean}
 *   Whether `node` is a node and passes a test.
 */
const is =
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(node: unknown, test: Condition, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(node: unknown, test: Condition, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(node: unknown, test: Condition, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((node?: null | undefined) => false) &
   *   ((node: unknown, test?: null | undefined, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((node: unknown, test?: Test, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => boolean)
   * )}
   */
  (
    /**
     * @param {unknown} [node]
     * @param {Test} [test]
     * @param {number | null | undefined} [index]
     * @param {Parent | null | undefined} [parent]
     * @param {unknown} [context]
     * @returns {boolean}
     */
    // eslint-disable-next-line max-params
    function (node, test, index, parent, context) {
      const check = convert(test)

      if (
        index !== undefined &&
        index !== null &&
        (typeof index !== 'number' ||
          index < 0 ||
          index === Number.POSITIVE_INFINITY)
      ) {
        throw new Error('Expected positive finite index')
      }

      if (
        parent !== undefined &&
        parent !== null &&
        (!is(parent) || !parent.children)
      ) {
        throw new Error('Expected parent node')
      }

      if (
        (parent === undefined || parent === null) !==
        (index === undefined || index === null)
      ) {
        throw new Error('Expected both parent and index')
      }

      return looksLikeANode(node)
        ? check.call(context, node, index, parent)
        : false
    }
  )

/**
 * Generate an assertion from a test.
 *
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes a compatible test.
 *
 * The created function is a bit faster because it expects valid input only:
 * a `node`, `index`, and `parent`.
 *
 * @param {Test} test
 *   *   when nullish, checks if `node` is a `Node`.
 *   *   when `string`, works like passing `(node) => node.type === test`.
 *   *   when `function` checks if function passed the node is true.
 *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   when `array`, checks if any one of the subtests pass.
 * @returns {Check}
 *   An assertion.
 */
const convert =
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  (
    /**
     * @param {Test} [test]
     * @returns {Check}
     */
    function (test) {
      if (test === null || test === undefined) {
        return ok
      }

      if (typeof test === 'function') {
        return castFactory(test)
      }

      if (typeof test === 'object') {
        return Array.isArray(test) ? anyFactory(test) : propsFactory(test)
      }

      if (typeof test === 'string') {
        return typeFactory(test)
      }

      throw new Error('Expected function, string, or object as test')
    }
  )

/**
 * @param {Array<Props | TestFunction | string>} tests
 * @returns {Check}
 */
function anyFactory(tests) {
  /** @type {Array<Check>} */
  const checks = []
  let index = -1

  while (++index < tests.length) {
    checks[index] = convert(tests[index])
  }

  return castFactory(any)

  /**
   * @this {unknown}
   * @type {TestFunction}
   */
  function any(...parameters) {
    let index = -1

    while (++index < checks.length) {
      if (checks[index].apply(this, parameters)) return true
    }

    return false
  }
}

/**
 * Turn an object into a test for a node with a certain fields.
 *
 * @param {Props} check
 * @returns {Check}
 */
function propsFactory(check) {
  const checkAsRecord = /** @type {Record<string, unknown>} */ (check)

  return castFactory(all)

  /**
   * @param {Node} node
   * @returns {boolean}
   */
  function all(node) {
    const nodeAsRecord = /** @type {Record<string, unknown>} */ (
      /** @type {unknown} */ (node)
    )

    /** @type {string} */
    let key

    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false
    }

    return true
  }
}

/**
 * Turn a string into a test for a node with a certain type.
 *
 * @param {string} check
 * @returns {Check}
 */
function typeFactory(check) {
  return castFactory(type)

  /**
   * @param {Node} node
   */
  function type(node) {
    return node && node.type === check
  }
}

/**
 * Turn a custom test into a test for a node that passes that test.
 *
 * @param {TestFunction} testFunction
 * @returns {Check}
 */
function castFactory(testFunction) {
  return check

  /**
   * @this {unknown}
   * @type {Check}
   */
  function check(value, index, parent) {
    return Boolean(
      looksLikeANode(value) &&
        testFunction.call(
          this,
          value,
          typeof index === 'number' ? index : undefined,
          parent || undefined
        )
    )
  }
}

function ok() {
  return true
}

/**
 * @param {unknown} value
 * @returns {value is Node}
 */
function looksLikeANode(value) {
  return value !== null && typeof value === 'object' && 'type' in value
}


/***/ }),

/***/ "./node_modules/unist-util-position/lib/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/unist-util-position/lib/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   pointEnd: () => (/* binding */ pointEnd),
/* harmony export */   pointStart: () => (/* binding */ pointStart),
/* harmony export */   position: () => (/* binding */ position)
/* harmony export */ });
/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Point} Point
 * @typedef {import('unist').Position} Position
 */

/**
 * @typedef NodeLike
 * @property {string} type
 * @property {PositionLike | null | undefined} [position]
 *
 * @typedef PositionLike
 * @property {PointLike | null | undefined} [start]
 * @property {PointLike | null | undefined} [end]
 *
 * @typedef PointLike
 * @property {number | null | undefined} [line]
 * @property {number | null | undefined} [column]
 * @property {number | null | undefined} [offset]
 */

/**
 * Get the ending point of `node`.
 *
 * @param node
 *   Node.
 * @returns
 *   Point.
 */
const pointEnd = point('end')

/**
 * Get the starting point of `node`.
 *
 * @param node
 *   Node.
 * @returns
 *   Point.
 */
const pointStart = point('start')

/**
 * Get the positional info of `node`.
 *
 * @param {'end' | 'start'} type
 *   Side.
 * @returns
 *   Getter.
 */
function point(type) {
  return point

  /**
   * Get the point info of `node` at a bound side.
   *
   * @param {Node | NodeLike | null | undefined} [node]
   * @returns {Point | undefined}
   */
  function point(node) {
    const point = (node && node.position && node.position[type]) || {}

    if (
      typeof point.line === 'number' &&
      point.line > 0 &&
      typeof point.column === 'number' &&
      point.column > 0
    ) {
      return {
        line: point.line,
        column: point.column,
        offset:
          typeof point.offset === 'number' && point.offset > -1
            ? point.offset
            : undefined
      }
    }
  }
}

/**
 * Get the positional info of `node`.
 *
 * @param {Node | NodeLike | null | undefined} [node]
 *   Node.
 * @returns {Position | undefined}
 *   Position.
 */
function position(node) {
  const start = pointStart(node)
  const end = pointEnd(node)

  if (start && end) {
    return {start, end}
  }
}


/***/ }),

/***/ "./node_modules/unist-util-visit-parents/lib/color.js":
/*!************************************************************!*\
  !*** ./node_modules/unist-util-visit-parents/lib/color.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   color: () => (/* binding */ color)
/* harmony export */ });
/**
 * @param {string} d
 * @returns {string}
 */
function color(d) {
  return d
}


/***/ }),

/***/ "./node_modules/unist-util-visit-parents/lib/index.js":
/*!************************************************************!*\
  !*** ./node_modules/unist-util-visit-parents/lib/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONTINUE: () => (/* binding */ CONTINUE),
/* harmony export */   EXIT: () => (/* binding */ EXIT),
/* harmony export */   SKIP: () => (/* binding */ SKIP),
/* harmony export */   visitParents: () => (/* binding */ visitParents)
/* harmony export */ });
/* harmony import */ var unist_util_is__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-is */ "./node_modules/unist-util-is/lib/index.js");
/* harmony import */ var unist_util_visit_parents_do_not_use_color__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! unist-util-visit-parents/do-not-use-color */ "./node_modules/unist-util-visit-parents/lib/color.js");
/**
 * @typedef {import('unist').Node} UnistNode
 * @typedef {import('unist').Parent} UnistParent
 */

/**
 * @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
 *   Test from `unist-util-is`.
 *
 *   Note: we have remove and add `undefined`, because otherwise when generating
 *   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
 *   which doesn’t work when publishing on npm.
 */

/**
 * @typedef {(
 *   Fn extends (value: any) => value is infer Thing
 *   ? Thing
 *   : Fallback
 * )} Predicate
 *   Get the value of a type guard `Fn`.
 * @template Fn
 *   Value; typically function that is a type guard (such as `(x): x is Y`).
 * @template Fallback
 *   Value to yield if `Fn` is not a type guard.
 */

/**
 * @typedef {(
 *   Check extends null | undefined // No test.
 *   ? Value
 *   : Value extends {type: Check} // String (type) test.
 *   ? Value
 *   : Value extends Check // Partial test.
 *   ? Value
 *   : Check extends Function // Function test.
 *   ? Predicate<Check, Value> extends Value
 *     ? Predicate<Check, Value>
 *     : never
 *   : never // Some other test?
 * )} MatchesOne
 *   Check whether a node matches a primitive check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test, but not arrays.
 */

/**
 * @typedef {(
 *   Check extends Array<any>
 *   ? MatchesOne<Value, Check[keyof Check]>
 *   : MatchesOne<Value, Check>
 * )} Matches
 *   Check whether a node matches a check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test.
 */

/**
 * @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
 *   Number; capped reasonably.
 */

/**
 * @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
 *   Increment a number in the type system.
 * @template {Uint} [I=0]
 *   Index.
 */

/**
 * @typedef {(
 *   Node extends UnistParent
 *   ? Node extends {children: Array<infer Children>}
 *     ? Child extends Children ? Node : never
 *     : never
 *   : never
 * )} InternalParent
 *   Collect nodes that can be parents of `Child`.
 * @template {UnistNode} Node
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
 *   Collect nodes in `Tree` that can be parents of `Child`.
 * @template {UnistNode} Tree
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {(
 *   Depth extends Max
 *   ? never
 *   :
 *     | InternalParent<Node, Child>
 *     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
 * )} InternalAncestor
 *   Collect nodes in `Tree` that can be ancestors of `Child`.
 * @template {UnistNode} Node
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 * @template {Uint} [Max=10]
 *   Max; searches up to this depth.
 * @template {Uint} [Depth=0]
 *   Current depth.
 */

/**
 * @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
 *   Collect nodes in `Tree` that can be ancestors of `Child`.
 * @template {UnistNode} Tree
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {(
 *   Tree extends UnistParent
 *     ? Depth extends Max
 *       ? Tree
 *       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
 *     : Tree
 * )} InclusiveDescendant
 *   Collect all (inclusive) descendants of `Tree`.
 *
 *   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
 *   > recurse without actually running into an infinite loop, which the
 *   > previous version did.
 *   >
 *   > Practically, a max of `2` is typically enough assuming a `Root` is
 *   > passed, but it doesn’t improve performance.
 *   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
 *   > Using up to `10` doesn’t hurt or help either.
 * @template {UnistNode} Tree
 *   Tree type.
 * @template {Uint} [Max=10]
 *   Max; searches up to this depth.
 * @template {Uint} [Depth=0]
 *   Current depth.
 */

/**
 * @typedef {'skip' | boolean} Action
 *   Union of the action types.
 *
 * @typedef {number} Index
 *   Move to the sibling at `index` next (after node itself is completely
 *   traversed).
 *
 *   Useful if mutating the tree, such as removing the node the visitor is
 *   currently on, or any of its previous siblings.
 *   Results less than 0 or greater than or equal to `children.length` stop
 *   traversing the parent.
 *
 * @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
 *   List with one or two values, the first an action, the second an index.
 *
 * @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
 *   Any value that can be returned from a visitor.
 */

/**
 * @callback Visitor
 *   Handle a node (matching `test`, if given).
 *
 *   Visitors are free to transform `node`.
 *   They can also transform the parent of node (the last of `ancestors`).
 *
 *   Replacing `node` itself, if `SKIP` is not returned, still causes its
 *   descendants to be walked (which is a bug).
 *
 *   When adding or removing previous siblings of `node` (or next siblings, in
 *   case of reverse), the `Visitor` should return a new `Index` to specify the
 *   sibling to traverse after `node` is traversed.
 *   Adding or removing next siblings of `node` (or previous siblings, in case
 *   of reverse) is handled as expected without needing to return a new `Index`.
 *
 *   Removing the children property of an ancestor still results in them being
 *   traversed.
 * @param {Visited} node
 *   Found node.
 * @param {Array<VisitedParents>} ancestors
 *   Ancestors of `node`.
 * @returns {VisitorResult}
 *   What to do next.
 *
 *   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
 *   An `Action` is treated as a tuple of `[Action]`.
 *
 *   Passing a tuple back only makes sense if the `Action` is `SKIP`.
 *   When the `Action` is `EXIT`, that action can be returned.
 *   When the `Action` is `CONTINUE`, `Index` can be returned.
 * @template {UnistNode} [Visited=UnistNode]
 *   Visited node type.
 * @template {UnistParent} [VisitedParents=UnistParent]
 *   Ancestor type.
 */

/**
 * @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
 *   Build a typed `Visitor` function from a tree and a test.
 *
 *   It will infer which values are passed as `node` and which as `parents`.
 * @template {UnistNode} [Tree=UnistNode]
 *   Tree type.
 * @template {Test} [Check=Test]
 *   Test type.
 */




/** @type {Readonly<ActionTuple>} */
const empty = []

/**
 * Continue traversing as normal.
 */
const CONTINUE = true

/**
 * Stop traversing immediately.
 */
const EXIT = false

/**
 * Do not traverse this node’s children.
 */
const SKIP = 'skip'

/**
 * Visit nodes, with ancestral information.
 *
 * This algorithm performs *depth-first* *tree traversal* in *preorder*
 * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
 *
 * You can choose for which nodes `visitor` is called by passing a `test`.
 * For complex tests, you should test yourself in `visitor`, as it will be
 * faster and will have improved type information.
 *
 * Walking the tree is an intensive task.
 * Make use of the return values of the visitor when possible.
 * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
 * to check if a node matches, and then perform different operations.
 *
 * You can change the tree.
 * See `Visitor` for more info.
 *
 * @overload
 * @param {Tree} tree
 * @param {Check} check
 * @param {BuildVisitor<Tree, Check>} visitor
 * @param {boolean | null | undefined} [reverse]
 * @returns {undefined}
 *
 * @overload
 * @param {Tree} tree
 * @param {BuildVisitor<Tree>} visitor
 * @param {boolean | null | undefined} [reverse]
 * @returns {undefined}
 *
 * @param {UnistNode} tree
 *   Tree to traverse.
 * @param {Visitor | Test} test
 *   `unist-util-is`-compatible test
 * @param {Visitor | boolean | null | undefined} [visitor]
 *   Handle each node.
 * @param {boolean | null | undefined} [reverse]
 *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
 * @returns {undefined}
 *   Nothing.
 *
 * @template {UnistNode} Tree
 *   Node type.
 * @template {Test} Check
 *   `unist-util-is`-compatible test.
 */
function visitParents(tree, test, visitor, reverse) {
  /** @type {Test} */
  let check

  if (typeof test === 'function' && typeof visitor !== 'function') {
    reverse = visitor
    // @ts-expect-error no visitor given, so `visitor` is test.
    visitor = test
  } else {
    // @ts-expect-error visitor given, so `test` isn’t a visitor.
    check = test
  }

  const is = (0,unist_util_is__WEBPACK_IMPORTED_MODULE_0__.convert)(check)
  const step = reverse ? -1 : 1

  factory(tree, undefined, [])()

  /**
   * @param {UnistNode} node
   * @param {number | undefined} index
   * @param {Array<UnistParent>} parents
   */
  function factory(node, index, parents) {
    const value = /** @type {Record<string, unknown>} */ (
      node && typeof node === 'object' ? node : {}
    )

    if (typeof value.type === 'string') {
      const name =
        // `hast`
        typeof value.tagName === 'string'
          ? value.tagName
          : // `xast`
          typeof value.name === 'string'
          ? value.name
          : undefined

      Object.defineProperty(visit, 'name', {
        value:
          'node (' + (0,unist_util_visit_parents_do_not_use_color__WEBPACK_IMPORTED_MODULE_1__.color)(node.type + (name ? '<' + name + '>' : '')) + ')'
      })
    }

    return visit

    function visit() {
      /** @type {Readonly<ActionTuple>} */
      let result = empty
      /** @type {Readonly<ActionTuple>} */
      let subresult
      /** @type {number} */
      let offset
      /** @type {Array<UnistParent>} */
      let grandparents

      if (!test || is(node, index, parents[parents.length - 1] || undefined)) {
        // @ts-expect-error: `visitor` is now a visitor.
        result = toResult(visitor(node, parents))

        if (result[0] === EXIT) {
          return result
        }
      }

      if ('children' in node && node.children) {
        const nodeAsParent = /** @type {UnistParent} */ (node)

        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step
          grandparents = parents.concat(nodeAsParent)

          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset]

            subresult = factory(child, offset, grandparents)()

            if (subresult[0] === EXIT) {
              return subresult
            }

            offset =
              typeof subresult[1] === 'number' ? subresult[1] : offset + step
          }
        }
      }

      return result
    }
  }
}

/**
 * Turn a return value into a clean result.
 *
 * @param {VisitorResult} value
 *   Valid return values from visitors.
 * @returns {Readonly<ActionTuple>}
 *   Clean result.
 */
function toResult(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'number') {
    return [CONTINUE, value]
  }

  return value === null || value === undefined ? empty : [value]
}


/***/ }),

/***/ "./node_modules/unist-util-visit/lib/index.js":
/*!****************************************************!*\
  !*** ./node_modules/unist-util-visit/lib/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONTINUE: () => (/* reexport safe */ unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_0__.CONTINUE),
/* harmony export */   EXIT: () => (/* reexport safe */ unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_0__.EXIT),
/* harmony export */   SKIP: () => (/* reexport safe */ unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_0__.SKIP),
/* harmony export */   visit: () => (/* binding */ visit)
/* harmony export */ });
/* harmony import */ var unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-visit-parents */ "./node_modules/unist-util-visit-parents/lib/index.js");
/**
 * @typedef {import('unist').Node} UnistNode
 * @typedef {import('unist').Parent} UnistParent
 * @typedef {import('unist-util-visit-parents').VisitorResult} VisitorResult
 */

/**
 * @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
 *   Test from `unist-util-is`.
 *
 *   Note: we have remove and add `undefined`, because otherwise when generating
 *   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
 *   which doesn’t work when publishing on npm.
 */

// To do: use types from `unist-util-visit-parents` when it’s released.

/**
 * @typedef {(
 *   Fn extends (value: any) => value is infer Thing
 *   ? Thing
 *   : Fallback
 * )} Predicate
 *   Get the value of a type guard `Fn`.
 * @template Fn
 *   Value; typically function that is a type guard (such as `(x): x is Y`).
 * @template Fallback
 *   Value to yield if `Fn` is not a type guard.
 */

/**
 * @typedef {(
 *   Check extends null | undefined // No test.
 *   ? Value
 *   : Value extends {type: Check} // String (type) test.
 *   ? Value
 *   : Value extends Check // Partial test.
 *   ? Value
 *   : Check extends Function // Function test.
 *   ? Predicate<Check, Value> extends Value
 *     ? Predicate<Check, Value>
 *     : never
 *   : never // Some other test?
 * )} MatchesOne
 *   Check whether a node matches a primitive check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test, but not arrays.
 */

/**
 * @typedef {(
 *   Check extends Array<any>
 *   ? MatchesOne<Value, Check[keyof Check]>
 *   : MatchesOne<Value, Check>
 * )} Matches
 *   Check whether a node matches a check in the type system.
 * @template Value
 *   Value; typically unist `Node`.
 * @template Check
 *   Value; typically `unist-util-is`-compatible test.
 */

/**
 * @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
 *   Number; capped reasonably.
 */

/**
 * @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
 *   Increment a number in the type system.
 * @template {Uint} [I=0]
 *   Index.
 */

/**
 * @typedef {(
 *   Node extends UnistParent
 *   ? Node extends {children: Array<infer Children>}
 *     ? Child extends Children ? Node : never
 *     : never
 *   : never
 * )} InternalParent
 *   Collect nodes that can be parents of `Child`.
 * @template {UnistNode} Node
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
 *   Collect nodes in `Tree` that can be parents of `Child`.
 * @template {UnistNode} Tree
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 */

/**
 * @typedef {(
 *   Depth extends Max
 *   ? never
 *   :
 *     | InternalParent<Node, Child>
 *     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
 * )} InternalAncestor
 *   Collect nodes in `Tree` that can be ancestors of `Child`.
 * @template {UnistNode} Node
 *   All node types in a tree.
 * @template {UnistNode} Child
 *   Node to search for.
 * @template {Uint} [Max=10]
 *   Max; searches up to this depth.
 * @template {Uint} [Depth=0]
 *   Current depth.
 */

/**
 * @typedef {(
 *   Tree extends UnistParent
 *     ? Depth extends Max
 *       ? Tree
 *       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
 *     : Tree
 * )} InclusiveDescendant
 *   Collect all (inclusive) descendants of `Tree`.
 *
 *   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
 *   > recurse without actually running into an infinite loop, which the
 *   > previous version did.
 *   >
 *   > Practically, a max of `2` is typically enough assuming a `Root` is
 *   > passed, but it doesn’t improve performance.
 *   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
 *   > Using up to `10` doesn’t hurt or help either.
 * @template {UnistNode} Tree
 *   Tree type.
 * @template {Uint} [Max=10]
 *   Max; searches up to this depth.
 * @template {Uint} [Depth=0]
 *   Current depth.
 */

/**
 * @callback Visitor
 *   Handle a node (matching `test`, if given).
 *
 *   Visitors are free to transform `node`.
 *   They can also transform `parent`.
 *
 *   Replacing `node` itself, if `SKIP` is not returned, still causes its
 *   descendants to be walked (which is a bug).
 *
 *   When adding or removing previous siblings of `node` (or next siblings, in
 *   case of reverse), the `Visitor` should return a new `Index` to specify the
 *   sibling to traverse after `node` is traversed.
 *   Adding or removing next siblings of `node` (or previous siblings, in case
 *   of reverse) is handled as expected without needing to return a new `Index`.
 *
 *   Removing the children property of `parent` still results in them being
 *   traversed.
 * @param {Visited} node
 *   Found node.
 * @param {Visited extends UnistNode ? number | undefined : never} index
 *   Index of `node` in `parent`.
 * @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
 *   Parent of `node`.
 * @returns {VisitorResult}
 *   What to do next.
 *
 *   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
 *   An `Action` is treated as a tuple of `[Action]`.
 *
 *   Passing a tuple back only makes sense if the `Action` is `SKIP`.
 *   When the `Action` is `EXIT`, that action can be returned.
 *   When the `Action` is `CONTINUE`, `Index` can be returned.
 * @template {UnistNode} [Visited=UnistNode]
 *   Visited node type.
 * @template {UnistParent} [Ancestor=UnistParent]
 *   Ancestor type.
 */

/**
 * @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
 *   Build a typed `Visitor` function from a node and all possible parents.
 *
 *   It will infer which values are passed as `node` and which as `parent`.
 * @template {UnistNode} Visited
 *   Node type.
 * @template {UnistParent} Ancestor
 *   Parent type.
 */

/**
 * @typedef {(
 *   BuildVisitorFromMatch<
 *     Matches<Descendant, Check>,
 *     Extract<Descendant, UnistParent>
 *   >
 * )} BuildVisitorFromDescendants
 *   Build a typed `Visitor` function from a list of descendants and a test.
 *
 *   It will infer which values are passed as `node` and which as `parent`.
 * @template {UnistNode} Descendant
 *   Node type.
 * @template {Test} Check
 *   Test type.
 */

/**
 * @typedef {(
 *   BuildVisitorFromDescendants<
 *     InclusiveDescendant<Tree>,
 *     Check
 *   >
 * )} BuildVisitor
 *   Build a typed `Visitor` function from a tree and a test.
 *
 *   It will infer which values are passed as `node` and which as `parent`.
 * @template {UnistNode} [Tree=UnistNode]
 *   Node type.
 * @template {Test} [Check=Test]
 *   Test type.
 */





/**
 * Visit nodes.
 *
 * This algorithm performs *depth-first* *tree traversal* in *preorder*
 * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
 *
 * You can choose for which nodes `visitor` is called by passing a `test`.
 * For complex tests, you should test yourself in `visitor`, as it will be
 * faster and will have improved type information.
 *
 * Walking the tree is an intensive task.
 * Make use of the return values of the visitor when possible.
 * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
 * to check if a node matches, and then perform different operations.
 *
 * You can change the tree.
 * See `Visitor` for more info.
 *
 * @overload
 * @param {Tree} tree
 * @param {Check} check
 * @param {BuildVisitor<Tree, Check>} visitor
 * @param {boolean | null | undefined} [reverse]
 * @returns {undefined}
 *
 * @overload
 * @param {Tree} tree
 * @param {BuildVisitor<Tree>} visitor
 * @param {boolean | null | undefined} [reverse]
 * @returns {undefined}
 *
 * @param {UnistNode} tree
 *   Tree to traverse.
 * @param {Visitor | Test} testOrVisitor
 *   `unist-util-is`-compatible test (optional, omit to pass a visitor).
 * @param {Visitor | boolean | null | undefined} [visitorOrReverse]
 *   Handle each node (when test is omitted, pass `reverse`).
 * @param {boolean | null | undefined} [maybeReverse=false]
 *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
 * @returns {undefined}
 *   Nothing.
 *
 * @template {UnistNode} Tree
 *   Node type.
 * @template {Test} Check
 *   `unist-util-is`-compatible test.
 */
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  /** @type {boolean | null | undefined} */
  let reverse
  /** @type {Test} */
  let test
  /** @type {Visitor} */
  let visitor

  if (
    typeof testOrVisitor === 'function' &&
    typeof visitorOrReverse !== 'function'
  ) {
    test = undefined
    visitor = testOrVisitor
    reverse = visitorOrReverse
  } else {
    // @ts-expect-error: assume the overload with test was given.
    test = testOrVisitor
    // @ts-expect-error: assume the overload with test was given.
    visitor = visitorOrReverse
    reverse = maybeReverse
  }

  (0,unist_util_visit_parents__WEBPACK_IMPORTED_MODULE_0__.visitParents)(tree, test, overload, reverse)

  /**
   * @param {UnistNode} node
   * @param {Array<UnistParent>} parents
   */
  function overload(node, parents) {
    const parent = parents[parents.length - 1]
    const index = parent ? parent.children.indexOf(node) : undefined
    return visitor(node, index, parent)
  }
}


/***/ }),

/***/ "./node_modules/vfile-message/lib/index.js":
/*!*************************************************!*\
  !*** ./node_modules/vfile-message/lib/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VFileMessage: () => (/* binding */ VFileMessage)
/* harmony export */ });
/* harmony import */ var unist_util_stringify_position__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! unist-util-stringify-position */ "./node_modules/vfile-message/node_modules/unist-util-stringify-position/lib/index.js");
/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Point} Point
 * @typedef {import('unist').Position} Position
 */

/**
 * @typedef {object & {type: string, position?: Position | undefined}} NodeLike
 *
 * @typedef Options
 *   Configuration.
 * @property {Array<Node> | null | undefined} [ancestors]
 *   Stack of (inclusive) ancestor nodes surrounding the message (optional).
 * @property {Error | null | undefined} [cause]
 *   Original error cause of the message (optional).
 * @property {Point | Position | null | undefined} [place]
 *   Place of message (optional).
 * @property {string | null | undefined} [ruleId]
 *   Category of message (optional, example: `'my-rule'`).
 * @property {string | null | undefined} [source]
 *   Namespace of who sent the message (optional, example: `'my-package'`).
 */



/**
 * Message.
 */
class VFileMessage extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(causeOrReason, optionsOrParentOrPlace, origin) {
    super()

    if (typeof optionsOrParentOrPlace === 'string') {
      origin = optionsOrParentOrPlace
      optionsOrParentOrPlace = undefined
    }

    /** @type {string} */
    let reason = ''
    /** @type {Options} */
    let options = {}
    let legacyCause = false

    if (optionsOrParentOrPlace) {
      // Point.
      if (
        'line' in optionsOrParentOrPlace &&
        'column' in optionsOrParentOrPlace
      ) {
        options = {place: optionsOrParentOrPlace}
      }
      // Position.
      else if (
        'start' in optionsOrParentOrPlace &&
        'end' in optionsOrParentOrPlace
      ) {
        options = {place: optionsOrParentOrPlace}
      }
      // Node.
      else if ('type' in optionsOrParentOrPlace) {
        options = {
          ancestors: [optionsOrParentOrPlace],
          place: optionsOrParentOrPlace.position
        }
      }
      // Options.
      else {
        options = {...optionsOrParentOrPlace}
      }
    }

    if (typeof causeOrReason === 'string') {
      reason = causeOrReason
    }
    // Error.
    else if (!options.cause && causeOrReason) {
      legacyCause = true
      reason = causeOrReason.message
      options.cause = causeOrReason
    }

    if (!options.ruleId && !options.source && typeof origin === 'string') {
      const index = origin.indexOf(':')

      if (index === -1) {
        options.ruleId = origin
      } else {
        options.source = origin.slice(0, index)
        options.ruleId = origin.slice(index + 1)
      }
    }

    if (!options.place && options.ancestors && options.ancestors) {
      const parent = options.ancestors[options.ancestors.length - 1]

      if (parent) {
        options.place = parent.position
      }
    }

    const start =
      options.place && 'start' in options.place
        ? options.place.start
        : options.place

    /* eslint-disable no-unused-expressions */
    /**
     * Stack of ancestor nodes surrounding the message.
     *
     * @type {Array<Node> | undefined}
     */
    this.ancestors = options.ancestors || undefined

    /**
     * Original error cause of the message.
     *
     * @type {Error | undefined}
     */
    this.cause = options.cause || undefined

    /**
     * Starting column of message.
     *
     * @type {number | undefined}
     */
    this.column = start ? start.column : undefined

    /**
     * State of problem.
     *
     * * `true` — error, file not usable
     * * `false` — warning, change may be needed
     * * `undefined` — change likely not needed
     *
     * @type {boolean | null | undefined}
     */
    this.fatal = undefined

    /**
     * Path of a file (used throughout the `VFile` ecosystem).
     *
     * @type {string | undefined}
     */
    this.file

    // Field from `Error`.
    /**
     * Reason for message.
     *
     * @type {string}
     */
    this.message = reason

    /**
     * Starting line of error.
     *
     * @type {number | undefined}
     */
    this.line = start ? start.line : undefined

    // Field from `Error`.
    /**
     * Serialized positional info of message.
     *
     * On normal errors, this would be something like `ParseError`, buit in
     * `VFile` messages we use this space to show where an error happened.
     */
    this.name = (0,unist_util_stringify_position__WEBPACK_IMPORTED_MODULE_0__.stringifyPosition)(options.place) || '1:1'

    /**
     * Place of message.
     *
     * @type {Point | Position | undefined}
     */
    this.place = options.place || undefined

    /**
     * Reason for message, should use markdown.
     *
     * @type {string}
     */
    this.reason = this.message

    /**
     * Category of message (example: `'my-rule'`).
     *
     * @type {string | undefined}
     */
    this.ruleId = options.ruleId || undefined

    /**
     * Namespace of message (example: `'my-package'`).
     *
     * @type {string | undefined}
     */
    this.source = options.source || undefined

    // Field from `Error`.
    /**
     * Stack of message.
     *
     * This is used by normal errors to show where something happened in
     * programming code, irrelevant for `VFile` messages,
     *
     * @type {string}
     */
    this.stack =
      legacyCause && options.cause && typeof options.cause.stack === 'string'
        ? options.cause.stack
        : ''

    // The following fields are “well known”.
    // Not standard.
    // Feel free to add other non-standard fields to your messages.

    /**
     * Specify the source value that’s being reported, which is deemed
     * incorrect.
     *
     * @type {string | undefined}
     */
    this.actual

    /**
     * Suggest acceptable values that can be used instead of `actual`.
     *
     * @type {Array<string> | undefined}
     */
    this.expected

    /**
     * Long form description of the message (you should use markdown).
     *
     * @type {string | undefined}
     */
    this.note

    /**
     * Link to docs for the message.
     *
     * > 👉 **Note**: this must be an absolute URL that can be passed as `x`
     * > to `new URL(x)`.
     *
     * @type {string | undefined}
     */
    this.url
    /* eslint-enable no-unused-expressions */
  }
}

VFileMessage.prototype.file = ''
VFileMessage.prototype.name = ''
VFileMessage.prototype.reason = ''
VFileMessage.prototype.message = ''
VFileMessage.prototype.stack = ''
VFileMessage.prototype.column = undefined
VFileMessage.prototype.line = undefined
VFileMessage.prototype.ancestors = undefined
VFileMessage.prototype.cause = undefined
VFileMessage.prototype.fatal = undefined
VFileMessage.prototype.place = undefined
VFileMessage.prototype.ruleId = undefined
VFileMessage.prototype.source = undefined


/***/ }),

/***/ "./node_modules/vfile-message/node_modules/unist-util-stringify-position/lib/index.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/vfile-message/node_modules/unist-util-stringify-position/lib/index.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   stringifyPosition: () => (/* binding */ stringifyPosition)
/* harmony export */ });
/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Point} Point
 * @typedef {import('unist').Position} Position
 */

/**
 * @typedef NodeLike
 * @property {string} type
 * @property {PositionLike | null | undefined} [position]
 *
 * @typedef PointLike
 * @property {number | null | undefined} [line]
 * @property {number | null | undefined} [column]
 * @property {number | null | undefined} [offset]
 *
 * @typedef PositionLike
 * @property {PointLike | null | undefined} [start]
 * @property {PointLike | null | undefined} [end]
 */

/**
 * Serialize the positional info of a point, position (start and end points),
 * or node.
 *
 * @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
 *   Node, position, or point.
 * @returns {string}
 *   Pretty printed positional info of a node (`string`).
 *
 *   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
 *   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
 *   column, `s` for `start`, and `e` for end.
 *   An empty string (`''`) is returned if the given value is neither `node`,
 *   `position`, nor `point`.
 */
function stringifyPosition(value) {
  // Nothing.
  if (!value || typeof value !== 'object') {
    return ''
  }

  // Node.
  if ('position' in value || 'type' in value) {
    return position(value.position)
  }

  // Position.
  if ('start' in value || 'end' in value) {
    return position(value)
  }

  // Point.
  if ('line' in value || 'column' in value) {
    return point(value)
  }

  // ?
  return ''
}

/**
 * @param {Point | PointLike | null | undefined} point
 * @returns {string}
 */
function point(point) {
  return index(point && point.line) + ':' + index(point && point.column)
}

/**
 * @param {Position | PositionLike | null | undefined} pos
 * @returns {string}
 */
function position(pos) {
  return point(pos && pos.start) + '-' + point(pos && pos.end)
}

/**
 * @param {number | null | undefined} value
 * @returns {number}
 */
function index(value) {
  return value && typeof value === 'number' ? value : 1
}


/***/ }),

/***/ "./node_modules/vfile/lib/index.js":
/*!*****************************************!*\
  !*** ./node_modules/vfile/lib/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VFile: () => (/* binding */ VFile)
/* harmony export */ });
/* harmony import */ var vfile_message__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vfile-message */ "./node_modules/vfile-message/lib/index.js");
/* harmony import */ var vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vfile/do-not-use-conditional-minpath */ "./node_modules/vfile/lib/minpath.browser.js");
/* harmony import */ var vfile_do_not_use_conditional_minproc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vfile/do-not-use-conditional-minproc */ "./node_modules/vfile/lib/minproc.browser.js");
/* harmony import */ var vfile_do_not_use_conditional_minurl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vfile/do-not-use-conditional-minurl */ "./node_modules/vfile/lib/minurl.shared.js");
/* harmony import */ var vfile_do_not_use_conditional_minurl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vfile/do-not-use-conditional-minurl */ "./node_modules/vfile/lib/minurl.browser.js");
/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Point} Point
 * @typedef {import('unist').Position} Position
 * @typedef {import('vfile-message').Options} MessageOptions
 * @typedef {import('../index.js').Data} Data
 * @typedef {import('../index.js').Value} Value
 */

/**
 * @typedef {object & {type: string, position?: Position | undefined}} NodeLike
 *
 * @typedef {Options | URL | VFile | Value} Compatible
 *   Things that can be passed to the constructor.
 *
 * @typedef VFileCoreOptions
 *   Set multiple values.
 * @property {string | null | undefined} [basename]
 *   Set `basename` (name).
 * @property {string | null | undefined} [cwd]
 *   Set `cwd` (working directory).
 * @property {Data | null | undefined} [data]
 *   Set `data` (associated info).
 * @property {string | null | undefined} [dirname]
 *   Set `dirname` (path w/o basename).
 * @property {string | null | undefined} [extname]
 *   Set `extname` (extension with dot).
 * @property {Array<string> | null | undefined} [history]
 *   Set `history` (paths the file moved between).
 * @property {URL | string | null | undefined} [path]
 *   Set `path` (current path).
 * @property {string | null | undefined} [stem]
 *   Set `stem` (name without extension).
 * @property {Value | null | undefined} [value]
 *   Set `value` (the contents of the file).
 *
 * @typedef Map
 *   Raw source map.
 *
 *   See:
 *   <https://github.com/mozilla/source-map/blob/60adcb0/source-map.d.ts#L15-L23>.
 * @property {number} version
 *   Which version of the source map spec this map is following.
 * @property {Array<string>} sources
 *   An array of URLs to the original source files.
 * @property {Array<string>} names
 *   An array of identifiers which can be referenced by individual mappings.
 * @property {string | undefined} [sourceRoot]
 *   The URL root from which all sources are relative.
 * @property {Array<string> | undefined} [sourcesContent]
 *   An array of contents of the original source files.
 * @property {string} mappings
 *   A string of base64 VLQs which contain the actual mappings.
 * @property {string} file
 *   The generated file this source map is associated with.
 *
 * @typedef {Record<string, unknown> & VFileCoreOptions} Options
 *   Configuration.
 *
 *   A bunch of keys that will be shallow copied over to the new file.
 *
 * @typedef {Record<string, unknown>} ReporterSettings
 *   Configuration for reporters.
 */

/**
 * @template [Settings=ReporterSettings]
 *   Options type.
 * @callback Reporter
 *   Type for a reporter.
 * @param {Array<VFile>} files
 *   Files to report.
 * @param {Settings} options
 *   Configuration.
 * @returns {string}
 *   Report.
 */






/**
 * Order of setting (least specific to most), we need this because otherwise
 * `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
 * stem can be set.
 */
const order = /** @type {const} */ ([
  'history',
  'path',
  'basename',
  'stem',
  'extname',
  'dirname'
])

class VFile {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(value) {
    /** @type {Options | VFile} */
    let options

    if (!value) {
      options = {}
    } else if ((0,vfile_do_not_use_conditional_minurl__WEBPACK_IMPORTED_MODULE_0__.isUrl)(value)) {
      options = {path: value}
    } else if (typeof value === 'string' || isUint8Array(value)) {
      options = {value}
    } else {
      options = value
    }

    /* eslint-disable no-unused-expressions */

    /**
     * Base of `path` (default: `process.cwd()` or `'/'` in browsers).
     *
     * @type {string}
     */
    this.cwd = vfile_do_not_use_conditional_minproc__WEBPACK_IMPORTED_MODULE_1__.proc.cwd()

    /**
     * Place to store custom info (default: `{}`).
     *
     * It’s OK to store custom data directly on the file but moving it to
     * `data` is recommended.
     *
     * @type {Data}
     */
    this.data = {}

    /**
     * List of file paths the file moved between.
     *
     * The first is the original path and the last is the current path.
     *
     * @type {Array<string>}
     */
    this.history = []

    /**
     * List of messages associated with the file.
     *
     * @type {Array<VFileMessage>}
     */
    this.messages = []

    /**
     * Raw value.
     *
     * @type {Value}
     */
    this.value

    // The below are non-standard, they are “well-known”.
    // As in, used in several tools.
    /**
     * Source map.
     *
     * This type is equivalent to the `RawSourceMap` type from the `source-map`
     * module.
     *
     * @type {Map | null | undefined}
     */
    this.map

    /**
     * Custom, non-string, compiled, representation.
     *
     * This is used by unified to store non-string results.
     * One example is when turning markdown into React nodes.
     *
     * @type {unknown}
     */
    this.result

    /**
     * Whether a file was saved to disk.
     *
     * This is used by vfile reporters.
     *
     * @type {boolean}
     */
    this.stored
    /* eslint-enable no-unused-expressions */

    // Set path related properties in the correct order.
    let index = -1

    while (++index < order.length) {
      const prop = order[index]

      // Note: we specifically use `in` instead of `hasOwnProperty` to accept
      // `vfile`s too.
      if (
        prop in options &&
        options[prop] !== undefined &&
        options[prop] !== null
      ) {
        // @ts-expect-error: TS doesn’t understand basic reality.
        this[prop] = prop === 'history' ? [...options[prop]] : options[prop]
      }
    }

    /** @type {string} */
    let prop

    // Set non-path related properties.
    for (prop in options) {
      // @ts-expect-error: fine to set other things.
      if (!order.includes(prop)) {
        // @ts-expect-error: fine to set other things.
        this[prop] = options[prop]
      }
    }
  }

  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path === 'string' ? vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.basename(this.path) : undefined
  }

  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(basename) {
    assertNonEmpty(basename, 'basename')
    assertPart(basename, 'basename')
    this.path = vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.join(this.dirname || '', basename)
  }

  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path === 'string' ? vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.dirname(this.path) : undefined
  }

  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(dirname) {
    assertPath(this.basename, 'dirname')
    this.path = vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.join(dirname || '', this.basename)
  }

  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path === 'string' ? vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.extname(this.path) : undefined
  }

  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(extname) {
    assertPart(extname, 'extname')
    assertPath(this.dirname, 'extname')

    if (extname) {
      if (extname.codePointAt(0) !== 46 /* `.` */) {
        throw new Error('`extname` must start with `.`')
      }

      if (extname.includes('.', 1)) {
        throw new Error('`extname` cannot contain multiple dots')
      }
    }

    this.path = vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.join(this.dirname, this.stem + (extname || ''))
  }

  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1]
  }

  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(path) {
    if ((0,vfile_do_not_use_conditional_minurl__WEBPACK_IMPORTED_MODULE_0__.isUrl)(path)) {
      path = (0,vfile_do_not_use_conditional_minurl__WEBPACK_IMPORTED_MODULE_3__.urlToPath)(path)
    }

    assertNonEmpty(path, 'path')

    if (this.path !== path) {
      this.history.push(path)
    }
  }

  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path === 'string'
      ? vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.basename(this.path, this.extname)
      : undefined
  }

  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(stem) {
    assertNonEmpty(stem, 'stem')
    assertPart(stem, 'stem')
    this.path = vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.join(this.dirname || '', stem + (this.extname || ''))
  }

  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(causeOrReason, optionsOrParentOrPlace, origin) {
    // @ts-expect-error: the overloads are fine.
    const message = this.message(causeOrReason, optionsOrParentOrPlace, origin)

    message.fatal = true

    throw message
  }

  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(causeOrReason, optionsOrParentOrPlace, origin) {
    // @ts-expect-error: the overloads are fine.
    const message = this.message(causeOrReason, optionsOrParentOrPlace, origin)

    message.fatal = undefined

    return message
  }

  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = new vfile_message__WEBPACK_IMPORTED_MODULE_4__.VFileMessage(
      // @ts-expect-error: the overloads are fine.
      causeOrReason,
      optionsOrParentOrPlace,
      origin
    )

    if (this.path) {
      message.name = this.path + ':' + message.name
      message.file = this.path
    }

    message.fatal = false

    this.messages.push(message)

    return message
  }

  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(encoding) {
    if (this.value === undefined) {
      return ''
    }

    if (typeof this.value === 'string') {
      return this.value
    }

    const decoder = new TextDecoder(encoding || undefined)
    return decoder.decode(this.value)
  }
}

/**
 * Assert that `part` is not a path (as in, does not contain `path.sep`).
 *
 * @param {string | null | undefined} part
 *   File path part.
 * @param {string} name
 *   Part name.
 * @returns {undefined}
 *   Nothing.
 */
function assertPart(part, name) {
  if (part && part.includes(vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.sep)) {
    throw new Error(
      '`' + name + '` cannot be a path: did not expect `' + vfile_do_not_use_conditional_minpath__WEBPACK_IMPORTED_MODULE_2__.path.sep + '`'
    )
  }
}

/**
 * Assert that `part` is not empty.
 *
 * @param {string | undefined} part
 *   Thing.
 * @param {string} name
 *   Part name.
 * @returns {asserts part is string}
 *   Nothing.
 */
function assertNonEmpty(part, name) {
  if (!part) {
    throw new Error('`' + name + '` cannot be empty')
  }
}

/**
 * Assert `path` exists.
 *
 * @param {string | undefined} path
 *   Path.
 * @param {string} name
 *   Dependency name.
 * @returns {asserts path is string}
 *   Nothing.
 */
function assertPath(path, name) {
  if (!path) {
    throw new Error('Setting `' + name + '` requires `path` to be set too')
  }
}

/**
 * Assert `value` is an `Uint8Array`.
 *
 * @param {unknown} value
 *   thing.
 * @returns {value is Uint8Array}
 *   Whether `value` is an `Uint8Array`.
 */
function isUint8Array(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'byteLength' in value &&
      'byteOffset' in value
  )
}


/***/ }),

/***/ "./node_modules/vfile/lib/minpath.browser.js":
/*!***************************************************!*\
  !*** ./node_modules/vfile/lib/minpath.browser.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   path: () => (/* binding */ path)
/* harmony export */ });
// A derivative work based on:
// <https://github.com/browserify/path-browserify>.
// Which is licensed:
//
// MIT License
//
// Copyright (c) 2013 James Halliday
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// A derivative work based on:
//
// Parts of that are extracted from Node’s internal `path` module:
// <https://github.com/nodejs/node/blob/master/lib/path.js>.
// Which is licensed:
//
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

const path = {basename, dirname, extname, join, sep: '/'}

/* eslint-disable max-depth, complexity */

/**
 * Get the basename from a path.
 *
 * @param {string} path
 *   File path.
 * @param {string | null | undefined} [ext]
 *   Extension to strip.
 * @returns {string}
 *   Stem or basename.
 */
function basename(path, ext) {
  if (ext !== undefined && typeof ext !== 'string') {
    throw new TypeError('"ext" argument must be a string')
  }

  assertPath(path)
  let start = 0
  let end = -1
  let index = path.length
  /** @type {boolean | undefined} */
  let seenNonSlash

  if (ext === undefined || ext.length === 0 || ext.length > path.length) {
    while (index--) {
      if (path.codePointAt(index) === 47 /* `/` */) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now.
        if (seenNonSlash) {
          start = index + 1
          break
        }
      } else if (end < 0) {
        // We saw the first non-path separator, mark this as the end of our
        // path component.
        seenNonSlash = true
        end = index + 1
      }
    }

    return end < 0 ? '' : path.slice(start, end)
  }

  if (ext === path) {
    return ''
  }

  let firstNonSlashEnd = -1
  let extIndex = ext.length - 1

  while (index--) {
    if (path.codePointAt(index) === 47 /* `/` */) {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now.
      if (seenNonSlash) {
        start = index + 1
        break
      }
    } else {
      if (firstNonSlashEnd < 0) {
        // We saw the first non-path separator, remember this index in case
        // we need it if the extension ends up not matching.
        seenNonSlash = true
        firstNonSlashEnd = index + 1
      }

      if (extIndex > -1) {
        // Try to match the explicit extension.
        if (path.codePointAt(index) === ext.codePointAt(extIndex--)) {
          if (extIndex < 0) {
            // We matched the extension, so mark this as the end of our path
            // component
            end = index
          }
        } else {
          // Extension does not match, so our result is the entire path
          // component
          extIndex = -1
          end = firstNonSlashEnd
        }
      }
    }
  }

  if (start === end) {
    end = firstNonSlashEnd
  } else if (end < 0) {
    end = path.length
  }

  return path.slice(start, end)
}

/**
 * Get the dirname from a path.
 *
 * @param {string} path
 *   File path.
 * @returns {string}
 *   File path.
 */
function dirname(path) {
  assertPath(path)

  if (path.length === 0) {
    return '.'
  }

  let end = -1
  let index = path.length
  /** @type {boolean | undefined} */
  let unmatchedSlash

  // Prefix `--` is important to not run on `0`.
  while (--index) {
    if (path.codePointAt(index) === 47 /* `/` */) {
      if (unmatchedSlash) {
        end = index
        break
      }
    } else if (!unmatchedSlash) {
      // We saw the first non-path separator
      unmatchedSlash = true
    }
  }

  return end < 0
    ? path.codePointAt(0) === 47 /* `/` */
      ? '/'
      : '.'
    : end === 1 && path.codePointAt(0) === 47 /* `/` */
    ? '//'
    : path.slice(0, end)
}

/**
 * Get an extname from a path.
 *
 * @param {string} path
 *   File path.
 * @returns {string}
 *   Extname.
 */
function extname(path) {
  assertPath(path)

  let index = path.length

  let end = -1
  let startPart = 0
  let startDot = -1
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find.
  let preDotState = 0
  /** @type {boolean | undefined} */
  let unmatchedSlash

  while (index--) {
    const code = path.codePointAt(index)

    if (code === 47 /* `/` */) {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now.
      if (unmatchedSlash) {
        startPart = index + 1
        break
      }

      continue
    }

    if (end < 0) {
      // We saw the first non-path separator, mark this as the end of our
      // extension.
      unmatchedSlash = true
      end = index + 1
    }

    if (code === 46 /* `.` */) {
      // If this is our first dot, mark it as the start of our extension.
      if (startDot < 0) {
        startDot = index
      } else if (preDotState !== 1) {
        preDotState = 1
      }
    } else if (startDot > -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension.
      preDotState = -1
    }
  }

  if (
    startDot < 0 ||
    end < 0 ||
    // We saw a non-dot character immediately before the dot.
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly `..`.
    (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
  ) {
    return ''
  }

  return path.slice(startDot, end)
}

/**
 * Join segments from a path.
 *
 * @param {Array<string>} segments
 *   Path segments.
 * @returns {string}
 *   File path.
 */
function join(...segments) {
  let index = -1
  /** @type {string | undefined} */
  let joined

  while (++index < segments.length) {
    assertPath(segments[index])

    if (segments[index]) {
      joined =
        joined === undefined ? segments[index] : joined + '/' + segments[index]
    }
  }

  return joined === undefined ? '.' : normalize(joined)
}

/**
 * Normalize a basic file path.
 *
 * @param {string} path
 *   File path.
 * @returns {string}
 *   File path.
 */
// Note: `normalize` is not exposed as `path.normalize`, so some code is
// manually removed from it.
function normalize(path) {
  assertPath(path)

  const absolute = path.codePointAt(0) === 47 /* `/` */

  // Normalize the path according to POSIX rules.
  let value = normalizeString(path, !absolute)

  if (value.length === 0 && !absolute) {
    value = '.'
  }

  if (value.length > 0 && path.codePointAt(path.length - 1) === 47 /* / */) {
    value += '/'
  }

  return absolute ? '/' + value : value
}

/**
 * Resolve `.` and `..` elements in a path with directory names.
 *
 * @param {string} path
 *   File path.
 * @param {boolean} allowAboveRoot
 *   Whether `..` can move above root.
 * @returns {string}
 *   File path.
 */
function normalizeString(path, allowAboveRoot) {
  let result = ''
  let lastSegmentLength = 0
  let lastSlash = -1
  let dots = 0
  let index = -1
  /** @type {number | undefined} */
  let code
  /** @type {number} */
  let lastSlashIndex

  while (++index <= path.length) {
    if (index < path.length) {
      code = path.codePointAt(index)
    } else if (code === 47 /* `/` */) {
      break
    } else {
      code = 47 /* `/` */
    }

    if (code === 47 /* `/` */) {
      if (lastSlash === index - 1 || dots === 1) {
        // Empty.
      } else if (lastSlash !== index - 1 && dots === 2) {
        if (
          result.length < 2 ||
          lastSegmentLength !== 2 ||
          result.codePointAt(result.length - 1) !== 46 /* `.` */ ||
          result.codePointAt(result.length - 2) !== 46 /* `.` */
        ) {
          if (result.length > 2) {
            lastSlashIndex = result.lastIndexOf('/')

            if (lastSlashIndex !== result.length - 1) {
              if (lastSlashIndex < 0) {
                result = ''
                lastSegmentLength = 0
              } else {
                result = result.slice(0, lastSlashIndex)
                lastSegmentLength = result.length - 1 - result.lastIndexOf('/')
              }

              lastSlash = index
              dots = 0
              continue
            }
          } else if (result.length > 0) {
            result = ''
            lastSegmentLength = 0
            lastSlash = index
            dots = 0
            continue
          }
        }

        if (allowAboveRoot) {
          result = result.length > 0 ? result + '/..' : '..'
          lastSegmentLength = 2
        }
      } else {
        if (result.length > 0) {
          result += '/' + path.slice(lastSlash + 1, index)
        } else {
          result = path.slice(lastSlash + 1, index)
        }

        lastSegmentLength = index - lastSlash - 1
      }

      lastSlash = index
      dots = 0
    } else if (code === 46 /* `.` */ && dots > -1) {
      dots++
    } else {
      dots = -1
    }
  }

  return result
}

/**
 * Make sure `path` is a string.
 *
 * @param {string} path
 *   File path.
 * @returns {asserts path is string}
 *   Nothing.
 */
function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError(
      'Path must be a string. Received ' + JSON.stringify(path)
    )
  }
}

/* eslint-enable max-depth, complexity */


/***/ }),

/***/ "./node_modules/vfile/lib/minproc.browser.js":
/*!***************************************************!*\
  !*** ./node_modules/vfile/lib/minproc.browser.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   proc: () => (/* binding */ proc)
/* harmony export */ });
// Somewhat based on:
// <https://github.com/defunctzombie/node-process/blob/master/browser.js>.
// But I don’t think one tiny line of code can be copyrighted. 😅
const proc = {cwd}

function cwd() {
  return '/'
}


/***/ }),

/***/ "./node_modules/vfile/lib/minurl.browser.js":
/*!**************************************************!*\
  !*** ./node_modules/vfile/lib/minurl.browser.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isUrl: () => (/* reexport safe */ _minurl_shared_js__WEBPACK_IMPORTED_MODULE_0__.isUrl),
/* harmony export */   urlToPath: () => (/* binding */ urlToPath)
/* harmony export */ });
/* harmony import */ var _minurl_shared_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./minurl.shared.js */ "./node_modules/vfile/lib/minurl.shared.js");




// See: <https://github.com/nodejs/node/blob/6a3403c/lib/internal/url.js>

/**
 * @param {URL | string} path
 *   File URL.
 * @returns {string}
 *   File URL.
 */
function urlToPath(path) {
  if (typeof path === 'string') {
    path = new URL(path)
  } else if (!(0,_minurl_shared_js__WEBPACK_IMPORTED_MODULE_0__.isUrl)(path)) {
    /** @type {NodeJS.ErrnoException} */
    const error = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' +
        path +
        '`'
    )
    error.code = 'ERR_INVALID_ARG_TYPE'
    throw error
  }

  if (path.protocol !== 'file:') {
    /** @type {NodeJS.ErrnoException} */
    const error = new TypeError('The URL must be of scheme file')
    error.code = 'ERR_INVALID_URL_SCHEME'
    throw error
  }

  return getPathFromURLPosix(path)
}

/**
 * Get a path from a POSIX URL.
 *
 * @param {URL} url
 *   URL.
 * @returns {string}
 *   File path.
 */
function getPathFromURLPosix(url) {
  if (url.hostname !== '') {
    /** @type {NodeJS.ErrnoException} */
    const error = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    )
    error.code = 'ERR_INVALID_FILE_URL_HOST'
    throw error
  }

  const pathname = url.pathname
  let index = -1

  while (++index < pathname.length) {
    if (
      pathname.codePointAt(index) === 37 /* `%` */ &&
      pathname.codePointAt(index + 1) === 50 /* `2` */
    ) {
      const third = pathname.codePointAt(index + 2)
      if (third === 70 /* `F` */ || third === 102 /* `f` */) {
        /** @type {NodeJS.ErrnoException} */
        const error = new TypeError(
          'File URL path must not include encoded / characters'
        )
        error.code = 'ERR_INVALID_FILE_URL_PATH'
        throw error
      }
    }
  }

  return decodeURIComponent(pathname)
}


/***/ }),

/***/ "./node_modules/vfile/lib/minurl.shared.js":
/*!*************************************************!*\
  !*** ./node_modules/vfile/lib/minurl.shared.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isUrl: () => (/* binding */ isUrl)
/* harmony export */ });
/**
 * Checks if a value has the shape of a WHATWG URL object.
 *
 * Using a symbol or instanceof would not be able to recognize URL objects
 * coming from other implementations (e.g. in Electron), so instead we are
 * checking some well known properties for a lack of a better test.
 *
 * We use `href` and `protocol` as they are the only properties that are
 * easy to retrieve and calculate due to the lazy nature of the getters.
 *
 * We check for auth attribute to distinguish legacy url instance with
 * WHATWG URL instance.
 *
 * @param {unknown} fileUrlOrPath
 *   File path or URL.
 * @returns {fileUrlOrPath is URL}
 *   Whether it’s a URL.
 */
// From: <https://github.com/nodejs/node/blob/6a3403c/lib/internal/url.js#L720>
function isUrl(fileUrlOrPath) {
  return Boolean(
    fileUrlOrPath !== null &&
      typeof fileUrlOrPath === 'object' &&
      'href' in fileUrlOrPath &&
      fileUrlOrPath.href &&
      'protocol' in fileUrlOrPath &&
      fileUrlOrPath.protocol &&
      // @ts-expect-error: indexing is fine.
      fileUrlOrPath.auth === undefined
  )
}


/***/ }),

/***/ "./node_modules/web-namespaces/index.js":
/*!**********************************************!*\
  !*** ./node_modules/web-namespaces/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   webNamespaces: () => (/* binding */ webNamespaces)
/* harmony export */ });
/**
 * Map of web namespaces.
 *
 * @type {Record<string, string>}
 */
const webNamespaces = {
  html: 'http://www.w3.org/1999/xhtml',
  mathml: 'http://www.w3.org/1998/Math/MathML',
  svg: 'http://www.w3.org/2000/svg',
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/'
}


/***/ }),

/***/ "./node_modules/zwitch/index.js":
/*!**************************************!*\
  !*** ./node_modules/zwitch/index.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   zwitch: () => (/* binding */ zwitch)
/* harmony export */ });
/**
 * @callback Handler
 *   Handle a value, with a certain ID field set to a certain value.
 *   The ID field is passed to `zwitch`, and it’s value is this function’s
 *   place on the `handlers` record.
 * @param {...any} parameters
 *   Arbitrary parameters passed to the zwitch.
 *   The first will be an object with a certain ID field set to a certain value.
 * @returns {any}
 *   Anything!
 */

/**
 * @callback UnknownHandler
 *   Handle values that do have a certain ID field, but it’s set to a value
 *   that is not listed in the `handlers` record.
 * @param {unknown} value
 *   An object with a certain ID field set to an unknown value.
 * @param {...any} rest
 *   Arbitrary parameters passed to the zwitch.
 * @returns {any}
 *   Anything!
 */

/**
 * @callback InvalidHandler
 *   Handle values that do not have a certain ID field.
 * @param {unknown} value
 *   Any unknown value.
 * @param {...any} rest
 *   Arbitrary parameters passed to the zwitch.
 * @returns {void|null|undefined|never}
 *   This should crash or return nothing.
 */

/**
 * @template {InvalidHandler} [Invalid=InvalidHandler]
 * @template {UnknownHandler} [Unknown=UnknownHandler]
 * @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
 * @typedef Options
 *   Configuration (required).
 * @property {Invalid} [invalid]
 *   Handler to use for invalid values.
 * @property {Unknown} [unknown]
 *   Handler to use for unknown values.
 * @property {Handlers} [handlers]
 *   Handlers to use.
 */

const own = {}.hasOwnProperty

/**
 * Handle values based on a field.
 *
 * @template {InvalidHandler} [Invalid=InvalidHandler]
 * @template {UnknownHandler} [Unknown=UnknownHandler]
 * @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
 * @param {string} key
 *   Field to switch on.
 * @param {Options<Invalid, Unknown, Handlers>} [options]
 *   Configuration (required).
 * @returns {{unknown: Unknown, invalid: Invalid, handlers: Handlers, (...parameters: Parameters<Handlers[keyof Handlers]>): ReturnType<Handlers[keyof Handlers]>, (...parameters: Parameters<Unknown>): ReturnType<Unknown>}}
 */
function zwitch(key, options) {
  const settings = options || {}

  /**
   * Handle one value.
   *
   * Based on the bound `key`, a respective handler will be called.
   * If `value` is not an object, or doesn’t have a `key` property, the special
   * “invalid” handler will be called.
   * If `value` has an unknown `key`, the special “unknown” handler will be
   * called.
   *
   * All arguments, and the context object, are passed through to the handler,
   * and it’s result is returned.
   *
   * @this {unknown}
   *   Any context object.
   * @param {unknown} [value]
   *   Any value.
   * @param {...unknown} parameters
   *   Arbitrary parameters passed to the zwitch.
   * @property {Handler} invalid
   *   Handle for values that do not have a certain ID field.
   * @property {Handler} unknown
   *   Handle values that do have a certain ID field, but it’s set to a value
   *   that is not listed in the `handlers` record.
   * @property {Handlers} handlers
   *   Record of handlers.
   * @returns {unknown}
   *   Anything.
   */
  function one(value, ...parameters) {
    /** @type {Handler|undefined} */
    let fn = one.invalid
    const handlers = one.handlers

    if (value && own.call(value, key)) {
      // @ts-expect-error Indexable.
      const id = String(value[key])
      // @ts-expect-error Indexable.
      fn = own.call(handlers, id) ? handlers[id] : one.unknown
    }

    if (fn) {
      return fn.call(this, value, ...parameters)
    }
  }

  one.handlers = settings.handlers || {}
  one.invalid = settings.invalid
  one.unknown = settings.unknown

  // @ts-expect-error: matches!
  return one
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_convert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/convert.js */ "./lib/convert.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");



const SLICE_CLIP_MEDIA_TYPE = 'application/x-vnd.google-docs-document-slice-clip';

const log = debug__WEBPACK_IMPORTED_MODULE_1__('app:index:debug')

const inputElement = document.getElementById('input');
const outputElement = document.getElementById('output');
const inputInstructions = document.querySelector('#input-area .instructions');
const outputInstructions = document.querySelector('#output-area .instructions');

// Hold most recently pasted Slice Clip (the Google Docs internal copy/paste
// format) globally so we can re-use it if the user hand-edits the input.
let latestSliceClip = null
inputElement.addEventListener('paste', event => {
  if (!event.clipboardData) {
    console.warn('Could not access clipboard data from paste event');
    return;
  }

  // Allow for raw or wrapped slice clips (one uses a "+wrapped" suffix).
  const sliceClipType = event.clipboardData.types.find(type =>
    type.startsWith(SLICE_CLIP_MEDIA_TYPE)
  );
  log('Slice clip media type: %s', sliceClipType);
  if (sliceClipType) {
    const sliceClip = event.clipboardData.getData(sliceClipType);
    log('raw slice clip: %s', sliceClip);
    latestSliceClip = sliceClip;
  }
});

inputElement.addEventListener('input', () => {
  const hasContent = !!inputElement.textContent;
  inputInstructions.style.display = hasContent ? 'none' : '';

  (0,_lib_convert_js__WEBPACK_IMPORTED_MODULE_0__.convertDocsHtmlToMarkdown)(inputElement.innerHTML, latestSliceClip)
    .then(markdown => {
      outputElement.value = markdown;
      outputInstructions.style.display = markdown.trim() ? 'none' : '';
    })
    .catch(error => {
      console.error(error);
      outputInstructions.style.display = '';
    });
});

window.convertDocsHtmlToMarkdown = _lib_convert_js__WEBPACK_IMPORTED_MODULE_0__.convertDocsHtmlToMarkdown;

const copyButton = document.getElementById('copy-button');
if (navigator.clipboard && navigator.clipboard.writeText) {
  copyButton.style.display = '';
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(outputElement.value).catch((error) => {
      alert(`Unable to copy markdown to clipboard: ${error}`);
    });
  });
}

const downloadButton = document.getElementById('download-button');
if (window.URL && window.File) {
  downloadButton.style.display = '';
  downloadButton.addEventListener('click', () => {
    const file = new File([outputElement.value], 'Converted Text.md', {
      type: 'text/markdown',
    });

    // Make a link to the file and click it to trigger a download. Chrome has a
    // fancy API for opening a save dialog, but other browsers do not, and this
    // is the most universal way to download a file created in the front-end.
    let url, link;
    try {
      url = URL.createObjectURL(file);
      link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
    }
    finally {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  });
}

})();

/******/ })()
;