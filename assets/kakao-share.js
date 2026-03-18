const KAKAO_JS_KEY = "b30b6d088f5b3551adc2890111d071fc";

/**
 * 전역 shareKakao 함수
 * - 각 테스트 페이지에서 별도 구현 없이 이 함수를 호출
 * - 페이지의 HTML 요소를 읽어 동적으로 메시지 구성
 */
function shareKakao(customTitle, customDesc, customImg) {
    if (!window.Kakao) return;
    if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);

    // 1. 값 추출 (인자 우선 -> 페이지 요소 -> 기본값)
    const shareUrl = window.location.href;
    const title = customTitle || document.getElementById('res-name')?.innerText || document.title;
    
    // 설명 추출 (결과 박스 내용 우선)
    let desc = customDesc || document.getElementById('res-desc')?.innerText || 
               document.querySelector('meta[property="og:description"]')?.content || 
               "지금 바로 테스트 결과를 확인해보세요!";
    
    // 설명이 너무 길면 자름
    if (desc.length > 80) desc = desc.substring(0, 77) + "...";

    // 이미지 추출 (결과 이모지 또는 og:image)
    const img = customImg || window.location.origin + "/assets/share-thumb.jpg";

    const blogUrl = 'https://blog.naver.com/PostView.naver?blogId=forgiven_77&logNo=224198478277';

    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: title + " 🔍",
            description: desc,
            imageUrl: img,
            link: { mobileWebUrl: blogUrl, webUrl: blogUrl }
        },
        buttons: [
            {
                title: '테스트 해보기',
                link: { mobileWebUrl: shareUrl, webUrl: shareUrl }
            }
        ]
    });
}

// 구버전 및 버튼 바인딩 지원
function initKakao() {
    if (window.Kakao && !Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
    return true;
}

function bindKakaoShareButton(){
    // ID가 kakaoShareBtn인 요소가 있으면 자동 연결
    const btn = document.getElementById('kakaoShareBtn') || document.querySelector('.btn-kakao');
    if (btn) {
        btn.onclick = () => shareKakao();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindKakaoShareButton);
} else {
    bindKakaoShareButton();
}
