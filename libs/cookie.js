class UCookie {
    constructor() {
        this.value = document.cookie;
        return this;
    }

    set(key, value) {
        let n = new Date;

        n.setTime(n.getTime() + 24 * 30 * 3600 * 1e3)

        document.cookie = key + '=' + value + '; expires=' + n.toGMTString() + ';path=/;domain=' + document.domain;
    }

    get(key) {
        let ck = document.cookie
        ,   start = ck.indexOf(key + '=')
        ,   len = start + key.length + 1
        ,   end = ck.indexOf(';', len);

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
}

export default UCookie;