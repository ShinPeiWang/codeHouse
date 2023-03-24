export default class EventEmitter {
    private listenList: { [key: string]: Function[] } = {};

    // 事件訂閱
    public subscribe(eventName, fn) {
        if (!this.listenList[eventName]) {
            this.listenList[eventName] = [];
        }
        this.listenList[eventName].push(fn);
    }

    // 事件發布
    public publish(eventName, ...args) {
        // console.log(`%c 📣 ${eventName}  %c ${[...args]} `, 'background: #CCC; color: #000', 'background: #fdfd99; color: #000; font-weight: bold')
        if (!this.listenList[eventName]) {
            return;
        }

        this.listenList[eventName].forEach(fn => {
            fn(...args);
        })
    }

    // 取消訂閱，沒給第二個參數就該eventName底下全部事件都移除
    public unsubscribe(eventName, fn?) {
        const eventArr = this.listenList[eventName];
        if (!eventArr) return false;
        if (!fn) {
            eventArr.length = 0;
            return;
        }

        const targetIndex = this.listenList[eventName].indexOf(fn);
        if (targetIndex >= 0) {
            this.listenList[eventName].splice(targetIndex, 1);
        }
    }
};