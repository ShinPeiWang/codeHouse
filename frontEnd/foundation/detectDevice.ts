import IsMobileJs from 'ismobilejs';
const IsMobile = IsMobileJs(navigator.userAgent);

// 移除IsTestML，IsTestMP，用繼承覆寫解決
// 移除game
// 移除IsFU
// 新增一些detectUserInfo的方法
export default class DetectDevice {
    // public static game: any;
    public static testDevice: any;
    public static get IsPC(): boolean {
        return !this.IsMOB;
    }

    public static get IsMOB(): boolean {
        return IsMobile.phone || IsMobile.tablet || this.IsTestML || this.IsTestMP;
    }

    // 是否為測試手機橫版
    public static get IsTestML(): boolean {
        return this.testDevice === 'ML';
    }

    // 是否為測試手機直版
    public static get IsTestMP(): boolean {
        return this.testDevice === 'MP';
    }

    public static get IsPhone(): boolean {
        return IsMobile.phone || this.IsTestML || this.IsTestMP;
    }

    public static get IsIOS(): boolean {
        return IsMobile.apple.device;
    }

    public static get IsIphoneX(): boolean {
        return (this.IsIOS && window.screen.width === 812 && window.screen.height === 375);
    }

    public static get IsFirefox(): boolean {
        return (navigator.userAgent.toLowerCase().indexOf('firefox') > -1);
    }

    public static get IsMobileChrome(): boolean {
        //return navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || /CriOS/i.test(navigator.userAgent);
        if (/CriOS/i.test(navigator.userAgent)) return true;
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            const splitString = navigator.userAgent.split('(KHTML, like Gecko)');
            if (!splitString[1]) return false;
            const allBrowser = splitString[1].split('/');
            let browserNum = 0;
            if (splitString[1].toLowerCase().indexOf('chrome') > -1) browserNum++;
            if (splitString[1].toLowerCase().indexOf('safari') > -1) browserNum++;
            // 如果是真正的Chrome只會包含Chrome跟Safari
            // 減1是減去最後一個'/'後面的字串
            if (browserNum === 2 && allBrowser.length === 3) return true;
        }
        return false;
    }

    public static get IsSafari(): boolean {
        return Boolean(this.IsIOS && (navigator.userAgent.match(/AppleWebKit/) && navigator.userAgent.match(/Version/)));
    }

    public static get IsGoogleSearch(): boolean {
        return Boolean(this.IsIOS && (navigator.userAgent.match(/GSA/)));
    }

    public static get IsOppoBrowser() {
        return Boolean(navigator.userAgent.toLowerCase().indexOf('opr') > -1)
    }

    public static get IsIPad(): boolean {
        if (this.IsApp && this.IsIOS) {
            return Boolean(this.getUrlQuery('dtp').match(/Tablet|iPad/i));
        }
        return IsMobile.apple.tablet;
    }

    public static get IsPad(): boolean {
        return IsMobile.tablet;
    }

    // 寰宇客制化瀏覽器
    public static get IsUBCustomAndroid(): boolean {
        return (/CustomBrowserAndroid/).test(navigator.userAgent);
    }

    public static get IsAndroid(): boolean {
        if (this.IsUBCustomAndroid) {
            return true;
        }
        return IsMobile.android.device;
    }

    public static get IsIE11(): boolean {
        return (/Trident\/7\./).test(navigator.userAgent);
    }

    public static get IsUB() {
        return this.IsPCUB || this.IsAndroidUB || this.IsIOSUB;
    }

    public static get IsPCUB() {
        return (/ub\/(\d*\.){3}/).test(navigator.userAgent.toLowerCase()) && (/chrome\/(\d*\.){3}/).test(navigator.userAgent.toLowerCase());
    }

    public static get IsIOSUB() {
        return (/ubios\/(\d*\.){3}/).test(navigator.userAgent.toLowerCase()) && !(/chrome\/(\d*\.){3}/).test(navigator.userAgent.toLowerCase());
    }

    public static get IsAndroidUB() {
        return (/ubios\/(\d*\.){3}/).test(navigator.userAgent.toLowerCase()) && (/chrome\/(\d*\.){3}/).test(navigator.userAgent.toLowerCase());
    }

    public static get IsApp() {
        var userAgent = navigator.userAgent;
        if (this.getUrlQuery('isApp') === 'true') return true;
        // Android的機種
        if (userAgent.toLowerCase().indexOf('android') > -1) {
            const splitString = userAgent.split('(KHTML, like Gecko)');
            if (!splitString[1]) return false;
            const allBrowser = splitString[1].split('/');
            let browserNum = 0;
            if (splitString[1].toLowerCase().indexOf('version') > -1) browserNum++;
            if (splitString[1].toLowerCase().indexOf('chrome') > -1) browserNum++;
            if (splitString[1].toLowerCase().indexOf('safari') > -1) browserNum++;
            // Android的App只會包含Version跟Chrome跟Safari
            // 減1是減去最後一個'/'後面的字串
            if (browserNum === 3 && allBrowser.length === 4) return true;
            return false;
        }
        // iOS的機種
        var rules = ['WebView', '(iPhone|iPod|iPad)(?!.*Safari\/)'];
        var regex = new RegExp(`(${rules.join('|')})`, 'ig');
        return Boolean(userAgent.match(regex));
    }

    // public static get IsFU() {
    //     return (this.game.api.basic.fu === 'Y');
    // }

    public static get IsPortrait(): boolean {
        return (window.innerWidth < window.innerHeight && this.IsMOB) || this.IsTestMP;
    }

    public static get IsLandscape(): boolean {
        return !this.IsPortrait;
    }

    /*
    是不是寬螢幕： 用來判斷顯示 true: 區域左右顯示背景  false:貼齊slot區域
    寬螢幕true的固定邊1280 窄螢幕1080
    */
    public static get IsWideWidth(): boolean {
        // pad版的網頁 -> 寬螢幕
        if (this.IsPad && !this.IsApp) {
            return true;
        }
        /*
        電腦版、手機版的網頁、所有裝置的aio -> 窄螢幕
        我們公司的aio會用1920 * 1080開啟遊戲，所以要當作手機版的尺寸去resize(包含pad上的app)
        */
        return false;
    }

    public static get Direction(): String {
        return this.IsPortrait ? 'P' : 'L';
    }

    // ====分隔線====

    public static get IsMac(): boolean {
        return (/MAC OS/).test(navigator.userAgent.toUpperCase());
    }

    public static get IsSDK(): boolean {
        return (/sdkDomain=/).test(location.search);
    }

    public static get IsPWA(): boolean {
        // For iOS
        if (this.IsIOS && window.navigator['standalone']) return true

        // For Android
        if (this.IsAndroid && window.matchMedia('(display-mode: standalone)').matches) return true

        return false
    }

    private static getUrlQuery(name): string {
        const reg = new RegExp(`${name}=([^&]*)`);
        const result = reg.exec(location.search) || [];
        return result[1];
    }
}
