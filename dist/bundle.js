(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventEmitter;
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {} /* Nothing to set */

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event,
      available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt],
      events = [];

  if (fn) {
    if (listeners.fn) {
      if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioNodeView = require('./audioNodeView');

for (let _key in _audioNodeView) {
  if (_key === "default") continue;
  Object.defineProperty(exports, _key, {
    enumerable: true,
    get: function () {
      return _audioNodeView[_key];
    }
  });
}

var _eg = require('./eg');

for (let _key2 in _eg) {
  if (_key2 === "default") continue;
  Object.defineProperty(exports, _key2, {
    enumerable: true,
    get: function () {
      return _eg[_key2];
    }
  });
}

var _sequencer = require('./sequencer');

for (let _key3 in _sequencer) {
  if (_key3 === "default") continue;
  Object.defineProperty(exports, _key3, {
    enumerable: true,
    get: function () {
      return _sequencer[_key3];
    }
  });
}

exports.dummy = dummy;
function dummy() {};

},{"./audioNodeView":3,"./eg":5,"./sequencer":11}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.AudioNodeView = exports.ParamView = exports.AudioParamView = exports.STATUS_PLAY_PLAYED = exports.STATUS_PLAY_PLAYING = exports.STATUS_PLAY_NOT_PLAYED = exports.NodeViewBase = exports.ctx = undefined;
exports.setCtx = setCtx;
exports.getObjectCounter = getObjectCounter;
exports.updateCounter = updateCounter;
exports.defIsNotAPIObj = defIsNotAPIObj;

var _uuid = require('./uuid.core');

var _uuid2 = _interopRequireDefault(_uuid);

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var counter = 0;
var ctx = exports.ctx = undefined;
function setCtx(c) {
	exports.ctx = ctx = c;
}

function getObjectCounter() {
	return counter;
}

function updateCounter(v) {
	if (v > counter) {
		counter = v;
		++counter;
	}
}

let NodeViewBase = exports.NodeViewBase = function NodeViewBase() {
	let x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	let y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	let width = arguments.length <= 2 || arguments[2] === undefined ? ui.nodeWidth : arguments[2];
	let height = arguments.length <= 3 || arguments[3] === undefined ? ui.nodeHeight : arguments[3];
	let name = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];

	_classCallCheck(this, NodeViewBase);

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.name = name;
};

const STATUS_PLAY_NOT_PLAYED = exports.STATUS_PLAY_NOT_PLAYED = 0;
const STATUS_PLAY_PLAYING = exports.STATUS_PLAY_PLAYING = 1;
const STATUS_PLAY_PLAYED = exports.STATUS_PLAY_PLAYED = 2;

function defIsNotAPIObj(this_, v) {
	Object.defineProperty(this_, 'isNotAPIObj', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: v
	});
}

let AudioParamView = exports.AudioParamView = (function (_NodeViewBase) {
	_inherits(AudioParamView, _NodeViewBase);

	function AudioParamView(AudioNodeView, name, param) {
		_classCallCheck(this, AudioParamView);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioParamView).call(this, 0, 0, ui.pointSize, ui.pointSize, name));

		_this.id = _uuid2.default.generate();
		_this.audioParam = param;
		_this.AudioNodeView = AudioNodeView;
		return _this;
	}

	return AudioParamView;
})(NodeViewBase);

let ParamView = exports.ParamView = (function (_NodeViewBase2) {
	_inherits(ParamView, _NodeViewBase2);

	function ParamView(AudioNodeView, name, isoutput) {
		_classCallCheck(this, ParamView);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ParamView).call(this, 0, 0, ui.pointSize, ui.pointSize, name));

		_this2.id = _uuid2.default.generate();
		_this2.AudioNodeView = AudioNodeView;
		_this2.isOutput = isoutput || false;
		return _this2;
	}

	return ParamView;
})(NodeViewBase);

let AudioNodeView = exports.AudioNodeView = (function (_NodeViewBase3) {
	_inherits(AudioNodeView, _NodeViewBase3);

	function AudioNodeView(audioNode, editor) {
		_classCallCheck(this, AudioNodeView);

		var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioNodeView).call(this));
		// audioNode はベースとなるノード

		_this3.id = _uuid2.default.generate();
		_this3.audioNode = audioNode;
		_this3.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		_this3.inputParams = [];
		_this3.outputParams = [];
		_this3.params = [];
		let inputCy = 1,
		    outputCy = 1;

		_this3.removable = true;

		// プロパティ・メソッドの複製
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
				//				this[i] = audioNode[i].bind(audioNode);
			} else {
					if (typeof audioNode[i] === 'object') {
						if (audioNode[i] instanceof AudioParam) {
							_this3[i] = new AudioParamView(_this3, i, audioNode[i]);
							_this3.inputParams.push(_this3[i]);
							_this3.params.push((function (p) {
								return {
									name: i,
									'get': function () {
										return p.audioParam.value;
									},
									'set': function (v) {
										p.audioParam.value = v;
									},
									param: p,
									node: _this3
								};
							})(_this3[i]));
							_this3[i].y = 20 * inputCy++;
						} else if (audioNode[i] instanceof ParamView) {
							audioNode[i].AudioNodeView = _this3;
							_this3[i] = audioNode[i];
							if (_this3[i].isOutput) {
								_this3[i].y = 20 * outputCy++;
								_this3[i].x = _this3.width;
								_this3.outputParams.push(_this3[i]);
							} else {
								_this3[i].y = 20 * inputCy++;
								_this3.inputParams.push(_this3[i]);
							}
						} else {
							_this3[i] = audioNode[i];
						}
					} else {
						var desc = Object.getOwnPropertyDescriptor(AudioNode.prototype, i);
						if (!desc) {
							desc = Object.getOwnPropertyDescriptor(_this3.audioNode.__proto__, i);
						}
						if (!desc) {
							desc = Object.getOwnPropertyDescriptor(_this3.audioNode, i);
						}
						var props = {};

						//					if(desc.get){
						props.get = (function (i) {
							return _this3.audioNode[i];
						}).bind(null, i);
						//					}

						if (desc.writable || desc.set) {
							props.set = (function (i, v) {
								_this3.audioNode[i] = v;
							}).bind(null, i);
						}

						props.enumerable = desc.enumerable;
						props.configurable = desc.configurable;
						//props.writable = false;
						//props.writable = desc.writable;

						Object.defineProperty(_this3, i, props);

						props.name = i;
						props.node = _this3;

						if (desc.enumerable && !i.match(/(.*_$)|(name)|(^numberOf.*$)/i) && typeof audioNode[i] !== 'Array') {
							_this3.params.push(props);
						}
					}
				}
		}

		_this3.inputStartY = inputCy * 20;
		var inputHeight = (inputCy + _this3.numberOfInputs) * 20;
		var outputHeight = (outputCy + _this3.numberOfOutputs) * 20;
		_this3.outputStartY = outputCy * 20;
		_this3.height = Math.max(_this3.height, inputHeight, outputHeight);
		_this3.temp = {};
		_this3.statusPlay = STATUS_PLAY_NOT_PLAYED; // not played.
		_this3.panel = null;
		_this3.editor = editor.bind(_this3, _this3);
		return _this3;
	}

	_createClass(AudioNodeView, [{
		key: 'toJSON',
		value: function toJSON() {
			let ret = {};
			ret.id = this.id;
			ret.x = this.x;
			ret.y = this.y;
			ret.name = this.name;
			ret.removable = this.removable;
			if (this.audioNode.toJSON) {
				ret.audioNode = this.audioNode;
			} else {
				ret.params = {};
				this.params.forEach(function (d) {
					if (d.set) {
						ret.params[d.name] = d.get();
					}
				});
			}
			return ret;
		}

		// ノードの削除

	}], [{
		key: 'remove',
		value: function remove(node) {
			if (!node.removable) {
				throw new Error('削除できないノードです。');
			}
			// ノードの削除
			for (var i = 0; i < AudioNodeView.audioNodes.length; ++i) {
				if (AudioNodeView.audioNodes[i] === node) {
					if (node.audioNode.dispose) {
						node.audioNode.dispose();
					}
					AudioNodeView.audioNodes.splice(i--, 1);
				}
			}

			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				let n = AudioNodeView.audioConnections[i];
				if (n.from.node === node || n.to.node === node) {
					AudioNodeView.disconnect_(n);
					AudioNodeView.audioConnections.splice(i--, 1);
				}
			}
		}

		//

	}, {
		key: 'removeAllNodeViews',
		value: function removeAllNodeViews() {
			AudioNodeView.audioNodes.forEach(function (node) {
				if (node.audioNode.dispose) {
					node.audioNode.dispose();
				}
				for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
					let n = AudioNodeView.audioConnections[i];
					if (n.from.node === node || n.to.node === node) {
						AudioNodeView.disconnect_(n);
						AudioNodeView.audioConnections.splice(i--, 1);
					}
				}
			});
			AudioNodeView.audioNodes.length = 0;
		}

		//

	}, {
		key: 'disconnect_',
		value: function disconnect_(con) {
			if (con.from.param instanceof ParamView) {
				con.from.node.audioNode.disconnect(con);
			} else if (con.to.param) {
				// toパラメータあり
				if (con.to.param instanceof AudioParamView) {
					// AUdioParam
					if (con.from.param) {
						// fromパラメータあり
						con.from.node.audioNode.disconnect(con.to.param.audioParam, con.from.param);
					} else {
						// fromパラメータなし
						con.from.node.audioNode.disconnect(con.to.param.audioParam);
					}
				} else {
					// con.to.paramが数字
					if (con.from.param) {
						// fromパラメータあり
						if (con.from.param instanceof ParamView) {
							con.from.node.audioNode.disconnect(con);
						} else {
							try {
								con.from.node.audioNode.disconnect(con.to.node.audioNode, con.from.param, con.to.param);
							} catch (e) {
								console.log(e);
							}
						}
					} else {
						// fromパラメータなし
						con.from.node.audioNode.disconnect(con.to.node.audioNode, 0, con.to.param);
					}
				}
			} else {
				// to パラメータなし
				if (con.from.param) {
					// fromパラメータあり
					con.from.node.audioNode.disconnect(con.to.node.audioNode, con.from.param);
				} else {
					// fromパラメータなし
					con.from.node.audioNode.disconnect(con.to.node.audioNode);
				}
			}
		}

		// コネクションの接続を解除する

	}, {
		key: 'disconnect',
		value: function disconnect(from_, to_) {
			if (from_ instanceof AudioNodeView) {
				from_ = { node: from_ };
			}

			if (from_ instanceof ParamView) {
				from_ = { node: from_.AudioNodeView, param: from_ };
			}

			if (to_ instanceof AudioNodeView) {
				to_ = { node: to_ };
			}

			if (to_ instanceof AudioParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}

			if (to_ instanceof ParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}

			var con = { 'from': from_, 'to': to_ };

			// コネクションの削除
			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				let n = AudioNodeView.audioConnections[i];
				if (con.from.node === n.from.node && con.from.param === n.from.param && con.to.node === n.to.node && con.to.param === n.to.param) {
					AudioNodeView.audioConnections.splice(i--, 1);
					AudioNodeView.disconnect_(con);
				}
			}
		}
	}, {
		key: 'create',
		value: function create(audionode) {
			let editor = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

			var obj = new AudioNodeView(audionode, editor);
			AudioNodeView.audioNodes.push(obj);
			return obj;
		}

		// ノード間の接続

	}, {
		key: 'connect',
		value: function connect(from_, to_) {
			if (from_ instanceof AudioNodeView) {
				from_ = { node: from_, param: 0 };
			}

			if (from_ instanceof ParamView) {
				from_ = { node: from_.AudioNodeView, param: from_ };
			}

			if (to_ instanceof AudioNodeView) {
				to_ = { node: to_, param: 0 };
			}

			if (to_ instanceof AudioParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}

			if (to_ instanceof ParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}
			// 存在チェック
			for (var i = 0, l = AudioNodeView.audioConnections.length; i < l; ++i) {
				var c = AudioNodeView.audioConnections[i];
				if (c.from.node === from_.node && c.from.param === from_.param && c.to.node === to_.node && c.to.param === to_.param) {
					return;
					//				throw (new Error('接続が重複しています。'));
				}
			}

			// 接続先がParamViewの場合は接続元はParamViewのみ
			if (to_.param instanceof ParamView && !(from_.param instanceof ParamView)) {
				return;
			}

			// ParamViewが接続可能なのはAudioParamからParamViewのみ
			if (from_.param instanceof ParamView) {
				if (!(to_.param instanceof ParamView || to_.param instanceof AudioParamView)) {
					return;
				}
			}

			if (from_.param) {
				// fromパラメータあり
				if (from_.param instanceof ParamView) {
					from_.node.audioNode.connect({ 'from': from_, 'to': to_ });
					//				from_.node.connectParam(from_.param,to_);
				} else if (to_.param) {
						// toパラメータあり
						if (to_.param instanceof AudioParamView) {
							// AudioParamの場合
							from_.node.audioNode.connect(to_.param.audioParam, from_.param);
						} else {
							// 数字の場合
							from_.node.audioNode.connect(to_.node.audioNode, from_.param, to_.param);
						}
					} else {
						// toパラメータなし
						from_.node.audioNode.connect(to_.node.audioNode, from_.param);
					}
			} else {
				// fromパラメータなし
				if (to_.param) {
					// toパラメータあり
					if (to_.param instanceof AudioParamView) {
						// AudioParamの場合
						from_.node.audioNode.connect(to_.param.audioParam);
					} else {
						// 数字の場合
						from_.node.audioNode.connect(to_.node.audioNode, 0, to_.param);
					}
				} else {
					// toパラメータなし
					from_.node.audioNode.connect(to_.node.audioNode);
				}
				//throw new Error('Connection Error');
			}

			AudioNodeView.audioConnections.push({
				'from': from_,
				'to': to_
			});
		}
	}]);

	return AudioNodeView;
})(NodeViewBase);

AudioNodeView.audioNodes = [];
AudioNodeView.audioConnections = [];

},{"./ui":12,"./uuid.core":14}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.svg = undefined;
exports.initUI = initUI;
exports.draw = draw;
exports.showPanel = showPanel;
exports.createAudioNodeView = createAudioNodeView;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui.js');

var ui = _interopRequireWildcard(_ui);

var _sequenceEditor = require('./sequenceEditor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var svg = exports.svg = undefined;
//aa
var nodeGroup, lineGroup;
var drag;
var dragOut;
var dragParam;
var dragPanel;

var mouseClickNode;
var mouseOverNode;
var line;
var audioNodeCreators = [];

// Drawの初期化
function initUI() {

	// プレイヤー
	audio.Sequencer.added = function () {
		if (audio.Sequencer.sequencers.length == 1 && audio.Sequencer.sequencers.status === audio.SEQ_STATUS.STOPPED) {
			d3.select('#play').attr('disabled', null);
			d3.select('#stop').attr('disabled', 'disabled');
			d3.select('#pause').attr('disabled', 'disabled');
		}
	};

	audio.Sequencer.empty = function () {
		audio.Sequencer.stopSequences();
		d3.select('#play').attr('disabled', 'disabled');
		d3.select('#stop').attr('disabled', 'disabled');
		d3.select('#pause').attr('disabled', 'disabled');
	};

	d3.select('#play').on('click', function () {
		audio.Sequencer.startSequences(audio.ctx.currentTime);
		d3.select(this).attr('disabled', 'disabled');
		d3.select('#stop').attr('disabled', null);
		d3.select('#pause').attr('disabled', null);
	});

	d3.select('#pause').on('click', function () {
		audio.Sequencer.pauseSequences();
		d3.select(this).attr('disabled', 'disabled');
		d3.select('#stop').attr('disabled', null);
		d3.select('#play').attr('disabled', null);
	});

	d3.select('#stop').on('click', function () {
		audio.Sequencer.stopSequences();
		d3.select(this).attr('disabled', 'disabled');
		d3.select('#pause').attr('disabled', 'disabled');
		d3.select('#play').attr('disabled', null);
	});

	audio.Sequencer.stopped = function () {
		d3.select('#stop').attr('disabled', 'disabled');
		d3.select('#pause').attr('disabled', 'disabled');
		d3.select('#play').attr('disabled', null);
	};

	// AudioNodeドラッグ用
	drag = d3.behavior.drag().origin(function (d) {
		return d;
	}).on('dragstart', function (d) {
		if (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey) {
			this.dispatchEvent(new Event('mouseup'));
			return false;
		}
		d.temp.x = d.x;
		d.temp.y = d.y;
		d3.select(this.parentNode).append('rect').attr({ id: 'drag', width: d.width, height: d.height, x: 0, y: 0, 'class': 'audioNodeDrag' });
	}).on("drag", function (d) {
		if (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey) {
			return;
		}
		d.temp.x += d3.event.dx;
		d.temp.y += d3.event.dy;
		//d3.select(this).attr('transform', 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')');
		//draw();
		var dragCursol = d3.select(this.parentNode).select('rect#drag');
		var x = parseFloat(dragCursol.attr('x')) + d3.event.dx;
		var y = parseFloat(dragCursol.attr('y')) + d3.event.dy;
		dragCursol.attr({ x: x, y: y });
	}).on('dragend', function (d) {
		if (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey) {
			return;
		}
		var dragCursol = d3.select(this.parentNode).select('rect#drag');
		var x = parseFloat(dragCursol.attr('x'));
		var y = parseFloat(dragCursol.attr('y'));
		d.x = d.temp.x;
		d.y = d.temp.y;
		dragCursol.remove();
		draw();
	});

	// ノード間接続用 drag
	dragOut = d3.behavior.drag().origin(function (d) {
		return d;
	}).on('dragstart', function (d) {
		let x1, y1;
		if (d.index) {
			if (d.index instanceof audio.ParamView) {
				x1 = d.node.x - d.node.width / 2 + d.index.x;
				y1 = d.node.y - d.node.height / 2 + d.index.y;
			} else {
				x1 = d.node.x + d.node.width / 2;
				y1 = d.node.y - d.node.height / 2 + d.node.outputStartY + d.index * 20;
			}
		} else {
			x1 = d.node.x + d.node.width / 2;
			y1 = d.node.y - d.node.height / 2 + d.node.outputStartY;
		}

		d.x1 = x1, d.y1 = y1;
		d.x2 = x1, d.y2 = y1;

		var pos = makePos(x1, y1, d.x2, d.y2);
		d.line = svg.append('g').datum(d).append('path').attr({ 'd': line(pos), 'class': 'line-drag' });
	}).on("drag", function (d) {
		d.x2 += d3.event.dx;
		d.y2 += d3.event.dy;
		d.line.attr('d', line(makePos(d.x1, d.y1, d.x2, d.y2)));
	}).on("dragend", function (d) {
		let targetX = d.x2;
		let targetY = d.y2;
		// inputもしくはparamに到達しているか
		// input		
		let connected = false;
		let inputs = d3.selectAll('.input')[0];
		for (var i = 0, l = inputs.length; i < l; ++i) {
			let elm = inputs[i];
			let bbox = elm.getBBox();
			let node = elm.__data__.node;
			let left = node.x - node.width / 2 + bbox.x,
			    top = node.y - node.height / 2 + bbox.y,
			    right = node.x - node.width / 2 + bbox.x + bbox.width,
			    bottom = node.y - node.height / 2 + bbox.y + bbox.height;
			if (targetX >= left && targetX <= right && targetY >= top && targetY <= bottom) {
				//				console.log('hit',elm);
				let from_ = { node: d.node, param: d.index };
				let to_ = { node: node, param: elm.__data__.index };
				audio.AudioNodeView.connect(from_, to_);
				//AudioNodeView.connect();
				draw();
				connected = true;
				break;
			}
		}

		if (!connected) {
			// AudioParam
			var params = d3.selectAll('.param,.audio-param')[0];
			for (var i = 0, l = params.length; i < l; ++i) {
				let elm = params[i];
				let bbox = elm.getBBox();
				let param = elm.__data__;
				let node = param.node;
				let left = node.x - node.width / 2 + bbox.x;
				let top_ = node.y - node.height / 2 + bbox.y;
				let right = node.x - node.width / 2 + bbox.x + bbox.width;
				let bottom = node.y - node.height / 2 + bbox.y + bbox.height;
				if (targetX >= left && targetX <= right && targetY >= top_ && targetY <= bottom) {
					console.log('hit', elm);
					audio.AudioNodeView.connect({ node: d.node, param: d.index }, { node: node, param: param.index });
					draw();
					break;
				}
			}
		}
		// lineプレビューの削除
		d.line.remove();
		delete d.line;
	});

	d3.select('#panel-close').on('click', function () {
		d3.select('#prop-panel').style('visibility', 'hidden');d3.event.returnValue = false;d3.event.preventDefault();
	});

	// node間接続line描画関数
	line = d3.svg.line().x(function (d) {
		return d.x;
	}).y(function (d) {
		return d.y;
	}).interpolate('basis');

	// DOMにsvgエレメントを挿入	
	exports.svg = svg = d3.select('#content').append('svg').attr({ 'width': window.innerWidth, 'height': window.innerHeight });

	// ノードが入るグループ
	nodeGroup = svg.append('g');
	// ラインが入るグループ
	lineGroup = svg.append('g');

	// body属性に挿入
	audioNodeCreators = [{ name: 'Gain', create: audio.ctx.createGain.bind(audio.ctx) }, { name: 'Delay', create: audio.ctx.createDelay.bind(audio.ctx) }, { name: 'AudioBufferSource', create: audio.ctx.createBufferSource.bind(audio.ctx) }, { name: 'MediaElementAudioSource', create: audio.ctx.createMediaElementSource.bind(audio.ctx) }, { name: 'Panner', create: audio.ctx.createPanner.bind(audio.ctx) }, { name: 'Convolver', create: audio.ctx.createConvolver.bind(audio.ctx) }, { name: 'Analyser', create: audio.ctx.createAnalyser.bind(audio.ctx) }, { name: 'ChannelSplitter', create: audio.ctx.createChannelSplitter.bind(audio.ctx) }, { name: 'ChannelMerger', create: audio.ctx.createChannelMerger.bind(audio.ctx) }, { name: 'DynamicsCompressor', create: audio.ctx.createDynamicsCompressor.bind(audio.ctx) }, { name: 'BiquadFilter', create: audio.ctx.createBiquadFilter.bind(audio.ctx) }, { name: 'Oscillator', create: audio.ctx.createOscillator.bind(audio.ctx) }, { name: 'MediaStreamAudioSource', create: audio.ctx.createMediaStreamSource.bind(audio.ctx) }, { name: 'WaveShaper', create: audio.ctx.createWaveShaper.bind(audio.ctx) }, { name: 'EG', create: function () {
			return new audio.EG();
		} }, { name: 'Sequencer', create: function () {
			return new audio.Sequencer();
		}, editor: _sequenceEditor.showSequenceEditor }];

	if (audio.ctx.createMediaStreamDestination) {
		audioNodeCreators.push({ name: 'MediaStreamAudioDestination',
			create: audio.ctx.createMediaStreamDestination.bind(audio.ctx)
		});
	}

	d3.select('#content').datum({}).on('contextmenu', function () {
		showAudioNodePanel(this);
	});
}

// 描画
function draw() {
	// AudioNodeの描画
	var gd = nodeGroup.selectAll('g').data(audio.AudioNodeView.audioNodes, function (d) {
		return d.id;
	});

	// 矩形の更新
	gd.select('rect').attr({ 'width': function (d) {
			return d.width;
		}, 'height': function (d) {
			return d.height;
		} });

	// AudioNode矩形グループ
	var g = gd.enter().append('g');
	// AudioNode矩形グループの座標位置セット
	gd.attr('transform', function (d) {
		return 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')';
	});

	// AudioNode矩形
	g.append('rect').call(drag).attr({ 'width': function (d) {
			return d.width;
		}, 'height': function (d) {
			return d.height;
		}, 'class': 'audioNode' }).classed('play', function (d) {
		return d.statusPlay === audio.STATUS_PLAY_PLAYING;
	}).on('contextmenu', function (d) {
		// パラメータ編集画面の表示
		d.editor();
		d3.event.preventDefault();
		d3.event.returnValue = false;
	}).on('click.remove', function (d) {
		// ノードの削除
		if (d3.event.shiftKey) {
			d.panel && d.panel.isShow && d.panel.dispose();
			try {
				audio.AudioNodeView.remove(d);
				draw();
			} catch (e) {
				//				dialog.text(e.message).node().show(window.innerWidth/2,window.innerHeight/2);
			}
		}
		d3.event.returnValue = false;
		d3.event.preventDefault();
	}).filter(function (d) {
		// 音源のみにフィルタ
		return d.audioNode instanceof OscillatorNode || d.audioNode instanceof AudioBufferSourceNode || d.audioNode instanceof MediaElementAudioSourceNode;
	}).on('click', function (d) {
		// 再生・停止
		console.log(d3.event);
		d3.event.returnValue = false;
		d3.event.preventDefault();

		if (!d3.event.ctrlKey) {
			return;
		}
		let sel = d3.select(this);
		if (d.statusPlay === audio.STATUS_PLAY_PLAYING) {
			d.statusPlay = audio.STATUS_PLAY_PLAYED;
			sel.classed('play', false);
			d.audioNode.stop(0);
		} else if (d.statusPlay !== audio.STATUS_PLAY_PLAYED) {
			d.audioNode.start(0);
			d.statusPlay = audio.STATUS_PLAY_PLAYING;
			sel.classed('play', true);
		} else {
			alert('一度停止すると再生できません。');
		}
	}).call(tooltip('Ctrl + Click で再生・停止'));
	;

	// AudioNodeのラベル
	g.append('text').attr({ x: 0, y: -10, 'class': 'label' }).text(function (d) {
		return d.name;
	});

	// 入力AudioParamの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');
		var gpd = gp.selectAll('g').data(d.inputParams.map(function (d) {
			return { node: d.AudioNodeView, index: d };
		}), function (d) {
			return d.index.id;
		});

		var gpdg = gpd.enter().append('g');

		gpdg.append('circle').attr({ 'r': function (d) {
				return d.index.width / 2;
			},
			cx: 0, cy: function (d, i) {
				return d.index.y;
			},
			'class': function (d) {
				if (d.index instanceof audio.AudioParamView) {
					return 'audio-param';
				}
				return 'param';
			} });

		gpdg.append('text').attr({ x: function (d) {
				return d.index.x + d.index.width / 2 + 5;
			}, y: function (d) {
				return d.index.y;
			}, 'class': 'label' }).text(function (d) {
			return d.index.name;
		});

		gpd.exit().remove();
	});

	// 出力Paramの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');

		var gpd = gp.selectAll('g').data(d.outputParams.map(function (d) {
			return { node: d.AudioNodeView, index: d };
		}), function (d) {
			return d.index.id;
		});

		var gpdg = gpd.enter().append('g');

		gpdg.append('circle').attr({ 'r': function (d) {
				return d.index.width / 2;
			},
			cx: d.width, cy: function (d, i) {
				return d.index.y;
			},
			'class': 'param' }).call(dragOut);

		gpdg.append('text').attr({ x: function (d) {
				return d.index.x + d.index.width / 2 + 5;
			}, y: function (d) {
				return d.index.y;
			}, 'class': 'label' }).text(function (d) {
			return d.index.name;
		});

		gpd.exit().remove();
	});

	// 出力表示
	gd.filter(function (d) {
		return d.numberOfOutputs > 0;
	}).each(function (d) {
		var sel = d3.select(this).append('g');
		if (!d.temp.outs || d.temp.outs && d.temp.outs.length < d.numberOfOutputs) {
			d.temp.outs = [];
			for (var i = 0; i < d.numberOfOutputs; ++i) {
				d.temp.outs.push({ node: d, index: i });
			}
		}
		var sel1 = sel.selectAll('g');
		var seld = sel1.data(d.temp.outs);

		seld.enter().append('g').append('rect').attr({ x: d.width - ui.pointSize / 2, y: function (d1) {
				return d.outputStartY + d1.index * 20 - ui.pointSize / 2;
			}, width: ui.pointSize, height: ui.pointSize, 'class': 'output' }).call(dragOut);
		seld.exit().remove();
	});

	// 入力表示
	gd.filter(function (d) {
		return d.numberOfInputs > 0;
	}).each(function (d) {
		var sel = d3.select(this).append('g');
		if (!d.temp.ins || d.temp.ins && d.temp.ins.length < d.numberOfInputs) {
			d.temp.ins = [];
			for (var i = 0; i < d.numberOfInputs; ++i) {
				d.temp.ins.push({ node: d, index: i });
			}
		}
		var sel1 = sel.selectAll('g');
		var seld = sel1.data(d.temp.ins);

		seld.enter().append('g').append('rect').attr({ x: -ui.pointSize / 2, y: function (d1) {
				return d.inputStartY + d1.index * 20 - ui.pointSize / 2;
			}, width: ui.pointSize, height: ui.pointSize, 'class': 'input' }).on('mouseenter', function (d) {
			mouseOverNode = { node: d.audioNode_, param: d };
		}).on('mouseleave', function (d) {
			if (mouseOverNode.node) {
				if (mouseOverNode.node === d.audioNode_ && mouseOverNode.param === d) {
					mouseOverNode = null;
				}
			}
		});
		seld.exit().remove();
	});

	// 不要なノードの削除
	gd.exit().remove();

	// line 描画
	var ld = lineGroup.selectAll('path').data(audio.AudioNodeView.audioConnections);

	ld.enter().append('path');

	ld.each(function (d) {
		var path = d3.select(this);
		var x1, y1, x2, y2;

		// x1,y1
		if (d.from.param) {
			if (d.from.param instanceof audio.ParamView) {
				x1 = d.from.node.x - d.from.node.width / 2 + d.from.param.x;
				y1 = d.from.node.y - d.from.node.height / 2 + d.from.param.y;
			} else {
				x1 = d.from.node.x + d.from.node.width / 2;
				y1 = d.from.node.y - d.from.node.height / 2 + d.from.node.outputStartY + d.from.param * 20;
			}
		} else {
			x1 = d.from.node.x + d.from.node.width / 2;
			y1 = d.from.node.y - d.from.node.height / 2 + d.from.node.outputStartY;
		}

		x2 = d.to.node.x - d.to.node.width / 2;
		y2 = d.to.node.y - d.to.node.height / 2;

		if (d.to.param) {
			if (d.to.param instanceof audio.AudioParamView || d.to.param instanceof audio.ParamView) {
				x2 += d.to.param.x;
				y2 += d.to.param.y;
			} else {
				y2 += d.to.node.inputStartY + d.to.param * 20;
			}
		} else {
			y2 += d.to.node.inputStartY;
		}

		var pos = makePos(x1, y1, x2, y2);

		path.attr({ 'd': line(pos), 'class': 'line' });
		path.on('click', function (d) {
			if (d3.event.shiftKey) {
				audio.AudioNodeView.disconnect(d.from, d.to);
				d3.event.returnValue = false;
				draw();
			}
		}).call(tooltip('Shift + clickで削除'));
	});
	ld.exit().remove();
}

// 簡易tooltip表示
function tooltip(mes) {
	return function (d) {
		this.on('mouseenter', function () {
			svg.append('text').attr({ 'class': 'tip', x: d3.event.x + 20, y: d3.event.y - 20 }).text(mes);
		}).on('mouseleave', function () {
			svg.selectAll('.tip').remove();
		});
	};
}

// 接続線の座標生成
function makePos(x1, y1, x2, y2) {
	return [{ x: x1, y: y1 }, { x: x1 + (x2 - x1) / 4, y: y1 }, { x: x1 + (x2 - x1) / 2, y: y1 + (y2 - y1) / 2 }, { x: x1 + (x2 - x1) * 3 / 4, y: y2 }, { x: x2, y: y2 }];
}

// プロパティパネルの表示
function showPanel(d) {

	d3.event.returnValue = false;
	d3.event.cancelBubble = true;
	d3.event.preventDefault();

	if (d.panel && d.panel.isShow) return;

	d.panel = new ui.Panel();
	d.panel.x = d.x;
	d.panel.y = d.y;
	d.panel.header.text(d.name);

	var table = d.panel.article.append('table');
	var tbody = table.append('tbody').selectAll('tr').data(d.params);
	var tr = tbody.enter().append('tr');
	tr.append('td').text(function (d) {
		return d.name;
	});
	tr.append('td').append('input').attr({ type: "text", value: function (d) {
			return d.get();
		}, readonly: function (d) {
			return d.set ? null : 'readonly';
		} }).on('change', function (d) {
		let value = d3.event.target.value;
		let vn = parseFloat(value);
		if (isNaN(vn)) {
			d.set(value);
		} else {
			d.set(vn);
		}
	});
	d.panel.show();
}

// ノード挿入パネルの表示
function showAudioNodePanel(d) {
	d3.event.returnValue = false;
	d3.event.preventDefault();

	if (d.panel) {
		if (d.panel.isShow) return;
	}

	d.panel = new ui.Panel();
	d.panel.x = d3.event.offsetX;
	d.panel.y = d3.event.offsetY;
	d.panel.header.text('AudioNodeの挿入');

	var table = d.panel.article.append('table');
	var tbody = table.append('tbody').selectAll('tr').data(audioNodeCreators);
	tbody.enter().append('tr').append('td').text(function (d) {
		return d.name;
	}).on('click', function (dt) {
		console.log('挿入', dt);

		var editor = dt.editor || showPanel;

		var node = audio.AudioNodeView.create(dt.create(), editor);
		node.x = d3.event.clientX;
		node.y = d3.event.clientY;
		draw();
		// d3.select('#prop-panel').style('visibility','hidden');
		// d.panel.dispose();
	});
	d.panel.show();
}

function createAudioNodeView(name) {
	var obj = audioNodeCreators.find(function (d) {
		if (d.name === name) return true;
	});
	if (obj) {
		return audio.AudioNodeView.create(obj.create(), obj.editor || showPanel);
	}
}

},{"./audio":2,"./sequenceEditor":10,"./ui.js":12}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EG = undefined;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let EG = exports.EG = (function () {
	function EG() {
		_classCallCheck(this, EG);

		this.gate = new audio.ParamView(this, 'gate', false);
		this.output = new audio.ParamView(this, 'output', true);
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.attack = 0.001;
		this.decay = 0.05;
		this.release = 0.05;
		this.sustain = 0.2;
		this.gain = 1.0;
		this.name = 'EG';
		audio.defIsNotAPIObj(this, false);
		this.outputs = [];
	}

	_createClass(EG, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: this.name,
				attack: this.attack,
				decay: this.decay,
				release: this.release,
				sustain: this.sustain,
				gain: this.gain
			};
		}
	}, {
		key: 'connect',
		value: function connect(c) {
			if (!(c.to.param instanceof audio.AudioParamView)) {
				throw new Error('AudioParam以外とは接続できません。');
			}
			c.to.param.audioParam.value = 0;
			this.outputs.push(c.to);
		}
	}, {
		key: 'disconnect',
		value: function disconnect(c) {
			for (var i = 0; i < this.outputs.length; ++i) {
				if (c.to.node === this.outputs[i].node && c.to.param === this.outputs[i].param) {
					this.outputs.splice(i--, 1);
					break;
				}
			}
		}
	}, {
		key: 'process',
		value: function process(to, com, v, t) {
			var _this = this;

			if (v > 0) {
				// keyon
				// ADSまでもっていく
				this.outputs.forEach(function (d) {
					console.log('keyon', com, v, t);
					d.param.audioParam.setValueAtTime(0, t);
					d.param.audioParam.linearRampToValueAtTime(v * _this.gain, t + _this.attack);
					d.param.audioParam.linearRampToValueAtTime(_this.sustain * v * _this.gain, t + _this.attack + _this.decay);
				});
			} else {
				// keyoff
				// リリース
				this.outputs.forEach(function (d) {
					console.log('keyoff', com, v, t);
					d.param.audioParam.linearRampToValueAtTime(0, t + _this.release);
				});
			}
		}
	}, {
		key: 'stop',
		value: function stop() {
			this.outputs.forEach(function (d) {
				console.log('stop');
				d.param.audioParam.cancelScheduledValues(0);
				d.param.audioParam.setValueAtTime(0, 0);
			});
		}
	}, {
		key: 'pause',
		value: function pause() {}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new EG();
			ret.name = o.name;
			ret.attack = o.attack;
			ret.decay = o.decay;
			ret.release = o.release;
			ret.sustain = o.sustain;
			ret.gain = o.gain;
			return ret;
		}
	}]);

	return EG;
})();

// /// エンベロープジェネレーター
// function EnvelopeGenerator(voice, attack, decay, sustain, release) {
//   this.voice = voice;
//   //this.keyon = false;
//   this.attack = attack || 0.0005;
//   this.decay = decay || 0.05;
//   this.sustain = sustain || 0.5;
//   this.release = release || 0.5;
// };
//
// EnvelopeGenerator.prototype =
// {
//   keyon: function (t,vel) {
//     this.v = vel || 1.0;
//     var v = this.v;
//     var t0 = t || this.voice.audioctx.currentTime;
//     var t1 = t0 + this.attack * v;
//     var gain = this.voice.gain.gain;
//     gain.cancelScheduledValues(t0);
//     gain.setValueAtTime(0, t0);
//     gain.linearRampToValueAtTime(v, t1);
//     gain.linearRampToValueAtTime(this.sustain * v, t0 + this.decay / v);
//     //gain.setTargetAtTime(this.sustain * v, t1, t1 + this.decay / v);
//   },
//   keyoff: function (t) {
//     var voice = this.voice;
//     var gain = voice.gain.gain;
//     var t0 = t || voice.audioctx.currentTime;
//     gain.cancelScheduledValues(t0);
//     //gain.setValueAtTime(0, t0 + this.release / this.v);
//     //gain.setTargetAtTime(0, t0, t0 + this.release / this.v);
//     gain.linearRampToValueAtTime(0, t0 + this.release / this.v);
//   }
// };

},{"./audio":2}],6:[function(require,module,exports){
'use strict'

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventEmitter;
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {} /* Nothing to set */

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event,
      available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt],
      events = [];

  if (fn) {
    if (listeners.fn) {
      if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAudioNodeCreators = setAudioNodeCreators;
exports.createAudioNodeViewfromJSON = createAudioNodeViewfromJSON;
exports.load = load;
exports.save = save;

var _audio = require('./audio.js');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui.js');

var ui = _interopRequireWildcard(_ui);

var _draw = require('./draw');

var _sequenceEditor = require('./sequenceEditor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var audioNodeCreators = {};
function setAudioNodeCreators(v) {
  audioNodeCreators = v;
}

function createAudioNodeViewfromJSON(o) {
  let audioNode;
  if (o.audioNode) {
    audioNode = audioNodeCreators[o.name].create(o.audioNode);
  } else {
    audioNode = audioNodeCreators[o.name].create();
  }
  let ret = audio.AudioNodeView.create(audioNode, audioNodeCreators[o.name].editor);
  if (o.params) {
    for (let i in o.params) {
      ret[i] = o.params[i];
    }
  }
  ret.id = o.id;
  ret.x = o.x;
  ret.y = o.y;
  ret.name = o.name;
  ret.removable = o.removable;
  return ret;
}

function load(data) {
  if (data) {
    data = JSON.parse(data);
    var audioNodeViews = {};
    if (data.audioNodes && data.audioConnections) {
      audio.AudioNodeView.removeAllNodeViews();
      data.audioNodes.forEach(function (d) {
        let nodeView = createAudioNodeViewfromJSON(d);
        audioNodeViews[nodeView.id] = nodeView;
      });
      // Connectionの作成
      data.audioConnections.forEach(function (d) {
        let fromNode = audioNodeViews[d.from.node.id];
        let fromParam = d.from.param.name ? fromNode.outputParams.find(function (e) {
          return e.name === d.from.param.name;
        }) : d.from.param;

        let toNode = audioNodeViews[d.to.node.id];
        let toParam = d.to.param.name ? toNode.inputParams.find(function (e) {
          return e.name === d.to.param.name;
        }) : d.to.param;

        audio.AudioNodeView.connect({ node: fromNode, param: fromParam }, { node: toNode, param: toParam });
      });
    }
  }
}

function save() {
  let saveData = {
    audioNodes: audio.AudioNodeView.audioNodes,
    audioConnections: [],
    objCounter: audio.getObjectCounter()
  };

  audio.AudioNodeView.audioConnections.forEach(function (d) {
    let dest = {
      from: {
        node: {
          id: d.from.node.id,
          name: d.from.node.name
        },
        param: d.from.param.name ? {
          name: d.from.param.name
        } : d.from.param
      },
      to: {
        node: {
          id: d.to.node.id,
          name: d.to.node.name
        },
        param: d.to.param.name ? {
          name: d.to.param.name
        } : d.to.param
      }
    };
    saveData.audioConnections.push(dest);
  });

  localStorage.setItem('data', JSON.stringify(saveData));
}

},{"./audio.js":2,"./draw":4,"./sequenceEditor":10,"./ui.js":12}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.defObservable = defObservable;
function defObservable(target, propName) {
	let opt = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	(function () {
		var v_;
		opt.enumerable = opt.enumerable || true;
		opt.configurable = opt.configurable || false;
		opt.get = opt.get || function () {
			return v_;
		};
		opt.set = opt.set || function (v) {
			if (v_ != v) {
				v_ = v;
				target.emit(propName + '_changed', v);
			}
		};
		Object.defineProperty(target, propName, opt);
	})();
}

},{}],9:[function(require,module,exports){
"use strict";

var _audio = require('./audio.js');

var audio = _interopRequireWildcard(_audio);

var _draw = require('./draw');

var _sequenceEditor = require('./sequenceEditor');

var _loaderSaver = require('./loaderSaver');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

window.onload = function () {
  audio.setCtx(new AudioContext());
  (0, _draw.initUI)();

  (0, _loaderSaver.setAudioNodeCreators)({
    'AudioDestinationNode': { create: function () {
        return audio.ctx.destination;
      }, editor: _draw.showPanel },
    'GainNode': { create: audio.ctx.createGain.bind(audio.ctx), editor: _draw.showPanel },
    'DelayNode': { create: audio.ctx.createDelay.bind(audio.ctx), editor: _draw.showPanel },
    'AudioBufferSourceNode': { create: audio.ctx.createBufferSource.bind(audio.ctx), editor: _draw.showPanel },
    'MediaElementAudioSourceNode': { create: audio.ctx.createMediaElementSource.bind(audio.ctx), editor: _draw.showPanel },
    'PannerNode': { create: audio.ctx.createPanner.bind(audio.ctx), editor: _draw.showPanel },
    'ConvolverNode': { create: audio.ctx.createConvolver.bind(audio.ctx), editor: _draw.showPanel },
    'AnalyserNode': { create: audio.ctx.createAnalyser.bind(audio.ctx), editor: _draw.showPanel },
    'ChannelSplitterNode': { create: audio.ctx.createChannelSplitter.bind(audio.ctx), editor: _draw.showPanel },
    'ChannelMergerNode': { create: audio.ctx.createChannelMerger.bind(audio.ctx), editor: _draw.showPanel },
    'DynamicsCompressorNode': { create: audio.ctx.createDynamicsCompressor.bind(audio.ctx), editor: _draw.showPanel },
    'BiquadFilterNode': { create: audio.ctx.createBiquadFilter.bind(audio.ctx), editor: _draw.showPanel },
    'OscillatorNode': { create: audio.ctx.createOscillator.bind(audio.ctx), editor: _draw.showPanel },
    'MediaStreamAudioSourceNode': { create: audio.ctx.createMediaStreamSource.bind(audio.ctx), editor: _draw.showPanel },
    'WaveShaperNode': { create: audio.ctx.createWaveShaper.bind(audio.ctx), editor: _draw.showPanel },
    'EG': { create: audio.EG.fromJSON, editor: _draw.showPanel },
    'Sequencer': { create: audio.Sequencer.fromJSON, editor: _sequenceEditor.showSequenceEditor }
  });

  // 出力ノードの作成（削除不可）
  let data = localStorage.getItem('data');
  if (false /*!data*/) {
      let out = audio.AudioNodeView.create(audio.ctx.destination, _draw.showPanel);
      out.x = window.innerWidth / 2;
      out.y = window.innerHeight / 2;
      out.removable = false;
    } else {
    (0, _loaderSaver.load)(data);
    if (audio.AudioNodeView.audioNodes.length == 0) {
      let out = audio.AudioNodeView.create(audio.ctx.destination, _draw.showPanel);
      out.x = window.innerWidth / 2;
      out.y = window.innerHeight / 2;
      out.removable = false;
    }
  }

  d3.select(window).on('resize', function () {
    if (_draw.svg) {
      _draw.svg.attr({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  });

  (0, _draw.draw)();
};

window.onbeforeunload = function () {
  (0, _loaderSaver.save)();
};

},{"./audio.js":2,"./draw":4,"./loaderSaver":7,"./sequenceEditor":10}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SequenceEditor = undefined;
exports.showSequenceEditor = showSequenceEditor;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

var _undo = require('./undo');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const InputType = {
  keybord: 0,
  midi: 1
};

const InputCommand = {
  enter: { id: 1, name: 'ノートデータ挿入' },
  esc: { id: 2, name: 'キャンセル' },
  right: { id: 3, name: 'カーソル移動（右）' },
  left: { id: 4, name: 'カーソル移動（左）' },
  up: { id: 5, name: 'カーソル移動（上）' },
  down: { id: 6, name: 'カーソル移動（下）' },
  insertMeasure: { id: 7, name: '小節線挿入' },
  undo: { id: 8, name: 'アンドゥ' },
  redo: { id: 9, name: 'リドゥ' },
  pageUp: { id: 10, name: 'ページアップ' },
  pageDown: { id: 11, name: 'ページダウン' },
  home: { id: 12, name: '先頭行に移動' },
  end: { id: 13, name: '終端行に移動' },
  number: { id: 14, name: '数字入力' },
  note: { id: 15, name: 'ノート入力' },
  scrollUp: { id: 16, name: '高速スクロールアップ' },
  scrollDown: { id: 17, name: '高速スクロールダウン' },
  delete: { id: 18, name: '行削除' },
  linePaste: { id: 19, name: '行ペースト' },
  measureBefore: { id: 20, name: '小節単位の上移動' },
  measureNext: { id: 21, name: '小節単位の下移動' }
};

//
const KeyBind = {
  13: [{
    keyCode: 13,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.enter
  }],
  27: [{
    keyCode: 27,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.esc
  }],
  32: [{
    keyCode: 32,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.right
  }],
  39: [{
    keyCode: 39,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.right
  }],
  37: [{
    keyCode: 37,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.left
  }],
  38: [{
    keyCode: 38,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.up
  }],
  40: [{
    keyCode: 40,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.down
  }],
  106: [{
    keyCode: 106,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.insertMeasure
  }],
  90: [{
    keyCode: 90,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.undo
  }],
  33: [{
    keyCode: 33,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageUp
  }, {
    keyCode: 33,
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.scrollUp
  }, {
    keyCode: 33,
    ctrlKey: false,
    shiftKey: false,
    altKey: true,
    metaKey: false,
    inputCommand: InputCommand.measureBefore
  }],
  82: [{
    keyCode: 82,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageUp
  }],
  34: [{ // Page Down
    keyCode: 34,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageDown
  }, {
    keyCode: 34,
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.scrollDown
  }, {
    keyCode: 34,
    ctrlKey: false,
    shiftKey: false,
    altKey: true,
    metaKey: false,
    inputCommand: InputCommand.measureNext
  }],
  67: [{
    keyCode: 67,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageDown
  }, {
    keyCode: 67,
    note: 'C',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 67,
    note: 'C',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  36: [{
    keyCode: 36,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.home
  }],
  35: [{
    keyCode: 35,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.end
  }],
  96: [{
    keyCode: 96,
    number: 0,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  97: [{
    keyCode: 97,
    number: 1,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  98: [{
    keyCode: 98,
    number: 2,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  99: [{
    keyCode: 99,
    number: 3,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  100: [{
    keyCode: 100,
    number: 4,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  101: [{
    keyCode: 101,
    number: 5,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  102: [{
    keyCode: 102,
    number: 6,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  103: [{
    keyCode: 103,
    number: 7,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  104: [{
    keyCode: 104,
    number: 8,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  105: [{
    keyCode: 105,
    number: 9,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  65: [{
    keyCode: 65,
    note: 'A',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 65,
    note: 'A',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 65,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.redo
  }],
  66: [{
    keyCode: 66,
    note: 'B',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 66,
    note: 'B',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  68: [{
    keyCode: 68,
    note: 'D',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 68,
    note: 'D',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  69: [{
    keyCode: 69,
    note: 'E',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 69,
    note: 'E',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  70: [{
    keyCode: 70,
    note: 'F',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 70,
    note: 'F',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  71: [{
    keyCode: 71,
    note: 'G',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 71,
    note: 'G',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  89: [{
    keyCode: 89,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.delete
  }],
  76: [{
    keyCode: 76,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.linePaste
  }]
};

let SequenceEditor = exports.SequenceEditor = function SequenceEditor(sequencer) {
  _classCallCheck(this, SequenceEditor);

  var self_ = this;
  this.undoManager = new _undo.UndoManager();
  this.sequencer = sequencer;
  sequencer.panel = new ui.Panel();
  sequencer.panel.x = sequencer.x;
  sequencer.panel.y = sequencer.y;
  sequencer.panel.width = 1024;
  sequencer.panel.height = 768;
  sequencer.panel.header.text('Sequence Editor');
  var editor = sequencer.panel.article.append('div').classed('seq-editor', true);
  var div = editor.append('div').classed('header', true);

  // タイムベース
  div.append('span').text('Time Base:');
  div.append('input').datum(sequencer.audioNode.tpb).attr({ 'type': 'text', 'size': '3', 'id': 'time-base' }).attr('value', function (v) {
    return v;
  }).on('change', function () {
    sequencer.audioNode.tpb = parseFloat(d3.event.target.value) || d3.select(this).attr('value');
  }).call(function () {
    var _this = this;

    sequencer.audioNode.on('tpb_changed', function (v) {
      _this.attr('value', v);
    });
  });

  // テンポ
  div.append('span').text('Tempo:');
  div.append('input')
  //      .datum(sequencer)
  .attr({ 'type': 'text', 'size': '3' }).attr('value', function (d) {
    return sequencer.audioNode.bpm;
  }).on('change', function () {
    sequencer.audioNode.bpm = parseFloat(d3.event.target.value);
  }).call(function () {
    var _this2 = this;

    sequencer.audioNode.on('bpm_changed', function (v) {
      _this2.attr('value', v);
    });
  });

  div.append('span').text('Beat:');
  div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
      return sequencer.audioNode.beat;
    } }).on('change', function (d) {
    sequencer.audioNode.beat = parseFloat(d3.select(this).attr('value'));
  });

  div.append('span').text(' / ');
  div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
      return sequencer.audioNode.bar;
    } }).on('change', function (d) {
    sequencer.audioNode.bar = parseFloat(d3.select(this).attr('value'));
  });

  // トラックエディタ
  let trackEdit = editor.selectAll('div.track').data(sequencer.audioNode.tracks).enter().append('div').classed('track', true).attr({ 'id': function (d, i) {
      return 'track-' + (i + 1);
    }, 'tabindex': '0' });

  let trackHeader = trackEdit.append('div').classed('track-header', true);
  trackHeader.append('span').text(function (d, i) {
    return 'TR:' + (i + 1);
  });
  trackHeader.append('span').text('MEAS:');
  let trackBody = trackEdit.append('div').classed('track-body', true);
  let eventEdit = trackBody.append('table');
  let headrow = eventEdit.append('thead').append('tr');
  headrow.append('th').text('M#');
  headrow.append('th').text('S#');
  headrow.append('th').text('NT');
  headrow.append('th').text('N#');
  headrow.append('th').text('ST');
  headrow.append('th').text('GT');
  headrow.append('th').text('VE');
  headrow.append('th').text('CO');
  let eventBody = eventEdit.append('tbody').attr('id', function (d, i) {
    return 'track-' + (i + 1) + '-events';
  });
  //this.drawEvents(eventBody);

  // テストデータ
  // for (var i = 0; i < 127; i += 8) {
  //   for (var j = i; j < (i + 8); ++j) {
  //     sequencer.audioNode.tracks[0].addEvent(new audio.NoteEvent(48, j, 6));
  //   }
  //   sequencer.audioNode.tracks[0].addEvent(new audio.MeasureEnd());
  // }

  // トラックエディタメイン

  trackEdit.each(function (d) {
    if (!this.editor) {
      this.editor = doEditor(d3.select(this), self_);
      this.editor.next();
      this.sequencer = sequencer;
    }
  });

  // キー入力ハンドラ
  trackEdit.on('keydown', function (d) {
    var _this3 = this;

    let e = d3.event;
    console.log(e.keyCode);
    let key = KeyBind[e.keyCode];
    let ret = {};
    if (key) {
      key.some(function (d) {
        if (d.ctrlKey == e.ctrlKey && d.shiftKey == e.shiftKey && d.altKey == e.altKey && d.metaKey == e.metaKey) {
          ret = _this3.editor.next(d);
          return true;
        }
      });
      if (ret.value) {
        d3.event.preventDefault();
        d3.event.cancelBubble = true;
        return false;
      }
    }
  });

  sequencer.panel.on('show', function () {
    d3.select('#time-base').node().focus();
  });

  sequencer.panel.on('dispose', function () {
    delete sequencer.editorInstance;
  });

  sequencer.panel.show();
};

// エディタ本体

function* doEditor(trackEdit, seqEditor) {
  let keycode = 0; // 入力されたキーコードを保持する変数
  let track = trackEdit.datum(); // 現在編集中のトラック
  let editView = d3.select('#' + trackEdit.attr('id') + '-events'); //編集画面のセレクション
  let measure = 1; // 小節
  let step = 1; // ステップNo
  let rowIndex = 0; // 編集画面の現在行
  let currentEventIndex = 0; // イベント配列の編集開始行
  let cellIndex = 2; // 列インデックス
  let cancelEvent = false; // イベントをキャンセルするかどうか
  let lineBuffer = null; //行バッファ
  const NUM_ROW = 47; // １画面の行数

  function setInput() {
    this.attr('contentEditable', 'true');
    this.on('focus', function () {
      console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
    });
  }

  function setBlur(dest) {
    switch (dest) {
      case 'noteName':
        return function () {
          this.on('blur', function (d) {
            d.setNoteNameToNote(this.innerText);
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          }); // Note
        };
        break;
      case 'note':
        return function () {
          this.on('blur', function (d) {
            let v = parseFloat(this.innerText);
            if (!isNaN(v)) {
              d.note = parseFloat(this.innerText);
              this.parentNode.cells[2].innerText = d.name;
            } else {
              if (d.node) {
                this.innerText = d.note;
                this.parentNode.cells[2].innerText = d.name;
              }
            }
          });
        };
        break;
      case 'step':
        return function () {
          this.on('blur', function (d) {
            let v = parseFloat(this.innerText);
            if (!isNaN(v)) {
              if (d.step != v) {
                track.updateNoteStep(rowIndex + currentEventIndex, d, v);
                drawEvent();
                focusEvent();
              }
            } else {
              if (d.step) {
                this.innerText = d.step;
              } else {
                this.innerText = '';
              }
            }
          });
        };
        break;
    }
    return function () {
      this.on('blur', function (d) {
        let v = parseFloat(this.innerText);
        if (!isNaN(v)) {
          d[dest] = v;
        } else {
          if (d[dest]) {
            this.innerText = d[dest];
          } else {
            this.innerText = '';
          }
        }
      });
    };
  }

  // 既存イベントの表示
  function drawEvent() {
    let evflagment = track.events.slice(currentEventIndex, currentEventIndex + NUM_ROW);
    editView.selectAll('tr').remove();
    let select = editView.selectAll('tr').data(evflagment);
    let enter = select.enter();
    let rows = enter.append('tr').attr('data-index', function (d, i) {
      return i;
    });
    rows.each(function (d, i) {
      let row = d3.select(this);
      //rowIndex = i;
      switch (d.type) {
        case audio.EventType.Note:
          row.append('td').text(d.measure); // Measeure #
          row.append('td').text(d.stepNo); // Step #
          row.append('td').text(d.name).call(setInput) // Note
          .call(setBlur('noteName'));
          row.append('td').text(d.note).call(setInput) // Note #
          .call(setBlur('note'));
          row.append('td').text(d.step).call(setInput) // Step
          .call(setBlur('step'));
          row.append('td').text(d.gate).call(setInput) // Gate
          .call(setBlur('gate'));
          row.append('td').text(d.vel).call(setInput) // Velocity
          .call(setBlur('vel'));
          row.append('td').text(d.com).call(setInput); // Command
          break;
        case audio.EventType.MeasureEnd:
          row.append('td').text(''); // Measeure #
          row.append('td').text(''); // Step #
          row.append('td').attr({ 'colspan': 6, 'tabindex': 0 }).text(' --- (' + track.measures[d.measure].stepTotal + ') --- ').on('focus', function () {
            rowIndex = this.parentNode.rowIndex - 1;
          });
          break;
        case audio.EventType.TrackEnd:
          row.append('td').text(''); // Measeure #
          row.append('td').text(''); // Step #
          row.append('td').attr({ 'colspan': 6, 'tabindex': 0 }).text(' --- Track End --- ').on('focus', function () {
            rowIndex = this.parentNode.rowIndex - 1;
          });
          ;
          break;
      }
    });

    if (rowIndex > evflagment.length - 1) {
      rowIndex = evflagment.length - 1;
    }
  }

  // イベントのフォーカス
  function focusEvent() {
    let evrow = d3.select(editView.node().rows[rowIndex]);
    let ev = evrow.datum();
    switch (ev.type) {
      case audio.EventType.Note:
        editView.node().rows[rowIndex].cells[cellIndex].focus();
        break;
      case audio.EventType.MeasureEnd:
        editView.node().rows[rowIndex].cells[2].focus();
        break;
      case audio.EventType.TrackEnd:
        editView.node().rows[rowIndex].cells[2].focus();
        break;
    }
  }

  // イベントの挿入
  function insertEvent(rowIndex) {
    seqEditor.undoManager.exec({
      exec() {
        this.row = editView.node().rows[rowIndex];
        this.cellIndex = cellIndex;
        this.rowIndex = rowIndex;
        this.exec_();
      },
      exec_() {
        var row = d3.select(editView.node().insertRow(this.rowIndex)).datum(new audio.NoteEvent());
        cellIndex = 2;
        row.append('td'); // Measeure #
        row.append('td'); // Step #
        row.append('td').call(setInput).call(setBlur('noteName'));
        row.append('td').call(setInput) // Note #
        .call(setBlur('note'));
        row.append('td').call(setInput) // Step
        .call(setBlur('step'));
        row.append('td').call(setInput) // Gate
        .call(setBlur('gate'));
        row.append('td').call(setInput) // Velocity
        .call(setBlur('vel'));
        row.append('td').call(setInput); // Command
        row.node().cells[this.cellIndex].focus();
        row.attr('data-new', true);
      },
      redo() {
        this.exec_();
      },
      undo() {
        editView.node().deleteRow(this.rowIndex);
        this.row.cells[this.cellIndex].focus();
      }
    });
  }

  // 新規入力行の確定
  function endNewInput() {
    let down = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    d3.select(editView.node().rows[rowIndex]).attr('data-new', null);
    // 1つ前のノートデータを検索する
    let beforeCells = [];
    let sr = rowIndex - 1;
    while (sr >= 0) {
      var target = d3.select(editView.node().rows[sr]);
      if (target.datum().type === audio.EventType.Note) {
        beforeCells = target.node().cells;
        break;
      }
      --sr;
    }
    // 現在の編集行
    let curRow = editView.node().rows[rowIndex].cells;
    let ev = d3.select(editView.node().rows[rowIndex]).datum();
    // エベントを生成する
    // データが何も入力されていないときは、1つ前のノートデータを複製する。
    // 1つ前のノートデータがないときや不正データの場合は、デフォルト値を代入する。
    let noteNo = 0;
    if (cellIndex == 2) {
      let note = editView.node().rows[rowIndex].cells[cellIndex].innerText || (beforeCells[2] ? beforeCells[2].innerText : 'C 0');
      ev.setNoteNameToNote(note, beforeCells[2] ? beforeCells[2].innerText : '');
      noteNo = ev.note;
    } else {
      noteNo = parseFloat(curRow[3].innerText || (beforeCells[3] ? beforeCells[3].innerText : '60'));
    }
    if (isNaN(noteNo)) noteNo = 60;
    let step = parseFloat(curRow[4].innerText || (beforeCells[4] ? beforeCells[4].innerText : '96'));
    if (isNaN(step)) step = 96;
    let gate = parseFloat(curRow[5].innerText || (beforeCells[5] ? beforeCells[5].innerText : '24'));
    if (isNaN(gate)) gate = 24;
    let vel = parseFloat(curRow[6].innerText || (beforeCells[6] ? beforeCells[6].innerText : '1.0'));
    if (isNaN(vel)) vel = 1.0;
    let com = /*curRow[7].innerText || beforeCells[7]?beforeCells[7].innerText:*/new audio.Command();

    ev.note = noteNo;
    ev.step = step;
    ev.gate = gate;
    ev.vel = vel;
    ev.command = com;
    //            var ev = new audio.NoteEvent(step, noteNo, gate, vel, com);
    // トラックにデータをセット
    track.insertEvent(ev, rowIndex + currentEventIndex);
    ev.playOneshot(track);
    if (down) {
      if (rowIndex == NUM_ROW - 1) {
        ++currentEventIndex;
      } else {
        ++rowIndex;
      }
    }
    // 挿入後、再描画
    drawEvent();
    focusEvent();
  }

  function playOneshot() {
    let ev = track.events[rowIndex + currentEventIndex];
    if (ev.type === audio.EventType.Note) {
      ev.playOneshot(track);
    }
  }

  function addRow(delta) {
    playOneshot();
    rowIndex += delta;
    let rowLength = editView.node().rows.length;
    if (rowIndex >= rowLength) {
      let d = rowIndex - rowLength + 1;
      rowIndex = rowLength - 1;
      if (currentEventIndex + NUM_ROW - 1 < track.events.length - 1) {
        currentEventIndex += d;
        if (currentEventIndex + NUM_ROW - 1 > track.events.length - 1) {
          currentEventIndex = track.events.length - NUM_ROW + 1;
        }
      }
      drawEvent();
    }
    if (rowIndex < 0) {
      let d = rowIndex;
      rowIndex = 0;
      if (currentEventIndex != 0) {
        currentEventIndex += d;
        if (currentEventIndex < 0) {
          currentEventIndex = 0;
        }
        drawEvent();
      }
    }
    focusEvent();
  }

  drawEvent();
  while (true) {
    console.log('new line', rowIndex, track.events.length);
    if (track.events.length == 0 || rowIndex > track.events.length - 1) {}
    keyloop: while (true) {
      let input = yield cancelEvent;
      switch (input.inputCommand.id) {
        case InputCommand.enter.id:
          //Enter
          console.log('CR/LF');
          // 現在の行が新規か編集中か
          let flag = d3.select(editView.node().rows[rowIndex]).attr('data-new');
          if (flag) {
            endNewInput();
          } else {
            //新規編集中の行でなければ、新規入力用行を挿入
            insertEvent(rowIndex);
          }
          cancelEvent = true;
          break;
        case InputCommand.right.id:
          // right Cursor
          {
            cellIndex++;
            let curRow = editView.node().rows;
            if (cellIndex > curRow[rowIndex].cells.length - 1) {
              cellIndex = 2;
              if (rowIndex < curRow.length - 1) {
                if (d3.select(curRow[rowIndex]).attr('data-new')) {
                  endNewInput();
                  break;
                } else {
                  addRow(1);
                  break;
                }
              }
            }
            focusEvent();
            cancelEvent = true;
          }
          break;
        case InputCommand.number.id:
          {
            let curRow = editView.node().rows[rowIndex];
            let curData = d3.select(curRow).datum();
            if (curData.type != audio.EventType.Note) {
              //新規編集中の行でなければ、新規入力用行を挿入
              insertEvent(rowIndex);
              cellIndex = 3;
              let cell = editView.node().rows[rowIndex].cells[cellIndex];
              cell.innerText = input.number;
              let sel = window.getSelection();
              sel.collapse(cell, 1);
              // sel.select();
              cancelEvent = true;
            } else {
              cancelEvent = false;
            }
          }
          break;
        case InputCommand.note.id:
          {
            let curRow = editView.node().rows[rowIndex];
            let curData = d3.select(curRow).datum();
            if (curData.type != audio.EventType.Note) {
              //新規編集中の行でなければ、新規入力用行を挿入
              insertEvent(rowIndex);
              let cell = editView.node().rows[rowIndex].cells[cellIndex];
              cell.innerText = input.note;
              let sel = window.getSelection();
              sel.collapse(cell, 1);
              // sel.select();
              cancelEvent = true;
            } else {
              cancelEvent = false;
            }
          }
          break;
        case InputCommand.left.id:
          // left Cursor
          {
            let curRow = editView.node().rows;
            --cellIndex;
            if (cellIndex < 2) {
              if (rowIndex != 0) {
                if (d3.select(curRow[rowIndex]).attr('data-new')) {
                  endNewInput(false);
                  break;
                }
                cellIndex = editView.node().rows[rowIndex].cells.length - 1;
                addRow(-1);
                break;
              }
            }
            focusEvent();
            cancelEvent = true;
          }
          break;
        case InputCommand.up.id:
          // Up Cursor
          {
            let curRow = editView.node().rows;
            if (d3.select(curRow[rowIndex]).attr('data-new')) {
              endNewInput(false);
            } else {
              addRow(-1);
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.down.id:
          // Down Cursor
          {
            let curRow = editView.node().rows;
            if (d3.select(curRow[rowIndex]).attr('data-new')) {
              endNewInput(false);
            }
            addRow(1);
            cancelEvent = true;
          }
          break;
        case InputCommand.pageDown.id:
          // Page Down キー
          {
            if (currentEventIndex < track.events.length - 1) {
              currentEventIndex += NUM_ROW;
              if (currentEventIndex > track.events.length - 1) {
                currentEventIndex -= NUM_ROW;
              } else {
                drawEvent();
              }
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.pageUp.id:
          // Page Up キー
          {
            if (currentEventIndex > 0) {
              currentEventIndex -= NUM_ROW;
              if (currentEventIndex < 0) {
                currentEventIndex = 0;
              }
              drawEvent();
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        // スクロールアップ
        case InputCommand.scrollUp.id:
          {
            if (currentEventIndex > 0) {
              --currentEventIndex;
              drawEvent();
              focusEvent();
            }
            cancelEvent = true;
          }

          break;
        // スクロールダウン
        case InputCommand.scrollDown.id:
          {
            if (currentEventIndex + NUM_ROW <= track.events.length - 1) {
              ++currentEventIndex;
              drawEvent();
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        // 次の小節に移動
        case InputCommand.measureNext.id:
          {
            let measure = track.events[currentEventIndex + rowIndex].measure;
            if (measure + 1 < track.measures.length) {
              let startIndex = track.measures[measure + 1].startIndex;
              if (currentEventIndex + NUM_ROW > startIndex) {
                rowIndex = startIndex - currentEventIndex;
              } else {
                currentEventIndex = startIndex - rowIndex;
                drawEvent();
              }
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        // 前の小節に移動
        case InputCommand.measureBefore.id:
          {
            let measure = track.events[currentEventIndex + rowIndex].measure;
            if (measure > 0) {
              let startIndex = track.measures[measure - 1].startIndex;
              if (currentEventIndex <= startIndex) {
                rowIndex = startIndex - currentEventIndex;
              } else {
                currentEventIndex = startIndex - rowIndex;
                if (currentEventIndex < 0) {
                  rowIndex -= currentEventIndex;
                  currentEventIndex = 0;
                }
                drawEvent();
              }
            }
            focusEvent();
            cancelEvent = true;
          }
          break;
        // 先頭行に移動
        case InputCommand.home.id:
          if (currentEventIndex > 0) {
            rowIndex = 0;
            currentEventIndex = 0;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 最終行に移動
        case InputCommand.end.id:
          if (currentEventIndex != track.events.length - 1) {
            rowIndex = 0;
            currentEventIndex = track.events.length - 1;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 行削除
        case InputCommand.delete.id:
          {
            if (rowIndex + currentEventIndex == track.events.length - 1) {
              break;
            }
            seqEditor.undoManager.exec({
              exec() {
                this.rowIndex = rowIndex;
                this.currentEventIndex = currentEventIndex;
                this.event = track.events[this.rowIndex];
                this.rowData = track.events[this.currentEventIndex + this.rowIndex];
                editView.node().deleteRow(this.rowIndex);
                this.lineBuffer = lineBuffer;
                lineBuffer = this.event;
                track.deleteEvent(this.currentEventIndex + this.rowIndex);
                drawEvent();
                focusEvent();
              },
              redo() {
                this.lineBuffer = lineBuffer;
                lineBuffer = this.event;
                editView.node().deleteRow(this.rowIndex);
                track.deleteEvent(this.currentEventIndex + this.rowIndex);
                drawEvent();
                focusEvent();
              },
              undo() {
                lineBuffer = this.lineBuffer;
                track.insertEvent(this.event, this.currentEventIndex + this.rowIndex);
                drawEvent();
                focusEvent();
              }
            });
          }
          break;
        // ラインバッファの内容をペーストする
        case InputCommand.linePaste.id:
          {
            if (lineBuffer) {
              seqEditor.undoManager.exec({
                exec() {
                  this.rowIndex = rowIndex;
                  this.lineBuffer = lineBuffer;
                  track.insertEvent(lineBuffer.clone(), rowIndex);
                  drawEvent();
                  focusEvent();
                },
                redo() {
                  track.insertEvent(this.lineBuffer.clone(), this.rowIndex);
                  drawEvent();
                  focusEvent();
                },
                undo() {
                  track.deleteEvent(this.rowIndex);
                  drawEvent();
                  focusEvent();
                }
              });
            }
            cancelEvent = true;
          }
          break;
        // redo  
        case InputCommand.redo.id:
          seqEditor.undoManager.redo();
          cancelEvent = true;
          break;
        // undo 
        case InputCommand.undo.id:
          seqEditor.undoManager.undo();
          cancelEvent = true;
          break;
        // 小節線挿入
        case InputCommand.insertMeasure.id:
          // *
          seqEditor.undoManager.exec({
            exec() {
              this.index = rowIndex + currentEventIndex;
              track.insertEvent(new audio.MeasureEnd(), this.index);
              drawEvent();
              focusEvent();
            },
            redo() {
              track.insertEvent(new audio.MeasureEnd(), this.index);
              drawEvent();
              focusEvent();
            },
            undo() {
              track.deleteEvent(this.index);
              drawEvent();
              focusEvent();
            }
          });
          cancelEvent = true;
          break;
        // デフォルト
        default:
          cancelEvent = false;
          console.log('default');
          break;
      }
    }
  }
}

function showSequenceEditor(d) {
  d3.event.returnValue = false;
  d3.event.preventDefault();
  d3.event.cancelBubble = true;
  if (d.panel && d.panel.isShow) return;
  d.editorInstance = new SequenceEditor(d);
}

},{"./audio":2,"./ui":12,"./undo":13}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Sequencer = exports.NUM_OF_TRACKS = exports.SEQ_STATUS = exports.Track = exports.Measure = exports.NoteEvent = exports.TrackEnd = exports.MeasureEnd = exports.EventType = exports.Command = exports.EventBase = undefined;
exports.setValueAtTime = setValueAtTime;
exports.linearRampToValueAtTime = linearRampToValueAtTime;
exports.exponentialRampToValueAtTime = exponentialRampToValueAtTime;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _eventEmitter = require('./eventEmitter3');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _prop = require('./prop');

var prop = _interopRequireWildcard(_prop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let EventBase = exports.EventBase = function EventBase() {
	let step = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	let name = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

	_classCallCheck(this, EventBase);

	this.step = step;
	this.stepNo = 0;
	this.measure = 0;
	this.name = name;
};

const CommandType = {
	setValueAtTime: 0,
	linearRampToValueAtTime: 1,
	exponentialRampToValueAtTime: 2
};

function setValueAtTime(audioParam, value, time) {
	audioParam.setValueAtTime(value, time);
}

function linearRampToValueAtTime(audioParam, value, time) {
	audioParam.linearRampToValueAtTime(value, time);
}

function exponentialRampToValueAtTime(audioParam, value, time) {
	audioParam.linearRampToValueAtTime(value, time);
}

const commandFuncs = [setValueAtTime, linearRampToValueAtTime, exponentialRampToValueAtTime];

let Command = exports.Command = (function () {
	function Command() {
		let pitchCommand = arguments.length <= 0 || arguments[0] === undefined ? CommandType.setValueAtTime : arguments[0];
		let velocityCommand = arguments.length <= 1 || arguments[1] === undefined ? CommandType.setValueAtTime : arguments[1];

		_classCallCheck(this, Command);

		this.pitchCommand = pitchCommand;
		this.velocityCommand = velocityCommand;
		this.processPitch = commandFuncs[pitchCommand].bind(this);
		this.processVelocity = commandFuncs[velocityCommand].bind(this);
	}

	_createClass(Command, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				pitchCommand: this.pitchCommand,
				velocityCommand: this.velocityCommand
			};
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			return new Command(o.pitchCommand, o.velocityCommand);
		}
	}]);

	return Command;
})();

const EventType = exports.EventType = {
	Note: 0,
	MeasureEnd: 1,
	TrackEnd: 2
};

// 小節線

let MeasureEnd = exports.MeasureEnd = (function (_EventBase) {
	_inherits(MeasureEnd, _EventBase);

	function MeasureEnd() {
		_classCallCheck(this, MeasureEnd);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MeasureEnd).call(this, 0));

		_this.type = EventType.MeasureEnd;
		_this.stepTotal = 0;
		_this.startIndex = 0;
		_this.endIndex = 0;
		return _this;
	}

	_createClass(MeasureEnd, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'MeasureEnd',
				measure: this.measure,
				stepNo: this.stepNo,
				step: this.step,
				type: this.type,
				stepTotal: this.stepTotal,
				startIndex: this.startIndex,
				endIndex: this.endIndex
			};
		}
	}, {
		key: 'clone',
		value: function clone() {
			return new MeasureEnd();
		}
	}, {
		key: 'process',
		value: function process() {}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new MeasureEnd();
			ret.measure = o.measure;
			ret.stepNo = o.stepNo;
			ret.step = o.step;
			ret.stepTotal = o.stepTotal;
			ret.startIndex = o.startIndex;
			ret.endIndex = o.endIndex;
			return ret;
		}
	}]);

	return MeasureEnd;
})(EventBase);

// Track End

let TrackEnd = exports.TrackEnd = (function (_EventBase2) {
	_inherits(TrackEnd, _EventBase2);

	function TrackEnd() {
		_classCallCheck(this, TrackEnd);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(TrackEnd).call(this, 0));

		_this2.type = EventType.TrackEnd;
		return _this2;
	}

	_createClass(TrackEnd, [{
		key: 'process',
		value: function process() {}
	}]);

	return TrackEnd;
})(EventBase);

var Notes = ['C ', 'C#', 'D ', 'D#', 'E ', 'F ', 'F#', 'G ', 'G#', 'A ', 'A#', 'B '];

let NoteEvent = exports.NoteEvent = (function (_EventBase3) {
	_inherits(NoteEvent, _EventBase3);

	function NoteEvent() {
		let step = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		let note = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
		let gate = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
		let vel = arguments.length <= 3 || arguments[3] === undefined ? 0.5 : arguments[3];
		let command = arguments.length <= 4 || arguments[4] === undefined ? new Command() : arguments[4];

		_classCallCheck(this, NoteEvent);

		var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(NoteEvent).call(this, step));

		_this3.transpose_ = 0.0;
		_this3.note = note;
		_this3.gate = gate;
		_this3.vel = vel;
		_this3.command = command;
		_this3.command.event = _this3;
		_this3.type = EventType.Note;
		_this3.setNoteName();
		return _this3;
	}

	_createClass(NoteEvent, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'NoteEvent',
				measure: this.measure,
				stepNo: this.stepNo,
				step: this.step,
				note: this.note,
				gate: this.gate,
				vel: this.vel,
				command: this.command,
				type: this.type
			};
		}
	}, {
		key: 'clone',
		value: function clone() {
			return new NoteEvent(this.step, this.note, this.gate, this.vel, this.command);
		}
	}, {
		key: 'setNoteName',
		value: function setNoteName() {
			let oct = this.note / 12 | 0;
			this.name = Notes[this.note % 12] + oct;
		}
	}, {
		key: 'setNoteNameToNote',
		value: function setNoteNameToNote(noteName) {
			var _this4 = this;

			let defaultNoteName = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

			var matches = noteName.match(/(C#)|(C)|(D#)|(D)|(E)|(F#)|(F)|(G#)|(G)|(A#)|(A)|(B)/i);
			if (matches) {
				var n = matches[0];
				var getNumber = new RegExp('([0-9]{1,2})');
				//      getNumber.compile();
				getNumber.exec(noteName);
				var o = RegExp.$1;
				if (!o) {
					new RegExp('([0-9]{1,2})').exec(defaultNoteName);
					o = RegExp.$1;
					if (!o) {
						return false;
					}
				}
				if (n.length === 1) n += ' ';

				if (Notes.some(function (d, i) {
					if (d === n) {
						_this4.note = parseFloat(i) + parseFloat(o) * 12;
						return true;
					}
				})) {
					return true;
				} else {
					this.setNoteName();
					return false;
				}
			} else {
				this.setNoteName();
				return false;
			}
		}
	}, {
		key: 'calcPitch',
		value: function calcPitch() {
			this.pitch = 440.0 / 32.0 * Math.pow(2.0, (this.note + this.transpose_ - 9) / 12);
		}
	}, {
		key: 'playOneshot',
		value: function playOneshot(track) {
			if (this.note) {
				this.transopse = track.transpose;
				for (let j = 0, je = track.pitches.length; j < je; ++j) {
					track.pitches[j].process(new Command(), this.pitch, audio.ctx.currentTime);
				}

				for (let j = 0, je = track.velocities.length; j < je; ++j) {
					// keyon
					track.velocities[j].process(new Command(), this.vel, audio.ctx.currentTime);
					// keyoff
					track.velocities[j].process(new Command(), 0, audio.ctx.currentTime + 0.25);
				}
			}
		}
	}, {
		key: 'process',
		value: function process(time, track) {
			if (this.note) {
				this.transopse = track.transpose;
				for (let j = 0, je = track.pitches.length; j < je; ++j) {
					track.pitches[j].process(this.command, this.pitch, time);
				}

				for (let j = 0, je = track.velocities.length; j < je; ++j) {
					// keyon
					track.velocities[j].process(this.command, this.vel, time);
					// keyoff
					track.velocities[j].process(this.command, 0, time + this.gate * track.sequencer.stepTime_);
				}
			}
		}
	}, {
		key: 'note',
		get: function () {
			return this.note_;
		},
		set: function (v) {
			this.note_ = v;
			this.calcPitch();
			this.setNoteName();
		}
	}, {
		key: 'transpose',
		set: function (v) {
			if (v != this.transpose_) {
				this.transpose_ = v;
				this.calcPitch();
			}
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new NoteEvent(o.step, o.note, o.gate, o.vel, Command.fromJSON(o.command));
			ret.measure = o.measure;
			ret.stepNo = o.stepNo;
			return ret;
		}
	}]);

	return NoteEvent;
})(EventBase);

let Measure = exports.Measure = function Measure() {
	let startIndex = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	let count = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	let stepTotal = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

	_classCallCheck(this, Measure);

	this.startIndex = startIndex;
	this.count = count;
	this.stepTotal = 0;
};

let Track = exports.Track = (function (_EventEmitter) {
	_inherits(Track, _EventEmitter);

	function Track(sequencer) {
		_classCallCheck(this, Track);

		var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(Track).call(this));

		_this5.events = [];
		_this5.measures = [];
		_this5.measures.push(new Measure());
		_this5.pointer = 0;
		_this5.events.push(new TrackEnd());
		prop.defObservable(_this5, 'step');
		prop.defObservable(_this5, 'end');
		prop.defObservable(_this5, 'name');
		prop.defObservable(_this5, 'transpose');

		_this5.step = 0;
		_this5.end = false;
		_this5.pitches = [];
		_this5.velocities = [];
		_this5.sequencer = sequencer;
		_this5.name = '';
		_this5.transpose = 0;
		return _this5;
	}

	_createClass(Track, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'Track',
				events: this.events,
				step: this.step,
				trackName: this.name,
				transpose: this.transpose
			};
		}
	}, {
		key: 'addEvent',
		value: function addEvent(ev) {
			if (this.events.length > 1) {
				var before = this.events[this.events.length - 2];
				switch (before.type) {
					case EventType.Note:
						ev.stepNo = before.stepNo + 1;
						ev.measure = before.measure;
						break;
					case EventType.MeasureEnd:
						ev.stepNo = 0;
						ev.measure = before.measure + 1;
						break;
				}
			} else {
				ev.stepNo = 0;
				ev.measure = 0;
			}

			switch (ev.type) {
				case EventType.Note:
					++this.measures[ev.measure].count;
					this.measures[ev.measure].stepTotal += ev.step;
					break;
				case EventType.MeasureEnd:
					this.measures.push(new Measure(this.events.length));
					break;
			}

			this.events.splice(this.events.length - 1, 0, ev);
			//this.calcMeasureStepTotal(this.events.length - 2);
		}
	}, {
		key: 'insertEvent',
		value: function insertEvent(ev, index) {
			if (this.events.length > 1 && index != 0) {
				var before = this.events[index - 1];
				switch (before.type) {
					case EventType.Note:
						ev.stepNo = before.stepNo + 1;
						ev.measure = before.measure;
						break;
					case EventType.MeasureEnd:
						ev.stepNo = 0;
						ev.measure = before.measure + 1;
						break;
				}
			} else {
				ev.stepNo = 0;
				ev.measure = 0;
			}

			this.events.splice(index, 0, ev);

			switch (ev.type) {
				case EventType.Note:
					++this.measures[ev.measure].count;
					this.measures[ev.measure].stepTotal += ev.step;
					for (let i = ev.measure + 1, e = this.measures.length; i < e; ++i) {
						++this.measures[i].startIndex;
					}
					break;
				case EventType.MeasureEnd:
					{
						let endIndex = this.measures[ev.measure].startIndex + this.measures[ev.measure].count;
						this.measures[ev.measure].count = this.measures[ev.measure].count - (endIndex - index);

						// ステップの再計算
						{
							let stepTotal = 0;
							for (let i = this.measures[ev.measure].startIndex, e = i + this.measures[ev.measure].count; i < e; ++i) {
								stepTotal += this.events[i].step;
							}
							this.measures[ev.measure].stepTotal = stepTotal;
						}
						this.measures.splice(ev.measure + 1, 0, new Measure(index + 1, endIndex - index));
						{
							let stepTotal = 0;
							for (let i = this.measures[ev.measure + 1].startIndex, e = i + this.measures[ev.measure + 1].count; i < e; ++i) {
								stepTotal += this.events[i].step;
							}
							this.measures[ev.measure + 1].stepTotal = stepTotal;
						}

						if (ev.measure + 2 < this.measures.length) {
							for (let i = ev.measure + 2, e = this.measures.length; i < e; ++i) {
								++this.measures[i].startIndex;
							}
						}
					}
					break;
			}

			this.updateStep_(index, ev);
			//this.calcMeasureStepTotal(index);
		}
	}, {
		key: 'updateNoteStep',
		value: function updateNoteStep(index, ev, newStep) {
			let delta = newStep - ev.step;
			ev.step = newStep;
			this.updateStep__(index);
			this.measures[ev.measure].stepTotal += delta;
		}
	}, {
		key: 'updateStep_',
		value: function updateStep_(index, ev) {
			if (ev.type == EventType.MeasureEnd) {
				this.updateStepAndMeasure__(index);
			} else {
				this.updateStep__(index);
			}
		}
	}, {
		key: 'updateStep__',
		value: function updateStep__(index) {
			for (let i = index + 1, e = this.events.length; i < e; ++i) {
				let before = this.events[i - 1];
				let current = this.events[i];
				switch (before.type) {
					case EventType.Note:
						current.stepNo = before.stepNo + 1;
						current.measure = before.measure;
						break;
					case EventType.MeasureEnd:
						break;
						break;
				}
			}
		}
	}, {
		key: 'updateStepAndMeasure__',
		value: function updateStepAndMeasure__(index) {
			for (let i = index + 1, e = this.events.length; i < e; ++i) {
				let before = this.events[i - 1];
				let current = this.events[i];
				switch (before.type) {
					case EventType.Note:
						current.stepNo = before.stepNo + 1;
						current.measure = before.measure;
						break;
					case EventType.MeasureEnd:
						current.stepNo = 0;
						current.measure = before.measure + 1;
						break;
				}
			}
		}

		// イベントの削除 

	}, {
		key: 'deleteEvent',
		value: function deleteEvent(index) {
			var ev = this.events[index];
			this.events.splice(index, 1);
			if (index == 0) {
				this.events[0].measure = 1;
				this.events[0].stepNo = 1;
				if (this.events.length > 1) {
					this.updateStep_(1, ev);
				}
			} else if (index <= this.events.length - 1) {
				this.updateStep_(index - 1, ev);
			}
			//this.calcMeasureStepTotal(index);

			switch (ev.type) {
				case EventType.MeasureEnd:
					{
						if (ev.measures - 1 >= 0) {
							this.measures[ev.measure - 1].count += this.measures[ev.measure].count;
						} else {
							let target = this.measures[ev.measure + 1];
							let src = this.measures[ev.measure];
							target.startIndex = src.startIndex;
							target.count += src.count;
							target.stepTotal = 0;
							for (let i = target.startIndex, e = i + target.count; i < e; ++i) {
								target.stepTotal += this.events[i].step;
							}
						}
						this.measures.splice(ev.measure, 1);
						for (let i = ev.measure + 1, e = this.measures.length; i < e; ++i) {
							--this.measures[i].startIndex;
						}
					}
					break;
				case EventType.Note:
					{
						let m = this.measures[ev.measure];
						--m.count;
						m.stepTotal -= ev.step;
						for (let i = ev.measure + 1, e = this.measures.length; i < e; ++i) {
							--this.measures[i].startIndex;
						}
					}
					break;
			}
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o, sequencer) {
			let ret = new Track(sequencer);
			ret.step = o.step;
			ret.name = o.trackName;
			ret.transpose = o.transpose;
			o.events.forEach(function (d) {
				switch (d.type) {
					case EventType.Note:
						ret.addEvent(NoteEvent.fromJSON(d));
						break;
					case EventType.MeasureEnd:
						ret.addEvent(MeasureEnd.fromJSON(d));
						break;
					case EventType.TrackEnd:
						//何もしない
						break;
				}
			});
			return ret;
		}
	}]);

	return Track;
})(_eventEmitter2.default);

const SEQ_STATUS = exports.SEQ_STATUS = {
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2
};

const NUM_OF_TRACKS = exports.NUM_OF_TRACKS = 4;

let Sequencer = exports.Sequencer = (function (_EventEmitter2) {
	_inherits(Sequencer, _EventEmitter2);

	function Sequencer() {
		_classCallCheck(this, Sequencer);

		var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(Sequencer).call(this));

		prop.defObservable(_this6, 'bpm');
		prop.defObservable(_this6, 'tpb');
		prop.defObservable(_this6, 'beat');
		prop.defObservable(_this6, 'bar');
		prop.defObservable(_this6, 'repeat');

		_this6.bpm = 120.0; // tempo

		_this6.tpb = 96.0; // 四分音符の解像度
		_this6.beat = 4;
		_this6.bar = 4; //
		_this6.repeat = false;
		_this6.tracks = [];
		_this6.numberOfInputs = 0;
		_this6.numberOfOutputs = 0;
		_this6.name = 'Sequencer';
		for (var i = 0; i < NUM_OF_TRACKS; ++i) {
			_this6.tracks.push(new Track(_this6));
			_this6['trk' + i + 'g'] = new audio.ParamView(null, 'trk' + i + 'g', true);
			_this6['trk' + i + 'g'].track = _this6.tracks[i];
			_this6['trk' + i + 'g'].type = 'gate';

			_this6['trk' + i + 'p'] = new audio.ParamView(null, 'trk' + i + 'p', true);
			_this6['trk' + i + 'p'].track = _this6.tracks[i];
			_this6['trk' + i + 'p'].type = 'pitch';
		}
		_this6.startTime_ = 0;
		_this6.currentTime_ = 0;
		_this6.currentMeasure_ = 0;
		_this6.calcStepTime();
		_this6.status_ = SEQ_STATUS.STOPPED;

		//
		_this6.on('bpm_changed', function () {
			_this6.calcStepTime();
		});
		_this6.on('tpb_changed', function () {
			_this6.calcStepTime();
		});

		Sequencer.sequencers.push(_this6);
		if (Sequencer.added) {
			Sequencer.added();
		}
		return _this6;
	}

	_createClass(Sequencer, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'Sequencer',
				bpm: this.bpm,
				tpb: this.tpb,
				beat: this.beat,
				bar: this.bar,
				tracks: this.tracks,
				repeat: this.repeat
			};
		}
	}, {
		key: 'dispose',
		value: function dispose() {
			for (var i = 0; i < Sequencer.sequencers.length; ++i) {
				if (this === Sequencer.sequencers[i]) {
					Sequencer.sequencers.splice(i, 1);
					break;
				}
			}

			if (Sequencer.sequencers.length == 0) {
				if (Sequencer.empty) {
					Sequencer.empty();
				}
			}
		}
	}, {
		key: 'calcStepTime',
		value: function calcStepTime() {
			this.stepTime_ = 60.0 / (this.bpm * this.tpb);
		}
	}, {
		key: 'start',
		value: function start(time) {
			if (this.status_ == SEQ_STATUS.STOPPED || this.status_ == SEQ_STATUS.PAUSED) {
				this.currentTime_ = time || audio.ctx.currentTime();
				this.startTime_ = this.currentTime_;
				this.status_ = SEQ_STATUS.PLAYING;
			}
		}
	}, {
		key: 'stop',
		value: function stop() {
			if (this.status_ == SEQ_STATUS.PLAYING || this.status_ == SEQ_STATUS.PAUSED) {
				this.tracks.forEach(function (d) {
					d.pitches.forEach(function (p) {
						p.stop();
					});
					d.velocities.forEach(function (v) {
						v.stop();
					});
				});

				this.status_ = SEQ_STATUS.STOPPED;
				this.reset();
			}
		}
	}, {
		key: 'pause',
		value: function pause() {
			if (this.status_ == SEQ_STATUS.PLAYING) {
				this.status_ = SEQ_STATUS.PAUSED;
			}
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.startTime_ = 0;
			this.currentTime_ = 0;
			this.tracks.forEach(function (track) {
				track.end = !track.events.length;
				track.step = 0;
				track.pointer = 0;
			});
			this.calcStepTime();
		}
		// シーケンサーの処理

	}, {
		key: 'process',
		value: function process(time) {
			this.currentTime_ = time || audio.ctx.currentTime();
			var currentStep = (this.currentTime_ - this.startTime_ + 0.1) / this.stepTime_;
			let endcount = 0;
			for (var i = 0, l = this.tracks.length; i < l; ++i) {
				var track = this.tracks[i];
				if (!track.end) {
					while (track.step <= currentStep && !track.end) {
						if (track.pointer >= track.events.length) {
							track.end = true;
							break;
						} else {
							var event = track.events[track.pointer++];
							var playTime = track.step * this.stepTime_ + this.startTime_;
							event.process(playTime, track);
							track.step += event.step;
							//					console.log(track.pointer,track.events.length,track.events[track.pointer],track.step,currentStep,this.currentTime_,playTime);
						}
					}
				} else {
						++endcount;
					}
			}
			if (endcount == this.tracks.length) {
				this.stop();
			}
		}

		// 接続

	}, {
		key: 'connect',
		value: function connect(c) {
			var track = c.from.param.track;
			if (c.from.param.type === 'pitch') {
				track.pitches.push(Sequencer.makeProcess(c));
			} else {
				track.velocities.push(Sequencer.makeProcess(c));
			}
		}

		// 削除

	}, {
		key: 'disconnect',
		value: function disconnect(c) {
			var track = c.from.param.track;
			for (var i = 0; i < track.pitches.length; ++i) {
				if (c.to.node === track.pitches[i].to.node && c.to.param === track.pitches[i].to.param) {
					track.pitches.splice(i--, 1);
					break;
				}
			}

			for (var i = 0; i < track.velocities.length; ++i) {
				if (c.to.node === track.velocities[i].to.node && c.to.param === track.velocities[i].to.param) {
					track.pitches.splice(i--, 1);
					break;
				}
			}
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new Sequencer();
			ret.bpm = o.bpm;
			ret.tpb = o.tpb;
			ret.beat = o.beat;
			ret.bar = o.bar;
			ret.repeat = o.repeat;
			//ret.tracks.length = 0;
			o.tracks.forEach(function (d, i) {
				ret.tracks[i] = Track.fromJSON(d, ret);
				ret['trk' + i + 'g'].track = ret.tracks[i];
				ret['trk' + i + 'p'].track = ret.tracks[i];
			});
			ret.calcStepTime();
			return ret;
		}
	}, {
		key: 'makeProcess',
		value: function makeProcess(c) {
			if (c.to.param instanceof audio.ParamView) {
				return {
					to: c.to,
					process: function (com, v, t) {
						c.to.node.audioNode.process(c.to, com, v, t);
					},
					stop: function () {
						c.to.node.audioNode.stop(c.to);
					}
				};
			}
			var process;
			if (c.to.param.type === 'pitch') {
				process = function (com, v, t) {
					com.processPitch(c.to.param.audioParam, v, t);
				};
			} else {
				process = function (com, v, t) {
					com.processVelocity(c.to.param.audioParam, v, t);
				};
			}
			return {
				to: c.to,
				process: process,
				stop: function () {
					c.to.param.audioParam.cancelScheduledValues(0);
				}
			};
		}
	}, {
		key: 'exec',
		value: function exec() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING) {
				window.requestAnimationFrame(Sequencer.exec);
				let endcount = 0;
				for (var i = 0, e = Sequencer.sequencers.length; i < e; ++i) {
					var seq = Sequencer.sequencers[i];
					if (seq.status_ == SEQ_STATUS.PLAYING) {
						seq.process(audio.ctx.currentTime);
					} else if (seq.status_ == SEQ_STATUS.STOPPED) {
						++endcount;
					}
				}
				if (endcount == Sequencer.sequencers.length) {
					Sequencer.stopSequences();
					if (Sequencer.stopped) {
						Sequencer.stopped();
					}
				}
			}
		}

		// シーケンス全体のスタート

	}, {
		key: 'startSequences',
		value: function startSequences(time) {
			if (Sequencer.sequencers.status == SEQ_STATUS.STOPPED || Sequencer.sequencers.status == SEQ_STATUS.PAUSED) {
				Sequencer.sequencers.forEach(function (d) {
					d.start(time);
				});
				Sequencer.sequencers.status = SEQ_STATUS.PLAYING;
				Sequencer.exec();
			}
		}
		// シーケンス全体の停止

	}, {
		key: 'stopSequences',
		value: function stopSequences() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING || Sequencer.sequencers.status == SEQ_STATUS.PAUSED) {
				Sequencer.sequencers.forEach(function (d) {
					d.stop();
				});
				Sequencer.sequencers.status = SEQ_STATUS.STOPPED;
			}
		}

		// シーケンス全体のポーズ	

	}, {
		key: 'pauseSequences',
		value: function pauseSequences() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING) {
				Sequencer.sequencers.forEach(function (d) {
					d.pause();
				});
				Sequencer.sequencers.status = SEQ_STATUS.PAUSED;
			}
		}
	}]);

	return Sequencer;
})(_eventEmitter2.default);

Sequencer.sequencers = [];
Sequencer.sequencers.status = SEQ_STATUS.STOPPED;

},{"./audio":2,"./eventEmitter3":6,"./prop":8}],12:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Panel = exports.pointSize = exports.nodeWidth = exports.nodeHeight = undefined;

var _uuid = require('./uuid.core');

var _uuid2 = _interopRequireDefault(_uuid);

var _EventEmitter2 = require('./EventEmitter3');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

const nodeHeight = exports.nodeHeight = 50;
const nodeWidth = exports.nodeWidth = 100;
const pointSize = exports.pointSize = 16;

// panel window

let Panel = exports.Panel = (function (_EventEmitter) {
	_inherits(Panel, _EventEmitter);

	function Panel(sel, prop) {
		_classCallCheck(this, Panel);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Panel).call(this));

		if (!prop || !prop.id) {
			prop = prop ? (prop.id = 'id-' + _uuid2.default.generate(), prop) : { id: 'id-' + _uuid2.default.generate() };
		}
		_this.id = prop.id;
		sel = sel || d3.select('#content');
		_this.selection = sel.append('div').attr(prop).attr('class', 'panel').datum(_this);

		// パネル用Dragその他

		_this.header = _this.selection.append('header').call(_this.drag);
		_this.article = _this.selection.append('article');
		_this.footer = _this.selection.append('footer');
		_this.selection.append('div').classed('panel-close', true).on('click', function () {
			_this.emit('dispose');
			_this.dispose();
		});

		return _this;
	}

	_createClass(Panel, [{
		key: 'dispose',
		value: function dispose() {
			this.selection.remove();
			this.selection = null;
		}
	}, {
		key: 'show',
		value: function show() {
			this.selection.style('visibility', 'visible');
			this.emit('show');
		}
	}, {
		key: 'hide',
		value: function hide() {
			this.selection.style('visibility', 'hidden');
			this.emit('hide');
		}
	}, {
		key: 'node',
		get: function () {
			return this.selection.node();
		}
	}, {
		key: 'x',
		get: function () {
			return parseFloat(this.selection.style('left'));
		},
		set: function (v) {
			this.selection.style('left', v + 'px');
		}
	}, {
		key: 'y',
		get: function () {
			return parseFloat(this.selection.style('top'));
		},
		set: function (v) {
			this.selection.style('top', v + 'px');
		}
	}, {
		key: 'width',
		get: function () {
			return parseFloat(this.selection.style('width'));
		},
		set: function (v) {
			this.selection.style('width', v + 'px');
		}
	}, {
		key: 'height',
		get: function () {
			return parseFloat(this.selection.style('height'));
		},
		set: function (v) {
			this.selection.style('height', v + 'px');
		}
	}, {
		key: 'isShow',
		get: function () {
			return this.selection && this.selection.style('visibility') === 'visible';
		}
	}]);

	return Panel;
})(_EventEmitter3.default);

Panel.prototype.drag = d3.behavior.drag().on('dragstart', function (d) {
	console.log(d);
	var sel = d3.select('#' + d.id);

	d3.select('#content').append('div').attr({ id: 'panel-dummy-' + d.id,
		'class': 'panel panel-dummy' }).style({
		left: sel.style('left'),
		top: sel.style('top'),
		width: sel.style('width'),
		height: sel.style('height')
	});
}).on("drag", function (d) {
	var dummy = d3.select('#panel-dummy-' + d.id);

	var x = parseFloat(dummy.style('left')) + d3.event.dx;
	var y = parseFloat(dummy.style('top')) + d3.event.dy;

	dummy.style({ 'left': x + 'px', 'top': y + 'px' });
}).on('dragend', function (d) {
	var sel = d3.select('#' + d.id);
	var dummy = d3.select('#panel-dummy-' + d.id);
	sel.style({ 'left': dummy.style('left'), 'top': dummy.style('top') });
	d.emit('dragend');
	dummy.remove();
});

},{"./EventEmitter3":1,"./uuid.core":14}],13:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UndoManager = undefined;

var _EventEmitter2 = require('./EventEmitter3');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

let UndoManager = exports.UndoManager = (function (_EventEmitter) {
  _inherits(UndoManager, _EventEmitter);

  function UndoManager() {
    _classCallCheck(this, UndoManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UndoManager).call(this));

    _this.buffer = [];
    _this.index = -1;
    return _this;
  }

  _createClass(UndoManager, [{
    key: 'clear',
    value: function clear() {
      this.buffer.length = 0;
      this.index = -1;
      this.emit('cleared');
    }
  }, {
    key: 'exec',
    value: function exec(command) {
      command.exec();
      if (this.index + 1 < this.buffer.length) {
        this.buffer.length = this.index + 1;
      }
      this.buffer.push(command);
      ++this.index;
      this.emit('executed');
    }
  }, {
    key: 'redo',
    value: function redo() {
      if (this.index + 1 < this.buffer.length) {
        ++this.index;
        var command = this.buffer[this.index];
        command.redo();
        this.emit('redid');
        if (this.index + 1 == this.buffer.length) {
          this.emit('redoEmpty');
        }
      }
    }
  }, {
    key: 'undo',
    value: function undo() {
      if (this.buffer.length > 0 && this.index >= 0) {
        var command = this.buffer[this.index];
        command.undo();
        --this.index;
        this.emit('undid');
        if (this.index < 0) {
          this.index = -1;
          this.emit('undoEmpty');
        }
      }
    }
  }]);

  return UndoManager;
})(_EventEmitter3.default);

var undoManager = new UndoManager();
exports.default = undoManager;

},{"./EventEmitter3":1}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = UUID;
/*
 Version: core-1.0
 The MIT License: Copyright (c) 2012 LiosK.
*/
function UUID() {}UUID.generate = function () {
  var a = UUID._gri,
      b = UUID._ha;return b(a(32), 8) + "-" + b(a(16), 4) + "-" + b(16384 | a(12), 4) + "-" + b(32768 | a(14), 4) + "-" + b(a(48), 12);
};UUID._gri = function (a) {
  return 0 > a ? NaN : 30 >= a ? 0 | Math.random() * (1 << a) : 53 >= a ? (0 | 1073741824 * Math.random()) + 1073741824 * (0 | Math.random() * (1 << a - 30)) : NaN;
};UUID._ha = function (a, b) {
  for (var c = a.toString(16), d = b - c.length, e = "0"; 0 < d; d >>>= 1, e += e) d & 1 && (c = e + c);return c;
};

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xcbG9hZGVyU2F2ZXIuanMiLCJzcmNcXHByb3AuanMiLCJzcmNcXHNjcmlwdC5qcyIsInNyY1xcc2VxdWVuY2VFZGl0b3IuanMiLCJzcmNcXHNlcXVlbmNlci5qcyIsInNyY1xcdWkuanMiLCJzcmNcXHVuZG8uanMiLCJzcmNcXHV1aWQuY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7Ozs7O0FBQVksQ0FBQzs7OztrQkFpQ1csWUFBWTtBQXZCcEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFVBQVUsR0FBRyxHQUFHLEdBQUcsS0FBSzs7Ozs7Ozs7OztBQUFDLEFBVS9ELFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO0FBQzdCLE1BQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2IsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksS0FBSyxDQUFDO0NBQzNCOzs7Ozs7Ozs7QUFBQSxBQVNjLFNBQVMsWUFBWSxHQUFHOzs7Ozs7OztBQUF3QixBQVEvRCxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTOzs7Ozs7Ozs7O0FBQUMsQUFVM0MsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUNuRSxNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLO01BQ3JDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWxELE1BQUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUMvQixNQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQzFCLE1BQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUV4QyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNuRSxNQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUN6Qjs7QUFFRCxTQUFPLEVBQUUsQ0FBQztDQUNYOzs7Ozs7Ozs7QUFBQyxBQVNGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ3JFLE1BQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDOztBQUV0RCxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU07TUFDdEIsSUFBSTtNQUNKLENBQUMsQ0FBQzs7QUFFTixNQUFJLFVBQVUsS0FBSyxPQUFPLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsUUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU5RSxZQUFRLEdBQUc7QUFDVCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDOUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBGLGNBQVEsR0FBRztBQUNULGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDOUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ2xFO0FBQ0UsY0FBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdELGdCQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUM1Qjs7QUFFRCxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUFBLE9BQ3JEO0tBQ0Y7R0FDRjs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7Ozs7O0FBQUMsQUFVRixZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUMxRCxNQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQztNQUN0QyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztBQUUxQyxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUNoRDtBQUNILFFBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUM1QixDQUFDO0dBQ0g7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7Ozs7OztBQUFDLEFBVUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7QUFDOUQsTUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxJQUFJLEVBQUUsSUFBSSxDQUFDO01BQzVDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQ2hEO0FBQ0gsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQzVCLENBQUM7R0FDSDs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7Ozs7Ozs7QUFBQyxBQVlGLFlBQVksQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUN4RixNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQzs7QUFFckQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDN0IsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsTUFBSSxFQUFFLEVBQUU7QUFDTixRQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDaEIsVUFDSyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFDbEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQUFBQyxJQUN4QixPQUFPLElBQUksU0FBUyxDQUFDLE9BQU8sS0FBSyxPQUFPLEFBQUMsRUFDN0M7QUFDQSxjQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ3hCO0tBQ0YsTUFBTTtBQUNMLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUQsWUFDSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFDckIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQUFBQyxJQUMzQixPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLEFBQUMsRUFDaEQ7QUFDQSxnQkFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQjtPQUNGO0tBQ0Y7R0FDRjs7Ozs7QUFBQSxBQUtELE1BQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUNqQixRQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7R0FDOUQsTUFBTTtBQUNMLFdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUMxQjs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7OztBQUFDLEFBUUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLGtCQUFrQixDQUFDLEtBQUssRUFBRTtBQUM3RSxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksQ0FBQzs7QUFFL0IsTUFBSSxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLEtBQzNELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV0RCxTQUFPLElBQUksQ0FBQztDQUNiOzs7OztBQUFDLEFBS0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFDbkUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFOzs7OztBQUFDLEFBSy9ELFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFNBQVMsZUFBZSxHQUFHO0FBQ2xFLFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7O0FBQUMsQUFLRixZQUFZLENBQUMsUUFBUSxHQUFHLE1BQU07Ozs7O0FBQUMsQUFLL0IsSUFBSSxXQUFXLEtBQUssT0FBTyxNQUFNLEVBQUU7QUFDakMsUUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7Q0FDL0I7OztBQ3RRRCxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUlHLEtBQUssR0FBTCxLQUFLO0FBQWQsU0FBUyxLQUFLLEdBQUUsRUFBRSxDQUFDOzs7QUNKMUIsWUFBWSxDQUFDOzs7Ozs7OztRQU1HLE1BQU0sR0FBTixNQUFNO1FBRU4sZ0JBQWdCLEdBQWhCLGdCQUFnQjtRQUloQixhQUFhLEdBQWIsYUFBYTtRQXNCYixjQUFjLEdBQWQsY0FBYzs7Ozs7Ozs7SUFoQ2xCLEVBQUU7Ozs7Ozs7Ozs7OztBQUVkLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNULElBQUksR0FBRyxXQUFILEdBQUcsWUFBQSxDQUFDO0FBQ1IsU0FBUyxNQUFNLENBQUMsQ0FBQyxFQUFDO0FBQUMsU0FEZixHQUFHLEdBQ1ksR0FBRyxHQUFHLENBQUMsQ0FBQztDQUFDOztBQUU1QixTQUFTLGdCQUFnQixHQUFFO0FBQ2hDLFFBQU8sT0FBTyxDQUFDO0NBQ2hCOztBQUVNLFNBQVMsYUFBYSxDQUFDLENBQUMsRUFDL0I7QUFDRSxLQUFHLENBQUMsR0FBRyxPQUFPLEVBQUM7QUFDYixTQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ1osSUFBRSxPQUFPLENBQUM7RUFDWDtDQUNGOztJQUVZLFlBQVksV0FBWixZQUFZLEdBQ3hCLFNBRFksWUFBWSxHQUN3RDtLQUFwRSxDQUFDLHlEQUFHLENBQUM7S0FBRSxDQUFDLHlEQUFHLENBQUM7S0FBQyxLQUFLLHlEQUFHLEVBQUUsQ0FBQyxTQUFTO0tBQUMsTUFBTSx5REFBRyxFQUFFLENBQUMsVUFBVTtLQUFDLElBQUkseURBQUcsRUFBRTs7dUJBRGxFLFlBQVk7O0FBRXZCLEtBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFFO0FBQ1osS0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUU7QUFDWixLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBRTtBQUNwQixLQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBRTtBQUN0QixLQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNqQjs7QUFHSyxNQUFNLHNCQUFzQixXQUF0QixzQkFBc0IsR0FBRyxDQUFDLENBQUM7QUFDakMsTUFBTSxtQkFBbUIsV0FBbkIsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLE1BQU0sa0JBQWtCLFdBQWxCLGtCQUFrQixHQUFHLENBQUMsQ0FBQzs7QUFFN0IsU0FBUyxjQUFjLENBQUMsS0FBSyxFQUFDLENBQUMsRUFBQztBQUN0QyxPQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBQyxhQUFhLEVBQUM7QUFDeEMsWUFBVSxFQUFFLEtBQUs7QUFDakIsY0FBWSxFQUFFLEtBQUs7QUFDbkIsVUFBUSxFQUFDLEtBQUs7QUFDZCxPQUFLLEVBQUUsQ0FBQztFQUNSLENBQUMsQ0FBQztDQUNKOztJQUVZLGNBQWMsV0FBZCxjQUFjO1dBQWQsY0FBYzs7QUFDMUIsVUFEWSxjQUFjLENBQ2QsYUFBYSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7d0JBRDNCLGNBQWM7O3FFQUFkLGNBQWMsYUFFbkIsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsU0FBUyxFQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUMsSUFBSTs7QUFDeEMsUUFBSyxFQUFFLEdBQUcsZUFBSyxRQUFRLEVBQUUsQ0FBQztBQUMxQixRQUFLLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDeEIsUUFBSyxhQUFhLEdBQUcsYUFBYSxDQUFDOztFQUNuQzs7UUFOVyxjQUFjO0dBQVMsWUFBWTs7SUFTbkMsU0FBUyxXQUFULFNBQVM7V0FBVCxTQUFTOztBQUNyQixVQURZLFNBQVMsQ0FDVCxhQUFhLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBRTt3QkFEN0IsU0FBUzs7c0VBQVQsU0FBUyxhQUVkLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLFNBQVMsRUFBQyxFQUFFLENBQUMsU0FBUyxFQUFDLElBQUk7O0FBQ3hDLFNBQUssRUFBRSxHQUFHLGVBQUssUUFBUSxFQUFFLENBQUM7QUFDMUIsU0FBSyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ25DLFNBQUssUUFBUSxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUM7O0VBQ2xDOztRQU5XLFNBQVM7R0FBUyxZQUFZOztJQVU5QixhQUFhLFdBQWIsYUFBYTtXQUFiLGFBQWE7O0FBQ3pCLFVBRFksYUFBYSxDQUNiLFNBQVMsRUFBQyxNQUFNLEVBQzVCO3dCQUZZLGFBQWE7O3NFQUFiLGFBQWE7OztBQUt4QixTQUFLLEVBQUUsR0FBRyxlQUFLLFFBQVEsRUFBRSxDQUFDO0FBQzFCLFNBQUssU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMzQixTQUFLLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLFNBQUssV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN0QixTQUFLLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsU0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE1BQUksT0FBTyxHQUFHLENBQUM7TUFBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOztBQUU3QixTQUFLLFNBQVMsR0FBRyxJQUFJOzs7QUFBQyxBQUd0QixPQUFLLElBQUksQ0FBQyxJQUFJLFNBQVMsRUFBRTtBQUN4QixPQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsRUFBRTs7SUFFdkMsTUFBTTtBQUNOLFNBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQ3JDLFVBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLFVBQVUsRUFBRTtBQUN2QyxjQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksY0FBYyxTQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRCxjQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLGNBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQUMsQ0FBQyxFQUFHO0FBQ3RCLGVBQU87QUFDTixhQUFJLEVBQUMsQ0FBQztBQUNOLGNBQUssRUFBQztpQkFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUs7VUFBQTtBQUM5QixjQUFLLEVBQUMsVUFBQyxDQUFDLEVBQUk7QUFBQyxXQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7VUFBQztBQUNyQyxjQUFLLEVBQUMsQ0FBQztBQUNQLGFBQUksUUFBSztTQUNULENBQUE7UUFDRCxDQUFBLENBQUUsT0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDYixjQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBSSxFQUFFLEdBQUcsT0FBTyxFQUFFLEFBQUMsQ0FBQztPQUM3QixNQUFNLElBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLFNBQVMsRUFBQztBQUMzQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsU0FBTyxDQUFDO0FBQ2xDLGNBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFdBQUcsT0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUM7QUFDbkIsZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksRUFBRSxHQUFHLFFBQVEsRUFBRSxBQUFDLENBQUM7QUFDOUIsZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBSyxLQUFLLENBQUM7QUFDdkIsZUFBSyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNO0FBQ04sZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxBQUFDLENBQUM7QUFDN0IsZUFBSyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQjtPQUNELE1BQU07QUFDTixjQUFLLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN2QjtNQUNELE1BQU07QUFDTixVQUFJLElBQUksR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNuRSxVQUFHLENBQUMsSUFBSSxFQUFDO0FBQ1IsV0FBSSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxPQUFLLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDcEU7QUFDRCxVQUFHLENBQUMsSUFBSSxFQUFDO0FBQ1IsV0FBSSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxPQUFLLFNBQVMsRUFBQyxDQUFDLENBQUMsQ0FBQztPQUN6RDtBQUNELFVBQUksS0FBSyxHQUFHLEVBQUU7OztBQUFDLEFBR2IsV0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQUMsQ0FBQztjQUFLLE9BQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUFBLENBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7OztBQUFDLEFBR3ZELFVBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFDO0FBQzVCLFlBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFBRSxlQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBRSxDQUFBLENBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztPQUNqRTs7QUFFRCxXQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDbkMsV0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWTs7OztBQUFDLEFBSXZDLFlBQU0sQ0FBQyxjQUFjLFNBQU8sQ0FBQyxFQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVyQyxXQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNmLFdBQUssQ0FBQyxJQUFJLFNBQU8sQ0FBQzs7QUFFbEIsVUFBRyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLEFBQUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQU0sT0FBTyxFQUFDO0FBQ3BHLGNBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN4QjtNQUNEO0tBQ0Q7R0FDRDs7QUFFRCxTQUFLLFdBQVcsR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLE1BQUksV0FBVyxHQUFHLENBQUMsT0FBTyxHQUFHLE9BQUssY0FBYyxDQUFBLEdBQUksRUFBRSxDQUFFO0FBQ3hELE1BQUksWUFBWSxHQUFHLENBQUMsUUFBUSxHQUFHLE9BQUssZUFBZSxDQUFBLEdBQUksRUFBRSxDQUFDO0FBQzFELFNBQUssWUFBWSxHQUFHLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEMsU0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFLLE1BQU0sRUFBQyxXQUFXLEVBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0QsU0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsU0FBSyxVQUFVLEdBQUcsc0JBQXNCO0FBQUMsQUFDekMsU0FBSyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFNBQUssTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLGdCQUFXLENBQUM7O0VBQ3JDOztjQTVGVyxhQUFhOzsyQkE4RmhCO0FBQ04sT0FBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsTUFBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2pCLE1BQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqQixNQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDZixNQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDbkIsTUFBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQy9CLE9BQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUM7QUFDdkIsT0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ2hDLE1BQU07QUFDTCxPQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBRztBQUN2QixTQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUM7QUFDUCxTQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7TUFDOUI7S0FDRixDQUFDLENBQUM7SUFDSjtBQUNELFVBQU8sR0FBRyxDQUFDO0dBQ1o7Ozs7Ozt5QkFHWSxJQUFJLEVBQUU7QUFDbEIsT0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ2xCO0FBQ0MsVUFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNoQzs7QUFBQSxBQUVELFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUN6RCxRQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ3pDLFNBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUM7QUFDekIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztNQUN6QjtBQUNELGtCQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN4QztJQUNEOztBQUVELFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQy9ELFFBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxRQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7QUFDL0Msa0JBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0Isa0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0M7SUFDRDtHQUNGOzs7Ozs7dUNBRzJCO0FBQ3pCLGdCQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRztBQUN2QyxRQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFDO0FBQ3hCLFNBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDMUI7QUFDRCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM5RCxTQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsU0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQzlDLG1CQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLG1CQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDO01BQzlDO0tBQ0Y7SUFDRixDQUFDLENBQUM7QUFDSCxnQkFBYSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0dBQ3JDOzs7Ozs7OEJBR2lCLEdBQUcsRUFBRTtBQUN2QixPQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLFNBQVMsRUFBRTtBQUN4QyxPQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTs7QUFFeEIsUUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssWUFBWSxjQUFjLEVBQUU7O0FBRTNDLFNBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7O0FBRW5CLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDNUUsTUFBTTs7QUFFTixTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO01BQzVEO0tBQ0UsTUFBTTs7QUFFVCxTQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFOztBQUVuQixVQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLFNBQVMsRUFBRTtBQUN4QyxVQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3hDLE1BQU07QUFDTixXQUFJO0FBQ0gsV0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1gsZUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmO09BQ0Q7TUFDRCxNQUFNOztBQUVOLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQzNFO0tBQ0Q7SUFDRCxNQUFNOztBQUVOLFFBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7O0FBRW5CLFFBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUUsTUFBTTs7QUFFTixRQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzFEO0lBQ0Q7R0FDRDs7Ozs7OzZCQUdpQixLQUFLLEVBQUMsR0FBRyxFQUFFO0FBQzNCLE9BQUcsS0FBSyxZQUFZLGFBQWEsRUFBQztBQUNqQyxTQUFLLEdBQUcsRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLENBQUM7SUFDckI7O0FBRUQsT0FBRyxLQUFLLFlBQVksU0FBUyxFQUFFO0FBQzlCLFNBQUssR0FBRyxFQUFDLElBQUksRUFBQyxLQUFLLENBQUMsYUFBYSxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQztJQUMvQzs7QUFFRCxPQUFHLEdBQUcsWUFBWSxhQUFhLEVBQUM7QUFDL0IsT0FBRyxHQUFHLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxDQUFDO0lBQ2pCOztBQUVELE9BQUcsR0FBRyxZQUFZLGNBQWMsRUFBQztBQUNoQyxPQUFHLEdBQUcsRUFBQyxJQUFJLEVBQUMsR0FBRyxDQUFDLGFBQWEsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLENBQUE7SUFDeEM7O0FBRUQsT0FBRyxHQUFHLFlBQVksU0FBUyxFQUFDO0FBQzNCLE9BQUcsR0FBRyxFQUFDLElBQUksRUFBQyxHQUFHLENBQUMsYUFBYSxFQUFDLEtBQUssRUFBQyxHQUFHLEVBQUMsQ0FBQTtJQUN4Qzs7QUFFRCxPQUFJLEdBQUcsR0FBRyxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQzs7O0FBQUMsQUFHbEMsUUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDL0QsUUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLFFBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQy9ELEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFDO0FBQzVELGtCQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLGtCQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzlCO0lBQ0Y7R0FDRjs7O3lCQUVhLFNBQVMsRUFBa0I7T0FBakIsTUFBTSx5REFBRyxZQUFJLEVBQUU7O0FBQ3RDLE9BQUksR0FBRyxHQUFHLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxnQkFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsVUFBTyxHQUFHLENBQUM7R0FDWDs7Ozs7OzBCQUdjLEtBQUssRUFBRSxHQUFHLEVBQUU7QUFDMUIsT0FBRyxLQUFLLFlBQVksYUFBYSxFQUFFO0FBQ2xDLFNBQUssR0FBRyxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxDQUFDO0lBQzdCOztBQUVELE9BQUcsS0FBSyxZQUFZLFNBQVMsRUFBQztBQUM3QixTQUFLLEdBQUcsRUFBQyxJQUFJLEVBQUMsS0FBSyxDQUFDLGFBQWEsRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUM7SUFDL0M7O0FBR0QsT0FBRyxHQUFHLFlBQVksYUFBYSxFQUFDO0FBQy9CLE9BQUcsR0FBRyxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxDQUFDO0lBQ3pCOztBQUVELE9BQUcsR0FBRyxZQUFZLGNBQWMsRUFBQztBQUNoQyxPQUFHLEdBQUcsRUFBQyxJQUFJLEVBQUMsR0FBRyxDQUFDLGFBQWEsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLENBQUM7SUFDekM7O0FBRUQsT0FBRyxHQUFHLFlBQVksU0FBUyxFQUFDO0FBQzNCLE9BQUcsR0FBRyxFQUFDLElBQUksRUFBQyxHQUFHLENBQUMsYUFBYSxFQUFDLEtBQUssRUFBQyxHQUFHLEVBQUMsQ0FBQztJQUN6Qzs7QUFBQSxBQUVELFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDdEUsUUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLFFBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksSUFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssSUFDNUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksSUFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssR0FBRyxDQUFDLEtBQUssRUFFM0I7QUFDQzs7QUFBTyxLQUVSO0lBQ0Q7OztBQUFBLEFBR0QsT0FBRyxHQUFHLENBQUMsS0FBSyxZQUFZLFNBQVMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLFlBQVksU0FBUyxDQUFBLEFBQUMsRUFBQztBQUN2RSxXQUFRO0lBQ1Q7OztBQUFBLEFBR0QsT0FBRyxLQUFLLENBQUMsS0FBSyxZQUFZLFNBQVMsRUFBQztBQUNuQyxRQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssWUFBWSxTQUFTLElBQUksR0FBRyxDQUFDLEtBQUssWUFBWSxjQUFjLENBQUEsQUFBQyxFQUFDO0FBQzNFLFlBQU87S0FDUDtJQUNEOztBQUVELE9BQUksS0FBSyxDQUFDLEtBQUssRUFBRTs7QUFFZixRQUFHLEtBQUssQ0FBQyxLQUFLLFlBQVksU0FBUyxFQUFDO0FBQ2xDLFVBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxDQUFDOztBQUFDLEtBRXhELE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxFQUNwQjs7QUFFQyxVQUFHLEdBQUcsQ0FBQyxLQUFLLFlBQVksY0FBYyxFQUFDOztBQUV0QyxZQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQy9ELE1BQU07O0FBRU4sWUFBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3hFO01BQ0QsTUFBTTs7QUFFTixXQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQzdEO0lBQ0QsTUFBTTs7QUFFTixRQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUU7O0FBRWQsU0FBRyxHQUFHLENBQUMsS0FBSyxZQUFZLGNBQWMsRUFBQzs7QUFFdEMsV0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7TUFDbkQsTUFBSzs7QUFFTCxXQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUM3RDtLQUNELE1BQU07O0FBRU4sVUFBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDakQ7O0FBQUEsSUFFRDs7QUFFRCxnQkFBYSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FDbEM7QUFDQSxVQUFNLEVBQUUsS0FBSztBQUNiLFFBQUksRUFBRSxHQUFHO0lBQ1QsQ0FBQyxDQUFDO0dBQ0g7OztRQTVVVyxhQUFhO0dBQVMsWUFBWTs7QUFrVi9DLGFBQWEsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzlCLGFBQWEsQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7OztRQy9YcEIsTUFBTSxHQUFOLE1BQU07UUF3T04sSUFBSSxHQUFKLElBQUk7UUFvUkosU0FBUyxHQUFULFNBQVM7UUF1RVQsbUJBQW1CLEdBQW5CLG1CQUFtQjs7OztJQXJsQnZCLEtBQUs7Ozs7SUFDTCxFQUFFOzs7Ozs7QUFHUCxJQUFJLEdBQUcsV0FBSCxHQUFHLFlBQUE7O0FBQUMsQUFFZixJQUFJLFNBQVMsRUFBRSxTQUFTLENBQUM7QUFDekIsSUFBSSxJQUFJLENBQUM7QUFDVCxJQUFJLE9BQU8sQ0FBQztBQUNaLElBQUksU0FBUyxDQUFDO0FBQ2QsSUFBSSxTQUFTLENBQUM7O0FBRWQsSUFBSSxjQUFjLENBQUM7QUFDbkIsSUFBSSxhQUFhLENBQUM7QUFDbEIsSUFBSSxJQUFJLENBQUM7QUFDVCxJQUFJLGlCQUFpQixHQUFHLEVBQUU7OztBQUFDLEFBR3BCLFNBQVMsTUFBTSxHQUFFOzs7QUFHdkIsTUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsWUFDeEI7QUFDQyxNQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFDO0FBQzNHLEtBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxLQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0MsS0FBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ2hEO0VBQ0QsQ0FBQTs7QUFFRCxNQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxZQUFJO0FBQzNCLE9BQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDaEMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQy9DLElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxJQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7RUFDaEQsQ0FBQTs7QUFFRCxHQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUNqQixFQUFFLENBQUMsT0FBTyxFQUFDLFlBQ1o7QUFDQyxPQUFLLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RELElBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUM1QyxJQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0VBQzFDLENBQUMsQ0FBQzs7QUFFSCxHQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUMsWUFBVTtBQUN4QyxPQUFLLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ2pDLElBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUM1QyxJQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3pDLENBQUMsQ0FBQzs7QUFFSCxHQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUMsWUFBVTtBQUN2QyxPQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ2hDLElBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUM1QyxJQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEQsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3pDLENBQUMsQ0FBQzs7QUFFSCxNQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFJO0FBQzdCLElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxJQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEQsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3pDOzs7QUFBQSxBQUlELEtBQUksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUN4QixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLENBQUMsQ0FBQztFQUFFLENBQUMsQ0FDbEMsRUFBRSxDQUFDLFdBQVcsRUFBQyxVQUFTLENBQUMsRUFBQztBQUMxQixNQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUM7QUFDaEUsT0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLFVBQU8sS0FBSyxDQUFDO0dBQ2I7QUFDRCxHQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2YsR0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNmLElBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsSUFBSSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxDQUFFLENBQUM7RUFDbEYsQ0FBQyxDQUNELEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDeEIsTUFBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFDO0FBQ2hFLFVBQU87R0FDUDtBQUNELEdBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3hCLEdBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTs7O0FBQUMsQUFHeEIsTUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQzFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyQixNQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3ZELE1BQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDdkQsWUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7RUFDM0IsQ0FBQyxDQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFDeEIsTUFBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFDO0FBQ2hFLFVBQU87R0FDUDtBQUNELE1BQUksVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUMxQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckIsTUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6QyxNQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDZixHQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2YsWUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3BCLE1BQUksRUFBRSxDQUFDO0VBQ1AsQ0FBQzs7O0FBQUMsQUFHSCxRQUFPLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FDM0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQUUsU0FBTyxDQUFDLENBQUM7RUFBRSxDQUFDLENBQ2xDLEVBQUUsQ0FBQyxXQUFXLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFDMUIsTUFBSSxFQUFFLEVBQUMsRUFBRSxDQUFDO0FBQ1YsTUFBRyxDQUFDLENBQUMsS0FBSyxFQUFDO0FBQ1YsT0FBRyxDQUFDLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxTQUFTLEVBQUM7QUFDckMsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdDLE1BQU07QUFDTixNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDdEU7R0FDRCxNQUFNO0FBQ04sS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNqQyxLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0dBQ3ZEOztBQUVELEdBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLEdBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDOztBQUVwQixNQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuQyxHQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ3ZCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FDUixNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxPQUFPLEVBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQztFQUMzQyxDQUFDLENBQ0QsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTtBQUN4QixHQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3BCLEdBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDcEIsR0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNwRCxDQUFDLENBQ0QsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUMzQixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ25CLE1BQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFOzs7QUFBQyxBQUduQixNQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdEIsTUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxPQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3pDLE9BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixPQUFJLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekIsT0FBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDN0IsT0FBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztPQUMxQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztPQUN2QyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLO09BQ3JELE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMxRCxPQUFHLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksR0FBRyxJQUFJLE9BQU8sSUFBSSxNQUFNLEVBQzdFOztBQUVDLFFBQUksS0FBSyxHQUFHLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsQ0FBQztBQUN4QyxRQUFJLEdBQUcsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFDLENBQUM7QUFDL0MsU0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQzs7QUFBQyxBQUV2QyxRQUFJLEVBQUUsQ0FBQztBQUNQLGFBQVMsR0FBRyxJQUFJLENBQUM7QUFDakIsVUFBTTtJQUNOO0dBQ0Q7O0FBRUQsTUFBRyxDQUFDLFNBQVMsRUFBQzs7QUFFYixPQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUFFLENBQUMsRUFDekM7QUFDQyxRQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsUUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pCLFFBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDekIsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUN0QixRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUMsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzFELFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdELFFBQUcsT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLE1BQU0sRUFDOUU7QUFDQyxZQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixVQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsS0FBSyxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQztBQUN2RixTQUFJLEVBQUUsQ0FBQztBQUNQLFdBQU07S0FDTjtJQUNEO0dBQ0Q7O0FBQUEsQUFFRCxHQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hCLFNBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztFQUNkLENBQUMsQ0FBQzs7QUFFSCxHQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUN4QixFQUFFLENBQUMsT0FBTyxFQUFDLFlBQVU7QUFBQyxJQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7RUFBQyxDQUFDOzs7QUFBQyxBQUd2SSxLQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FDbkIsQ0FBQyxDQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0VBQUMsQ0FBQyxDQUMxQixDQUFDLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxTQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFBQyxDQUFDLENBQzFCLFdBQVcsQ0FBQyxPQUFPLENBQUM7OztBQUFDLEFBR3RCLFNBMU1VLEdBQUcsR0EwTWIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDYixJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDOzs7QUFBQyxBQUdyRSxVQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7O0FBQUMsQUFFNUIsVUFBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUc1QixrQkFBaUIsR0FDakIsQ0FDQyxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDekQsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQzNELEVBQUMsSUFBSSxFQUFDLG1CQUFtQixFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDOUUsRUFBQyxJQUFJLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUMxRixFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDN0QsRUFBQyxJQUFJLEVBQUMsV0FBVyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQ25FLEVBQUMsSUFBSSxFQUFDLFVBQVUsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUNqRSxFQUFDLElBQUksRUFBQyxpQkFBaUIsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQy9FLEVBQUMsSUFBSSxFQUFDLGVBQWUsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQzNFLEVBQUMsSUFBSSxFQUFDLG9CQUFvQixFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDckYsRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDekUsRUFBQyxJQUFJLEVBQUMsWUFBWSxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDckUsRUFBQyxJQUFJLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUN4RixFQUFDLElBQUksRUFBQyxZQUFZLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUNyRSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDO1VBQUksSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO0dBQUEsRUFBQyxFQUNyQyxFQUFDLElBQUksRUFBQyxXQUFXLEVBQUMsTUFBTSxFQUFDO1VBQUksSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO0dBQUEsRUFBQyxNQUFNLGtCQXZPbkQsa0JBQWtCLEFBdU9vRCxFQUFDLENBQzdFLENBQUM7O0FBRUYsS0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFDO0FBQ3pDLG1CQUFpQixDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBQyw2QkFBNkI7QUFDekQsU0FBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FDN0QsQ0FBQyxDQUFDO0VBQ0g7O0FBRUQsR0FBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FDcEIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUNULEVBQUUsQ0FBQyxhQUFhLEVBQUMsWUFBVTtBQUMzQixvQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN6QixDQUFDLENBQUM7Q0FDSDs7O0FBQUEsQUFHTSxTQUFTLElBQUksR0FBRzs7QUFFdEIsS0FBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDO0VBQUMsQ0FBQzs7O0FBQUMsQUFHL0QsR0FBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDaEIsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBQztVQUFJLENBQUMsQ0FBQyxLQUFLO0dBQUEsRUFBRSxRQUFRLEVBQUUsVUFBQyxDQUFDO1VBQUksQ0FBQyxDQUFDLE1BQU07R0FBQSxFQUFFLENBQUM7OztBQUFDLEFBRzVELEtBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FDakIsTUFBTSxDQUFDLEdBQUcsQ0FBQzs7QUFBQyxBQUViLEdBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQUUsU0FBTyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLEdBQUcsQ0FBQTtFQUFFLENBQUM7OztBQUFDLEFBR3BILEVBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNWLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFDLENBQUM7VUFBSSxDQUFDLENBQUMsS0FBSztHQUFBLEVBQUUsUUFBUSxFQUFFLFVBQUMsQ0FBQztVQUFJLENBQUMsQ0FBQyxNQUFNO0dBQUEsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FDaEYsT0FBTyxDQUFDLE1BQU0sRUFBQyxVQUFTLENBQUMsRUFBQztBQUMxQixTQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLG1CQUFtQixDQUFDO0VBQ2xELENBQUMsQ0FDRCxFQUFFLENBQUMsYUFBYSxFQUFDLFVBQVMsQ0FBQyxFQUFDOztBQUU1QixHQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDWCxJQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzFCLElBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztFQUM3QixDQUFDLENBQ0QsRUFBRSxDQUFDLGNBQWMsRUFBQyxVQUFTLENBQUMsRUFBQzs7QUFFN0IsTUFBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBQztBQUNwQixJQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDL0MsT0FBSTtBQUNILFNBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFFBQUksRUFBRSxDQUFDO0lBQ1AsQ0FBQyxPQUFNLENBQUMsRUFBRTs7SUFFVjtHQUNEO0FBQ0QsSUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLElBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUIsQ0FBQyxDQUNELE1BQU0sQ0FBQyxVQUFTLENBQUMsRUFBQzs7QUFFbEIsU0FBTyxDQUFDLENBQUMsU0FBUyxZQUFZLGNBQWMsSUFBSSxDQUFDLENBQUMsU0FBUyxZQUFZLHFCQUFxQixJQUFJLENBQUMsQ0FBQyxTQUFTLFlBQVksMkJBQTJCLENBQUM7RUFDbkosQ0FBQyxDQUNELEVBQUUsQ0FBQyxPQUFPLEVBQUMsVUFBUyxDQUFDLEVBQUM7O0FBRXRCLFNBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLElBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM3QixJQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUUxQixNQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUM7QUFDcEIsVUFBTztHQUNQO0FBQ0QsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixNQUFHLENBQUMsQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLG1CQUFtQixFQUFDO0FBQzdDLElBQUMsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO0FBQ3hDLE1BQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLElBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3BCLE1BQU0sSUFBRyxDQUFDLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxrQkFBa0IsRUFBQztBQUNuRCxJQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixJQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QyxNQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsQ0FBQztHQUN6QixNQUFNO0FBQ04sUUFBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7R0FDekI7RUFDRCxDQUFDLENBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7QUFDdEM7OztBQUFDLEFBR0QsRUFBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQUUsU0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQUUsQ0FBQzs7O0FBQUMsQUFHdkMsR0FBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNwQixNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLE1BQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFHO0FBQzVCLFVBQU8sRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUM7R0FDdEMsQ0FBQyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsVUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztHQUFDLENBQUMsQ0FBQzs7QUFFcEMsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUNyQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWIsTUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FDcEIsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLFVBQUMsQ0FBQztXQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLENBQUM7SUFBQTtBQUNoQyxLQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUk7QUFBRSxXQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQUU7QUFDekMsVUFBTyxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQ3BCLFFBQUcsQ0FBQyxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsY0FBYyxFQUFDO0FBQzFDLFlBQU8sYUFBYSxDQUFDO0tBQ3JCO0FBQ0QsV0FBTyxPQUFPLENBQUM7SUFDZixFQUFDLENBQUMsQ0FBQzs7QUFFSixNQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNsQixJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsVUFBQyxDQUFDO1dBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFBQyxFQUFDLENBQUMsRUFBQyxVQUFDLENBQUM7V0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFBQSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUUsQ0FBQyxDQUN0RixJQUFJLENBQUMsVUFBQyxDQUFDO1VBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFDOztBQUV6QixLQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7RUFFcEIsQ0FBQzs7O0FBQUMsQUFHSCxHQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3BCLE1BQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsTUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFJekIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFHO0FBQzdCLFVBQU8sRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUM7R0FDdEMsQ0FBQyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsVUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztHQUFDLENBQUMsQ0FBQzs7QUFFcEMsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUNyQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWIsTUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FDcEIsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLFVBQUMsQ0FBQztXQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLENBQUM7SUFBQTtBQUNoQyxLQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFJO0FBQUUsV0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUFFO0FBQy9DLFVBQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRWYsTUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDbEIsSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFFLFVBQUMsQ0FBQztXQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQUMsRUFBQyxDQUFDLEVBQUMsVUFBQyxDQUFDO1dBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQUEsRUFBQyxPQUFPLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FDdEYsSUFBSSxDQUFDLFVBQUMsQ0FBQztVQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSTtHQUFBLENBQUMsQ0FBQzs7QUFFekIsS0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBRXBCLENBQUM7OztBQUFDLEFBR0gsR0FBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUN0QixTQUFPLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0VBQzdCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFDaEIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsTUFBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsZUFBZSxBQUFDLEFBQUMsRUFDNUU7QUFDQyxJQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakIsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdkMsS0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNuQztHQUNEO0FBQ0QsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixNQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWxDLE1BQUksQ0FBQyxLQUFLLEVBQUUsQ0FDWCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFDLEVBQUU7V0FBSyxDQUFDLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQztJQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQ3BLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNmLE1BQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNyQixDQUFDOzs7QUFBQyxBQUdILEdBQUUsQ0FDRCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0VBQUUsQ0FBQyxDQUNyRCxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFDaEIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsTUFBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsY0FBYyxBQUFDLEFBQUMsRUFDeEU7QUFDQyxJQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdEMsS0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNsQztHQUNEO0FBQ0QsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMs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Q0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxH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LENBQUE7Q0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsR0FBRyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFJLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0NBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5leHBvcnQgKiBmcm9tICcuL2F1ZGlvTm9kZVZpZXcnO1xyXG5leHBvcnQgKiBmcm9tICcuL2VnJztcclxuZXhwb3J0ICogZnJvbSAnLi9zZXF1ZW5jZXInO1xyXG5leHBvcnQgZnVuY3Rpb24gZHVtbXkoKXt9O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IFVVSUQgZnJvbSAnLi91dWlkLmNvcmUnO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuXHJcbnZhciBjb3VudGVyID0gMDtcclxuZXhwb3J0IHZhciBjdHg7XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDdHgoYyl7Y3R4ID0gYzt9XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0T2JqZWN0Q291bnRlcigpe1xyXG4gIHJldHVybiBjb3VudGVyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQ291bnRlcih2KVxyXG57XHJcbiAgaWYodiA+IGNvdW50ZXIpe1xyXG4gICAgY291bnRlciA9IHY7XHJcbiAgICArK2NvdW50ZXI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDAsd2lkdGggPSB1aS5ub2RlV2lkdGgsaGVpZ2h0ID0gdWkubm9kZUhlaWdodCxuYW1lID0gJycpIHtcclxuXHRcdHRoaXMueCA9IHggO1xyXG5cdFx0dGhpcy55ID0geSA7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGggO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQgO1xyXG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9OT1RfUExBWUVEID0gMDtcclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX1BMQVlJTkcgPSAxO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUVEID0gMjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZJc05vdEFQSU9iaih0aGlzXyx2KXtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpc18sJ2lzTm90QVBJT2JqJyx7XHJcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0XHR3cml0YWJsZTpmYWxzZSxcclxuXHRcdFx0dmFsdWU6IHZcclxuXHRcdH0pO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9QYXJhbVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKEF1ZGlvTm9kZVZpZXcsbmFtZSwgcGFyYW0pIHtcclxuXHRcdHN1cGVyKDAsMCx1aS5wb2ludFNpemUsdWkucG9pbnRTaXplLG5hbWUpO1xyXG5cdFx0dGhpcy5pZCA9IFVVSUQuZ2VuZXJhdGUoKTtcclxuXHRcdHRoaXMuYXVkaW9QYXJhbSA9IHBhcmFtO1xyXG5cdFx0dGhpcy5BdWRpb05vZGVWaWV3ID0gQXVkaW9Ob2RlVmlldztcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQYXJhbVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKEF1ZGlvTm9kZVZpZXcsbmFtZSxpc291dHB1dCkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gVVVJRC5nZW5lcmF0ZSgpO1xyXG5cdFx0dGhpcy5BdWRpb05vZGVWaWV3ID0gQXVkaW9Ob2RlVmlldztcclxuXHRcdHRoaXMuaXNPdXRwdXQgPSBpc291dHB1dCB8fCBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9Ob2RlVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoYXVkaW9Ob2RlLGVkaXRvcilcclxuXHR7XHJcblx0XHQvLyBhdWRpb05vZGUg44Gv44OZ44O844K544Go44Gq44KL44OO44O844OJXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5pZCA9IFVVSUQuZ2VuZXJhdGUoKTtcclxuXHRcdHRoaXMuYXVkaW9Ob2RlID0gYXVkaW9Ob2RlO1xyXG5cdFx0dGhpcy5uYW1lID0gYXVkaW9Ob2RlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKC4qKVxcKC8pWzFdO1xyXG5cdFx0dGhpcy5pbnB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5vdXRwdXRQYXJhbXMgPSBbXTtcclxuXHRcdHRoaXMucGFyYW1zID0gW107XHJcblx0XHRsZXQgaW5wdXRDeSA9IDEsb3V0cHV0Q3kgPSAxO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbW92YWJsZSA9IHRydWU7XHJcblx0XHRcclxuXHRcdC8vIOODl+ODreODkeODhuOCo+ODu+ODoeOCveODg+ODieOBruikh+ijvVxyXG5cdFx0Zm9yICh2YXIgaSBpbiBhdWRpb05vZGUpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdmdW5jdGlvbicpIHtcclxuLy9cdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV0uYmluZChhdWRpb05vZGUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgYXVkaW9Ob2RlW2ldID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRcdFx0aWYgKGF1ZGlvTm9kZVtpXSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IG5ldyBBdWRpb1BhcmFtVmlldyh0aGlzLGksIGF1ZGlvTm9kZVtpXSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5wYXJhbXMucHVzaCgoKHApPT57XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5hbWU6aSxcclxuXHRcdFx0XHRcdFx0XHRcdCdnZXQnOigpID0+IHAuYXVkaW9QYXJhbS52YWx1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdCdzZXQnOih2KSA9PntwLmF1ZGlvUGFyYW0udmFsdWUgPSB2O30sXHJcblx0XHRcdFx0XHRcdFx0XHRwYXJhbTpwLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZTp0aGlzXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KSh0aGlzW2ldKSk7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIGlucHV0Q3krKyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdFx0YXVkaW9Ob2RlW2ldLkF1ZGlvTm9kZVZpZXcgPSB0aGlzO1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldO1xyXG5cdFx0XHRcdFx0XHRpZih0aGlzW2ldLmlzT3V0cHV0KXtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBvdXRwdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMub3V0cHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmlucHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihBdWRpb05vZGUucHJvdG90eXBlLCBpKTtcdFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZS5fX3Byb3RvX18sIGkpO1x0XHJcblx0XHRcdFx0XHR9IFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZSxpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBwcm9wcyA9IHt9O1xyXG5cclxuLy9cdFx0XHRcdFx0aWYoZGVzYy5nZXQpe1xyXG5cdFx0XHRcdFx0XHRcdHByb3BzLmdldCA9ICgoaSkgPT4gdGhpcy5hdWRpb05vZGVbaV0pLmJpbmQobnVsbCwgaSk7XHJcbi8vXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy53cml0YWJsZSB8fCBkZXNjLnNldCl7XHJcblx0XHRcdFx0XHRcdHByb3BzLnNldCA9ICgoaSwgdikgPT4geyB0aGlzLmF1ZGlvTm9kZVtpXSA9IHY7IH0pLmJpbmQobnVsbCwgaSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLmVudW1lcmFibGUgPSBkZXNjLmVudW1lcmFibGU7XHJcblx0XHRcdFx0XHRwcm9wcy5jb25maWd1cmFibGUgPSBkZXNjLmNvbmZpZ3VyYWJsZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBkZXNjLndyaXRhYmxlO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaSxwcm9wcyk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLm5hbWUgPSBpO1xyXG5cdFx0XHRcdFx0cHJvcHMubm9kZSA9IHRoaXM7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGRlc2MuZW51bWVyYWJsZSAmJiAhaS5tYXRjaCgvKC4qXyQpfChuYW1lKXwoXm51bWJlck9mLiokKS9pKSAmJiAodHlwZW9mIGF1ZGlvTm9kZVtpXSkgIT09ICdBcnJheScpe1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKHByb3BzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmlucHV0U3RhcnRZID0gaW5wdXRDeSAqIDIwO1xyXG5cdFx0dmFyIGlucHV0SGVpZ2h0ID0gKGlucHV0Q3kgKyB0aGlzLm51bWJlck9mSW5wdXRzKSAqIDIwIDtcclxuXHRcdHZhciBvdXRwdXRIZWlnaHQgPSAob3V0cHV0Q3kgKyB0aGlzLm51bWJlck9mT3V0cHV0cykgKiAyMDtcclxuXHRcdHRoaXMub3V0cHV0U3RhcnRZID0gb3V0cHV0Q3kgKiAyMDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5oZWlnaHQsaW5wdXRIZWlnaHQsb3V0cHV0SGVpZ2h0KTtcclxuXHRcdHRoaXMudGVtcCA9IHt9O1xyXG5cdFx0dGhpcy5zdGF0dXNQbGF5ID0gU1RBVFVTX1BMQVlfTk9UX1BMQVlFRDsvLyBub3QgcGxheWVkLlxyXG5cdFx0dGhpcy5wYW5lbCA9IG51bGw7XHJcblx0XHR0aGlzLmVkaXRvciA9IGVkaXRvci5iaW5kKHRoaXMsdGhpcyk7XHJcblx0fVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgbGV0IHJldCA9IHt9O1xyXG4gICAgcmV0LmlkID0gdGhpcy5pZDtcclxuICAgIHJldC54ID0gdGhpcy54O1xyXG5cdFx0cmV0LnkgPSB0aGlzLnk7XHJcblx0XHRyZXQubmFtZSA9IHRoaXMubmFtZTtcclxuICAgIHJldC5yZW1vdmFibGUgPSB0aGlzLnJlbW92YWJsZTtcclxuICAgIGlmKHRoaXMuYXVkaW9Ob2RlLnRvSlNPTil7XHJcbiAgICAgIHJldC5hdWRpb05vZGUgPSB0aGlzLmF1ZGlvTm9kZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldC5wYXJhbXMgPSB7fTtcclxuICAgICAgdGhpcy5wYXJhbXMuZm9yRWFjaCgoZCk9PntcclxuICAgICAgICBpZihkLnNldCl7XHJcbiAgICAgICAgICByZXQucGFyYW1zW2QubmFtZV0gPSBkLmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHRcclxuXHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRzdGF0aWMgcmVtb3ZlKG5vZGUpIHtcclxuXHRcdFx0aWYoIW5vZGUucmVtb3ZhYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCfliYrpmaTjgafjgY3jgarjgYTjg47jg7zjg4njgafjgZnjgIInKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRpZiAoQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzW2ldID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRpZihub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKXtcclxuXHRcdFx0XHRcdFx0bm9kZS5hdWRpb05vZGUuZGlzcG9zZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnNwbGljZShpLS0sIDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUgfHwgbi50by5ub2RlID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKG4pO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG4gIFxyXG4gIC8vIFxyXG4gIHN0YXRpYyByZW1vdmVBbGxOb2RlVmlld3MoKXtcclxuICAgIEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICBpZihub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKXtcclxuICAgICAgICBub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuICAgICAgICBpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUgfHwgbi50by5ub2RlID09PSBub2RlKSB7XHJcbiAgICAgICAgICBBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKG4pO1xyXG4gICAgICAgICAgQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgLy8gXHJcblx0c3RhdGljIGRpc2Nvbm5lY3RfKGNvbikge1xyXG5cdFx0aWYgKGNvbi5mcm9tLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSB7XHJcblx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdH0gZWxzZSBpZiAoY29uLnRvLnBhcmFtKSB7XHJcblx0XHRcdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdGlmIChjb24udG8ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldykge1xyXG5cdFx0XHRcdC8vIEFVZGlvUGFyYW1cclxuXHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLnBhcmFtLmF1ZGlvUGFyYW0sIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGNvbi50by5wYXJhbeOBjOaVsOWtl1xyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtLCBjb24udG8ucGFyYW0pO1xyXG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIDAsIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCBjb24uZnJvbS5wYXJhbSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7mjqXntprjgpLop6PpmaTjgZnjgotcclxuXHRzdGF0aWMgZGlzY29ubmVjdChmcm9tXyx0b18pIHtcclxuXHRcdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0XHRmcm9tXyA9IHtub2RlOmZyb21ffTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBQYXJhbVZpZXcgKXtcclxuXHRcdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLkF1ZGlvTm9kZVZpZXcscGFyYW06ZnJvbV99O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b199O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX31cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbiA9IHsnZnJvbSc6ZnJvbV8sJ3RvJzp0b199O1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8g44Kz44ON44Kv44K344On44Oz44Gu5YmK6ZmkXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0bGV0IG4gPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdFx0aWYoY29uLmZyb20ubm9kZSA9PT0gbi5mcm9tLm5vZGUgJiYgY29uLmZyb20ucGFyYW0gPT09IG4uZnJvbS5wYXJhbSBcclxuXHRcdFx0XHRcdCYmIGNvbi50by5ub2RlID09PSBuLnRvLm5vZGUgJiYgY29uLnRvLnBhcmFtID09PSBuLnRvLnBhcmFtKXtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0Xyhjb24pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlKGF1ZGlvbm9kZSxlZGl0b3IgPSAoKT0+e30pIHtcclxuXHRcdHZhciBvYmogPSBuZXcgQXVkaW9Ob2RlVmlldyhhdWRpb25vZGUsZWRpdG9yKTtcclxuXHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5wdXNoKG9iaik7XHJcblx0XHRyZXR1cm4gb2JqO1xyXG5cdH1cclxuICBcclxuICAvLyDjg47jg7zjg4nplpPjga7mjqXntppcclxuXHRzdGF0aWMgY29ubmVjdChmcm9tXywgdG9fKSB7XHJcblx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcgKXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXyxwYXJhbTowfTtcclxuXHRcdH1cclxuXHJcblx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX307XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX307XHJcblx0XHR9XHJcblx0XHQvLyDlrZjlnKjjg4Hjgqfjg4Pjgq9cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG5cdFx0XHR2YXIgYyA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0aWYgKGMuZnJvbS5ub2RlID09PSBmcm9tXy5ub2RlIFxyXG5cdFx0XHRcdCYmIGMuZnJvbS5wYXJhbSA9PT0gZnJvbV8ucGFyYW1cclxuXHRcdFx0XHQmJiBjLnRvLm5vZGUgPT09IHRvXy5ub2RlXHJcblx0XHRcdFx0JiYgYy50by5wYXJhbSA9PT0gdG9fLnBhcmFtXHJcblx0XHRcdFx0KSBcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcbi8vXHRcdFx0XHR0aHJvdyAobmV3IEVycm9yKCfmjqXntprjgYzph43opIfjgZfjgabjgYTjgb7jgZnjgIInKSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g5o6l57aa5YWI44GMUGFyYW1WaWV344Gu5aC05ZCI44Gv5o6l57aa5YWD44GvUGFyYW1WaWV344Gu44G/XHJcblx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgJiYgIShmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykpe1xyXG5cdFx0ICByZXR1cm4gO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBQYXJhbVZpZXfjgYzmjqXntprlj6/og73jgarjga7jga9BdWRpb1BhcmFt44GL44KJUGFyYW1WaWV344Gu44G/XHJcblx0XHRpZihmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdGlmKCEodG9fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3IHx8IHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSl7XHJcblx0XHRcdFx0cmV0dXJuO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gXHJcblx0XHRcclxuXHRcdGlmIChmcm9tXy5wYXJhbSkge1xyXG5cdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHQgIGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHQgIGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3Qoeydmcm9tJzpmcm9tXywndG8nOnRvX30pO1xyXG4vL1x0XHRcdFx0ZnJvbV8ubm9kZS5jb25uZWN0UGFyYW0oZnJvbV8ucGFyYW0sdG9fKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0b18ucGFyYW0pIFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8g5pWw5a2X44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSwgZnJvbV8ucGFyYW0sdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSxmcm9tXy5wYXJhbSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0aWYgKHRvXy5wYXJhbSkge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0Ly8gQXVkaW9QYXJhbeOBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNle1xyXG5cdFx0XHRcdFx0Ly8g5pWw5a2X44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSwwLHRvXy5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vdGhyb3cgbmV3IEVycm9yKCdDb25uZWN0aW9uIEVycm9yJyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5wdXNoXHJcblx0XHQoe1xyXG5cdFx0XHQnZnJvbSc6IGZyb21fLFxyXG5cdFx0XHQndG8nOiB0b19cclxuXHRcdH0pO1xyXG5cdH1cclxuICBcclxufVxyXG5cclxuXHJcblxyXG5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMgPSBbXTtcclxuQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zID0gW107XHJcblxyXG5cclxuIiwiaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWkuanMnO1xyXG5pbXBvcnQge3Nob3dTZXF1ZW5jZUVkaXRvcn0gZnJvbSAnLi9zZXF1ZW5jZUVkaXRvcic7XHJcblxyXG5leHBvcnQgdmFyIHN2ZztcclxuLy9hYVxyXG52YXIgbm9kZUdyb3VwLCBsaW5lR3JvdXA7XHJcbnZhciBkcmFnO1xyXG52YXIgZHJhZ091dDtcclxudmFyIGRyYWdQYXJhbTtcclxudmFyIGRyYWdQYW5lbDtcclxuXHJcbnZhciBtb3VzZUNsaWNrTm9kZTtcclxudmFyIG1vdXNlT3Zlck5vZGU7XHJcbnZhciBsaW5lO1xyXG52YXIgYXVkaW9Ob2RlQ3JlYXRvcnMgPSBbXTtcclxuXHJcbi8vIERyYXfjga7liJ3mnJ/ljJZcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRVSSgpe1xyXG5cdFxyXG5cdC8vIOODl+ODrOOCpOODpOODvFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5hZGRlZCA9ICgpPT5cclxuXHR7XHJcblx0XHRpZihhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGggPT0gMSAmJiBhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT09IGF1ZGlvLlNFUV9TVEFUVVMuU1RPUFBFRCl7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhdWRpby5TZXF1ZW5jZXIuZW1wdHkgPSAoKT0+e1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0fSBcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwbGF5JylcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0YXJ0U2VxdWVuY2VzKGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BhdXNlJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnBhdXNlU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjc3RvcCcpLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5zdG9wcGVkID0gKCk9PntcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeODieODqeODg+OCsOeUqFxyXG5cdGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdtb3VzZXVwJykpO1x0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCA9IGQueDtcclxuXHRcdGQudGVtcC55ID0gZC55O1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoe2lkOidkcmFnJyx3aWR0aDpkLndpZHRoLGhlaWdodDpkLmhlaWdodCx4OjAseTowLCdjbGFzcyc6J2F1ZGlvTm9kZURyYWcnfSApO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC50ZW1wLnkgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHQvL2QzLnNlbGVjdCh0aGlzKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScpO1xyXG5cdFx0Ly9kcmF3KCk7XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSkgKyBkMy5ldmVudC5keDtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdGRyYWdDdXJzb2wuYXR0cih7eDp4LHk6eX0pO1x0XHRcclxuXHR9KVxyXG5cdC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpO1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKTtcclxuXHRcdGQueCA9IGQudGVtcC54O1xyXG5cdFx0ZC55ID0gZC50ZW1wLnk7XHJcblx0XHRkcmFnQ3Vyc29sLnJlbW92ZSgpO1x0XHRcclxuXHRcdGRyYXcoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDjg47jg7zjg4nplpPmjqXntprnlKggZHJhZyBcclxuXHRkcmFnT3V0ID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRsZXQgeDEseTE7XHJcblx0XHRpZihkLmluZGV4KXtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCAtIGQubm9kZS53aWR0aCAvIDIgKyBkLmluZGV4Lng7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLmluZGV4Lnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZICsgZC5pbmRleCAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHRkLngxID0geDEsZC55MSA9IHkxO1x0XHRcdFx0XHJcblx0XHRkLngyID0geDEsZC55MiA9IHkxO1xyXG5cclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLGQueDIsZC55Mik7XHJcblx0XHRkLmxpbmUgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5kYXR1bShkKVxyXG5cdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHQuYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lLWRyYWcnfSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRkLngyICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC55MiArPSBkMy5ldmVudC5keTtcclxuXHRcdGQubGluZS5hdHRyKCdkJyxsaW5lKG1ha2VQb3MoZC54MSxkLnkxLGQueDIsZC55MikpKTtcdFx0XHRcdFx0XHJcblx0fSlcclxuXHQub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRsZXQgdGFyZ2V0WCA9IGQueDI7XHJcblx0XHRsZXQgdGFyZ2V0WSA9IGQueTI7XHJcblx0XHQvLyBpbnB1dOOCguOBl+OBj+OBr3BhcmFt44Gr5Yiw6YGU44GX44Gm44GE44KL44GLXHJcblx0XHQvLyBpbnB1dFx0XHRcclxuXHRcdGxldCBjb25uZWN0ZWQgPSBmYWxzZTtcclxuXHRcdGxldCBpbnB1dHMgPSBkMy5zZWxlY3RBbGwoJy5pbnB1dCcpWzBdO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gaW5wdXRzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHRsZXQgZWxtID0gaW5wdXRzW2ldO1xyXG5cdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdGxldCBub2RlID0gZWxtLl9fZGF0YV9fLm5vZGU7XHJcblx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LngsXHJcblx0XHRcdFx0dG9wID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55LFxyXG5cdFx0XHRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoLFxyXG5cdFx0XHRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcCAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0e1xyXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coJ2hpdCcsZWxtKTtcclxuXHRcdFx0XHRsZXQgZnJvbV8gPSB7bm9kZTpkLm5vZGUscGFyYW06ZC5pbmRleH07XHJcblx0XHRcdFx0bGV0IHRvXyA9IHtub2RlOm5vZGUscGFyYW06ZWxtLl9fZGF0YV9fLmluZGV4fTtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZnJvbV8sdG9fKTtcclxuXHRcdFx0XHQvL0F1ZGlvTm9kZVZpZXcuY29ubmVjdCgpO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKCFjb25uZWN0ZWQpe1xyXG5cdFx0XHQvLyBBdWRpb1BhcmFtXHJcblx0XHRcdHZhciBwYXJhbXMgPSBkMy5zZWxlY3RBbGwoJy5wYXJhbSwuYXVkaW8tcGFyYW0nKVswXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCxsID0gcGFyYW1zLmxlbmd0aDtpIDwgbDsrK2kpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgZWxtID0gcGFyYW1zW2ldO1xyXG5cdFx0XHRcdGxldCBiYm94ID0gZWxtLmdldEJCb3goKTtcclxuXHRcdFx0XHRsZXQgcGFyYW0gPSBlbG0uX19kYXRhX187XHJcblx0XHRcdFx0bGV0IG5vZGUgPSBwYXJhbS5ub2RlO1xyXG5cdFx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94Lng7XHJcblx0XHRcdFx0bGV0XHR0b3BfID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55O1xyXG5cdFx0XHRcdGxldFx0cmlnaHQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCArIGJib3gud2lkdGg7XHJcblx0XHRcdFx0bGV0XHRib3R0b20gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnkgKyBiYm94LmhlaWdodDtcclxuXHRcdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcF8gJiYgdGFyZ2V0WSA8PSBib3R0b20pXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2hpdCcsZWxtKTtcclxuXHRcdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpkLm5vZGUscGFyYW06ZC5pbmRleH0se25vZGU6bm9kZSxwYXJhbTpwYXJhbS5pbmRleH0pO1xyXG5cdFx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBsaW5l44OX44Os44OT44Ol44O844Gu5YmK6ZmkXHJcblx0XHRkLmxpbmUucmVtb3ZlKCk7XHJcblx0XHRkZWxldGUgZC5saW5lO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BhbmVsLWNsb3NlJylcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbigpe2QzLnNlbGVjdCgnI3Byb3AtcGFuZWwnKS5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO2QzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTt9KTtcclxuXHJcblx0Ly8gbm9kZemWk+aOpee2mmxpbmXmj4/nlLvplqLmlbBcclxuXHRsaW5lID0gZDMuc3ZnLmxpbmUoKVxyXG5cdC54KGZ1bmN0aW9uKGQpe3JldHVybiBkLnh9KVxyXG5cdC55KGZ1bmN0aW9uKGQpe3JldHVybiBkLnl9KVxyXG5cdC5pbnRlcnBvbGF0ZSgnYmFzaXMnKTtcclxuXHJcblx0Ly8gRE9N44Grc3Zn44Ko44Os44Oh44Oz44OI44KS5oy/5YWlXHRcclxuXHRzdmcgPSBkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHQuYXR0cih7ICd3aWR0aCc6IHdpbmRvdy5pbm5lcldpZHRoLCAnaGVpZ2h0Jzogd2luZG93LmlubmVySGVpZ2h0IH0pO1xyXG5cclxuXHQvLyDjg47jg7zjg4njgYzlhaXjgovjgrDjg6vjg7zjg5dcclxuXHRub2RlR3JvdXAgPSBzdmcuYXBwZW5kKCdnJyk7XHJcblx0Ly8g44Op44Kk44Oz44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bGluZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdFxyXG5cdC8vIGJvZHnlsZ7mgKfjgavmjL/lhaVcclxuXHRhdWRpb05vZGVDcmVhdG9ycyA9IFxyXG5cdFtcclxuXHRcdHtuYW1lOidHYWluJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUdhaW4uYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidEZWxheScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEZWxheS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0F1ZGlvQnVmZmVyU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J01lZGlhRWxlbWVudEF1ZGlvU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1Bhbm5lcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVQYW5uZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDb252b2x2ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ29udm9sdmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQW5hbHlzZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQW5hbHlzZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDaGFubmVsU3BsaXR0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbFNwbGl0dGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbE1lcmdlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsTWVyZ2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRHluYW1pY3NDb21wcmVzc29yJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3Nvci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0JpcXVhZEZpbHRlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCaXF1YWRGaWx0ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidPc2NpbGxhdG9yJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYVN0cmVhbUF1ZGlvU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonV2F2ZVNoYXBlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVXYXZlU2hhcGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRUcnLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLkVHKCl9LFxyXG5cdFx0e25hbWU6J1NlcXVlbmNlcicsY3JlYXRlOigpPT5uZXcgYXVkaW8uU2VxdWVuY2VyKCksZWRpdG9yOnNob3dTZXF1ZW5jZUVkaXRvcn1cclxuXHRdO1xyXG5cdFxyXG5cdGlmKGF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uKXtcclxuXHRcdGF1ZGlvTm9kZUNyZWF0b3JzLnB1c2goe25hbWU6J01lZGlhU3RyZWFtQXVkaW9EZXN0aW5hdGlvbicsXHJcblx0XHRcdGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1EZXN0aW5hdGlvbi5iaW5kKGF1ZGlvLmN0eClcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHQuZGF0dW0oe30pXHJcblx0Lm9uKCdjb250ZXh0bWVudScsZnVuY3Rpb24oKXtcclxuXHRcdHNob3dBdWRpb05vZGVQYW5lbCh0aGlzKTtcclxuXHR9KTtcclxufVxyXG5cclxuLy8g5o+P55S7XHJcbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xyXG5cdC8vIEF1ZGlvTm9kZeOBruaPj+eUu1xyXG5cdHZhciBnZCA9IG5vZGVHcm91cC5zZWxlY3RBbGwoJ2cnKS5cclxuXHRkYXRhKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyxmdW5jdGlvbihkKXtyZXR1cm4gZC5pZDt9KTtcclxuXHJcblx0Ly8g55+p5b2i44Gu5pu05pawXHJcblx0Z2Quc2VsZWN0KCdyZWN0JylcclxuXHQuYXR0cih7ICd3aWR0aCc6IChkKT0+IGQud2lkdGgsICdoZWlnaHQnOiAoZCk9PiBkLmhlaWdodCB9KTtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5dcclxuXHR2YXIgZyA9IGdkLmVudGVyKClcclxuXHQuYXBwZW5kKCdnJyk7XHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2i44Kw44Or44O844OX44Gu5bqn5qiZ5L2N572u44K744OD44OIXHJcblx0Z2QuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuICd0cmFuc2xhdGUoJyArIChkLnggLSBkLndpZHRoIC8gMikgKyAnLCcgKyAoZC55IC0gZC5oZWlnaHQgLyAyKSArICcpJyB9KTtcdFxyXG5cclxuXHQvLyBBdWRpb05vZGXnn6nlvaJcclxuXHRnLmFwcGVuZCgncmVjdCcpXHJcblx0LmNhbGwoZHJhZylcclxuXHQuYXR0cih7ICd3aWR0aCc6IChkKT0+IGQud2lkdGgsICdoZWlnaHQnOiAoZCk9PiBkLmhlaWdodCwgJ2NsYXNzJzogJ2F1ZGlvTm9kZScgfSlcclxuXHQuY2xhc3NlZCgncGxheScsZnVuY3Rpb24oZCl7XHJcblx0XHRyZXR1cm4gZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdH0pXHJcblx0Lm9uKCdjb250ZXh0bWVudScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg5Hjg6njg6Hjg7zjgr/nt6jpm4bnlLvpnaLjga7ooajnpLpcclxuXHRcdGQuZWRpdG9yKCk7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHR9KVxyXG5cdC5vbignY2xpY2sucmVtb3ZlJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93ICYmIGQucGFuZWwuZGlzcG9zZSgpO1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGQpO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0fSBjYXRjaChlKSB7XHJcbi8vXHRcdFx0XHRkaWFsb2cudGV4dChlLm1lc3NhZ2UpLm5vZGUoKS5zaG93KHdpbmRvdy5pbm5lcldpZHRoLzIsd2luZG93LmlubmVySGVpZ2h0LzIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9KVxyXG5cdC5maWx0ZXIoZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDpn7PmupDjga7jgb/jgavjg5XjgqPjg6vjgr9cclxuXHRcdHJldHVybiBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE9zY2lsbGF0b3JOb2RlIHx8IGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgQXVkaW9CdWZmZXJTb3VyY2VOb2RlIHx8IGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2VOb2RlOyBcclxuXHR9KVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g5YaN55Sf44O75YGc5q2iXHJcblx0XHRjb25zb2xlLmxvZyhkMy5ldmVudCk7XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRpZighZDMuZXZlbnQuY3RybEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxldCBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHRpZihkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkcpe1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQ7XHJcblx0XHRcdHNlbC5jbGFzc2VkKCdwbGF5JyxmYWxzZSk7XHJcblx0XHRcdGQuYXVkaW9Ob2RlLnN0b3AoMCk7XHJcblx0XHR9IGVsc2UgaWYoZC5zdGF0dXNQbGF5ICE9PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQpe1xyXG5cdFx0XHRkLmF1ZGlvTm9kZS5zdGFydCgwKTtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORztcclxuXHRcdFx0c2VsLmNsYXNzZWQoJ3BsYXknLHRydWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YWxlcnQoJ+S4gOW6puWBnOatouOBmeOCi+OBqOWGjeeUn+OBp+OBjeOBvuOBm+OCk+OAgicpO1xyXG5cdFx0fVxyXG5cdH0pXHJcblx0LmNhbGwodG9vbHRpcCgnQ3RybCArIENsaWNrIOOBp+WGjeeUn+ODu+WBnOatoicpKTtcclxuXHQ7XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu44Op44OZ44OrXHJcblx0Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdC5hdHRyKHsgeDogMCwgeTogLTEwLCAnY2xhc3MnOiAnbGFiZWwnIH0pXHJcblx0LnRleHQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubmFtZTsgfSk7XHJcblxyXG5cdC8vIOWFpeWKm0F1ZGlvUGFyYW3jga7ooajnpLpcdFxyXG5cdGdkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgZ3AgPSBzZWwuYXBwZW5kKCdnJyk7XHJcblx0XHR2YXIgZ3BkID0gZ3Auc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGQuaW5wdXRQYXJhbXMubWFwKChkKT0+e1xyXG5cdFx0XHRyZXR1cm4ge25vZGU6ZC5BdWRpb05vZGVWaWV3LGluZGV4OmR9O1xyXG5cdFx0fSksZnVuY3Rpb24oZCl7cmV0dXJuIGQuaW5kZXguaWQ7fSk7XHRcdFxyXG5cclxuXHRcdHZhciBncGRnID0gZ3BkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ2NpcmNsZScpXHJcblx0XHQuYXR0cih7J3InOiAoZCk9PmQuaW5kZXgud2lkdGgvMiwgXHJcblx0XHRjeDogMCwgY3k6IChkLCBpKT0+IHsgcmV0dXJuIGQuaW5kZXgueTsgfSxcclxuXHRcdCdjbGFzcyc6IGZ1bmN0aW9uKGQpIHtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRyZXR1cm4gJ2F1ZGlvLXBhcmFtJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gJ3BhcmFtJztcclxuXHRcdH19KTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0LmF0dHIoe3g6IChkKT0+IChkLmluZGV4LnggKyBkLmluZGV4LndpZHRoIC8gMiArIDUpLHk6KGQpPT5kLmluZGV4LnksJ2NsYXNzJzonbGFiZWwnIH0pXHJcblx0XHQudGV4dCgoZCk9PmQuaW5kZXgubmFtZSk7XHJcblxyXG5cdFx0Z3BkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cclxuXHQvLyDlh7rliptQYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHRcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5vdXRwdXRQYXJhbXMubWFwKChkKT0+e1xyXG5cdFx0XHRyZXR1cm4ge25vZGU6ZC5BdWRpb05vZGVWaWV3LGluZGV4OmR9O1xyXG5cdFx0fSksZnVuY3Rpb24oZCl7cmV0dXJuIGQuaW5kZXguaWQ7fSk7XHJcblx0XHRcclxuXHRcdHZhciBncGRnID0gZ3BkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKTtcclxuXHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiBkLndpZHRoLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogJ3BhcmFtJ30pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0LmF0dHIoe3g6IChkKT0+IChkLmluZGV4LnggKyBkLmluZGV4LndpZHRoIC8gMiArIDUpLHk6KGQpPT5kLmluZGV4LnksJ2NsYXNzJzonbGFiZWwnIH0pXHJcblx0XHQudGV4dCgoZCk9PmQuaW5kZXgubmFtZSk7XHJcblxyXG5cdFx0Z3BkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cclxuXHQvLyDlh7rlipvooajnpLpcclxuXHRnZC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcclxuXHRcdHJldHVybiBkLm51bWJlck9mT3V0cHV0cyA+IDA7XHJcblx0fSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLm91dHMgfHwgKGQudGVtcC5vdXRzICYmIChkLnRlbXAub3V0cy5sZW5ndGggPCBkLm51bWJlck9mT3V0cHV0cykpKVxyXG5cdFx0e1xyXG5cdFx0XHRkLnRlbXAub3V0cyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2kgPCBkLm51bWJlck9mT3V0cHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5vdXRzLnB1c2goe25vZGU6ZCxpbmRleDppfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBzZWwxID0gc2VsLnNlbGVjdEFsbCgnZycpO1xyXG5cdFx0dmFyIHNlbGQgPSBzZWwxLmRhdGEoZC50ZW1wLm91dHMpO1xyXG5cclxuXHRcdHNlbGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHsgeDogZC53aWR0aCAtIHVpLnBvaW50U2l6ZSAvIDIsIHk6IChkMSk9PiAoZC5vdXRwdXRTdGFydFkgKyBkMS5pbmRleCAqIDIwIC0gdWkucG9pbnRTaXplIC8gMiksIHdpZHRoOiB1aS5wb2ludFNpemUsIGhlaWdodDogdWkucG9pbnRTaXplLCAnY2xhc3MnOiAnb3V0cHV0JyB9KVxyXG5cdFx0LmNhbGwoZHJhZ091dCk7XHJcblx0XHRzZWxkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHJcblx0Ly8g5YWl5Yqb6KGo56S6XHJcblx0Z2RcclxuXHQuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XHRyZXR1cm4gZC5udW1iZXJPZklucHV0cyA+IDA7IH0pXHJcblx0LmVhY2goZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgnZycpO1xyXG5cdFx0aWYoIWQudGVtcC5pbnMgfHwgKGQudGVtcC5pbnMgJiYgKGQudGVtcC5pbnMubGVuZ3RoIDwgZC5udW1iZXJPZklucHV0cykpKVxyXG5cdFx0e1xyXG5cdFx0XHRkLnRlbXAuaW5zID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZJbnB1dHM7KytpKXtcclxuXHRcdFx0XHRkLnRlbXAuaW5zLnB1c2goe25vZGU6ZCxpbmRleDppfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBzZWwxID0gc2VsLnNlbGVjdEFsbCgnZycpO1xyXG5cdFx0dmFyIHNlbGQgPSBzZWwxLmRhdGEoZC50ZW1wLmlucyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiAtIHVpLnBvaW50U2l6ZSAvIDIsIHk6IChkMSk9PiAoZC5pbnB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdpbnB1dCcgfSlcclxuXHRcdC5vbignbW91c2VlbnRlcicsZnVuY3Rpb24oZCl7XHJcblx0XHRcdG1vdXNlT3Zlck5vZGUgPSB7bm9kZTpkLmF1ZGlvTm9kZV8scGFyYW06ZH07XHJcblx0XHR9KVxyXG5cdFx0Lm9uKCdtb3VzZWxlYXZlJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYobW91c2VPdmVyTm9kZS5ub2RlKXtcclxuXHRcdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUgPT09IGQuYXVkaW9Ob2RlXyAmJiBtb3VzZU92ZXJOb2RlLnBhcmFtID09PSBkKXtcclxuXHRcdFx0XHRcdG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRzZWxkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDkuI3opoHjgarjg47jg7zjg4njga7liYrpmaRcclxuXHRnZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHQvLyBsaW5lIOaPj+eUu1xyXG5cdHZhciBsZCA9IGxpbmVHcm91cC5zZWxlY3RBbGwoJ3BhdGgnKVxyXG5cdC5kYXRhKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucyk7XHJcblxyXG5cdGxkLmVudGVyKClcclxuXHQuYXBwZW5kKCdwYXRoJyk7XHJcblxyXG5cdGxkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBwYXRoID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIHgxLHkxLHgyLHkyO1xyXG5cclxuXHRcdC8vIHgxLHkxXHJcblx0XHRpZihkLmZyb20ucGFyYW0pe1xyXG5cdFx0XHRpZihkLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCAtIGQuZnJvbS5ub2RlLndpZHRoIC8gMiArIGQuZnJvbS5wYXJhbS54O1xyXG5cdFx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5wYXJhbS55OyBcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggKyBkLmZyb20ubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZICsgZC5mcm9tLnBhcmFtICogMjA7IFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggKyBkLmZyb20ubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHR4MiA9IGQudG8ubm9kZS54IC0gZC50by5ub2RlLndpZHRoIC8gMjtcclxuXHRcdHkyID0gZC50by5ub2RlLnkgLSBkLnRvLm5vZGUuaGVpZ2h0IC8gMjtcclxuXHRcdFxyXG5cdFx0aWYoZC50by5wYXJhbSl7XHJcblx0XHRcdGlmKGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldyB8fCBkLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MiArPSBkLnRvLnBhcmFtLng7XHJcblx0XHRcdFx0eTIgKz0gZC50by5wYXJhbS55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHkyICs9ICBkLnRvLm5vZGUuaW5wdXRTdGFydFkgICsgIGQudG8ucGFyYW0gKiAyMDtcdFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR5MiArPSBkLnRvLm5vZGUuaW5wdXRTdGFydFk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLHgyLHkyKTtcclxuXHRcdFxyXG5cdFx0cGF0aC5hdHRyKHsnZCc6bGluZShwb3MpLCdjbGFzcyc6J2xpbmUnfSk7XHJcblx0XHRwYXRoLm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoZC5mcm9tLGQudG8pO1xyXG5cdFx0XHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHR9IFxyXG5cdFx0fSkuY2FsbCh0b29sdGlwKCdTaGlmdCArIGNsaWNr44Gn5YmK6ZmkJykpO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0bGQuZXhpdCgpLnJlbW92ZSgpO1xyXG59XHJcblxyXG4vLyDnsKHmmJN0b29sdGlw6KGo56S6XHJcbmZ1bmN0aW9uIHRvb2x0aXAobWVzKVxyXG57XHJcblx0cmV0dXJuIGZ1bmN0aW9uKGQpe1xyXG5cdFx0dGhpc1xyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRzdmcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoeydjbGFzcyc6J3RpcCcseDpkMy5ldmVudC54ICsgMjAgLHk6ZDMuZXZlbnQueSAtIDIwfSlcclxuXHRcdFx0LnRleHQobWVzKTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5zZWxlY3RBbGwoJy50aXAnKS5yZW1vdmUoKTtcclxuXHRcdH0pXHJcblx0fTtcclxufVxyXG5cclxuLy8g5o6l57aa57ea44Gu5bqn5qiZ55Sf5oiQXHJcbmZ1bmN0aW9uIG1ha2VQb3MoeDEseTEseDIseTIpe1xyXG5cdHJldHVybiBbXHJcblx0XHRcdHt4OngxLHk6eTF9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKS80LHk6eTF9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKS8yLHk6eTEgKyAoeTIgLSB5MSkvMn0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpKjMvNCx5OnkyfSxcclxuXHRcdFx0e3g6eDIsIHk6eTJ9XHJcblx0XHRdO1xyXG59XHJcblxyXG4vLyDjg5fjg63jg5Hjg4bjgqPjg5Hjg43jg6vjga7ooajnpLpcclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dQYW5lbChkKXtcclxuXHJcblx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybiA7XHJcblxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkLng7XHJcblx0ZC5wYW5lbC55ID0gZC55O1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoZC5uYW1lKTtcclxuXHRcclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShkLnBhcmFtcyk7XHJcblx0dmFyIHRyID0gdGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJyk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC5hcHBlbmQoJ2lucHV0JylcclxuXHQuYXR0cih7dHlwZTpcInRleHRcIix2YWx1ZTooZCk9PmQuZ2V0KCkscmVhZG9ubHk6KGQpPT5kLnNldD9udWxsOidyZWFkb25seSd9KVxyXG5cdC5vbignY2hhbmdlJyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB2YWx1ZSA9IGQzLmV2ZW50LnRhcmdldC52YWx1ZTtcclxuXHRcdGxldCB2biA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cdFx0aWYoaXNOYU4odm4pKXtcclxuXHRcdFx0ZC5zZXQodmFsdWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZC5zZXQodm4pO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdGQucGFuZWwuc2hvdygpO1xyXG5cclxufVxyXG5cclxuLy8g44OO44O844OJ5oy/5YWl44OR44ON44Or44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dBdWRpb05vZGVQYW5lbChkKXtcclxuXHQgZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHQgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0aWYoZC5wYW5lbCl7XHJcblx0XHRpZihkLnBhbmVsLmlzU2hvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRkLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcblx0ZC5wYW5lbC54ID0gZDMuZXZlbnQub2Zmc2V0WDtcclxuXHRkLnBhbmVsLnkgPSBkMy5ldmVudC5vZmZzZXRZO1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoJ0F1ZGlvTm9kZeOBruaMv+WFpScpO1xyXG5cclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShhdWRpb05vZGVDcmVhdG9ycyk7XHJcblx0dGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJylcclxuXHQuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oZHQpe1xyXG5cdFx0Y29uc29sZS5sb2coJ+aMv+WFpScsZHQpO1xyXG5cdFx0XHJcblx0XHR2YXIgZWRpdG9yID0gZHQuZWRpdG9yIHx8IHNob3dQYW5lbDtcclxuXHRcdFxyXG5cdFx0dmFyIG5vZGUgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShkdC5jcmVhdGUoKSxlZGl0b3IpO1xyXG5cdFx0bm9kZS54ID0gZDMuZXZlbnQuY2xpZW50WDtcclxuXHRcdG5vZGUueSA9IGQzLmV2ZW50LmNsaWVudFk7XHJcblx0XHRkcmF3KCk7XHJcblx0XHQvLyBkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdC8vIGQucGFuZWwuZGlzcG9zZSgpO1xyXG5cdH0pO1xyXG5cdGQucGFuZWwuc2hvdygpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXVkaW9Ob2RlVmlldyhuYW1lKXtcclxuXHR2YXIgb2JqID0gYXVkaW9Ob2RlQ3JlYXRvcnMuZmluZCgoZCk9PntcclxuXHRcdGlmKGQubmFtZSA9PT0gbmFtZSkgcmV0dXJuIHRydWU7XHJcblx0fSk7XHJcblx0aWYob2JqKXtcclxuXHRcdHJldHVybiBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShvYmouY3JlYXRlKCksb2JqLmVkaXRvciB8fCBzaG93UGFuZWwpO1x0XHRcdFxyXG5cdH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRUcge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLmdhdGUgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ2dhdGUnLGZhbHNlKTtcclxuXHRcdHRoaXMub3V0cHV0ID0gbmV3IGF1ZGlvLlBhcmFtVmlldyh0aGlzLCdvdXRwdXQnLHRydWUpO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLmF0dGFjayA9IDAuMDAxO1xyXG5cdFx0dGhpcy5kZWNheSA9IDAuMDU7XHJcblx0XHR0aGlzLnJlbGVhc2UgPSAwLjA1O1xyXG5cdFx0dGhpcy5zdXN0YWluID0gMC4yO1xyXG5cdFx0dGhpcy5nYWluID0gMS4wO1xyXG5cdFx0dGhpcy5uYW1lID0gJ0VHJztcclxuXHRcdGF1ZGlvLmRlZklzTm90QVBJT2JqKHRoaXMsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXRzID0gW107XHJcblx0fVxyXG5cdFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTp0aGlzLm5hbWUsXHJcbiAgICAgIGF0dGFjazp0aGlzLmF0dGFjayxcclxuICAgICAgZGVjYXk6dGhpcy5kZWNheSxcclxuICAgICAgcmVsZWFzZTp0aGlzLnJlbGVhc2UsXHJcbiAgICAgIHN1c3RhaW46dGhpcy5zdXN0YWluLFxyXG4gICAgICBnYWluOnRoaXMuZ2FpblxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmcm9tSlNPTihvKXtcclxuICAgIGxldCByZXQgPSBuZXcgRUcoKTtcclxuICAgIHJldC5uYW1lID0gby5uYW1lO1xyXG4gICAgcmV0LmF0dGFjayA9IG8uYXR0YWNrO1xyXG4gICAgcmV0LmRlY2F5ID0gby5kZWNheTtcclxuICAgIHJldC5yZWxlYXNlID0gby5yZWxlYXNlO1xyXG4gICAgcmV0LnN1c3RhaW4gPSBvLnN1c3RhaW47XHJcbiAgICByZXQuZ2FpbiA9IG8uZ2FpbjtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG5cdGNvbm5lY3QoYylcclxuXHR7XHJcblx0XHRpZighIChjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdBdWRpb1BhcmFt5Lul5aSW44Go44Gv5o6l57aa44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5vdXRwdXRzLnB1c2goYy50byk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0aGlzLm91dHB1dHMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdGhpcy5vdXRwdXRzW2ldLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdGhpcy5vdXRwdXRzW2ldLnBhcmFtKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5vdXRwdXRzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHRcclxuXHRwcm9jZXNzKHRvLGNvbSx2LHQpXHJcblx0e1xyXG5cdFx0aWYodiA+IDApIHtcclxuXHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0Ly8gQURT44G+44Gn44KC44Gj44Gm44GE44GPXHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvbicsY29tLHYsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKDAsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayArIHRoaXMuZGVjYXkgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0Ly8g44Oq44Oq44O844K5XHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvZmYnLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLHQgKyB0aGlzLnJlbGVhc2UpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdGNvbnNvbGUubG9nKCdzdG9wJyk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdHBhdXNlKCl7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbi8vIC8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuLy8gZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuLy8gICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbi8vICAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbi8vICAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4vLyAgIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4vLyAgIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4vLyAgIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4vLyB9O1xyXG4vLyBcclxuLy8gRW52ZWxvcGVHZW5lcmF0b3IucHJvdG90eXBlID1cclxuLy8ge1xyXG4vLyAgIGtleW9uOiBmdW5jdGlvbiAodCx2ZWwpIHtcclxuLy8gICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbi8vICAgICB2YXIgdiA9IHRoaXMudjtcclxuLy8gICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2sgKiB2O1xyXG4vLyAgICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQwICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbi8vICAgfSxcclxuLy8gICBrZXlvZmY6IGZ1bmN0aW9uICh0KSB7XHJcbi8vICAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4vLyAgICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4vLyAgICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4vLyAgICAgLy9nYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMCwgdDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgIH1cclxuLy8gfTsiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvLmpzJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aS5qcyc7XHJcbmltcG9ydCB7c2hvd1BhbmVsfSBmcm9tICcuL2RyYXcnO1xyXG5pbXBvcnQge3Nob3dTZXF1ZW5jZUVkaXRvcn0gZnJvbSAnLi9zZXF1ZW5jZUVkaXRvcic7XHJcblxyXG5cclxuXHJcbnZhciBhdWRpb05vZGVDcmVhdG9ycyA9IHt9O1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0QXVkaW9Ob2RlQ3JlYXRvcnModil7XHJcbiAgYXVkaW9Ob2RlQ3JlYXRvcnMgPSB2O1xyXG59XHRcclxuICBcclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1ZGlvTm9kZVZpZXdmcm9tSlNPTihvKXtcclxuICBsZXQgYXVkaW9Ob2RlO1xyXG4gIGlmKG8uYXVkaW9Ob2RlKXtcclxuICAgIGF1ZGlvTm9kZSA9IGF1ZGlvTm9kZUNyZWF0b3JzW28ubmFtZV0uY3JlYXRlKG8uYXVkaW9Ob2RlKTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXVkaW9Ob2RlID0gYXVkaW9Ob2RlQ3JlYXRvcnNbby5uYW1lXS5jcmVhdGUoKTtcclxuICB9XHJcbiAgbGV0IHJldCA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvTm9kZSxhdWRpb05vZGVDcmVhdG9yc1tvLm5hbWVdLmVkaXRvcik7XHJcbiAgaWYoby5wYXJhbXMpe1xyXG4gICAgZm9yKGxldCBpIGluIG8ucGFyYW1zKXtcclxuICAgICAgcmV0W2ldID0gby5wYXJhbXNbaV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldC5pZCA9IG8uaWQ7XHJcbiAgcmV0LnggPSBvLng7XHJcbiAgcmV0LnkgPSBvLnk7XHJcbiAgcmV0Lm5hbWUgPSBvLm5hbWU7XHJcbiAgcmV0LnJlbW92YWJsZSA9IG8ucmVtb3ZhYmxlO1xyXG4gIHJldHVybiByZXQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2FkKGRhdGEpXHJcbntcclxuICBpZihkYXRhKXtcclxuICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgdmFyIGF1ZGlvTm9kZVZpZXdzID0ge307XHJcbiAgICBpZihkYXRhLmF1ZGlvTm9kZXMgJiYgZGF0YS5hdWRpb0Nvbm5lY3Rpb25zKXtcclxuICAgICAgYXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmVBbGxOb2RlVmlld3MoKTtcclxuICAgICAgZGF0YS5hdWRpb05vZGVzLmZvckVhY2goKGQpPT57XHJcbiAgICAgICAgbGV0IG5vZGVWaWV3ID0gY3JlYXRlQXVkaW9Ob2RlVmlld2Zyb21KU09OKGQpO1xyXG4gICAgICAgIGF1ZGlvTm9kZVZpZXdzW25vZGVWaWV3LmlkXSA9IG5vZGVWaWV3O1xyXG4gICAgICB9KTtcclxuICAgICAgLy8gQ29ubmVjdGlvbuOBruS9nOaIkFxyXG4gICAgICBkYXRhLmF1ZGlvQ29ubmVjdGlvbnMuZm9yRWFjaCgoZCk9PntcclxuICAgICAgICBsZXQgZnJvbU5vZGUgPSBhdWRpb05vZGVWaWV3c1tkLmZyb20ubm9kZS5pZF07XHJcbiAgICAgICAgbGV0IGZyb21QYXJhbSA9IGQuZnJvbS5wYXJhbS5uYW1lP2Zyb21Ob2RlLm91dHB1dFBhcmFtcy5maW5kKChlKT0+e1xyXG4gICAgICAgICAgcmV0dXJuIGUubmFtZSA9PT0gZC5mcm9tLnBhcmFtLm5hbWU7XHJcbiAgICAgICAgfSk6ZC5mcm9tLnBhcmFtO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0b05vZGUgPSBhdWRpb05vZGVWaWV3c1tkLnRvLm5vZGUuaWRdO1xyXG4gICAgICAgIGxldCB0b1BhcmFtID0gZC50by5wYXJhbS5uYW1lP3RvTm9kZS5pbnB1dFBhcmFtcy5maW5kKChlKT0+e1xyXG4gICAgICAgICAgcmV0dXJuIGUubmFtZSA9PT0gZC50by5wYXJhbS5uYW1lO1xyXG4gICAgICAgIH0pOmQudG8ucGFyYW07XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KFxyXG4gICAgICAgICB7bm9kZTpmcm9tTm9kZSxwYXJhbTpmcm9tUGFyYW19XHJcbiAgICAgICAgLHtub2RlOnRvTm9kZSxwYXJhbTp0b1BhcmFtfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNhdmUoKVxyXG57XHJcbiAgbGV0IHNhdmVEYXRhID0gXHJcbiAge1xyXG4gICAgYXVkaW9Ob2RlczphdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMsXHJcbiAgICBhdWRpb0Nvbm5lY3Rpb25zOltdLFxyXG4gICAgb2JqQ291bnRlcjphdWRpby5nZXRPYmplY3RDb3VudGVyKClcclxuICB9O1xyXG4gIFxyXG4gIGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5mb3JFYWNoKChkKT0+e1xyXG4gICAgbGV0IGRlc3QgPXtcclxuICAgICAgZnJvbTp7XHJcbiAgICAgICAgbm9kZTp7XHJcbiAgICAgICAgICAgaWQ6ZC5mcm9tLm5vZGUuaWQsXHJcbiAgICAgICAgICAgbmFtZTpkLmZyb20ubm9kZS5uYW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXJhbTooZC5mcm9tLnBhcmFtLm5hbWU/e1xyXG4gICAgICAgICAgbmFtZTpkLmZyb20ucGFyYW0ubmFtZVxyXG4gICAgICAgIH06ZC5mcm9tLnBhcmFtKVxyXG4gICAgICB9LFxyXG4gICAgICB0bzp7XHJcbiAgICAgICAgbm9kZTp7XHJcbiAgICAgICAgICBpZDpkLnRvLm5vZGUuaWQsXHJcbiAgICAgICAgICBuYW1lOmQudG8ubm9kZS5uYW1lXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXJhbTooZC50by5wYXJhbS5uYW1lP3tcclxuICAgICAgICAgIG5hbWU6ZC50by5wYXJhbS5uYW1lXHJcbiAgICAgICAgfTpkLnRvLnBhcmFtKVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgc2F2ZURhdGEuYXVkaW9Db25uZWN0aW9ucy5wdXNoKGRlc3QpO1xyXG4gIH0pO1xyXG5cclxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGF0YScsSlNPTi5zdHJpbmdpZnkoc2F2ZURhdGEpKTsgIFxyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZPYnNlcnZhYmxlKHRhcmdldCxwcm9wTmFtZSxvcHQgPSB7fSlcclxue1xyXG5cdCgoKT0+e1xyXG5cdFx0dmFyIHZfO1xyXG5cdFx0b3B0LmVudW1lcmFibGUgPSBvcHQuZW51bWVyYWJsZSB8fCB0cnVlO1xyXG5cdFx0b3B0LmNvbmZpZ3VyYWJsZSA9IG9wdC5jb25maWd1cmFibGUgfHwgZmFsc2U7XHJcblx0XHRvcHQuZ2V0ID0gb3B0LmdldCB8fCAoKCkgPT4gdl8pO1xyXG5cdFx0b3B0LnNldCA9IG9wdC5zZXQgfHwgKCh2KT0+e1xyXG5cdFx0XHRpZih2XyAhPSB2KXtcclxuICBcdFx0XHR2XyA9IHY7XHJcbiAgXHRcdFx0dGFyZ2V0LmVtaXQocHJvcE5hbWUgKyAnX2NoYW5nZWQnLHYpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQscHJvcE5hbWUsb3B0KTtcclxuXHR9KSgpO1xyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvLmpzJztcclxuaW1wb3J0IHtpbml0VUksZHJhdyxzdmcsc2hvd1BhbmVsIH0gZnJvbSAnLi9kcmF3JztcclxuaW1wb3J0IHtzaG93U2VxdWVuY2VFZGl0b3J9IGZyb20gJy4vc2VxdWVuY2VFZGl0b3InO1xyXG5pbXBvcnQge2xvYWQsc2F2ZSxzZXRBdWRpb05vZGVDcmVhdG9yc30gZnJvbSAnLi9sb2FkZXJTYXZlcic7XHJcblxyXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xyXG5cdGF1ZGlvLnNldEN0eChuZXcgQXVkaW9Db250ZXh0KCkpO1xyXG4gIGluaXRVSSgpO1xyXG5cclxuICBzZXRBdWRpb05vZGVDcmVhdG9ycyggXHJcblx0e1xyXG4gICAgJ0F1ZGlvRGVzdGluYXRpb25Ob2RlJzp7Y3JlYXRlOigpPT5hdWRpby5jdHguZGVzdGluYXRpb24sZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnR2Fpbk5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUdhaW4uYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ0RlbGF5Tm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlRGVsYXkuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ0F1ZGlvQnVmZmVyU291cmNlTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlQnVmZmVyU291cmNlLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZU5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZS5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnUGFubmVyTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlUGFubmVyLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdDb252b2x2ZXJOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDb252b2x2ZXIuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ0FuYWx5c2VyTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlQW5hbHlzZXIuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ0NoYW5uZWxTcGxpdHRlck5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxTcGxpdHRlci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnQ2hhbm5lbE1lcmdlck5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxNZXJnZXIuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ0R5bmFtaWNzQ29tcHJlc3Nvck5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3Nvci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnQmlxdWFkRmlsdGVyTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlQmlxdWFkRmlsdGVyLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdPc2NpbGxhdG9yTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnTWVkaWFTdHJlYW1BdWRpb1NvdXJjZU5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdXYXZlU2hhcGVyTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlV2F2ZVNoYXBlci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnRUcnOntjcmVhdGU6YXVkaW8uRUcuZnJvbUpTT04sZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnU2VxdWVuY2VyJzp7Y3JlYXRlOmF1ZGlvLlNlcXVlbmNlci5mcm9tSlNPTixlZGl0b3I6c2hvd1NlcXVlbmNlRWRpdG9yfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8vIOWHuuWKm+ODjuODvOODieOBruS9nOaIkO+8iOWJiumZpOS4jeWPr++8iVxyXG4gIGxldCBkYXRhID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RhdGEnKTtcclxuICBpZihmYWxzZS8qIWRhdGEqLyl7XHJcbiAgICBsZXQgb3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uLHNob3dQYW5lbCk7XHJcbiAgICBvdXQueCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcclxuICAgIG91dC55ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMjtcclxuICAgIG91dC5yZW1vdmFibGUgPSBmYWxzZTtcclxuICB9IGVsc2Uge1xyXG4gICAgbG9hZChkYXRhKTtcclxuICAgIGlmKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGggPT0gMCApe1xyXG4gICAgICBsZXQgb3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uLHNob3dQYW5lbCk7XHJcbiAgICAgIG91dC54ID0gd2luZG93LmlubmVyV2lkdGggLyAyO1xyXG4gICAgICBvdXQueSA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XHJcbiAgICAgIG91dC5yZW1vdmFibGUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcblx0ZDMuc2VsZWN0KHdpbmRvdylcclxuXHQub24oJ3Jlc2l6ZScsZnVuY3Rpb24oKXtcclxuXHRcdGlmKHN2Zyl7XHJcblx0XHRcdHN2Zy5hdHRyKHtcclxuXHRcdFx0XHR3aWR0aDp3aW5kb3cuaW5uZXJXaWR0aCxcclxuXHRcdFx0XHRoZWlnaHQ6d2luZG93LmlubmVySGVpZ2h0XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdGRyYXcoKTtcclxufTtcclxuXHJcbndpbmRvdy5vbmJlZm9yZXVubG9hZCA9ICgpPT57XHJcbiAgc2F2ZSgpO1xyXG59XHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuaW1wb3J0IHtVbmRvTWFuYWdlcn0gZnJvbSAnLi91bmRvJztcclxuXHJcbmNvbnN0IElucHV0VHlwZSA9IHtcclxuICBrZXlib3JkOiAwLFxyXG4gIG1pZGk6IDFcclxufVxyXG5cclxuY29uc3QgSW5wdXRDb21tYW5kID1cclxuICB7XHJcbiAgICBlbnRlcjogeyBpZDogMSwgbmFtZTogJ+ODjuODvOODiOODh+ODvOOCv+aMv+WFpScgfSxcclxuICAgIGVzYzogeyBpZDogMiwgbmFtZTogJ+OCreODo+ODs+OCu+ODqycgfSxcclxuICAgIHJpZ2h0OiB7IGlkOiAzLCBuYW1lOiAn44Kr44O844K944Or56e75YuV77yI5Y+z77yJJyB9LFxyXG4gICAgbGVmdDogeyBpZDogNCwgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOW3pu+8iScgfSxcclxuICAgIHVwOiB7IGlkOiA1LCBuYW1lOiAn44Kr44O844K944Or56e75YuV77yI5LiK77yJJyB9LFxyXG4gICAgZG93bjogeyBpZDogNiwgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOS4i++8iScgfSxcclxuICAgIGluc2VydE1lYXN1cmU6IHsgaWQ6IDcsIG5hbWU6ICflsI/nr4Dnt5rmjL/lhaUnIH0sXHJcbiAgICB1bmRvOiB7IGlkOiA4LCBuYW1lOiAn44Ki44Oz44OJ44KlJyB9LFxyXG4gICAgcmVkbzogeyBpZDogOSwgbmFtZTogJ+ODquODieOCpScgfSxcclxuICAgIHBhZ2VVcDogeyBpZDogMTAsIG5hbWU6ICfjg5rjg7zjgrjjgqLjg4Pjg5cnIH0sXHJcbiAgICBwYWdlRG93bjogeyBpZDogMTEsIG5hbWU6ICfjg5rjg7zjgrjjg4Djgqbjg7MnIH0sXHJcbiAgICBob21lOiB7IGlkOiAxMiwgbmFtZTogJ+WFiOmgreihjOOBq+enu+WLlScgfSxcclxuICAgIGVuZDogeyBpZDogMTMsIG5hbWU6ICfntYLnq6/ooYzjgavnp7vli5UnIH0sXHJcbiAgICBudW1iZXI6IHsgaWQ6IDE0LCBuYW1lOiAn5pWw5a2X5YWl5YqbJyB9LFxyXG4gICAgbm90ZTogeyBpZDogMTUsIG5hbWU6ICfjg47jg7zjg4jlhaXlipsnIH0sXHJcbiAgICBzY3JvbGxVcDogeyBpZDogMTYsIG5hbWU6ICfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjgqLjg4Pjg5cnIH0sXHJcbiAgICBzY3JvbGxEb3duOiB7IGlkOiAxNywgbmFtZTogJ+mrmOmAn+OCueOCr+ODreODvOODq+ODgOOCpuODsycgfSxcclxuICAgIGRlbGV0ZTogeyBpZDogMTgsIG5hbWU6ICfooYzliYrpmaQnIH0sXHJcbiAgICBsaW5lUGFzdGU6IHsgaWQ6IDE5LCBuYW1lOiAn6KGM44Oa44O844K544OIJyB9LFxyXG4gICAgbWVhc3VyZUJlZm9yZToge2lkOjIwLG5hbWU6J+Wwj+evgOWNmOS9jeOBruS4iuenu+WLlSd9LFxyXG4gICAgbWVhc3VyZU5leHQ6IHtpZDoyMSxuYW1lOiflsI/nr4DljZjkvY3jga7kuIvnp7vli5UnfSxcclxuICB9XHJcblxyXG4vL1xyXG5jb25zdCBLZXlCaW5kID1cclxuICB7XHJcbiAgICAxMzogW3tcclxuICAgICAga2V5Q29kZTogMTMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5lbnRlclxyXG4gICAgfV0sXHJcbiAgICAyNzogW3tcclxuICAgICAga2V5Q29kZTogMjcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5lc2NcclxuICAgIH1dLFxyXG4gICAgMzI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDMyLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzk6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubGVmdFxyXG4gICAgfV0sXHJcbiAgICAzODogW3tcclxuICAgICAga2V5Q29kZTogMzgsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC51cFxyXG4gICAgfV0sXHJcbiAgICA0MDogW3tcclxuICAgICAga2V5Q29kZTogNDAsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5kb3duXHJcbiAgICB9XSxcclxuICAgIDEwNjogW3tcclxuICAgICAga2V5Q29kZTogMTA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuaW5zZXJ0TWVhc3VyZVxyXG4gICAgfV0sXHJcbiAgICA5MDogW3tcclxuICAgICAga2V5Q29kZTogOTAsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnVuZG9cclxuICAgIH1dLFxyXG4gICAgMzM6IFt7XHJcbiAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZVVwXHJcbiAgICAgIH0se1xyXG4gICAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuc2Nyb2xsVXBcclxuICAgICAgfSx7XHJcbiAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IHRydWUsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5tZWFzdXJlQmVmb3JlXHJcbiAgICAgIH0gICAgICBdLFxyXG4gICAgODI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDgyLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH1dLFxyXG4gICAgMzQ6IFt7IC8vIFBhZ2UgRG93biBcclxuICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlRG93blxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDM0LFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuc2Nyb2xsRG93blxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgIGtleUNvZGU6IDM0LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IHRydWUsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5tZWFzdXJlTmV4dFxyXG4gICAgICB9XSxcclxuICAgIDY3OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2NyxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NyxcclxuICAgICAgICBub3RlOiAnQycsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjcsXHJcbiAgICAgICAgbm90ZTogJ0MnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDM2OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzNixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmhvbWVcclxuICAgIH1dLFxyXG4gICAgMzU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZW5kXHJcbiAgICB9XSxcclxuICAgIDk2OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5NixcclxuICAgICAgbnVtYmVyOiAwLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDk3OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5NyxcclxuICAgICAgbnVtYmVyOiAxLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDk4OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5OCxcclxuICAgICAgbnVtYmVyOiAyLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDk5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5OSxcclxuICAgICAgbnVtYmVyOiAzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMDogW3tcclxuICAgICAga2V5Q29kZTogMTAwLFxyXG4gICAgICBudW1iZXI6IDQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTAxOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDEsXHJcbiAgICAgIG51bWJlcjogNSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMixcclxuICAgICAgbnVtYmVyOiA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMzogW3tcclxuICAgICAga2V5Q29kZTogMTAzLFxyXG4gICAgICBudW1iZXI6IDcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTA0OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDQsXHJcbiAgICAgIG51bWJlcjogOCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwNSxcclxuICAgICAgbnVtYmVyOiA5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDY1OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2NSxcclxuICAgICAgbm90ZTogJ0EnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY1LFxyXG4gICAgICAgIG5vdGU6ICdBJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleUNvZGU6IDY1LFxyXG4gICAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucmVkb1xyXG4gICAgICB9XSxcclxuICAgIDY2OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2NixcclxuICAgICAgbm90ZTogJ0InLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY2LFxyXG4gICAgICAgIG5vdGU6ICdCJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfSBcclxuICAgICAgXSxcclxuICAgIDY4OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2OCxcclxuICAgICAgbm90ZTogJ0QnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY4LFxyXG4gICAgICAgIG5vdGU6ICdEJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA2OTogW3tcclxuICAgICAga2V5Q29kZTogNjksXHJcbiAgICAgIG5vdGU6ICdFJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2OSxcclxuICAgICAgICBub3RlOiAnRScsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNzA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDcwLFxyXG4gICAgICBub3RlOiAnRicsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNzAsXHJcbiAgICAgICAgbm90ZTogJ0YnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDcxOiBbe1xyXG4gICAgICBrZXlDb2RlOiA3MSxcclxuICAgICAgbm90ZTogJ0cnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDcxLFxyXG4gICAgICAgIG5vdGU6ICdHJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA4OTogW3tcclxuICAgICAga2V5Q29kZTogODksXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmRlbGV0ZVxyXG4gICAgfV0sXHJcbiAgICA3NjogW3tcclxuICAgICAga2V5Q29kZTogNzYsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmxpbmVQYXN0ZVxyXG4gICAgfV1cclxuICB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlRWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihzZXF1ZW5jZXIpIHtcclxuICAgIHZhciBzZWxmXyA9IHRoaXM7XHJcbiAgICB0aGlzLnVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgIHNlcXVlbmNlci5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnggPSBzZXF1ZW5jZXIueDtcclxuICAgIHNlcXVlbmNlci5wYW5lbC55ID0gc2VxdWVuY2VyLnk7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwud2lkdGggPSAxMDI0O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLmhlaWdodCA9IDc2ODtcclxuICAgIHNlcXVlbmNlci5wYW5lbC5oZWFkZXIudGV4dCgnU2VxdWVuY2UgRWRpdG9yJyk7XHJcbiAgICB2YXIgZWRpdG9yID0gc2VxdWVuY2VyLnBhbmVsLmFydGljbGUuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdzZXEtZWRpdG9yJywgdHJ1ZSk7XHJcbiAgICB2YXIgZGl2ID0gZWRpdG9yLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnaGVhZGVyJywgdHJ1ZSk7XHJcblx0IFxyXG4gICAgLy8g44K/44Kk44Og44OZ44O844K5XHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnVGltZSBCYXNlOicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAnaWQnOiAndGltZS1iYXNlJyB9KVxyXG4gICAgICAuYXR0cigndmFsdWUnLCAodikgPT4gdilcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIgPSBwYXJzZUZsb2F0KGQzLmV2ZW50LnRhcmdldC52YWx1ZSkgfHwgZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLm9uKCd0cGJfY2hhbmdlZCcsICh2KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF0dHIoJ3ZhbHVlJywgdik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAvLyDjg4bjg7Pjg51cclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdUZW1wbzonKTtcclxuICAgIGRpdi5hcHBlbmQoJ2lucHV0JylcclxuLy8gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJyB9KVxyXG4gICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0gPSBwYXJzZUZsb2F0KGQzLmV2ZW50LnRhcmdldC52YWx1ZSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLm9uKCdicG1fY2hhbmdlZCcsICh2KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF0dHIoJ3ZhbHVlJywgdik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdCZWF0OicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ3ZhbHVlJzogKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYmVhdCB9KVxyXG4gICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGQpe1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUuYmVhdCA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJykpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnIC8gJyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAndmFsdWUnOiAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5iYXIgfSlcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5iYXIgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpKTtcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgIC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv1xyXG4gICAgbGV0IHRyYWNrRWRpdCA9IGVkaXRvci5zZWxlY3RBbGwoJ2Rpdi50cmFjaycpXHJcbiAgICAgIC5kYXRhKHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzKVxyXG4gICAgICAuZW50ZXIoKVxyXG4gICAgICAuYXBwZW5kKCdkaXYnKVxyXG4gICAgICAuY2xhc3NlZCgndHJhY2snLCB0cnVlKVxyXG4gICAgICAuYXR0cih7ICdpZCc6IChkLCBpKSA9PiAndHJhY2stJyArIChpICsgMSksICd0YWJpbmRleCc6ICcwJyB9KTtcclxuXHJcbiAgICBsZXQgdHJhY2tIZWFkZXIgPSB0cmFja0VkaXQuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCd0cmFjay1oZWFkZXInLCB0cnVlKTtcclxuICAgIHRyYWNrSGVhZGVyLmFwcGVuZCgnc3BhbicpLnRleHQoKGQsIGkpID0+ICdUUjonICsgKGkgKyAxKSk7XHJcbiAgICB0cmFja0hlYWRlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdNRUFTOicpO1xyXG4gICAgbGV0IHRyYWNrQm9keSA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWJvZHknLCB0cnVlKTtcclxuICAgIGxldCBldmVudEVkaXQgPSB0cmFja0JvZHkuYXBwZW5kKCd0YWJsZScpO1xyXG4gICAgbGV0IGhlYWRyb3cgPSBldmVudEVkaXQuYXBwZW5kKCd0aGVhZCcpLmFwcGVuZCgndHInKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ00jJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTIycpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTlQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ04jJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1QnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1ZFJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdDTycpO1xyXG4gICAgbGV0IGV2ZW50Qm9keSA9IGV2ZW50RWRpdC5hcHBlbmQoJ3Rib2R5JykuYXR0cignaWQnLCAoZCwgaSkgPT4gJ3RyYWNrLScgKyAoaSArIDEpICsgJy1ldmVudHMnKTtcclxuICAgIC8vdGhpcy5kcmF3RXZlbnRzKGV2ZW50Qm9keSk7XHJcblxyXG4gICAgLy8g44OG44K544OI44OH44O844K/XHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IDEyNzsgaSArPSA4KSB7XHJcbiAgICAvLyAgIGZvciAodmFyIGogPSBpOyBqIDwgKGkgKyA4KTsgKytqKSB7XHJcbiAgICAvLyAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3NbMF0uYWRkRXZlbnQobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCwgaiwgNikpO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyAgIHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzWzBdLmFkZEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlRW5kKCkpO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv+ODoeOCpOODs1xyXG5cclxuICAgIHRyYWNrRWRpdC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGlmICghdGhpcy5lZGl0b3IpIHtcclxuICAgICAgICB0aGlzLmVkaXRvciA9IGRvRWRpdG9yKGQzLnNlbGVjdCh0aGlzKSwgc2VsZl8pO1xyXG4gICAgICAgIHRoaXMuZWRpdG9yLm5leHQoKTtcclxuICAgICAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g44Kt44O85YWl5Yqb44OP44Oz44OJ44OpXHJcbiAgICB0cmFja0VkaXQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICBsZXQgZSA9IGQzLmV2ZW50O1xyXG4gICAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xyXG4gICAgICBsZXQga2V5ID0gS2V5QmluZFtlLmtleUNvZGVdO1xyXG4gICAgICBsZXQgcmV0ID0ge307XHJcbiAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICBrZXkuc29tZSgoZCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGQuY3RybEtleSA9PSBlLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgZC5zaGlmdEtleSA9PSBlLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICYmIGQuYWx0S2V5ID09IGUuYWx0S2V5XHJcbiAgICAgICAgICAgICYmIGQubWV0YUtleSA9PSBlLm1ldGFLZXlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldCA9IHRoaXMuZWRpdG9yLm5leHQoZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyZXQudmFsdWUpIHtcclxuICAgICAgICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLm9uKCdzaG93JywgKCkgPT4ge1xyXG4gICAgICBkMy5zZWxlY3QoJyN0aW1lLWJhc2UnKS5ub2RlKCkuZm9jdXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5vbignZGlzcG9zZScsICgpID0+IHtcclxuICAgICAgZGVsZXRlIHNlcXVlbmNlci5lZGl0b3JJbnN0YW5jZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5zaG93KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDjgqjjg4fjgqPjgr/mnKzkvZNcclxuZnVuY3Rpb24qIGRvRWRpdG9yKHRyYWNrRWRpdCwgc2VxRWRpdG9yKSB7XHJcbiAgbGV0IGtleWNvZGUgPSAwOy8vIOWFpeWKm+OBleOCjOOBn+OCreODvOOCs+ODvOODieOCkuS/neaMgeOBmeOCi+WkieaVsFxyXG4gIGxldCB0cmFjayA9IHRyYWNrRWRpdC5kYXR1bSgpOy8vIOePvuWcqOe3qOmbhuS4reOBruODiOODqeODg+OCr1xyXG4gIGxldCBlZGl0VmlldyA9IGQzLnNlbGVjdCgnIycgKyB0cmFja0VkaXQuYXR0cignaWQnKSArICctZXZlbnRzJyk7Ly/nt6jpm4bnlLvpnaLjga7jgrvjg6zjgq/jgrfjg6fjg7NcclxuICBsZXQgbWVhc3VyZSA9IDE7Ly8g5bCP56+AXHJcbiAgbGV0IHN0ZXAgPSAxOy8vIOOCueODhuODg+ODl05vXHJcbiAgbGV0IHJvd0luZGV4ID0gMDsvLyDnt6jpm4bnlLvpnaLjga7nj77lnKjooYxcclxuICBsZXQgY3VycmVudEV2ZW50SW5kZXggPSAwOy8vIOOCpOODmeODs+ODiOmFjeWIl+OBrue3qOmbhumWi+Wni+ihjFxyXG4gIGxldCBjZWxsSW5kZXggPSAyOy8vIOWIl+OCpOODs+ODh+ODg+OCr+OCuVxyXG4gIGxldCBjYW5jZWxFdmVudCA9IGZhbHNlOy8vIOOCpOODmeODs+ODiOOCkuOCreODo+ODs+OCu+ODq+OBmeOCi+OBi+OBqeOBhuOBi1xyXG4gIGxldCBsaW5lQnVmZmVyID0gbnVsbDsvL+ihjOODkOODg+ODleOCoVxyXG4gIGNvbnN0IE5VTV9ST1cgPSA0NzsvLyDvvJHnlLvpnaLjga7ooYzmlbBcclxuXHRcclxuICBmdW5jdGlvbiBzZXRJbnB1dCgpIHtcclxuICAgIHRoaXMuYXR0cignY29udGVudEVkaXRhYmxlJywgJ3RydWUnKTtcclxuICAgIHRoaXMub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxKTtcclxuICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICBjZWxsSW5kZXggPSB0aGlzLmNlbGxJbmRleDtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBzZXRCbHVyKGRlc3Qpe1xyXG4gICAgc3dpdGNoKGRlc3Qpe1xyXG4gICAgICAgY2FzZSAnbm90ZU5hbWUnOlxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMub24oJ2JsdXInLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgIGQuc2V0Tm90ZU5hbWVUb05vdGUodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gZC5uYW1lO1xyXG4gICAgICAgICAgICAgIC8vIE5vdGVOb+ihqOekuuOCguabtOaWsFxyXG4gICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5jZWxsc1szXS5pbm5lclRleHQgPSBkLm5vdGU7XHJcbiAgICAgICAgICAgIH0pOy8vIE5vdGVcclxuICAgICAgICAgIH1cclxuICAgICAgIGJyZWFrO1xyXG4gICAgICAgY2FzZSAnbm90ZSc6XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vbignYmx1cicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgbGV0IHYgPSBwYXJzZUZsb2F0KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgICBpZighaXNOYU4odikpe1xyXG4gICAgICAgICAgICAgICAgZC5ub3RlID0gcGFyc2VGbG9hdCh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUuY2VsbHNbMl0uaW5uZXJUZXh0ID0gZC5uYW1lO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZihkLm5vZGUpe1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmlubmVyVGV4dCA9IGQubm90ZTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmNlbGxzWzJdLmlubmVyVGV4dCA9IGQubmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgICBjYXNlICdzdGVwJzpcclxuICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICB0aGlzLm9uKCdibHVyJyxmdW5jdGlvbihkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgbGV0IHYgPSBwYXJzZUZsb2F0KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgICBpZighaXNOYU4odikpe1xyXG4gICAgICAgICAgICAgICAgaWYoZC5zdGVwICE9IHYpe1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay51cGRhdGVOb3RlU3RlcChyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4LGQsdik7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmKGQuc3RlcCl7IFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLmlubmVyVGV4dCA9IGQuc3RlcDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICB0aGlzLm9uKCdibHVyJyxmdW5jdGlvbihkKVxyXG4gICAgICB7XHJcbiAgICAgICAgbGV0IHYgPSBwYXJzZUZsb2F0KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICBpZighaXNOYU4odikpe1xyXG4gICAgICAgICAgZFtkZXN0XSA9IHY7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmKGRbZGVzdF0pe1xyXG4gICAgICAgICAgICB0aGlzLmlubmVyVGV4dCA9IGRbZGVzdF07ICAgICAgICAgIFxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pbm5lclRleHQgPSAnJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgXHJcbiAgXHJcbiAgLy8g5pei5a2Y44Kk44OZ44Oz44OI44Gu6KGo56S6XHJcbiAgZnVuY3Rpb24gZHJhd0V2ZW50KCkge1xyXG4gICAgbGV0IGV2ZmxhZ21lbnQgPSB0cmFjay5ldmVudHMuc2xpY2UoY3VycmVudEV2ZW50SW5kZXgsIGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyk7XHJcbiAgICBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykucmVtb3ZlKCk7XHJcbiAgICBsZXQgc2VsZWN0ID0gZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLmRhdGEoZXZmbGFnbWVudCk7XHJcbiAgICBsZXQgZW50ZXIgPSBzZWxlY3QuZW50ZXIoKTtcclxuICAgIGxldCByb3dzID0gZW50ZXIuYXBwZW5kKCd0cicpLmF0dHIoJ2RhdGEtaW5kZXgnLCAoZCwgaSkgPT4gaSk7XHJcbiAgICByb3dzLmVhY2goZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgbGV0IHJvdyA9IGQzLnNlbGVjdCh0aGlzKTtcclxuICAgICAgLy9yb3dJbmRleCA9IGk7XHJcbiAgICAgIHN3aXRjaCAoZC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLm1lYXN1cmUpOy8vIE1lYXNldXJlICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLnN0ZXBObyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5uYW1lKS5jYWxsKHNldElucHV0KS8vIE5vdGVcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ25vdGVOYW1lJykpO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQubm90ZSkuY2FsbChzZXRJbnB1dCkvLyBOb3RlICNcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ25vdGUnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5zdGVwKS5jYWxsKHNldElucHV0KS8vIFN0ZXBcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ3N0ZXAnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5nYXRlKS5jYWxsKHNldElucHV0KS8vIEdhdGVcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ2dhdGUnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC52ZWwpLmNhbGwoc2V0SW5wdXQpLy8gVmVsb2NpdHlcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ3ZlbCcpKTtcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLmNvbSkuY2FsbChzZXRJbnB1dCk7Ly8gQ29tbWFuZFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTWVhc3VyZUVuZDpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBTdGVwICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJylcclxuICAgICAgICAgICAgLmF0dHIoeyAnY29sc3Bhbic6IDYsICd0YWJpbmRleCc6IDAgfSlcclxuICAgICAgICAgICAgLnRleHQoJyAtLS0gKCcgKyB0cmFjay5tZWFzdXJlc1tkLm1lYXN1cmVdLnN0ZXBUb3RhbCArICcpIC0tLSAnKVxyXG4gICAgICAgICAgICAub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5UcmFja0VuZDpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBTdGVwICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJylcclxuICAgICAgICAgICAgLmF0dHIoeyAnY29sc3Bhbic6IDYsICd0YWJpbmRleCc6IDAgfSlcclxuICAgICAgICAgICAgLnRleHQoJyAtLS0gVHJhY2sgRW5kIC0tLSAnKVxyXG4gICAgICAgICAgICAub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICA7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHJvd0luZGV4ID4gKGV2ZmxhZ21lbnQubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSBldmZsYWdtZW50Lmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5Xjgqnjg7zjgqvjgrlcclxuICBmdW5jdGlvbiBmb2N1c0V2ZW50KCkge1xyXG4gICAgbGV0IGV2cm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSk7XHJcbiAgICBsZXQgZXYgPSBldnJvdy5kYXR1bSgpO1xyXG4gICAgc3dpdGNoIChldi50eXBlKSB7XHJcbiAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk5vdGU6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTWVhc3VyZUVuZDpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMl0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuVHJhY2tFbmQ6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzWzJdLmZvY3VzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruaMv+WFpVxyXG4gIGZ1bmN0aW9uIGluc2VydEV2ZW50KHJvd0luZGV4KSB7XHJcbiAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyh7XHJcbiAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgdGhpcy5jZWxsSW5kZXggPSBjZWxsSW5kZXg7XHJcbiAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTtcclxuICAgICAgfSxcclxuICAgICAgZXhlY18oKSB7XHJcbiAgICAgICAgdmFyIHJvdyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkuaW5zZXJ0Um93KHRoaXMucm93SW5kZXgpKVxyXG4gICAgICAgICAgLmRhdHVtKG5ldyBhdWRpby5Ob3RlRXZlbnQoKSk7XHJcbiAgICAgICAgY2VsbEluZGV4ID0gMjtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpOy8vIE1lYXNldXJlICNcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpOy8vIFN0ZXAgI1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dClcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCdub3RlTmFtZScpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpLy8gTm90ZSAjXHJcbiAgICAgICAgLmNhbGwoc2V0Qmx1cignbm90ZScpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpLy8gU3RlcFxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ3N0ZXAnKSk7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KS8vIEdhdGVcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCdnYXRlJykpO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCkvLyBWZWxvY2l0eVxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ3ZlbCcpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIENvbW1hbmRcclxuICAgICAgICByb3cubm9kZSgpLmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIHJvdy5hdHRyKCdkYXRhLW5ldycsIHRydWUpO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCkge1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpIHtcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgIHRoaXMucm93LmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5paw6KaP5YWl5Yqb6KGM44Gu56K65a6aXHJcbiAgZnVuY3Rpb24gZW5kTmV3SW5wdXQoZG93biA9IHRydWUpIHtcclxuICAgIGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JywgbnVsbCk7XHJcbiAgICAvLyAx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44KS5qSc57Si44GZ44KLXHJcbiAgICBsZXQgYmVmb3JlQ2VsbHMgPSBbXTtcclxuICAgIGxldCBzciA9IHJvd0luZGV4IC0gMTtcclxuICAgIHdoaWxlIChzciA+PSAwKSB7XHJcbiAgICAgIHZhciB0YXJnZXQgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbc3JdKTtcclxuICAgICAgaWYgKHRhcmdldC5kYXR1bSgpLnR5cGUgPT09IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKSB7XHJcbiAgICAgICAgYmVmb3JlQ2VsbHMgPSB0YXJnZXQubm9kZSgpLmNlbGxzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIC0tc3I7XHJcbiAgICB9XHJcbiAgICAvLyDnj77lnKjjga7nt6jpm4booYxcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHM7XHJcbiAgICBsZXQgZXYgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5kYXR1bSgpO1xyXG4gICAgLy8g44Ko44OZ44Oz44OI44KS55Sf5oiQ44GZ44KLXHJcbiAgICAvLyDjg4fjg7zjgr/jgYzkvZXjgoLlhaXlipvjgZXjgozjgabjgYTjgarjgYTjgajjgY3jga/jgIEx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44KS6KSH6KO944GZ44KL44CCXHJcbiAgICAvLyAx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44GM44Gq44GE44Go44GN44KE5LiN5q2j44OH44O844K/44Gu5aC05ZCI44Gv44CB44OH44OV44Kp44Or44OI5YCk44KS5Luj5YWl44GZ44KL44CCXHJcbiAgICBsZXQgbm90ZU5vID0gMDtcclxuICAgIGlmIChjZWxsSW5kZXggPT0gMikge1xyXG4gICAgICBsZXQgbm90ZSA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdLmlubmVyVGV4dFxyXG4gICAgICAgfHwgKGJlZm9yZUNlbGxzWzJdID8gYmVmb3JlQ2VsbHNbMl0uaW5uZXJUZXh0IDogJ0MgMCcpO1xyXG4gICAgICBldi5zZXROb3RlTmFtZVRvTm90ZShub3RlLCBiZWZvcmVDZWxsc1syXSA/IGJlZm9yZUNlbGxzWzJdLmlubmVyVGV4dCA6ICcnKTtcclxuICAgICAgbm90ZU5vID0gZXYubm90ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5vdGVObyA9IHBhcnNlRmxvYXQoY3VyUm93WzNdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbM10gPyBiZWZvcmVDZWxsc1szXS5pbm5lclRleHQgOiAnNjAnKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNOYU4obm90ZU5vKSkgbm90ZU5vID0gNjA7XHJcbiAgICBsZXQgc3RlcCA9IHBhcnNlRmxvYXQoY3VyUm93WzRdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbNF0gPyBiZWZvcmVDZWxsc1s0XS5pbm5lclRleHQgOiAnOTYnKSk7XHJcbiAgICBpZiAoaXNOYU4oc3RlcCkpIHN0ZXAgPSA5NjtcclxuICAgIGxldCBnYXRlID0gcGFyc2VGbG9hdChjdXJSb3dbNV0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s1XSA/IGJlZm9yZUNlbGxzWzVdLmlubmVyVGV4dCA6ICcyNCcpKTtcclxuICAgIGlmIChpc05hTihnYXRlKSkgZ2F0ZSA9IDI0O1xyXG4gICAgbGV0IHZlbCA9IHBhcnNlRmxvYXQoY3VyUm93WzZdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbNl0gPyBiZWZvcmVDZWxsc1s2XS5pbm5lclRleHQgOiAnMS4wJykpO1xyXG4gICAgaWYgKGlzTmFOKHZlbCkpIHZlbCA9IDEuMFxyXG4gICAgbGV0IGNvbSA9IC8qY3VyUm93WzddLmlubmVyVGV4dCB8fCBiZWZvcmVDZWxsc1s3XT9iZWZvcmVDZWxsc1s3XS5pbm5lclRleHQ6Ki9uZXcgYXVkaW8uQ29tbWFuZCgpO1xyXG5cclxuICAgIGV2Lm5vdGUgPSBub3RlTm87XHJcbiAgICBldi5zdGVwID0gc3RlcDtcclxuICAgIGV2LmdhdGUgPSBnYXRlO1xyXG4gICAgZXYudmVsID0gdmVsO1xyXG4gICAgZXYuY29tbWFuZCA9IGNvbTtcclxuICAgIC8vICAgICAgICAgICAgdmFyIGV2ID0gbmV3IGF1ZGlvLk5vdGVFdmVudChzdGVwLCBub3RlTm8sIGdhdGUsIHZlbCwgY29tKTtcclxuICAgIC8vIOODiOODqeODg+OCr+OBq+ODh+ODvOOCv+OCkuOCu+ODg+ODiFxyXG4gICAgdHJhY2suaW5zZXJ0RXZlbnQoZXYsIHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpO1xyXG4gICAgZXYucGxheU9uZXNob3QodHJhY2spO1xyXG4gICAgaWYgKGRvd24pIHtcclxuICAgICAgaWYgKHJvd0luZGV4ID09IChOVU1fUk9XIC0gMSkpIHtcclxuICAgICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICsrcm93SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOaMv+WFpeW+jOOAgeWGjeaPj+eUu1xyXG4gICAgZHJhd0V2ZW50KCk7XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIHBsYXlPbmVzaG90KCl7XHJcbiAgICBsZXQgZXYgPSB0cmFjay5ldmVudHNbcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleF07XHJcbiAgICBpZihldi50eXBlID09PSBhdWRpby5FdmVudFR5cGUuTm90ZSl7XHJcbiAgICAgIGV2LnBsYXlPbmVzaG90KHRyYWNrKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gYWRkUm93KGRlbHRhKVxyXG4gIHtcclxuICAgIHBsYXlPbmVzaG90KCk7XHJcbiAgICByb3dJbmRleCArPSBkZWx0YTtcclxuICAgIGxldCByb3dMZW5ndGggPSBlZGl0Vmlldy5ub2RlKCkucm93cy5sZW5ndGg7XHJcbiAgICBpZihyb3dJbmRleCA+PSByb3dMZW5ndGgpe1xyXG4gICAgICBsZXQgZCA9IHJvd0luZGV4IC0gcm93TGVuZ3RoICsgMTtcclxuICAgICAgcm93SW5kZXggPSByb3dMZW5ndGggLSAxO1xyXG4gICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XIC0xKSA8ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IGQ7XHJcbiAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyAtMSkgPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSBOVU1fUk9XICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgaWYocm93SW5kZXggPCAwKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleDtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBpZihjdXJyZW50RXZlbnRJbmRleCAhPSAwKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4IDwgMCl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICB9IFxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gIH1cclxuICAgIFxyXG4gIGRyYXdFdmVudCgpO1xyXG4gIHdoaWxlICh0cnVlKSB7XHJcbiAgICBjb25zb2xlLmxvZygnbmV3IGxpbmUnLCByb3dJbmRleCwgdHJhY2suZXZlbnRzLmxlbmd0aCk7XHJcbiAgICBpZiAodHJhY2suZXZlbnRzLmxlbmd0aCA9PSAwIHx8IHJvd0luZGV4ID4gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgfVxyXG4gICAga2V5bG9vcDpcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIGxldCBpbnB1dCA9IHlpZWxkIGNhbmNlbEV2ZW50O1xyXG4gICAgICBzd2l0Y2ggKGlucHV0LmlucHV0Q29tbWFuZC5pZCkge1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmVudGVyLmlkOi8vRW50ZXJcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdDUi9MRicpO1xyXG4gICAgICAgICAgLy8g54++5Zyo44Gu6KGM44GM5paw6KaP44GL57eo6ZuG5Lit44GLXHJcbiAgICAgICAgICBsZXQgZmxhZyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jyk7XHJcbiAgICAgICAgICBpZiAoZmxhZykge1xyXG4gICAgICAgICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucmlnaHQuaWQ6Ly8gcmlnaHQgQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNlbGxJbmRleCsrO1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPiAoY3VyUm93W3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgIGNlbGxJbmRleCA9IDI7XHJcbiAgICAgICAgICAgICAgaWYgKHJvd0luZGV4IDwgKGN1clJvdy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgYWRkUm93KDEpO1xyXG4gICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5udW1iZXIuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYgKGN1ckRhdGEudHlwZSAhPSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgIGNlbGxJbmRleCA9IDM7XHJcbiAgICAgICAgICAgICAgbGV0IGNlbGwgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XTtcclxuICAgICAgICAgICAgICBjZWxsLmlubmVyVGV4dCA9IGlucHV0Lm51bWJlcjtcclxuICAgICAgICAgICAgICBsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICAgIHNlbC5jb2xsYXBzZShjZWxsLCAxKTtcclxuICAgICAgICAgICAgICAvLyBzZWwuc2VsZWN0KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLm5vdGUuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYgKGN1ckRhdGEudHlwZSAhPSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgIGxldCBjZWxsID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF07XHJcbiAgICAgICAgICAgICAgY2VsbC5pbm5lclRleHQgPSBpbnB1dC5ub3RlO1xyXG4gICAgICAgICAgICAgIGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgc2VsLmNvbGxhcHNlKGNlbGwsIDEpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubGVmdC5pZDovLyBsZWZ0IEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIC0tY2VsbEluZGV4O1xyXG4gICAgICAgICAgICBpZiAoY2VsbEluZGV4IDwgMikge1xyXG4gICAgICAgICAgICAgIGlmIChyb3dJbmRleCAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNlbGxJbmRleCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgYWRkUm93KC0xKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnVwLmlkOi8vIFVwIEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhZGRSb3coLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmRvd24uaWQ6Ly8gRG93biBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkUm93KDEpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5wYWdlRG93bi5pZDovLyBQYWdlIERvd24g44Kt44O8XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucGFnZVVwLmlkOi8vIFBhZ2UgVXAg44Kt44O8XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+OCouODg+ODl1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnNjcm9sbFVwLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgLS1jdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICBcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+ODgOOCpuODs1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnNjcm9sbERvd24uaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA8PSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5qyh44Gu5bCP56+A44Gr56e75YuVXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubWVhc3VyZU5leHQuaWQ6XHJcbiAgICAgICAgICB7IGxldCBtZWFzdXJlID0gdHJhY2suZXZlbnRzW2N1cnJlbnRFdmVudEluZGV4ICsgcm93SW5kZXhdLm1lYXN1cmU7XHJcbiAgICAgICAgICAgIGlmKChtZWFzdXJlICsgMSkgPCB0cmFjay5tZWFzdXJlcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gdHJhY2subWVhc3VyZXNbbWVhc3VyZSArIDFdLnN0YXJ0SW5kZXg7XHJcbiAgICAgICAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPiBzdGFydEluZGV4KXtcclxuICAgICAgICAgICAgICAgIHJvd0luZGV4ID0gc3RhcnRJbmRleCAtIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IHN0YXJ0SW5kZXggLSByb3dJbmRleDtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5YmN44Gu5bCP56+A44Gr56e75YuVXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubWVhc3VyZUJlZm9yZS5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1lYXN1cmUgPSB0cmFjay5ldmVudHNbY3VycmVudEV2ZW50SW5kZXggKyByb3dJbmRleF0ubWVhc3VyZTtcclxuICAgICAgICAgICAgaWYobWVhc3VyZSA+IDApe1xyXG4gICAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gdHJhY2subWVhc3VyZXNbbWVhc3VyZSAtIDFdLnN0YXJ0SW5kZXg7XHJcbiAgICAgICAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPD0gc3RhcnRJbmRleCl7XHJcbiAgICAgICAgICAgICAgICByb3dJbmRleCA9IHN0YXJ0SW5kZXggLSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSBzdGFydEluZGV4IC0gcm93SW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpZihjdXJyZW50RXZlbnRJbmRleCA8IDApe1xyXG4gICAgICAgICAgICAgICAgICByb3dJbmRleCAtPSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOWFiOmgreihjOOBq+enu+WLlVxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmhvbWUuaWQ6XHJcbiAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5pyA57WC6KGM44Gr56e75YuVXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuZW5kLmlkOlxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ICE9ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g6KGM5YmK6ZmkXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuZGVsZXRlLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZigocm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCkgPT0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZXhlYygpIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRFdmVudEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnQgPSB0cmFjay5ldmVudHNbdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucm93RGF0YSA9IHRyYWNrLmV2ZW50c1t0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVCdWZmZXIgPSB0aGlzLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gbGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgbGluZUJ1ZmZlciA9IHRoaXMuZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIHRyYWNrLmRlbGV0ZUV2ZW50KHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgICAgICAgICBsaW5lQnVmZmVyID0gdGhpcy5saW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudCh0aGlzLmV2ZW50LCB0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjg6njgqTjg7Pjg5Djg4Pjg5XjgqHjga7lhoXlrrnjgpLjg5rjg7zjgrnjg4jjgZnjgotcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5saW5lUGFzdGUuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lQnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQobGluZUJ1ZmZlci5jbG9uZSgpLCByb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICByZWRvKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KHRoaXMubGluZUJ1ZmZlci5jbG9uZSgpLCB0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIHJlZG8gICBcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5yZWRvLmlkOlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLnJlZG8oKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIHVuZG8gIFxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnVuZG8uaWQ6XHJcbiAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIudW5kbygpO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5bCP56+A57ea5oy/5YWlXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuaW5zZXJ0TWVhc3VyZS5pZDovLyAqXHJcbiAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlRW5kKCksIHRoaXMuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICByZWRvKCkge1xyXG4gICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQobmV3IGF1ZGlvLk1lYXN1cmVFbmQoKSwgdGhpcy5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44OH44OV44Kp44Or44OIXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnZGVmYXVsdCcpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTZXF1ZW5jZUVkaXRvcihkKSB7XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0IGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0IGlmIChkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93KSByZXR1cm47XHJcblx0IGQuZWRpdG9ySW5zdGFuY2UgPSBuZXcgU2VxdWVuY2VFZGl0b3IoZCk7XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5pbXBvcnQgKiBhcyBwcm9wIGZyb20gJy4vcHJvcCc7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXAgPSAwLG5hbWUgPSBcIlwiKXtcclxuXHRcdHRoaXMuc3RlcCA9IHN0ZXA7XHJcblx0XHR0aGlzLnN0ZXBObyA9IDA7XHJcblx0XHR0aGlzLm1lYXN1cmUgPSAwO1xyXG5cdFx0dGhpcy5uYW1lID0gIG5hbWU7XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBDb21tYW5kVHlwZSA9IHtcclxuICBzZXRWYWx1ZUF0VGltZTowLFxyXG4gIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lOjEsXHJcbiAgZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZToyICBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSlcclxue1xyXG5cdGF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuY29uc3QgY29tbWFuZEZ1bmNzID1bXHJcbiAgc2V0VmFsdWVBdFRpbWUsXHJcbiAgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUsXHJcbiAgZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZVxyXG5dO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tYW5kIHtcclxuXHRjb25zdHJ1Y3RvcihwaXRjaENvbW1hbmQgPSBDb21tYW5kVHlwZS5zZXRWYWx1ZUF0VGltZSx2ZWxvY2l0eUNvbW1hbmQgPSBDb21tYW5kVHlwZS5zZXRWYWx1ZUF0VGltZSlcclxuXHR7XHJcbiAgICB0aGlzLnBpdGNoQ29tbWFuZCA9IHBpdGNoQ29tbWFuZDtcclxuICAgIHRoaXMudmVsb2NpdHlDb21tYW5kID0gdmVsb2NpdHlDb21tYW5kO1xyXG5cdFx0dGhpcy5wcm9jZXNzUGl0Y2ggPSBjb21tYW5kRnVuY3NbcGl0Y2hDb21tYW5kXS5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5wcm9jZXNzVmVsb2NpdHkgPSBjb21tYW5kRnVuY3NbdmVsb2NpdHlDb21tYW5kXS5iaW5kKHRoaXMpO1xyXG5cdH1cclxuICBcclxuICB0b0pTT04oKVxyXG4gIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBpdGNoQ29tbWFuZDp0aGlzLnBpdGNoQ29tbWFuZCxcclxuICAgICAgdmVsb2NpdHlDb21tYW5kOnRoaXMudmVsb2NpdHlDb21tYW5kXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obyl7XHJcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoby5waXRjaENvbW1hbmQsby52ZWxvY2l0eUNvbW1hbmQpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IEV2ZW50VHlwZSAgPSB7XHJcblx0Tm90ZTowLFxyXG5cdE1lYXN1cmVFbmQ6MSxcclxuXHRUcmFja0VuZDoyXHJcbn1cclxuXHJcbi8vIOWwj+evgOe3mlxyXG5leHBvcnQgY2xhc3MgTWVhc3VyZUVuZCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKDApO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLk1lYXN1cmVFbmQ7XHJcbiAgICB0aGlzLnN0ZXBUb3RhbCA9IDA7XHJcbiAgICB0aGlzLnN0YXJ0SW5kZXggPSAwO1xyXG4gICAgdGhpcy5lbmRJbmRleCA9IDA7XHJcblx0fVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTonTWVhc3VyZUVuZCcsXHJcbiAgICAgIG1lYXN1cmU6dGhpcy5tZWFzdXJlLFxyXG4gICAgICBzdGVwTm86dGhpcy5zdGVwTm8sXHJcbiAgICAgIHN0ZXA6dGhpcy5zdGVwLFxyXG4gICAgICB0eXBlOnRoaXMudHlwZSxcclxuICAgICAgc3RlcFRvdGFsOnRoaXMuc3RlcFRvdGFsLFxyXG4gICAgICBzdGFydEluZGV4OnRoaXMuc3RhcnRJbmRleCxcclxuICAgICAgZW5kSW5kZXg6dGhpcy5lbmRJbmRleFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21KU09OKG8pe1xyXG4gICAgbGV0IHJldCA9IG5ldyBNZWFzdXJlRW5kKCk7XHJcbiAgICByZXQubWVhc3VyZSA9IG8ubWVhc3VyZTtcclxuICAgIHJldC5zdGVwTm8gPSBvLnN0ZXBObztcclxuICAgIHJldC5zdGVwID0gby5zdGVwO1xyXG4gICAgcmV0LnN0ZXBUb3RhbCA9IG8uc3RlcFRvdGFsO1xyXG4gICAgcmV0LnN0YXJ0SW5kZXggPSBvLnN0YXJ0SW5kZXg7XHJcbiAgICByZXQuZW5kSW5kZXggPSBvLmVuZEluZGV4O1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgTWVhc3VyZUVuZCgpO1xyXG4gIH1cclxuICBcclxuICBwcm9jZXNzKCl7XHJcbiAgICBcclxuICB9XHJcbn1cclxuXHJcbi8vIFRyYWNrIEVuZFxyXG5leHBvcnQgY2xhc3MgVHJhY2tFbmQgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigwKTtcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5UcmFja0VuZDtcclxuXHR9XHJcbiAgcHJvY2Vzcygpe1xyXG4gICAgXHJcbiAgfVxyXG5cdFxyXG59XHJcblxyXG52YXIgTm90ZXMgPSBbXHJcblx0J0MgJyxcclxuXHQnQyMnLFxyXG5cdCdEICcsXHJcblx0J0QjJyxcclxuXHQnRSAnLFxyXG5cdCdGICcsXHJcblx0J0YjJyxcclxuXHQnRyAnLFxyXG5cdCdHIycsXHJcblx0J0EgJyxcclxuXHQnQSMnLFxyXG5cdCdCICcsXHJcbl07XHJcblxyXG5leHBvcnQgY2xhc3MgTm90ZUV2ZW50IGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwID0gMCxub3RlID0gMCxnYXRlID0gMCx2ZWwgPSAwLjUsY29tbWFuZCA9IG5ldyBDb21tYW5kKCkpe1xyXG5cdFx0c3VwZXIoc3RlcCk7XHJcblx0XHR0aGlzLnRyYW5zcG9zZV8gPSAwLjA7XHJcblx0XHR0aGlzLm5vdGUgPSBub3RlO1xyXG5cdFx0dGhpcy5nYXRlID0gZ2F0ZTtcclxuXHRcdHRoaXMudmVsID0gdmVsO1xyXG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcclxuXHRcdHRoaXMuY29tbWFuZC5ldmVudCA9IHRoaXM7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuTm90ZTtcclxuXHRcdHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuXHR9XHJcblx0XHJcbiAgIHRvSlNPTigpe1xyXG4gICAgIHJldHVybiB7XHJcbiAgICAgICBuYW1lOidOb3RlRXZlbnQnLFxyXG4gICAgICAgbWVhc3VyZTp0aGlzLm1lYXN1cmUsXHJcbiAgICAgICBzdGVwTm86dGhpcy5zdGVwTm8sXHJcbiAgICAgICBzdGVwOnRoaXMuc3RlcCxcclxuICAgICAgIG5vdGU6dGhpcy5ub3RlLFxyXG4gICAgICAgZ2F0ZTp0aGlzLmdhdGUsXHJcbiAgICAgICB2ZWw6dGhpcy52ZWwsXHJcbiAgICAgICBjb21tYW5kOnRoaXMuY29tbWFuZCxcclxuICAgICAgIHR5cGU6dGhpcy50eXBlXHJcbiAgICAgfVxyXG4gICB9XHJcbiAgIFxyXG4gICBzdGF0aWMgZnJvbUpTT04obyl7XHJcbiAgICAgbGV0IHJldCA9IG5ldyBOb3RlRXZlbnQoby5zdGVwLG8ubm90ZSxvLmdhdGUsby52ZWwsQ29tbWFuZC5mcm9tSlNPTihvLmNvbW1hbmQpKTtcclxuICAgICByZXQubWVhc3VyZSA9IG8ubWVhc3VyZTtcclxuICAgICByZXQuc3RlcE5vID0gby5zdGVwTm87XHJcbiAgICAgcmV0dXJuIHJldDtcclxuICAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IE5vdGVFdmVudCh0aGlzLnN0ZXAsdGhpcy5ub3RlLHRoaXMuZ2F0ZSx0aGlzLnZlbCx0aGlzLmNvbW1hbmQpO1xyXG4gIH1cclxuICBcclxuXHRzZXROb3RlTmFtZSgpe1xyXG5cdFx0XHRsZXQgb2N0ID0gdGhpcy5ub3RlIC8gMTIgfCAwO1xyXG5cdFx0XHR0aGlzLm5hbWUgPSBOb3Rlc1t0aGlzLm5vdGUgJSAxMl0gKyBvY3Q7XHJcblx0fVxyXG5cclxuXHRzZXROb3RlTmFtZVRvTm90ZShub3RlTmFtZSxkZWZhdWx0Tm90ZU5hbWUgPSBcIlwiKVxyXG5cdHtcclxuICAgIHZhciBtYXRjaGVzID0gbm90ZU5hbWUubWF0Y2goLyhDIyl8KEMpfChEIyl8KEQpfChFKXwoRiMpfChGKXwoRyMpfChHKXwoQSMpfChBKXwoQikvaSk7XHJcblx0XHRpZihtYXRjaGVzKVxyXG5cdFx0e1xyXG4gICAgICB2YXIgbiA9IG1hdGNoZXNbMF07XHJcbiAgICAgIHZhciBnZXROdW1iZXIgPSBuZXcgUmVnRXhwKCcoWzAtOV17MSwyfSknKTtcclxuLy8gICAgICBnZXROdW1iZXIuY29tcGlsZSgpO1xyXG4gICAgICBnZXROdW1iZXIuZXhlYyhub3RlTmFtZSk7XHJcbiAgICAgIHZhciBvID0gUmVnRXhwLiQxO1xyXG4gICAgICBpZighbyl7XHJcbiAgICAgICAgKG5ldyBSZWdFeHAoJyhbMC05XXsxLDJ9KScpKS5leGVjKGRlZmF1bHROb3RlTmFtZSk7ICAgICAgICBcclxuICAgICAgICBvID0gUmVnRXhwLiQxO1xyXG4gICAgICAgIGlmKCFvKXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYobi5sZW5ndGggPT09IDEpIG4gKz0gJyAnO1xyXG4gICAgICBcclxuICAgICAgaWYoTm90ZXMuc29tZSgoZCxpKT0+e1xyXG4gICAgICAgICAgaWYoZCA9PT0gbil7XHJcbiAgICAgICAgICAgIHRoaXMubm90ZSA9IHBhcnNlRmxvYXQoaSkgKyBwYXJzZUZsb2F0KG8pICogMTI7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVx0XHRcdFx0XHJcbiAgICAgICAgIH0pKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZXROb3RlTmFtZSgpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cdFx0fSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXROb3RlTmFtZSgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7IFxyXG4gICAgfVxyXG5cdH1cclxuXHRcclxuXHRnZXQgbm90ZSAoKXtcclxuXHRcdCByZXR1cm4gdGhpcy5ub3RlXztcclxuXHR9XHJcblx0XHJcblx0c2V0IG5vdGUodil7XHJcblx0XHQgdGhpcy5ub3RlXyA9IHY7XHJcblx0XHQgdGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdCB0aGlzLnNldE5vdGVOYW1lKCk7XHJcblx0fVxyXG5cdFxyXG5cdHNldCB0cmFuc3Bvc2Uodil7XHJcblx0XHRpZih2ICE9IHRoaXMudHJhbnNwb3NlXyl7XHJcblx0XHRcdHRoaXMudHJhbnNwb3NlXyA9IHY7XHJcblx0XHRcdHRoaXMuY2FsY1BpdGNoKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNQaXRjaCgpe1xyXG5cdFx0dGhpcy5waXRjaCA9ICg0NDAuMCAvIDMyLjApICogKE1hdGgucG93KDIuMCwoKHRoaXMubm90ZSArIHRoaXMudHJhbnNwb3NlXyAtIDkpIC8gMTIpKSk7XHJcblx0fVxyXG4gIFxyXG4gIHBsYXlPbmVzaG90KHRyYWNrKXtcclxuICAgIGlmKHRoaXMubm90ZSl7XHJcblx0XHRcdFx0dGhpcy50cmFuc29wc2UgPSB0cmFjay50cmFuc3Bvc2U7XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnBpdGNoZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0dHJhY2sucGl0Y2hlc1tqXS5wcm9jZXNzKG5ldyBDb21tYW5kKCksdGhpcy5waXRjaCxhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHQvLyBrZXlvblxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKG5ldyBDb21tYW5kKCksdGhpcy52ZWwsYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdFx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKG5ldyBDb21tYW5kKCksMCxhdWRpby5jdHguY3VycmVudFRpbWUrMC4yNSk7XHJcblx0XHRcdFx0fVxyXG4gICAgfVxyXG4gIH1cclxuXHRcclxuXHRwcm9jZXNzKHRpbWUsdHJhY2spe1xyXG5cdFx0XHRpZih0aGlzLm5vdGUpe1xyXG5cdFx0XHRcdHRoaXMudHJhbnNvcHNlID0gdHJhY2sudHJhbnNwb3NlO1xyXG5cdFx0XHRcdGZvcihsZXQgaiA9IDAsamUgPSB0cmFjay5waXRjaGVzLmxlbmd0aDtqIDwgamU7KytqKXtcclxuXHRcdFx0XHRcdHRyYWNrLnBpdGNoZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsdGhpcy5waXRjaCx0aW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsdGhpcy52ZWwsdGltZSk7XHJcblx0XHRcdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsMCx0aW1lICsgdGhpcy5nYXRlICogdHJhY2suc2VxdWVuY2VyLnN0ZXBUaW1lXyApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE1lYXN1cmUge1xyXG4gIGNvbnN0cnVjdG9yKHN0YXJ0SW5kZXggPSAwLGNvdW50ID0gMCxzdGVwVG90YWwgPSAwKXtcclxuICAgIHRoaXMuc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXg7XHJcbiAgICB0aGlzLmNvdW50ID0gY291bnQ7XHJcbiAgICB0aGlzLnN0ZXBUb3RhbCA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHJhY2sgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKHNlcXVlbmNlcil7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5ldmVudHMgPSBbXTtcclxuICAgIHRoaXMubWVhc3VyZXMgPSBbXTtcclxuICAgIHRoaXMubWVhc3VyZXMucHVzaChuZXcgTWVhc3VyZSgpKTtcclxuXHRcdHRoaXMucG9pbnRlciA9IDA7XHJcblx0XHR0aGlzLmV2ZW50cy5wdXNoKG5ldyBUcmFja0VuZCgpKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdzdGVwJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnZW5kJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnbmFtZScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RyYW5zcG9zZScpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0ZXAgPSAwO1xyXG5cdFx0dGhpcy5lbmQgPSBmYWxzZTtcclxuXHRcdHRoaXMucGl0Y2hlcyA9IFtdO1xyXG5cdFx0dGhpcy52ZWxvY2l0aWVzID0gW107XHJcblx0XHR0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuXHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cdFx0dGhpcy50cmFuc3Bvc2UgPSAwO1xyXG5cdH1cclxuXHRcclxuICB0b0pTT04oKVxyXG4gIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6J1RyYWNrJyxcclxuICAgICAgZXZlbnRzOnRoaXMuZXZlbnRzLFxyXG4gICAgICBzdGVwOnRoaXMuc3RlcCxcclxuICAgICAgdHJhY2tOYW1lOnRoaXMubmFtZSxcclxuICAgICAgdHJhbnNwb3NlOnRoaXMudHJhbnNwb3NlXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obyxzZXF1ZW5jZXIpXHJcbiAge1xyXG4gICAgbGV0IHJldCA9IG5ldyBUcmFjayhzZXF1ZW5jZXIpO1xyXG4gICAgcmV0LnN0ZXAgPSBvLnN0ZXA7XHJcbiAgICByZXQubmFtZSA9IG8udHJhY2tOYW1lO1xyXG4gICAgcmV0LnRyYW5zcG9zZSA9IG8udHJhbnNwb3NlO1xyXG4gICAgby5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihkKXtcclxuICAgICAgc3dpdGNoKGQudHlwZSl7XHJcbiAgICAgICAgY2FzZSBFdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgIHJldC5hZGRFdmVudChOb3RlRXZlbnQuZnJvbUpTT04oZCkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudFR5cGUuTWVhc3VyZUVuZDpcclxuICAgICAgICAgIHJldC5hZGRFdmVudChNZWFzdXJlRW5kLmZyb21KU09OKGQpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRXZlbnRUeXBlLlRyYWNrRW5kOlxyXG4gICAgICAgIC8v5L2V44KC44GX44Gq44GEXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcblx0YWRkRXZlbnQoZXYpe1xyXG5cdFx0aWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIGJlZm9yZSA9IHRoaXMuZXZlbnRzW3RoaXMuZXZlbnRzLmxlbmd0aCAtIDJdO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmVFbmQ6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSAwO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRldi5zdGVwTm8gPSAwO1xyXG5cdFx0XHRldi5tZWFzdXJlID0gMDtcclxuXHRcdH1cclxuICAgIFxyXG4gICAgc3dpdGNoKGV2LnR5cGUpe1xyXG4gICAgICBjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICAgICsrdGhpcy5tZWFzdXJlc1tldi5tZWFzdXJlXS5jb3VudDtcclxuICAgICAgICB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLnN0ZXBUb3RhbCArPSBldi5zdGVwO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlRW5kOlxyXG4gICAgICAgIHRoaXMubWVhc3VyZXMucHVzaChuZXcgTWVhc3VyZSh0aGlzLmV2ZW50cy5sZW5ndGgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcblx0XHR0aGlzLmV2ZW50cy5zcGxpY2UodGhpcy5ldmVudHMubGVuZ3RoIC0gMSwwLGV2KTtcclxuICAgIC8vdGhpcy5jYWxjTWVhc3VyZVN0ZXBUb3RhbCh0aGlzLmV2ZW50cy5sZW5ndGggLSAyKTtcclxuXHR9XHJcblx0XHJcblx0aW5zZXJ0RXZlbnQoZXYsaW5kZXgpe1xyXG5cdFx0aWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSAmJiBpbmRleCAhPSAwKXtcclxuXHRcdFx0dmFyIGJlZm9yZSA9IHRoaXMuZXZlbnRzW2luZGV4LTFdO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlRW5kOlxyXG5cdFx0XHRcdFx0ZXYuc3RlcE5vID0gMDtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZSArIDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGV2LnN0ZXBObyA9IDA7XHJcblx0XHRcdGV2Lm1lYXN1cmUgPSAwO1xyXG4gICAgfVxyXG4gICAgXHJcblx0XHR0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMCxldik7XHJcblxyXG4gICAgc3dpdGNoKGV2LnR5cGUpe1xyXG4gICAgICBjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICAgICsrdGhpcy5tZWFzdXJlc1tldi5tZWFzdXJlXS5jb3VudDtcclxuICAgICAgICB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLnN0ZXBUb3RhbCArPSBldi5zdGVwO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IGV2Lm1lYXN1cmUgKyAxLGUgPSB0aGlzLm1lYXN1cmVzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG4gICAgICAgICAgKyt0aGlzLm1lYXN1cmVzW2ldLnN0YXJ0SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlRW5kOlxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxldCBlbmRJbmRleCA9IHRoaXMubWVhc3VyZXNbZXYubWVhc3VyZV0uc3RhcnRJbmRleCArIHRoaXMubWVhc3VyZXNbZXYubWVhc3VyZV0uY291bnQ7XHJcbiAgICAgICAgICB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLmNvdW50ID0gdGhpcy5tZWFzdXJlc1tldi5tZWFzdXJlXS5jb3VudCAtIChlbmRJbmRleCAtIGluZGV4KTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8g44K544OG44OD44OX44Gu5YaN6KiI566XXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzdGVwVG90YWwgPSAwO1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLnN0YXJ0SW5kZXgsZSA9IGkgKyB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLmNvdW50O2kgPCBlOysraSl7XHJcbiAgICAgICAgICAgICAgICBzdGVwVG90YWwgKz0gdGhpcy5ldmVudHNbaV0uc3RlcDsgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubWVhc3VyZXMuc3BsaWNlKGV2Lm1lYXN1cmUgKyAxLDAsXHJcbiAgICAgICAgICBuZXcgTWVhc3VyZShpbmRleCArIDEsZW5kSW5kZXggLSBpbmRleClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzdGVwVG90YWwgPSAwO1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmUgKyAxXS5zdGFydEluZGV4LGUgPSBpICsgdGhpcy5tZWFzdXJlc1tldi5tZWFzdXJlICsgMV0uY291bnQ7aSA8IGU7KytpKXtcclxuICAgICAgICAgICAgICAgIHN0ZXBUb3RhbCArPSB0aGlzLmV2ZW50c1tpXS5zdGVwOyAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubWVhc3VyZXNbZXYubWVhc3VyZSArIDFdLnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoKGV2Lm1lYXN1cmUgKyAyKSA8ICh0aGlzLm1lYXN1cmVzLmxlbmd0aCkpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IGV2Lm1lYXN1cmUgKyAyLGUgPSB0aGlzLm1lYXN1cmVzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG4gICAgICAgICAgICAgICsrdGhpcy5tZWFzdXJlc1tpXS5zdGFydEluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMudXBkYXRlU3RlcF8oaW5kZXgsZXYpO1xyXG4gICAgLy90aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuXHR9XHJcblxyXG4gIHVwZGF0ZU5vdGVTdGVwKGluZGV4LGV2LG5ld1N0ZXApe1xyXG4gICAgbGV0IGRlbHRhID0gbmV3U3RlcCAtIGV2LnN0ZXA7XHJcbiAgICBldi5zdGVwID0gbmV3U3RlcDtcclxuICAgIHRoaXMudXBkYXRlU3RlcF9fKGluZGV4KTtcclxuICAgIHRoaXMubWVhc3VyZXNbZXYubWVhc3VyZV0uc3RlcFRvdGFsICs9IGRlbHRhO1xyXG4gIH1cclxuICBcclxuICB1cGRhdGVTdGVwXyhpbmRleCxldil7XHJcbiBcdFx0aWYoZXYudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZUVuZCl7XHJcblx0XHRcdHRoaXMudXBkYXRlU3RlcEFuZE1lYXN1cmVfXyhpbmRleCk7XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwX18oaW5kZXgpO1x0XHRcclxuICAgIH1cclxuICB9ICBcclxuXHJcblx0dXBkYXRlU3RlcF9fKGluZGV4KXtcclxuXHRcdGZvcihsZXQgaSA9IGluZGV4ICsgMSxlID0gdGhpcy5ldmVudHMubGVuZ3RoO2k8ZTsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGxldCBiZWZvcmUgPSB0aGlzLmV2ZW50c1tpLTFdO1xyXG5cdFx0XHRsZXQgY3VycmVudCA9IHRoaXMuZXZlbnRzW2ldO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmU7XHJcbiAgICAgICAgICBicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlRW5kOlxyXG4gICAgICAgICAgYnJlYWs7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHRcclxuICBcclxuXHR1cGRhdGVTdGVwQW5kTWVhc3VyZV9fKGluZGV4KXtcclxuXHRcdGZvcihsZXQgaSA9IGluZGV4ICsgMSxlID0gdGhpcy5ldmVudHMubGVuZ3RoO2k8ZTsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGxldCBiZWZvcmUgPSB0aGlzLmV2ZW50c1tpLTFdO1xyXG5cdFx0XHRsZXQgY3VycmVudCA9IHRoaXMuZXZlbnRzW2ldO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTWVhc3VyZUVuZDpcclxuXHRcdFx0XHRcdGN1cnJlbnQuc3RlcE5vID0gMDtcclxuXHRcdFx0XHRcdGN1cnJlbnQubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVx0XHRcdFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu5YmK6ZmkICBcclxuICBkZWxldGVFdmVudChpbmRleCl7XHJcbiAgICB2YXIgZXYgPSB0aGlzLmV2ZW50c1tpbmRleF07XHJcbiAgICB0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMSk7XHJcbiAgICBpZihpbmRleCA9PSAwKXtcclxuICAgICAgdGhpcy5ldmVudHNbMF0ubWVhc3VyZSA9IDE7XHJcbiAgICAgIHRoaXMuZXZlbnRzWzBdLnN0ZXBObyA9IDE7XHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RlcF8oMSxldik7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZihpbmRleCA8PSAodGhpcy5ldmVudHMubGVuZ3RoIC0gMSkpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGVwXyhpbmRleCAtIDEsZXYpO1xyXG4gICAgfVxyXG4gICAgLy90aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuICAgIFxyXG4gICAgc3dpdGNoKGV2LnR5cGUpXHJcbiAgICB7XHJcbiAgICAgIGNhc2UgRXZlbnRUeXBlLk1lYXN1cmVFbmQ6XHJcbiAgICAgIHtcclxuICAgICAgICBpZihldi5tZWFzdXJlcyAtIDEgPj0gMCl7XHJcbiAgICAgICAgICB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmUgLSAxXS5jb3VudCArPSB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdLmNvdW50O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5tZWFzdXJlc1tldi5tZWFzdXJlICsgMV07XHJcbiAgICAgICAgICBsZXQgc3JjID0gdGhpcy5tZWFzdXJlc1tldi5tZWFzdXJlXTtcclxuICAgICAgICAgIHRhcmdldC5zdGFydEluZGV4ID0gIHNyYy5zdGFydEluZGV4O1xyXG4gICAgICAgICAgdGFyZ2V0LmNvdW50ICs9IHNyYy5jb3VudDtcclxuICAgICAgICAgIHRhcmdldC5zdGVwVG90YWwgPSAwO1xyXG4gICAgICAgICAgZm9yKGxldCBpID0gdGFyZ2V0LnN0YXJ0SW5kZXgsZSA9IGkgKyB0YXJnZXQuY291bnQ7aTxlOysraSlcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0LnN0ZXBUb3RhbCArPSB0aGlzLmV2ZW50c1tpXS5zdGVwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1lYXN1cmVzLnNwbGljZShldi5tZWFzdXJlLDEpO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IGV2Lm1lYXN1cmUgKyAxLGUgPSB0aGlzLm1lYXN1cmVzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG4gICAgICAgICAgLS10aGlzLm1lYXN1cmVzW2ldLnN0YXJ0SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICB7XHJcbiAgICAgICAgbGV0IG0gPSB0aGlzLm1lYXN1cmVzW2V2Lm1lYXN1cmVdO1xyXG4gICAgICAgIC0tbS5jb3VudDtcclxuICAgICAgICBtLnN0ZXBUb3RhbCAtPSBldi5zdGVwO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IGV2Lm1lYXN1cmUgKyAxLGUgPSB0aGlzLm1lYXN1cmVzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG4gICAgICAgICAgLS10aGlzLm1lYXN1cmVzW2ldLnN0YXJ0SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNFUV9TVEFUVVMgPSB7XHJcblx0U1RPUFBFRDowLFxyXG5cdFBMQVlJTkc6MSxcclxuXHRQQVVTRUQ6MlxyXG59IDtcclxuXHJcbmV4cG9ydCBjb25zdCBOVU1fT0ZfVFJBQ0tTID0gNDtcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYnBtJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywndHBiJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYmVhdCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JhcicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3JlcGVhdCcpO1xyXG5cclxuXHRcdHRoaXMuYnBtID0gMTIwLjA7IC8vIHRlbXBvXHJcbiAgICBcclxuXHRcdHRoaXMudHBiID0gOTYuMDsgLy8g5Zub5YiG6Z+z56ym44Gu6Kej5YOP5bqmXHJcblx0XHR0aGlzLmJlYXQgPSA0O1xyXG5cdFx0dGhpcy5iYXIgPSA0OyAvLyBcclxuXHRcdHRoaXMucmVwZWF0ID0gZmFsc2U7XHJcblx0XHR0aGlzLnRyYWNrcyA9IFtdO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLm5hbWUgPSAnU2VxdWVuY2VyJztcclxuXHRcdGZvciAodmFyIGkgPSAwO2kgPCBOVU1fT0ZfVFJBQ0tTOysraSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MucHVzaChuZXcgVHJhY2sodGhpcykpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ2cnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnR5cGUgPSAnZ2F0ZSc7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ3AnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnR5cGUgPSAncGl0Y2gnO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudE1lYXN1cmVfID0gMDtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblxyXG5cdFx0Ly9cclxuXHRcdHRoaXMub24oJ2JwbV9jaGFuZ2VkJywoKT0+e3RoaXMuY2FsY1N0ZXBUaW1lKCk7fSk7XHJcblx0XHR0aGlzLm9uKCd0cGJfY2hhbmdlZCcsKCk9Pnt0aGlzLmNhbGNTdGVwVGltZSgpO30pO1xyXG5cclxuXHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnB1c2godGhpcyk7XHJcblx0XHRpZihTZXF1ZW5jZXIuYWRkZWQpe1xyXG5cdFx0XHRTZXF1ZW5jZXIuYWRkZWQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTonU2VxdWVuY2VyJyxcclxuICAgICAgYnBtOnRoaXMuYnBtLFxyXG4gICAgICB0cGI6dGhpcy50cGIsXHJcbiAgICAgIGJlYXQ6dGhpcy5iZWF0LFxyXG4gICAgICBiYXI6dGhpcy5iYXIsXHJcbiAgICAgIHRyYWNrczp0aGlzLnRyYWNrcyxcclxuICAgICAgcmVwZWF0OnRoaXMucmVwZWF0XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tSlNPTihvKVxyXG4gIHtcclxuICAgIGxldCByZXQgPSBuZXcgU2VxdWVuY2VyKCk7XHJcbiAgICByZXQuYnBtID0gby5icG07XHJcbiAgICByZXQudHBiID0gby50cGI7XHJcbiAgICByZXQuYmVhdCA9IG8uYmVhdDtcclxuICAgIHJldC5iYXIgPSBvLmJhcjtcclxuICAgIHJldC5yZXBlYXQgPSBvLnJlcGVhdDtcclxuICAgIC8vcmV0LnRyYWNrcy5sZW5ndGggPSAwO1xyXG4gICAgby50cmFja3MuZm9yRWFjaChmdW5jdGlvbihkLGkpe1xyXG4gICAgICByZXQudHJhY2tzW2ldID0gVHJhY2suZnJvbUpTT04oZCxyZXQpO1xyXG5cdFx0XHRyZXRbJ3RyaycgKyBpICsgJ2cnXS50cmFjayA9IHJldC50cmFja3NbaV07XHJcblx0XHRcdHJldFsndHJrJyArIGkgKyAncCddLnRyYWNrID0gcmV0LnRyYWNrc1tpXTtcclxuXHJcbiAgICB9KTtcclxuICAgIHJldC5jYWxjU3RlcFRpbWUoKTtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cclxuXHRkaXNwb3NlKCl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGg7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzID09PSBTZXF1ZW5jZXIuc2VxdWVuY2Vyc1tpXSl7XHJcblx0XHRcdFx0IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnNwbGljZShpLDEpO1xyXG5cdFx0XHRcdCBicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGggPT0gMClcclxuXHRcdHtcclxuXHRcdFx0aWYoU2VxdWVuY2VyLmVtcHR5KXtcclxuXHRcdFx0XHRTZXF1ZW5jZXIuZW1wdHkoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjYWxjU3RlcFRpbWUoKXtcclxuXHRcdHRoaXMuc3RlcFRpbWVfID0gNjAuMCAvICggdGhpcy5icG0gKiB0aGlzLnRwYik7IFxyXG5cdH1cclxuXHRcclxuXHRzdGFydCh0aW1lKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQgfHwgdGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUEFVU0VEICl7XHJcblx0XHRcdHRoaXMuY3VycmVudFRpbWVfID0gdGltZSB8fCBhdWRpby5jdHguY3VycmVudFRpbWUoKTtcclxuXHRcdFx0dGhpcy5zdGFydFRpbWVfICA9IHRoaXMuY3VycmVudFRpbWVfO1xyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlBMQVlJTkc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0b3AoKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcgfHwgdGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUEFVU0VEKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQucGl0Y2hlcy5mb3JFYWNoKChwKT0+e1xyXG5cdFx0XHRcdFx0cC5zdG9wKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0ZC52ZWxvY2l0aWVzLmZvckVhY2goKHYpPT57XHJcblx0XHRcdFx0XHR2LnN0b3AoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHBhdXNlKCl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5QQVVTRUQ7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJlc2V0KCl7XHJcblx0XHR0aGlzLnN0YXJ0VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSAwO1xyXG5cdFx0dGhpcy50cmFja3MuZm9yRWFjaCgodHJhY2spPT57XHJcblx0XHRcdHRyYWNrLmVuZCA9ICF0cmFjay5ldmVudHMubGVuZ3RoO1xyXG5cdFx0XHR0cmFjay5zdGVwID0gMDtcclxuXHRcdFx0dHJhY2sucG9pbnRlciA9IDA7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0fVxyXG4gIC8vIOOCt+ODvOOCseODs+OCteODvOOBruWHpueQhlxyXG5cdHByb2Nlc3MgKHRpbWUpXHJcblx0e1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdFx0dmFyIGN1cnJlbnRTdGVwID0gKHRoaXMuY3VycmVudFRpbWVfICAtIHRoaXMuc3RhcnRUaW1lXyArIDAuMSkgLyB0aGlzLnN0ZXBUaW1lXztcclxuXHRcdGxldCBlbmRjb3VudCA9IDA7XHJcblx0XHRmb3IodmFyIGkgPSAwLGwgPSB0aGlzLnRyYWNrcy5sZW5ndGg7aSA8IGw7KytpKXtcclxuXHRcdFx0dmFyIHRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdGlmKCF0cmFjay5lbmQpe1xyXG5cdFx0XHRcdHdoaWxlKHRyYWNrLnN0ZXAgPD0gY3VycmVudFN0ZXAgJiYgIXRyYWNrLmVuZCApe1xyXG5cdFx0XHRcdFx0aWYodHJhY2sucG9pbnRlciA+PSB0cmFjay5ldmVudHMubGVuZ3RoICl7XHJcblx0XHRcdFx0XHRcdHRyYWNrLmVuZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dmFyIGV2ZW50ID0gdHJhY2suZXZlbnRzW3RyYWNrLnBvaW50ZXIrK107XHJcblx0XHRcdFx0XHRcdHZhciBwbGF5VGltZSA9IHRyYWNrLnN0ZXAgKiB0aGlzLnN0ZXBUaW1lXyArIHRoaXMuc3RhcnRUaW1lXztcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJvY2VzcyhwbGF5VGltZSx0cmFjayk7XHJcblx0XHRcdFx0XHRcdHRyYWNrLnN0ZXAgKz0gZXZlbnQuc3RlcDtcclxuLy9cdFx0XHRcdFx0Y29uc29sZS5sb2codHJhY2sucG9pbnRlcix0cmFjay5ldmVudHMubGVuZ3RoLHRyYWNrLmV2ZW50c1t0cmFjay5wb2ludGVyXSx0cmFjay5zdGVwLGN1cnJlbnRTdGVwLHRoaXMuY3VycmVudFRpbWVfLHBsYXlUaW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0KytlbmRjb3VudDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoZW5kY291bnQgPT0gdGhpcy50cmFja3MubGVuZ3RoKXtcclxuXHRcdFx0dGhpcy5zdG9wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOaOpee2mlxyXG5cdGNvbm5lY3QoYyl7XHJcblx0XHR2YXIgdHJhY2sgPSBjLmZyb20ucGFyYW0udHJhY2s7XHJcblx0XHRpZihjLmZyb20ucGFyYW0udHlwZSA9PT0gJ3BpdGNoJyl7XHJcblx0XHRcdHRyYWNrLnBpdGNoZXMucHVzaChTZXF1ZW5jZXIubWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dHJhY2sudmVsb2NpdGllcy5wdXNoKFNlcXVlbmNlci5tYWtlUHJvY2VzcyhjKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOWJiumZpFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHR2YXIgdHJhY2sgPSBjLmZyb20ucGFyYW0udHJhY2s7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0cmFjay5waXRjaGVzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRyYWNrLnBpdGNoZXNbaV0udG8ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0cmFjay5waXRjaGVzW2ldLnRvLnBhcmFtKXtcclxuXHRcdFx0XHR0cmFjay5waXRjaGVzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0cmFjay52ZWxvY2l0aWVzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRyYWNrLnZlbG9jaXRpZXNbaV0udG8ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0cmFjay52ZWxvY2l0aWVzW2ldLnRvLnBhcmFtKXtcclxuXHRcdFx0XHR0cmFjay5waXRjaGVzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBtYWtlUHJvY2VzcyhjKXtcclxuXHRcdGlmKGMudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRyZXR1cm4gIHtcclxuXHRcdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRcdHByb2Nlc3M6IChjb20sdix0KT0+e1xyXG5cdFx0XHRcdFx0Yy50by5ub2RlLmF1ZGlvTm9kZS5wcm9jZXNzKGMudG8sY29tLHYsdCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdG9wOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUuYXVkaW9Ob2RlLnN0b3AoYy50byk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0fSBcclxuXHRcdHZhciBwcm9jZXNzO1xyXG5cdFx0aWYoYy50by5wYXJhbS50eXBlID09PSAncGl0Y2gnKXtcclxuXHRcdFx0cHJvY2VzcyA9IChjb20sdix0KSA9PiB7XHJcblx0XHRcdFx0Y29tLnByb2Nlc3NQaXRjaChjLnRvLnBhcmFtLmF1ZGlvUGFyYW0sdix0KTtcclxuXHRcdFx0fTtcdFx0XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwcm9jZXNzID1cdChjb20sdix0KT0+e1xyXG5cdFx0XHRcdGNvbS5wcm9jZXNzVmVsb2NpdHkoYy50by5wYXJhbS5hdWRpb1BhcmFtLHYsdCk7XHJcblx0XHRcdH07XHRcdFx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dG86Yy50byxcclxuXHRcdFx0cHJvY2Vzczpwcm9jZXNzLFxyXG5cdFx0XHRzdG9wOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Yy50by5wYXJhbS5hdWRpb1BhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBleGVjKClcclxuXHR7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShTZXF1ZW5jZXIuZXhlYyk7XHJcblx0XHRcdGxldCBlbmRjb3VudCA9IDA7XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsZSA9IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG5cdFx0XHRcdHZhciBzZXEgPSBTZXF1ZW5jZXIuc2VxdWVuY2Vyc1tpXTtcclxuXHRcdFx0XHRpZihzZXEuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHRcdFx0c2VxLnByb2Nlc3MoYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYoc2VxLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5TVE9QUEVEKXtcclxuXHRcdFx0XHRcdCsrZW5kY291bnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGVuZGNvdW50ID09IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdFNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRcdFx0aWYoU2VxdWVuY2VyLnN0b3BwZWQpe1xyXG5cdFx0XHRcdFx0U2VxdWVuY2VyLnN0b3BwZWQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu44K544K/44O844OIXHJcblx0c3RhdGljIHN0YXJ0U2VxdWVuY2VzKHRpbWUpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuU1RPUFBFRCB8fCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QQVVTRUQgKVxyXG5cdFx0e1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQuc3RhcnQodGltZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlBMQVlJTkc7XHJcblx0XHRcdFNlcXVlbmNlci5leGVjKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruWBnOatolxyXG5cdHN0YXRpYyBzdG9wU2VxdWVuY2VzKCl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HIHx8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApe1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQuc3RvcCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu44Od44O844K6XHRcclxuXHRzdGF0aWMgcGF1c2VTZXF1ZW5jZXMoKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQucGF1c2UoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuUEFVU0VEO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuU2VxdWVuY2VyLnNlcXVlbmNlcnMgPSBbXTtcclxuU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5TVE9QUEVEOyBcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgVVVJRCBmcm9tICcuL3V1aWQuY29yZSc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIzJztcclxuZXhwb3J0IGNvbnN0IG5vZGVIZWlnaHQgPSA1MDtcclxuZXhwb3J0IGNvbnN0IG5vZGVXaWR0aCA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IHBvaW50U2l6ZSA9IDE2O1xyXG5cclxuLy8gcGFuZWwgd2luZG93XHJcbmV4cG9ydCBjbGFzcyBQYW5lbCAgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKHNlbCxwcm9wKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRpZighcHJvcCB8fCAhcHJvcC5pZCl7XHJcblx0XHRcdHByb3AgPSBwcm9wID8gKHByb3AuaWQgPSAnaWQtJyArIFVVSUQuZ2VuZXJhdGUoKSxwcm9wKSA6eyBpZDonaWQtJyArIFVVSUQuZ2VuZXJhdGUoKX07XHJcblx0XHR9XHJcblx0XHR0aGlzLmlkID0gcHJvcC5pZDtcclxuXHRcdHNlbCA9IHNlbCB8fCBkMy5zZWxlY3QoJyNjb250ZW50Jyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbiA9IFxyXG5cdFx0c2VsXHJcblx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmF0dHIocHJvcClcclxuXHRcdC5hdHRyKCdjbGFzcycsJ3BhbmVsJylcclxuXHRcdC5kYXR1bSh0aGlzKTtcclxuXHJcblx0XHQvLyDjg5Hjg43jg6vnlKhEcmFn44Gd44Gu5LuWXHJcblxyXG5cdFx0dGhpcy5oZWFkZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2hlYWRlcicpLmNhbGwodGhpcy5kcmFnKTtcclxuXHRcdHRoaXMuYXJ0aWNsZSA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnYXJ0aWNsZScpO1xyXG5cdFx0dGhpcy5mb290ZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2Zvb3RlcicpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmNsYXNzZWQoJ3BhbmVsLWNsb3NlJyx0cnVlKVxyXG5cdFx0Lm9uKCdjbGljaycsKCk9PntcclxuXHRcdFx0dGhpcy5lbWl0KCdkaXNwb3NlJyk7XHJcblx0XHRcdHRoaXMuZGlzcG9zZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cdFxyXG5cclxuXHRnZXQgbm9kZSgpIHtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbi5ub2RlKCk7XHJcblx0fVxyXG5cdGdldCB4ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnKSk7XHJcblx0fVxyXG5cdHNldCB4ICh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdsZWZ0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB5ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcpKTtcclxuXHR9XHJcblx0c2V0IHkgKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgd2lkdGgoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd3aWR0aCcpKTtcclxuXHR9XHJcblx0c2V0IHdpZHRoKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJywgdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgaGVpZ2h0KCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0JykpO1xyXG5cdH1cclxuXHRzZXQgaGVpZ2h0KHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2hlaWdodCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRcclxuXHRkaXNwb3NlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0c2hvdygpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCd2aXNpYmxlJyk7XHJcblx0XHR0aGlzLmVtaXQoJ3Nob3cnKTtcclxuXHR9XHJcblxyXG5cdGhpZGUoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0XHR0aGlzLmVtaXQoJ2hpZGUnKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0IGlzU2hvdygpe1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uICYmIHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JykgPT09ICd2aXNpYmxlJztcclxuXHR9XHJcbn1cclxuXHJcblBhbmVsLnByb3RvdHlwZS5kcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0XHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGNvbnNvbGUubG9nKGQpO1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCgnIycgKyBkLmlkKTtcclxuXHRcdFxyXG5cdFx0ZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmF0dHIoe2lkOidwYW5lbC1kdW1teS0nICsgZC5pZCxcclxuXHRcdFx0J2NsYXNzJzoncGFuZWwgcGFuZWwtZHVtbXknfSlcclxuXHRcdC5zdHlsZSh7XHJcblx0XHRcdGxlZnQ6c2VsLnN0eWxlKCdsZWZ0JyksXHJcblx0XHRcdHRvcDpzZWwuc3R5bGUoJ3RvcCcpLFxyXG5cdFx0XHR3aWR0aDpzZWwuc3R5bGUoJ3dpZHRoJyksXHJcblx0XHRcdGhlaWdodDpzZWwuc3R5bGUoJ2hlaWdodCcpXHJcblx0XHR9KTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBkdW1teSA9IGQzLnNlbGVjdCgnI3BhbmVsLWR1bW15LScgKyBkLmlkKTtcclxuXHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHVtbXkuc3R5bGUoJ2xlZnQnKSkgKyBkMy5ldmVudC5keDtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgndG9wJykpICsgZDMuZXZlbnQuZHk7XHJcblx0XHRcclxuXHRcdGR1bW15LnN0eWxlKHsnbGVmdCc6eCArICdweCcsJ3RvcCc6eSArICdweCd9KTtcclxuXHR9KVxyXG5cdC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cdFx0c2VsLnN0eWxlKFxyXG5cdFx0XHR7J2xlZnQnOmR1bW15LnN0eWxlKCdsZWZ0JyksJ3RvcCc6ZHVtbXkuc3R5bGUoJ3RvcCcpfVxyXG5cdFx0KTtcclxuXHRcdGQuZW1pdCgnZHJhZ2VuZCcpO1xyXG5cdFx0ZHVtbXkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL0V2ZW50RW1pdHRlcjMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFVuZG9NYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuYnVmZmVyID0gW107XHJcblx0XHR0aGlzLmluZGV4ID0gLTE7XHJcblx0fVxyXG5cdFxyXG5cdGNsZWFyKCl7XHJcbiAgICB0aGlzLmJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgdGhpcy5lbWl0KCdjbGVhcmVkJyk7XHJcblx0fVxyXG5cdFxyXG5cdGV4ZWMoY29tbWFuZCl7XHJcbiAgICBjb21tYW5kLmV4ZWMoKTtcclxuICAgIGlmICgodGhpcy5pbmRleCArIDEpIDwgdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAge1xyXG4gICAgICB0aGlzLmJ1ZmZlci5sZW5ndGggPSB0aGlzLmluZGV4ICsgMTtcclxuICAgIH1cclxuICAgIHRoaXMuYnVmZmVyLnB1c2goY29tbWFuZCk7XHJcbiAgICArK3RoaXMuaW5kZXg7XHJcbiAgICB0aGlzLmVtaXQoJ2V4ZWN1dGVkJyk7XHJcblx0fVxyXG5cdFxyXG5cdHJlZG8oKXtcclxuICAgIGlmICgodGhpcy5pbmRleCArIDEpIDwgKHRoaXMuYnVmZmVyLmxlbmd0aCkpXHJcbiAgICB7XHJcbiAgICAgICsrdGhpcy5pbmRleDtcclxuICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLmJ1ZmZlclt0aGlzLmluZGV4XTtcclxuICAgICAgY29tbWFuZC5yZWRvKCk7XHJcbiAgICAgIHRoaXMuZW1pdCgncmVkaWQnKTtcclxuICAgICAgaWYgKCh0aGlzLmluZGV4ICArIDEpID09IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuZW1pdCgncmVkb0VtcHR5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHR9XHJcbiAgdW5kbygpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA+IDAgJiYgdGhpcy5pbmRleCA+PSAwKVxyXG4gICAge1xyXG4gICAgICB2YXIgY29tbWFuZCA9IHRoaXMuYnVmZmVyW3RoaXMuaW5kZXhdO1xyXG4gICAgICBjb21tYW5kLnVuZG8oKTtcclxuICAgICAgLS10aGlzLmluZGV4O1xyXG4gICAgICB0aGlzLmVtaXQoJ3VuZGlkJyk7XHJcbiAgICAgIGlmICh0aGlzLmluZGV4IDwgMClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB0aGlzLmVtaXQoJ3VuZG9FbXB0eScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cdFxyXG59XHJcblxyXG52YXIgdW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuZXhwb3J0IGRlZmF1bHQgdW5kb01hbmFnZXI7IiwiLypcbiBWZXJzaW9uOiBjb3JlLTEuMFxuIFRoZSBNSVQgTGljZW5zZTogQ29weXJpZ2h0IChjKSAyMDEyIExpb3NLLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVVSUQoKXt9VVVJRC5nZW5lcmF0ZT1mdW5jdGlvbigpe3ZhciBhPVVVSUQuX2dyaSxiPVVVSUQuX2hhO3JldHVybiBiKGEoMzIpLDgpK1wiLVwiK2IoYSgxNiksNCkrXCItXCIrYigxNjM4NHxhKDEyKSw0KStcIi1cIitiKDMyNzY4fGEoMTQpLDQpK1wiLVwiK2IoYSg0OCksMTIpfTtVVUlELl9ncmk9ZnVuY3Rpb24oYSl7cmV0dXJuIDA+YT9OYU46MzA+PWE/MHxNYXRoLnJhbmRvbSgpKigxPDxhKTo1Mz49YT8oMHwxMDczNzQxODI0Kk1hdGgucmFuZG9tKCkpKzEwNzM3NDE4MjQqKDB8TWF0aC5yYW5kb20oKSooMTw8YS0zMCkpOk5hTn07VVVJRC5faGE9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9YS50b1N0cmluZygxNiksZD1iLWMubGVuZ3RoLGU9XCIwXCI7MDxkO2Q+Pj49MSxlKz1lKWQmMSYmKGM9ZStjKTtyZXR1cm4gY307XG4iXX0=
