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

  const shareUrl = location.href.split('#')[0]; // ✅ 지금 접속 중인 URL 그대로
  const title = document.title || "연애 온도 테스트";
  const desc =
    document.querySelector('meta[property="og:description"]')?.content ||
    "내 연애 온도는 몇 도일까? 지금 바로 테스트";

    const rawImg =
    document.querySelector('meta[property="og:image"]')?.content ||
    "/assets/thumb.png";

  // Kakao requires an absolute image URL
  const img = new URL(rawImg, location.href).href;

}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("kakaoShareBtn");
  if (btn) btn.addEventListener("click", shareKakao);
});