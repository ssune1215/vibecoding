/**
 * Project-shared Kakao share
 * - 버튼: #kakaoShareBtn
 * - 이미지: og:image (없으면 /assets/thumb.png)
 * - 링크: 현재 URL
 */

// ✅ 기존 프로젝트에서 사용 중인 JavaScript 키를 그대로 사용하세요.
// (이미 키가 들어가 있는 공통 파일을 쓰고 계시면, 이 상수만 유지하면 됩니다.)
const KAKAO_JS_KEY = "b30b6d088f5b3551adc2890111d071fc";

function ensureKakaoReady() {
  if (!window.Kakao) {
    console.error("[kakao-share] Kakao SDK not loaded");
    return false;
  }
  if (!window.Kakao.isInitialized()) {
    try {
      window.Kakao.init(KAKAO_JS_KEY);
    } catch (e) {
      console.error("[kakao-share] Kakao.init failed:", e);
      return false;
    }
  }
  return true;
}

function getMeta(propOrName) {
  // propOrName can be 'property:og:image' or 'name:twitter:image'
  const [kind, key] = propOrName.split(":");
  if (kind === "property") {
    return document.querySelector(`meta[property='${key}']`)?.content || "";
  }
  if (kind === "name") {
    return document.querySelector(`meta[name='${key}']`)?.content || "";
  }
  return "";
}

function absoluteUrl(maybeRelative) {
  try {
    return new URL(maybeRelative, window.location.href).href;
  } catch {
    return maybeRelative;
  }
}

function shareKakao() {
  if (!ensureKakaoReady()) return;

  const url = window.location.href.split("#")[0];

  const title = getMeta("property:og:title") || document.title || "바이브코딩 테스트";
  const desc = getMeta("property:og:description") || "테스트 결과를 확인하고 공유해보세요.";

  const rawImg =
    getMeta("property:og:image") ||
    getMeta("name:twitter:image") ||
    "/assets/thumb.png";

  const imageUrl = absoluteUrl(rawImg);

  // ✅ 안정적인 sendDefault 방식
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description: desc,
      imageUrl,
      link: {
        mobileWebUrl: url,
        webUrl: url,
      },
    },
    buttons: [
      {
        title: "테스트 하러가기",
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      {
        title: "다른 테스트 보기",
        link: {
          mobileWebUrl: "https://blog.naver.com/forgiven_77/224195220807",
          webUrl: "https://blog.naver.com/forgiven_77/224195220807",
        },
      },
    ],
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("kakaoShareBtn");
  if (btn) btn.addEventListener("click", shareKakao);
});
