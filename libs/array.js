class ArrayExtra {
    constructor() {
    }

    /**
     * 数组去重
     * @param {Array} arr 待去重的函数
     */
    static unique(arr) {
        return [...new Set(arr)];
    }

    /**
     * 求数组间的差集
     * @param {Array} arr1 数组A
     * @param {Array} arr2 数组B
     */
    static different(arr1, arr2) {
        // 得到并集
        let a = new Set([...this.union(arr1, arr2)]);
        // 得到交集
        let b = new Set([...this.intersect(arr1, arr2)]);

        // 从并集中过滤掉交集，剩下的即为差集
        let diff = new Set([...a].filter(x => !b.has(x)));

        return [...diff];
    }

    /**
     * 求数组A to B 的单向差集
     * @param {Array} arr1 数组A
     * @param {Array} arr2 数组B
     */
    static differentA2B(arr1, arr2) {
        let a = new Set([...arr1]);
        let b = new Set([...arr2]);

        return [...new Set([...a].filter(x => !b.has(x)))];
    }

    static union(arr1, arr2) {
        let a = new Set(arr1);
        let b = new Set(arr2);

        return Array.from(new Set([...a, ...b]));
    }

    /**
     * 求数组间交集
     * @param {Array} arr1 数组A
     * @param {Array} arr2 数组B
     */
    static intersect(arr1, arr2) {
        let a = new Set(arr1);
        let b = new Set(arr2);

        let inters = new Set([...a].filter(x => b.has(x)));
        return Array.from(inters);
    }
}

export default ArrayExtra;