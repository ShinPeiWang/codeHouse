// document.getElementById('batch_download').addEventListener('click', () => {
//     console.log('test');
//     const urls = [
//         'https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/720/type/audio',
//         'https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/721/type/audio',
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/722/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/723/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/724/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/725/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/726/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/727/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/730/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/731/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/732/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/736/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/737/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/738/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/740/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/741/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/742/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/750/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/751/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/752/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/760/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/761/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/762/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/767/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/768/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/770/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/779/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/780/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/781/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/789/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/790/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/791/type/audio",
//         "https://shop.darencademy.com/users/playMultimedia/serial_number/6673512914/mid/792/type/audio",
//     ];

//     // 發送網址清單到背景腳本
//     chrome.runtime.sendMessage({ action: 'batchDownload', urls: urls });
// });

document.getElementById('grab').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.runtime.sendMessage({action: "grabMP3s", tabUrl: tabs[0].url, tabID: tabs[0].id});
    });
});


document.getElementById('grab_attachment').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.runtime.sendMessage({action: "grabAttachs", tabUrl: tabs[0].url, tabID: tabs[0].id});
    });
});


document.getElementById('batch_download').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.runtime.sendMessage({action: "batchDownload2", tabUrl: tabs[0].url, tabID: tabs[0].id});
    });
});

