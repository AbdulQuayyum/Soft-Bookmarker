chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const QueryParameters = tab.url.split("?")[1];
        const URLParameters = new URLSearchParams(QueryParameters);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: URLParameters.get("v"),
        });
    }
});