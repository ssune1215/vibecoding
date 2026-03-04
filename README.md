# Vibecoding (Cloudflare Pages)

## Deploy (완전자동)
- Cloudflare Pages Build command: `node tools/build.mjs`
- Build output directory: `/`
- Environment variables:
  - `KAKAO_JS_KEY` : 카카오 JavaScript 키 (필수)
  - `BASE_URL` : 사이트 기본 주소 (예: https://vibecoding-bz8.pages.dev) (선택, 없으면 CF_PAGES_URL 사용)

## 테스트 추가
1) 새 폴더 만들기 (예: `newtest/`)  
2) 폴더 안에 `index.html` 넣기  
3) GitHub에 업로드(커밋)  
→ 배포 시 `tests.json` 자동 생성되어 메인 목록에 자동 반영됩니다.
