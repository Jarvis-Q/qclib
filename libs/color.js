/**
 * 颜色操作对象
 */
class Color {
    constructor() {
        this.hex2Rgb = this.hexToRgb;
        this.rgb2Hex = this.rgbToHex;
        this.t2Grad = this.transformToGradient;
    }

    /**
     * 将hex表示方式转换为rgb表示方式
     * @param {String} hColor hex颜色
     */
    hexToRgb(hColor) {
        let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        hColor = hColor.toLowerCase();

        if (hColor && reg.test(hColor)) {
            // 处理三位简写的颜色值如 #fff;
            if (hColor.length === 4) {
                let newColor = '#';
                hColor.substring(1).split('').forEach(c => {
                    newColor += `${cc}`;
                })
                hColor = newColor;
            }

            // 处理6位颜色值
            let colorChange = [];
            hColor = hColor.substring(1);
            colorChange.push(parseInt(`0x${hColor.slice(0, 2)}`));
            colorChange.push(parseInt(`0x${hColor.slice(2, 4)}`));
            colorChange.push(parseInt(`0x${hColor.slice(4)}`));
            return colorChange;
        } else {
            return hColor;
        }
    }

    rgbToHex(rgb) {
        var reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

        if (/^(rgb|RGB)/.test(rgb)) {
            let ac = rgb.replace(/(?:(|)|rgb|RGB)*/g, "").split(',');
            let strHex = '#';

            ac.forEach(a => {
                let hex = Number(a).toString(16);
                hex = hex < 10 ? `0${hex}` : hex;

                if (hex === '0') { hex += hex;}
                strHex += hex;
            })

            if (strHex.length !== 7) {
                strHex = rgb;
            }
            return strHex;
        } else if (reg.test(rgb)) {
            let aNum = rgb.replace(/#/, '').split('');

            if (aNum.length === 6) {
                return rgb;
            } else if (aNum.length === 3) {
                let numHex = '#' + aNum.map(a => {
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
    transformToGradient(start, end, step) {
        let startRGB = this.hexToRgb(start);
        let startR = startRGB[0];
        let startG = startRGB[1];
        let startB = startRGB[2];
        
        let endRGB = this.hexToRgb(end);
        let endR = endRGB[0];
        let endG = endRGB[1];
        let endB = endRGB[2];

        let sR = (endR - startR) / step;
        let sG = (endG - startG) / step;
        let sB = (endB - startB) / step;

        let colorArr = [];

        for (let i = 0; i < step; i++) {
            // 计算每一步的hex值;
            let hex = this.rgbToHex(`rgb(${parseInt(sR * i + startR)},${parseInt(sG * i + startG)},${parseInt(sB * i + startB)})`);
            colorArr.push(hex);
        }
        return colorArr;
    }
}

export default Color;