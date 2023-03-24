import axios from "axios";

type EnumType<T extends { [key: string]: string }> = T[keyof T];
const requestType = {
    GET: "GET",
    POST: "POST"
} as const;

type requestType = EnumType<typeof requestType>;

/**
 * xhr簡單用法
 * @param type GET或POST
 * @param url url網址
 * @param param 參數，即使用GET也以物件形式傳入，會自行轉換
 * @returns 回傳值型別axios的promise
 */
export default function xhrPromise(type: requestType, url: string, param): Promise<any> {
    let axiosParam;
    switch (type) {
        case "GET":
            let querys = "?";
            for (let prop in param) {
                querys = `${querys}${prop}=${param[prop]}&`;
            }
            querys = querys.substring(0, querys.length - 1);

            axiosParam = {
                method: 'get',
                url: url + querys
            }

            break;
        case "POST":
            axiosParam = {
                method: 'post',
                url,
                data: JSON.stringify(param),
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json"
                }
            }

            break;

        default:
            break;
    }
    return axios(axiosParam);
}