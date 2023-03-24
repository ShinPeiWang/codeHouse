import { DetectDevice, WagerData } from '@cleanjs/common-module';
import { getUrlQuery } from 'commonJs/helper/tool';

export default class DetectUserInfo {
    public static get getDesktopOS() {
        const target = window.navigator.userAgent;

        switch (true) {
            case target.includes('Windows NT 13.'):
                return 'Windows 11';
            case target.includes('Windows NT 10.0'):
                return 'Windows 10';
            case target.includes('Windows NT 6.2'):
                return 'Windows 8';
            case target.includes('Windows NT 6.1'):
                return 'Windows 7';
            case target.includes('Windows NT 6.0'):
                return 'Windows Vista';
            case target.includes('Windows NT 5.1'):
                return 'Windows XP';
            case target.includes('Windows NT 5.0'):
                return 'Windows 2000';
            case target.includes('Mac'):
                return 'macOS';
            case target.includes('X11'):
                return 'UNIX';
            case target.includes('Linux'):
                return 'Linux';
            default:
                return '';
        }
    }

    public static get isTablet() {
        return PIXI.utils.isMobile.tablet;
    }

    public static get iOSWebView() {
        const userAgent = window.navigator.userAgent.toLowerCase();

        return DetectDevice.IsIOS && !userAgent.includes('safari');
    }

    public static get AndroidWebView() {
        const userAgent = window.navigator.userAgent.toLowerCase();

        return DetectUserInfo.Android && userAgent.includes('wv');
    }

    public static get isAIO() {
        return getUrlQuery('platform') === 'AIO';
    }

    public static get Android() {
        return navigator.userAgent.includes('Android');
    }

    public static get BlackBerry() {
        return navigator.userAgent.includes('BlackBerry');
    }

    public static get WindowsPhone() {
        return navigator.userAgent.includes('Windows Phone');
    }

    public static get WindowsTablet() {
        return navigator.userAgent.includes('Windows') && navigator.userAgent.includes('ARM');
    }

    public static get webOS() {
        return navigator.userAgent.includes('webOS');
    }

    public static get getBrowser() {
        let browser: string | undefined;

        const spaceSp = navigator.userAgent.split(' ');

        switch (true) {
            case DetectDevice.IsUB:
            case DetectUserInfo.isOpera:
            case DetectDevice.IsFirefox:
            case DetectDevice.IsSafari:
            case DetectUserInfo.isIE:
            case DetectUserInfo.isEdge:
                browser = spaceSp[spaceSp.length - 1];
                break;
            case DetectUserInfo.isChrome:
                browser = spaceSp[spaceSp.length - 2];
                break;
            default:
                break;
        }

        if (navigator.userAgent.includes('Mobile Safari')) {
            browser = spaceSp[spaceSp.length - 1];

            if (browser.includes('Safari')) {
                browser = spaceSp[spaceSp.length - 4];
            }

            if (browser.includes('Gecko')) {
                browser = spaceSp[spaceSp.length - 3];
            }
        } else if (DetectUserInfo.Android && !browser) {
            browser = spaceSp[spaceSp.length - 2];
        }

        if (navigator.userAgent.includes('iOS')) {
            browser = spaceSp[spaceSp.length - 3];
        }

        return browser && browser.replace(/\//g, ' ');
    }

    public static get getOSAndVersion() {
        const info = navigator.userAgent
            .split('(')[1]
            .split(')')[0]
            .split(';');

        if (DetectUserInfo.Android) {
            return info.find(part => part.includes('Android')) || '';
        } else if (DetectDevice.IsIOS) {
            const os = info[0];
            const version = os === 'iPad'
                ? info[1].split(' ')[3].replace(/_/g, '.')
                : info[1].split(' ')[4].replace(/_/g, '.');

            return `${os} ${version}`;
        }

        return DetectUserInfo.getDesktopOS === 'macOS'
            ? info[1].replace(/_/g, '.')
            : DetectUserInfo.getDesktopOS;
    }


    public static get isOpera() {
        return !!window.opr?.addons
            || !!window.opera
            || navigator.userAgent.includes(' OPR/');
    }

    public static get isIE() {
        return !!window.document.documentMode;
    }

    public static get isEdge() {
        return navigator.userAgent.includes('Trident');
    }

    public static get isChrome() {
        return !!window.chrome;
    }

    public static get getScreenResolution() {
        return {
            w: screen.width,
            h: screen.height
        };
    }

    public static getGraphicCardInfo(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;

        let showGPU = 'undefined';

        if (!DetectUserInfo.isIE && gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

            if (debugInfo) {
                showGPU = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
        return showGPU;
    }

    public static getDeviceInfo(canvas?: HTMLCanvasElement) {
        const os = DetectUserInfo.getOSAndVersion;
        const resolution = DetectUserInfo.getScreenResolution;
        const browser = DetectUserInfo.getBrowser;
        const wagerData = WagerData.output();

        const isTablet = DetectUserInfo.isTablet;
        const aio = DetectUserInfo.isAIO;
        const mua = getUrlQuery('mua') || '';
        const dtp = getUrlQuery('dtp') || '';
        const graphicCard = canvas ? DetectUserInfo.getGraphicCardInfo(canvas) : '';

        let webView = 'false';
        let screenResolution: string;

        if (DetectDevice.IsMOB) {
            // 螢幕解析度 (screen.width裝置物理寬度; screen.heigh裝置物理高度; devicePixelRatio: 裝置像素比例）
            screenResolution = `${resolution.w * devicePixelRatio}x${resolution.h * devicePixelRatio}`;

            if (DetectDevice.IsIOS) {
                webView = (DetectUserInfo.iOSWebView) ? 'is_iOSWebView' : 'isnot_iOSWebView';
            } else if (DetectUserInfo.Android) {
                webView = (DetectUserInfo.AndroidWebView) ? 'is_AndroidWebView' : 'isnot_AndroidWebView';
            }
        } else {
            screenResolution = `${resolution.w}x${resolution.h}`;
        }

        return {
            rd: 'rd1',
            ua: navigator.userAgent,
            os,
            srs: screenResolution,
            wrs: `${window.innerWidth}x${window.innerHeight}`,
            dpr: devicePixelRatio,
            pl: 'H5',
            pf: browser,
            wv: webView,
            aio,
            vga: graphicCard,
            tablet: isTablet,
            cts: Date.now(),
            mua,
            dtp,
            pla: wagerData.platform
        };
    }
}