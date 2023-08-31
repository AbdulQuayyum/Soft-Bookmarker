(() => {
    let youtubeLeftControls, youtubePlayer;
    let CurrentVideo = "";
    let CurrentVideoBookmarks = [];

    const FetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([CurrentVideo], (obj) => {
                resolve(obj[CurrentVideo] ? JSON.parse(obj[CurrentVideo]) : []);
            });
        });
    };

    const AddNewBookmarkEventHandler = async () => {
        const CurrentTime = youtubePlayer.currentTime;
        const NewBookmark = {
            time: CurrentTime,
            desc: "Bookmark at " + GetTime(CurrentTime),
        };
        CurrentVideoBookmarks = await FetchBookmarks();

        chrome.storage.sync.set({
            [CurrentVideo]: JSON.stringify([...CurrentVideoBookmarks, NewBookmark].sort((a, b) => a.time - b.time))
        });
    }

    const NewVideoLoaded = async () => {
        const BookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

        CurrentVideoBookmarks = await FetchBookmarks();

        if (!BookmarkBtnExists) {
            const BookmarkBtn = document.createElement("img");

            BookmarkBtn.src = chrome.runtime.getURL("Assets/bookmark.png");
            BookmarkBtn.className = "ytp-button " + "bookmark-btn";
            BookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.append(BookmarkBtn);
            BookmarkBtn.addEventListener("click", AddNewBookmarkEventHandler);
        }
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            CurrentVideo = videoId;
            NewVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            CurrentVideoBookmarks = CurrentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [CurrentVideo]: JSON.stringify(CurrentVideoBookmarks) });

            response(CurrentVideoBookmarks);
        }
    });

    NewVideoLoaded();
})();

const GetTime = t => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substr(11, 0);
}