'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UCookie = function () {
    function UCookie() {
        (0, _classCallCheck3.default)(this, UCookie);
    }

    (0, _createClass3.default)(UCookie, [{
        key: 'set',
        value: function set(key, value) {
            var n = new Date();

            n.setTime(n.getTime() + 24 * 30 * 3600 * 1e3);

            document.cookie = key + '=' + value + '; expires=' + n.toGMTString() + ';path=/;domain=' + document.domain;
        }
    }, {
        key: 'get',
        value: function get(key) {
            var ck = document.cookie,
                start = ck.indexOf(key + '='),
                len = start + key.length + 1,
                end = ck.indexOf(';', len);

            // value为空
            if (!start && key !== ck.substring(0, key.length)) {
                return;
            }

            if (!~start) {
                return;
            }

            if (!~end) {
                end = ck.length;
            }

            return unescape(ck.substring(len, end));
        }
    }]);
    return UCookie;
}();

exports.default = UCookie;