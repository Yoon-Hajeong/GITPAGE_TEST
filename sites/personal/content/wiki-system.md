---
title: "Wiki System Design"
category: "Reference"
tags: [system, pipeline, design, obsidian]
raw_source: ""
created: "2026-05-11"
updated: "2026-05-11"
summary: "RAW→WIKI 파이프라인 설계 메모. 이 시스템이 어떻게 작동하는지 정리한 기술 문서입니다."
publish: false
cover: ""
---

# Wiki System Design

## 개요

이 위키는 **단일 소스(WIKI/) → 두 개 사이트(public + personal)** 구조입니다.

```
RAW/ (입력)
  ↓ Claude organizes
WIKI/ (single source of truth)
  ↓ scripts/sync-wiki.mjs
sites/public/ (Astro Fuwari)  +  sites/personal/ (Quartz v4)
  ↓                                  ↓
publish: true만 표시              전체 내용 표시
```

## 파이프라인

### 1. RAW 정리 ("정리해")
- RAW 폴더의 파일들을 읽음
- 카테고리 자동 분류
- frontmatter 추가 (`publish: false` 기본)
- WIKI 폴더에 저장
- 원본 RAW→ RAW/_archived/ 이동

### 2. 동기화 ("동기화" 또는 push 시)
```bash
node scripts/sync-wiki.mjs
```
- WIKI/*.md → sites/personal/content/ (전체)
- WIKI/*.md (publish: true만) → sites/public/src/content/posts/
- 각 SSG 포맷으로 frontmatter 변환

### 3. 배포
GitHub Actions workflow 자동 실행:
1. Astro 빌드 (사이트 A)
2. Quartz 빌드 (사이트 B)
3. 합치기 (/ + /notes/)
4. GitHub Pages 배포

## Frontmatter 필드

모든 WIKI 파일이 가져야 하는 메타데이터:

```yaml
title: 사람이 읽는 제목
category: AI|Tech|Business|Education|Content|Personal|Reference|Idea
tags: [tag1, tag2, tag3]
raw_source: RAW/_archived/...
created: YYYY-MM-DD
updated: YYYY-MM-DD
summary: 1-2문장 요약
publish: false  # 공개 여부
cover: ""       # (선택) 썸네일 이미지
```

## 특이사항

- **publish: false** → personal 사이트만 노출
- **publish: true** → 두 사이트 모두 노출
- 공개는 항상 사용자 의도적 선택 (Claude 자동 변경 금지)
- INDEX.md 수동 편집 가능 (증분 갱신)

## 참고

자세한 에이전트 규칙은 [[CLAUDE.md]] 참고.

---

*System design memo • 2026-05-11*
