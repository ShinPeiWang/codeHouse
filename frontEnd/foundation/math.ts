export default class Calculate {
    /**
     * 乘法
     * @param  {Number} arg1 乘數1
     * @param  {Number} arg2 乘數2
     * @return {Number}      乘數1 * 乘數2
     */
    public static AccMul(arg1: number, arg2: number): number {
        let pow = 0;
        const arguments1 = arg1.toString();
        const arguments2 = arg2.toString();
        try { pow += arguments1.split(".")[1].length; } catch (e) { }
        try { pow += arguments2.split(".")[1].length; } catch (e) { }
        return Number(arguments1.replace(".", "")) * Number(arguments2.replace(".", "")) / Math.pow(10, pow);
    }

    /**
     * 除法
     * @param  {Number} arg1 除數
     * @param  {Number} arg2 被除數
     * @return {Number}      除數 / 被除數
     */
    public static AccDiv(arg1: number, arg2: number): number {
        let t1 = 0,
            t2 = 0;

        try { t1 = arg1.toString().split(".")[1].length; } catch (e) { }
        try { t2 = arg2.toString().split(".")[1].length; } catch (e) { }
        const r1 = Number(arg1.toString().replace(".", ""));
        const r2 = Number(arg2.toString().replace(".", ""));
        return Calculate.AccMul((r1 / r2), Math.pow(10, t2 - t1));
    }

    /**
     * 加法
     * @param  {Number} arg1 加數1
     * @param  {Number} arg2 加數2
     * @return {Number}      加數1 + 加數2
     */
    public static AccAdd(arg1: number, arg2: number): number {
        let r1 = 0;
        let r2 = 0;
        let m;
        try {
            r1 = arg1.toString().split('.')[1].length;
        } catch (e) { }
        try {
            r2 = arg2.toString().split('.')[1].length;
        } catch (e) { }
        m = Math.pow(10, Math.max(r1, r2));
        return (Calculate.AccMul(arg1, m) + Calculate.AccMul(arg2, m)) / m;
    }

    /**
     * 減法
     * @param  {Number} arg1 減數
     * @param  {Number} arg2 被減數
     * @return {Number}      減數 - 被減數
     */
    public static AccSub(arg1: number, arg2: number): number {
        return Calculate.AccAdd(arg1, -arg2);
    }

    /**
     * 求餘數
     * @param  {Number} arg1 餘數
     * @param  {Number} arg2 被餘數
     * @return {Number}      餘數 % 被餘數
     */
    public static AccRemainder(arg1: number, arg2: number): number {
        const valDecCount = (arg1.toString().split('.')[1] || '').length;
        const stepDecCount = (arg2.toString().split('.')[1] || '').length;
        const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
        const valInt = parseInt(arg1.toFixed(decCount).replace('.', ''));
        const stepInt = parseInt(arg2.toFixed(decCount).replace('.', ''));
        return (valInt % stepInt) / Math.pow(10, decCount);
    }

    /**
     * 求餘數
     * @param  {Number} arg1 角度
     * @return {Number}      弧度
     */
    public static DegreeToRadian(arg1: number): number {
        return arg1 / 180 * Math.PI;
    }
}

/** 取得指定範圍內的隨機浮點數 */
export function getRandomFloat(start: number, end: number) {
    return Math.random() * (end - start) + start;
}

/** 取得指定範圍內的隨機整數(包含start跟end) */
export function getRandomInt(start: number, end: number) {
    return Math.floor(Math.random() * (end - start + 1)) + start;
}

/** 從丟入的陣列中隨機一個值回傳 */
export function getRandomFromArray<T>(arr: T[]) {
    return arr[getRandomInt(0, arr.length - 1)];
}

/**
 * getRandomArray 陣列隨機取個數(不重複)
 * @param  {array} array    陣列
 * @param  {int} getCount   取的個數
 * @return {array} newArr   取完的陣列
 */
export function getRandomArray(array: number[], getCount: number): number[] {
    const currentArray = [...array];
    let newArr: number[] = [];

    for (let i = 0; i < getCount; i++) {
        // 陣列隨機取一個數
        const index = Math.floor(Math.random() * currentArray.length);
        newArr.concat(currentArray.splice(index, 1));
    }

    // 位置排序
    newArr = newArr.sort((a, b) => b - a);
    return newArr;
}

/** 兌換比率格式化 1000 => 1K */
export function formatRate(val: string): string {
    const valArr = val.split(':');

    if (valArr.length < 2) {
        return val;
    }

    valArr.forEach((v, i) => {
        valArr[i] = formatK(+v);
    });
    return `${valArr[0]}:${valArr[1]}`;
}

/** 兌換比率反格式化 1K => 1000 */
export function unFormatRate(val: string): string {
    const valArr = val.split(':');

    if (valArr.length < 2) {
        return val;
    }

    valArr.forEach((v, i) => {
        valArr[i] = `${unFormatK(v)}`;
    });
    return `${valArr[0]}:${valArr[1]}`;
}

/** 數字轉K 1000 => 1K */
export function formatK(val: number) {
    if (val < 1000) return `${val}`;

    const result = `${+(val / 1000).toFixed(3)}K`;
    return result;
}

/** K轉數字 1K => 1000 */
export function unFormatK(val: string) {
    let number;

    if (val.includes('K')) {
        number = accMul(+val.replace('K', ''), 1000);
    } else {
        number = +val;
    }

    return isNaN(number) ? 0 : number;
}

// 取得小數點後的字體代號 '8' => 'i'
export function getPointNumIndex(dot: string) {
    const dotArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    return dot.split('').map(source => source.replace(source, dotArr[+source])).join('');
}

// 將小數點的部分取代為英文代號 '19.88' => '19.ii'
export function dotNumConvert(num: number) {
    const intPart = `${num}`.split('.')[0];

    if (!`${num}`.split('.')[1]) {
        return intPart;
    }

    const dotPart = getPointNumIndex(`${num}`.split('.')[1]);
    return `${intPart}.${dotPart}`;
}

/**
 * 補千位分號 9999.99
 * @param  {Number | string} arg 餘數
 * @return {String} 9,999.99
 */
export function thousandFormat(arg: number | string): string {
    const arr = `${arg}`.split('.');
    const re = /(\d{1,3})(?=(\d{3})+$)/g;
    const num = arr[0].replace(re, '$1,') + (arr.length === 2 ? `.${arr[1]}` : '');
    return num;
}

/**
* 小數補零
* @param  {String} str  要處理的數字
* @param  {Number} len  幾位小數
* @param  {String} type 四捨五入 or 無條件捨去
* @return {Number}      處理完的數字
*/
export function pointFormat(str: string, len: number, type: 'round' | 'floor' = 'floor'): string {
    // 要呈現的數字
    const num = +str;
    const slice = str.split('.');

    if (slice.length === 1) {
        return `${num}${len ? `.${'0'.repeat(len)}` : ''}`;
    }

    const decimalLength = slice[1].length;
    const lengthDiff = len - decimalLength;

    if (lengthDiff === 0) {
        return str;
    }

    if (lengthDiff > 0) {
        return `${str}${'0'.repeat(lengthDiff)}`;
    }

    const pow = 10 ** len;
    let checkNumber = accMul(num, pow);

    switch (type) {
        case 'floor':
            checkNumber = Math.floor(checkNumber);
            break;
        case 'round':
            checkNumber = Math.round(checkNumber);
            break;
    }

    return pointFormat(`${accDiv(checkNumber, pow)}`, len, type);
}

/**
 * 乘法
 * @param  {Number} arg1 乘數1
 * @param  {Number} arg2 乘數2
 * @return {Number}      乘數1 * 乘數2
 */
export function accMul(arg1: number, arg2: number) {
    let pow = 0;
    const arguments1 = arg1.toString();
    const arguments2 = arg2.toString();
    // eslint-disable-next-line
    try { pow += arguments1.split('.')[1].length; } catch (e) { }
    // eslint-disable-next-line
    try { pow += arguments2.split('.')[1].length; } catch (e) { }
    return Number(arguments1.replace('.', '')) * Number(arguments2.replace('.', '')) / 10 ** pow;
}

/**
 * 除法
 * @param  {Number} arg1 被除數
 * @param  {Number} arg2 除數
 * @return {Number}      被除數 / 除數
 */
export function accDiv(arg1: number, arg2: number) {
    let t1 = 0;
    let t2 = 0;
    // eslint-disable-next-line
    try { t1 = arg1.toString().split('.')[1].length; } catch (e) { }
    // eslint-disable-next-line
    try { t2 = arg2.toString().split('.')[1].length; } catch (e) { }
    const r1 = Number(arg1.toString().replace('.', ''));
    const r2 = Number(arg2.toString().replace('.', ''));
    return accMul(r1 / r2, 10 ** (t2 - t1));
}

/**
 * 加法
 * @param  {Number} arg1 加數1
 * @param  {Number} arg2 加數2
 * @return {Number}      加數1 + 加數2
 */
export function accAdd(arg1: number, arg2: number): number {
    let r1 = 0;
    let r2 = 0;
    let m;
    // eslint-disable-next-line
    try { r1 = arg1.toString().split('.')[1].length; } catch (e) { }
    // eslint-disable-next-line
    try { r2 = arg2.toString().split('.')[1].length; } catch (e) { }
    m = Math.pow(10, Math.max(r1, r2));
    return (accMul(arg1, m) + accMul(arg2, m)) / m;
}

/**
 * 減法
 * @param  {Number} arg1 減數
 * @param  {Number} arg2 被減數
 * @return {Number}      減數 - 被減數
 */
export function accSub(arg1: number, arg2: number): number {
    return accAdd(arg1, -arg2);
}

/** 比率 1:10 -> 0.1 */
export function getChangeRate(rate: string) {
    const rateArr = rate.split(':');
    rateArr.forEach((v, i) => {
        rateArr[i] = v.replace('K', '000');
    });

    const count = accDiv(+rateArr[0], +rateArr[1]);
    return count;
}


/** 左邊自動補零 */
export function padLeft(str: string | number, len: number): string {
    if (`${str}`.length >= len) {
        return `${str}`;
    }
    return padLeft(`0${str}`, len);
}

/** 右邊自動補零 */
export function padRight(str: string | number, len: number): string {
    if (`${str}`.length >= len) {
        return `${str}`;
    }
    return padRight(`${str}0`, len);
}