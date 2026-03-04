// assets/kakao-share.js
// Common Kakao share (no-Korean text to avoid encoding issues)

const KAKAO_JS_KEY = "__KAKAO_JS_KEY__";
const THUMB_URL = "__THUMB_URL__";

function initKakao() {
  if (!window.Kakao) {
    console.error("Kakao SDK not loaded");
    return false;
  }
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
  return true;
}

function shareKakaoFeed(opts) {
  if (!initKakao()) {
    alert("Kakao SDK load failed. Check kakao.min.js");
    return;
  }

  const title = (opts && opts.title) || document.title || "Vibecoding Test";
  const description = (opts && opts.description) || "";
  const shareUrl = (opts && opts.url) || window.location.href;

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: title,
      description: description,
      imageUrl: THUMB_URL,
      link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
    },
    buttons: [
      {
        title: "Open test",
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
    ],
  });
}

function shareKakaoFromDOM(pathPrefix) {
  const base = window.location.origin;
  const url = pathPrefix ? base + pathPrefix : window.location.href;

  const pickText = (sels) => {
    for (let i = 0; i < sels.length; i++) {
      const el = document.querySelector(sels[i]);
      if (el && el.textContent && el.textContent.trim()) return el.textContent.trim();
    }
    return "";
  };

  const title =
    pickText(["#shareTitle", "#resultTitle", "#result-title", ".resultTitle", "h1", "h2"]) ||
    (document.title || "Vibecoding Test");

  const description =
    pickText(["#shareDesc", "#resultDesc", "#result-desc", ".resultDesc", "#result-type"]) ||
    "";

  shareKakaoFeed({ title: title, description: description, url: url });
}