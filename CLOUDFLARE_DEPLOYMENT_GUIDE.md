# Cloudflare Pages 배포 가이드

GitHub 저장소를 Cloudflare Pages에 자동 배포하는 완벽한 가이드입니다.

---

## 1단계: Cloudflare API Token 생성

### 작업
1. https://dash.cloudflare.com/profile/api-tokens 방문
2. **"Create Token"** 클릭
3. 템플릿 선택 페이지에서 **Custom token** 선택 (또는 아무것도 선택 안 함)

### 권한 설정 (중요!)
아래 권한만 선택하세요:
- **Account → Cloudflare Pages** → **Edit**

다른 Workers, R2, KV 등의 권한은 불필요합니다.

### Zone Resources 설정
- **Zone Resources** → "All zones" 선택

### 토큰 생성
- **"Create Token"** 클릭
- **토큰 값을 복사** (한 번만 표시됨!)

---

## 2단계: GitHub Secrets 설정

생성한 API Token을 GitHub에 저장합니다.

### CLOUDFLARE_API_TOKEN 설정
```bash
gh secret set CLOUDFLARE_API_TOKEN --body "YOUR_TOKEN_HERE"
```

또는 GitHub 웹에서:
1. 리포지토리 → **Settings** → **Secrets and variables** → **Actions**
2. **"New repository secret"**
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: (복사한 토큰 붙여넣기)

### CLOUDFLARE_ACCOUNT_ID 설정
1. https://dash.cloudflare.com 접속
2. 우상단 → **Account** 메뉴 또는 **Overview**
3. **Account ID** 찾아서 복사
4. GitHub Secrets에 추가:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: (Account ID)

---

## 3단계: Cloudflare Pages 프로젝트 설정

### 프로젝트 생성 또는 기존 프로젝트 설정

1. https://dash.cloudflare.com → **Pages** → 프로젝트 선택
2. **Settings** → **General** 탭
3. **Repository** 섹션:
   - GitHub 계정이 연동되었는지 확인
   - 저장소 선택: `{username}/{repo-name}`
   - **Production branch**: `main`

### Build & Deploy 설정

**Build command:**
```bash
node scripts/sync-wiki.mjs && cd sites/public && pnpm install && pnpm build && cd ../personal && npm ci && npx quartz build && cd ../.. && mkdir -p _site && cp -r sites/public/dist/* _site/ && mkdir -p _site/notes && cp -r sites/personal/public/* _site/notes/
```

**Deploy command:**
```bash
ls -la _site
```

**Root directory:** `/`

> 💡 **팁**: Build command에서 최종 배포 파일이 `_site` 디렉토리에 생성되어야 합니다.

---

## 4단계: wrangler.toml 파일 생성

프로젝트 루트에 `wrangler.toml` 파일 생성:

```toml
name = "your-project-name"
pages_build_mode = "direct"
```

> ⚠️ **중요**: `name`은 Cloudflare Pages 프로젝트 이름과 정확히 일치해야 합니다!

---

## 5단계: 배포 테스트

```bash
git add .
git commit -m "Configure Cloudflare Pages deployment"
git push
```

GitHub Push 후:
1. Cloudflare Pages 대시보드 → **Deployments** 탭 확인
2. 새로운 배포가 "In progress" 상태에서 시작되어야 함
3. 완료되면 "Success" 표시

---

## 🐛 일반적인 에러와 해결법

### ❌ "Project not found" 에러
**원인**: wrangler.toml의 `name`이 Cloudflare Pages 프로젝트 이름과 다름

**해결**: 
- Cloudflare Pages 대시보드에서 정확한 프로젝트 이름 확인
- wrangler.toml의 `name` 값 업데이트

### ❌ "Authentication failed" 에러
**원인**: API Token이 유효하지 않거나 권한이 부족함

**해결**:
- GitHub Secrets의 `CLOUDFLARE_API_TOKEN` 값 확인
- 새로운 API Token 생성 (권한: Cloudflare Pages Edit만)
- GitHub Secrets 업데이트

### ❌ "root directory not found" 에러
**원인**: Build command가 실행되지 않았거나 `_site` 디렉토리 미생성

**해결**:
- Build command가 올바른지 확인
- Build command 끝에 `mkdir -p _site && cp ...` 부분이 있는지 확인

### ❌ "error occurred while running deploy command"
**원인**: Deploy command 실행 중 문제 발생

**해결**:
- Deploy command를 간단하게: `ls -la _site` (또는 `echo "Deployment complete"`)
- Build 부분에서 모든 작업이 이루어지도록 설정

---

## 📋 체크리스트

배포 전에 확인하세요:

- [ ] Cloudflare API Token 생성 (Pages Edit 권한)
- [ ] GitHub Secrets에 `CLOUDFLARE_API_TOKEN` 저장
- [ ] GitHub Secrets에 `CLOUDFLARE_ACCOUNT_ID` 저장
- [ ] Cloudflare Pages 프로젝트 생성
- [ ] GitHub 저장소 연동됨
- [ ] Build command 설정 완료
- [ ] Deploy command 설정 완료
- [ ] Root directory = `/` 또는 배포 폴더
- [ ] wrangler.toml 파일 생성 (프로젝트 이름 일치)
- [ ] 테스트 Push 성공

---

## 🚀 배포 후

배포가 성공하면:
1. Cloudflare Pages 프로젝트 Overview에서 사이트 URL 확인
2. 사이트 방문해서 정상 작동 확인
3. 이후 모든 push가 자동으로 배포됨

---

## 📚 참고

- Cloudflare Pages 공식 문서: https://developers.cloudflare.com/pages/
- Wrangler CLI 문서: https://developers.cloudflare.com/workers/wrangler/install-and-update/
