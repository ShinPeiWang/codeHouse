chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    actionFnObj[request.action](request, sender, sendResponse);
});

const batchOpenTab = (urls = []) => {
    // 逐個打開每個網址
    urls.forEach((url) => {
        chrome.tabs.create({ url: url }, (tab) => {
            // 當網頁打開後，注入腳本來檢索 MP3 資源
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: getTabSourceInfo
            }, (results) => {
                downloadFn({...results[0].result})

                // 自動關閉已處理完成的頁籤
                chrome.tabs.remove(tab.id);
            });
        });
    });
}

const getTabSourceInfo = () => {
    const sanitizeFilename = (filename) => {
        return filename
          .replace(/[\/\\:*?"<>|.,]/g, '') // 去掉無效字符
          .replace(/\s+/g, '_')             // 將空白字符替換為下劃線
          .trim();                          // 去掉前後空格
    }
    const image = document.getElementById('playMultimediaScriptImg');
    const audios = document.getElementsByTagName('source');
    const fileName = sanitizeFilename(document.getElementsByClassName('wording-title')[0].innerText|| '');
    return {
        ...(audios[0].src && {mp3Url: audios[0].src}),
        ...(image.src && {imgUrl: image.src}),
        fileName: fileName
    };
}

const downloadFn = ({mp3Url, fileName, imgUrl}) => {
    if (mp3Url) {
        chrome.downloads.download({
            url: mp3Url,
            filename: `${fileName}.mp3`
        });
    }

    if (imgUrl) {
        chrome.downloads.download({
            url: imgUrl,
            filename: `${fileName}.jpg`
        });
    }
};


const actionFnObj = {
    batchDownload: (request, sender, sendResponse) => {
        const urls = request.urls;
        // 逐個打開每個網址
        urls.forEach((url) => {
            chrome.tabs.create({ url: url }, (tab) => {
                // 當網頁打開後，注入腳本來檢索 MP3 資源
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: getTabSourceInfo
                }, (results) => {
                    downloadFn({...results[0].result})

                    // 自動關閉已處理完成的頁籤
                    chrome.tabs.remove(tab.id);
                });
            });
        });
    },
    batchDownload2: (request) => {
        chrome.scripting.executeScript({
            target: { tabId: request.tabID },
            func: () => {
                const itemDom = document.querySelectorAll('[class="wm-status-courses wm-paid playMultimedia"]');
                const urls = [];
                console.log('itemDom', itemDom)
                itemDom.forEach(item => {
                    urls.push(`https://shop.darencademy.com/users/playMultimedia/serial_number/${item.dataset.serial_number}/mid/${item.dataset.multimedia_id}/type/audio`);
                })

                return {urls}
            }
        }, (results) => {
            const {urls} = results[0].result;
            urls.length && batchOpenTab(urls);
        })
    },
    grabMP3s: (request, sender, sendResponse) => {
        const tabUrl = request.tabUrl;
        console.log('request', request);
        console.log('sender', sender);
        // 在這裡假設 MP3 文件的 URL 可以從當前頁面中的 `<audio>` 標籤獲取。
        chrome.scripting.executeScript(
            {
                target: { tabId: request.tabID },
                func: getTabSourceInfo
            },
            (results) => {
                downloadFn({...results[0].result})
            }
        );
    },
    grabAttachs: (request, sender, sendResponse) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: request.tabID },
                func: () => {
                    const attachs = Array.from(document.querySelectorAll('.wm-status-courses.wm-paid')).filter(el => el.classList.length === 2 && el.querySelector('i.fa.fa-download'));
                    const attachUrls = [];
                    attachs.forEach(attach => {
                        attachUrls.push({url: attach.href, filename: attach.innerText});
                    });
                    return {
                        attachUrls,
                    };
                }
            },
            (results) => {
                const {attachUrls} = results[0].result;
                console.log('attachUrls', attachUrls)
                attachUrls.forEach( item => {
                    chrome.downloads.download({
                        url: item.url,
                        filename: `${item.filename}`
                    });
                })
            }
        );
    }
}


