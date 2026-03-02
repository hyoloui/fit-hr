# Claude Code 개발 가이드라인

> 모든 응답은 **한글**로 작성한다.

---

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Backend**: Supabase
- **Form**: React Hook Form, Zod
- **Quality**: ESLint, Prettier

## 핵심 패턴

- **상수 테이블 조회**: `createAdminClient()` 사용 (secret key)
- **유저 데이터 조회**: `createClient()` 사용 (publishable key + RLS)
- **Server Component 우선**, 상호작용 필요시만 `"use client"`
- **UI 스타일링**: shadcn/ui 사용 및 mobile first 디자인

## 🎯 MVP 완료 요약

### 구현된 주요 기능

**트레이너 기능**

- ✅ 이력서 관리 (등록, 수정, 삭제, 조회)
- ✅ 구인공고 검색 및 필터링
- ✅ 구인공고 지원 및 취소
- ✅ 좋아요 기능
- ✅ 지원 내역 관리

**센터 기능**

- ✅ 센터 정보 관리
- ✅ 구인공고 등록 및 관리
- ✅ 지원자 목록 조회
- ✅ 공고 활성화/비활성화

**공통 기능**

- ✅ 구인공고 검색 및 필터링
- ✅ 이메일/비밀번호 인증
- ✅ 역할 기반 라우팅 (트레이너/센터)
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 로딩 상태 및 에러 처리
- ✅ 사용자 친화적 UI/UX

---

## Claude Code 작업 규칙

### 작업 전 필수

```
1. 관련 파일 먼저 읽기 (Read before Write)
2. 기존 패턴 파악
3. 불확실하면 질문
```

---

## TypeScript 규칙

- ✅ interface 사용
- ✅ Supabase 생성 타입 활용

### Supabase 타입 생성

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

---

## 명명 규칙

| 대상          | 규칙                 | 예시            |
| ------------- | -------------------- | --------------- |
| 컴포넌트      | PascalCase           | `UserCard.tsx`  |
| Server Action | camelCase            | `createUser.ts` |
| 유틸 함수     | camelCase            | `formatDate.ts` |
| 상수          | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |

## 금지 사항

```
❌ any 타입
❌ console.log 커밋
❌ 인라인 스타일 (style={{}})
❌ 클래스 컴포넌트
❌ Client Component에서 직접 DB 수정 (Server Action 사용)
❌ 200줄 초과 컴포넌트
```

---

## 자주 쓰는 명령어

```bash
# 개발
npm run dev

# 빌드 & 타입체크
npm run build
npm run lint
npm run lint:fix

# shadcn 컴포넌트 추가
npx shadcn@latest add [component]

# Supabase 타입 생성
npx supabase gen types typescript --project-id ID > src/types/database.types.ts
```
