# 📚 Personal Wiki + Two-Site Publishing System

Obsidian 기반 개인 위키. **하나의 마크다운 → 두 개의 GitHub Pages 사이트** 자동 배포.

---

## 🌐 두 개의 사이트

| 사이트 | URL | 내용 | 디자인 |
|--------|-----|------|--------|
| 🌸 **Public** | `yoonhajeong.github.io/wiki/` | `publish: true` 표시한 글만 | Astro + Fuwari, 에디토리얼 디자인 (Cormorant, Pinyon Script) |
| 📓 **Personal** | `yoonhajeong.github.io/wiki/notes/` | WIKI 폴더 전체 | Quartz v4, 옵시디언 그래프뷰/백링크 |

> 두 사이트 모두 인터넷 공개. "personal"은 본인 색깔의 블로그라는 의미.

---

## 🚀 사용법 (3단계)

### 1️⃣ RAW에 자료 던지기

`RAW/` 폴더에 `.md` 파일로 넣으세요. 형식 자유.

### 2️⃣ Claude에게 "정리해"

자동으로 처리:
- 카테고리 자동 분류 (AI / Tech / Business / Education / Content / Personal / Reference / Idea)
- frontmatter 부착 (`publish: false` 기본값)
- WIKI/ 저장 + 원본은 RAW/_archived/로 이동
- INDEX.md 갱신

### 3️⃣ "공개해 [파일명]" → 공개 사이트(A)로 노출

특정 글을 구독자에게 보여주고 싶으면:
- "공개해 wiki-system-design"
- 또는 직접 frontmatter `publish: true`로 변경

다음 동기화 + 배포부터 사이트 A에 노출됨.

---

## 📁 폴더 구조

```
wiki/
├── RAW/                  ← 사용자 입력함
│   └── _archived/        ← 정리 끝난 원본 보관
├── WIKI/                 ← 정리된 .md (single source of truth)
├── INDEX.md              ← 전체 목차
├── README.md             ← 이 파일
├── CLAUDE.md             ← 에이전트 동작 규칙
│
├── sites/
│   ├── public/           ← Astro (사이트 A)
│   └── personal/         ← Quartz (사이트 B)
│
├── scripts/
│   └── sync-wiki.mjs     ← WIKI → 사이트별 content 동기화
│
└── .github/workflows/
    └── deploy.yml        ← 통합 GitHub Actions 배포
```

---

## 💻 로컬 개발

```bash
# WIKI → 사이트 동기화
node scripts/sync-wiki.mjs

# 사이트 A 미리보기 (예쁜 공개 사이트)
cd sites/public
npm install   # 처음 한 번만
npm run dev   # http://localhost:4321

# 사이트 B 미리보기 (개인 블로그 + 그래프뷰)
cd sites/personal
npm install   # 처음 한 번만
npx quartz build --serve   # http://localhost:8080
```

---

## ☁️ 배포

`main` 브랜치에 push → GitHub Actions가 두 사이트 모두 자동 빌드/배포.

---

## ✉️ 뉴스레터 (사이트 A)

기본은 **Buttondown 임베드 폼 placeholder**가 박혀 있음.

연결하려면:
1. [buttondown.com](https://buttondown.com) 가입 (무료, 100명까지)
2. `sites/public/src/components/Newsletter.astro` 의 placeholder 값 변경
3. 다음 push부터 실제 작동

---

## ⚠️ 안전 규칙

- RAW 원본은 **삭제 안 됨** → 무조건 `_archived/`로 이동
- INDEX.md는 **증분 갱신** (수동 편집 보호)
- `publish: true` 변경은 **사용자 명시 동의** 필요
- `git push`는 **사용자 확인 후**에만

자세한 정보는 [CLAUDE.md](CLAUDE.md) 참고.
