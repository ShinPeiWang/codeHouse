import * as BULL from 'commonJs/index';

export default class Tool {
    // 取得指定範圍內的隨機浮點數
    static GetRandomFloat(start, end) {
        return Math.random() * (end - start) + start;
    }

    // 取得指定範圍內的隨機整數(包含start跟end)
    public static GetRandomInt(start: number, end: number): number {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    }

    // 從丟入的陣列中隨機一個值回傳
    public static GetRandomFromArray(arr: any[]) {
        return arr[Tool.GetRandomInt(0, arr.length - 1)];
    }

    /**
     * getRandomArray 陣列隨機取個數(不重複)
     * @param  {array} array    陣列
     * @param  {int} getCount   取的個數
     * @return {array} newArr   取完的陣列
     */
    public static GetRandomArray(array: any[], getCount: number): any[] {
        let newArr = [];

        for (let i = 0; i < getCount; i++) {
            // 陣列隨機取一個數
            const item = array[Math.floor(Math.random() * array.length)];
            // 找到它的位置
            const index = array.indexOf(item);

            if (index > -1) {
                array.splice(index, 1);
                newArr.push(item);
            }
        }

        // 位置排序
        newArr = newArr.sort(Tool.SortNumber).reverse();
        return newArr;
    }

    // 按照數值的大小進行排序，必須使用排序函數
    public static SortNumber(a, b): any {
        return a - b;
    }

    // 兌換比率格式化 1000 => 1K
    public static FormatRate(val: string): string {
        const valArr = val.split(':');

        if (valArr.length < 2) {
            return val;
        }

        valArr.forEach((v, i) => {
            valArr[i] = (Number(v) >= 1000) ? `${Math.floor(Number(v) / 1000)}K` : v;
        });
        return `${valArr[0]}:${valArr[1]}`;
    }

    // 兌換比率反格式化 1K => 1000
    public static UnformatRate(val: string): string {
        const valArr = val.split(':');

        if (valArr.length < 2) {
            return val;
        }

        valArr.forEach((v, i) => {
            valArr[i] = v.replace('K', '000');
        });
        return `${valArr[0]}:${valArr[1]}`;
    }

    // 數字轉字串格式化 1000 => 1K
    public static GetKFormat(val: number): string {
        const valStr = (val > 999) ? `${(val / 1000).toFixed(3)}` : `${val}`;
        const index = valStr.indexOf('.');
        const str = [];
        for (let i = 0; i < 3; i++) {
            str[i] = valStr.substring((index + i + 1), (index + i + 2))
        };
        let result;
        if (str[0] === '0' && str[1] === '0' && str[2] === '0' && val > 999) {
            result = valStr.replace(/\u002e\u0030\u0030\u0030$/g, "");
        } else if (str[0] !== '0' && str[1] === '0' && str[2] === '0' && val > 999) {
            result = valStr.replace(/\u0030\u0030$/g, "");
        } else if (str[0] !== '0' && str[1] !== '0' && str[2] === '0' && val > 999) {
            result = valStr.replace(/\u0030$/g, "");
        } else {
            result = valStr;
        }
        result = (val > 999) ? result + 'K' : result;
        return result;
    }

    // 取得小數點後的字體代號 '8' => 'i'
    public static GetPointNumIndex(dot: string): string {
        const dotArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
        return dot.split('').map((source) => source.replace(source, dotArr[source])).join('');
    }

    // 將小數點的部分取代為英文代號 '19.88' => '19.ii'
    public static DotNumConvert(num: number): string {
        const intPart = `${num}`.split('.')[0];

        if (!`${num}`.split('.')[1]) {
            return intPart;
        }

        const dotPart = Tool.GetPointNumIndex(`${num}`.split('.')[1]);
        return `${intPart}.${dotPart}`;
    }

    /**
     * 補千位分號 9999.99
     * @param  {Number | string} arg 餘數
     * @return {String} 9,999.99
     */
    public static ThousandFormat(arg: number | string): string {
        const arr = `${arg}`.split('.');
        const re = /(\d{1,3})(?=(\d{3})+$)/g;
        const num = arr[0].replace(re, '$1,') + (arr.length === 2 ? `.${arr[1]}` : '');
        return num;
    }

    /**
    * 小數補零
    * @param  {String} str  要處理的數字
    * @param  {Number} len  幾位小數
    * @param  {Number} type 0: 無條件捨去 1: 四捨五入
    * @return {Number}      處理完的數字
    */
    public static PointFormat(str: any, len: number, type: number = 0): string {
        // 要呈現的數字
        const num = `${str}`;
        const slice = num.split('.');
        if (len === 0) {
            return slice[0];
        }

        if (num.indexOf(".") === -1) {
            return `${num}.${new Array(len + 1).join('0')}`;
        }

        if (slice[1].length !== 0 && slice[1].length < len) {
            return `${slice[0]}.${slice[1]}${new Array(len - slice[1].length + 1).join('0')}`;
        }

        let result;
        if (type === 0) {
            result = (slice[1].length > len) ?
                Math.floor(Number(num) * Math.pow(10, len)) / Math.pow(10, len) :
                num + new Array(len - slice[1].length + 1).join('0');
        } else {
            result = Number(num).toFixed(len);
        }

        if (`${result}`.indexOf(".") === -1) {
            return Tool.PointFormat(result, len, type);
        }

        const resultSlice = `${result}`.split('.');
        if (resultSlice[1].length < len) {
            return `${resultSlice[0]}.${Tool.padRight(resultSlice[1], len)}`;
        }

        return result;
    }

    // 去除陣列中重複的元件
    // [1,1,2,3] => [1,2,3]
    public static UniqueArray(array: any[]): any[] {
        const uniqueArray = [];

        array.forEach((ele) => {
            if (uniqueArray.indexOf(ele) < 0) {
                uniqueArray.push(ele);
            }
        });

        return uniqueArray;
    }

    // 比率 1:10 -> 0.1
    public static GetChangeRate(rate: string): number {
        const rateArr = rate.split(':');
        rateArr.forEach((v, i) => {
            rateArr[i] = v.replace('K', '000');
        });

        const count = Number(rateArr[0]) / Number(rateArr[1]);
        return count;
    }


    // 左邊自動補零
    public static PadLeft(str: string | number, len: number): string {
        if (`${str}`.length >= len) {
            return `${str}`;
        }
        return Tool.PadLeft(`0${str}`, len);
    }

    // 右邊自動補零
    public static padRight(str: string | number, len: number): string {
        if (`${str}`.length >= len) {
            return `${str}`;
        }
        return Tool.padRight(`${str}0`, len);
    }

    /**
    * makeHalfCircle 產生半圓形狀的多邊形
    * @param {object} info 半圓產生資訊
    * points: 由幾個點組成，越高半圓越圓滑
    * diameter: 直徑
    * angle: 半圓初始角度(0 = 上半圓, 90 = 左半圓, 180 = 下半圓, 270 = 右半圓)
    */
    public static MakeHalfCircle(info: any): PIXI.Polygon {
        const pointsArray = [];
        const angleDiff = Math.PI / (info.points - 1);
        for (let i = 0; i < info.points; i++) {
            const angle = Math.PI * info.angle / 180 + angleDiff * i;
            const point = new PIXI.Point((info.diameter / 2) * Math.cos(angle), (info.diameter / 2) * -Math.sin(angle));
            pointsArray.push(point);
        }

        return new PIXI.Polygon(...pointsArray);

    }

    /**
     * 創建面板時用來取得沒重複的key值，例如: spine_1
     * prefix: '_'前面的名稱
     * checkList: 檢查的清單，可給物件格式或陣列格式
     */
    public static GetValidKey(prefix: string, checkList: any) {
        let searchIndex = 0;
        let keepSearch = true;
        while (keepSearch) {
            searchIndex++;
            const checkName = `${prefix}_${searchIndex}`;

            // checkList是陣列時的處理方式
            if (Array.isArray(checkList)) {
                let nameExist = false;
                checkList.forEach((ani) => {
                    nameExist = (ani.key === checkName) || nameExist;
                });

                if (!nameExist) {
                    keepSearch = false;
                    return checkName;
                }
                continue;
            }

            // checkList是物件時的處理方式
            if (!checkList[checkName]) {
                keepSearch = false;
                return checkName;
            }
        }
    }

    /**
     * 在指定的targetObj內加入一個指定類型的動畫config，會自動索引可用的key值使用
     * type: 動畫類型
     * targetObj: 要添加config的目標物件
     * key: 可指定key的prefix，若沒指定則使用type
     */
    public static appendAniConfig(game: any, type: string, targetObj: any, key?: string): any {
        const typeClassTable = game.config.typeClassTable;

        const config = BULL.ToolControl[typeClassTable[type]].getDefaultConfig();
        config.type = type;
        config.key = Tool.GetValidKey(key || type, targetObj);
        targetObj[config.key] = config;
        return config;
    };

    /**
     * 獲得網址列的query參數
     * @param {string} name 參數的名稱
     * @return {string} 參數的值
     */
    public static getUrlQuery(name): string {
        const reg = new RegExp(`${name}=([^&]*)`);
        const result = reg.exec(location.search) || [];
        return result[1];
    }

    /**
     * 根據路徑取得屬性
     * @param {Object} target 取屬性的目標
     * @param {string} path 屬性的路徑 => 'aaa.bbb.ccc'
     * @return {any} 取到的屬性值, 若沒取到就是undefined
     */
    public static getPropertyByPath({ target, path }): any {
        const pathArray: any = path.split('.');
        let findTarget: any = target;
        try {
            while (pathArray.length > 0) {
                findTarget = findTarget[pathArray.shift()];
            }
            return findTarget;
        } catch (e) {
            console.warn('從物件', target, `上取路徑'${path}'失敗`);
            return;
        }
    }

    /**
     * 根據Cookie值
     * @param {string} cname 取目標Cookie
     * @return {string} 取到的屬性值
     */
    public static getCookie(cname: string): string {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /**
     * 根據路徑設定屬性
     * @param {Object} target 設定屬性的目標
     * @param {string} path 屬性的路徑 => 'aaa.bbb.ccc'
     * @param {any} value 屬性的新值
     */
    public static setPropertyByPath({ target, path, value }): void {
        const pathArray: any = path.split('.');
        let findTarget: any = target;

        while (pathArray.length > 1) {

            // 如果路經中間遇到undefined, 就產生空物件
            if (findTarget[pathArray[0]] === undefined && pathArray.length > 1) {
                findTarget[pathArray[0]] = {};
            }
            findTarget = findTarget[pathArray.shift()];
        }

        findTarget[pathArray[0]] = value;
    }

    /**
     * 將有串有變數名稱的字串替換為變數值
     * @param {Object} target 取變數值的目標
     * @param {string} keyPattern 串有變數名稱的字串 => 'Color_linght_[aaa.bbb]'
     * @return {string} 替換後的字串
     */
    public static insertVariablePattern({ target = {}, keyPattern = '' }): string {
        let completeKey = keyPattern;

        // 擷取所有被中括號括住的部份
        const keyVariablies = keyPattern.match(/\[[^\[\]]*\]/g) || [];
        keyVariablies.forEach(variablePattern => {

            // 把中括號拿掉
            const variablePath = variablePattern.replace(/\[|\]/g, '');

            // 取到目標路徑的值
            const variableValue = Tool.getPropertyByPath({
                target,
                path: variablePath
            });

            // 如果有取到值就取代回去
            completeKey = (typeof variableValue !== 'undefined') ? completeKey.replace(variablePattern, variableValue) : '';
        });
        return completeKey;
    }

    public static insertPaytablePattern({ lineHeight = 57, fontSize = 38, letterSpacing = 4, keyPattern = '' }): any {
        let textArray = keyPattern.split('\n');
        const symbolPosList = [];

        textArray.forEach((lineText, index) => {
            // 擷取所有被中括號括住的部份
            const keyVariablies = lineText.match(/\[[^\[\]]*\]/g) || [];

            keyVariablies.forEach(variablePattern => {

                // 取得前面字串長度紀錄該物件儲存的x與y
                const textObj = new BULL.Base.Text(0, 0, lineText.split(variablePattern)[0], false, {
                    lineHeight: lineHeight,
                    letterSpacing: letterSpacing,
                    align: 'left',
                    breakWords: true,
                    fontSize: `${fontSize}px`,
                    fontFamily: "微軟正黑體,Arial",
                    fill: '#FFF4CC'
                });

                // 把中括號拿掉
                const variablePath = variablePattern.replace(/\[|\]/g, '');

                // 取出symbol名稱與縮放倍率
                const symbolInfo = variablePath.split('_');
                const symbol = new BULL.Base.Sprite(0, 0, `${symbolInfo[0]}.png`);
                symbol.scale.set(Number(symbolInfo[1]) / 100);

                // 取得symbol小圖騰縮放後的寬度, 獲得每一個字元的長度
                const symbolWidth = symbol.width;

                // 空白字串為一般字串的0.2763倍取整數(無條件進位), 假如空白字元長度不滿足就一直增加
                let spaceString = ' ';
                while ((0.2763 * fontSize + letterSpacing) * spaceString.split('').length < symbolWidth) {
                    spaceString = spaceString + ' ';
                }

                // 紀錄symbol實際設定值
                symbolPosList.push({
                    textureName: `${symbolInfo[0]}.png`,
                    scale: Number(symbolInfo[1]) / 100,
                    x: textObj.width + letterSpacing,
                    y: index * lineHeight + lineHeight / 2.4
                })

                // 如果有取到值就取代回去
                lineText = (typeof spaceString !== 'undefined') ? lineText.replace(variablePattern, spaceString) : '';
            });
            textArray[index] = lineText;
        })

        const completeKey = textArray.join('\n');

        // 返回的項目為1. 取代後的字串, 2. symbol於字串中的位置陣列(會符合輸入物件數量)
        return { targetKey: completeKey, symbolPosList: symbolPosList };
    }

    public static checkTextureExist(textureName: string | Array<string>) {
        if (typeof textureName === 'object') {
            for (let index in textureName) {
                if (!PIXI.utils.TextureCache[textureName[index]] || PIXI.utils.TextureCache[textureName[index]].noFrame) {
                    return false;
                }
            }
            return true;
        }
        if (!PIXI.utils.TextureCache[<string>textureName] || PIXI.utils.TextureCache[<string>textureName].noFrame) {
            return false;
        }
        return true;
    }

    public static createIfTextureExist({ textureName, createFunction }) {
        if (Tool.checkTextureExist(textureName)) {
            createFunction();
        }
    }

    /**
     * 根據正則式條件回傳符合的textureName結果
     * @param {string} regexStr 正則式打字串 ex. test || test.*?
     * @param {string | number} resultProperty exec的屬性名稱
     *                                          0: 匹配的全部字符串
     *                                          1...n: 括号中的分组捕獲
     *                                          index: 匹配到的字符位于原始字符串的基于0的索引值
     *                                          input: 原始字符串
     * @return {array} 結果
     */
    public static getTextureNameSequence(regexStr: string, resultProperty = 0): Array<string> {
        const regex = new RegExp(regexStr);
        const result = [];
        Lodash.forEach(PIXI.utils.TextureCache, (obj, textureName) => {
            const regexR = regex.exec(textureName);
            if (regexR && regexR[resultProperty]) {
                result.push(regexR[resultProperty]);
            }
        })
        return result;
    }

    public static checkOwner(owner, children) {
        if (owner === children) {
            return true;
        }
        if (owner.children && owner.children.length) {
            for (let i = 0; i < owner.children.length; i++) {
                if (Tool.checkOwner(owner.children[i], children)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static firstWordUpperCase(str) {
        const arr = str.split('');
        const first = arr[0].toUpperCase();

        arr.shift();

        return `${first}${arr.join('')}`
    }

    // in2圖片未載入提示
    public static checkIn2Res(game: any): any {
        if (!game.api.module.uploadList) {
            console.log("請設定該遊戲模板的選用素材表！");
            return;
        }
        const missResources = {
            loading: [],
            image: [],
            sound: []
        }
        const uploadList = game.api.module.uploadList;
        Lodash.forEach(uploadList.loading, texture => {
            if (!BULL.Helper.Tool.checkTextureExist(texture)) {
                missResources.loading.push(texture);
            }
        });
        Lodash.forEach(uploadList.image, texture => {
            if (!BULL.Helper.Tool.checkTextureExist(texture)) {
                missResources.image.push(texture);
            }
        });
        Lodash.forEach(uploadList.sound, sound => {
            const regex = /(.*?)\.mp3/;
            const regResult = regex.exec(sound) || [];
            const soundName = regResult[1];
            let soundIsExist = false;
            Lodash.forEach(game.api.source.sound, obj => {
                if (soundName && sound === `${soundName}.mp3`) {
                    soundIsExist = true;
                }
            });
            if (!soundIsExist) {
                missResources.sound.push(`${sound}`);
            }
        });
        const langSetting = {
            title: {
                'zh-tw': `無法找到資源`,
                'zh-cn': `无法找到资源`,
                'en': `Can't find resources`
            },
            loading: {
                'zh-tw': `<b>請上傳載入圖檔:</b><br>`,
                'zh-cn': `<b>请上传载入图档:</b><br>`,
                'en': `<b>please upload loading images:</b><br>`
            },
            image: {
                'zh-tw': `<b>請上傳圖片:</b><br>`,
                'zh-cn': `<b>请上传图片:</b><br>`,
                'en': `<b>please upload images:</b><br>`
            },
            sound: {
                'zh-tw': `<b>請上傳音檔:</b><br>`,
                'zh-cn': `<b>请上传音档:</b><br>`,
                'en': `<b>please upload audios:</b><br>`
            }
        }
        let missResAlert = '';

        Lodash.forEach(missResources, (missList, key) => {
            if (missList.length !== 0) {
                missResAlert = missResAlert + (langSetting[key][game.api.basic.lang] || langSetting[key]['en']);
                missList.forEach((resource, index) => {
                    missResAlert = (missList.length - 1) !== index ?
                        `${missResAlert}"${resource}",${'<br>'}` :
                        `${missResAlert}"${resource}"${'<br>'}`;
                });
            }
        });
        if (!!missResAlert) {
            game['resourceMissing'] = true;
            window['SweetAlert'].fire({
                type: 'error',
                title: `<strong>${langSetting.title[game.api.basic.lang] || langSetting.title['en']}</strong>`,
                html: `${missResAlert}`
            });
            return;
        }
        game['resourceMissing'] = false;
    }

    // 根據包圖檔resource的key值取得
    public static getImageList(name: string, loader = PIXI.loader): any[] {
        if (!loader.resources[name]) {
            return;
        }
        const list = Lodash.keys(loader.resources[name].data.frames);
        return list;
    }

    /**
     *
     * @param obj 會更新此物件底下所有sprites並update texture
     * @param replaceList textureID有在清單裡的都會update，若不給就全部更新
     */
    public static updateTextures(obj, replaceList?) {
        if (obj.children && obj.children.length) {
            obj.children.forEach((subObj) => {
                Tool.updateTextures(subObj, replaceList);
            });
        }
        if (
            !obj.texture ||
            !obj.texture.textureCacheIds ||
            // 只改單圖不改序列圖
            obj.texture.textureCacheIds.length !== 1 ||
            //TODO 特例:button.ts 有額外定義texture屬性，但Button繼承Container，不屬於Sprite
            obj.button ||
            // 如果有給清單就只會update清單裡的
            (replaceList && !Lodash.includes(replaceList, obj.texture.textureCacheIds[0]))
        ) {
            return;
        }
        obj.texture = PIXI.utils.TextureCache[obj.texture.textureCacheIds[0]];
    }

    // 取得清單中目標物件並回傳單一物件陣列, 用於限制工具選項只能選取目標物件
    public static getTargetFromList(game: any, list: any, target: string) {
        let targetArr = []
        list.forEach((elem, i) => {
            if (elem === target) targetArr.push(elem);
        });
        return targetArr;
    }

    public static GetSourceKey(spec, device, deviceSourceKey) {
        var needSourceKey = {};
        if (window['sourceList']) {
            // 取medusa的設定: spec哪些key要去選用清單找資源的清單
            const specNeedKey = JSON.parse(window['sourceList']['result']['common_config']['select_res_info'])['specNeedKey'];
            specNeedKey.forEach((keyName) => {
                needSourceKey[keyName] = true
            });
        } else {
            needSourceKey = {
                fontName: true,
                dataKey: true,
                frameImage: true,
                fontDisable: true,
                leftLineImage: true,
                rightLineImage: true,
                doubleLineImage: true
            }
        }

        const deviceSkipKey = {
            pc: {
                mobile: true
            },
            mobile: {
                pc: true
            }
        }
        const needSkipKey = deviceSkipKey[device] || device.pc;

        const recursiveSourceKey = spec => {
            // 有特別設定output是false的才排除
            // if (spec.output === false) {
            //     return;
            // }
            if (!spec) {
                return;
            }
            Lodash.forEach(spec, (value, key) => {
                if (needSkipKey[key]) {
                    return;
                }
                if (typeof value === 'object') {
                    recursiveSourceKey(value);
                    return;
                }
                if (needSourceKey[key] && value) {
                    deviceSourceKey.push(value);
                }
            });
        }
        recursiveSourceKey(spec);
    }

    public static CheckLoadResource(game, name, callback?) {
        if (PIXI.loader.resources[name]) {
            if (callback) {
                callback();
            }
            return;
        }
        if (game.unit.message) {
            game.unit.message.enter({
                msg: 'Loading...'
            });
        }
        const searchArray = game.resSearchArray;
        const index = Lodash.findIndex(searchArray, (o) => { return o.name === name; });
        if (index >= 0) {
            const url = game.api.source.url;
            const path = searchArray[index].path
            PIXI.loader.add(name, PATH_R(`${url}${path}`), { crossOrigin: 'anonymous' });
            PIXI.loader.load(() => {
                if (callback) {
                    callback();
                }
                game.unit.message.show(false);
            });
            return;
        }

        console.log(`BULL: '${name}' is used but not uploaded.`);
    }

    public static getSpineOptions(game: any, spineControl: any) {
        var optionList;

        const keyPrefix = (spineControl.key) ? spineControl.key.split('_')[0] : spineControl.type;

        switch (keyPrefix) {
            case 'win':
            case 'bigWin':
                optionList = game.api.source.winSpine.map((obj) => obj.name);
                break;
            case 'totalWin':
                optionList = game.api.source.totalWinSpine.map((obj) => obj.name);
                break;
            case 'finish':
                optionList = game.api.source.finishSpine.map((obj) => obj.name);
                break;
            case 'effectSpine':
                optionList = game.api.source.effectSpine.map((obj) => obj.name);
                break;
            case 'tally':
                optionList = game.api.source.tallySpine.map((obj) => obj.name);
                break;
            case 'symbolFrame':
                optionList = game.api.source.symbolFrame ?
                    game.api.source.symbolFrame.map((obj) => obj.name) :
                    game.api.source.spine ? game.api.source.spine.map((obj) => obj.name) : [];
                break;
            default:
                optionList = game.api.source.spine ? game.api.source.spine.map((obj) => obj.name) : [];
                break;
        }

        return optionList;
    }

    /**
     * 取class物件內的所有functions
     * funcsArr: function名稱陣列
     */
    public static GetClassAllFunctions(classObj) {
        const funcsArr = Object.getOwnPropertyNames(classObj.__proto__).filter(prop => {
            return prop !== 'constructor' && classObj[prop] && classObj[prop].constructor && classObj[prop].call && classObj[prop].apply;
        });

        return funcsArr;
    }

    /**
     * @param object 傳入需要巢狀搜尋的物件
     * @param selectKey 需要抓取的屬性陣列
     */
    public static getNeedSourceKey(object: object, selectKey: Array<any>) {
        const recursiveArray = [];
        const recursiveSourceKey = (object) => {
            if (!object) {
                return;
            }
            Lodash.map(object, (value, key) => {
                if (typeof value === 'object') {
                    recursiveSourceKey(value);
                    return;
                }
                if (selectKey.indexOf(key) >= 0 && value) {
                    recursiveArray.push(value);
                }
            });
        }
        recursiveSourceKey(object);
        return recursiveArray;
    }

    // 異步等待的foreach
    public static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    static leaveGame(game, logout?: boolean) {
        if (BULL.Core.DetectDevice.IsApp) {
            game.appEvent.leaveGame(logout);
            return;
        };
        const exop = this.getUrlQuery('exit_option');
        switch (exop) {
            case '1':
                window.close();
                break;
            case '2':
                const param = this.getUrlQuery('param');
                if (!param) break;
                const unesparam = window.unescape(param);
                const newp = `${unesparam.substring(unesparam.length - 1)}${unesparam.substring(1, unesparam.length - 1)}${unesparam.substring(0, 1)}`;
                try {
                    if (!window.atob(newp).split('exit_url=')[1]) break;
                    const exurl = window.atob(newp).split('exit_url=')[1];
                    window.location.href = exurl;
                } catch (error) {
                    break;
                };
                break;
            case '3':
                break;
            case '4':
                window.history.go(-1);
                break;
            default:
                window.close();
                setTimeout(() => {
                    window.history.go(-1);
                }, 100);
                break;
        };

        setTimeout(() => {
            if (game.unit && game.unit.message) {
                game.unit.message.enter({
                    msgCode: '114020002'
                });
            };
        }, 5000);
    }

    /**
     * 獲得網址的網域domain
     * @param {string} url 網址字串
     * @return {string} 網域
     */
    public static getUrlDomain(url): any {
        const result = /((?:http|https|wss|ws):\/\/((?:[\w-]+)(?:\.[\w-]+)+))(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.exec(url) || [];

        return result[1];
    }

    public static getLang(gameID: string): string {
        let lang = this.getUrlQuery('lang') || 'en';
        return lang;
    }
    /**
     * 獲得網址的網域host
     * @param {string} url 網址字串
     * @return {string} host
     */
    public static getUrlHost(url): any {
        const result = /(?:http|https|wss|ws):\/\/(((?:[\w-]+)(?:\.[\w-]+)+))(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.exec(url) || [];

        return result[1];
    }

    /**
     * 將Promise物件重新包裝，回傳一個新的Promise，使其不管成功失敗都會回傳一個物件
     * 並利用物件的status來判斷結果
     * @param  {Promise} promiseObject Promise物件
     * @return {Promise} 重新包裝後的Promise，不管成功或失敗都會resolve一個物件
     */
    public static asyncify<T>(promiseObject: Promise<T>): Promise<{
        status: boolean,
        response?: any,
        error?: any
    }> {
        return new Promise(resolve => {
            promiseObject
                .then((res: T) => {
                    resolve({
                        status: true,
                        response: res
                    });
                })
                .catch((e: any) => {
                    resolve({
                        status: false,
                        error: e
                    });
                });
        });
    }

    // 物件屬性巢狀攤平
    public static objectFlatten(obj): object {
        const traverseAndFlatten = function (currentNode, target, flattenedKey?) {
            for (const key in currentNode) {
                if (currentNode.hasOwnProperty(key)) {
                    let newKey;
                    newKey = (flattenedKey === undefined) ? key : `${flattenedKey}.${key}`;

                    const value = currentNode[key];
                    if (typeof value === 'object') {
                        traverseAndFlatten(value, target, newKey);
                    } else {
                        target[newKey] = value;
                    }
                }
            }
        }

        let result = {};
        traverseAndFlatten(obj, result);

        return result;
    }

    public static consoleGameVersion(): void {

        if (window['isTwApp']) {
            const { version } = require('common/bearRich/config').default;
            console.log(`%c GAME VERSION %c ${version} `, 'margin: 5px 0; line-height: 20px; color: #FFF; background: #45509b; ', 'color: white; background: black; line-height: 20px;')
        }
    }
}