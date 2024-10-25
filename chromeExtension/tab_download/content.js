chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'grabMP3s') {
        const mp3Links = Array.from(
            document.querySelectorAll('source[href$=".mp3"]')
        ).map(link => link.href);

        mp3Links.forEach(mp3Url => {
            chrome.runtime.sendMessage({ url: mp3Url });
        });

        alert(`Found ${mp3Links.length} MP3 links!`);
    }
});
