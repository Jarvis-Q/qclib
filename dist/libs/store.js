'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MaxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');
var defaultExpire = MaxExpireDate;

/**
 * @see https://github.com/gsklee/ngStorage/blob/master/ngStorage.js#L52
 *
 * 当 Safari (OS X or iOS) 处于隐身(保护)模式时, 可能会出现localStorage
 * 尽管是有效的但是可以通过调用.setItem可能抛出以下异常: "QUOTA_EXCEEDED_ERR:
 * DOM Exception 22: An attempt was made to add something to storage
 * that exceeded the quota"
 *
 * @param storage
 * @private
 */
function _isStorageSupported(storage) {
    var supported = false;

    if (storage && storage.setItem) {
        supported = true;

        var key = '__' + Math.round(Math.random() * 1e7);

        try {
            storage.setItem(key, key);
            storage.removeItem(key);
        } catch (err) {
            supported = false;
        }

        return supported;
    }
}

/**
 * 获取storage的实例
 *
 * @param storage
 * @returns {*}
 * @private
 */
function _getStorageInstance(storage) {
    var type = typeof storage === 'undefined' ? 'undefined' : (0, _typeof3.default)(storage);
    if (type === 'string' && window[storage] instanceof Storage) {
        return window[storage];
    }
    return storage;
}

function _isValidDate(date) {
    return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
}

/**
 * 获取过期时间
 * @param expires
 * @param now
 * @returns {*}
 * @private
 */
function _getExpiresDate(expires, now) {
    now = now || new Date();

    if (typeof expires === 'number') {
        expires = expires === Infinity ? MaxExpireDate : new Date(now.getTime() + expires * 1000);
    } else if (typeof expires === 'string') {
        expires = new Date(expires);
    }

    if (expires && !_isValidDate(expires)) {
        throw new Error('`expires` parameter cannot be converted to a valid Date instance');
    }

    return expires;
}

/**
 * @see http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
 * @param e
 * @returns {boolean}
 * @private
 */
function _isQuotaExceeded(e) {
    var quotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014:
                    // Firefox
                    if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                        quotaExceeded = true;
                    }
                    break;
            }
        } else if (e.number === -2147024882) {
            // Internet Explorer 8
            quotaExceeded = true;
        }
    }
    return quotaExceeded;
}

var CacheItem = function () {
    function CacheItem(value, exp) {
        (0, _classCallCheck3.default)(this, CacheItem);

        this.create = new Date().getTime();
        exp = exp || defaultExpire;
        var expires = _getExpiresDate(exp);
        // expiresTime
        this.expires = expires.getTime();
        this.value = value;
    }

    (0, _createClass3.default)(CacheItem, null, [{
        key: '_isCacheItem',
        value: function _isCacheItem(item) {
            if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) !== 'object') {
                return false;
            }

            if (item) {
                if ('create' in item && 'expires' in item && 'value' in item) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 检查item是否过期
         * @param item
         * @private
         */

    }, {
        key: '_checkItemIsEffective',
        value: function _checkItemIsEffective(item) {
            var timeNow = new Date().getTime();
            return timeNow < item.expires;
        }

        /**
         * 检查Key并包裹key成一个字符串
         * @param key
         * @private
         */

    }, {
        key: '_checkAndWrapKeyAsString',
        value: function _checkAndWrapKeyAsString(key) {
            if (typeof key !== 'string') {
                console.warn(key + 'used as a key, but it is not a string');
                key = String(key);
            }
            return key;
        }
    }]);
    return CacheItem;
}();

var Serializer = function () {
    function Serializer() {
        (0, _classCallCheck3.default)(this, Serializer);
    }

    (0, _createClass3.default)(Serializer, null, [{
        key: 'serializer',
        value: function serializer(item) {
            return (0, _stringify2.default)(item);
        }
    }, {
        key: 'deserialize',
        value: function deserialize(data) {
            return data && JSON.parse(data);
        }
    }]);
    return Serializer;
}();

var CacheAPI = function () {
    /**
     * 构造函数
     * @param options
     */
    function CacheAPI(options) {
        (0, _classCallCheck3.default)(this, CacheAPI);

        var defaults = {
            storage: 'localStorage',
            expires: Infinity //An expiration time, in seconds. default never .
        };
        // var opt = Object.assign(defaults, options);

        var opt = defaults;
        var expires = opt.expires;

        if (expires && typeof expires !== 'number' && !_isValidDate(expires)) {
            throw new Error('Constructor `exp` parameter cannot be converted to a valid Date instance');
        } else {
            defaultExpire = expires;
        }

        var storage = _getStorageInstance(opt.storage);

        var isSupported = _isStorageSupported(storage);

        this.isSupported = isSupported;

        if (isSupported) {

            this.storage = storage;

            this.quotaExceedHandler = function (key, val, options) {
                console.warn('Quota exceeded!');
                if (options && options.force === true) {
                    var deleteKeys = this.removeAllExpires();
                    console.warn('delete all expires CacheItem : [' + deleteKeys + '] and try execute `set` method again!');
                    try {
                        options.force = false;
                        this.setItem(key, val, options);
                    } catch (err) {
                        console.warn(err);
                    }
                }
            };
        } else {// if not support, rewrite all functions without doing anything
            //Object.assign(this, CacheAPI);
        }
    }

    (0, _createClass3.default)(CacheAPI, [{
        key: 'setItem',
        value: function setItem(key, value) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        }
    }, {
        key: 'getItem',
        value: function getItem(key) {}
    }, {
        key: 'remove',
        value: function remove(key) {}
        //清除所有的过期的缓存项目

    }, {
        key: 'removeAllExpires',
        value: function removeAllExpires() {}
    }, {
        key: 'clear',
        value: function clear() {}
    }, {
        key: 'add',
        value: function add(key) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        }
        //替换指定key的数据，当key在缓存中存在才会成功。

    }, {
        key: 'replace',
        value: function replace(key, value) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        }
        // 设置一个新的过期时间给一个已存在的key

    }, {
        key: 'touch',
        value: function touch(key, exp) {}
    }]);
    return CacheAPI;
}();

var Store = function (_CacheAPI) {
    (0, _inherits3.default)(Store, _CacheAPI);

    function Store(options) {
        (0, _classCallCheck3.default)(this, Store);
        return (0, _possibleConstructorReturn3.default)(this, (Store.__proto__ || (0, _getPrototypeOf2.default)(Store)).call(this, options));
    }

    (0, _createClass3.default)(Store, [{
        key: 'setItem',
        value: function setItem(key, value) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            key = CacheItem._checkAndWrapKeyAsString(key);

            options = (0, _assign2.default)({ force: true }, options);

            if (undefined === value) {
                return this.delete(key);
            }

            value = Serializer.serializer(value);
            var cacheItem = new CacheItem(value, options.exp);

            try {
                this.storage.setItem(key, Serializer.serializer(cacheItem));
            } catch (e) {
                if (_isQuotaExceeded(e)) {
                    this.quotaExceedHandler(key, value, options, e);
                } else {
                    console.error(e);
                }
            }
            return value;
        }
    }, {
        key: 'getItem',
        value: function getItem(key) {
            key = CacheItem._checkAndWrapKeyAsString(key);
            var cacheItem = null;
            try {
                cacheItem = Serializer.deserialize(this.storage.getTime(key));
            } catch (e) {
                return null;
            }

            if (CacheItem._isCacheItem(cacheItem)) {
                if (CacheItem._checkItemIsEffective(cacheItem)) {
                    var value = cacheItem.value;
                    return Serializer.deserialize(value);
                } else {
                    this.delete(key);
                }
            }
            return null;
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            key = CacheItem._checkAndWrapKeyAsString(key);
            this.storage.removeItem(key);
            return key;
        }
    }, {
        key: 'removeAllExpires',
        value: function removeAllExpires() {
            var _this2 = this;

            var length = this.storage.length;
            var deleteKeys = [];

            for (var i = 0; i < length; i++) {
                var key = this.storage.key(i);
                var cacheItem = null;
                try {
                    cacheItem = Serializer.deserialize(this.storage.getItem(key));
                } catch (e) {}

                if (cacheItem !== null && cacheItem.expires !== undefined) {
                    var timeNow = new Date().getTime();

                    if (timeNow >= cacheItem.expires) {
                        deleteKeys.push(key);
                    }
                }
            }

            deleteKeys.forEach(function (key) {
                _this2.remove(key);
            });

            return deleteKeys;
        }
    }, {
        key: 'add',
        value: function add(key, value, options) {
            key = CacheItem._checkAndWrapKeyAsString(key);
            options = (0, _assign2.default)({ force: true }, options);
            try {
                var cacheItem = Serializer.deserialize(this.storage.getItem(key));
                if (!CacheItem._isCacheItem(cacheItem) || !CacheItem._checkItemIsEffective(cacheItem)) {
                    this.setItem(key, value, options);
                    return true;
                }
            } catch (e) {
                this.setItem(key, value, options);
                return true;
            }
            return false;
        }
    }, {
        key: 'replace',
        value: function replace(key, value, options) {
            key = CacheItem._checkAndWrapKeyAsString(key);
            var cacheItem = null;
            try {
                cacheItem = Serializer.deserialize(this.storage.getItem(key));
            } catch (e) {
                return false;
            }
            if (CacheItem._isCacheItem(cacheItem)) {
                if (CacheItem._checkItemIsEffective(cacheItem)) {
                    this.setItem(key, value, options);
                    return true;
                } else {
                    this.remove(key);
                }
            }
            return false;
        }
    }, {
        key: 'touch',
        value: function touch(key, exp) {
            key = CacheItem._checkAndWrapKeyAsString(key);
            var cacheItem = null;
            try {
                cacheItem = Serializer.deserialize(this.storage.getItem(key));
            } catch (e) {
                return false;
            }
            if (CacheItem._isCacheItem(cacheItem)) {
                if (CacheItem._checkItemIsEffective(cacheItem)) {
                    this.setItem(key, this.getItem(key), { exp: exp });
                    return true;
                } else {
                    this.remove(key);
                }
            }
            return false;
        }
    }]);
    return Store;
}(CacheAPI);

exports.default = Store;