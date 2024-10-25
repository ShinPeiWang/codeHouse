chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'grabMP3s') {
        const mp3Links = Array.from(
            document.querySelectorAll('source[src$=".mp3"]')
        ).map(link => link.href);
        sendResponse({ links: mp3Links });
    }
});
