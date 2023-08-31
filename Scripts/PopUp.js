import { GetActiveTabURL } from "./Utilities";

const AddNewBookmark = (bookmarks, bookmark) => {
    const BookmarkTitleElement = document.createElement("div");
    const ControlsElement = document.createElement("div");
    const NewBookmarkElement = document.createElement("div");
  
    BookmarkTitleElement.textContent = bookmark.desc;
    BookmarkTitleElement.className = "bookmark-title";
    ControlsElement.className = "bookmark-controls";
  
    SetBookmarkAttributes("play", OnPlay, ControlsElement);
    SetBookmarkAttributes("delete", OnDelete, ControlsElement);
  
    NewBookmarkElement.id = "bookmark-" + bookmark.time;
    NewBookmarkElement.className = "bookmark";
    NewBookmarkElement.setAttribute("timestamp", bookmark.time);
  
    NewBookmarkElement.appendChild(BookmarkTitleElement);
    NewBookmarkElement.appendChild(ControlsElement);
    bookmarks.appendChild(NewBookmarkElement);
  };
  
  const ViewBookmarks = (currentBookmarks=[]) => {
    const BookmarksElement = document.getElementById("bookmarks");
    BookmarksElement.innerHTML = "";
  
    if (currentBookmarks.length > 0) {
      for (let i = 0; i < currentBookmarks.length; i++) {
        const bookmark = currentBookmarks[i];
        AddNewBookmark(BookmarksElement, bookmark);
      }
    } else {
      BookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
    }
  
    return;
  };
  
  const OnPlay = async e => {
    const BookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const ActiveTab = await GetActiveTabURL();
  
    chrome.tabs.sendMessage(ActiveTab.id, {
      type: "PLAY",
      value: BookmarkTime,
    });
  };
  
  const OnDelete = async e => {
    const ActiveTab = await GetActiveTabURL();
    const BookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById(
      "bookmark-" + BookmarkTime
    );
  
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
  
    chrome.tabs.sendMessage(ActiveTab.id, {
      type: "DELETE",
      value: BookmarkTime,
    }, ViewBookmarks);
  };
  
  const SetBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
  
    controlElement.src = "Assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
  };
  
  document.addEventListener("DOMContentLoaded", async () => {
    const ActiveTab = await GetActiveTabURL();
    const queryParameters = ActiveTab.url.split("?")[1];
    const URLParameters = new URLSearchParams(queryParameters);
  
    const CurrentVideo = URLParameters.get("v");
  
    if (ActiveTab.url.includes("youtube.com/watch") && CurrentVideo) {
      chrome.storage.sync.get([CurrentVideo], (data) => {
        const CurrentVideoBookmarks = data[CurrentVideo] ? JSON.parse(data[CurrentVideo]) : [];
  
        ViewBookmarks(CurrentVideoBookmarks);
      });
    } else {
      const container = document.getElementsByClassName("container")[0];
  
      container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
    }
  });