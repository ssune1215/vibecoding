const KAKAO_JS_KEY = "b30b6d088f5b3551adc2890111d071fc";

function initKakao() {
  if (!window.Kakao) {
    console.error("Kakao SDK not loaded");
    return false;
  }
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
  return true;
}

function getShareMeta() {
  const shareUrl = location.href;
  const title = document.querySelector('meta[property="og:title"]')?.content || document.title || "테스트";
  const desc = document.querySelector('meta[property="og:description"]')?.content || "지금 바로 테스트해보세요.";
  let img = document.querySelector('meta[property="og:image"]')?.content || (location.origin + "/assets/thumb.png");
  if (img && img.startsWith('/')) img = location.origin + img;
  return { shareUrl, title, desc, img };
}

function shareKakao(customPath) {
  if (!initKakao()) return;
  const { shareUrl, title, desc, img } = getShareMeta();
  const finalUrl = customPath ? new URL(customPath, location.origin).href : shareUrl;

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description: desc,
      imageUrl: img,
      link: {
        mobileWebUrl: finalUrl,
        webUrl: finalUrl,
      },
    },
    buttons: [
      {
        title: "테스트 하러가기",
        link: {
          mobileWebUrl: finalUrl,
          webUrl: finalUrl,
        },
      },
    ],
  });
}

function shareKakaoFromDOM(customPath) {
  shareKakao(customPath);
}

function bindKakaoShareButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#kakaoShareBtn, #btnKakao');
    if (!btn) return;
    e.preventDefault();
    const customPath = btn.dataset.sharePath || undefined;
    shareKakao(customPath);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindKakaoShareButtons, { once: true });
} else {
  bindKakaoShareButtons();
}
