const KAKAO_JS_KEY = "b30b6d088f5b3551adc2890111d071fc";

function initKakao() {
  if (!window.Kakao) {
    console.error("Kakao SDK not loaded");
    return false;
  }
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
  return true;
}

function shareKakao() {
  if (!initKakao()) return;

  const shareUrl = location.href; // ✅ 지금 접속 중인 URL 그대로
  const title = document.title || "연애 온도 테스트";
  const desc =
    document.querySelector('meta[property="og:description"]')?.content ||
    "내 연애 온도는 몇 도일까? 지금 바로 테스트";

  const img = location.origin + '/assets/thumb-share-1200x630.jpg?v=3';

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description: desc,
      imageUrl: img,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: "이 테스트 하기",
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      {
        title: "총테스트 모음글",
        link: {
          mobileWebUrl: "https://blog.naver.com/forgiven_77/224195220807",
          webUrl: "https://blog.naver.com/forgiven_77/224195220807",
        },
      },
    ],
  });
}


function bindKakaoShareButton(){
  const btn = document.getElementById('kakaoShareBtn');
  if (btn && !btn.dataset.kakaoBound) {
    btn.dataset.kakaoBound='1';
    btn.addEventListener('click', shareKakao);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindKakaoShareButton);
} else {
  bindKakaoShareButton();
}
