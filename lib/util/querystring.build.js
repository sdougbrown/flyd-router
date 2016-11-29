'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * build
 *
 * Accepts an object of data parameters and returns
 * a joined query string.
 *
 * @param {Object} data
 * @returns {string}
 */
function build(data) {
  if (!(0, _isObject2.default)(data)) {
    return '';
  }

  return (0, _reduce2.default)(data, destructure, []).join('&');
}

function destructure(args, value, key) {
  // arrays are ok with this too
  if ((0, _isObject2.default)(value)) {
    Object.keys(value).forEach(function (k) {
      destructure(args, value[k], key + '[' + k + ']');
    });
  } else {
    args.push('' + encodeURIComponent(key) + encodeVal(value));
  }

  return args;
}

function encodeVal(value) {
  return value ? '=' + encodeURIComponent(value) : '';
}