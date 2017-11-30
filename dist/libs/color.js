'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 颜色操作对象
 */
var Color = function () {
    function Color() {
        (0, _classCallCheck3.default)(this, Color);

        this.hex2Rgb = this.hexToRgb;
        this.rgb2Hex = this.rgbToHex;
        this.t2Grad = this.transformToGradient;
    }

    /**
     * 将hex表示方式转换为rgb表示方式
     * @param {String} hColor hex颜色
     */


    (0, _createClass3.default)(Color, [{
        key: 'hexToRgb',
        value: function hexToRgb(hColor) {
            var reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
            hColor = hColor.toLowerCase();

            if (hColor && reg.test(hColor)) {
                // 处理三位简写的颜色值如 #fff;
                if (hColor.length === 4) {
                    var newColor = '#';
                    hColor.substring(1).split('').forEach(function (c) {
                        newColor += '' + cc;
                    });
                    hColor = newColor;
                }

                // 处理6位颜色值
                var colorChange = [];
                hColor = hColor.substring(1);
                colorChange.push(parseInt('0x' + hColor.slice(0, 2)));
                colorChange.push(parseInt('0x' + hColor.slice(2, 4)));
                colorChange.push(parseInt('0x' + hColor.slice(4)));
                return colorChange;
            } else {
                return hColor;
            }
        }
    }, {
        key: 'rgbToHex',
        value: function rgbToHex(rgb) {
            var reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

            if (/^(rgb|RGB)/.test(rgb)) {
                var ac = rgb.replace(/(?:(|)|rgb|RGB)*/g, "").split(',');
                var strHex = '#';

                ac.forEach(function (a) {
                    var hex = Number(a).toString(16);
                    hex = hex < 10 ? '0' + hex : hex;

                    if (hex === '0') {
                        hex += hex;
                    }
                    strHex += hex;
                });

                if (strHex.length !== 7) {
                    strHex = rgb;
                }
                return strHex;
            } else if (reg.test(rgb)) {
                var aNum = rgb.replace(/#/, '').split('');

                if (aNum.length === 6) {
                    return rgb;
                } else if (aNum.length === 3) {
                    var numHex = '#' + aNum.map(function (a) {
                        return a + a;
                    }).join('');
                    return numHex;
                }
            } else {
                return rgb;
            }
        }

        /**
         * 将一个给定的颜色区间值转变为渐变色
         * @param {String} start 开始颜色
         * @param {String} end 结束颜色
         * @param {Number} step 转换的阶段
         */

    }, {
        key: 'transformToGradient',
        value: function transformToGradient(start, end, step) {
            var startRGB = this.hexToRgb(start);
            var startR = startRGB[0];
            var startG = startRGB[1];
            var startB = startRGB[2];

            var endRGB = this.hexToRgb(end);
            var endR = endRGB[0];
            var endG = endRGB[1];
            var endB = endRGB[2];

            var sR = (endR - startR) / step;
            var sG = (endG - startG) / step;
            var sB = (endB - startB) / step;

            var colorArr = [];

            for (var i = 0; i < step; i++) {
                // 计算每一步的hex值;
                var hex = this.rgbToHex('rgb(' + parseInt(sR * i + startR) + ',' + parseInt(sG * i + startG) + ',' + parseInt(sB * i + startB) + ')');
                colorArr.push(hex);
            }
            return colorArr;
        }
    }]);
    return Color;
}();

exports.default = Color;