// /js/vibe-common.js
(function () {
  function cfg() {
    return window.VIBE_CONFIG || {};
  }

  // 질문/선택지 랜덤 셔플
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 카카오 초기화
  function initKakao() {
    const c = cfg();
    if (!window.Kakao) return { ok: false, msg: "Kakao SDK not loaded" };
    if (!c.KAKAO_JS_KEY) return { ok: false, msg: "KAKAO_JS_KEY missing" };
    if (!Kakao.isInitialized()) Kakao.init(c.KAKAO_JS_KEY);
    return { ok: true };
  }

  // 카카오 공유
  function shareKakao(opts) {
    const c = cfg();
    const r = initKakao();
    if (!r.ok) {
      alert("카카오 공유 설정이 필요합니다.\n" + r.msg);
      return;
    }

    const title = (opts && opts.title) || c.DEFAULT_SHARE_TITLE;
    const description = (opts && opts.description) || c.DEFAULT_SHARE_DESC;
    const imageUrl = (opts && opts.imageUrl) || c.DEFAULT_THUMB_URL;
    const url = (opts && opts.url) || window.location.href;
    const buttonText = (opts && opts.buttonText) || "나도 테스트하기";

    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: title,
        description: description,
        imageUrl: imageUrl,
        link: { mobileWebUrl: url, webUrl: url }
      },
      buttons: [
        {
          title: buttonText,
          link: { mobileWebUrl: url, webUrl: url }
        }
      ]
    });
  }

  function fireConfetti() {
    try {
      if (!window.confetti) return;
      const end = Date.now() + 900;
      (function frame() {
        confetti({
          particleCount: 5,
          spread: 65,
          startVelocity: 28,
          origin: { x: Math.random() * 0.2 + 0.4, y: 0.15 }
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } catch (e) {}
  }

  window.Vibe = {
    shuffle: shuffle,
    shareKakao: shareKakao,
    fireConfetti: fireConfetti
  };
})();
