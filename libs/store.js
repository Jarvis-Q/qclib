const MaxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');
let defaultExpire = MaxExpireDate;

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
function  _getStorageInstance(storage) {
    var type = typeof storage;
    if (type === 'string' && window[storage] instanceof Storage) {
        return window[storage];
    }
    return storage
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
function _getExpiresDate (expires, now) {
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

class CacheItem {
    constructor(value, exp) {
        this.create = (new Date()).getTime();
        exp = exp || defaultExpire;
        var expires = _getExpiresDate(exp);
        // expiresTime
        this.expires = expires.getTime();
        this.value = value;
    }

    static _isCacheItem(item) {
        if (typeof item !== 'object') {
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
    static _checkItemIsEffective(item) {
        var timeNow = (new Date()).getTime();
        return timeNow < item.expires;
    }

    /**
     * 检查Key并包裹key成一个字符串
     * @param key
     * @private
     */
    static _checkAndWrapKeyAsString(key) {
        if (typeof key !== 'string') {
            console.warn(key + 'used as a key, but it is not a string');
            key = String(key);
        }
        return key;
    }
}

class Serializer {
    static serializer (item) {
        return JSON.stringify(item);
    }

    static deserialize (data) {
        return data && JSON.parse(data);
    }
}

class CacheAPI {
    /**
     * 构造函数
     * @param options
     */
    constructor(options) {
        var defaults = {
            storage: 'localStorage',
            expires: Infinity  //An expiration time, in seconds. default never .
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

        } else {  // if not support, rewrite all functions without doing anything
            //Object.assign(this, CacheAPI);
        }
    }
    setItem(key, value, options = {}) {}
    getItem(key) {}
    remove(key) {}
    //清除所有的过期的缓存项目
    removeAllExpires() {}
    clear() {}
    add(key, options = {}){}
    //替换指定key的数据，当key在缓存中存在才会成功。
    replace(key, value, options = {}){}
    // 设置一个新的过期时间给一个已存在的key
    touch(key, exp){}
}


class Store extends CacheAPI {
    constructor(options) {
        super(options);
    }

    setItem(key, value, options = {}) {
        key = CacheItem._checkAndWrapKeyAsString(key);

        options = Object.assign({force: true}, options);

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

    getItem(key) {
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

    remove(key) {
        key = CacheItem._checkAndWrapKeyAsString(key);
        this.storage.removeItem(key);
        return key;
    }

    removeAllExpires() {
        var length = this.storage.length;
        var deleteKeys = [];

        for (var i = 0; i < length; i++) {
            var key = this.storage.key(i);
            var cacheItem = null;
            try {
                cacheItem = Serializer.deserialize(this.storage.getItem(key));
            } catch (e) {}

            if (cacheItem !== null && cacheItem.expires !== undefined) {
                let timeNow = (new Date()).getTime();

                if (timeNow >= cacheItem.expires) {
                    deleteKeys.push(key);
                }
            }
        }

        deleteKeys.forEach(key => {
            this.remove(key);
        })

        return deleteKeys;
    }

    add(key, value, options) {
        key = CacheItem._checkAndWrapKeyAsString(key);
        options = Object.assign({force: true}, options);
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

    replace (key, value, options) {
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

    touch (key, exp) {
        key = CacheItem._checkAndWrapKeyAsString(key);
        var cacheItem = null;
        try {
            cacheItem = Serializer.deserialize(this.storage.getItem(key));
        } catch (e) {
            return false;
        }
        if (CacheItem._isCacheItem(cacheItem)) {
            if (CacheItem._checkItemIsEffective(cacheItem)) {
                this.setItem(key, this.getItem(key), {exp: exp});
                return true;
            } else {
                this.remove(key);
            }
        }
        return false;
    }
}

export default Store;