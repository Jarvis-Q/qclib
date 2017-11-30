"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ArrayExtra = function () {
    function ArrayExtra() {
        (0, _classCallCheck3.default)(this, ArrayExtra);
    }

    /**
     * 数组去重
     * @param {Array} arr 待去重的函数
     */


    (0, _createClass3.default)(ArrayExtra, null, [{
        key: "unique",
        value: function unique(arr) {
            return [].concat((0, _toConsumableArray3.default)(new _set2.default(arr)));
        }

        /**
         * 求数组间的差集
         * @param {Array} arr1 数组A
         * @param {Array} arr2 数组B
         */

    }, {
        key: "different",
        value: function different(arr1, arr2) {
            // 得到并集
            var a = new _set2.default([].concat((0, _toConsumableArray3.default)(this.union(arr1, arr2))));
            // 得到交集
            var b = new _set2.default([].concat((0, _toConsumableArray3.default)(this.intersect(arr1, arr2))));

            // 从并集中过滤掉交集，剩下的即为差集
            var diff = new _set2.default([].concat((0, _toConsumableArray3.default)(a)).filter(function (x) {
                return !b.has(x);
            }));

            return [].concat((0, _toConsumableArray3.default)(diff));
        }

        /**
         * 求数组A to B 的单向差集
         * @param {Array} arr1 数组A
         * @param {Array} arr2 数组B
         */

    }, {
        key: "differentA2B",
        value: function differentA2B(arr1, arr2) {
            var a = new _set2.default([].concat((0, _toConsumableArray3.default)(arr1)));
            var b = new _set2.default([].concat((0, _toConsumableArray3.default)(arr2)));

            return [].concat((0, _toConsumableArray3.default)(new _set2.default([].concat((0, _toConsumableArray3.default)(a)).filter(function (x) {
                return !b.has(x);
            }))));
        }
    }, {
        key: "union",
        value: function union(arr1, arr2) {
            var a = new _set2.default(arr1);
            var b = new _set2.default(arr2);

            return (0, _from2.default)(new _set2.default([].concat((0, _toConsumableArray3.default)(a), (0, _toConsumableArray3.default)(b))));
        }

        /**
         * 求数组间交集
         * @param {Array} arr1 数组A
         * @param {Array} arr2 数组B
         */

    }, {
        key: "intersect",
        value: function intersect(arr1, arr2) {
            var a = new _set2.default(arr1);
            var b = new _set2.default(arr2);

            var inters = new _set2.default([].concat((0, _toConsumableArray3.default)(a)).filter(function (x) {
                return b.has(x);
            }));
            return (0, _from2.default)(inters);
        }
    }]);
    return ArrayExtra;
}();

exports.default = ArrayExtra;